import hmac
import http.cookies
import json
import os
import secrets
import shutil
import tempfile
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DB_FILE = os.path.join(BASE_DIR, 'data', 'db.json')
if not os.path.exists(DB_FILE):
    alt_db = os.path.join(BASE_DIR, 'db.json')
    if os.path.exists(alt_db):
        DB_FILE = alt_db

DB_LOCK = threading.Lock()
AUTH_LOCK = threading.Lock()
MAX_PAYLOAD_BYTES = 5 * 1024 * 1024  # 5MB safety limit

# Environment Configuration with secure defaults
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'PrismAdmin2026!')
SESSION_SECRET = os.environ.get('SESSION_SECRET', secrets.token_hex(32))
SESSION_COOKIE_NAME = 'pe_admin_session'
SESSION_EXPIRY_SECONDS = 86400  # 24 hours

# Rate limiting for failed authentication attempts: max 5 failed attempts per IP per 5 minutes
LOGIN_RATE_LIMIT = 5
LOGIN_RATE_WINDOW_SECONDS = 300
FAILED_ATTEMPTS = {}  # ip -> list of timestamps

# Active Sessions: token -> timestamp
ACTIVE_SESSIONS = {}

ALLOWED_STORES = {
    "products", "businesses", "customers", "orders",
    "storefrontMedia", "adminConfig", "prisma_sessions",
    "prisma_patterns", "global_trends", "global_sessions",
    "pe_gallery", "pe_stories", "pe_interactions",
    "pe_testimonials", "prism_gallery"
}

# Stores containing sensitive customer PII or administrative configuration
PROTECTED_GET_STORES = {"orders", "customers", "adminConfig"}

# Stores that public visitors are permitted to write to (e.g. placing orders or saving diagnostic sessions)
PUBLIC_POST_STORES = {"orders", "prisma_sessions"}

def load_db():
    with DB_LOCK:
        if not os.path.exists(DB_FILE):
            return {store: [] for store in ALLOWED_STORES}
        try:
            with open(DB_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[SERVER WARN] Primary db read failed: {e}")
            bak = DB_FILE + '.bak'
            if os.path.exists(bak):
                try:
                    with open(bak, 'r', encoding='utf-8') as f:
                        print("[SERVER INFO] Successfully recovered from db.json.bak")
                        return json.load(f)
                except Exception as bak_err:
                    print(f"[SERVER ERROR] Backup db read failed: {bak_err}")
            return {store: [] for store in ALLOWED_STORES}

def save_db(data):
    with DB_LOCK:
        db_dir = os.path.dirname(DB_FILE)
        os.makedirs(db_dir, exist_ok=True)
        # Create backup of current valid file before atomic replace
        if os.path.exists(DB_FILE) and os.path.getsize(DB_FILE) > 0:
            try:
                shutil.copy2(DB_FILE, DB_FILE + '.bak')
            except Exception:
                pass

        # Atomic write via temporary file in the same directory
        temp_fd, temp_path = tempfile.mkstemp(dir=db_dir, prefix='db_', suffix='.tmp')
        try:
            with open(temp_fd, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
                f.flush()
                os.fsync(f.fileno())
            os.replace(temp_path, DB_FILE)
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

def is_rate_limited(ip):
    now = time.time()
    with AUTH_LOCK:
        attempts = FAILED_ATTEMPTS.get(ip, [])
        valid_attempts = [t for t in attempts if now - t < LOGIN_RATE_WINDOW_SECONDS]
        FAILED_ATTEMPTS[ip] = valid_attempts
        return len(valid_attempts) >= LOGIN_RATE_LIMIT

def record_failed_attempt(ip):
    now = time.time()
    with AUTH_LOCK:
        attempts = FAILED_ATTEMPTS.setdefault(ip, [])
        attempts.append(now)

def clear_failed_attempts(ip):
    with AUTH_LOCK:
        if ip in FAILED_ATTEMPTS:
            del FAILED_ATTEMPTS[ip]

def create_session():
    token = secrets.token_hex(32)
    now = time.time()
    with AUTH_LOCK:
        ACTIVE_SESSIONS[token] = now
    return token

def validate_session(token):
    if not token or not isinstance(token, str):
        return False
    now = time.time()
    with AUTH_LOCK:
        created = ACTIVE_SESSIONS.get(token)
        if not created:
            return False
        if now - created > SESSION_EXPIRY_SECONDS:
            del ACTIVE_SESSIONS[token]
            return False
        return True

def revoke_session(token):
    if not token:
        return
    with AUTH_LOCK:
        if token in ACTIVE_SESSIONS:
            del ACTIVE_SESSIONS[token]


class UnifiedHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Base CORS headers for cross-origin or local test clients
        self.send_header('Access-Control-Allow-Origin', self.headers.get('Origin', '*'))
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def send_json(self, data, status=200, extra_headers=None):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(json.dumps(data).encode('utf-8'))

    def get_client_ip(self):
        forwarded = self.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return self.client_address[0] if self.client_address else '127.0.0.1'

    def get_session_token(self):
        # 1. Check Authorization Bearer header
        auth_header = self.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            return auth_header[7:].strip()

        # 2. Check Cookie header
        cookie_header = self.headers.get('Cookie', '')
        if cookie_header:
            try:
                c = http.cookies.SimpleCookie()
                c.load(cookie_header)
                if SESSION_COOKIE_NAME in c:
                    return c[SESSION_COOKIE_NAME].value
            except Exception:
                pass
        return None

    def is_authenticated(self):
        token = self.get_session_token()
        return validate_session(token)

    def get_payload(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return None
        if content_length > MAX_PAYLOAD_BYTES:
            self.send_error(413, "Payload Too Large")
            return None
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            path = unquote(parsed.path)

            # Security: Block direct access to VCS, internal data, backend source, logs, archives, and sensitive extensions
            clean = path.lstrip('/')
            clean_lower = clean.lower()
            if (clean_lower.startswith(('.git', 'data', 'backend', 'archive', 'logs'))
                or '/.' in path or '\\.' in path
                or (clean_lower.endswith(('.bak', '.tmp', '.py', '.json', '.env', '.sh')) and not path.startswith('/api/'))):
                self.send_error(403, "Access Forbidden")
                return

            # Auth status inspection endpoint
            if path == '/api/auth/check':
                if self.is_authenticated():
                    self.send_json({"authenticated": True})
                else:
                    self.send_json({"authenticated": False}, status=401)
                return

            if path.startswith('/api/data/'):
                parts = [p for p in path.split('/') if p]
                store = parts[2] if len(parts) >= 3 else ''
                if store not in ALLOWED_STORES:
                    self.send_json({"error": f"Store '{store}' not recognized"}, status=400)
                    return

                # Sensitive customer PII or administrative data requires authenticated session
                if store in PROTECTED_GET_STORES:
                    if not self.is_authenticated():
                        self.send_json({"error": "Unauthorized: Administrative session required to view this dataset"}, status=401)
                        return

                db = load_db()
                self.send_json(db.get(store, []))
                return

            # Normalize trailing slash for directory routes (ensures relative assets resolve cleanly)
            if path in ('/shop', '/labs', '/prism-labs', '/edge-products', '/main-site'):
                self.send_response(301)
                self.send_header('Location', path + '/')
                self.end_headers()
                return

            if path in ('/admin', '/admin/'):
                self.send_response(301)
                self.send_header('Location', '/shop/admin')
                self.end_headers()
                return

            # Routing logic
            if path == '/':
                self.path = '/apps/main-site/index.html'
            elif path in ('/index.html', '/preview', '/preview/', '/preview/index.html', '/hub', '/hub/'):
                self.path = '/index.html'
            elif path in ('/labs/', '/labs/index.html'):
                self.path = '/apps/prism-labs/index.html'
            elif path.startswith('/labs/'):
                self.path = '/apps/prism-labs/' + path[6:]
            elif path in ('/prism-labs/', '/prism-labs/index.html'):
                self.path = '/apps/prism-labs/index.html'
            elif path.startswith('/prism-labs/'):
                self.path = '/apps/prism-labs/' + path[12:]
            elif path in ('/shop/', '/shop/index.html'):
                self.path = '/apps/edge-products/index.html'
            elif path in ('/shop/admin', '/shop/admin/', '/shop/admin.html'):
                self.path = '/apps/edge-products/admin.html'
            elif path.startswith('/shop/'):
                self.path = '/apps/edge-products/' + path[6:]
            elif path in ('/edge-products/', '/edge-products/index.html'):
                self.path = '/apps/edge-products/index.html'
            elif path.startswith('/edge-products/'):
                self.path = '/apps/edge-products/' + path[15:]
            elif path in ('/main', '/main/', '/main-site/', '/main-site/index.html'):
                self.path = '/apps/main-site/index.html'
            elif path.startswith('/main-site/'):
                self.path = '/apps/main-site/' + path[11:]
            elif not path.startswith('/apps/'):
                # Safe fallback: verify path resolves inside apps/main-site without traversal
                clean_sub = path.lstrip('/')
                candidate = os.path.normpath(os.path.join(BASE_DIR, 'apps', 'main-site', clean_sub))
                if os.path.commonpath([BASE_DIR, candidate]) == BASE_DIR and os.path.exists(candidate):
                    self.path = '/apps/main-site/' + clean_sub

            # Fallback to serving static files
            super().do_GET()
        except Exception as e:
            import traceback
            print("ERROR IN do_GET:", traceback.format_exc())
            try:
                self.send_error(500, "Internal Server Error")
            except:
                pass

    def do_POST(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)
        client_ip = self.get_client_ip()

        # 1. Admin Authentication Login Endpoint
        if path == '/api/auth/login':
            if is_rate_limited(client_ip):
                self.send_json({
                    "success": False,
                    "error": "Too many failed attempts. Rate limit exceeded. Try again in 5 minutes."
                }, status=429)
                return

            payload = self.get_payload()
            password = payload.get('password', '') if isinstance(payload, dict) else ''

            # Constant-time comparison to prevent timing attacks
            is_valid = hmac.compare_digest(str(password), str(ADMIN_PASSWORD))
            if is_valid:
                clear_failed_attempts(client_ip)
                token = create_session()
                # Secure cookie flags: HttpOnly, SameSite=Lax, Path=/
                is_https = (self.headers.get('X-Forwarded-Proto', '').lower() == 'https')
                cookie_str = f"{SESSION_COOKIE_NAME}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_EXPIRY_SECONDS}"
                if is_https:
                    cookie_str += "; Secure"

                self.send_json(
                    {"success": True, "token": token},
                    status=200,
                    extra_headers={"Set-Cookie": cookie_str}
                )
                return
            else:
                record_failed_attempt(client_ip)
                self.send_json({"success": False, "error": "Invalid administrative credentials"}, status=401)
                return

        # 2. Admin Authentication Logout Endpoint
        if path == '/api/auth/logout':
            token = self.get_session_token()
            if token:
                revoke_session(token)
            clear_cookie_str = f"{SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
            self.send_json({"success": True}, status=200, extra_headers={"Set-Cookie": clear_cookie_str})
            return

        # 3. Migration Endpoint (Strict Admin Only)
        if path == '/api/data/migrate':
            if not self.is_authenticated():
                self.send_json({"error": "Unauthorized: Administrative session required for database migration"}, status=401)
                return

            payload = self.get_payload()
            if payload is None:
                return
            db = load_db()
            for k, v in payload.items():
                if k in ALLOWED_STORES:
                    db[k] = v
            save_db(db)
            self.send_json({"success": True})
            return

        # 4. Data Modification Endpoint
        if path.startswith('/api/data/'):
            parts = [p for p in path.split('/') if p]
            store = parts[2] if len(parts) >= 3 else ''
            if store not in ALLOWED_STORES:
                self.send_json({"error": f"Store '{store}' not recognized"}, status=400)
                return

            # Public users may only POST orders (checkout) or prisma_sessions (diagnostics)
            if store not in PUBLIC_POST_STORES and not self.is_authenticated():
                self.send_json({
                    "error": f"Unauthorized: Administrative session required to modify '{store}'"
                }, status=401)
                return

            payload = self.get_payload()
            if payload is None:
                return
            db = load_db()

            if store not in db:
                if isinstance(payload, list):
                    db[store] = []
                elif isinstance(payload, dict) and "industries" in payload:
                    db[store] = {"industries": {}, "challenges": {}}
                else:
                    db[store] = []

            # Handle appending/updating in list
            if isinstance(db[store], list):
                if "id" not in payload and "ts" in payload:
                    payload["id"] = payload["ts"]  # Simple ID generation

                item_id = payload.get("id")
                found = False
                if item_id is not None:
                    for idx, item in enumerate(db[store]):
                        if item.get("id") == item_id:
                            db[store][idx] = payload
                            found = True
                            break
                if not found:
                    db[store].append(payload)
            else:
                db[store] = payload

            save_db(db)
            self.send_json({"success": True, "item": payload})
            return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path.startswith('/api/data/'):
            # Deletions on ANY store require administrative authorization
            if not self.is_authenticated():
                self.send_json({"error": "Unauthorized: Administrative session required to delete data"}, status=401)
                return

            parts = [p for p in path.split('/') if p]
            if len(parts) >= 4:
                store = parts[2]
                item_id = parts[3]
                if store not in ALLOWED_STORES:
                    self.send_json({"error": f"Store '{store}' not recognized"}, status=400)
                    return
                db = load_db()
                if store in db and isinstance(db[store], list):
                    db[store] = [item for item in db[store] if str(item.get('id', item.get('ts'))) != item_id]
                    save_db(db)
                    self.send_json({"success": True})
                    return
        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    os.chdir(BASE_DIR)
    PORT = int(os.environ.get('PORT', 8000))
    server = ThreadingHTTPServer(('0.0.0.0', PORT), UnifiedHandler)
    print(f"Starting Unified Prism Server on http://localhost:{PORT}")
    print(f"  • Main Site:           http://localhost:{PORT}/")
    print(f"  • Prism Labs:          http://localhost:{PORT}/labs/")
    print(f"  • Edge Products Shop:  http://localhost:{PORT}/shop/")
    print(f"  • Edge Products Admin: http://localhost:{PORT}/shop/admin")
    print(f"  • Ecosystem Hub:       http://localhost:{PORT}/preview")
    server.serve_forever()

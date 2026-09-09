import json
import os
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, unquote

DB_FILE = 'db.json'

def load_db():
    if not os.path.exists(DB_FILE):
        return {
            "prism_gallery": [],
            "pe_gallery": [],
            "pe_stories": [],
            "pe_interactions": [],
            "pe_testimonials": [],
            "prisma_sessions": [],
            "prisma_patterns": {"industries": {}, "challenges": {}},
            "global_trends": {"industries": {}, "challenges": {}},
            "global_sessions": [],
            "products": [],
            "businesses": [],
            "customers": [],
            "orders": [],
            "adminConfig": [],
            "storefrontMedia": []
        }
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def save_db(data):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

class UnifiedHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers so file:// origins could technically hit it if needed
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def get_payload(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0: return None
        body = self.rfile.read(content_length)
        return json.loads(body.decode('utf-8'))

    def do_GET(self):
        try:
            parsed = urlparse(self.path)
            path = unquote(parsed.path)

            if path.startswith('/api/data/'):
                store = path.split('/')[-1]
                db = load_db()
                if store in db:
                    self.send_json(db[store])
                else:
                    self.send_json([])
                return

            # Routing logic
            if path == '/' or path == '/index.html':
                if os.path.exists('main site/index.html'):
                    self.path = '/main site/index.html'
                else:
                    self.path = '/kqDJT8D/index.html'
            elif path == '/labs':
                self.send_response(301)
                self.send_header('Location', '/labs/')
                self.end_headers()
                return
            elif path == '/labs/' or path == '/labs/index.html':
                if os.path.exists('prism labs/prism labs.html'):
                    self.path = '/prism labs/prism labs.html'
                else:
                    self.path = '/yoTDTIS/prism labs.html'
            elif path.startswith('/labs/'):
                sub = path[5:]
                if os.path.exists(os.path.join('prism labs', sub.lstrip('/'))):
                    self.path = '/prism labs' + sub
                else:
                    self.path = '/yoTDTIS' + sub
            elif path == '/shop':
                self.send_response(301)
                self.send_header('Location', '/shop/')
                self.end_headers()
                return
            elif path == '/shop/' or path == '/shop/index.html':
                if os.path.exists('edge products/index.html'):
                    self.path = '/edge products/index.html'
                else:
                    self.path = '/-zZkCND/index.html'
            elif path == '/shop/admin' or path == '/shop/admin/' or path == '/shop/admin.html':
                if os.path.exists('edge products/admin.html'):
                    self.path = '/edge products/admin.html'
                else:
                    self.path = '/-zZkCND/admin.html'
            elif path.startswith('/shop/'):
                sub = path[5:]
                if os.path.exists(os.path.join('edge products', sub.lstrip('/'))):
                    self.path = '/edge products' + sub
                else:
                    self.path = '/-zZkCND' + sub
            elif path == '/admin':
                self.send_response(301)
                self.send_header('Location', '/admin/')
                self.end_headers()
                return
            elif path == '/admin/' or path == '/admin/index.html' or path == '/admin.html':
                if os.path.exists('main site/admin.html'):
                    self.path = '/main site/admin.html'
                else:
                    self.path = '/kqDJT8D/admin.html'
            elif path.startswith('/admin/'):
                sub = path[6:]
                if os.path.exists(os.path.join('main site', sub.lstrip('/'))):
                    self.path = '/main site' + sub
                else:
                    self.path = '/kqDJT8D' + sub
            elif not (path.startswith('/kqDJT8D/') or path.startswith('/yoTDTIS/') or path.startswith('/-zZkCND/') or path.startswith('/main site/') or path.startswith('/prism labs/') or path.startswith('/edge products/')):
                if os.path.exists(os.path.join('main site', path.lstrip('/'))):
                    self.path = '/main site' + path
                else:
                    self.path = '/kqDJT8D' + path

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

        if path == '/api/data/migrate':
            payload = self.get_payload()
            db = load_db()
            # Merge migration data
            for k, v in payload.items():
                if isinstance(v, list):
                    db.setdefault(k, []).extend(v)
                    # Deduplicate lists by ID or TS if possible, but for now simple overwrite/merge
                    # Let's just overwrite for simplicity since it's a one-time migration
                    db[k] = v
                elif isinstance(v, dict):
                    db[k] = v
            save_db(db)
            self.send_json({"success": True})
            return

        if path.startswith('/api/data/'):
            store = path.split('/')[-1]
            payload = self.get_payload()
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
                    payload["id"] = payload["ts"] # Simple ID generation
                
                # Check for existing item to update/replace
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
                # Direct overwrite for non-lists (like prisma_patterns)
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
            parts = path.split('/')
            if len(parts) >= 5:
                store = parts[3]
                item_id = parts[4]
                db = load_db()
                if store in db and isinstance(db[store], list):
                    # Filter out by id
                    db[store] = [item for item in db[store] if str(item.get('id', item.get('ts'))) != item_id]
                    save_db(db)
                    self.send_json({"success": True})
                    return
        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    # Change cwd to script directory just in case
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    PORT = 8000
    server = HTTPServer(('0.0.0.0', PORT), UnifiedHandler)
    print(f"Starting Unified Prism Server on http://localhost:{PORT}")
    server.serve_forever()

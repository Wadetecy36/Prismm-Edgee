# Prismm Edgee

> **Built to scale brands.**
> A digital growth ecosystem combining strategy, high-performance web engineering, scalable commerce, and operational intelligence.

---

## 🌐 Ecosystem Architecture

The Prismm Edgee monorepo integrates three core specialized applications and an ecosystem hub served by a high-concurrency, unified backend:

```
Prismm-Edgee/
├── index.html                   # Ecosystem Gateway Hub (/preview)
├── apps/
│   ├── main-site/               # Primary Client Acquisition & Agency Portal (/)
│   ├── edge-products/           # Curated Commerce Marketplace & Merchant Engine (/shop/)
│   └── prism-labs/              # Strategic Intelligence & Systems Consulting (/labs/)
├── backend/
│   └── server.py                # High-concurrency ThreadingHTTPServer + Auth & REST API
└── data/
    └── db.json                  # Atomic JSON Datastore with transactional backups
```

---

## 🚀 Applications Overview

### 1. Ecosystem Gateway Hub (`/preview` or `/hub`)
- Central portal unifying the three Prismm Edgee pillars: **Build**, **Grow**, and **Operate**.
- Direct visual routes and navigational paths into Main Site, Prism Labs, and Edge Products.

### 2. Main Site (`/`)
- Client acquisition surface designed for conversion.
- Live agency portfolio, service offerings (Digital Strategy, High-Conversion Web, Custom Commerce, Operational Intelligence), project scopes, and interactive inquiry channels.
- Integrated AI concierge chat assistant and direct consultation scheduling.

### 3. Edge Products (`/shop/`)
- Modern digital commerce storefront featuring live product filtering, full-text catalog search, and multi-category browsing (Electronics, Beauty, Food Services, Technical Tools, Apparel, Industrial).
- Multi-item shopping cart with quantity validation against live stock inventory.
- Production-ready checkout workflow capturing customer delivery details, updating inventory, and dispatching real order records.
- Merchant and boutique directory connecting buyers to verified regional businesses.
- **Admin Portal (`/shop/admin`)**: Protected administrative control panel for managing products, businesses, storefront media, and active listings.

### 4. Prism Labs (`/labs/`)
- Strategic brand consulting and intelligence suite.
- Diagnostic workflows: `OBSERVE → ANALYZE → DECIDE → BUILD`.
- Market pattern library, industry benchmarking, and growth architecture templates.

---

## 🔒 Security & Authorization

Prismm Edgee enforces an **authoritative server-side authorization boundary**:

- **Real Server Authentication**: Client-side secret dependencies have been completely removed. Authentication is handled via `POST /api/auth/login`.
- **Protected Datasets**: Customer PII and orders (`/api/data/orders`, `/api/data/customers`) require valid administrative authentication (`HTTP 401 Unauthorized` for anonymous requests).
- **Protected Mutations**: Catalog updates and deletions on all stores require an authenticated session (`Bearer` token or secure `pe_admin_session` cookie).
- **Public Commerce Operations**: Storefront browsing, product discovery, and customer checkout (`POST /api/data/orders`) remain publicly accessible without friction.
- **Brute-Force Defense**: Strict IP-based rate limiting on `/api/auth/login` (throttles with `HTTP 429 Too Many Requests` after 5 failed attempts within 5 minutes).
- **Timing-Attack Resistance**: Constant-time verification (`hmac.compare_digest`) for credential checks.
- **Path Traversal Protection**: Direct access to `.git`, `backend/`, `data/`, and internal system paths is blocked (`HTTP 403 Forbidden`).
- **Data Atomicity**: Thread-safe I/O using `ThreadingHTTPServer`, POSIX atomic replacement (`tempfile.mkstemp` + `os.replace`), and automatic snapshot backups (`db.json.bak`).

---

## 🛠️ Quick Start & Local Development

### Prerequisites
- Python 3.9+ (Python 3.10+ recommended)
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Running the Unified Server

```bash
# 1. Clone the repository
git clone https://github.com/Wadetecy36/Prismm-Edgee.git
cd Prismm-Edgee

# 2. (Optional) Set environment variables
export ADMIN_PASSWORD="your-secure-admin-password"
export PORT=8000

# 3. Start the server
python3 backend/server.py
```

### Accessing the Applications
- **Main Site:** [http://localhost:8000/](http://localhost:8000/)
- **Ecosystem Gateway:** [http://localhost:8000/preview](http://localhost:8000/preview)
- **Edge Products Shop:** [http://localhost:8000/shop/](http://localhost:8000/shop/)
- **Edge Products Admin:** [http://localhost:8000/shop/admin](http://localhost:8000/shop/admin)
- **Prism Labs:** [http://localhost:8000/labs/](http://localhost:8000/labs/)

---

## 📦 Data Storage Architecture

The application uses an atomic file-backed JSON store in `data/db.json` combined with browser client synchronization (IndexedDB + `BroadcastChannel`):
- Multi-tab updates propagate in real time across browser tabs via `BroadcastChannel('prism_shop_sync')`.
- Server writes serialize through `threading.Lock()` to prevent race conditions during concurrent API calls.

---

## 📄 License
Private & Proprietary — Prismm Edgee. All rights reserved.
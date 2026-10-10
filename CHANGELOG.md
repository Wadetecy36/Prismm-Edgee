# Changelog

All notable changes to the **Prismm Edgee** platform across releases will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-10

### 🚀 Production Release Gate & Security Hardening
This milestone marks the complete conversion, hardening, and integration pass of the Prismm Edgee monorepo into a commercially viable, secure, and performant digital business ecosystem.

### Added
- **Server-Side Authentication & Session Management (`backend/server.py`)**:
  - Implemented `/api/auth/login`, `/api/auth/logout`, and `/api/auth/check` endpoints.
  - Added cryptographic session token generation using 256 bits of entropy (`secrets.token_hex(32)`).
  - Configured secure cookie delivery with `HttpOnly`, `SameSite=Lax`, `Path=/`, and conditional `Secure` flag under HTTPS, with secondary support for `Authorization: Bearer <token>` headers.
  - Added brute-force rate limiting on `/api/auth/login` (throttles with HTTP 429 after 5 failed attempts per IP within a 5-minute rolling window).
  - Implemented constant-time string comparison (`hmac.compare_digest`) for credential verification to eliminate timing side-channels.
- **Server Authorization Boundaries**:
  - Restricted private datasets (`/api/data/orders`, `/api/data/customers`, `/api/data/adminConfig`) to authenticated administrators (`HTTP 401 Unauthorized` for anonymous requests).
  - Protected catalog mutations and deletions across all stores with administrative session checks.
  - Allowed public storefront visitor access for catalog reading and checkout order submission (`POST /api/data/orders`).
- **High-Concurrency Multi-Threaded Server Engine**:
  - Upgraded HTTP server to `ThreadingHTTPServer` to avoid head-of-line request blocking.
  - Added thread-safe atomic database writes via `threading.Lock()`, `tempfile.mkstemp()`, `os.fsync()`, and `os.replace()`, accompanied by automatic `.bak` snapshot rotation.
- **Ecosystem Gateway (`/preview`)**:
  - Built premium, responsive dark-foundation Gateway hub linking the three core applications: Main Site, Edge Products, and Prism Labs.
- **Complete Project Documentation**:
  - Added comprehensive `README.md` and repository `.gitignore`.

### Changed
- **Edge Products (`apps/edge-products/`)**:
  - **Admin Security**: Removed client-side plaintext password check (`PrismAdmin`) from `admin.html`. Connected admin UI to the server auth endpoints with session validation, logout, and token authorization.
  - **Checkout Engine**: Replaced stub checkout with full `executeOrderCheckout()` in `app.js`, capturing real customer contact details, saving order records, and atomically decrementing inventory stock.
  - **Stock Validation**: Enforced cumulative cart stock validation in `addToCart()` to prevent over-purchasing beyond live inventory.
  - **Multi-Tab Sync**: Enabled real-time synchronization between open storefront and admin tabs via `BroadcastChannel('prism_shop_sync')`.
  - **Trust & Compliance**: Removed unverified claims and badges (e.g. fabricated escrow markers). Updated support links to international E.164 WhatsApp numbers (`+233248607998`) and corrected official email channels (`prismmedgee@gmail.com`).
- **Main Site (`apps/main-site/`)**:
  - **Gallery Security**: Removed hardcoded client secret (`PrismAdmin2024`) from `gallery.js`, migrating administrative authentication to backend verification.
  - **Conversion Optimization**: Rebuilt hero, capability sections, portfolio showcase, and direct conversion pathways.
  - **XSS Hardening**: Sanitized dynamic HTML rendering and template interpolations with `escapeHtml()`.
- **Prism Labs (`apps/prism-labs/`)**:
  - Productized diagnostic intelligence workflow (`OBSERVE → ANALYZE → DECIDE → BUILD`).
  - Grounded intelligence outputs in real sector patterns without fabricated scores or synthetic mock data.

### Fixed
- Fixed unauthenticated access to customer order PII.
- Fixed unauthenticated data deletion and overwrite risks across API endpoints.
- Fixed 403 access control to prevent exposure of `.git`, `data/`, `backend/`, and source files.
- Fixed currency presentation to consistent GHS currency formatting.
- Fixed missing canonical URLs, image alt attributes, and keyboard accessibility labels across all applications.

---

## [1.0.0] - 2026-09-15
- Initial project architecture and experimental multi-app prototypes.

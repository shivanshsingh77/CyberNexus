# 🛡️ CyberNexus — Web Application Security & Defense Platform

> **A Full-Stack Cybersecurity Engineering Project designed for College Web Security (WSC) Practical Examinations, Capstone Portfolios, and Viva Voce Demonstrations.**

CyberNexus is an enterprise-grade web application security platform built with **React, Vite, Node.js, Express, and MongoDB**. Designed with a professional light theme (clean slate typography and crisp white cards), CyberNexus provides active defensive engineering: cryptographically enforced password hashing, HTTP-Only SameSite session cookies, rate-limiting brute-force guards, Helmet security headers, server-side input validation, an interactive OWASP awareness hub, an **SSRF-hardened live Website Security Header Scanner**, and an honest automated security audit probe engine.

---

## 📋 Table of Contents

1. [Project Overview & Objectives](#1-project-overview--objectives)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Prerequisites & System Requirements](#5-prerequisites--system-requirements)
6. [Windows Installation & Setup Guide](#6-windows-installation--setup-guide)
7. [Environment Variables Configuration](#7-environment-variables-configuration)
8. [Database Setup (MongoDB)](#8-database-setup-mongodb)
9. [Running the Application](#9-running-the-application)
10. [REST API Documentation](#10-rest-api-documentation)
11. [Defensive Security Implementations](#11-defensive-security-implementations)
12. [Live Website Security Scanner & SSRF Architecture](#12-live-website-security-scanner--ssrf-architecture)
13. [Automated Testing & Execution Results](#13-automated-testing--execution-results)
14. [College Practical Demonstration Script](#14-college-practical-demonstration-script)
15. [Viva Voce Questions & Answers](#15-viva-voce-questions--answers)
16. [Known Limitations & Future Scope](#16-known-limitations--future-scope)

---

## 1. Project Overview & Objectives

In modern web development, insecure defaults often lead to compromised systems: unhashed passwords, lack of rate limiting, missing security headers, vulnerable CORS configurations, and token storage in `localStorage` where they are susceptible to Cross-Site Scripting (XSS).

**CyberNexus demonstrates two core aspects of Web Security (WSC):**
1. **Self-Defense (Defending Applications):** Passwords hashed with `bcrypt` (12 rounds), session tokens protected in `HTTP-Only` cookies, `Helmet` headers, `express-validator` schema hygiene, and rate-limited endpoints.
2. **External Analysis (Auditing Targets):** A live **Website Security Header Scanner** protected against Server-Side Request Forgery (SSRF) that inspects public targets for CSP, HSTS, X-Frame-Options, and nosniff directives.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6 | Component-driven user interface with responsive layouts |
| **UI Design** | Professional Light Theme | Off-white background (`#f8fafc`), slate-navy sidebar (`#0f172a`), white cards (`#ffffff`), and muted teal/blue accents (`#0284c7`, `#0d9488`) |
| **Icons** | Lucide React | Cybersecurity and diagnostic iconography |
| **Backend** | Node.js 22 & Express.js 4.21+ | REST API, middleware pipeline, SSRF-guarded fetch engine |
| **Database** | MongoDB 8.0+ with Mongoose 8.9+ | Document storage with schema parameterization & hooks |
| **Cryptography** | bcryptjs | 12 salt rounds adaptive key stretching |
| **Defenses** | Helmet, express-rate-limit, cookie-parser | Security headers, brute-force mitigation, HTTP-only cookies |
| **Validation** | express-validator, node:dns, node:net | Server-side request validation and IP range inspection |
| **Testing** | Node.js Native Test Runner | 23 automated integration and SSRF security tests |

---

## 3. Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                           CLIENT TIER (React + Vite)                              |
|   Port: http://localhost:5173 (Professional Light Theme)                          |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |  Dashboard Stats   |  |  Website Security    |  | Password Strength         |  |
|  |  & Dynamic Status  |  |  Header Scanner      |  | Entropy & Crack Time      |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | Security Awareness |  | Security Checklist   |  | Internal Audit Report     |  |
|  | (OWASP Top 10 Lab) |  | (Self-Assessment)    |  | (Live Probe Engine)       |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          |
                      HTTP / CORS Request | (Credentials: 'include')
                      with SameSite Cookie|
                                          v
+-----------------------------------------------------------------------------------+
|                        APPLICATION SERVER (Node.js & Express)                     |
|   Port: http://localhost:5000                                                     |
|                                                                                   |
|  [Middleware Pipeline]                                                            |
|  1. Helmet (CSP, nosniff, SAMEORIGIN, suppress X-Powered-By)                      |
|  2. CORS (Origin isolation: http://localhost:5173, credentials: true)             |
|  3. Safe JSON Payload Parser (10kb maximum limit to prevent memory DoS)           |
|  4. Global Rate Limiter & Strict Auth Limiter (10 req / 15 min)                   |
|  5. SSRF Defense Guard (DNS Resolution & IP Range Filter)                         |
|                                                                                   |
|  [Controller Handlers]                                                            |
|  * scannerController.js       -> SSRF-safe public header analysis & grading       |
|  * securityAuditController.js -> Real internal HTTP probes & DB checks            |
|  * authController.js          -> bcrypt hash verification & JWT cookie dispatch   |
|  * userController.js          -> Authenticated user profile retrieval             |
+--------------------+------------------------------------+-------------------------+
                     |                                    |
     SSRF-Safe Fetch | (Public targets only)              | Mongoose Parameterized
                     v                                    v
+------------------------------------+   +------------------------------------------+
|       EXTERNAL WEB TARGETS         |   |          DATABASE TIER (MongoDB)         |
|  (e.g., https://example.com)       |   |   URI: mongodb://127.0.0.1:27017         |
|  - Content-Security-Policy         |   |   Collection: users                      |
|  - Strict-Transport-Security       |   |   - username (Unique, 3-30 chars)        |
|  - X-Frame-Options                 |   |   - email (Unique, normalized)           |
|  - X-Content-Type-Options          |   |   - password (bcrypt $2a$12$... hash)    |
+------------------------------------+   +------------------------------------------+
```

---

## 4. Project Folder Structure

```
CyberNexus/
├── package.json              # Root orchestration scripts
├── .gitignore                # Source control protection (.env, node_modules)
├── README.md                 # System documentation & Viva guide
│
├── client/                   # FRONTEND REACT APPLICATION
│   ├── index.html            # Single page entry with cybersecurity styling
│   ├── vite.config.js        # Vite config with API proxy to port 5000
│   └── src/
│       ├── main.jsx          # React DOM root mounting
│       ├── App.jsx           # App shell with tab router & layout
│       ├── index.css         # Professional light theme styling
│       ├── api/client.js     # Fetch client with credentials: 'include'
│       ├── context/AuthContext.jsx # Global user session management
│       ├── components/       # Collapsible Slate Sidebar & Top Navbar
│       ├── pages/
│       │   ├── Dashboard.jsx        # Dynamic status, metrics, quick tools
│       │   ├── WebsiteScanner.jsx   # Live header scanner with SSRF protection
│       │   ├── PasswordChecker.jsx  # Client-side entropy & crack time analyzer
│       │   ├── SecurityAwareness.jsx# OWASP vulnerability interactive lab
│       │   ├── SecurityChecklist.jsx# 7-Category self-assessment checklist
│       │   ├── SecurityReport.jsx   # Real internal probe audit report
│       │   ├── Profile.jsx          # User identity, session details & logout
│       │   ├── Login.jsx            # Sign in with demo quick-fill
│       │   └── Register.jsx         # Sign up with live complexity validator
│       └── utils/passwordStrength.js# Pure client-side entropy algorithm
│
└── server/                   # BACKEND NODE.JS & EXPRESS API
    ├── package.json          # Backend dependencies & test scripts
    ├── .env                  # Active environment variables
    ├── .env.example          # Safe environment template
    ├── scripts/
    │   ├── seed.js           # Seeds demo analyst account in MongoDB
    │   └── runAudit.js       # CLI security audit probe runner
    └── src/
        ├── server.js         # Entry point: DB connection & server boot
        ├── app.js            # Express app assembly & middleware pipeline
        ├── config/db.js      # Mongoose MongoDB connection & event listeners
        ├── models/User.js    # User schema with bcrypt pre-save hash hook
        ├── controllers/
        │   ├── scannerController.js       # SSRF-guarded header scanner
        │   ├── securityAuditController.js # Live internal probe audit
        │   ├── authController.js          # Register, Login, Logout, getMe
        │   └── userController.js          # Profile retrieval & update
        ├── routes/
        │   ├── scannerRoutes.js      # /api/scanner endpoints
        │   ├── authRoutes.js         # /api/auth endpoints with rate limiter
        │   ├── userRoutes.js         # /api/users private routes
        │   └── securityAuditRoutes.js# /api/audit real-time checks
        ├── utils/
        │   └── ssrfValidator.js      # DNS resolution & IP range filter
        ├── middleware/
        │   ├── authMiddleware.js     # JWT verification from cookie or Bearer
        │   ├── rateLimiter.js        # Global, auth, and scanner rate limiters
        │   ├── validationMiddleware.js# express-validator schemas
        │   └── errorHandler.js       # Safe centralized error handler (no leak)
        └── tests/
            ├── api.test.js           # 15 core security integration tests
            └── scanner.test.js       # 8 SSRF & header scanner tests
```

---

## 5. Prerequisites & System Requirements

- **Operating System:** Windows 10 / 11, macOS, or Linux.
- **Node.js:** v18.x or higher (Tested on Node v22.14.0).
- **npm:** v9.x or higher (Tested on npm v10.9.2).
- **MongoDB:** Community Edition v6.0+ or MongoDB Atlas connection (Tested on local MongoDB v8.0.12).

---

## 6. Windows Installation & Setup Guide

### Step 1: Navigate to Project Directory
```powershell
cd C:\Users\sudha\Downloads\CyberNexus
```

### Step 2: Install Dependencies
```powershell
# Install backend dependencies
cd server
npm.cmd install
cd ..

# Install frontend dependencies
cd client
npm.cmd install
cd ..
```

---

## 7. Database Setup & Seeding

Verify that the MongoDB Windows service is active:
```powershell
Get-Service -Name *mongo*
```
If stopped, start it:
```powershell
Start-Service MongoDB
```

Seed the database with a pre-configured analyst account:
```powershell
cd server
npm.cmd run seed
cd ..
```

**Seeded Demo Credentials:**
- **Email:** `analyst@cybernexus.local`
- **Password:** `CyberNexus@2026Secure!`
- **Role:** `analyst`

---

## 8. Running the Application

Open two Windows PowerShell terminals in `C:\Users\sudha\Downloads\CyberNexus`:

### Terminal 1 — Start Backend Server:
```powershell
cd server
npm.cmd start
```
*Runs on:* **http://localhost:5000**

### Terminal 2 — Start Frontend Client:
```powershell
cd client
npm.cmd run dev
```
*Runs on:* **http://localhost:5173**

Open **http://localhost:5173** in your browser.

---

## 9. Live Website Security Scanner & SSRF Architecture

The **Website Security Header Scanner** inspects any public web application and evaluates its defensive headers.

### SSRF Protection Architecture:
To prevent attackers from using the scanner as an intranet proxy or attacking local services, [`server/src/utils/ssrfValidator.js`](file:///c:/Users/sudha/Downloads/CyberNexus/server/src/utils/ssrfValidator.js) enforces strict validation:
1. **Protocol Restriction:** Only `http:` and `https:` schemes are permitted. Formats like `file:///etc/passwd`, `ftp://`, or `gopher://` are rejected.
2. **DNS Pre-Resolution:** Resolves hostnames to their underlying IP addresses using `dns.lookup`.
3. **Forbidden IP Range Filtering:**
   - Loopback: `127.0.0.0/8`, `::1`, `localhost`
   - Private subnets: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`
   - Link-local & Cloud Metadata: `169.254.169.254`, `169.254.0.0/16`, `fe80::/10`
   - Reserved & Multicast: `0.0.0.0`, `224.0.0.0/4`, `240.0.0.0/4`
4. **Safe Redirect Validation:** Redirects are handled manually up to 3 hops. Each hop's `Location` target is re-validated against the SSRF filter before connecting, preventing redirect-bypass attacks.
5. **Cookie & Secret Isolation:** The scanner never transmits the application's cookies, JWT tokens, or credentials to scanned websites.

---

## 10. Automated Testing & Verification Results

CyberNexus includes **23 automated tests** covering core security controls and SSRF defense:

```powershell
cd server
npm.cmd test
```

### Verified Test Results (23 Passed, 0 Failed):
```
TAP version 13
# Subtest: CyberNexus Application Security Platform - API Test Suite
    ok 1 - 1. Health check returns 200 and confirms database connection
    ok 2 - 2. Helmet security headers are enforced and X-Powered-By is suppressed
    ok 3 - 3. Rejects invalid registration inputs with HTTP 400 (short password, bad email)
    ok 4 - 4. Successful user registration returns 201, safe user object, and sets HTTP-only cookie
    ok 5 - 5. Passwords are saved strictly as bcrypt hashes in MongoDB (never plaintext)
    ok 6 - 6. Rejects duplicate registration with identical email with HTTP 409 Conflict
    ok 7 - 7. Rejects login with incorrect password with HTTP 401 (generic message)
    ok 8 - 8. Successful login verifies hash, returns 200, updates lastLogin, and issues session cookie
    ok 9 - 9. Accessing protected profile route without credentials returns HTTP 401 Unauthorized
    ok 10 - 10. Accessing protected profile route with valid auth cookie returns HTTP 200
    ok 11 - 10b. Accessing protected profile route with Bearer token header returns HTTP 200
    ok 12 - 11. Logout endpoint clears authentication cookie and returns 200
    ok 13 - 12. Real-time Security Audit endpoint runs live checks and returns scorecard
    ok 14 - 13. Malformed JSON payload safely returns HTTP 400 without crashing server
    ok 15 - 14. Undefined API route returns structured HTTP 404 message
ok 1 - CyberNexus Application Security Platform - API Test Suite (1102ms)

# Subtest: CyberNexus Website Security Scanner & SSRF Defense Suite
    ok 1 - 1. SSRF Validator blocks loopback IP 127.0.0.1
    ok 2 - 2. SSRF Validator blocks localhost domain
    ok 3 - 3. SSRF Validator blocks AWS/GCP/Azure cloud metadata endpoint (169.254.169.254)
    ok 4 - 4. SSRF Validator blocks private internal LAN subnets
    ok 5 - 5. SSRF Validator rejects non-HTTP/HTTPS protocols
    ok 6 - 6. POST /api/scanner/scan returns HTTP 400 when SSRF target is provided
    ok 7 - 7. POST /api/scanner/scan rejects missing or empty URL
    ok 8 - 8. POST /api/scanner/scan inspects a public URL and returns headers scorecard
ok 2 - CyberNexus Website Security Scanner & SSRF Defense Suite (1662ms)

# tests 23 | suites 2 | pass 23 | fail 0 | cancelled 0
```

---

## 11. College Practical Demonstration Guide

Follow this walkthrough during your laboratory exam or final project evaluation:

### Step 1: Demonstrate the Live Website Security Header Scanner
1. Open `http://localhost:5173` and click **Website Security Scanner** in the sidebar.
2. Enter a public website (e.g. `https://example.com` or `https://owasp.org`) and click **Scan Headers**.
3. Point out the live inspection: HTTP status code, final URL, grade (A+ through F), and individual header cards explaining CSP, HSTS, X-Frame-Options, and nosniff.
4. **Demonstrate SSRF Protection:** Click the quick test link `127.0.0.1 (Test SSRF Block)` or type `http://localhost:5000`.
   - Show the examiner the error message: *"Invalid or Restricted Target: Direct connection to private/reserved IP address is blocked."*
   - Explain how DNS resolution blocks internal network probing.

### Step 2: Demonstrate Client-Side Password Entropy
1. Click **Password Checker** in the sidebar.
2. Type `password123`: note the immediate warning for predictable dictionary patterns and sequential numbers.
3. Click **Generate High-Entropy Password**: show the entropy increase to ~100 bits and estimated crack time jump to centuries.
4. Highlight that calculations run **100% locally** in JavaScript and are never transmitted over the network.

### Step 3: Demonstrate Authentication & Database Encryption
1. Click **Sign In** and use the **Fill Demo Credentials (Viva Mode)** button.
2. Log in as `analyst@cybernexus.local`.
3. Open Developer Tools (`F12`) $\rightarrow$ **Application / Storage** $\rightarrow$ **Cookies**:
   - Show the examiner the `token` cookie with the **HttpOnly** checkbox ticked.
   - Run `document.cookie` in the Console: demonstrate that JavaScript **cannot read the token**, proving immunity to cookie-stealing XSS.
4. Open `mongosh` in the terminal to inspect the `users` collection:
   ```bash
   use cybernexus
   db.users.find({}, { username: 1, email: 1, password: 1 })
   ```
   Show that passwords in MongoDB begin with `$2a$12$` — proof of salted `bcrypt` hashing with zero plaintext storage.

---

## 12. Viva Voce Questions & Answers

### Q1: What is Server-Side Request Forgery (SSRF) and how does CyberNexus prevent it?
**Answer:** SSRF occurs when an attacker induces a server to make HTTP requests to an arbitrary destination. An attacker could enter `http://169.254.169.254` (cloud metadata) or `http://127.0.0.1:27017` (local MongoDB) to steal cloud credentials or probe internal networks. CyberNexus prevents SSRF by:
1. Restricting protocols to `http:` and `https:`.
2. Resolving hostnames via DNS and verifying that the target IP does not belong to loopback (`127.0.0.0/8`), private LANs (`10.*`, `172.16-31.*`, `192.168.*`), or cloud metadata (`169.254.169.254`).
3. Re-validating every redirect hop before following.

### Q2: Why is HTTP-Only cookie storage safer than localStorage for JWTs?
**Answer:** Any JavaScript running on the page can access `localStorage.getItem('token')`. If the application suffers an XSS vulnerability, an injected script can exfiltrate the token. Setting the `HttpOnly` flag instructs the browser engine to block JavaScript access (`document.cookie`), preventing credential theft via XSS.

### Q3: What is the purpose of the Content-Security-Policy (CSP) header?
**Answer:** CSP restricts the domains from which browsers can load resources (scripts, stylesheets, images, iframes). It prevents Cross-Site Scripting by blocking inline scripts (`unsafe-inline`) and disallowing execution of scripts from untrusted external domains.

### Q4: Why is bcrypt superior to SHA-256 for password storage?
**Answer:** SHA-256 is designed to be fast, enabling modern GPUs to calculate over 100 billion hashes per second. `bcrypt` is a slow, adaptive key-derivation function with a configurable work factor. At 12 rounds, it takes ~250ms per check, making brute-force dictionary attacks computationally infeasible.

### Q5: What is the difference between Authentication and Authorization?
**Answer:**
- **Authentication (AuthN):** Confirms identity (*who you are*, verified via email and password hash).
- **Authorization (AuthZ):** Confirms permissions (*what you are allowed to access*, enforcing role checks and object ownership).

---

## 13. Known Limitations & Academic Scope

- **Header Scanner Scope:** The header scanner evaluates defense-in-depth posture based on HTTP headers; it does not replace full dynamic vulnerability scanning (DAST) or code analysis (SAST).
- **Single-Server In-Memory Rate Limiting:** The rate limiters use in-memory counters suitable for single-node development; multi-node production clusters typically back rate limiters with Redis.
- **Localhost Cookie Security:** In local development, cookies use `secure: false` because localhost runs without TLS; in production deployment, `secure: true` must be enabled.

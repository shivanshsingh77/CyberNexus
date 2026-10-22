import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Code2,
  Terminal,
  Key,
  Globe,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const SecurityAwareness = () => {
  const [activeTopic, setActiveTopic] = useState('sqli');
  const [sandboxInput, setSandboxInput] = useState("<script>alert('XSS')</script>");

  const topics = [
    {
      id: 'sqli',
      title: 'SQL / NoSQL Injection',
      badge: 'CWE-89 / OWASP A03',
      icon: Terminal,
      description:
        'Occurs when untrusted user input is directly concatenated into database queries instead of being parameterized.',
      danger:
        'Attackers can bypass authentication, extract sensitive customer records, modify data, or execute administrative commands.',
      vulnerableCode: `// ❌ VULNERABLE: Direct string concatenation or raw operator passing
app.post('/api/login', async (req, res) => {
  const { user, pass } = req.body;
  // Attacker inputs: user = { "$gt": "" }
  const found = await db.collection('users').find({
    username: user,
    password: pass
  });
});`,
      secureCode: `// ✅ SECURE: Strict Schema Typing, Mongoose Parameterization & Cast
import { body } from 'express-validator';

// 1. Enforce strict type validation
const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty()
];

// 2. Mongoose automatically escapes and parameterizes queries
const user = await User.findOne({ email: req.body.email });
const isMatch = await user.comparePassword(req.body.password);`,
      prevention: [
        'Always use Object-Document Mappers (Mongoose) or Object-Relational Mappers (Prisma/TypeORM) that parameterize queries.',
        'Never construct SQL/NoSQL statements using string concatenation or template literals (`SELECT * FROM users WHERE id = ${id}`).',
        'Use input validation libraries (express-validator) to ensure fields match expected primitive types.',
        'Enforce least-privilege database user permissions.',
      ],
    },
    {
      id: 'xss',
      title: 'Cross-Site Scripting (XSS)',
      badge: 'CWE-79 / OWASP A03',
      icon: Code2,
      description:
        'Enables attackers to inject malicious client-side scripts into web pages viewed by other users.',
      danger:
        'Malicious JavaScript can steal session cookies (if not HttpOnly), log keystrokes, capture auth tokens, or redirect users to phishing sites.',
      vulnerableCode: `// ❌ VULNERABLE: Direct DOM injection without sanitization
function renderComment(userInput) {
  // Directly inserting unescaped HTML
  document.getElementById('comment-box').innerHTML = userInput;
}`,
      secureCode: `// ✅ SECURE: Context-aware HTML escaping and Content-Security-Policy
import DOMPurify from 'dompurify';

// 1. React JSX automatically escapes variables by default
return <div className="comment">{userInput}</div>;

// 2. Helmet Content-Security-Policy (CSP) headers block unauthorized inline scripts
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"] // Disallows unsafe-inline
  }
}));`,
      prevention: [
        'Set the HttpOnly flag on all sensitive authentication cookies so document.cookie cannot read them.',
        'Use modern frameworks like React that automatically context-escape variable interpolations.',
        'Deploy a strict Content-Security-Policy (CSP) via Helmet to prevent execution of unauthorized inline scripts.',
        'Sanitize rich text HTML input with trusted libraries like DOMPurify before storage.',
      ],
    },
    {
      id: 'passwords',
      title: 'Weak Passwords & Credential Stuffing',
      badge: 'CWE-521 / OWASP A07',
      icon: Key,
      description:
        'Using predictable passwords or repeating credentials exposed in third-party data breaches.',
      danger:
        'Automated botnets use credential lists (RockYou) to test millions of combinations against your authentication API in minutes.',
      vulnerableCode: `// ❌ VULNERABLE: MD5 / SHA-256 single hash or plaintext storage
import crypto from 'crypto';

// Fast hashes are designed for speed, allowing 100+ billion guesses/sec on GPU
const badHash = crypto.createHash('md5').update(password).digest('hex');
await db.users.insert({ username, password: badHash });`,
      secureCode: `// ✅ SECURE: Adaptive Key Stretching with Bcrypt / Argon2
import bcrypt from 'bcryptjs';

// Bcrypt work factor 12 enforces ~250ms computation time per attempt
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(password, salt);

// Store strictly the hashed string, never the plaintext password!
await User.create({ username, password: hashedPassword });`,
      prevention: [
        'Enforce slow, memory-hard adaptive hashing algorithms (bcrypt, Argon2id, PBKDF2) with work factor >= 12.',
        'Never store plaintext passwords in source control, databases, or log files.',
        'Enforce login rate limiting (e.g. 5-10 attempts per 15 min) to thwart brute-force scripts.',
        'Validate password complexity (minimum 8-12 characters, uppercase, lowercase, numbers, symbols).',
      ],
    },
    {
      id: 'session',
      title: 'Session Security & Cookie Hijacking',
      badge: 'CWE-384 / OWASP A07',
      icon: Globe,
      description:
        'Flaws in how session identifiers are generated, transmitted, and invalidated during authentication.',
      danger:
        'Interception or theft of a session token allows an attacker to impersonate the victim without needing their password.',
      vulnerableCode: `// ❌ VULNERABLE: Token in localStorage or insecure cookie
// Accessible via any XSS vulnerability in client scripts!
localStorage.setItem('auth_token', token);

// Or unhardened cookie
res.cookie('session_id', token); // Missing HttpOnly & SameSite`,
      secureCode: `// ✅ SECURE: Hardened HTTP-Only SameSite Cookie & Explicit Invalidation
res.cookie('token', token, {
  httpOnly: true,  // Blocks document.cookie access from XSS
  secure: process.env.NODE_ENV === 'production', // Requires HTTPS
  sameSite: 'lax', // Protects against Cross-Site Request Forgery (CSRF)
  maxAge: 24 * 60 * 60 * 1000 // 24-hour expiration
});

// Logout endpoint immediately clears cookie
res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });`,
      prevention: [
        'Always set the `HttpOnly` cookie attribute for authentication tokens.',
        'Set `SameSite=Lax` or `Strict` to mitigate Cross-Site Request Forgery (CSRF).',
        'Ensure sessions have sensible expiration times and provide an explicit logout endpoint that clears session cookies.',
        'Regenerate session tokens upon privilege escalation or login to prevent session fixation.',
      ],
    },
    {
      id: 'tls',
      title: 'HTTPS, TLS & Man-in-the-Middle',
      badge: 'CWE-319 / OWASP A02',
      icon: ShieldCheck,
      description:
        'Transmitting sensitive data over cleartext HTTP allows network eavesdroppers to intercept credentials and cookies.',
      danger:
        'Attackers on local Wi-Fi or compromised routers can inspect passwords, credit cards, and hijack active sessions.',
      vulnerableCode: `// ❌ VULNERABLE: Cleartext HTTP transmission
// Request over plain http:// sends credentials unencrypted
POST http://api.example.com/login HTTP/1.1
Host: api.example.com
Cookie: token=secret123456

// Anyone with Wireshark on the same router can view token in plain text!`,
      secureCode: `// ✅ SECURE: TLS 1.3 + Strict-Transport-Security (HSTS)
import helmet from 'helmet';

// Enforce HSTS header so browsers automatically upgrade all HTTP requests
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));

// In production, configure reverse proxy (Nginx / Cloudflare) with valid SSL cert`,
      prevention: [
        'Enforce HTTPS everywhere with TLS 1.2 or TLS 1.3.',
        'Configure the HTTP Strict Transport Security (HSTS) header to prevent protocol downgrade attacks.',
        'Set `secure: true` on cookies so they are never transmitted over unencrypted HTTP.',
        'Use automated certificate management like Let’s Encrypt / Certbot.',
      ],
    },
    {
      id: 'authz',
      title: 'Authentication vs. Authorization (IDOR)',
      badge: 'CWE-285 / OWASP A01',
      icon: UserCheck,
      description:
        'Authentication proves WHO you are. Authorization determines WHAT actions and resources you are permitted to access.',
      danger:
        'Insecure Direct Object References (IDOR) allow Alice to view Bob’s private invoices simply by changing the ID in the URL to `?id=102`.',
      vulnerableCode: `// ❌ VULNERABLE: Authenticated, but lacks object-level authorization!
app.get('/api/documents/:docId', authenticate, async (req, res) => {
  // Fetches document solely by URL parameter without checking owner!
  const doc = await Document.findById(req.params.docId);
  res.json(doc); // Any logged in user can read anyone else's doc!
});`,
      secureCode: `// ✅ SECURE: Strict Object Ownership & Role Verification
app.get('/api/documents/:docId', authenticate, async (req, res) => {
  // Query incorporates authenticated user's ID
  const doc = await Document.findOne({
    _id: req.params.docId,
    ownerId: req.user._id // Ensures user only accesses their own resources!
  });

  if (!doc) {
    return res.status(404).json({ message: 'Document not found or unauthorized' });
  }
  res.json(doc);
});`,
      prevention: [
        'Never trust IDs directly from URL parameters or request bodies without verifying resource ownership.',
        'Implement Role-Based Access Control (RBAC) middleware for administrative functions.',
        'Deny by default: unprivileged users should only be able to query records where `userId === req.user._id`.',
        'Log unauthorized access attempts for security anomaly detection.',
      ],
    },
  ];

  const currentTopic = topics.find((t) => t.id === activeTopic) || topics[0];

  const getEscapedHtml = (raw) => {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">
            <GraduationCap color="var(--emerald-success)" size={26} />
            Web Security Awareness Hub
          </div>
          <div className="page-subtitle">
            Master the OWASP Top 10 web vulnerabilities with safe, non-destructive demonstrations and defensive code patterns.
          </div>
        </div>
      </div>

      {/* Topic Selection Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        {topics.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === activeTopic;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
              <span>{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Educational Card */}
      <div className="nexus-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span className="badge badge-blue">{currentTopic.badge}</span>
              <span className="badge badge-warning">Critical Concept</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {currentTopic.title}
            </h2>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '0.85rem' }}>
          {currentTopic.description}
        </p>

        {/* Danger Box */}
        <div className="alert-box alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Real-World Exploit Impact: </strong>
            <span>{currentTopic.danger}</span>
          </div>
        </div>

        {/* Side-by-Side Code Comparison */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--rose-danger)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.45rem' }}>
              <span>❌ Vulnerable Implementation</span>
            </div>
            <pre className="code-snippet" style={{ borderLeft: '3px solid var(--rose-danger)' }}>
              <code>{currentTopic.vulnerableCode}</code>
            </pre>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-success)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '0.45rem' }}>
              <span>✅ CyberNexus Secure Defense</span>
            </div>
            <pre className="code-snippet" style={{ borderLeft: '3px solid var(--emerald-success)' }}>
              <code>{currentTopic.secureCode}</code>
            </pre>
          </div>
        </div>

        {/* Defensive Checklist */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={16} color="var(--emerald-success)" />
            Core Mitigation Rules
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
            {currentTopic.prevention.map((rule, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle size={14} color="var(--emerald-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Safe XSS Sanitization Simulator */}
      <div className="nexus-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem' }}>
          <Play size={16} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Interactive Sandbox: Real-Time Input Sanitization Simulator
          </h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Type any payload below to see the difference between raw unescaped HTML interpolation vs safe context-encoded rendering. (Runs purely simulated; no malicious scripts are executed).
        </p>

        <div className="form-group" style={{ marginBottom: '0.85rem' }}>
          <label className="form-label">Test Input Payload</label>
          <input
            type="text"
            className="form-input"
            value={sandboxInput}
            onChange={(e) => setSandboxInput(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div className="grid-2">
          {/* Raw Unsafe View */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--rose-danger)', marginBottom: '0.35rem' }}>
              Raw DOM Output (Simulated Unescaped)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
              Attacker-controlled payload directly parsed as browser executable code:
            </div>
            <div
              style={{
                padding: '0.55rem 0.75rem',
                backgroundColor: '#0f172a',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#f87171',
                wordBreak: 'break-all',
              }}
            >
              {`<div innerHTML="${sandboxInput}"> ⚠️ Malicious Script Parsed</div>`}
            </div>
          </div>

          {/* Sanitized View */}
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--emerald-bg)', border: '1px solid var(--emerald-border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--emerald-success)', marginBottom: '0.35rem' }}>
              CyberNexus Escaped Output (Neutralized)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
              Characters safely converted into harmless entity representations:
            </div>
            <div
              style={{
                padding: '0.55rem 0.75rem',
                backgroundColor: '#0f172a',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                color: '#34d399',
                wordBreak: 'break-all',
              }}
            >
              {getEscapedHtml(sandboxInput)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

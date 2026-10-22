import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Circle,
  RotateCcw,
  Download,
  Shield,
  Info,
  Check,
} from 'lucide-react';

const INITIAL_CHECKLIST_DATA = [
  {
    category: '1. Password Handling & Storage',
    items: [
      { id: 'pwd-1', text: 'Passwords are never stored in plaintext in the database or server logs.', checked: true },
      { id: 'pwd-2', text: 'Passwords are cryptographically hashed using adaptive algorithms (bcrypt / Argon2) with salt rounds >= 12.', checked: true },
      { id: 'pwd-3', text: 'A salt is generated uniquely per password to prevent rainbow table attacks.', checked: true },
      { id: 'pwd-4', text: 'Client-side password evaluation does not transmit the candidate password across the network.', checked: true },
    ],
  },
  {
    category: '2. Input Validation & Sanitization',
    items: [
      { id: 'inp-1', text: 'Server-side validation is enforced on all incoming fields (never rely solely on frontend).', checked: true },
      { id: 'inp-2', text: 'Strict length bounds (e.g. min 3, max 30 for usernames) prevent buffer overflow and large payload attacks.', checked: true },
      { id: 'inp-3', text: 'Email addresses are verified for RFC format compliance and normalized before storage.', checked: true },
      { id: 'inp-4', text: 'JSON request payload size is restricted to a safe cap (10kb) to prevent DoS.', checked: true },
    ],
  },
  {
    category: '3. Authentication & Access Control',
    items: [
      { id: 'auth-1', text: 'Duplicate user email registrations are rejected with a clean HTTP 409 status.', checked: true },
      { id: 'auth-2', text: 'Failed login attempts return generic error messages to prevent account enumeration.', checked: true },
      { id: 'auth-3', text: 'Private endpoints (e.g. /api/users/profile) strictly verify JWT presence and signature.', checked: true },
      { id: 'auth-4', text: 'Sensitive server stack traces and internal file paths are stripped from error responses.', checked: true },
    ],
  },
  {
    category: '4. Session Security & Cookies',
    items: [
      { id: 'sess-1', text: 'Authentication tokens are transmitted inside HTTP-Only cookies to mitigate XSS theft.', checked: true },
      { id: 'sess-2', text: 'SameSite=Lax (or Strict) is configured to protect against Cross-Site Request Forgery (CSRF).', checked: true },
      { id: 'sess-3', text: 'Cookies include an explicit expiration date and maxAge property.', checked: true },
      { id: 'sess-4', text: 'A dedicated logout endpoint explicitly invalidates and clears the session cookie.', checked: true },
    ],
  },
  {
    category: '5. HTTP Security Headers',
    items: [
      { id: 'head-1', text: 'Helmet middleware is mounted on the Express server.', checked: true },
      { id: 'head-2', text: 'X-Powered-By header is suppressed to prevent server technology fingerprinting.', checked: true },
      { id: 'head-3', text: 'X-Content-Type-Options: nosniff is enforced to block MIME type sniffing.', checked: true },
      { id: 'head-4', text: 'Content-Security-Policy (CSP) is defined to restrict unauthorized script origins.', checked: true },
    ],
  },
  {
    category: '6. Rate Limiting & DoS Defense',
    items: [
      { id: 'rate-1', text: 'Authentication endpoints (/api/auth) enforce strict rate limiting (max 10 attempts / 15m).', checked: true },
      { id: 'rate-2', text: 'Global API rate limiting throttles excessive requests per IP across all routes.', checked: true },
      { id: 'rate-3', text: 'Standard RateLimit-* HTTP response headers are provided to clients.', checked: true },
    ],
  },
  {
    category: '7. Database & Credential Safety',
    items: [
      { id: 'db-1', text: 'Database credentials and JWT secret keys reside strictly in environment variables (.env).', checked: true },
      { id: 'db-2', text: 'A safe sample .env.example file is documented without real production secrets.', checked: true },
      { id: 'db-3', text: 'Mongoose schemas strictly enforce type casting, preventing raw NoSQL injection operators.', checked: true },
      { id: 'db-4', text: 'Git ignore rules exclude .env and node_modules from source control.', checked: true },
    ],
  },
];

export const SecurityChecklist = () => {
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('cybernexus_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CHECKLIST_DATA;
      }
    }
    return INITIAL_CHECKLIST_DATA;
  });

  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('cybernexus_checklist', JSON.stringify(checklist));
  }, [checklist]);

  const toggleItem = (catIdx, itemIdx) => {
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[catIdx].items[itemIdx].checked = !copy[catIdx].items[itemIdx].checked;
      return copy;
    });
  };

  const resetChecklist = () => {
    if (window.confirm('Reset all checklist items to default state?')) {
      setChecklist(INITIAL_CHECKLIST_DATA);
    }
  };

  const exportReport = () => {
    const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
    const checkedItems = checklist.reduce(
      (acc, cat) => acc + cat.items.filter((i) => i.checked).length,
      0
    );
    const score = Math.round((checkedItems / totalItems) * 100);

    const report = {
      project: 'CyberNexus Web Application Security Platform',
      assessmentType: 'Internal OWASP Security Readiness Self-Assessment',
      evaluatedDate: new Date().toISOString(),
      score: `${score}%`,
      completedItems: `${checkedItems} / ${totalItems}`,
      categories: checklist,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberNexus_Security_Assessment_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = checklist.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.checked).length,
    0
  );
  const percentage = Math.round((checkedItems / totalItems) * 100);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">
            <ClipboardCheck color="var(--amber-warning)" size={26} />
            OWASP Security Self-Assessment Checklist
          </div>
          <div className="page-subtitle">
            Evaluate your application codebase against baseline secure engineering practices.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={resetChecklist} className="btn btn-secondary">
            <RotateCcw size={14} />
            Reset
          </button>
          <button onClick={exportReport} className="btn btn-primary">
            {downloadSuccess ? <Check size={14} /> : <Download size={14} />}
            {downloadSuccess ? 'Downloaded!' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Explicit Self-Assessment Disclaimer Notice */}
      <div className="alert-box alert-info" style={{ marginBottom: '1.5rem' }}>
        <Info size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Self-Assessment Scope: </strong>
          This checklist is a <strong>developer self-assessment tool</strong> designed to evaluate internal code and architectural controls against OWASP Top 10 guidelines. It is <strong>not</strong> an automated external vulnerability scanner for third-party websites. (For external targets, use the <em>Website Security Scanner</em> tab).
        </div>
      </div>

      {/* Progress Score Bar */}
      <div className="nexus-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Readiness Score</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {percentage}% Complete
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>{checkedItems}</strong> of <strong>{totalItems}</strong> controls verified
          </div>
        </div>

        <div
          style={{
            height: '8px',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '9999px',
              transition: 'width 0.25s ease',
            }}
          />
        </div>
      </div>

      {/* Checklist Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {checklist.map((cat, catIdx) => {
          const catChecked = cat.items.filter((i) => i.checked).length;
          const catTotal = cat.items.length;
          const isCatDone = catChecked === catTotal;

          return (
            <div key={catIdx} className="nexus-card">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.85rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} color={isCatDone ? 'var(--emerald-success)' : 'var(--accent-primary)'} />
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {cat.category}
                  </h3>
                </div>
                <span className={`badge ${isCatDone ? 'badge-success' : 'badge-blue'}`}>
                  {catChecked} / {catTotal} Done
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(catIdx, itemIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: item.checked ? 'var(--bg-card)' : 'var(--bg-primary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: item.checked ? 'var(--border-color)' : 'var(--border-color)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      {item.checked ? (
                        <CheckCircle2 size={16} color="var(--emerald-success)" />
                      ) : (
                        <Circle size={16} color="var(--text-dim)" />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.84rem',
                        color: item.checked ? 'var(--text-main)' : 'var(--text-dim)',
                        lineHeight: 1.45,
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

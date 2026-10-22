import React, { useState } from 'react';
import {
  Globe,
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../api/client';

export const WebsiteScanner = () => {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    if (!targetUrl || targetUrl.trim().length === 0) {
      setErrorMsg('Please enter a website URL.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await apiClient('/scanner/scan', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl }),
      });

      if (res.ok && res.data) {
        setResult(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to scan target website.');
      }
    } catch (err) {
      setErrorMsg('Network error while connecting to the scanner engine.');
    } finally {
      setLoading(false);
    }
  };

  const setFastUrl = (url) => {
    setTargetUrl(url);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return { text: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
      case 'B':
        return { text: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
      case 'C':
        return { text: '#d97706', bg: '#fffbeb', border: '#fde68a' };
      case 'D':
      case 'F':
      default:
        return { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="badge badge-success">
            <CheckCircle2 size={12} /> PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="badge badge-warning">
            <AlertTriangle size={12} /> WARNING
          </span>
        );
      case 'FAIL':
        return (
          <span className="badge badge-danger">
            <XCircle size={12} /> FAIL
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="badge badge-neutral">
            <HelpCircle size={12} /> INFO
          </span>
        );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">
            <Globe color="var(--accent-primary)" size={26} />
            Website Security Header Scanner
          </div>
          <div className="page-subtitle">
            Live inspection of HTTP defensive headers (CSP, HSTS, X-Frame-Options, nosniff) with hardened SSRF protection.
          </div>
        </div>
      </div>

      {/* SSRF & Scope Notice */}
      <div className="alert-box alert-info" style={{ marginBottom: '1.5rem' }}>
        <Shield size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Server-Side Request Forgery (SSRF) Defense Active:</strong> Scans are restricted strictly to public HTTP/HTTPS endpoints. All requests to loopback (`127.0.0.1`, `localhost`), private LAN subnets (`192.168.*`, `10.*`), and internal cloud metadata (`169.254.169.254`) are resolved via DNS and actively blocked.
        </div>
      </div>

      {/* Scanner Form Card */}
      <div className="nexus-card" style={{ marginBottom: '1.75rem' }}>
        <form onSubmit={handleScan}>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label">Target Website URL</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Globe
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-dim)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem' }}
              >
                {loading ? (
                  <>
                    <span className="spin">&bull;</span> Scanning Target...
                  </>
                ) : (
                  <>
                    <Search size={15} /> Scan Headers
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Samples */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          <Sparkles size={13} color="var(--accent-primary)" />
          <span>Quick test public domains:</span>
          <button
            type="button"
            onClick={() => setFastUrl('https://example.com')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
          >
            example.com
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => setFastUrl('https://owasp.org')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
          >
            owasp.org
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => setFastUrl('https://github.com')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
          >
            github.com
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => setFastUrl('http://127.0.0.1')}
            title="Demonstrate SSRF Protection"
            style={{ background: 'none', border: 'none', color: 'var(--rose-danger)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit' }}
          >
            127.0.0.1 (Test SSRF Block)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-box alert-danger" style={{ marginBottom: '1.75rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Scan Not Completed: </strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Executive Overview */}
          <div className="grid-4">
            {/* Grade Card */}
            <div
              className="nexus-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Header Posture Grade
              </div>
              {(() => {
                const colors = getGradeColor(result.grade);
                return (
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      color: colors.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.85rem',
                      fontWeight: 800,
                      margin: '0.65rem 0',
                    }}
                  >
                    {result.grade}
                  </div>
                );
              })()}
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Score: {result.overallScore} / 100
              </div>
            </div>

            {/* Target Status */}
            <div className="nexus-card">
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Target Endpoint
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.35rem', wordBreak: 'break-all' }}>
                {result.httpStatus} {result.statusText}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', wordBreak: 'break-all' }}>
                Final URL: {result.finalUrl}
              </div>
            </div>

            {/* Controls Count */}
            <div className="nexus-card">
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Headers Passing
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--emerald-success)', marginTop: '0.35rem' }}>
                {result.checks.filter((c) => c.status === 'PASS').length} of {result.checks.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Verified defensive directives
              </div>
            </div>

            {/* Scan Timestamp */}
            <div className="nexus-card">
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Scan Timestamp
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.5rem' }}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                Live response inspection
              </div>
            </div>
          </div>

          {/* Academic Disclaimer */}
          <div className="alert-box alert-warning">
            <Info size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.82rem' }}>
              <strong>Scope & Academic Honesty Notice: </strong>
              {result.disclaimer}
            </div>
          </div>

          {/* Detailed Header Breakdown */}
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Inspected Defensive Directives
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {result.checks.map((check, idx) => (
              <div
                key={idx}
                className="nexus-card"
                style={{
                  borderLeft: `4px solid ${
                    check.status === 'PASS'
                      ? 'var(--emerald-success)'
                      : check.status === 'FAIL'
                      ? 'var(--rose-danger)'
                      : 'var(--amber-warning)'
                  }`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {check.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                      HTTP Header: {check.header}
                    </div>
                  </div>
                  <div>{getStatusBadge(check.status)}</div>
                </div>

                {/* Detected Value */}
                <div style={{ marginBottom: '0.65rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Received Value:
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      padding: '0.45rem 0.65rem',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: '4px',
                      color: check.status === 'PASS' ? '#0f766e' : '#b91c1c',
                      wordBreak: 'break-all',
                    }}
                  >
                    {check.value}
                  </div>
                </div>

                {/* Explanation */}
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  {check.explanation}
                </p>

                {/* Remediation */}
                <div style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                  <strong style={{ color: 'var(--accent-primary)' }}>Remediation: </strong>
                  <span>{check.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

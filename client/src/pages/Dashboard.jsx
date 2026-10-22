import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  GraduationCap,
  ClipboardCheck,
  FileCheck2,
  Globe,
  Activity,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Dashboard = ({ setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();
  const [auditStats, setAuditStats] = useState({
    score: null,
    passedCount: 0,
    totalTests: 8,
    loading: true,
  });
  const [dbStatus, setDbStatus] = useState('checking');

  useEffect(() => {
    const fetchStatusAndAudit = async () => {
      try {
        const [healthRes, auditRes] = await Promise.all([
          apiClient('/health'),
          apiClient('/audit/run'),
        ]);

        if (healthRes.ok && healthRes.data) {
          setDbStatus(healthRes.data.database === 'connected' ? 'connected' : 'disconnected');
        }

        if (auditRes.ok && auditRes.data) {
          setAuditStats({
            score: auditRes.data.overallScore,
            passedCount: auditRes.data.passedCount,
            totalTests: auditRes.data.totalTests,
            loading: false,
          });
        } else {
          setAuditStats((prev) => ({ ...prev, loading: false }));
        }
      } catch {
        setDbStatus('error');
        setAuditStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStatusAndAudit();
  }, []);

  const isOperational = dbStatus === 'connected' && (auditStats.score === null || auditStats.score >= 80);

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div
        className="nexus-card"
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'var(--border-color)',
          marginBottom: '1.75rem',
          padding: '1.75rem 2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-blue">CyberNexus Core</span>
              {/* Dynamic Operational Status Badge */}
              <span className={`badge ${isOperational ? 'badge-success' : 'badge-warning'}`}>
                {isOperational ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                {isOperational ? 'All Systems Operational' : 'System Degraded / Action Needed'}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Welcome back, {isAuthenticated ? user?.username : 'Security Analyst'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '680px', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Web Application Security Engineering Platform. Scan public websites for defensive headers, audit server cryptographic controls, evaluate password entropy, and explore OWASP mitigation architectures.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => setActiveTab('scanner')} className="btn btn-primary">
              <Globe size={15} />
              Scan Target Website
            </button>
            <button onClick={() => setActiveTab('report')} className="btn btn-secondary">
              <FileCheck2 size={15} />
              Internal Audit Report
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
        {/* Metric 1 */}
        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Application Posture
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                {auditStats.score !== null ? `${auditStats.score}%` : 'Auditing...'}
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                color: 'var(--accent-primary)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
            {auditStats.passedCount} of {auditStats.totalTests} security controls verified
          </div>
        </div>

        {/* Metric 2 */}
        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Password Storage
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                Bcrypt 12
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'var(--emerald-bg)',
                color: 'var(--emerald-success)',
              }}
            >
              <Lock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--emerald-success)', marginTop: '0.65rem' }}>
            Work factor 12 &bull; Plaintext storage disabled
          </div>
        </div>

        {/* Metric 3 */}
        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Session Policy
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-teal)', marginTop: '0.15rem' }}>
                HTTP-Only
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-teal-soft)',
                color: 'var(--accent-teal)',
              }}
            >
              <Layers size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
            SameSite=Lax &bull; document.cookie access blocked
          </div>
        </div>

        {/* Metric 4 */}
        <div className="nexus-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Brute-Force Guard
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-warning)', marginTop: '0.15rem' }}>
                10 req / 15m
              </div>
            </div>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'var(--amber-bg)',
                color: 'var(--amber-warning)',
              }}
            >
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.65rem' }}>
            RateLimit-* headers enforced on /api/auth
          </div>
        </div>
      </div>

      {/* Main Grid: Feature Modules */}
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.9rem' }}>
        Security Modules & Tools
      </h2>
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Module 1: Website Security Scanner */}
        <div
          onClick={() => setActiveTab('scanner')}
          className="nexus-card nexus-card-interactive"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Globe size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Website Security Header Scanner
                </h3>
                <span className="badge badge-blue">Live Tool</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Enter any public website URL to inspect real response headers (CSP, HSTS, X-Frame-Options, nosniff) with hardened SSRF protection.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.65rem' }}>
                <span>Launch Scanner</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Password Checker */}
        <div
          onClick={() => setActiveTab('password-checker')}
          className="nexus-card nexus-card-interactive"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-teal-soft)',
                color: 'var(--accent-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <KeyRound size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Password Strength & Entropy Analyzer
                </h3>
                <span className="badge badge-teal">Client-Side</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Local mathematical evaluation of password complexity, Shannon entropy bits, and GPU brute-force crack time estimates without transmitting data.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-teal)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.65rem' }}>
                <span>Launch Analyzer</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: Security Awareness Hub */}
        <div
          onClick={() => setActiveTab('awareness')}
          className="nexus-card nexus-card-interactive"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--emerald-bg)',
                color: 'var(--emerald-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Web Security Awareness Hub
                </h3>
                <span className="badge badge-success">OWASP Lab</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Examine SQL Injection, XSS, Session Hijacking, and Broken Access Control with side-by-side vulnerable vs. secure implementation snippets.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--emerald-success)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.65rem' }}>
                <span>Explore Concepts</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* Module 4: Internal Audit Report */}
        <div
          onClick={() => setActiveTab('report')}
          className="nexus-card nexus-card-interactive"
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#f1f5f9',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileCheck2 size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Application Security Testing Report
                </h3>
                <span className="badge badge-neutral">Diagnostics</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                Execute real internal probes against this running application: tests 401 route barriers, 400 validation rejections, Helmet headers, and bcrypt hashes.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.65rem' }}>
                <span>View Internal Audit</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defense Architecture Reference */}
      <div className="nexus-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={17} color="var(--accent-primary)" />
          Defense-in-Depth Implementation Reference
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
              1. Transport & Edge Defense
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>&bull; Helmet HTTP Headers (nosniff, frameguard)</li>
              <li>&bull; Server fingerprinting suppression (X-Powered-By: off)</li>
              <li>&bull; Explicit CORS origin restriction with credentials</li>
            </ul>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-teal)', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
              2. Authentication & Identity
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>&bull; bcryptjs salted password hashing (12 rounds)</li>
              <li>&bull; HTTP-Only & SameSite=Lax session cookies</li>
              <li>&bull; Account enumeration defense (generic 401s)</li>
            </ul>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontWeight: 700, color: 'var(--amber-warning)', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
              3. Input & DoS Mitigation
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>&bull; Rate limiting on auth endpoints (10 req/15min)</li>
              <li>&bull; express-validator schema & character hygiene</li>
              <li>&bull; Strict 10kb JSON request payload cutoff</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

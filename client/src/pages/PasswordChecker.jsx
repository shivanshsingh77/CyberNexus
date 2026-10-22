import React, { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Cpu,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { evaluatePasswordStrength } from '../utils/passwordStrength';

export const PasswordChecker = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const evaluation = evaluatePasswordStrength(password);

  const generateStrongPassword = () => {
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_+~|}{[]:;?><,.-=';
    const all = lower + upper + numbers + symbols;

    let generated = '';
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);

    generated += lower[array[0] % lower.length];
    generated += upper[array[1] % upper.length];
    generated += numbers[array[2] % numbers.length];
    generated += symbols[array[3] % symbols.length];

    for (let i = 4; i < 16; i++) {
      generated += all[array[i] % all.length];
    }

    const shuffled = generated
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    setPassword(shuffled);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMeterPercent = (score) => {
    return Math.min(100, Math.max(10, ((score + 1) / 6) * 100));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">
            <KeyRound color="var(--accent-teal)" size={26} />
            Password Strength & Entropy Analyzer
          </div>
          <div className="page-subtitle">
            Evaluate password resistance to dictionary, rainbow table, and GPU brute-force attacks.
          </div>
        </div>
        <button onClick={generateStrongPassword} className="btn btn-secondary">
          <RefreshCw size={14} />
          Generate High-Entropy Password
        </button>
      </div>

      {/* Security Privacy Notice */}
      <div className="alert-box alert-info" style={{ marginBottom: '1.5rem' }}>
        <Info size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>100% Client-Side Privacy Guarantee: </strong>
          Passwords tested on this page are computed entirely within your local browser's JavaScript engine. No data is transmitted across the network, stored, or logged anywhere.
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
        {/* Left Column: Password Input & Analysis */}
        <div className="nexus-card">
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Test Password
              </label>
              {password && (
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? 'var(--emerald-success)' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type or paste a password to inspect..."
                className="form-input"
                style={{ paddingRight: '2.5rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Strength Meter Bar */}
          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Strength Assessment</span>
              <span
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: evaluation.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                {evaluation.label}
              </span>
            </div>

            <div
              style={{
                height: '7px',
                width: '100%',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: password ? `${getMeterPercent(evaluation.score)}%` : '0%',
                  backgroundColor: evaluation.color,
                  borderRadius: '9999px',
                  transition: 'all 0.25s ease',
                }}
              />
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Shannon Entropy</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                {evaluation.entropyBits} bits
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                Key space: {evaluation.poolSize} possible chars
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Est. Crack Time</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: evaluation.color, marginTop: '0.25rem' }}>
                {evaluation.crackTime}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                @ 10 Billion guesses/sec (GPU)
              </div>
            </div>
          </div>

          {/* Requirement Checkpoints */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
              Complexity Checklist
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: evaluation.checks.length ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                {evaluation.checks.length ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>8+ Characters ({password.length})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: evaluation.checks.uppercase ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                {evaluation.checks.uppercase ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Uppercase (A-Z)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: evaluation.checks.lowercase ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                {evaluation.checks.lowercase ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Lowercase (a-z)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: evaluation.checks.numbers ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                {evaluation.checks.numbers ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Numbers (0-9)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: evaluation.checks.special ? 'var(--emerald-success)' : 'var(--text-dim)' }}>
                {evaluation.checks.special ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                <span>Symbols (@#$%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Warnings & Suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {evaluation.warnings.length > 0 && (
            <div className="alert-box alert-danger">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Predictable Pattern Warning</strong>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {evaluation.warnings.map((warn, idx) => (
                    <li key={idx}>&bull; {warn}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="nexus-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.65rem' }}>
              <Zap size={16} />
              Hardening Recommendations
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {evaluation.suggestions.map((sug, idx) => (
                <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                  <span style={{ color: 'var(--accent-primary)' }}>&rarr;</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="nexus-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-main)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.65rem' }}>
              <Cpu size={16} color="var(--accent-teal)" />
              Why Weak Passwords Are Catastrophic
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Threat actors utilize GPU-accelerated hashing tools like Hashcat capable of testing billions of combinations per second. Weak, repeating, or dictionary passwords are cracked within seconds.
            </p>
            <div style={{ marginTop: '0.65rem', padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--accent-teal)' }}>CyberNexus Defense: </strong>
              CyberNexus enforces server-side salt rounds of <strong>12 using bcrypt</strong>, which deliberately increases calculation latency to ~250ms per check, rendering large-scale automated offline attacks computationally infeasible.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

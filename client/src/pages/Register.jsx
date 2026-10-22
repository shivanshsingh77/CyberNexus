import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = ({ setActiveTab }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`|\\ ]/.test(password),
  };

  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (username.length < 3 || username.length > 30) {
      setErrorMessage('Username must be between 3 and 30 characters.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('Password does not fulfill all security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      setActiveTab('dashboard');
    } else {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const fillDemoRegister = () => {
    const randomId = Math.floor(Math.random() * 900) + 100;
    setUsername(`sec_analyst_${randomId}`);
    setEmail(`analyst${randomId}@cybernexus.local`);
    setPassword('CyberNexus@2026Secure!');
    setConfirmPassword('CyberNexus@2026Secure!');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="nexus-card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '2rem',
          boxShadow: 'var(--shadow-dropdown)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              backgroundColor: 'var(--emerald-bg)',
              border: '1px solid var(--emerald-border)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-success)',
              marginBottom: '0.85rem',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Create Secure Account
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
            Register with bcrypt salt factor 12 cryptographic hashing.
          </p>
        </div>

        {errorMessage && (
          <div className="alert-box alert-danger">
            <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="cyber_analyst"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <User
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
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="analyst@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
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
          </div>

          <div className="form-group">
            <label className="form-label">Master Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
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
          </div>

          {/* Complexity Checkpoints */}
          <div
            style={{
              padding: '0.65rem 0.75rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              fontSize: '0.74rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.3rem',
            }}
          >
            <span style={{ color: checks.length ? 'var(--emerald-success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {checks.length ? <CheckCircle2 size={13} /> : <XCircle size={13} />} 8+ Chars
            </span>
            <span style={{ color: checks.uppercase ? 'var(--emerald-success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {checks.uppercase ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Uppercase (A-Z)
            </span>
            <span style={{ color: checks.lowercase ? 'var(--emerald-success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {checks.lowercase ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Lowercase (a-z)
            </span>
            <span style={{ color: checks.number ? 'var(--emerald-success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {checks.number ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Number (0-9)
            </span>
            <span style={{ color: checks.special ? 'var(--emerald-success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {checks.special ? <CheckCircle2 size={13} /> : <XCircle size={13} />} Symbol (@#$%)
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.65rem' }}
          >
            {loading ? 'Registering Account...' : 'Create Secure Account'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={fillDemoRegister}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem', gap: '0.35rem' }}
          >
            <Sparkles size={13} color="var(--accent-primary)" />
            Fill Auto-Generated Demo User
          </button>
        </div>

        <div
          style={{
            marginTop: '1.15rem',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '0.85rem',
          }}
        >
          Already registered?{' '}
          <button
            onClick={() => setActiveTab('login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign In Here
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Menu, Database, Lock, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Navbar = ({ activeTab, setMobileOpen, setActiveTab }) => {
  const { user, isAuthenticated } = useAuth();
  const [healthStatus, setHealthStatus] = useState('checking');

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await apiClient('/health');
        if (res.ok && res.data.database === 'connected') {
          setHealthStatus('healthy');
        } else {
          setHealthStatus('degraded');
        }
      } catch {
        setHealthStatus('error');
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Security Operations Dashboard';
      case 'scanner':
        return 'Website Security Header Scanner';
      case 'password-checker':
        return 'Password Strength & Entropy Analyzer';
      case 'awareness':
        return 'Web Security Awareness & Vulnerability Hub';
      case 'checklist':
        return 'OWASP Security Self-Assessment Checklist';
      case 'report':
        return 'Application Security Testing Report';
      case 'profile':
        return 'User Profile & Session Security';
      case 'login':
        return 'Authentication Portal — Sign In';
      case 'register':
        return 'Account Registration — Sign Up';
      default:
        return 'CyberNexus';
    }
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="btn-secondary"
          style={{
            padding: '0.4rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {getPageTitle()}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Web Application Security Engineering Console
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.74rem',
          }}
        >
          <Database size={13} color="var(--accent-primary)" />
          <span style={{ color: 'var(--text-muted)' }}>MongoDB:</span>
          <span
            style={{
              fontWeight: 600,
              color: healthStatus === 'healthy' ? 'var(--emerald-success)' : 'var(--rose-danger)',
            }}
          >
            {healthStatus === 'healthy' ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.3rem 0.65rem',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '0.74rem',
          }}
        >
          <Lock size={13} color="var(--accent-teal)" />
          <span style={{ color: 'var(--text-muted)' }}>Session:</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>HTTP-Only</span>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.32rem 0.75rem',
              borderRadius: '6px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              color: 'var(--accent-primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <UserCircle size={15} />
            <span>{user?.username}</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

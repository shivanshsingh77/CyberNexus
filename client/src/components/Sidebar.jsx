import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Globe,
  KeyRound,
  GraduationCap,
  ClipboardCheck,
  FileCheck2,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'scanner',
      label: 'Website Security Scanner',
      icon: Globe,
      badge: 'Live',
    },
    {
      id: 'password-checker',
      label: 'Password Checker',
      icon: KeyRound,
      badge: null,
    },
    {
      id: 'awareness',
      label: 'Security Awareness Hub',
      icon: GraduationCap,
      badge: 'OWASP',
    },
    {
      id: 'checklist',
      label: 'Security Checklist',
      icon: ClipboardCheck,
      badge: 'Self-Check',
    },
    {
      id: 'report',
      label: 'Internal Audit Report',
      icon: FileCheck2,
      badge: 'Diagnostic',
    },
    {
      id: 'profile',
      label: 'User Profile',
      icon: User,
      badge: null,
      authOnly: true,
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          width: '270px',
          backgroundColor: '#0f172a', /* Slate 900 */
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 50,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            onClick={() => handleNavClick('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Shield size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#f8fafc',
                }}
              >
                CyberNexus
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: '#94a3b8',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Web Security Platform
              </div>
            </div>
          </div>
          {setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '0.3rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Platform Status */}
        <div
          style={{
            margin: '0.85rem 1.1rem 0.35rem',
            padding: '0.55rem 0.75rem',
            background: 'rgba(15, 118, 110, 0.15)',
            border: '1px solid rgba(13, 148, 136, 0.3)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5eead4' }}>
              Defenses Active
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            HELMET / BCRYPT
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto' }}>
          <div
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              letterSpacing: '0.06em',
              padding: '0.35rem 0.65rem 0.45rem',
            }}
          >
            Modules & Tools
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              if (item.authOnly && !isAuthenticated) return null;
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isActive ? '#38bdf8' : 'transparent',
                    backgroundColor: isActive ? '#1e293b' : 'transparent',
                    color: isActive ? '#38bdf8' : '#cbd5e1',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#cbd5e1';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={17} color={isActive ? '#38bdf8' : '#94a3b8'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.12rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#38bdf8' : '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer / User Session */}
        <div
          style={{
            padding: '0.85rem',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#090e17',
          }}
        >
          {isAuthenticated ? (
            <div>
              <div
                onClick={() => handleNavClick('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.45rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '0.45rem',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {user?.username ? user.username.substring(0, 2) : 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.username}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.email}
                  </div>
                </div>
                <ChevronRight size={15} color="#64748b" />
              </div>

              <button
                onClick={logout}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.4rem',
                  fontSize: '0.78rem',
                  gap: '0.35rem',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#cbd5e1',
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                onClick={() => handleNavClick('login')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.48rem', fontSize: '0.82rem' }}
              >
                <LogIn size={14} />
                Sign In
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.48rem',
                  fontSize: '0.82rem',
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  color: '#cbd5e1',
                }}
              >
                <UserPlus size={14} />
                Create Account
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

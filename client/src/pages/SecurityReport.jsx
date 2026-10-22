import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Filter,
  Download,
  Info,
} from 'lucide-react';
import { apiClient } from '../api/client';

export const SecurityReport = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const executeAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient('/audit/run');
      if (res.ok && res.data) {
        setAuditData(res.data);
      } else {
        setError(res.error || 'Failed to execute security audit.');
      }
    } catch (err) {
      setError('Network communication failed during security audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeAudit();
  }, []);

  const categories = [
    'ALL',
    'Security Headers',
    'Cryptography & Passwords',
    'Access Control',
    'Brute Force & DoS',
    'Input Validation',
    'Database Security',
    'Session Security',
    'Network & Cross-Origin',
  ];

  const filteredTests = auditData?.tests
    ? auditData.tests.filter((t) => {
        const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
        const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
        return matchesCategory && matchesStatus;
      })
    : [];

  const handlePrint = () => {
    window.print();
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
            <FileCheck2 color="var(--accent-primary)" size={26} />
            Application Security Testing Report
          </div>
          <div className="page-subtitle">
            Live diagnostic probes executed internally against the running CyberNexus backend.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={executeAudit}
            disabled={loading}
            className="btn btn-primary"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? 'Running Probes...' : 'Re-Run Internal Probes'}
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Download size={14} />
            Export / Print
          </button>
        </div>
      </div>

      {/* Audit Scope Notice */}
      <div className="alert-box alert-info" style={{ marginBottom: '1.5rem' }}>
        <Info size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Operational Diagnostics Methodology: </strong>
          These checks run live API queries and inspection routines on the running Node/Express server and MongoDB instance. Results reflect actual configured server headers, bcrypt pre-save hooks, and authentication guards.
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Executive Scorecard */}
      {auditData && (
        <div className="grid-4" style={{ marginBottom: '1.75rem' }}>
          <div className="nexus-card">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Internal Score
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              {auditData.overallScore}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              OWASP Top 10 Alignment
            </div>
          </div>

          <div className="nexus-card">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Passing Checks
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-success)', marginTop: '0.2rem' }}>
              {auditData.passedCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Verified secure controls
            </div>
          </div>

          <div className="nexus-card">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Warnings / Deficiencies
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: (auditData.failedCount > 0 || auditData.warningCount > 0) ? 'var(--amber-warning)' : 'var(--text-dim)',
                marginTop: '0.2rem',
              }}
            >
              {(auditData.failedCount || 0) + (auditData.warningCount || 0)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {auditData.failedCount || 0} failed, {auditData.warningCount || 0} warning
            </div>
          </div>

          <div className="nexus-card">
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Audit Execution Time
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.45rem' }}>
              {new Date(auditData.timestamp).toLocaleTimeString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Live probe run
            </div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div
        className="nexus-card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <Filter size={14} />
            <span>Category:</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            All ({auditData?.tests.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('PASS')}
            className={`btn ${filterStatus === 'PASS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            Pass ({auditData?.passedCount || 0})
          </button>
          <button
            onClick={() => setFilterStatus('FAIL')}
            className={`btn ${filterStatus === 'FAIL' ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
          >
            Fail ({auditData?.failedCount || 0})
          </button>
        </div>
      </div>

      {/* Test Result Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredTests.map((test) => {
          const borderColor =
            test.status === 'PASS'
              ? 'var(--emerald-success)'
              : test.status === 'FAIL'
              ? 'var(--rose-danger)'
              : 'var(--amber-warning)';

          return (
            <div
              key={test.id}
              className="nexus-card"
              style={{
                borderLeft: `4px solid ${borderColor}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--accent-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {test.id}
                    </span>
                    <span className="badge badge-blue">{test.category}</span>
                    <span
                      className={`badge ${
                        test.severity === 'Critical' ? 'badge-danger' : 'badge-warning'
                      }`}
                    >
                      {test.severity}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {test.testName}
                  </h3>
                </div>

                <div>{getStatusBadge(test.status)}</div>
              </div>

              {/* Behavior Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '0.85rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Expected Security Behavior
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                    {test.expected}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Actual Server Execution Result
                  </div>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: test.status === 'PASS' ? '#065f46' : '#991b1b',
                      lineHeight: 1.45,
                    }}
                  >
                    {test.actual}
                  </div>
                </div>
              </div>

              {/* Recommended Fix */}
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                }}
              >
                <strong style={{ color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                  Recommended Action:
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>{test.fix}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

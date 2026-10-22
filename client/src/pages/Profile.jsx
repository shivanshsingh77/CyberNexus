import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  LogOut,
  Calendar,
  Lock,
  Edit2,
  Check,
  AlertTriangle,
  Server,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const Profile = ({ setActiveTab }) => {
  const { user, logout, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await apiClient('/users/profile');
        if (res.ok && res.data) {
          setProfileData(res.data.data);
          setNewUsername(res.data.data.username);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateMsg({ text: '', type: '' });

    if (!newUsername || newUsername.trim().length < 3) {
      setUpdateMsg({ text: 'Username must be at least 3 characters.', type: 'danger' });
      return;
    }

    const result = await updateProfile(newUsername.trim());
    if (result.success) {
      setEditing(false);
      setProfileData((prev) => ({ ...prev, username: newUsername.trim() }));
      setUpdateMsg({ text: 'Username updated successfully!', type: 'success' });
    } else {
      setUpdateMsg({ text: result.error || 'Failed to update profile.', type: 'danger' });
    }
  };

  const handleLogout = async () => {
    await logout();
    setActiveTab('login');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="page-title">
            <User color="var(--accent-primary)" size={26} />
            User Profile & Session Controls
          </div>
          <div className="page-subtitle">
            Inspect your security identity, active session policies, and cryptographic credentials.
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          <LogOut size={14} />
          Sign Out & Invalidate Session
        </button>
      </div>

      {updateMsg.text && (
        <div className={`alert-box ${updateMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1.5rem' }}>
          {updateMsg.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          <span>{updateMsg.text}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Profile Card */}
        <div className="nexus-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.35rem',
                textTransform: 'uppercase',
              }}
            >
              {profileData?.username ? profileData.username.substring(0, 2) : 'U'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {profileData?.username || user?.username}
                </h2>
                <span className="badge badge-blue">{profileData?.role || 'user'}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.15rem' }}>
                {profileData?.email || user?.email}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleUpdate} style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Update Handle / Username</label>
                <input
                  type="text"
                  className="form-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem' }}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.85rem' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-secondary"
              style={{ padding: '0.38rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', marginBottom: '1.25rem' }}
            >
              <Edit2 size={13} />
              Change Username
            </button>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} /> Account Created
              </span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Fingerprint size={14} /> Last Authenticated
              </span>
              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                {profileData?.lastLogin ? new Date(profileData.lastLogin).toLocaleString() : 'Just now'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Server size={14} /> Database Record ID
              </span>
              <span style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                {profileData?.id || 'Connected'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Session & Cryptography Posture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="nexus-card">
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Lock size={16} color="var(--emerald-success)" />
              Active Session Security Attributes
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Cookie Protection</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--emerald-success)', marginTop: '0.15rem' }}>
                  {profileData?.sessionSecurity || 'HttpOnly=true, SameSite=Lax'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Browser engine strictly blocks document.cookie JavaScript extraction.
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Password Hashing Spec</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                  {profileData?.authMethod || 'Bcrypt (12 Salt Rounds)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Individual unique salt per user; zero plaintext passwords persisted.
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Token Format</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--accent-teal)', marginTop: '0.15rem' }}>
                  JSON Web Token (HMAC-SHA256 Signed)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Cryptographically signed with server-side private secret.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

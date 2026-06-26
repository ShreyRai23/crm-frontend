import { useState } from 'react';
import { User, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();

  // ── Name form state ──────────────────────────────────────────────────────
  const [name, setName]         = useState(user?.name || '');
  const [nameMsg, setNameMsg]   = useState(null); // { type: 'success'|'error', text }
  const [nameSaving, setNameSaving] = useState(false);

  // ── Password form state ──────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [pwMsg, setPwMsg]           = useState(null);
  const [pwSaving, setPwSaving]     = useState(false);

  // Initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Member since — from user._id ObjectId timestamp
  const memberSince = user?._id
    ? new Date(parseInt(user._id.slice(0, 8), 16) * 1000)
        .toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';

  // ── Save display name ────────────────────────────────────────────────────
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setNameMsg({ type: 'error', text: 'Name cannot be empty.' });
    setNameSaving(true);
    setNameMsg(null);
    try {
      const res = await updateMe({ name });
      updateUser(res.user);
      setNameMsg({ type: 'success', text: 'Name updated successfully.' });
    } catch (err) {
      setNameMsg({ type: 'error', text: err.message });
    } finally {
      setNameSaving(false);
    }
  };

  // ── Save password ────────────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (newPw !== confirmPw) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    if (newPw.length < 6)    return setPwMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
    setPwSaving(true);
    setPwMsg(null);
    try {
      await updateMe({ currentPassword: currentPw, newPassword: newPw });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="profile-root animate-fade-up">
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>// 06 Account</div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account details and security</p>
        </div>
      </div>

      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-banner" />
        <div className="profile-hero-body">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-avatar-online" title="Online" />
          </div>

          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>

          <span className="profile-role-badge">
            <Shield size={10} />
            {user?.role || 'member'}
          </span>

          {/* Meta stats */}
          <div className="profile-meta-row">
            <div className="profile-meta-item">
              <div className="profile-meta-value">{memberSince}</div>
              <div className="profile-meta-label">Member Since</div>
            </div>
            <div className="profile-meta-divider" />
            <div className="profile-meta-item">
              <div className="profile-meta-value" style={{ color: 'var(--orange)' }}>
                {user?.role === 'admin' ? 'Admin' : 'Member'}
              </div>
              <div className="profile-meta-label">Access Level</div>
            </div>
            <div className="profile-meta-divider" />
            <div className="profile-meta-item">
              <div className="profile-meta-value" style={{ color: 'var(--success)' }}>Active</div>
              <div className="profile-meta-label">Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Display Name ─────────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div className="profile-section-icon">
            <User size={15} />
          </div>
          <div>
            <div className="profile-section-title">Display Name</div>
            <div className="profile-section-sub">How your name appears across the platform</div>
          </div>
        </div>

        {nameMsg && (
          <div className={`profile-banner ${nameMsg.type}`}>
            {nameMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveName}>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              className="profile-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="profile-field">
            <label className="profile-label">Email Address</label>
            <input
              className="profile-input"
              type="email"
              value={user?.email || ''}
              disabled
              title="Email cannot be changed"
            />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
              Email address is permanent and cannot be changed.
            </div>
          </div>

          <button
            type="submit"
            className="profile-save-btn"
            disabled={nameSaving || name.trim() === user?.name}
          >
            {nameSaving ? (
              <>
                <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 size={13} />
                Save Name
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Change Password ───────────────────────────────────────────────── */}
      <div className="profile-section">
        <div className="profile-section-header">
          <div className="profile-section-icon">
            <Lock size={15} />
          </div>
          <div>
            <div className="profile-section-title">Change Password</div>
            <div className="profile-section-sub">Use a strong password of at least 6 characters</div>
          </div>
        </div>

        {pwMsg && (
          <div className={`profile-banner ${pwMsg.type}`}>
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handleSavePassword}>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-current-pw">Current Password</label>
            <input
              id="profile-current-pw"
              className="profile-input"
              type="password"
              placeholder="••••••••"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
            />
          </div>

          <div className="profile-field-row">
            <div className="profile-field">
              <label className="profile-label" htmlFor="profile-new-pw">New Password</label>
              <input
                id="profile-new-pw"
                className="profile-input"
                type="password"
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
              />
            </div>
            <div className="profile-field">
              <label className="profile-label" htmlFor="profile-confirm-pw">Confirm New Password</label>
              <input
                id="profile-confirm-pw"
                className="profile-input"
                type="password"
                placeholder="••••••••"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="profile-save-btn"
            disabled={pwSaving || !currentPw || !newPw || !confirmPw}
          >
            {pwSaving ? (
              <>
                <div className="spinner" style={{ width: 13, height: 13, borderWidth: 2 }} />
                Updating…
              </>
            ) : (
              <>
                <Lock size={13} />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

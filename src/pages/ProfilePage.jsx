import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith('data:')
      ? user.avatar
      : `http://localhost:5000${user.avatar}`
    : null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return toast.error('Username required');
    setSavingProfile(true);
    try {
      const { data } = await userAPI.updateProfile({ username });
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max file size: 5MB');
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await userAPI.uploadAvatar(formData);
      updateUser({ avatar: data.avatar });
      toast.success('Avatar uplinked ✓');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields required');
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Min 6 characters');
    setSavingPw(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Passphrase updated');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="mb-2">
        <h1 className="font-orbitron text-lg font-bold neon-text tracking-widest">◉ USER PROFILE</h1>
        <p className="text-md text-slate-500 font-orbitron tracking-wider mt-0.5">IDENTITY MANAGEMENT · NODE CONFIGURATION</p>
      </div>

      {/* Avatar & Identity */}
      <div className="glass-panel p-6">
        <h2 className="font-orbitron text-md text-slate-400 tracking-widest mb-5">IDENTITY NODE</h2>
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-xl border-2 border-cyan-400/40 overflow-hidden bg-cyan-400/5 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-orbitron text-3xl font-bold neon-text">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full border border-cyan-400/60 bg-slate-900 text-cyan-400 flex items-center justify-center hover:bg-cyan-400/10 transition-all text-md"
            >
              {uploadingAvatar ? (
                <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
              ) : '✎'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div>
            <p className="font-orbitron text-lg font-bold text-slate-200">{user?.username}</p>
            <p className="text-sm text-slate-500 mono">{user?.email}</p>
            <p className="text-md text-slate-600 font-orbitron mt-1">
              ONLINE SINCE {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy').toUpperCase() : '—'}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">HANDLE / USERNAME</label>
            <input
              className="input-neon"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">EMAIL (read-only)</label>
            <input className="input-neon opacity-50 cursor-not-allowed" value={user?.email || ''} readOnly />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 rounded font-orbitron text-md font-bold tracking-wider text-black transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0066ff, #00f5ff)', boxShadow: '0 0 20px rgba(0,102,255,0.3)' }}
          >
            {savingProfile ? 'SAVING...' : 'UPDATE PROFILE'}
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="glass-panel p-6">
        <h2 className="font-orbitron text-md text-slate-400 tracking-widest mb-5">PASSPHRASE ROTATION</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">CURRENT PASSPHRASE</label>
            <input
              type="password"
              className="input-neon"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">NEW PASSPHRASE</label>
            <input
              type="password"
              className="input-neon"
              placeholder="min 6 characters"
              value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">CONFIRM NEW PASSPHRASE</label>
            <input
              type="password"
              className="input-neon"
              placeholder="repeat new passphrase"
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="px-5 py-2.5 rounded font-orbitron text-md font-bold tracking-wider transition-all disabled:opacity-50 border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
          >
            {savingPw ? 'ROTATING...' : '🔑 ROTATE PASSPHRASE'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="glass-panel p-6 border border-pink-500/20">
        <h2 className="font-orbitron text-md text-pink-400 tracking-widest mb-4">DANGER ZONE</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-orbitron">DISCONNECT SESSION</p>
            <p className="text-md text-slate-600 mt-0.5">Terminate all active connections</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded border border-pink-500/50 text-pink-400 font-orbitron text-md tracking-wider hover:bg-pink-500/10 transition-all"
          >
            ⏻ LOGOUT
          </button>
        </div>
      </div>
    </motion.div>
  );
}

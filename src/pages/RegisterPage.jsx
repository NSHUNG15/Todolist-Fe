import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('All fields required');
    if (form.password !== form.confirm) return toast.error('Passphrases do not match');
    if (form.password.length < 6) return toast.error('Passphrase must be ≥ 6 chars');

    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Node initialized. Welcome to the grid.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['', '#ff0080', '#ffdd00', '#00ff88'];
  const strengthLabels = ['', 'WEAK', 'MEDIUM', 'STRONG'];

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline"></div>
      <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-[120px] opacity-8" style={{ background: 'var(--neon-purple, #7c3aed)' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl border border-cyan-400/40 bg-cyan-400/5 mb-4 pulse-neon">
            <span className="font-orbitron text-2xl font-bold neon-text">W3</span>
          </div>
          <h1 className="font-orbitron text-xl font-bold neon-text tracking-widest mb-1">TASKCHAIN</h1>
          <p className="text-slate-500 text-sm font-orbitron tracking-wider">NODE INITIALIZATION</p>
        </div>

        <div className="glass-panel p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="font-orbitron text-md text-green-400 tracking-widest">CREATING NEW IDENTITY</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">HANDLE / USERNAME</label>
              <input className="input-neon" placeholder="CyberNomad_01" value={form.username} onChange={set('username')} />
            </div>

            <div>
              <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">EMAIL NODE</label>
              <input type="email" className="input-neon" placeholder="user@matrix.io" value={form.email} onChange={set('email')} />
            </div>

            <div>
              <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">PASSPHRASE</label>
              <input type="password" className="input-neon" placeholder="min 6 characters" value={form.password} onChange={set('password')} />
              {form.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: strength >= i ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }}></div>
                    ))}
                  </div>
                  <span className="text-md font-orbitron" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">CONFIRM PASSPHRASE</label>
              <input type="password" className="input-neon" placeholder="repeat passphrase" value={form.confirm} onChange={set('confirm')} />
              {form.confirm && form.password !== form.confirm && (
                <p className="text-md text-pink-400 font-orbitron mt-1">⚠ MISMATCH DETECTED</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-orbitron text-sm font-bold tracking-widest text-black transition-all duration-200 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00ff88, #0066ff)', boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  INITIALIZING...
                </span>
              ) : 'INITIALIZE NODE →'}
            </button>
          </form>

          <div className="neon-divider"></div>

          <p className="text-center text-sm text-slate-500">
            Already online?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-orbitron text-md tracking-wider">
              LOGINádasd
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

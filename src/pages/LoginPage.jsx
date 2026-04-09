import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('All fields required');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Access granted. Welcome back.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="scanline"></div>

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10" style={{ background: 'var(--neon-cyan)' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-8" style={{ background: 'var(--neon-blue)' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-xl border border-cyan-400/40 bg-cyan-400/5 mb-4 pulse-neon"
          >
            <span className="font-orbitron text-2xl font-bold neon-text">W3</span>
          </motion.div>
          <h1 className="font-orbitron text-xl font-bold neon-text tracking-widest mb-1">TASKCHAIN</h1>
          <p className="text-slate-500 text-sm font-orbitron tracking-wider">NEURAL INTERFACE v2.0</p>
        </div>

        {/* Form panel */}
        <div className="glass-panel p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="font-orbitron text-md text-cyan-400 tracking-widest">IDENTITY VERIFICATION</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">EMAIL</label>
              <input
                type="email"
                className="input-neon"
                placeholder="user@matrix.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">PASSWORD</label>
              <input
                type="password"
                className="input-neon"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-orbitron text-sm font-bold tracking-widest text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading ? 'rgba(0,245,255,0.5)' : 'linear-gradient(135deg, #0066ff, #00f5ff)', boxShadow: loading ? 'none' : '0 0 30px rgba(0,102,255,0.4)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  CONNECTING...
                </span>
              ) : 'LOGIN →'}as
            </button>
          </form>

          <div className="neon-divider"></div>

          <p className="text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-orbitron text-md tracking-wider transition-colors">
              INITIALIZE NEW NODE
            </Link>
          </p>
        </div>

        <p className="text-center text-md text-slate-700 font-orbitron mt-4 tracking-widest">
          SECURED BY JWT · BCRYPT ENCRYPTED
        </p>
      </motion.div>
    </div>
  );
}

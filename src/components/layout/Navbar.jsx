import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { path: '/dashboard', label: 'DASHBOARD', icon: '◈' },
  { path: '/calendar', label: 'CALENDAR', icon: '◷' },
  { path: '/notifications', label: 'ALERTS', icon: '🔔' },
  { path: '/notes', label: 'NOTES', icon: '◎' },
  { path: '/profile', label: 'PROFILE', icon: '◉' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const avatarSrc = user?.avatar
    ? user.avatar.startsWith('data:')
      ? user.avatar
      : `http://localhost:5000${user.avatar}`
    : null;

  return (
    <nav className=" top-0 left-0 right-0 z-50 glass-panel rounded-none border-x-0 border-t-0">
      <div className="h-20 mx-auto px-4 flex items-center justify-center gap-x-[10rem]">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-15 h-10 rounded border border-cyan-400 flex items-center justify-center pulse-neon">
            <span className="text-cyan-400 text-xl font-orbitron font-bold">W3</span>
          </div>
          <span className="font-orbitron text-sm font-bold neon-text tracking-widest hidden sm:block">
            TASKCHAIN
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-md font-orbitron tracking-wider transition-all duration-200
                ${location.pathname === link.path
                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/5'}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-md font-orbitron text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-green-400">{user?.username?.toUpperCase()}</span>
          </div>

          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" className="w-8 h-8 rounded-full border border-cyan-400/40 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full border border-cyan-400/40 flex items-center justify-center bg-cyan-400/10">
              <span className="text-cyan-400 text-md font-orbitron">{user?.username?.[0]?.toUpperCase()}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded border border-pink-500/40 text-pink-400 text-md font-orbitron tracking-wider hover:bg-pink-500/10 transition-all"
          >
            <span>⏻</span> EXIT
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-cyan-400 w-8 h-8 flex flex-col items-center justify-center gap-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={`block w-5 h-0.5 bg-cyan-400 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-cyan-400 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-5 h-0.5 bg-cyan-400 transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-cyan-400/10 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-md font-orbitron tracking-wider transition-all
                    ${location.pathname === link.path ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-cyan-400'}`}
                >
                  <span>{link.icon}</span><span>{link.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded text-md font-orbitron tracking-wider text-pink-400 hover:bg-pink-500/10 mt-1"
              >
                <span>⏻</span> DISCONNECT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

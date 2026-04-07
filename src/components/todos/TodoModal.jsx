import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodos } from '../../context/TodoContext';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'in-progress', 'completed'];

export default function TodoModal({ isOpen, onClose, date, todo = null }) {
  const { createTodo, updateTodo } = useTodos();
  const [form, setForm] = useState({ title: '', description: '', date: date || '', status: 'pending', priority: 'medium', tags: '' });
  const [loading, setLoading] = useState(false);
  const isEditing = !!todo;

  useEffect(() => {
    if (todo) {
      setForm({ ...todo, tags: todo.tags?.join(', ') || '' });
    } else {
      setForm({ title: '', description: '', date: date || '', status: 'pending', priority: 'medium', tags: '' });
    }
  }, [todo, date, isOpen]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title required');
    if (!form.date) return toast.error('Date required');
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (isEditing) await updateTodo(todo._id, payload);
      else await createTodo(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-panel w-full max-w-lg relative z-10 p-6"
            style={{ borderColor: 'rgba(0,245,255,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-orbitron text-sm font-bold neon-text tracking-widest">
                  {isEditing ? '◈ EDIT TASK' : '◈ NEW TASK'}
                </h2>
                <p className="text-md text-slate-500 font-orbitron mt-0.5">{form.date || date}</p>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-cyan-400 text-xl transition-colors w-8 h-8 flex items-center justify-center">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">TASK TITLE *</label>
                <input className="input-neon" placeholder="Enter mission objective..." value={form.title} onChange={set('title')} autoFocus />
              </div>

              <div>
                <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">DESCRIPTION</label>
                <textarea
                  className="input-neon resize-none"
                  rows={3}
                  placeholder="Additional details..."
                  value={form.description}
                  onChange={set('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">DATE</label>
                  <input type="date" className="input-neon" value={form.date} onChange={set('date')} />
                </div>
                <div>
                  <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">PRIORITY</label>
                  <select className="input-neon" value={form.priority} onChange={set('priority')}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">STATUS</label>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`flex-1 py-1.5 rounded text-md font-orbitron tracking-wider transition-all border ${
                        form.status === s
                          ? s === 'completed' ? 'border-green-400 bg-green-400/15 text-green-400'
                            : s === 'in-progress' ? 'border-blue-400 bg-blue-400/15 text-blue-400'
                            : 'border-yellow-400 bg-yellow-400/15 text-yellow-400'
                          : 'border-slate-700 text-slate-500 hover:border-slate-500'
                      }`}
                    >
                      {s === 'in-progress' ? 'IN PROG' : s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">TAGS (comma separated)</label>
                <input className="input-neon" placeholder="work, urgent, dev..." value={form.tags} onChange={set('tags')} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded border border-slate-700 text-slate-400 font-orbitron text-md tracking-wider hover:border-slate-500 transition-all">
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded font-orbitron text-md font-bold tracking-wider text-black transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0066ff, #00f5ff)', boxShadow: '0 0 20px rgba(0,102,255,0.3)' }}
                >
                  {loading ? '...' : isEditing ? 'UPDATE ◈' : 'DEPLOY ⚡'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

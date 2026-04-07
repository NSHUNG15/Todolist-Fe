import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../../context/NoteContext';
import toast from 'react-hot-toast';

const NOTE_COLORS = ['#00f5ff', '#ff0080', '#00ff88', '#ffdd00', '#7c3aed', '#ff6600'];

export default function NoteModal({ isOpen, onClose, note = null, defaultDate = null }) {
  const { createNote, updateNote } = useNotes();
  const [form, setForm] = useState({ title: '', content: '', date: defaultDate || '', type: 'general', color: '#00f5ff', pinned: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) setForm({ ...note, date: note.date || '' });
    else setForm({ title: '', content: '', date: defaultDate || '', type: 'general', color: '#00f5ff', pinned: false });
  }, [note, defaultDate, isOpen]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim()) return toast.error('Content required');
    setLoading(true);
    try {
      const payload = { ...form, date: form.date || null, type: form.date ? 'daily' : 'general' };
      if (note) await updateNote(note._id, payload);
      else await createNote(payload);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass-panel w-full max-w-lg relative z-10 p-6"
            style={{ borderColor: `${form.color}40` }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: form.color }}>
                {note ? '◎ EDIT NOTE' : '◎ NEW NOTE'}
              </h2>
              <button onClick={onClose} className="text-slate-500 hover:text-white text-xl transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">TITLE</label>
                <input className="input-neon" placeholder="Note title..." value={form.title} onChange={set('title')} />
              </div>

              <div>
                <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">CONTENT *</label>
                <textarea
                  className="input-neon resize-none"
                  rows={6}
                  placeholder="Write your thoughts, ideas, or observations here..."
                  value={form.content}
                  onChange={set('content')}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">DATE (optional)</label>
                  <input type="date" className="input-neon" value={form.date} onChange={set('date')} />
                </div>
                <div>
                  <label className="block text-md font-orbitron text-slate-400 tracking-wider mb-1.5">COLOR TAG</label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {NOTE_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                        className="w-6 h-6 rounded-full transition-all"
                        style={{ background: c, boxShadow: form.color === c ? `0 0 10px ${c}` : 'none', transform: form.color === c ? 'scale(1.2)' : 'scale(1)' }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(p => ({ ...p, pinned: !p.pinned }))}
                  className={`flex items-center gap-2 text-md font-orbitron tracking-wider px-3 py-1.5 rounded border transition-all ${
                    form.pinned ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}>
                  📌 {form.pinned ? 'PINNED' : 'PIN NOTE'}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded border border-slate-700 text-slate-400 font-orbitron text-md tracking-wider hover:border-slate-500 transition-all">
                  CANCEL
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded font-orbitron text-md font-bold tracking-wider text-black transition-all disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${form.color}cc, ${form.color})`, boxShadow: `0 0 20px ${form.color}40` }}>
                  {loading ? '...' : note ? 'UPDATE ◎' : 'SAVE NOTE ◎'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

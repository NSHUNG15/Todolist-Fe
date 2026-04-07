import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNotes } from '../../context/NoteContext';
import { format } from 'date-fns';

export default function NoteCard({ note, onEdit }) {
  const { deleteNote, updateNote } = useNotes();
  const [confirming, setConfirming] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 3000); return; }
    await deleteNote(note._id);
  };

  const togglePin = () => updateNote(note._id, { pinned: !note.pinned });

  const preview = note.content.slice(0, 150);
  const hasMore = note.content.length > 150;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 group relative"
      style={{ borderLeftColor: note.color, borderLeftWidth: '3px' }}
    >
      {/* Pin badge */}
      {note.pinned && (
        <div className="absolute top-2 right-2 text-yellow-400 text-md">📌</div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-orbitron text-md font-bold text-slate-200 tracking-wider truncate flex-1" style={{ color: note.color }}>
          {note.title || 'UNTITLED NOTE'}
        </h3>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap break-words">
        {expanded ? note.content : preview}
        {hasMore && !expanded && '...'}
      </p>

      {hasMore && (
        <button onClick={() => setExpanded(!expanded)}
          className="text-md font-orbitron mt-1 transition-colors"
          style={{ color: note.color }}>
          {expanded ? '▲ COLLAPSE' : '▼ EXPAND'}
        </button>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-2 text-md text-slate-600 font-orbitron">
          {note.date && <span>📅 {note.date}</span>}
          <span className={`badge ${note.type === 'daily' ? 'badge-in-progress' : 'badge-pending'}`}>
            {note.type.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={togglePin} className="text-md px-1.5 py-0.5 rounded text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all font-orbitron">
            {note.pinned ? 'UNPIN' : 'PIN'}
          </button>
          <button onClick={() => onEdit(note)} className="text-md px-1.5 py-0.5 rounded text-cyan-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all font-orbitron">
            EDIT
          </button>
          <button onClick={handleDelete}
            className={`text-md px-1.5 py-0.5 rounded transition-all font-orbitron ${confirming ? 'text-pink-400 bg-pink-400/15 animate-pulse' : 'text-slate-500 hover:text-pink-400 hover:bg-pink-400/10'}`}>
            {confirming ? 'SURE?' : 'DEL'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

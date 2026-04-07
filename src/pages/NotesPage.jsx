import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNotes } from '../context/NoteContext';
import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';

export default function NotesPage() {
  const { notes, loading, fetchNotes, deleteNote } = useNotes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    fetchNotes({ search, type: filterType });
  }, [search, filterType]);

  const openEdit = (note) => { setEditNote(note); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditNote(null); fetchNotes(); };

  const pinned = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className='w-7xl'>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-orbitron text-lg font-bold neon-text tracking-widest">◎ ENCRYPTED NOTES</h1>
          <p className="text-md text-slate-500 font-orbitron tracking-wider mt-0.5">
            {notes.length} NOTES · {pinned.length} PINNED
          </p>
        </div>
        <button
          onClick={() => { setEditNote(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded border border-cyan-400/40 text-cyan-400 font-orbitron text-md tracking-wider hover:bg-cyan-400/10 transition-all"
        >
          + NEW NOTE
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="input-neon flex-1 min-w-[200px] text-sm py-2"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {[
              { val: '', label: 'ALL' },
              { val: 'general', label: 'GENERAL' },
              { val: 'daily', label: 'DAILY' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilterType(val)}
                className={`px-3 py-1.5 rounded text-md font-orbitron tracking-wider border transition-all ${
                  filterType === val
                    ? 'border-cyan-400/50 text-cyan-400 bg-cyan-400/10'
                    : 'border-slate-700 text-slate-500 hover:border-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex rounded overflow-hidden border border-slate-700">
            {['grid', 'list'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-md font-orbitron transition-all ${view === v ? 'bg-cyan-400/15 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                {v === 'grid' ? '▦' : '☰'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-lg"></div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-full border border-slate-700 flex items-center justify-center text-slate-600 text-3xl">◎</div>
          <p className="font-orbitron text-sm text-slate-600 tracking-wider">NO NOTES IN VAULT</p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-md text-cyan-500 hover:text-cyan-400 font-orbitron tracking-wider border border-cyan-500/30 hover:border-cyan-500/60 px-4 py-2 rounded transition-all"
          >
            + ENCRYPT YOUR FIRST NOTE
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-sm">📌</span>
                <span className="font-orbitron text-md text-slate-500 tracking-widest">PINNED NOTES</span>
              </div>
              <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {pinned.map(note => (
                  <NoteCard key={note._id} note={note} onEdit={openEdit} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-orbitron text-md text-slate-500 tracking-widest">ALL NOTES</span>
                </div>
              )}
              <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {unpinned.map(note => (
                  <NoteCard key={note._id} note={note} onEdit={openEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <NoteModal isOpen={modalOpen} onClose={closeModal} note={editNote} />
    </motion.div>
  );
}

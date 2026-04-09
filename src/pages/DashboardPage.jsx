import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTodos } from '../context/TodoContext';
import { useNotes } from '../context/NoteContext';
import TodoModal from '../components/todos/TodoModal';
import TodoCard from '../components/todos/TodoCard';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

const today = format(new Date(), 'yyyy-MM-dd');

const StatCard = ({ label, value, color, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-4 w-7x"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="font-orbitron text-2xl font-bold" style={{ color }}>{value}</span>
    </div>
    <p className="font-orbitron text-md text-slate-500 tracking-wider">{label}</p>
    <div className="mt-2 h-0.5 rounded-full" style={{ background: `${color}30` }}>
      <div className="h-full rounded-full w-2/3" style={{ background: color }}></div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { todos, fetchTodos, reorderTodos } = useTodos();
  const { notes, fetchNotes } = useNotes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    fetchTodos({ search, status: filterStatus, priority: filterPriority });
  }, [search, filterStatus, filterPriority]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const todayTodos = todos.filter(t => t.date === today);
  const completedToday = todayTodos.filter(t => t.status === 'completed').length;
  const pendingAll = todos.filter(t => t.status === 'pending').length;
  const inProgressAll = todos.filter(t => t.status === 'in-progress').length;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = todos.findIndex(t => t._id === active.id);
    const newIdx = todos.findIndex(t => t._id === over.id);
    const reordered = arrayMove(todos, oldIdx, newIdx);
    reorderTodos(today, reordered);
  };

  const openEdit = (todo) => { setEditTodo(todo); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTodo(null); fetchTodos(); };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  return (
    <div className="space-y-6 w-7xl">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 opacity-5"
          style={{ background: 'radial-gradient(circle at right, var(--neon-cyan), transparent)' }}></div>
        <div className="relative z-10">
          <p className="font-orbitron text-md text-slate-500 tracking-widest mb-1">{greeting}, OPERATIVE</p>
          <h1 className="font-orbitron text-2xl font-bold neon-text tracking-wider">
            {user?.username?.toUpperCase()}
          </h1>
          <p className="text-slate-400 text-sm mt-1 mono">{format(now, 'EEEE, MMMM d yyyy · HH:mm')}</p>
        </div>
        <div className="absolute top-4 right-4 text-md font-orbitron text-slate-700 mono hidden sm:block">
          {format(now, 'yyyy-MM-dd')}
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="TODAY'S TASKS" value={todayTodos.length} color="var(--neon-cyan)" icon="◈" delay={0.1} />
        <StatCard label="COMPLETED" value={completedToday} color="var(--neon-green)" icon="✓" delay={0.15} />
        <StatCard label="IN PROGRESS" value={inProgressAll} color="#66aaff" icon="◑" delay={0.2} />
        <StatCard label="PENDING" value={pendingAll} color="var(--neon-yellow)" icon="◷" delay={0.25} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task List */}
        <div className="lg:col-span-2 glass-panel p-5">
          {/* Header + Search */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-sm font-bold neon-text tracking-widest">◈ TASK QUEUE</h2>
            <button
              onClick={() => { setEditTodo(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyan-400/40 text-cyan-400 font-orbitron text-md tracking-wider hover:bg-cyan-400/10 transition-all"
            >
              + DEPLOY
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              className="input-neon flex-1 min-w-[150px] text-sm py-1.5"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="flex input-neon w-auto text-sm py-1.5" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">ALL STATUS</option>
              <option value="pending">PENDING</option>
              <option value="in-progress">IN PROGRESS</option>
              <option value="completed">COMPLETED</option>
            </select>
            <select className="input-neon w-auto text-sm py-1.5" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">ALL PRIORITY</option>
              <option value="low">LOW</option>
              <option value="medium">MEDIUM</option>
              <option value="high">HIGH</option>
            </select>
          </div>

          {/* Today label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="font-orbitron text-md text-slate-500 tracking-wider">
              {search || filterStatus || filterPriority ? 'FILTERED RESULTS' : "TODAY'S MISSIONS"} — {todos.length} TASKS
            </span>
          </div>

          {/* Task List */}
          <div className="overflow-y-auto max-h-[480px] pr-1">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-slate-600 text-2xl">◈</div>
                <p className="font-orbitron text-md text-slate-600 tracking-wider">NO TASKS IN QUEUE</p>
                <button onClick={() => setModalOpen(true)} className="text-md text-cyan-500 hover:text-cyan-400 font-orbitron tracking-wider">
                  + DEPLOY FIRST TASK
                </button>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={todos.map(t => t._id)} strategy={verticalListSortingStrategy}>
                  {todos.map(todo => (
                    <TodoCard key={todo._id} todo={todo} onEdit={openEdit} />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* Right Side Panel */}
        <div className="space-y-4">
          {/* Quick Note */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-orbitron text-md font-bold text-slate-300 tracking-widest">◎ RECENT NOTES</h3>
              <Link to="/notes" className="text-md text-cyan-500 font-orbitron hover:text-cyan-400 tracking-wider">VIEW ALL →</Link>
            </div>
            {notes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-md text-slate-600 font-orbitron">NO NOTES ENCRYPTED</p>
                <Link to="/notes" className="text-md text-cyan-500 font-orbitron mt-2 block hover:text-cyan-400">+ CREATE NOTE</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.slice(0, 3).map(note => (
                  <div key={note._id} className="p-3 rounded border border-slate-800 hover:border-slate-700 transition-all"
                    style={{ borderLeftColor: note.color, borderLeftWidth: '3px' }}>
                    <p className="font-orbitron text-md font-bold mb-1" style={{ color: note.color }}>{note.title || 'UNTITLED'}</p>
                    <p className="text-md text-slate-500 line-clamp-2">{note.content}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-md text-slate-500 line-clamp-1">{note.date}</p>
                      <p className="text-md text-slate-500 line-clamp-2">{note.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Ring */}
          <div className="glass-panel p-4">
            <h3 className="font-orbitron text-md font-bold text-slate-300 tracking-widest mb-4">TODAY'S PROGRESS</h3>
            {todayTodos.length === 0 ? (
              <p className="text-md text-slate-600 font-orbitron text-center py-4">NO TASKS TODAY</p>
            ) : (
              <>
                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,245,255,0.1)" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#prog)" strokeWidth="2.5"
                        strokeDasharray={`${todayTodos.length > 0 ? (completedToday / todayTodos.length * 100) : 0} 100`}
                        strokeLinecap="round" />
                      <defs>
                        <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#0066ff" />
                          <stop offset="100%" stopColor="#00f5ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-orbitron text-lg font-bold neon-text">
                        {todayTodos.length > 0 ? Math.round(completedToday / todayTodos.length * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'COMPLETED', val: completedToday, color: 'var(--neon-green)' },
                    { label: 'IN PROGRESS', val: todayTodos.filter(t => t.status === 'in-progress').length, color: '#66aaff' },
                    { label: 'PENDING', val: todayTodos.filter(t => t.status === 'pending').length, color: 'var(--neon-yellow)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex justify-between text-md font-orbitron">
                      <span className="text-slate-500">{label}</span>
                      <span style={{ color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="glass-panel p-4">
            <h3 className="font-orbitron text-md font-bold text-slate-300 tracking-widest mb-3">QUICK ACTIONS</h3>
            <div className="space-y-2">
              {[
                { to: '/calendar', label: 'OPEN CALENDAR', icon: '◷', color: 'var(--neon-cyan)' },
                { to: '/notifications', label: 'CHECK ALERTS', icon: '🔔', color: 'var(--neon-yellow)' },
                { to: '/notes', label: 'VIEW ALL NOTES', icon: '◎', color: 'var(--neon-green)' },
                { to: '/profile', label: 'EDIT PROFILE', icon: '◉', color: '#a78bfa' },
              ].map(({ to, label, icon, color }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-2 px-3 py-2 rounded border border-slate-800 hover:border-slate-700 text-md font-orbitron text-slate-400 hover:text-white transition-all group"
                >
                  <span style={{ color }}>{icon}</span>
                  <span className="tracking-wider">{label}</span>
                  <span className="ml-auto text-slate-700 group-hover:text-slate-500 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TodoModal isOpen={modalOpen} onClose={closeModal} date={today} todo={editTodo} />
    </div>
  );
}

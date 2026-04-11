import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTodos } from '../context/TodoContext';
import { useNotes } from '../context/NoteContext';

export default function NotificationsPage() {
  const { todos, fetchTodos } = useTodos();
  const { notes, fetchNotes } = useNotes();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchTodos();
    fetchNotes();
  }, [fetchTodos, fetchNotes]);

  const overdueTodos = todos.filter(todo => todo.date < today && todo.status !== 'completed');
  const dueTodayTodos = todos.filter(todo => todo.date === today && todo.status !== 'completed');
  const upcomingTodos = todos.filter(todo => todo.date > today && todo.status !== 'completed').slice(0, 5);
  const recentNotes = notes.slice(0, 4);

  const notifications = [
    { label: 'Overdue Alerts', value: overdueTodos.length, description: 'Tasks past their deadline', color: 'var(--neon-pink)' },
    { label: 'Due Today', value: dueTodayTodos.length, description: 'Tasks requiring attention now', color: 'var(--neon-yellow)' },
    { label: 'Upcoming', value: upcomingTodos.length, description: 'Tasks arriving soon', color: 'var(--neon-cyan)' },
    { label: 'Notes Vault', value: recentNotes.length, description: 'Recent secure notes', color: 'var(--neon-green)' },
  ];

  return (
    <div className="space-y-6 w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 opacity-5"
          style={{ background: 'radial-gradient(circle at right, var(--neon-teal), transparent)' }}></div>
        <h1 className="font-orbitron text-2xl font-bold neon-text tracking-wider mb-2">SYSTEM ALERTS</h1>
        <p className="text-slate-400 text-sm tracking-wider">Monitor overdue missions, today&apos;s milestones, and the latest vault logs.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {notifications.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-orbitron text-sm text-slate-500 tracking-widest">{item.label}</h2>
                <p className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center" style={{ background: `${item.color}20` }}>
                <span className="text-xl">•</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm">{item.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-md font-bold neon-text tracking-widest">URGENT TASKS</h2>
            <span className="text-slate-500 text-sm">{overdueTodos.length + dueTodayTodos.length} active alerts</span>
          </div>
          {overdueTodos.length + dueTodayTodos.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-orbitron tracking-widest">
              NO ACTIVE ALERTS
            </div>
          ) : (
            <div className="space-y-3">
              {overdueTodos.map(todo => (
                <div key={todo._id} className="p-4 rounded border border-rose-500/20 bg-rose-500/5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-orbitron text-sm font-bold text-rose-200">OVERDUE</span>
                    <span className="text-xs text-slate-400">{todo.date}{todo.time ? ` • ${todo.time}` : ''}</span>
                  </div>
                  <p className="font-orbitron text-md text-slate-100">{todo.title}</p>
                  <p className="text-slate-500 text-sm">{todo.description || 'No description available'}</p>
                </div>
              ))}
              {dueTodayTodos.map(todo => (
                <div key={todo._id} className="p-4 rounded border border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-orbitron text-sm font-bold text-yellow-200">DUE TODAY</span>
                    <span className="text-xs text-slate-400">{todo.date}{todo.time ? ` • ${todo.time}` : ''}</span>
                  </div>
                  <p className="font-orbitron text-md text-slate-100">{todo.title}</p>
                  <p className="text-slate-500 text-sm">{todo.description || 'No description available'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron text-md font-bold neon-text tracking-widest">RECENT NOTES</h2>
            <Link to="/notes" className="text-cyan-400 text-sm hover:text-cyan-300">VIEW ALL</Link>
          </div>
          {recentNotes.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-orbitron tracking-widest">
              NO RECENT ENTRIES
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map(note => (
                <div key={note._id} className="p-4 rounded border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="flex justify-between mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-orbitron text-md font-bold text-slate-100 mb-1">{note.title || 'UNTITLED'}</p>
                      <p className="text-slate-500 text-sm line-clamp-2">{note.content}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-md text-slate-500 line-clamp-1">{note.date}</p>
                      <p className="text-md text-slate-500 line-clamp-2">{note.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-md font-bold neon-text tracking-widest">NEXT STEPS</h2>
          <Link to="/dashboard" className="text-cyan-400 text-sm hover:text-cyan-300">BACK TO DASHBOARD</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded border border-slate-800 bg-slate-950/40">
            <h3 className="font-orbitron text-sm text-slate-300 tracking-widest mb-2">REVIEW OVERDUE TASKS</h3>
            <p className="text-slate-500 text-sm">Mark overdue missions as completed or reschedule them to prevent backlog.</p>
          </div>
          <div className="p-4 rounded border border-slate-800 bg-slate-950/40">
            <h3 className="font-orbitron text-sm text-slate-300 tracking-widest mb-2">CHECK TODAY&apos;S SCHEDULE</h3>
            <p className="text-slate-500 text-sm">Use the calendar and task queue to keep your workflow aligned with mission priority.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

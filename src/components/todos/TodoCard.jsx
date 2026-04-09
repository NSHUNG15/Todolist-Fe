import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTodos } from '../../context/TodoContext';

const priorityDot = { low: '#00ff88', medium: '#ffdd00', high: '#ff0080' };

export default function TodoCard({ todo, onEdit }) {
  const { deleteTodo, updateTodo } = useTodos();
  const [confirming, setConfirming] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const cycleStatus = async () => {
    const statuses = ['pending', 'in-progress', 'completed'];
    const next = statuses[(statuses.indexOf(todo.status) + 1) % statuses.length];
    await updateTodo(todo._id, { status: next });
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 3000); return; }
    await deleteTodo(todo._id);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`glass-card p-3 mb-2 group relative ${isDragging ? 'ring-1 ring-cyan-400/50' : ''}`}>
        {/* Priority indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg" style={{ background: priorityDot[todo.priority] }}></div>

        <div className="flex items-start gap-2 pl-2">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 text-slate-700 hover:text-cyan-400 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0"
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="2.5" cy="2.5" r="1.5"/><circle cx="7.5" cy="2.5" r="1.5"/>
              <circle cx="2.5" cy="7" r="1.5"/><circle cx="7.5" cy="7" r="1.5"/>
              <circle cx="2.5" cy="11.5" r="1.5"/><circle cx="7.5" cy="11.5" r="1.5"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              {/* Status toggle */}
              <button
                onClick={cycleStatus}
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-sm border transition-all"
                style={{
                  borderColor: todo.status === 'completed' ? '#00ff88' : todo.status === 'in-progress' ? '#66aaff' : 'rgba(0,245,255,0.3)',
                  background: todo.status === 'completed' ? 'rgba(0,255,136,0.2)' : 'transparent'
                }}
                title="Click to cycle status"
              >
                {todo.status === 'completed' && <span className="block text-center text-green-400 text-md leading-none">✓</span>}
                {todo.status === 'in-progress' && <span className="block text-center text-blue-400 text-md leading-none">◑</span>}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm leading-tight ${todo.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {todo.title}
                  </p>
                  {todo.time && (
                    <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded uppercase tracking-widest">
                      {todo.time}
                    </span>
                  )}
                </div>
                {todo.description && (
                  <p className="text-md text-slate-500 mt-0.5 truncate">{todo.description}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`badge badge-${todo.status}`}>{todo.status === 'in-progress' ? 'ACTIVE' : todo.status.toUpperCase()}</span>
                {todo.tags?.slice(0, 2).map(tag => (
                  <span key={tag} className="text-md text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">#{tag}</span>
                ))}
              </div>

              {/* Actions — show on hover */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(todo)}
                  className="text-md text-cyan-400 hover:text-cyan-300 px-1.5 py-0.5 rounded hover:bg-cyan-400/10 transition-all font-orbitron"
                >
                  EDIT
                </button>
                <button
                  onClick={handleDelete}
                  className={`text-md px-1.5 py-0.5 rounded transition-all font-orbitron ${
                    confirming ? 'text-pink-400 bg-pink-400/15 animate-pulse' : 'text-slate-500 hover:text-pink-400 hover:bg-pink-400/10'
                  }`}
                >
                  {confirming ? 'SURE?' : 'DEL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

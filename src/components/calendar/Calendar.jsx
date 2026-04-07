import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useTodos } from '../../context/TodoContext';
import TodoCard from '../todos/TodoCard';
import TodoModal from '../todos/TodoModal';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [modalOpen, setModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const { monthTodos, fetchMonthTodos, reorderTodos } = useTodos();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const loadMonth = useCallback(() => {
    fetchMonthTodos(format(currentDate, 'yyyy'), format(currentDate, 'M'));
  }, [currentDate, fetchMonthTodos]);

  useEffect(() => { loadMonth(); }, [loadMonth]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const todosForDate = (dateStr) => monthTodos[dateStr] || [];
  const todosForSelected = todosForDate(selectedDate);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const dateTodos = [...todosForSelected];
    const oldIdx = dateTodos.findIndex(t => t._id === active.id);
    const newIdx = dateTodos.findIndex(t => t._id === over.id);
    const reordered = arrayMove(dateTodos, oldIdx, newIdx);
    reorderTodos(selectedDate, reordered);
  };

  const openCreate = (date) => {
    setSelectedDate(date);
    setEditTodo(null);
    setModalOpen(true);
  };

  const openEdit = (todo) => {
    setEditTodo(todo);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTodo(null); loadMonth(); };

  // Week view: current week
  const weekStart = startOfWeek(new Date(selectedDate + 'T00:00:00'), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Calendar Panel */}
      <div className="glass-panel p-4 lg:flex-1">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))}
              className="w-8 h-8 rounded border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all flex items-center justify-center text-sm">‹</button>
            <div>
              <h2 className="font-orbitron text-sm font-bold neon-text tracking-wider">
                {format(currentDate, 'MMMM').toUpperCase()}
              </h2>
              <p className="text-md text-slate-500 font-orbitron mono">{format(currentDate, 'yyyy')}</p>
            </div>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))}
              className="w-8 h-8 rounded border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 transition-all flex items-center justify-center text-sm">›</button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date())}
              className="text-md font-orbitron text-slate-400 hover:text-cyan-400 px-2 py-1 rounded border border-slate-700 hover:border-cyan-400/40 transition-all">
              TODAY
            </button>
            <div className="flex rounded overflow-hidden border border-cyan-400/20">
              {['month', 'week'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`text-md font-orbitron px-3 py-1 transition-all ${view === v ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-500 hover:text-cyan-400'}`}>
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === 'month' ? (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-md font-orbitron text-slate-600 tracking-wider py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px">
              {calDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTodos = todosForDate(dateStr);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = dateStr === selectedDate;
                const isTodayDay = isToday(day);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    onDoubleClick={() => openCreate(dateStr)}
                    className={`cal-cell border rounded p-1.5 min-h-[80px] relative
                      ${isTodayDay ? 'today' : ''}
                      ${isSelected ? 'selected' : 'border-slate-800/50'}
                      ${!isCurrentMonth ? 'opacity-30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-md font-orbitron ${isTodayDay ? 'neon-text' : isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                        {format(day, 'd')}
                      </span>
                      {dayTodos.length > 0 && (
                        <span className="text-md font-orbitron text-cyan-500 bg-cyan-400/10 px-1 rounded leading-none py-0.5">
                          {dayTodos.length}
                        </span>
                      )}
                    </div>

                    {/* Task dots/previews */}
                    <div className="space-y-0.5">
                      {dayTodos.slice(0, 2).map(t => (
                        <div key={t._id} className="truncate text-md px-1 py-0.5 rounded"
                          style={{
                            background: t.status === 'completed' ? 'rgba(0,255,136,0.1)' : t.priority === 'high' ? 'rgba(255,0,128,0.1)' : 'rgba(0,245,255,0.06)',
                            color: t.status === 'completed' ? '#00ff88' : t.priority === 'high' ? '#ff0080' : '#7baec8',
                            textDecoration: t.status === 'completed' ? 'line-through' : 'none'
                          }}>
                          {t.title}
                        </div>
                      ))}
                      {dayTodos.length > 2 && (
                        <div className="text-md text-slate-600 px-1 font-orbitron">+{dayTodos.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Week View */
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTodos = todosForDate(dateStr);
              const isSelected = dateStr === selectedDate;
              const isTodayDay = isToday(day);
              return (
                <div key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  onDoubleClick={() => openCreate(dateStr)}
                  className={`cal-cell border rounded p-2 min-h-[200px] ${isTodayDay ? 'today' : ''} ${isSelected ? 'selected' : 'border-slate-800/50'}`}
                >
                  <div className="text-center mb-2">
                    <div className={`text-md font-orbitron ${isTodayDay ? 'neon-text' : 'text-slate-500'} tracking-wider`}>{format(day, 'EEE').toUpperCase()}</div>
                    <div className={`text-lg font-orbitron font-bold ${isTodayDay ? 'neon-text' : 'text-slate-300'}`}>{format(day, 'd')}</div>
                  </div>
                  <div className="space-y-1">
                    {dayTodos.map(t => (
                      <div key={t._id} className="text-md p-1.5 rounded truncate"
                        style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)', color: '#7baec8' }}>
                        {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-md text-slate-700 font-orbitron text-center mt-3 tracking-wider">DOUBLE-CLICK A DAY TO ADD TASK</p>
      </div>

      {/* Side Panel: Selected Day Tasks */}
      <div className="glass-panel p-4 w-full lg:w-80 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-orbitron text-md font-bold text-cyan-400 tracking-widest">SELECTED DATE</h3>
            <p className="text-slate-300 font-orbitron text-lg mt-0.5">{format(new Date(selectedDate + 'T00:00:00'), 'MMM d, yyyy').toUpperCase()}</p>
          </div>
          <button
            onClick={() => openCreate(selectedDate)}
            className="w-8 h-8 rounded border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-all text-xl flex items-center justify-center font-orbitron"
          >+</button>
        </div>

        <div className="neon-divider"></div>

        {/* Task list for selected day */}
        <div className="flex-1 overflow-y-auto">
          {todosForSelected.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-slate-600 font-orbitron text-md tracking-wider">NO TASKS DEPLOYED</p>
              <button onClick={() => openCreate(selectedDate)}
                className="text-md text-cyan-500 hover:text-cyan-400 font-orbitron tracking-wider hover:underline">
                + ADD FIRST TASK
              </button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={todosForSelected.map(t => t._id)} strategy={verticalListSortingStrategy}>
                {todosForSelected.map(todo => (
                  <TodoCard key={todo._id} todo={todo} onEdit={openEdit} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Stats */}
        {todosForSelected.length > 0 && (
          <div className="mt-3 pt-3 border-t border-cyan-400/10">
            <div className="flex justify-between text-md font-orbitron text-slate-500">
              <span>TOTAL: <span className="text-cyan-400">{todosForSelected.length}</span></span>
              <span>DONE: <span className="text-green-400">{todosForSelected.filter(t => t.status === 'completed').length}</span></span>
              <span>PENDING: <span className="text-yellow-400">{todosForSelected.filter(t => t.status === 'pending').length}</span></span>
            </div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-green-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.round(todosForSelected.filter(t => t.status === 'completed').length / todosForSelected.length * 100)}%` }}>
              </div>
            </div>
          </div>
        )}
      </div>

      <TodoModal
        isOpen={modalOpen}
        onClose={closeModal}
        date={selectedDate}
        todo={editTodo}
      />
    </div>
  );
}

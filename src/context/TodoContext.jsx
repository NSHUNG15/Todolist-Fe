import { createContext, useContext, useState, useCallback } from 'react';
import { todosAPI } from '../services/api';
import toast from 'react-hot-toast';

const TodoContext = createContext(null);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [monthTodos, setMonthTodos] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await todosAPI.getAll(params);
      setTodos(data);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthTodos = useCallback(async (year, month) => {
    try {
      const { data } = await todosAPI.getByMonth(year, month);
      setMonthTodos(data);
    } catch (e) {
      console.error('Failed to fetch month todos', e);
    }
  }, []);

  const createTodo = async (todoData) => {
    const { data } = await todosAPI.create(todoData);
    setTodos(prev => [...prev, data]);
    // Update month todos cache
    setMonthTodos(prev => ({
      ...prev,
      [data.date]: [...(prev[data.date] || []), data]
    }));
    toast.success('Task deployed ⚡');
    return data;
  };

  const updateTodo = async (id, updates) => {
    const { data } = await todosAPI.update(id, updates);
    setTodos(prev => prev.map(t => t._id === id ? data : t));
    setMonthTodos(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(date => {
        updated[date] = updated[date].map(t => t._id === id ? data : t);
      });
      return updated;
    });
    toast.success('Task updated');
    return data;
  };

  const deleteTodo = async (id) => {
    await todosAPI.delete(id);
    const removed = todos.find(t => t._id === id);
    setTodos(prev => prev.filter(t => t._id !== id));
    if (removed) {
      setMonthTodos(prev => ({
        ...prev,
        [removed.date]: (prev[removed.date] || []).filter(t => t._id !== id)
      }));
    }
    toast.success('Task terminated');
  };

  const reorderTodos = async (date, reordered) => {
    // Optimistic update
    setMonthTodos(prev => ({ ...prev, [date]: reordered }));
    const updates = reordered.map((t, i) => ({ id: t._id, order: i }));
    try {
      await todosAPI.reorder(updates);
    } catch {
      toast.error('Reorder failed');
    }
  };

  return (
    <TodoContext.Provider value={{
      todos, monthTodos, loading,
      fetchTodos, fetchMonthTodos,
      createTodo, updateTodo, deleteTodo, reorderTodos
    }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within TodoProvider');
  return ctx;
};

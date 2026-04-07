import { createContext, useContext, useState, useCallback } from 'react';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';

const NoteContext = createContext(null);

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await notesAPI.getAll(params);
      setNotes(data);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotesByDate = useCallback(async (date) => {
    try {
      const { data } = await notesAPI.getByDate(date);
      return data;
    } catch {
      return [];
    }
  }, []);

  const createNote = async (noteData) => {
    const { data } = await notesAPI.create(noteData);
    setNotes(prev => [data, ...prev]);
    toast.success('Note encrypted & saved 🔐');
    return data;
  };

  const updateNote = async (id, updates) => {
    const { data } = await notesAPI.update(id, updates);
    setNotes(prev => prev.map(n => n._id === id ? data : n));
    toast.success('Note updated');
    return data;
  };

  const deleteNote = async (id) => {
    await notesAPI.delete(id);
    setNotes(prev => prev.filter(n => n._id !== id));
    toast.success('Note purged');
  };

  return (
    <NoteContext.Provider value={{
      notes, loading,
      fetchNotes, fetchNotesByDate,
      createNote, updateNote, deleteNote
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const ctx = useContext(NoteContext);
  if (!ctx) throw new Error('useNotes must be used within NoteProvider');
  return ctx;
};

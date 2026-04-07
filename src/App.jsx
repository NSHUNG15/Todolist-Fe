import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { TodoProvider } from './context/TodoContext';
import { NoteProvider } from './context/NoteContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen grid-bg">
      <div className="scanline"></div>
      <Navbar />
      <main>
        <div className='flex items-center justify-center mt-5 mb-5'>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TodoProvider>
          <NoteProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><AppLayout><CalendarPage /></AppLayout></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><AppLayout><NotesPage /></AppLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'rgba(6, 18, 36, 0.95)',
                  color: '#e2f4ff',
                  border: '1px solid rgba(0, 245, 255, 0.2)',
                  borderRadius: '8px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(20px)',
                },
                success: { iconTheme: { primary: '#00ff88', secondary: '#020408' } },
                error: {
                  iconTheme: { primary: '#ff0080', secondary: '#020408' },
                  style: { border: '1px solid rgba(255, 0, 128, 0.3)' }
                },
              }}
            />
          </NoteProvider>
        </TodoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

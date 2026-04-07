import { motion } from 'framer-motion';
import Calendar from '../components/calendar/Calendar';

export default function CalendarPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex-1 max-w-7xl"
    >
      <div className="mb-4 mt-6 text-center">
        <h1 className="font-orbitron text-lg font-bold neon-text tracking-widest">◷ TEMPORAL GRID</h1>
        <p className="text-md text-slate-500 font-orbitron tracking-wider mt-0.5">CALENDAR · TASK DEPLOYMENT INTERFACE</p>
      </div>
      <Calendar />
    </motion.div>
  );
}

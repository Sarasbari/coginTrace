import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import SpeechTask from './components/SpeechTask';
import Dashboard from './components/Dashboard';
import { initializeStorage } from './utils/storage';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const pageTransition = {
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export default function App() {
  const [page, setPage] = useState('home');
  const [latestSession, setLatestSession] = useState(null);

  // Initialize storage with mock data on first run
  useEffect(() => {
    initializeStorage();
  }, []);

  const handleNavigate = useCallback((target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTaskComplete = useCallback(
    (sessionResult) => {
      if (sessionResult) {
        setLatestSession(sessionResult);
      }
      setPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  return (
    <>
      <Navbar currentPage={page} onNavigate={handleNavigate} />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <HomePage
                onStartSession={() => handleNavigate('task')}
                onViewDashboard={() => handleNavigate('dashboard')}
              />
            </motion.div>
          )}

          {page === 'task' && (
            <motion.div
              key="task"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <SpeechTask onComplete={handleTaskComplete} />
            </motion.div>
          )}

          {page === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Dashboard latestSession={latestSession} />
            </motion.div>
          )}

          {page === 'history' && (
            <motion.div
              key="history"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Dashboard showHistoryOnly />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}

import { useState } from 'react';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import LiveIntersection from './pages/LiveIntersection';
import Analytics from './pages/Analytics';
import About from './pages/About';
import SoundToggle from './components/SoundToggle';
import './index.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <>
      <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
        {currentPage === 'live-intersection' && <LiveIntersection onNavigate={setCurrentPage} />}
        {currentPage === 'analytics' && <Analytics onNavigate={setCurrentPage} />}
        {currentPage === 'about' && <About onNavigate={setCurrentPage} />}
      </MainLayout>
      <SoundToggle />
    </>
  );
}

export default App;

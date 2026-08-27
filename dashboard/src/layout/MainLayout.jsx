import { useState, useEffect } from 'react';

const MainLayout = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard', desc: 'System Overview & Analytics' },
    { id: 'live-intersection', label: '🚦 Live Intersection', desc: 'Real-time Simulation & Overrides' },
    { id: 'about', label: 'ℹ️ About', desc: 'Architecture & Features' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header & Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate && onNavigate('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 text-xl font-bold">
                🚦
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">Mumbai STMS</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    AI v2.4
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Smart Traffic Management System • BKC Junction</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate && onNavigate(item.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/80 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Live System Status & Clock */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs font-mono font-medium text-slate-600">{timeString || 'LIVE'}</div>
                <div className="text-[10px] text-slate-400">IST (Mumbai)</div>
              </div>
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-700 tracking-wide">SYSTEM ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>🚦 Smart Traffic Management System (SIH Edition)</span>
            <span>•</span>
            <span>AI Adaptive Signal Control</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Bandra-Kurla Complex (Junction 12A)</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">99.9% Sensor Uptime</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrafficCone, 
  Video, 
  LineChart, 
  Info, 
  Activity, 
  Clock, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react';

const MainLayout = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [timeString, setTimeString] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-intersection', label: 'Live Intersection', icon: TrafficCone },
    { id: 'traffic-intelligence', label: 'Traffic Intelligence', icon: Video },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'about', label: 'About', icon: Info }
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#F4F6F8', color: '#17324D' }}>
      
      {/* 1. Top Utility Strip */}
      <div className="w-full text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs" style={{ backgroundColor: '#123B63' }}>
        <div className="flex items-center space-x-2">
          <ShieldCheck size={14} className="text-[#E09A2D]" />
          <span className="font-semibold tracking-wide text-[11px] sm:text-xs">
            Smart City Traffic Management System • BKC Junction, Mumbai
          </span>
        </div>
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="hidden md:inline-block text-[#D6E0E7]">
            Municipal Traffic Control Cell
          </span>
          <span className="flex items-center gap-1.5 bg-[#1D5D91] px-2 py-0.5 rounded text-white font-mono text-[11px]">
            <Clock size={12} />
            {timeString} IST
          </span>
        </div>
      </div>

      {/* 2. Main Government Header */}
      <header className="sticky top-0 z-50 bg-white shadow-xs" style={{ borderTop: '3px solid #E09A2D', borderBottom: '1px solid #D6E0E7' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Header Brand Info */}
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => onNavigate && onNavigate('dashboard')}>
              {/* Traffic Light Icon Container */}
              <div className="w-8 h-10 bg-[#123B63] rounded-md flex flex-col items-center justify-between py-1 shadow-xs flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#D98B19]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#198754]" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-extrabold text-base sm:text-xl tracking-tight text-[#123B63] leading-tight">
                    Mumbai STMS
                  </h1>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#EAF3F8] text-[#1D5D91] border border-[#D6E0E7]">
                    Official Portal
                  </span>
                </div>
                <p className="text-xs text-[#526778] font-medium leading-tight">
                  Smart Traffic Management System • BKC Junction, Mumbai
                </p>
              </div>
            </div>

            {/* Right Status Badge & Mobile Toggle */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[#EAF3F8] border border-[#D6E0E7]">
                <Activity size={15} className="text-[#198754] animate-pulse" />
                <div className="text-left leading-none">
                  <div className="text-[11px] font-bold text-[#123B63]">System Active</div>
                  <div className="text-[9px] text-[#526778]">Adaptive AI Monitoring</div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-[#123B63] hover:bg-[#EAF3F8] transition-colors"
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex space-x-1 pt-1 pb-0 overflow-x-auto border-t border-[#E5EBEF]">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate && onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 font-semibold text-xs transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#EAF3F8] text-[#123B63] border-[#1D5D91] shadow-xs'
                      : 'bg-transparent text-[#526778] border-transparent hover:bg-[#F4F6F8] hover:text-[#123B63]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#1D5D91]' : 'text-[#718392]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#D6E0E7] px-4 py-3 space-y-1 shadow-md">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate && onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EAF3F8] text-[#123B63] border-l-4 border-[#1D5D91]'
                      : 'text-[#526778] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#1D5D91]' : 'text-[#718392]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* 3. Main Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* 4. Official Footer */}
      <footer className="mt-auto bg-white border-t border-[#D6E0E7] py-4">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#526778]">
          <div className="flex items-center space-x-2">
            <TrafficCone size={16} className="text-[#1D5D91]" />
            <span className="font-bold text-[#123B63]">Smart Traffic Management System (STMS)</span>
            <span>•</span>
            <span>BKC Junction, Mumbai</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-[#718392]">
            <span>Municipal Traffic Control Cell</span>
            <span>•</span>
            <span>AI Adaptive Signal Control</span>
            <span>•</span>
            <span>Real-time Monitoring</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
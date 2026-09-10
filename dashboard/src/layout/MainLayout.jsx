import { useState, useEffect, useRef } from 'react';
import { MoreVertical, ChevronRight, Bell, ChevronDown, LayoutDashboard, TrafficCone, Video, LineChart, Info } from 'lucide-react';

const MainLayout = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Handle click outside to close dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'System Overview & Control' },
    { id: 'live-intersection', label: 'Live Intersection', icon: TrafficCone, desc: 'Real-time Simulation & Overrides' },
    { id: 'traffic-intelligence', label: 'Traffic Intelligence', icon: Video, desc: 'Video Detection & Tracking' },
    { id: 'analytics', label: 'Analytics', icon: LineChart, desc: 'Efficiency & Sustainability' },
    { id: 'about', label: 'About', icon: Info, desc: 'Architecture & Docs' }
  ];

  const activeItem = navItems.find(item => item.id === currentPage) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#F5F8FA', color: '#172333' }}>
      {/* Top Header matching reference screenshot */}
      <header className="sticky top-0 z-50 bg-white shadow-xs" style={{ borderBottom: '1px solid #E3EAF0' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left Section: Green Dot + Traffic Light Icon + Title & Subtitle */}
            <div className="flex items-center space-x-3">
              {/* Green System Online Dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-sm animate-pulse flex-shrink-0" />

              {/* Traffic Signal Icon (Black Capsule with 3 Dots) */}
              <div className="w-5 h-9 bg-[#172333] rounded-md flex flex-col items-center justify-between py-1 shadow-sm flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              </div>

              {/* Title & Subtitle */}
              <div className="cursor-pointer select-none" onClick={() => onNavigate && onNavigate('dashboard')}>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-base sm:text-lg tracking-tight text-[#172333] leading-tight">
                    Smart Traffic Management System
                  </h1>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium leading-none mt-0.5">
                  Mumbai BKC Junction
                </p>
              </div>

              {/* Navigation Menu Trigger */}
              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(prev => !prev)}
                  className={`p-1.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                    isMenuOpen
                      ? 'border-[#13B8B2] ring-2 ring-[#13B8B2]/20 bg-[#F0FDFA] text-[#13B8B2]'
                      : 'border-[#E3EAF0] hover:border-[#CBD5E1] text-[#64748B]'
                  }`}
                  aria-label="Navigation Menu"
                  title="Switch Views"
                >
                  <MoreVertical size={16} />
                </button>

                {/* Navigation Dropdown */}
                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-xl shadow-xl py-2 z-50 bg-white border border-[#E3EAF0]">
                    <div className="px-3.5 py-1.5 border-b border-[#F1F5F9]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        Dashboard Modules
                      </p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      {navItems.map((item) => {
                        const isActive = currentPage === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onNavigate && onNavigate(item.id);
                              setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group cursor-pointer"
                            style={{
                              backgroundColor: isActive ? '#F0FDFA' : 'transparent',
                              color: isActive ? '#0E8E89' : '#475569',
                              fontWeight: isActive ? 600 : 400
                            }}
                          >
                            <div className="flex items-center space-x-2.5">
                              <item.icon size={18} />
                              <div>
                                <div className="font-semibold text-[#172333] leading-tight">
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-[#94A3B8] leading-tight">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={12} className="text-[#94A3B8] group-hover:text-[#13B8B2] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Bell Notification + Admin Avatar/Profile */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <button
                className="relative p-1.5 text-[#64748B] hover:text-[#172333] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Notifications"
                onClick={() => {}}
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
              </button>

              {/* Admin Profile Area matching screenshot */}
              <div className="flex items-center space-x-2 pl-2 border-l border-[#E3EAF0]">
                <div className="w-8 h-8 rounded-full bg-[#13B8B2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SA
                </div>
                <div className="hidden sm:block text-left select-none leading-tight">
                  <div className="text-xs font-bold text-[#172333] flex items-center space-x-1">
                    <span>System Admin</span>
                    <ChevronDown size={12} className="text-[#94A3B8]" />
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    Traffic Control
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
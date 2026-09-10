import { useState, useEffect, useRef } from 'react';
import { Shield, Bell, ChevronDown, Activity, Globe, Eye, Download, CheckCircle2, ChevronRight, Clock, UserCheck } from 'lucide-react';

const MainLayout = ({ children, currentPage = 'dashboard', onNavigate }) => {
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [lang, setLang] = useState('EN'); // 'EN' | 'HI'
  const [fontSizeClass, setFontSizeClass] = useState('font-size-normal'); // 'font-size-sm' | 'font-size-normal' | 'font-size-lg'
  const [isZoneMenuOpen, setIsZoneMenuOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState('Mumbai BKC Corridor — Jn 04');

  const zoneMenuRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateString(now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (zoneMenuRef.current && !zoneMenuRef.current.contains(event.target)) {
        setIsZoneMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: lang === 'HI' ? 'राष्ट्रीय डैशबोर्ड' : 'National Dashboard', icon: '📊' },
    { id: 'live-intersection', label: lang === 'HI' ? 'लाइव जंक्शन मॉनिटर' : 'Live Junction Monitor', icon: '🚦' },
    { id: 'traffic-intelligence', label: lang === 'HI' ? 'कैमरा एआई ग्रिड' : 'Camera AI Grid', icon: '📹' },
    { id: 'analytics', label: lang === 'HI' ? 'शहर एनालिटिक्स व कार्बन' : 'City Analytics & Carbon', icon: '📈' },
    { id: 'about', label: lang === 'HI' ? 'नीति एवं आर्किटेक्चर' : 'MoRTH Docs & About', icon: '🏛️' }
  ];

  const zones = [
    'Mumbai BKC Corridor — Jn 04',
    'Pune Shivaji Nagar — Node 02',
    'Delhi Ring Road — Jn 11',
    'Bengaluru Outer Ring — Node 07'
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans ${fontSizeClass}`} style={{ backgroundColor: '#F8FAFC', color: '#0F2942' }}>
      {/* 1. National Tricolor Strip */}
      <div className="gov-tricolor-strip" style={{ height: '4px' }} />

      {/* 2. GIGW Top Government Utility Bar (Spacious, Clear Hierarchy) */}
      <div className="bg-[#0A1C2A] text-slate-200 text-xs py-2 px-4 sm:px-8 border-b border-[#1E3A8A]/40 select-none">
        <div className="max-w-[1520px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Ministry Identification */}
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="font-bold text-[#FF9933] text-xs sm:text-sm">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span className="font-semibold text-slate-100 hidden sm:inline">GOVERNMENT OF INDIA</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 font-medium hidden md:inline">सड़क परिवहन एवं राजमार्ग मंत्रालय (MoRTH)</span>
          </div>

          {/* Right: Accessibility & Telemetry */}
          <div className="flex items-center space-x-4">
            {/* Live NIC Cloud Node Status */}
            <div className="hidden sm:flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-md border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-medium">NIC-ICCC Gateway • 18ms</span>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(prev => prev === 'EN' ? 'HI' : 'EN')}
              className="flex items-center space-x-1.5 text-slate-200 hover:text-white px-2.5 py-1 rounded-md border border-slate-700 bg-slate-800/90 cursor-pointer text-xs font-bold transition hover:bg-slate-700"
              title="Toggle Language"
            >
              <Globe size={13} className="text-[#FF9933]" />
              <span>{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* GIGW Font Size Accessibility Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700 text-xs font-bold">
              <button
                onClick={() => setFontSizeClass('font-size-sm')}
                className={`px-1 hover:text-[#FF9933] cursor-pointer transition ${fontSizeClass === 'font-size-sm' ? 'text-[#FF9933] font-black' : 'text-slate-400'}`}
                title="Small Font Size"
              >
                A-
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setFontSizeClass('font-size-normal')}
                className={`px-1 hover:text-[#FF9933] cursor-pointer transition ${fontSizeClass === 'font-size-normal' ? 'text-[#FF9933] font-black' : 'text-slate-400'}`}
                title="Default Font Size"
              >
                A
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setFontSizeClass('font-size-lg')}
                className={`px-1 hover:text-[#FF9933] cursor-pointer transition ${fontSizeClass === 'font-size-lg' ? 'text-[#FF9933] font-black' : 'text-slate-400'}`}
                title="Large Font Size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Ministry Portal Main Masthead (Spacious, Un-congested, Dignified) */}
      <header className="bg-white border-b border-[#CBD5E1] shadow-xs sticky top-0 z-50">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Left: Ashoka Emblem & Ministry Branding */}
            <div className="flex items-center space-x-4">
              {/* Ashoka Emblem Insignia Silhouette */}
              <div
                className="w-13 h-13 rounded-xl bg-[#0F2942] border-2 border-[#1E3A8A] flex flex-col items-center justify-center text-white shadow-sm flex-shrink-0 cursor-pointer select-none"
                onClick={() => onNavigate && onNavigate('dashboard')}
              >
                <Shield className="w-6 h-6 text-[#FF9933]" />
                <span className="text-[8px] font-black tracking-wider text-amber-300 mt-0.5">MoRTH</span>
              </div>

              {/* Ministry Titles with Clean Hierarchy */}
              <div className="cursor-pointer select-none" onClick={() => onNavigate && onNavigate('dashboard')}>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-black text-lg sm:text-xl tracking-tight text-[#0F2942] leading-snug">
                    Integrated Traffic Management System (ITMS)
                  </h1>
                  <span className="inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 bg-blue-50 text-[#003366] rounded-full border border-blue-200">
                    Smart Cities Mission
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium mt-0.5 flex flex-wrap items-center gap-2">
                  <span>National Urban Transport Control • Ministry of Road Transport & Highways</span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    IRC:106 Compliant
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Dignitary Profile + Corridor Selector + Live Clock */}
            <div className="flex items-center flex-wrap gap-4 w-full lg:w-auto justify-between lg:justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              
              {/* 1. Prime Minister Dignitary Profile Card */}
              <div className="flex items-center space-x-3 pr-4 lg:border-r border-[#CBD5E1]">
                <div className="relative flex-shrink-0">
                  <img
                    src="/pm_modi.png"
                    alt="Shri Narendra Modi, Prime Minister of India"
                    className="w-12 h-12 rounded-full object-cover object-top border-2 border-[#FF9933] shadow-md ring-2 ring-amber-100"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Active Governance" />
                </div>
                <div className="text-left select-none leading-tight">
                  <div className="text-xs font-black text-[#0F2942]">Shri Narendra Modi</div>
                  <div className="text-[11px] text-[#D97706] font-bold">Hon'ble Prime Minister</div>
                </div>
              </div>

              {/* 2. Corridor / Zone Selector Dropdown */}
              <div className="relative pr-4 lg:border-r border-[#CBD5E1]" ref={zoneMenuRef}>
                <button
                  onClick={() => setIsZoneMenuOpen(prev => !prev)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-slate-100 text-xs font-bold text-[#0F2942] transition shadow-xs cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[190px]">{selectedZone}</span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>

                {isZoneMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl py-1.5 z-50 bg-white border border-[#CBD5E1]">
                    <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Active Smart City Corridors
                    </div>
                    {zones.map((zone) => (
                      <button
                        key={zone}
                        onClick={() => {
                          setSelectedZone(zone);
                          setIsZoneMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          selectedZone === zone ? 'bg-[#003366]/10 text-[#003366] font-bold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{zone}</span>
                        {selectedZone === zone && <CheckCircle2 size={14} className="text-[#003366]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Live Indian Standard Time (IST) Clock */}
              <div className="flex flex-col text-right leading-tight select-none">
                <div className="flex items-center space-x-1.5 text-xs font-black text-[#0F2942] font-mono">
                  <Clock size={13} className="text-[#003366]" />
                  <span>{timeString}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">{dateString} (IST)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Official Ministry Horizontal Navigation Bar (Spacious & Clean) */}
        <div className="bg-[#0F2942] border-t border-[#1E3A8A]">
          <div className="max-w-[1520px] mx-auto px-4 sm:px-8">
            <nav className="flex space-x-2 overflow-x-auto py-1 no-scrollbar">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate && onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-t-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#F8FAFC] text-[#0F2942] shadow-sm border-t-2 border-[#FF9933]'
                        : 'text-slate-200 hover:bg-[#1E3A8A]/60 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* 5. Main Content Area */}
      <main className="flex-1 w-full py-6">
        {children}
      </main>

      {/* 6. Government of India Footer */}
      <footer className="mt-auto bg-[#0A1C2A] text-slate-400 border-t border-[#1E3A8A]/60 py-6 text-xs">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F2942] border border-[#1E3A8A] flex items-center justify-center text-[#FF9933] font-bold text-sm">
                🇮🇳
              </div>
              <div>
                <span className="font-bold text-slate-200">
                  National Informatics Centre (NIC) • Smart Cities Mission Portal
                </span>
                <p className="text-[11px] text-slate-400">
                  Ministry of Road Transport & Highways (MoRTH), Government of India
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700">IRC:106-1990 Standard</span>
              <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700">GIGW Compliant</span>
              <span className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700">NCAP Carbon Audited</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2026 Government of India • Content Owned & Maintained by MoRTH Integrated Command & Control Center.
            </div>
            <div>
              Designed for Smart Mobility & Viksit Bharat @ 2047
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
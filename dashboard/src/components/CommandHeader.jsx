import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Clock, 
  SlidersHorizontal,
  MapPin,
  Radio,
  Server
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const CommandHeader = ({ currentPage, setCurrentPage, onOpenJudgeDrawer }) => {
  const { 
    systemMode, 
    emergencyCorridor, 
    edgeLatencyMs, 
    mqttStatus, 
    cycleTime,
    selectedJunction 
  } = useTraffic();

  const [timeStr, setTimeStr] = useState({ ist: '', utc: '' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ist = now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' }) + ' IST';
      const utc = now.toISOString().slice(11, 19) + ' UTC';
      setTimeStr({ ist, utc });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'command-center', label: 'ICCC Grid Overview', icon: MapPin, shortcut: '1-4' },
    { id: 'intersection-ai', label: 'Signal Controller', icon: Cpu, shortcut: 'O' },
    { id: 'emergency-corridor', label: 'Preemption CAD', icon: ShieldAlert, shortcut: 'E', badge: emergencyCorridor.isActive ? 'ENGAGED' : null },
    { id: 'analytics-kpis', label: 'Telemetry & Analytics', icon: Activity, shortcut: 'A' },
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40 select-none">
      {/* Top 12-Column Telemetry Header Bar */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-11 text-xs">
          
          {/* Left: Official Title & Blinking Status Pulse */}
          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center w-2.5 h-2.5">
              <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-zinc-100 font-mono tracking-tight">
                MUNICIPAL TRAFFIC CONTROL // NODE 25050
              </span>
              <span className="text-zinc-600 hidden md:inline">|</span>
              <span className="text-[10px] font-mono text-zinc-400 hidden lg:inline uppercase">
                ZONE 1-CENTRAL [MUMBAI]
              </span>
            </div>
          </div>

          {/* Center: System Mode Pill */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center space-x-2 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${systemMode === 'adaptive' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-zinc-300 font-semibold uppercase">
                {systemMode === 'adaptive' ? 'ADAPTIVE PCU-OPTIMIZED' : 'FIXED PRE-TIMED'}
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">CYCLE: {cycleTime}s</span>
            </div>

            {emergencyCorridor.isActive && (
              <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-mono animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-bold">PREEMPTION: {emergencyCorridor.vehicleId}</span>
              </div>
            )}
          </div>

          {/* Right: Technical Telemetry & Monospace Time */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-[11px] font-mono text-zinc-400">
            <div className="hidden xl:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-zinc-500 text-[10px]">EDGE:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">{edgeLatencyMs}ms</span>
            </div>

            <div className="hidden xl:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-zinc-500 text-[10px]">MQTT:</span>
              <span className="text-emerald-400 font-semibold">{mqttStatus}</span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-zinc-500 text-[10px]">FPS:</span>
              <span className="text-zinc-200 font-semibold tabular-nums">{selectedJunction.fps}</span>
            </div>

            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="tabular-nums font-semibold">{timeStr.ist}</span>
            </div>

            <button
              onClick={onOpenJudgeDrawer}
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
              title="Open Hardware & Scenario Simulator Drawer"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline font-sans font-medium">Scenarios</span>
              <kbd>[S]</kbd>
            </button>
          </div>

        </div>
      </div>

      {/* High-Density Navigation Bar */}
      <div className="bg-zinc-950/90 border-t border-zinc-900">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-4">
          <nav className="flex space-x-1 py-1">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentPage === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentPage(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                  {tab.shortcut && (
                    <kbd className="hidden md:inline-block">{tab.shortcut}</kbd>
                  )}
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

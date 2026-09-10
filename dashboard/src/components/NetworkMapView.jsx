import React from 'react';
import { 
  Compass,
  MapPin
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const NetworkMapView = ({ onSelectJunction }) => {
  const { junctions, selectedJunctionId, emergencyCorridor } = useTraffic();

  const arterialRoutes = [
    { from: 'J1', to: 'J2', name: 'WORLI-DADAR ARTERIAL', isCorridor: true, status: 'moderate' },
    { from: 'J2', to: 'J3', name: 'DADAR-BKC FLYOVER', isCorridor: true, status: 'congested' },
    { from: 'J2', to: 'J4', name: 'WEH MAIN TRUNK', isCorridor: false, status: 'optimal' },
    { from: 'J3', to: 'J4', name: 'SCLR CONNECTOR', isCorridor: false, status: 'optimal' }
  ];

  const getJunction = (id) => junctions.find(j => j.id === id);

  return (
    <div className="bg-white border border-[#D6E0E7] rounded-lg overflow-hidden flex flex-col h-full min-h-[360px] shadow-xs">
      {/* Map Control Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F4F6F8] border-b border-[#D6E0E7]">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#1D5D91]" />
          <span className="text-xs font-extrabold text-[#123B63] uppercase tracking-wider">
            Traffic Network Overview • BKC Zone
          </span>
          <span className="text-[10px] font-mono text-[#526778] hidden sm:inline bg-white px-2 py-0.5 rounded border border-[#D6E0E7]">
            [MUMBAI ZONE-1]
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[10px] font-mono text-[#526778]">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#198754]" />
            <span>&lt;85 PCU (Optimal)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#D98B19]" />
            <span>85-140 (Moderate)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-[#C0392B]" />
            <span>&gt;140 (Congested)</span>
          </div>
        </div>
      </div>

      {/* Vector GIS Map Body */}
      <div className="relative flex-1 bg-[#090C12] overflow-hidden p-4 select-none flex items-center justify-center">
        
        {/* SVG Arterial Network Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {arterialRoutes.map((route, idx) => {
            const start = getJunction(route.from);
            const end = getJunction(route.to);
            if (!start || !end) return null;

            const isCorridorActive = emergencyCorridor.isActive && route.isCorridor;

            // Route color based on congestion
            let strokeColor = '#27272A';
            if (isCorridorActive) strokeColor = '#06B6D4';
            else if (route.status === 'congested') strokeColor = '#F43F5E';
            else if (route.status === 'moderate') strokeColor = '#F59E0B';
            else strokeColor = '#10B981';

            return (
              <g key={idx}>
                {/* Road Casing */}
                <line
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke="#18181B"
                  strokeWidth="8"
                  strokeLinecap="round"
                />

                {/* Road Surface Link */}
                <line
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke={strokeColor}
                  strokeWidth={isCorridorActive ? '3.5' : '2'}
                  strokeDasharray={isCorridorActive ? '6 3' : 'none'}
                  strokeLinecap="round"
                />

                {/* Route Label */}
                <text
                  x={`${(start.x + end.x) / 2}%`}
                  y={`${(start.y + end.y) / 2 - 2}%`}
                  fill="#71717A"
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                  textAnchor="middle"
                >
                  {route.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Junction Nodes */}
        {junctions.map((j, idx) => {
          const isSelected = selectedJunctionId === j.id;
          const isEmergencyNode = emergencyCorridor.isActive && emergencyCorridor.routeNodeIds.includes(j.id);

          const statusStyles = {
            optimal: 'border-emerald-500/80 text-emerald-400 bg-zinc-900',
            moderate: 'border-amber-500/80 text-amber-400 bg-zinc-900',
            congested: 'border-rose-500 text-rose-400 bg-zinc-900',
            failsafe: 'border-orange-500 text-orange-400 bg-zinc-900'
          };

          const style = statusStyles[j.status] || statusStyles.optimal;

          return (
            <div
              key={j.id}
              onClick={() => onSelectJunction(j.id)}
              style={{ left: `${j.x}%`, top: `${j.y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              {/* Main Node Box */}
              <div className={`px-2 py-1 rounded border transition-all ${
                isSelected 
                  ? 'border-cyan-400 bg-zinc-900 ring-1 ring-cyan-400 shadow-sm' 
                  : `${style} hover:border-zinc-400`
              }`}>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isEmergencyNode ? 'bg-cyan-400 animate-ping' :
                    j.status === 'optimal' ? 'bg-emerald-400' :
                    j.status === 'moderate' ? 'bg-amber-400' : 'bg-rose-500'
                  }`} />
                  <span className="text-[11px] font-bold font-mono text-zinc-100">
                    {j.code}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black text-zinc-300">
                    {j.activePhase} {j.phaseTimer}s
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono mt-0.5">
                  <span>{j.name.split(' ')[0]}</span>
                  <span className="text-zinc-200 ml-1.5 font-bold">{j.totalPcu} PCU</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Emergency Vehicle Beacon */}
        {emergencyCorridor.isActive && (
          <div
            style={{
              left: `${22 + (emergencyCorridor.currentProgressPercent * 0.53)}%`,
              top: `${65 - (emergencyCorridor.currentProgressPercent * 0.30)}%`
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-300"
          >
            <div className="px-1.5 py-0.5 rounded bg-cyan-600 border border-white text-[9px] font-bold font-mono text-white shadow-md flex items-center space-x-1">
              <span>PRIORITY</span>
              <span>{emergencyCorridor.vehicleId}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

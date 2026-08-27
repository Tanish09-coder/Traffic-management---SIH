import React from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  CheckCircle2, 
  Radio,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const EmergencyCorridorPanel = () => {
  const { 
    emergencyCorridor, 
    junctions, 
    triggerScenario, 
    cancelEmergencyCorridor 
  } = useTraffic();

  return (
    <div className="space-y-4">
      {/* CAD Top Dispatch Bar */}
      <div className={`p-5 rounded-xl border ${
        emergencyCorridor.isActive 
          ? 'bg-[#1C1217] border-rose-500/50' 
          : 'bg-[#0E121B] border-[#1D2638]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-lg border ${
              emergencyCorridor.isActive 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
                : 'bg-[#141A26] border-[#243046] text-slate-400'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">
                  Emergency Green Corridor Preemption (CAD)
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                  emergencyCorridor.isActive 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {emergencyCorridor.isActive ? 'ACTIVE PREEMPTION' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated continuous green-wave locking along multi-node GPS arterial routes for critical emergency response.
              </p>
            </div>
          </div>

          <div>
            {emergencyCorridor.isActive ? (
              <button
                onClick={cancelEmergencyCorridor}
                className="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Disengage Preemption</span>
              </button>
            ) : (
              <button
                onClick={() => triggerScenario('emergency_ambulance')}
                className="px-4 py-2 rounded-lg bg-[#1B2435] hover:bg-[#25324A] text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dispatch Priority Ambulance (Test)</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Chips */}
        {emergencyCorridor.isActive && (
          <div className="mt-4 pt-3.5 border-t border-rose-900/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#0A0D14] border border-[#1D2638]">
              <span className="text-[10px] text-slate-500 block uppercase">Vehicle ID</span>
              <span className="font-bold text-rose-400">{emergencyCorridor.vehicleId}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0A0D14] border border-[#1D2638]">
              <span className="text-[10px] text-slate-500 block uppercase">Destination</span>
              <span className="font-bold text-white truncate block">{emergencyCorridor.destination}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0A0D14] border border-[#1D2638]">
              <span className="text-[10px] text-slate-500 block uppercase">Dynamic ETA</span>
              <span className="font-bold text-amber-400 tabular-nums">{emergencyCorridor.etaSeconds}s</span>
            </div>
            <div className="p-2.5 rounded bg-[#0A0D14] border border-[#1D2638]">
              <span className="text-[10px] text-slate-500 block uppercase">Clearance Buffer</span>
              <span className="font-bold text-emerald-400">{emergencyCorridor.clearanceBufferSeconds}s Recovery</span>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Node Progression Route */}
      <div className="p-5 rounded-xl bg-[#0E121B] border border-[#1D2638] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Arterial Green Wave Corridor Sequence</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Path: J1 (Worli) → J2 (Dadar TT) → J3 (BKC Connector)
          </span>
        </div>

        <div className="relative pt-2 pb-2">
          {/* Track Line */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-800 rounded transform -translate-y-1/2" />
          
          {emergencyCorridor.isActive && (
            <div 
              style={{ width: `${emergencyCorridor.currentProgressPercent}%` }}
              className="absolute top-1/2 left-6 h-1 bg-rose-500 rounded transform -translate-y-1/2 transition-all duration-300"
            />
          )}

          {/* Nodes */}
          <div className="relative z-10 flex items-center justify-between">
            {emergencyCorridor.routeNodeIds.map((nodeId, idx) => {
              const junction = junctions.find(j => j.id === nodeId);
              const isPassed = emergencyCorridor.isActive && emergencyCorridor.currentNodeIndex > idx;
              const isCurrent = emergencyCorridor.isActive && emergencyCorridor.currentNodeIndex === idx;

              return (
                <div key={nodeId} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border font-mono text-xs font-bold transition-colors ${
                    isCurrent 
                      ? 'bg-rose-600 border-white text-white' 
                      : isPassed
                      ? 'bg-emerald-700 border-emerald-500 text-white'
                      : 'bg-[#101520] border-slate-700 text-slate-400'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : nodeId}
                  </div>

                  <div className="mt-2 text-center">
                    <span className="text-xs font-medium text-slate-300 block">
                      {junction?.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {isCurrent ? '⚡ PASSING' : isPassed ? 'CLEARED' : 'LOCKED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Protocol Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1D2638] space-y-1.5">
          <span className="font-semibold text-slate-200 block">Automated Clearance Wave Recovery</span>
          <p className="text-slate-400 leading-relaxed">
            Following vehicle clearance, cross-arterial approaches receive an automated 15-second compensation phase to prevent secondary queue buildup.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1D2638] space-y-1.5">
          <span className="font-semibold text-slate-200 block">Golden Hour Transit Optimization</span>
          <p className="text-slate-400 leading-relaxed">
            Dynamic green wave preemption eliminates multi-junction red cycle delays, reducing total transit duration by an estimated 68.4%.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  ShieldAlert, 
  Navigation, 
  CheckCircle2, 
  Radio,
  Clock,
  RotateCcw,
  Zap
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
      <div className={`p-5 rounded-lg border transition-all ${
        emergencyCorridor.isActive 
          ? 'bg-[#FDF2F2] border-[#B42318]' 
          : 'bg-white border-[#D6E0E7]'
      } shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-md border ${
              emergencyCorridor.isActive 
                ? 'bg-[#B42318] text-white border-[#B42318]' 
                : 'bg-[#EAF3F8] border-[#D6E0E7] text-[#1D5D91]'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`text-base font-extrabold ${emergencyCorridor.isActive ? 'text-[#B42318]' : 'text-[#123B63]'}`}>
                  Emergency Green Corridor Preemption (CAD)
                </h2>
                <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded border ${
                  emergencyCorridor.isActive 
                    ? 'bg-[#B42318] text-white border-[#B42318]' 
                    : 'bg-[#EAF3F8] text-[#1D5D91] border-[#D6E0E7]'
                }`}>
                  {emergencyCorridor.isActive ? 'ACTIVE PREEMPTION' : 'STANDBY MODE'}
                </span>
              </div>
              <p className="text-xs text-[#526778] mt-0.5">
                Automated continuous green-wave locking along multi-node GPS arterial routes for critical emergency response.
              </p>
            </div>
          </div>

          <div>
            {emergencyCorridor.isActive ? (
              <button
                onClick={cancelEmergencyCorridor}
                className="px-4 py-2 rounded-md bg-[#B42318] hover:bg-[#C0392B] text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Disengage Preemption</span>
              </button>
            ) : (
              <button
                onClick={() => triggerScenario('emergency_ambulance')}
                className="px-4 py-2 rounded-md bg-[#1D5D91] hover:bg-[#123B63] text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>Dispatch Priority Ambulance (Test)</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Chips */}
        {emergencyCorridor.isActive && (
          <div className="mt-4 pt-3.5 border-t border-[#B42318]/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-md bg-white border border-[#D6E0E7]">
              <span className="text-[10px] text-[#718392] block uppercase font-sans font-semibold">Vehicle ID</span>
              <span className="font-bold text-[#B42318]">{emergencyCorridor.vehicleId}</span>
            </div>
            <div className="p-2.5 rounded-md bg-white border border-[#D6E0E7]">
              <span className="text-[10px] text-[#718392] block uppercase font-sans font-semibold">Destination</span>
              <span className="font-bold text-[#17324D] truncate block">{emergencyCorridor.destination}</span>
            </div>
            <div className="p-2.5 rounded-md bg-white border border-[#D6E0E7]">
              <span className="text-[10px] text-[#718392] block uppercase font-sans font-semibold">Dynamic ETA</span>
              <span className="font-bold text-[#D98B19] tabular-nums">{emergencyCorridor.etaSeconds}s</span>
            </div>
            <div className="p-2.5 rounded-md bg-white border border-[#D6E0E7]">
              <span className="text-[10px] text-[#718392] block uppercase font-sans font-semibold">Clearance Buffer</span>
              <span className="font-bold text-[#198754]">{emergencyCorridor.clearanceBufferSeconds}s Recovery</span>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Node Progression Route */}
      <div className="p-5 rounded-lg bg-white border border-[#D6E0E7] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#123B63]">
            <Navigation className="w-4 h-4 text-[#1D5D91]" />
            <span>Arterial Green Wave Corridor Sequence</span>
          </div>
          <span className="text-[11px] font-mono text-[#526778]">
            Path: J1 (Worli) → J2 (Dadar TT) → J3 (BKC Connector)
          </span>
        </div>

        <div className="relative pt-2 pb-2">
          {/* Track Line */}
          <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-[#E5EBEF] rounded transform -translate-y-1/2" />
          
          {emergencyCorridor.isActive && (
            <div 
              style={{ width: `${emergencyCorridor.currentProgressPercent}%` }}
              className="absolute top-1/2 left-6 h-1.5 bg-[#B42318] rounded transform -translate-y-1/2 transition-all duration-300"
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
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center border font-mono text-xs font-bold transition-colors ${
                    isCurrent 
                      ? 'bg-[#B42318] border-[#B42318] text-white shadow-xs' 
                      : isPassed
                      ? 'bg-[#198754] border-[#198754] text-white shadow-xs'
                      : 'bg-[#F4F6F8] border-[#D6E0E7] text-[#526778]'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : nodeId}
                  </div>

                  <div className="mt-2 text-center">
                    <span className="text-xs font-semibold text-[#17324D] block">
                      {junction?.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-[#718392]">
                      {isCurrent ? <><Zap size={14} className="inline text-[#B42318]" /> PASSING</> : isPassed ? 'CLEARED' : 'LOCKED'}
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
        <div className="p-4 rounded-lg bg-white border border-[#D6E0E7] space-y-1.5 shadow-xs">
          <span className="font-extrabold text-[#123B63] block">Automated Clearance Wave Recovery</span>
          <p className="text-[#526778] leading-relaxed">
            Following vehicle clearance, cross-arterial approaches receive an automated 15-second compensation phase to prevent secondary queue buildup.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-white border border-[#D6E0E7] space-y-1.5 shadow-xs">
          <span className="font-extrabold text-[#123B63] block">Golden Hour Transit Optimization</span>
          <p className="text-[#526778] leading-relaxed">
            Dynamic green wave preemption eliminates multi-junction red cycle delays, reducing total transit duration by an estimated 68.4%.
          </p>
        </div>
      </div>
    </div>
  );
};

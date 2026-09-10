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
      <div className={`p-5 rounded-xl border transition-all ${
        emergencyCorridor.isActive 
          ? 'bg-[#FEF2F2] border-[#FECACA] shadow-xs' 
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-lg border flex-shrink-0 ${
              emergencyCorridor.isActive 
                ? 'bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]' 
                : 'bg-[#0A1F44] border-[#1E4D8C] text-[#F5A623]'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#0A1F44]">
                  Emergency Green Corridor Preemption (CAD)
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                  emergencyCorridor.isActive 
                    ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]' 
                    : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
                }`}>
                  {emergencyCorridor.isActive ? 'ACTIVE PREEMPTION' : 'STANDBY'}
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-0.5">
                Automated continuous green-wave locking along multi-node GPS arterial routes for critical emergency response.
              </p>
            </div>
          </div>

          <div>
            {emergencyCorridor.isActive ? (
              <button
                onClick={cancelEmergencyCorridor}
                className="px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Disengage Preemption</span>
              </button>
            ) : (
              <button
                onClick={() => triggerScenario('emergency_ambulance')}
                className="px-4 py-2 rounded-lg bg-[#0F2C59] hover:bg-[#163A6B] text-white border border-[#1E4D8C] text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <ShieldAlert className="w-4 h-4 text-[#F5A623]" />
                <span>Dispatch Priority Ambulance (Test)</span>
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Chips */}
        {emergencyCorridor.isActive && (
          <div className="mt-4 pt-3.5 border-t border-[#FECACA] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white border border-[#FECACA] shadow-xs">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Vehicle ID</span>
              <span className="font-bold text-[#DC2626]">{emergencyCorridor.vehicleId}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Destination</span>
              <span className="font-bold text-[#0A1F44] truncate block">{emergencyCorridor.destination}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Dynamic ETA</span>
              <span className="font-bold text-[#F5A623] tabular-nums">{emergencyCorridor.etaSeconds}s</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] shadow-xs">
              <span className="text-[10px] text-[#64748B] block uppercase font-bold">Clearance Buffer</span>
              <span className="font-bold text-[#16A34A]">{emergencyCorridor.clearanceBufferSeconds}s Recovery</span>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Node Progression Route */}
      <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0A1F44]">
            <Navigation className="w-4 h-4 text-[#0F2C59]" />
            <span>Arterial Green Wave Corridor Sequence</span>
          </div>
          <span className="text-[11px] font-mono text-[#475569]">
            Path: J1 (Worli) → J2 (Dadar TT) → J3 (BKC Connector)
          </span>
        </div>

        <div className="relative pt-2 pb-2">
          {/* Track Line */}
          <div className="absolute top-1/2 left-6 right-6 h-1 bg-[#E2E8F0] rounded transform -translate-y-1/2" />
          
          {emergencyCorridor.isActive && (
            <div 
              style={{ width: `${emergencyCorridor.currentProgressPercent}%` }}
              className="absolute top-1/2 left-6 h-1 bg-[#DC2626] rounded transform -translate-y-1/2 transition-all duration-300"
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
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-mono text-xs font-bold transition-all shadow-xs ${
                    isCurrent 
                      ? 'bg-[#DC2626] border-[#B91C1C] text-white' 
                      : isPassed
                      ? 'bg-[#16A34A] border-[#15803D] text-white'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0A1F44]'
                  }`}>
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : nodeId}
                  </div>

                  <div className="mt-2 text-center">
                    <span className="text-xs font-bold text-[#0A1F44] block">
                      {junction?.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {isCurrent ? <><Zap size={14} className="inline text-[#F5A623]" /> PASSING</> : isPassed ? 'CLEARED' : 'LOCKED'}
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
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
          <span className="font-bold text-[#0A1F44] block">Automated Clearance Wave Recovery</span>
          <p className="text-[#475569] leading-relaxed">
            Following vehicle clearance, cross-arterial approaches receive an automated 15-second compensation phase to prevent secondary queue buildup.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
          <span className="font-bold text-[#0A1F44] block">Golden Hour Transit Optimization</span>
          <p className="text-[#475569] leading-relaxed">
            Dynamic green wave preemption eliminates multi-junction red cycle delays, reducing total transit duration by an estimated 68.4%.
          </p>
        </div>
      </div>
    </div>
  );
};

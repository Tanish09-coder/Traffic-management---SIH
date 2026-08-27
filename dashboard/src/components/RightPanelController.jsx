import React from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  RotateCcw, 
  SlidersHorizontal,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const RightPanelController = () => {
  const { 
    selectedJunction, 
    junctions, 
    setSelectedJunctionId, 
    setJunctionOverride, 
    emergencyCorridor,
    triggerScenario,
    cancelEmergencyCorridor,
    systemMode
  } = useTraffic();

  const isNSGreen = selectedJunction.activePhase === 'NS';
  const isEWGreen = selectedJunction.activePhase === 'EW';
  const isAmber = selectedJunction.overrideMode === 'flash_amber';

  const getSignalState = (approach) => {
    if (isAmber) return 'yellow';
    if (approach === 'N' || approach === 'S') return isNSGreen ? 'green' : 'red';
    return isEWGreen ? 'green' : 'red';
  };

  return (
    <div className="space-y-3 flex flex-col h-full justify-between">
      
      {/* 1. Active Phase & Signal Controller */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wider">
              SIGNAL CONTROLLER // {selectedJunction.code}
            </span>
          </div>
          <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
            selectedJunction.isOverride ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {selectedJunction.isOverride ? 'MANUAL' : 'AUTO-AI'}
          </span>
        </div>

        {/* 4-Approach Mini Signal Matrix */}
        <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
          {['N', 'S', 'E', 'W'].map(dir => {
            const state = getSignalState(dir);
            return (
              <div key={dir} className="p-1.5 rounded bg-zinc-950 border border-zinc-800 flex flex-col items-center">
                <span className="text-[9px] text-zinc-500">{dir}</span>
                <span className={`w-3 h-3 rounded-full my-1 ${
                  state === 'green' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                  state === 'yellow' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500/80'
                }`} />
                <span className={`text-[8px] font-bold ${
                  state === 'green' ? 'text-emerald-400' :
                  state === 'yellow' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {state.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Phase Countdown & Split Comparison Bar */}
        <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">ACTIVE PHASE COUNTDOWN:</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums">
              {selectedJunction.phaseTimer}s [{selectedJunction.activePhase}]
            </span>
          </div>

          {/* Progress Bar of Current Phase */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              style={{ width: `${Math.min(100, (selectedJunction.phaseTimer / selectedJunction.dynamicGreenTime) * 100)}%` }}
              className="h-full bg-emerald-400 transition-all duration-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 pt-1">
            <div>Adaptive Split: <strong className="text-zinc-200">{selectedJunction.dynamicGreenTime}s</strong></div>
            <div>Fixed Baseline: <strong className="text-zinc-400">{selectedJunction.fixedGreenTime}s</strong></div>
          </div>
        </div>

        {/* Manual Officer Override Controls */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={() => setJunctionOverride(selectedJunction.id, 'force_green_ns')}
            className={`p-1.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer flex items-center justify-between ${
              selectedJunction.overrideMode === 'force_green_ns'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <span>Lock N-S Green</span>
            <kbd>[O]</kbd>
          </button>

          <button
            onClick={() => setJunctionOverride(selectedJunction.id, 'force_green_ew')}
            className={`p-1.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer flex items-center justify-between ${
              selectedJunction.overrideMode === 'force_green_ew'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            <span>Lock E-W Green</span>
            <kbd>[O]</kbd>
          </button>

          <button
            onClick={() => setJunctionOverride(selectedJunction.id, 'flash_amber')}
            className={`p-1.5 rounded text-[10px] font-mono font-medium border transition-colors cursor-pointer ${
              selectedJunction.overrideMode === 'flash_amber'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-zinc-950 text-amber-400 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            Flash Amber
          </button>

          <button
            onClick={() => setJunctionOverride(selectedJunction.id, 'auto')}
            className="p-1.5 rounded text-[10px] font-mono font-medium bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-zinc-700 transition-colors cursor-pointer flex items-center justify-center space-x-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset Auto AI</span>
          </button>
        </div>
      </div>

      {/* 2. Emergency Corridor Preemption Dock */}
      <div className={`border rounded-lg p-3 space-y-2.5 ${
        emergencyCorridor.isActive 
          ? 'bg-rose-950/20 border-rose-500/40' 
          : 'bg-zinc-900/80 border-zinc-800/80'
      }`}>
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className={`w-3.5 h-3.5 ${emergencyCorridor.isActive ? 'text-rose-400 animate-pulse' : 'text-zinc-400'}`} />
            <span className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wider">
              CORRIDOR PREEMPTION DOCK
            </span>
          </div>
          <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded ${
            emergencyCorridor.isActive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {emergencyCorridor.isActive ? 'ENGAGED' : 'STANDBY'}
          </span>
        </div>

        {emergencyCorridor.isActive ? (
          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded bg-zinc-950/80 border border-rose-500/30 space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>UNIT: <strong className="text-rose-400">{emergencyCorridor.vehicleId}</strong></span>
                <span>ETA: <strong className="text-amber-400 tabular-nums">{emergencyCorridor.etaSeconds}s</strong></span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                Route: J1 (Worli) → J2 (Dadar) → J3 (BKC)
              </div>
            </div>

            {/* Checkpoints Step Bar */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
              {emergencyCorridor.routeNodeIds.map((nodeId, idx) => {
                const isPassed = emergencyCorridor.currentNodeIndex > idx;
                const isCurrent = emergencyCorridor.currentNodeIndex === idx;

                return (
                  <div key={nodeId} className="flex items-center space-x-1">
                    <span className={`w-2 h-2 rounded-full ${
                      isCurrent ? 'bg-rose-500 animate-ping' : isPassed ? 'bg-emerald-400' : 'bg-zinc-700'
                    }`} />
                    <span className={isCurrent ? 'text-rose-400 font-bold' : isPassed ? 'text-emerald-400' : 'text-zinc-500'}>
                      {nodeId}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={cancelEmergencyCorridor}
              className="w-full py-1.5 px-2 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>Disengage Corridor Preemption</span>
              <kbd className="bg-rose-800 text-white border-rose-700">[E]</kbd>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-400 font-mono leading-tight">
              Preemption ready for cardiac and trauma life support dispatch.
            </p>
            <button
              onClick={() => triggerScenario('emergency_ambulance')}
              className="w-full py-1.5 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-zinc-700 text-xs font-mono font-semibold transition-colors cursor-pointer flex items-center justify-between"
            >
              <span>Dispatch Priority Ambulance</span>
              <kbd>[E]</kbd>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

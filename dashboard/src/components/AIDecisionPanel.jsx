import React from 'react';
import { Cpu, Layers, AlertCircle, Clock, Database, PlayCircle, Info, CheckCircle2, ArrowRight, Activity } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const AIDecisionPanel = () => {
  const {
    state,
    strategy,
    setStrategy,
    useMock,
    trafficSource,
    setTrafficSource,
    activatePredictivePuneDemo,
    historicalReplayStats
  } = useSimulation();

  const {
    signal,
    pending_signal,
    phase,
    active_green_duration,
    pending_green_duration,
    phase_remaining_sec,
    phase_label,
    clearance_status,
    decision,
    queued_pcus,
    stopped_queues
  } = state || {};

  const stagedStrategy = state?.staged_strategy || strategy;
  const isStaged = stagedStrategy !== strategy;

  // Max PCU for relative progress bar scaling
  const maxPcu = Math.max(5, ...Object.values(queued_pcus || {}).map(v => Number(v) || 0));

  return (
    <div
      className="rounded-lg p-5 shadow-xs select-none mb-4 bg-white"
      style={{ border: '1px solid #D6E0E7' }}
    >
      {/* 1. Header & Quick SIH Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-[#E5EBEF] pb-3.5">
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#EAF3F8', border: '1px solid #D6E0E7' }}
          >
            <Cpu className="w-5 h-5 text-[#1D5D91]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#123B63]">
              Adaptive Signal Recommendation & Optimization
            </h3>
            <p className="text-xs text-[#526778]">
              Intelligent signal control with real-time demand prediction • BKC Junction Cell
            </p>
          </div>
        </div>

        {/* Predict & Optimize Button matching government styling */}
        <button
          onClick={activatePredictivePuneDemo}
          className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-bold rounded-md text-white shadow-xs transition-all hover:bg-[#123B63] cursor-pointer"
          style={{ backgroundColor: '#1D5D91' }}
          title="Preset: Set Traffic Source to Pune Historical & Strategy to Predictive Adaptive"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Predict & Optimize</span>
        </button>
      </div>

      {/* 2. Dual Control Bars (Optimization Mode + Demand Source) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 py-2 px-3 rounded-md bg-[#F4F6F8] border border-[#D6E0E7]">
        {/* Optimization Mode */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#123B63]">
            Optimization Mode:
          </span>
          <div className="flex items-center space-x-1 p-0.5 rounded-md bg-white border border-[#D6E0E7]">
            {[
              { id: 'fixed', label: 'Fixed' },
              { id: 'adaptive', label: 'Adaptive' },
              { id: 'predictive', label: 'Predictive' }
            ].map(({ id, label }) => {
              const isActive = strategy === id;
              return (
                <button
                  key={id}
                  onClick={() => setStrategy(id)}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1D5D91] text-white shadow-xs'
                      : 'text-[#526778] hover:text-[#123B63]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Demand Source */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#123B63]">
            Demand Source:
          </span>
          <div className="flex items-center space-x-1 p-0.5 rounded-md bg-white border border-[#D6E0E7]">
            <button
              onClick={() => setTrafficSource('simulation')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                trafficSource === 'simulation'
                  ? 'bg-[#1D5D91] text-white shadow-xs'
                  : 'text-[#526778] hover:text-[#123B63]'
              }`}
            >
              Synthetic
            </button>
            <button
              onClick={() => setTrafficSource('pune_historical')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                trafficSource === 'pune_historical'
                  ? 'bg-[#1D5D91] text-white shadow-xs'
                  : 'text-[#526778] hover:text-[#123B63]'
              }`}
            >
              Pune Jan 17
            </button>
            {trafficSource === 'recorded_video' && (
              <span className="px-3 py-1 text-xs font-bold rounded bg-[#D98B19] text-white">
                Recorded Video
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pune Historical Status Banner */}
      {trafficSource === 'pune_historical' && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-[#EBF7EE] border border-[#198754]/30 text-[#198754]">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-[#198754]" />
            <span className="font-bold">Traffic Source: Pune Historical Replay (Deterministic)</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-white text-[#198754] border border-[#198754]/30">
              Jan 17, 2023 ({state?.predictiveTimestamp || '09:00:00'})
            </span>
          </div>
          <div className="text-[10px] font-mono flex items-center space-x-2 text-[#198754]">
            <span>Due: {historicalReplayStats?.scheduledDue ?? 0}</span>
            <span>Accepted: {historicalReplayStats?.accepted ?? 0}</span>
            <span className="text-[#526778]">
              (Road: {historicalReplayStats?.currentlyOnRoad ?? 0}, Backlog: {historicalReplayStats?.pendingBacklog ?? 0}, Exited: {historicalReplayStats?.completed ?? 0})
            </span>
            <span className="font-bold px-1.5 rounded text-[#198754] bg-white">Loss: 0</span>
          </div>
        </div>
      )}

      {/* Predictive Demand Indicator */}
      {strategy === 'predictive' && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-md flex items-center justify-between bg-[#EAF3F8] border border-[#D6E0E7] text-[#1D5D91]">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${state?.predictiveStatus === 'fallback' ? 'bg-[#D98B19]' : 'bg-[#1D5D91] animate-pulse'}`}
            />
            <span className="font-semibold">
              {state?.predictiveStatus === 'fallback'
                ? 'Predictive Demand: Fallback to Current PCU'
                : 'Predictive Demand: Active Fusion Model'}
            </span>
          </div>
          {state?.predictiveTimestamp && (
            <span className="text-[10px] font-mono text-[#2B6F9F]">
              {state.predictiveDemoDate || '2023-01-17'} {state.predictiveTimestamp}
            </span>
          )}
        </div>
      )}

      {/* Staged strategy warning */}
      {isStaged && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-md flex items-center space-x-2 bg-[#FFF8E7] border border-[#D98B19]/40 text-[#D98B19]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Strategy change to <strong>{stagedStrategy}</strong> staged; applying at next phase boundary.</span>
        </div>
      )}

      {/* Extended Clearance status warning */}
      {clearance_status && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-md flex items-center space-x-2 animate-pulse bg-[#FDF2F2] border border-[#B42318]/30 text-[#B42318]">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#B42318]" />
          <span>{clearance_status}</span>
        </div>
      )}

      {/* Backend mode warning */}
      {!useMock && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-md flex items-center space-x-2 bg-[#EAF3F8] border border-[#D6E0E7] text-[#1D5D91]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Backend mode active. Local heuristic strategy controls are disabled.</span>
        </div>
      )}

      {/* 3. 4 Signal Status Cards matching government layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Active Signal */}
        <div className="p-3 rounded-md bg-[#F4F6F8] border border-[#D6E0E7]">
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#198754]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B63]">
              Active Signal
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-extrabold text-[#1D5D91]">
              {signal || 'E'}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border"
              style={{
                backgroundColor: phase === 'GREEN' ? '#EBF7EE' : phase === 'YELLOW' ? '#FFF8E7' : '#FDF2F2',
                color: phase === 'GREEN' ? '#198754' : phase === 'YELLOW' ? '#D98B19' : '#B42318',
                borderColor: phase === 'GREEN' ? 'rgba(25,135,84,0.3)' : phase === 'YELLOW' ? 'rgba(217,139,25,0.3)' : 'rgba(180,35,24,0.3)'
              }}
            >
              {phase || 'GREEN'}
            </span>
          </div>
        </div>

        {/* Green Remaining */}
        <div className="p-3 rounded-md bg-[#F4F6F8] border border-[#D6E0E7]">
          <div className="flex items-center space-x-1.5 mb-1">
            <Clock className="w-3 h-3 text-[#526778]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B63]">
              {phase_label || 'Green Remaining'}
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-extrabold text-[#17324D]">
              {clearance_status ? 'Clear' : `${phase_remaining_sec ?? 2}s`}
            </span>
            <span className="text-xs text-[#718392]">
              / {active_green_duration || 26}s cycle
            </span>
          </div>
        </div>

        {/* Next Pending */}
        <div className="p-3 rounded-md bg-[#F4F6F8] border border-[#D6E0E7]">
          <div className="flex items-center space-x-1.5 mb-1">
            <ArrowRight className="w-3 h-3 text-[#1D5D91]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B63]">
              Next Pending
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-extrabold text-[#17324D]">
              {pending_signal || signal || 'E'}
            </span>
            <span className="text-xs text-[#718392]">
              ({pending_green_duration || 36}s)
            </span>
          </div>
        </div>

        {/* Strategy Mode */}
        <div className="p-3 rounded-md bg-[#F4F6F8] border border-[#D6E0E7]">
          <div className="flex items-center space-x-1.5 mb-1">
            <Activity className="w-3 h-3 text-[#526778]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B63]">
              Strategy Mode
            </span>
          </div>
          <div className="text-base font-extrabold text-[#17324D] capitalize mt-1.5">
            {strategy || 'Adaptive'}
          </div>
        </div>
      </div>

      {/* 4. Approach Demand (PCU) Cards matching screenshot */}
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider block mb-2 text-[#123B63]">
          Approach Demand (PCU) / Vehicle Mapping • Upstream Backlog
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['N', 'S', 'E', 'W'].map(dir => {
            const backlog = state?.backlog_queues?.[dir] || 0;
            const visibleStopped = state?.visible_stopped_queues?.[dir] !== undefined
              ? state.visible_stopped_queues[dir]
              : Math.max(0, (stopped_queues?.[dir] || 0) - backlog);
            const pcuVal = Number(queued_pcus?.[dir] ?? 0);
            const isActive = signal === dir;
            const progressPercent = Math.min(100, Math.max(8, (pcuVal / maxPcu) * 100));

            return (
              <div
                key={dir}
                className={`p-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EAF3F8] border-2 border-[#1D5D91] shadow-xs'
                    : 'bg-[#F4F6F8] border border-[#D6E0E7]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-[#123B63]">{dir}</span>
                  <span className="text-xs font-bold text-[#1D5D91] font-mono">
                    {pcuVal.toFixed(1)} PCU
                  </span>
                </div>
                <div className="text-[10px] text-[#718392] mb-2 truncate">
                  ({visibleStopped} vehicles mapped{backlog > 0 ? ` + ${backlog} b/l` : ''})
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-[#D6E0E7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1D5D91] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Allocation Snapshot Strip */}
      <div className="mb-2 text-xs rounded-md p-2.5 flex items-center space-x-2 bg-[#EAF3F8] border-l-4 border-[#1D5D91]">
        <Info className="w-4 h-4 text-[#1D5D91] flex-shrink-0" />
        <div className="truncate">
          <span className="font-bold text-[#123B63] mr-1.5">Allocation Snapshot:</span>
          <span className="font-mono text-[#2B6F9F]">
            {decision?.allocationExplanation || 'Allocated from 10 PCU: 10s base + 10s + 1s = 21s.'}
          </span>
        </div>
      </div>

      {/* 6. Recommendation Reason Strip */}
      <div className="text-xs rounded-md p-2.5 flex items-center space-x-2 bg-[#EBF7EE] border-l-4 border-[#198754]">
        <CheckCircle2 className="w-4 h-4 text-[#198754] flex-shrink-0" />
        <div className="truncate">
          <span className="font-bold text-[#123B63] mr-1.5">Recommendation Reason:</span>
          <span className="text-[#526778]">
            {decision?.reason || 'Starvation rule enforced: E waiting 7s (exceeded max 6s wait limit of 6s).'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIDecisionPanel;

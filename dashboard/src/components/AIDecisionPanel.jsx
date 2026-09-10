import React from 'react';
import { Cpu, Layers, AlertCircle, Clock, Database, PlayCircle, Info, CheckCircle2, ArrowRight, Activity } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const AIDecisionPanel = ({ showAllocationDetails = true, ...props }) => {
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
      className="rounded-xl p-5 shadow-xs select-none mb-4 bg-white border border-[#CBD5E1]"
    >
      {/* 1. Header & Quick SIH Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#0F2942', border: '1px solid #1E3A8A' }}
          >
            <Cpu className="w-5 h-5 text-[#FF9933]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-[#0F2942]">
                MoRTH Adaptive Signal Controller & Demand Optimization
              </h3>
              <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">
                ICCC Auto-Pilot
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Real-time PCU demand allocation, 35s starvation protection & dynamic weather clearance
            </p>
          </div>
        </div>

        {/* Predict & Optimize Button matching screenshot */}
        <button
          onClick={activatePredictivePuneDemo}
          className="flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-lg text-white shadow-xs transition-all hover:bg-[#1E3A8A] active:scale-95 cursor-pointer bg-[#003366] border border-[#1E3A8A]"
          title="Preset: Set Traffic Source to Pune Historical & Strategy to Predictive Adaptive"
        >
          <PlayCircle className="w-4 h-4 text-[#FF9933]" />
          <span>Predict & Optimize</span>
          <span className="text-xs text-[#FF9933]">▶</span>
        </button>
      </div>

      {/* 2. Dual Control Bars (Optimization Mode + Demand Source) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 py-2 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
        {/* Optimization Mode */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-[#475569]">
            Optimization Mode:
          </span>
          <div className="flex items-center space-x-1 p-1 rounded-md bg-[#E2E8F0]">
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
                  className={`px-3.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F2942]'
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
          <span className="text-xs font-bold text-[#475569]">
            Demand Source:
          </span>
          <div className="flex items-center space-x-1 p-1 rounded-md bg-[#E2E8F0]">
            <button
              onClick={() => setTrafficSource('simulation')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                trafficSource === 'simulation'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F2942]'
              }`}
            >
              Synthetic
            </button>
            <button
              onClick={() => setTrafficSource('pune_historical')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                trafficSource === 'pune_historical'
                  ? 'bg-[#003366] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0F2942]'
              }`}
            >
              Pune Jan 17
            </button>
            {trafficSource === 'recorded_video' && (
              <span className="px-3 py-1 text-xs font-bold rounded bg-[#D97706] text-white">
                Recorded Video
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pune Historical Status Banner */}
      {trafficSource === 'pune_historical' && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="font-bold">Traffic Source: Pune Historical Replay (Deterministic)</span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#DCFCE7] text-[#15803D]">
              Jan 17, 2023 ({state?.predictiveTimestamp || '09:00:00'})
            </span>
          </div>
          <div className="text-[10px] font-mono flex items-center space-x-2 text-[#15803D]">
            <span>Due: {historicalReplayStats?.scheduledDue ?? 0}</span>
            <span>Accepted: {historicalReplayStats?.accepted ?? 0}</span>
            <span className="text-[#94A3B8]">
              (Road: {historicalReplayStats?.currentlyOnRoad ?? 0}, Backlog: {historicalReplayStats?.pendingBacklog ?? 0}, Exited: {historicalReplayStats?.completed ?? 0})
            </span>
            <span className="font-bold px-1.5 rounded text-[#22C55E] bg-[#F0FDF4]">Loss: 0</span>
          </div>
        </div>
      )}

      {/* Predictive Demand Indicator */}
      {strategy === 'predictive' && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-xl flex items-center justify-between bg-[#FAF5FF] border border-[#E9D5FF] text-[#7C3AED]">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${state?.predictiveStatus === 'fallback' ? 'bg-[#F59E0B]' : 'bg-[#7C3AED] animate-pulse'}`}
            />
            <span className="font-semibold">
              {state?.predictiveStatus === 'fallback'
                ? 'Predictive Demand: Fallback to Current PCU'
                : 'Predictive Demand: Active Fusion Model'}
            </span>
          </div>
          {state?.predictiveTimestamp && (
            <span className="text-[10px] font-mono text-[#A78BFA]">
              {state.predictiveDemoDate || '2023-01-17'} {state.predictiveTimestamp}
            </span>
          )}
        </div>
      )}

      {/* Staged strategy warning */}
      {isStaged && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-xl flex items-center space-x-2 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Strategy change to <strong>{stagedStrategy}</strong> staged; applying at next phase boundary.</span>
        </div>
      )}

      {/* Extended Clearance status warning */}
      {clearance_status && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-xl flex items-center space-x-2 animate-pulse bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#EF4444]" />
          <span>{clearance_status}</span>
        </div>
      )}

      {/* Backend mode warning */}
      {!useMock && (
        <div className="mb-3 text-[11px] px-3.5 py-2 rounded-xl flex items-center space-x-2 bg-[#F0FDFA] border border-[#99F6E4] text-[#0E8E89]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Backend mode active. Local heuristic strategy controls are disabled.</span>
        </div>
      )}

      {/* 3. 4 Signal Status Cards matching screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {/* Active Signal */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
          <div className="flex items-center space-x-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Active Signal
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xl font-black text-[#0F2942]">
              {signal || 'E'}
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
              style={{
                backgroundColor: phase === 'GREEN' ? '#DCFCE7' : phase === 'YELLOW' ? '#FEF3C7' : '#FEE2E2',
                color: phase === 'GREEN' ? '#15803D' : phase === 'YELLOW' ? '#B45309' : '#DC2626'
              }}
            >
              {phase || 'GREEN'}
            </span>
          </div>
        </div>

        {/* Green Remaining */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
          <div className="flex items-center space-x-1.5 mb-1">
            <Clock className="w-3 h-3 text-[#475569]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              {phase_label || 'Green Remaining'}
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-black text-[#0F2942]">
              {clearance_status ? 'Clear' : `${phase_remaining_sec ?? 2}s`}
            </span>
            <span className="text-xs text-slate-400">
              / {active_green_duration || 26}s cycle
            </span>
          </div>
        </div>

        {/* Next Pending */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
          <div className="flex items-center space-x-1.5 mb-1">
            <ArrowRight className="w-3 h-3 text-[#003366]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Next Pending
            </span>
          </div>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-xl font-black text-[#0F2942]">
              {pending_signal || signal || 'E'}
            </span>
            <span className="text-xs text-slate-400">
              ({pending_green_duration || 36}s)
            </span>
          </div>
        </div>

        {/* Strategy Mode */}
        <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
          <div className="flex items-center space-x-1.5 mb-1">
            <Activity className="w-3 h-3 text-[#475569]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Strategy Mode
            </span>
          </div>
          <div className="text-base font-black text-[#0F2942] capitalize mt-1.5">
            {strategy || 'Adaptive'}
          </div>
        </div>
      </div>

      {/* 4. Approach Demand (PCU) Cards matching screenshot */}
      <div className="mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider block mb-2 text-[#475569]">
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
            const progressPercent = pcuVal > 0 ? Math.min(100, Math.max(8, (pcuVal / maxPcu) * 100)) : 0;

            return (
              <div
                key={dir}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-[#003366]/5 border-2 border-[#003366] shadow-xs'
                    : 'bg-[#F8FAFC] border border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-[#0F2942]">{dir}</span>
                  <span className="text-xs font-bold text-[#003366] font-mono">
                    {pcuVal.toFixed(1)} PCU
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mb-2 truncate">
                  ({visibleStopped} vehicles mapped{backlog > 0 ? ` + ${backlog} b/l` : ''})
                </div>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#003366] rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAllocationDetails && (
        <>
          {/* 5. Allocation Snapshot Strip matching screenshot */}
          <div className="mb-2 text-xs rounded-xl p-2.5 flex items-center space-x-2 bg-[#F0FDFA] border border-[#CCFBF1]">
            <Info className="w-4 h-4 text-[#13B8B2] flex-shrink-0" />
            <div className="truncate">
              <span className="font-bold text-[#172333] mr-1.5">Allocation Snapshot:</span>
              <span className="font-mono text-[#0E8E89]">
                {decision?.allocationExplanation || 'Allocated from 0 PCU: 10s base green allocation (Adaptive cycle initialized).'}
              </span>
            </div>
          </div>

          {/* 6. Recommendation Reason Strip matching screenshot */}
          <div className="text-xs rounded-xl p-2.5 flex items-center space-x-2 bg-[#F0FDF4] border border-[#DCFCE7]">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0" />
            <div className="truncate">
              <span className="font-bold text-[#172333] mr-1.5">Recommendation Reason:</span>
              <span className="text-[#475569]">
                {decision?.reason || 'Adaptive mode active: Monitoring real-time arrival queues across all approaches.'}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIDecisionPanel;

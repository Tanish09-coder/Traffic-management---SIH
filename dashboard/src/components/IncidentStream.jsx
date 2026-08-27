import React from 'react';
import { 
  Radio,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const IncidentStream = () => {
  const { incidentLogs, acknowledgeIncident } = useTraffic();

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          border: 'border-rose-500/30'
        };
      case 'WARN':
      case 'WARNING':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          border: 'border-amber-500/30'
        };
      default:
        return {
          badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          border: 'border-zinc-800'
        };
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wider">
            ANOMALY & EVENT STREAM
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
          {incidentLogs.filter(i => !i.acknowledged).length} PENDING
        </span>
      </div>

      {/* Terminal-Style Event Stream */}
      <div className="p-2 flex-1 overflow-y-auto space-y-1.5 font-mono text-xs max-h-[320px]">
        {incidentLogs.length === 0 ? (
          <div className="text-center py-4 text-zinc-600 text-xs">
            [LOG STREAM IDLE - NO ANOMALIES]
          </div>
        ) : (
          incidentLogs.map((incident) => {
            const style = getSeverityStyle(incident.severity);

            return (
              <div
                key={incident.id}
                className={`p-2 rounded border bg-zinc-950/60 ${
                  incident.acknowledged ? 'opacity-50 border-zinc-800/50' : style.border
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-zinc-500 tabular-nums">
                        {incident.timestamp}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${style.badge}`}>
                        {incident.severity}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-400">
                        [{incident.junctionId}]
                      </span>
                      <span className="text-zinc-300 text-[11px]">
                        {incident.type}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-tight">
                      {incident.message}
                    </p>
                  </div>

                  {!incident.acknowledged ? (
                    <button
                      onClick={() => acknowledgeIncident(incident.id)}
                      className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      ACK
                    </button>
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-1" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

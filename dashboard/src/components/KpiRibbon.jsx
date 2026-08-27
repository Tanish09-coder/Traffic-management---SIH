import React from 'react';
import { 
  TrendingDown, 
  Layers, 
  ShieldAlert, 
  Leaf, 
  Activity,
  ArrowDownRight
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const KpiRibbon = ({ layout = 'horizontal' }) => {
  const { systemMetrics, emergencyCorridor, junctions, systemMode } = useTraffic();

  const congestedCount = junctions.filter(j => j.status === 'congested').length;

  const kpis = [
    {
      id: 'wait-reduction',
      title: 'NETWORK WAIT REDUCTION',
      value: systemMode === 'adaptive' ? `-${systemMetrics.avgWaitTimeReductionPercent}%` : '0.0%',
      trend: systemMode === 'adaptive' ? '▲ 38.6% vs Fixed Plan' : 'Baseline Active',
      status: 'optimal',
      badge: systemMode === 'adaptive' ? 'AI OPT' : 'BASE'
    },
    {
      id: 'pcu-flow',
      title: 'TOTAL PCU FLOW / HR',
      value: `${systemMetrics.pcuFlowPerHour.toLocaleString()} PCU`,
      trend: `${junctions.length - congestedCount}/${junctions.length} Nodes Free Flow`,
      status: congestedCount > 0 ? 'warning' : 'optimal',
      badge: 'SCADA'
    },
    {
      id: 'emergency-alerts',
      title: 'ACTIVE CORRIDOR ALERTS',
      value: emergencyCorridor.isActive ? '1 ACTIVE' : '0 DISPATCH',
      trend: emergencyCorridor.isActive ? `${emergencyCorridor.vehicleId} (ETA ${emergencyCorridor.etaSeconds}s)` : 'Preemption Armed',
      status: emergencyCorridor.isActive ? 'critical' : 'neutral',
      badge: emergencyCorridor.isActive ? 'PRIORITY' : 'ARMED'
    },
    {
      id: 'carbon-avoided',
      title: 'IDLE CARBON AVOIDED',
      value: `${systemMetrics.co2ReducedKg.toFixed(1)} kg`,
      trend: `${systemMetrics.fuelSavedLiters.toFixed(1)} L Fuel (₹${systemMetrics.totalCostSavedRupees.toLocaleString()})`,
      status: 'optimal',
      badge: 'SAVED'
    }
  ];

  if (layout === 'vertical') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {kpis.map(kpi => (
          <div
            key={kpi.id}
            className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${
                kpi.status === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                kpi.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {kpi.badge}
              </span>
            </div>

            <div className="my-1">
              <span className="text-base font-bold font-mono text-zinc-100 tabular-nums">
                {kpi.value}
              </span>
            </div>

            <span className="text-[10px] font-mono text-zinc-400 truncate">
              {kpi.trend}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
      {kpis.map(kpi => (
        <div
          key={kpi.id}
          className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">
              {kpi.title}
            </span>
            <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border ${
              kpi.status === 'critical' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              kpi.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {kpi.badge}
            </span>
          </div>

          <div className="my-1.5">
            <span className="text-xl font-bold font-mono text-zinc-100 tracking-tight tabular-nums">
              {kpi.value}
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 truncate">
            {kpi.trend}
          </span>
        </div>
      ))}
    </div>
  );
};

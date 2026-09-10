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
            className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider truncate">
                {kpi.title}
              </span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                kpi.status === 'critical' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]' :
                kpi.status === 'warning' ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]' :
                'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
              }`}>
                {kpi.badge}
              </span>
            </div>

            <div className="my-1">
              <span className="text-base font-black font-mono text-[#0A1F44] tabular-nums">
                {kpi.value}
              </span>
            </div>

            <span className="text-[10px] text-[#64748B] truncate">
              {kpi.trend}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {kpis.map(kpi => (
        <div
          key={kpi.id}
          className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
              {kpi.title}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
              kpi.status === 'critical' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]' :
              kpi.status === 'warning' ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]' :
              'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
            }`}>
              {kpi.badge}
            </span>
          </div>

          <div className="my-2">
            <span className="text-2xl font-black tracking-tight text-[#0A1F44] tabular-nums">
              {kpi.value}
            </span>
          </div>

          <span className="text-xs text-[#64748B] truncate">
            {kpi.trend}
          </span>
        </div>
      ))}
    </div>
  );
};

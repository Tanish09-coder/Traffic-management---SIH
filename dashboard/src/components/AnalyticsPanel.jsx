import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Activity,
  Layers,
  Fuel,
  Leaf,
  IndianRupee,
  Server,
  Download,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const AnalyticsPanel = () => {
  const { systemMetrics, analyticsHistory, junctions, systemMode, cycleTime } = useTraffic();
  const [activeMetric, setActiveMetric] = useState('wait'); // 'wait' | 'flow'

  const vehicleClassData = [
    { name: 'Two-Wheelers (0.5 PCU)', value: 48, pcuFactor: '0.5', color: '#F5A623', countPerHour: 2310 },
    { name: 'Passenger Cars (1.0 PCU)', value: 40, pcuFactor: '1.0', color: '#0F2C59', countPerHour: 1928 },
    { name: 'Buses & Heavies (2.5 PCU)', value: 12, pcuFactor: '2.5', color: '#1E4D8C', countPerHour: 578 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A1F44] border border-[#1E4D8C] p-2.5 rounded-lg shadow-lg text-[11px] font-mono text-white">
          <p className="text-[#94A3B8] font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between space-x-3">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-bold text-white tabular-nums">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3 font-sans">
      
      {/* Top Telemetry Header for Analytics */}
      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0A1F44] text-[#F5A623]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
              Telemetry Analytics & Environmental Audit Matrix
            </h2>
            <p className="text-[11px] text-[#475569]">
              MoRTH / SIH // Real-time high-throughput queue aggregation and Webster delay curves
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="flex bg-[#E2E8F0] p-0.5 rounded-lg border border-[#E2E8F0] text-[10px]">
            <button
              onClick={() => setActiveMetric('wait')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                activeMetric === 'wait' ? 'bg-[#0F2C59] text-white shadow-xs' : 'text-[#475569] hover:text-[#0A1F44]'
              }`}
            >
              Delay Curve
            </button>
            <button
              onClick={() => setActiveMetric('flow')}
              className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                activeMetric === 'flow' ? 'bg-[#0F2C59] text-white shadow-xs' : 'text-[#475569] hover:text-[#0A1F44]'
              }`}
            >
              PCU Flow
            </button>
          </div>

          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
            systemMode === 'adaptive'
              ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#15803D]'
              : 'bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]'
          }`}>
            {systemMode === 'adaptive' ? 'ADAPTIVE AI' : 'FIXED PLAN'}
          </span>
        </div>
      </div>

      {/* Main High-Density Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Left 8 Columns: Main Delay / Flow Chart */}
        <div className="lg:col-span-8 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
              {activeMetric === 'wait' ? 'Comparative Delay Curve: Adaptive AI vs Fixed Plan (Seconds)' : 'Real-Time PCU Throughput Trend'}
            </span>
            <div className="flex items-center space-x-3 text-[10px]">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                <span className="font-bold text-[#0A1F44]">Adaptive AI</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                <span className="font-semibold text-[#475569]">Fixed Baseline</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" tick={{ fill: '#475569', fontSize: 10, fontFamily: "'Noto Sans', sans-serif" }} />
                <YAxis stroke="#94A3B8" tick={{ fill: '#475569', fontSize: 10, fontFamily: "'Noto Sans', sans-serif" }} unit="s" />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="dynamicWait" 
                  name="Adaptive AI Wait" 
                  stroke="#16A34A" 
                  strokeWidth={2} 
                  fill="#16A34A"
                  fillOpacity={0.15} 
                />
                <Area 
                  type="monotone" 
                  dataKey="fixedWait" 
                  name="Fixed Baseline Wait" 
                  stroke="#DC2626" 
                  strokeWidth={2} 
                  fill="#DC2626"
                  fillOpacity={0.08} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[10px] text-[#475569]">
            <span>Cycle Sampling: 1000ms Interval</span>
            <span className="text-[#16A34A] font-bold">Average Wait Reduction: -38.6%</span>
            <span>Webster Delay Formula (IRC:106 Refinement)</span>
          </div>
        </div>

        {/* Right 4 Columns: Fleet Mix & PCU Equivalency */}
        <div className="lg:col-span-4 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
              Fleet Classification & PCU Mix
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569]">IRC-106</span>
          </div>

          <div className="h-[150px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleClassData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {vehicleClassData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 border-t border-[#E2E8F0] pt-2.5 text-[11px]">
            {vehicleClassData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-[#0A1F44] py-0.5">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-[#475569]">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  <span className="text-[#94A3B8] tabular-nums font-mono">{item.countPerHour} v/h</span>
                  <span className="font-bold text-[#0A1F44] tabular-nums">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Multi-Junction Node Matrix Table */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0A1F44] uppercase tracking-wider">
            Intersection Telemetry Audit Matrix (Live SCADA)
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F2C59]">
            {junctions.length} NODES CONNECTED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[10px] text-[#475569] uppercase bg-[#F8FAFC]">
                <th className="py-2 px-2.5 font-bold">NODE ID</th>
                <th className="py-2 px-2.5 font-bold">LOCATION NAME</th>
                <th className="py-2 px-2.5 font-bold">ACTIVE PHASE</th>
                <th className="py-2 px-2.5 font-bold">PCU LOAD</th>
                <th className="py-2 px-2.5 font-bold">ADAPTIVE GREEN</th>
                <th className="py-2 px-2.5 font-bold">AVG DELAY</th>
                <th className="py-2 px-2.5 font-bold">SAVED / VEH</th>
                <th className="py-2 px-2.5 font-bold">SENSOR FPS</th>
                <th className="py-2 px-2.5 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
              {junctions.map(j => {
                const saved = Math.max(0, (j.baselineWaitTimeSec - j.averageWaitTimeSec).toFixed(1));
                return (
                  <tr key={j.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-2 px-2.5 font-bold text-[#0F2C59] font-mono">{j.code}</td>
                    <td className="py-2 px-2.5 text-[#0A1F44] font-medium">{j.name}</td>
                    <td className="py-2 px-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E2E8F0] text-[#0A1F44] font-bold">
                        {j.activePhase} ({j.phaseTimer}s)
                      </span>
                    </td>
                    <td className="py-2 px-2.5 font-bold text-[#0A1F44] tabular-nums">{j.totalPcu} PCU</td>
                    <td className="py-2 px-2.5 text-[#16A34A] font-bold tabular-nums">{j.dynamicGreenTime}s</td>
                    <td className="py-2 px-2.5 text-[#475569] tabular-nums">{j.averageWaitTimeSec}s</td>
                    <td className="py-2 px-2.5 text-[#16A34A] font-bold tabular-nums">-{saved}s</td>
                    <td className="py-2 px-2.5 text-[#94A3B8] tabular-nums font-mono">{j.fps} FPS ({j.inferenceMs}ms)</td>
                    <td className="py-2 px-2.5">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        j.status === 'congested' ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]' :
                        j.status === 'moderate' ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]' :
                        'bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]'
                      }`}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environmental ROI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">IDLE FUEL CONSERVED</span>
          <div className="text-2xl font-black text-[#16A34A] tabular-nums">
            {systemMetrics.fuelSavedLiters.toFixed(1)} Liters
          </div>
          <span className="text-[10px] text-[#94A3B8]">Rate: 0.00028 L/sec delay reduction</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">CO₂ EMISSIONS AVOIDED</span>
          <div className="text-2xl font-black text-[#0F2C59] tabular-nums">
            {systemMetrics.co2ReducedKg.toFixed(1)} kg CO₂
          </div>
          <span className="text-[10px] text-[#94A3B8]">Factor: 2.31 kg CO₂ / L gasoline</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">COMMUTER ECONOMIC VALUE</span>
          <div className="text-2xl font-black text-[#F5A623] tabular-nums">
            ₹{systemMetrics.totalCostSavedRupees.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-[#94A3B8]">Retail fuel + Indian time value</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">TOTAL VEHICLES PROCESSED</span>
          <div className="text-2xl font-black text-[#0A1F44] tabular-nums">
            {systemMetrics.totalVehiclesPassed.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#16A34A] font-bold">0 Incident Gridlock Rate</span>
        </div>
      </div>

    </div>
  );
};

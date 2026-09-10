import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  BarChart3,
  Compass,
  Clock,
  Activity,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
  TrendingUp,
  Car,
  Timer,
  Fuel,
  Leaf,
  IndianRupee,
  Play,
  Pause,
  TrafficCone,
  Siren
} from 'lucide-react';
import { useTrafficData } from '../utils/useTrafficData';
import Loader from '../components/Loader';
import { BenchmarkComparison } from '../components/BenchmarkComparison';


const Analytics = ({ onNavigate }) => {
  const {
    state,
    metrics,
    analyticsSession,
    loading,
    simulationSpeed,
    setSpeed,
    resetSimulation,
    comparisonResult,
    comparisonStatus,
    comparisonError,
    rerunComparison,
    videoReplayActive
  } = useTrafficData();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'charts' | 'environmental'

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader message="Loading Current Simulation Analytics Engine..." />
      </div>
    );
  }

  const session = analyticsSession || {
    sessionId: 'SIM-INIT',
    sessionStartTime: Date.now(),
    sessionDurationSeconds: 0,
    eventCount: 0,
    isRunning: false,
    totalVehicles: 0,
    vehiclesProcessed: 0,
    activeVehicles: 0,
    emergencyVehicles: 0,
    emergencyPreemptions: 0,
    averageWaitTime: 0,
    hasWaitTimeData: false,
    peakActiveVehicles: 0,
    peakQueueLength: 0,
    peakThroughput: 0,
    currentThroughput: 0,
    vehicleTypeData: [],
    laneData: [],
    signalStateData: [],
    timeSeries: [],
    hasTimeSeriesData: false,
    emergencyEvents: [],
    sustainability: { hasData: false }
  };

  // Format session duration helper
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const startTimeString = new Date(session.sessionStartTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const isSimulationActive = simulationSpeed > 0;
  const hasData = session.totalVehicles > 0 || session.vehiclesProcessed > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">

      {/* ── 1. Page Header & Session Control Strip ─────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight flex items-center gap-2">
                <BarChart3 className="text-[#F5A623]" size={28} />
                <span>Traffic Analytics</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Real-time analytics from the current simulation session. Zero mocked or fabricated numbers.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setSpeed(isSimulationActive ? 0 : 1)}
              className="px-3.5 py-2 text-sm font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {isSimulationActive ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulationActive ? 'Pause Sim' : 'Resume Sim'}</span>
            </button>

            <button
              onClick={resetSimulation}
              className="px-3.5 py-2 text-sm font-bold rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Clear all session data and start fresh"
            >
              <RotateCcw size={14} />
              <span>Reset Session</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('live-intersection')}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-[#0F2C59] hover:bg-[#163A6B] text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Compass size={14} />
              <span>Live Intersection</span>
            </button>
          </div>

        </div>

        {/* Session Metadata Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-sm text-slate-600">
          <div>
            <span className="text-slate-400 block font-medium text-[11px]">Session ID</span>
            <span className="font-mono font-bold text-slate-800">{session.sessionId}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium text-[11px]">Session Started</span>
            <span className="font-semibold text-slate-800">{startTimeString}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium text-[11px]">Elapsed Duration</span>
            <span className="font-semibold text-slate-800">{formatDuration(session.sessionDurationSeconds)}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium text-[11px]">Recorded Events</span>
            <span className="font-semibold text-[#0F2C59]">{session.eventCount} events</span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 block font-medium text-[11px]">Active Signal</span>
            <span className="font-bold text-[#0F2C59]">Lane {state?.signal || 'N'}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Required KPI Cards (Current Session Data) ────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">

        {/* Total Vehicles */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Total Vehicles</span>
            <Car size={16} className="text-[#0F2C59]" />
          </div>
          <div className="mt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0A1F44] tracking-tight">
              {session.totalVehicles}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Generated in session</p>
          </div>
        </div>

        {/* Vehicles Processed */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Processed</span>
            <CheckCircle2 size={16} className="text-[#0F2C59]" />
          </div>
          <div className="mt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0A1F44] tracking-tight">
              {session.vehiclesProcessed}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Cleared intersection</p>
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Active in Grid</span>
            <Activity size={16} className="text-[#0F2C59]" />
          </div>
          <div className="mt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0A1F44] tracking-tight">
              {session.activeVehicles}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">In approach lanes</p>
          </div>
        </div>

        {/* Average Waiting Time */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#F5A623]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Avg Wait Time</span>
            <Timer size={16} className="text-[#F5A623]" />
          </div>
          <div className="mt-2">
            {session.hasWaitTimeData ? (
              <span className="text-3xl sm:text-4xl font-black text-[#F5A623] tracking-tight">
                {session.averageWaitTime}s
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-400 block py-1.5">
                Insufficient data
              </span>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">Measured wait/car</p>
          </div>
        </div>

        {/* Peak Traffic */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#0F2C59]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Peak Traffic</span>
            <TrendingUp size={16} className="text-[#0F2C59]" />
          </div>
          <div className="mt-2">
            {session.peakActiveVehicles > 0 ? (
              <span className="text-3xl sm:text-4xl font-black text-[#0A1F44] tracking-tight">
                {session.peakActiveVehicles}
              </span>
            ) : (
              <span className="text-sm font-semibold text-slate-400 block py-1.5">
                Insufficient data
              </span>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">Max concurrent cars</p>
          </div>
        </div>

        {/* Emergency Vehicles */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs flex flex-col justify-between hover:border-[#DC2626]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Emergency</span>
            <ShieldAlert size={16} className="text-[#DC2626]" />
          </div>
          <div className="mt-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0A1F44] tracking-tight">
              {session.emergencyVehicles}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {session.emergencyPreemptions} priority waves
            </p>
          </div>
        </div>

      </div>

      {/* Derived Environmental & Commuter Benefit Audit */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0A1F44]">Derived Environmental & Commuter Impact</h3>
            <p className="text-sm text-slate-500">
              Calculated strictly from {session.vehiclesProcessed} passed cars & measured delay reduction (Baseline: {session.sustainability?.baselineDelay ? `${session.sustainability.baselineDelay}s` : '45.0s'})
            </p>
          </div>
          <span className="text-xs bg-[#0A1F44] text-[#F5A623] border border-[#1E4D8C] font-bold px-2.5 py-0.5 rounded-full">
            DERIVED MATRIX
          </span>
        </div>

        {session.sustainability.hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between text-[#0F2C59] text-sm font-bold">
                <span>Fuel Conserved</span>
                <Fuel size={16} className="text-[#0F2C59]" />
              </div>
              <div className="text-3xl font-black text-[#0A1F44]">
                {session.sustainability.fuelSavedLiters} L
              </div>
              <p className="text-[10px] text-slate-500">Rate: 0.00028 L/sec delay reduction</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center justify-between text-[#0F2C59] text-sm font-bold">
                <span>CO₂ Avoided</span>
                <Leaf size={16} className="text-[#0F2C59]" />
              </div>
              <div className="text-3xl font-black text-[#0A1F44]">
                {session.sustainability.co2ReducedKg} kg
              </div>
              <p className="text-[10px] text-slate-500">Factor: 2.31 kg CO₂ per liter</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#F5A623]/30 space-y-1">
              <div className="flex items-center justify-between text-[#B8860B] text-sm font-bold">
                <span>Economic Value</span>
                <IndianRupee size={16} className="text-[#B8860B]" />
              </div>
              <div className="text-3xl font-black text-[#B8860B]">
                ₹{session.sustainability.economicSavingsRupees.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-amber-800/80">Retail fuel + commuter time value</p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            <AlertCircle size={24} className="mx-auto mb-1.5 text-slate-300" />
            <p className="font-semibold text-slate-600">Insufficient Data for Environmental Audit</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Vehicles must pass through the intersection to compute measured fuel & emissions savings.</p>
          </div>
        )}
      </div>

      {/* ── Saved Benchmark Comparison Section (Phase 3B) ──────── */}
      <BenchmarkComparison
        data={comparisonResult}
        status={comparisonStatus}
        error={comparisonError}
        onRerun={rerunComparison}
        isLiveRun={videoReplayActive}
      />

      {/* ── 3. Empty State Guard if No Traffic Generated Yet ────── */}

      {!hasData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-3xl">
            <TrafficCone size={18} className="text-[#F5A623]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No traffic data yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Start the simulation or allow the current session to spawn vehicles. Analytics will automatically record and visualize live telemetry.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate && onNavigate('live-intersection')}
              className="px-5 py-2.5 rounded-xl bg-[#0F2C59] text-white text-sm font-bold hover:bg-[#163A6B] transition cursor-pointer"
            >
              Open Live Intersection
            </button>
          </div>
        </div>
      )}

      {/* ── 4. Main Charts Grid ─────────────────────────────────── */}
      {hasData && (
        <div className="space-y-6">

          {/* Row 1: Volume Over Time & Throughput Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 1: Traffic Volume Over Time */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1F44]">Traffic Volume Over Time</h3>
                  <p className="text-sm text-slate-500">Active vs Processed vehicle counts across simulation ticks</p>
                </div>
                <span className="text-xs bg-[#0A1F44]/5 text-[#0F2C59] border border-[#0F2C59]/20 font-bold px-2.5 py-0.5 rounded-full">
                  LINE CHART
                </span>
              </div>

              <div className="h-[250px] w-full pt-2">
                {session.hasTimeSeriesData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={session.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A1F44', borderRadius: '8px', border: '1px solid #1E4D8C', color: '#FFFFFF', fontSize: '11px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                        labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line
                        type="monotone"
                        dataKey="activeVehicles"
                        name="Active in Lanes"
                        stroke="#0F2C59"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="processedVehicles"
                        name="Total Cleared"
                        stroke="#16A34A"
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Insufficient time-series data
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Traffic Throughput Trend */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1F44]">Traffic Throughput (Cars / Min)</h3>
                  <p className="text-sm text-slate-500">Real processing velocity derived from actual passed vehicles</p>
                </div>
                <span className="text-xs bg-[#FFFBEB] text-[#B8860B] border border-[#F5A623]/30 font-bold px-2.5 py-0.5 rounded-full">
                  RATE TREND
                </span>
              </div>

              <div className="h-[250px] w-full pt-2">
                {session.hasTimeSeriesData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={session.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} unit=" c/m" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A1F44', borderRadius: '8px', border: '1px solid #1E4D8C', color: '#FFFFFF', fontSize: '11px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                        labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line
                        type="monotone"
                        dataKey="throughput"
                        name="Throughput (cars/min)"
                        stroke="#F5A623"
                        strokeWidth={2.5}
                        dot={{ fill: '#F5A623', r: 2 }}
                        isAnimationActive={false}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    Insufficient throughput data
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Row 2: Traffic by Lane & Vehicle Type Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 3: Traffic by Lane / Direction (Bar Chart) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1F44]">Traffic by Lane / Direction</h3>
                  <p className="text-sm text-slate-500">Actual vehicle counts generated vs processed per approach</p>
                </div>
                <span className="text-xs bg-[#0A1F44]/5 text-[#0F2C59] border border-[#0F2C59]/20 font-bold px-2.5 py-0.5 rounded-full">
                  BAR CHART
                </span>
              </div>

              <div className="h-[250px] w-full pt-2">
                {session.laneData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={session.laneData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="label" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A1F44', borderRadius: '8px', border: '1px solid #1E4D8C', color: '#FFFFFF', fontSize: '11px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                        labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="arrivals" name="Total Spawned" fill="#0F2C59" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="processed" name="Cleared" fill="#16A34A" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                      <Bar dataKey="activeQueue" name="Queued" fill="#F5A623" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No lane data recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Chart 4: Vehicle Type Distribution (Pie Chart) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1F44]">Vehicle Type Distribution</h3>
                  <p className="text-sm text-slate-500">Actual classification breakdown from current session traffic</p>
                </div>
                <span className="text-xs bg-[#0A1F44]/5 text-[#0F2C59] border border-[#0F2C59]/20 font-bold px-2.5 py-0.5 rounded-full">
                  PIE CHART
                </span>
              </div>

              <div className="h-[250px] w-full flex flex-col sm:flex-row items-center justify-center">
                {session.vehicleTypeData.length > 0 ? (
                  <>
                    <div className="w-[180px] h-[180px] shrink-0 flex items-center justify-center">
                      <PieChart width={180} height={180}>
                        <Pie
                          data={session.vehicleTypeData}
                          cx={90}
                          cy={90}
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="count"
                          isAnimationActive={false}
                        >
                          {session.vehicleTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0A1F44', borderRadius: '8px', border: '1px solid #1E4D8C', color: '#FFFFFF', fontSize: '11px' }}
                          itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                          labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                        />
                      </PieChart>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 sm:ml-4 flex-1">
                      {session.vehicleTypeData.map(item => (
                        <div key={item.type} className="flex items-center justify-between py-1 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-slate-900/10" style={{ backgroundColor: item.color }}></span>
                            <span className="font-semibold text-slate-800">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-600 font-medium">{item.count} cars</span>
                            <span className="font-bold text-slate-900">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No vehicle distribution data recorded
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Row 3: Signal Phase State Distribution & Queue Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 5: Signal State Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1F44]">Signal State Distribution</h3>
                  <p className="text-sm text-slate-500">Actual time allocated to green phase per direction</p>
                </div>
                <span className="text-xs bg-[#FFFBEB] text-[#B8860B] border border-[#F5A623]/30 font-bold px-2.5 py-0.5 rounded-full">
                  PHASE TIME
                </span>
              </div>

              <div className="h-[250px] w-full flex flex-col sm:flex-row items-center justify-center">
                {session.signalStateData.length > 0 ? (
                  <>
                    <div className="w-[180px] h-[180px] shrink-0 flex items-center justify-center">
                      <PieChart width={180} height={180}>
                        <Pie
                          data={session.signalStateData}
                          cx={90}
                          cy={90}
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="seconds"
                          isAnimationActive={false}
                        >
                          {session.signalStateData.map((entry, index) => (
                            <Cell key={`sig-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0A1F44', borderRadius: '8px', border: '1px solid #1E4D8C', color: '#FFFFFF', fontSize: '11px' }}
                          itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                          labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                        />
                      </PieChart>
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 sm:ml-4 flex-1">
                      {session.signalStateData.map(item => (
                        <div key={item.direction} className="flex items-center justify-between py-1 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full shrink-0 shadow-xs ring-1 ring-slate-900/10" style={{ backgroundColor: item.color }}></span>
                            <span className="font-semibold text-slate-800">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="text-slate-600 font-medium">{item.seconds}s green</span>
                            <span className="font-bold text-slate-900">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-1 text-[11px] flex justify-between">
                        <span className="text-slate-600 font-medium">Total Switches:</span>
                        <span className="font-bold text-slate-900">{session.signalSwitchCount} times</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No signal phase data recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Chart 6: Queue & Congestion Trend */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#0A1F44]">Queue & Congestion Trend</h3>
                  <p className="text-sm text-slate-500">Real cumulative queue sizes observed across approaches</p>
                </div>
                <span className="text-xs bg-red-50 text-red-700 border border-red-200 font-bold px-2.5 py-0.5 rounded-full">
                  QUEUE SIZES
                </span>
              </div>

              <div className="h-[250px] w-full pt-2">
                {session.hasTimeSeriesData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={session.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="time" stroke="#475569" fontSize={11} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A1F44', borderRadius: '8px', border: '1px solid #1E4D8C', color: '#FFFFFF', fontSize: '11px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                        labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="totalQueue" name="Total Queue" stroke="#DC2626" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={true} />
                      <Line type="monotone" dataKey="queueN" name="Lane N" stroke="#F5A623" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls={true} />
                      <Line type="monotone" dataKey="queueS" name="Lane S" stroke="#16A34A" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls={true} />
                      <Line type="monotone" dataKey="queueE" name="Lane E" stroke="#0F2C59" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls={true} />
                      <Line type="monotone" dataKey="queueW" name="Lane W" stroke="#1E4D8C" strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls={true} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No queue trend data recorded yet
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Row 4: Emergency Vehicle Priority Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0A1F44]">Emergency Priority Log</h3>
                <p className="text-sm text-slate-500">Actual priority pre-emption activations</p>
              </div>
              <span className="text-xs bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded-full">
                {session.emergencyEvents.length} Events
              </span>
            </div>

            <div className="space-y-2.5 max-h-[200px] overflow-y-auto pt-1">
              {session.emergencyEvents.length > 0 ? (
                session.emergencyEvents.map(evt => (
                  <div key={evt.id} className="p-2.5 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between text-sm">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-red-900">
                        <Siren size={16} className="text-red-500" />
                        <span>Lane {evt.direction} Preemption</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{evt.timestamp} • {evt.id}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${evt.resolved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-200 text-red-900 animate-pulse'
                      }`}>
                      {evt.resolved ? 'CLEARED' : 'ACTIVE'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-400">
                  <ShieldAlert size={28} className="mx-auto mb-2 text-slate-300" />
                  No emergency vehicles detected in this session
                </div>
              )}
            </div>
          </div>

        </div>
      )}


    </div>
  );
};

export default Analytics;

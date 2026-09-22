import React, { useState, useMemo } from 'react';
import {
  Truck,
  Package,
  Clock,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Scale,
  Warehouse,
  TrendingDown,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { useLanguage } from '../context/LanguageContext';
import LogisticsIntersectionVisualizer from '../components/logistics/LogisticsIntersectionVisualizer';
import LogisticsVehicleInspector from '../components/logistics/LogisticsVehicleInspector';
import FreightGreenWavePanel from '../components/logistics/FreightGreenWavePanel';
import LogisticsHubPanel from '../components/logistics/LogisticsHubPanel';
import CorridorProgressionView from '../components/logistics/CorridorProgressionView';
import { computeCorridorCoordination, CORRIDORS } from '../utils/CorridorCoordinator';

// MODELED CORRIDOR BASELINE
// Provenance: Derived from existing defaults in CorridorCoordinator.js (20 PCU, 35 km/h)
// Configurable Simulation Assumption
const MODELED_CORRIDOR_BASELINE = {
  totalPcu: 80,
  approachData: {
    N: { pcu: 20, speedKmph: 35 },
    S: { pcu: 20, speedKmph: 35 },
    E: { pcu: 20, speedKmph: 35 },
    W: { pcu: 20, speedKmph: 35 }
  },
  activePhase: 'NS',
  phaseTimer: 0
};

export default function LogisticsSimulationPage({ onNavigate }) {
  const { lang } = useLanguage();
  const {
    state,
    metrics,
    strategy,
    setStrategy,
    simulationSpeed,
    setSpeed,
    resetSimulation,
    freightDemandMultiplier = 1.0,
    setFreightDemandMultiplier,
    triggerLogisticsScenario
  } = useSimulation();

  const [isPaused, setIsPaused] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeScenario, setActiveScenario] = useState('normal');

  const flattenedCars = useMemo(
    () =>
      Object.entries(state?.cars || {}).flatMap(([lane, laneCars]) =>
        laneCars.map(car => ({
          ...car,
          lane
        }))
      ),
    [state?.cars]
  );

  const commercialVehicles = useMemo(() => {
    return flattenedCars.filter(c => c.isCommercial);
  }, [flattenedCars]);

  const deliveryVansCount = commercialVehicles.filter(c => c.type === 'delivery_van').length;
  const freightTrucksCount = commercialVehicles.filter(c => c.type === 'freight_truck' || c.type === 'truck').length;

  const totalCargoTonnage = useMemo(() => {
    return Number(
      commercialVehicles.reduce((sum, v) => sum + (v.cargoTonnage || (v.type === 'freight_truck' ? 8.5 : 1.2)), 0).toFixed(1)
    );
  }, [commercialVehicles]);

  const totalFreightPcu = useMemo(() => {
    return Number(
      commercialVehicles.reduce((sum, v) => sum + (v.pcuEquivalent || (v.type === 'freight_truck' ? 2.5 : 1.5)), 0).toFixed(1)
    );
  }, [commercialVehicles]);

  // Selected vehicle object
  const selectedVehicle = useMemo(() => {
    if (selectedVehicleId) {
      const found = flattenedCars.find(c => c.id === selectedVehicleId);
      if (found) return found;
    }
    return commercialVehicles[0] || null;
  }, [flattenedCars, selectedVehicleId, commercialVehicles]);

  // Active freight green wave decision for selected or leading approach
  const activeFreightDecisions = state?.freightGreenWaveDecisions || [];
  const activeDecision = useMemo(() => {
    if (selectedVehicle) {
      const match = activeFreightDecisions.find(d => d.vehicleId === selectedVehicle.id || d.approach === selectedVehicle.lane);
      if (match) return match;
    }
    return activeFreightDecisions[0] || null;
  }, [activeFreightDecisions, selectedVehicle]);

  const hubs = state?.logisticsHubs || [];
  const freightTelemetry = state?.freightTelemetry || {};

  const corridorData = useMemo(() => {
    // 1. Live J3 Node using actual simulation demand & signal
    // Because the simulation engine does not export a live average physical velocity,
    // J3's speedKmph cannot be derived from live throughput. It falls back to explicitly modeled 35 km/h.
    const liveN = state?.queues?.N || 0;
    const liveS = state?.queues?.S || 0;
    const liveE = state?.queues?.E || 0;
    const liveW = state?.queues?.W || 0;
    const j3LiveState = {
      id: 'J3',
      totalPcu: liveN + liveS + liveE + liveW,
      approachData: {
        N: { pcu: liveN, speedKmph: 35 },
        S: { pcu: liveS, speedKmph: 35 },
        E: { pcu: liveE, speedKmph: 35 },
        W: { pcu: liveW, speedKmph: 35 }
      },
      activePhase: (state?.signal === 'N' || state?.signal === 'S') ? 'NS' : 'EW',
      phaseTimer: state?.signal_timer || 0
    };

    // 2. Modeled Baseline Nodes J1, J2, J4
    const j1ModeledState = { ...MODELED_CORRIDOR_BASELINE, id: 'J1' };
    const j2ModeledState = { ...MODELED_CORRIDOR_BASELINE, id: 'J2' };
    const j4ModeledState = { ...MODELED_CORRIDOR_BASELINE, id: 'J4' };

    const macroJunctions = [j1ModeledState, j2ModeledState, j3LiveState, j4ModeledState];

    return computeCorridorCoordination(macroJunctions, CORRIDORS[0], true);
  }, [state?.queues, state?.signal, state?.signal_timer]);

  // Handle Scenario Switch
  const handleScenarioChange = (scenarioKey) => {
    setActiveScenario(scenarioKey);
    if (triggerLogisticsScenario) {
      triggerLogisticsScenario(scenarioKey);
    }
  };

  return (
    <div className="max-w-[1520px] mx-auto px-4 sm:px-8 space-y-6 pb-12">
      {/* 1. Page Header & Operational Badges */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0A1F44] text-[#F5A623] flex items-center justify-center font-black shadow-xs">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black text-[#0A1F44] tracking-tight">
                  LOGISTICS & FREIGHT OPERATIONS
                </h1>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <Activity size={10} className="animate-pulse" />
                  <span>SIMULATION ACTIVE</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Logistics-focused operational view of the shared traffic simulation.
              </p>
            </div>
          </div>
        </div>

        {/* Strategy Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setStrategy('adaptive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              strategy === 'adaptive'
                ? 'bg-[#0A1F44] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={14} className="text-[#F5A623]" />
            <span>{lang === 'HI' ? 'अनुकूली (माल प्राथमिकता)' : 'Adaptive (Freight-Aware)'}</span>
          </button>
          <button
            onClick={() => setStrategy('fixed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              strategy === 'fixed'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={14} />
            <span>{lang === 'HI' ? 'नियत बेसलाइन (IRC-67)' : 'Fixed Baseline (IRC-67)'}</span>
          </button>
        </div>
      </div>

      {/* Judge Context Box */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-sm text-blue-900 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>MARG-DRISHTI</strong> extends junction-level traffic management into freight operations by monitoring commercial vehicles, logistics hubs, curb constraints and freight-priority signal coordination. This page is an isolated operational lens reflecting the <strong>LIVE SIMULATION</strong> state.
        </p>
      </div>

      {/* 2. Simulation Operational Controls & Scenario Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Engine Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                if (isPaused) {
                  setSpeed(simulationSpeed || 1.0);
                  setIsPaused(false);
                } else {
                  setSpeed(0);
                  setIsPaused(true);
                }
              }}
              className="px-3 py-1.5 rounded-md bg-white text-slate-800 text-xs font-bold shadow-xs hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
            >
              {isPaused ? <Play size={14} className="text-emerald-600" /> : <Pause size={14} className="text-amber-600" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={() => {
                resetSimulation();
                setSelectedVehicleId(null);
                setIsPaused(false);
              }}
              className="px-2.5 py-1.5 rounded-md text-slate-600 hover:text-slate-900 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <span className="text-[10px] text-slate-400 px-1 uppercase">Speed:</span>
            {[0.5, 1.0, 2.0, 4.0].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  setIsPaused(false);
                }}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  simulationSpeed === s && !isPaused
                    ? 'bg-[#0A1F44] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Freight Demand Multiplier */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
            <span className="text-[10px] text-slate-400 px-1 uppercase">Freight Rate:</span>
            {[
              { label: 'Low (0.5x)', val: 0.5 },
              { label: 'Normal (1.0x)', val: 1.0 },
              { label: 'Peak (1.8x)', val: 1.8 }
            ].map(d => (
              <button
                key={d.val}
                onClick={() => setFreightDemandMultiplier && setFreightDemandMultiplier(d.val)}
                className={`px-2 py-1 rounded transition cursor-pointer ${
                  freightDemandMultiplier === d.val
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Operational Scenario Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase">{lang === 'HI' ? 'परिदृश्य:' : 'Scenario:'}</span>
          <select
            value={activeScenario}
            onChange={(e) => handleScenarioChange(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="normal">1. Normal Mixed Traffic</option>
            <option value="peak_freight">2. Peak Freight Corridor Flow</option>
            <option value="hub_congestion">3. Logistics Hub Dwell Saturation</option>
            <option value="spillback_throttling">4. Downstream Spillback Throttling</option>
            <option value="emergency_conflict">5. Emergency vs Freight Priority</option>
          </select>
        </div>
      </div>

      {/* 3. Real-Time Logistics KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Active Freight */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Freight</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {commercialVehicles.length}
            <span className="text-[11px] font-medium text-slate-500 ml-1">
              ({deliveryVansCount} vans / {freightTrucksCount} trucks)
            </span>
          </div>
          <div className="text-[9px] font-extrabold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            LIVE SIMULATION
          </div>
        </div>

        {/* KPI 2: En-Route Cargo */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>En-Route Cargo</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalCargoTonnage} <span className="text-[11px] font-medium text-slate-500">tonnes</span>
          </div>
          <div className="text-[9px] font-extrabold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            SIMULATED FREIGHT LOAD
          </div>
        </div>

        {/* KPI 3: Loading Bays */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
              <span>Loading Bays</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {hubs.reduce((acc, h) => acc + (h.bays || []).filter(b => b.status === 'DWELLING' || b.status === 'OCCUPIED').length, 0)}
            <span className="text-[11px] font-medium text-slate-500 ml-1">
              / {hubs.reduce((acc, h) => acc + (h.totalBays || 3), 0)} active
            </span>
          </div>
          <div className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            LIVE SIMULATION
          </div>
        </div>

        {/* KPI 4: Freight Demand */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-purple-600" />
              <span>Freight Demand</span>
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {totalFreightPcu} <span className="text-[11px] font-medium text-slate-500">PCUs</span>
          </div>
          <div className="text-[9px] font-extrabold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            DERIVED
          </div>
        </div>

        {/* KPI 5: Green-Wave Grants */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Green-Wave Grants</span>
            </div>
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {freightTelemetry.greenWaveGranted || 0}
            <span className="text-[11px] font-medium text-slate-500 ml-1">
              ({freightTelemetry.greenWaveOpportunities > 0 ? `${Math.round(((freightTelemetry.greenWaveGranted || 0) / freightTelemetry.greenWaveOpportunities) * 100)}%` : '—'})
            </span>
          </div>
          <div className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            LIVE SIMULATION
          </div>
        </div>

        {/* KPI 6: Projected Delay Reduction */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
            <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Projected Delay Reduction</span>
          </div>
          <div className="text-sm font-black text-slate-400 mt-1">
            Unavailable
            <span className="text-[9px] font-normal text-slate-400 ml-1 block leading-tight">
              (Baseline comparison unavailable in live Logistics mode)
            </span>
          </div>
          <div className="text-[9px] font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase mt-2 inline-block">
            UNAVAILABLE
          </div>
        </div>
      </div>

      {/* 4. Main Two-Column Operational Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 2D Simulation Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <LogisticsIntersectionVisualizer
            state={state}
            selectedVehicleId={selectedVehicle?.id}
            onSelectVehicle={(veh) => setSelectedVehicleId(veh ? veh.id : null)}
            strategy={strategy}
          />
        </div>

        {/* RIGHT COLUMN: Hubs, Green Wave & Vehicle Inspector (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          <LogisticsHubPanel
            hubs={hubs}
            telemetry={state?.logisticsTelemetry}
          />

          <FreightGreenWavePanel
            activeDecision={activeDecision}
            telemetry={freightTelemetry}
            strategy={strategy}
          />

          <LogisticsVehicleInspector
            selectedVehicle={selectedVehicle}
            activeFreightDecision={activeDecision}
            allCommercialVehicles={commercialVehicles}
            onSelectVehicle={(veh) => setSelectedVehicleId(veh ? veh.id : null)}
          />
        </div>
      </div>

      {/* 5. Corridor Progression View (Bottom Full-Width) */}
      <div className="w-full">
        <CorridorProgressionView
          corridorData={corridorData}
          activeVehicles={flattenedCars}
          strategy={strategy}
        />
      </div>
    </div>
  );
}

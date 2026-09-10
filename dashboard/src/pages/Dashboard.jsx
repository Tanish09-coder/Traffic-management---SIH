import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize, Sun, CloudRain, CloudFog, Video, BarChart2, ChevronDown, ChevronUp, Sliders, RotateCcw, Car as CarIcon, Clock, BarChart3, AlertTriangle, TrafficCone, Siren, PersonStanding } from 'lucide-react';
import { useTrafficData } from '../utils/useTrafficData';
import Car from '../components/car';
import TrafficLight from '../components/TrafficLight';
import PedestrianLight from '../components/PedestrianLight';
import ParkEnvironment from '../components/ParkEnvironment';
import AIDecisionPanel from '../components/AIDecisionPanel';
import StatCard from '../components/StatCard';
import ChartPanel from '../components/ChartPanel';
import WeatherEffects from '../components/WeatherEffects';
import Loader from '../components/Loader';
import { calculateEnvironmentalImpact } from '../utils/environmentalImpact';

const Dashboard = () => {
  const {
    state,
    metrics,
    loading,
    error,
    useMock,
    simulationSpeed,
    weatherMode,
    generatedDemand,
    stagedDemand,
    demandPendingReset,
    setGeneratedDemandMultiplier,
    setSpeed,
    setWeather,
    resetSimulation,
    triggerEmergencyVehicle
  } = useTrafficData();

  // Control panel collapse/expand state
  const [showControls, setShowControls] = useState(true);

  // Live timestamp formatted like screenshot
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setCurrentTimeFormatted(d.toLocaleString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen state
  const intersectionRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!intersectionRef.current) return;
    if (!document.fullscreenElement) {
      intersectionRef.current.requestFullscreen().catch((err) => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Sustainability & Economic Savings calculation
  const [savingsStats, setSavingsStats] = useState({
    fuelSavedLiters: 0,
    timeSavedMinutes: 0,
    co2ReducedKg: 0,
    totalSavingsRupees: 0
  });

  useEffect(() => {
    if (state || metrics) {
      const carsPassed = state?.cars_passed || metrics?.total_cars || 0;
      const currentAvgWait = (typeof state?.avg_wait_time === 'number' && state.avg_wait_time > 0)
        ? state.avg_wait_time
        : (metrics?.current_avg_wait_time || 30.0);

      const impact = calculateEnvironmentalImpact(carsPassed, currentAvgWait, 45.0);

      setSavingsStats({
        fuelSavedLiters: impact.fuelSavedLiters,
        timeSavedMinutes: Number((impact.commuterTimeSaved / 60).toFixed(1)),
        co2ReducedKg: impact.co2ReducedKg,
        totalSavingsRupees: impact.economicSavingsRupees
      });
    }
  }, [state, metrics]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader message="Initializing Traffic System..." />
      </div>
    );
  }

  const activeRoadsCount = state?.roads_with_traffic?.length || 4;
  const currentSignalDir = state?.signal || 'E';
  const dirNames = { N: 'North Bound', S: 'South Bound', E: 'East Bound', W: 'West Bound' };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl text-xs flex items-center space-x-2"
          >
            <AlertTriangle size={16} className="text-amber-500" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Alert Banner */}
      <AnimatePresence>
        {state?.emergencyActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3.5 bg-red-50 border-2 border-red-500 text-red-800 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs"
          >
            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            <Siren size={18} className="text-red-600" />
            <span>
              EMERGENCY PRIORITY ACTIVE: Approach {state.emergencyDirection} → GREEN • Cross Traffic Halted
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. 4 KPI CARDS matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <StatCard
          title="VEHICLES PASSED"
          value={state?.cars_passed || 32}
          icon={CarIcon}
          trend="↑ +12%"
          trendSubtext="vs. last 5 minutes"
          color="blue"
        />
        <StatCard
          title="AVERAGE WAIT TIME"
          value={state?.avg_wait_time ? Math.round(state.avg_wait_time) : 31}
          unit="sec"
          icon={Clock}
          trend="↓ -18%"
          trendSubtext="vs. last 5 minutes"
          color="orange"
        />
        <StatCard
          title="TOTAL THROUGHPUT"
          value={typeof metrics?.throughput === 'number' ? Math.round(metrics.throughput) : 18}
          unit="cars/min"
          icon={BarChart3}
          trend="↑ +6%"
          trendSubtext="vs. last 5 minutes"
          color="green"
        />
        <StatCard
          title="EMERGENCY VEHICLES"
          value={metrics?.emergency_count || (state?.emergencyActive ? 1 : 0)}
          unit="active"
          icon={AlertTriangle}
          trend="— 0%"
          trendSubtext="vs. last 5 minutes"
          color="purple"
        />
      </div>

      {/* 2. SIGNAL OPTIMIZATION & DEMAND CONTROL PANEL */}
      <AIDecisionPanel showAllocationDetails={false} />

      {/* 3. MAIN SECTION: Left (72%) Live Intersection & Right (28%) Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-[72%_calc(28%-1rem)] gap-4 items-start mb-4">
        
        {/* LEFT COLUMN: Live Intersection View */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-[#E3EAF0]">
          {/* Intersection Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
            <div className="flex items-center space-x-2">
              <Video className="w-4 h-4 text-[#13B8B2]" />
              <h2 className="text-sm font-bold text-[#172333]">
                Live Intersection View
              </h2>
            </div>

            {/* Road status pills matching screenshot */}
            <div className="flex flex-wrap items-center gap-1.5">
              {['N', 'S', 'E', 'W'].map(dir => {
                const dirFullNames = { N: 'North', S: 'South', E: 'East', W: 'West' };
                const isGreen = state?.signal === dir && state?.phase === 'GREEN';
                const isYellow = state?.signal === dir && state?.phase === 'YELLOW';
                const label = isGreen ? 'OPEN' : isYellow ? 'CLEARING' : 'CLOSED';
                
                return (
                  <div
                    key={dir}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      isGreen
                        ? 'bg-[#13B8B2] text-white shadow-xs'
                        : isYellow
                          ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                          : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                    }`}
                  >
                    {dirFullNames[dir]}: {label}
                  </div>
                );
              })}

              <button
                onClick={toggleFullscreen}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#64748B] transition-colors ml-1 cursor-pointer"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
              </button>
            </div>
          </div>

          {/* Simulation Canvas Container with Neutral Ground & Compact Environment */}
          <div
            ref={intersectionRef}
            className={`relative w-full bg-[#D9DEE3] rounded-2xl overflow-hidden border border-[#CBD2D9] shadow-xs select-none ${
              isFullscreen ? 'h-full' : 'h-[380px]'
            }`}
          >
            {/* Neutral Ground, Sidewalks, and Compact Realistic Greenery */}
            <ParkEnvironment isFullscreen={isFullscreen} />

            {/* Road asphalt layers & markings */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Horizontal road (#454D57 dark slate) */}
              <div
                className={`absolute top-1/2 left-0 w-full bg-[#454D57] transform -translate-y-1/2 shadow-xs ${
                  isFullscreen ? 'h-40' : 'h-20'
                }`}
              >
                {/* Yellow double center line */}
                <div className="absolute top-1/2 left-0 w-full h-[2.5px] bg-[#EAB308] transform -translate-y-1/2 shadow-xs" />
                {/* Dashed lane lines */}
                <div className="absolute top-1/4 left-0 w-full border-t border-dashed border-white/50" />
                <div className="absolute top-3/4 left-0 w-full border-t border-dashed border-white/50" />
              </div>

              {/* Vertical road (#454D57 dark slate) */}
              <div
                className={`absolute left-1/2 top-0 h-full bg-[#454D57] transform -translate-x-1/2 shadow-xs ${
                  isFullscreen ? 'w-40' : 'w-20'
                }`}
              >
                {/* Yellow double center line */}
                <div className="absolute left-1/2 top-0 w-[2.5px] h-full bg-[#EAB308] transform -translate-x-1/2 shadow-xs" />
                {/* Dashed lane lines */}
                <div className="absolute left-1/4 top-0 h-full border-l border-dashed border-white/50" />
                <div className="absolute left-3/4 top-0 h-full border-l border-dashed border-white/50" />
              </div>

              {/* Center Intersection Box (#3E4754 with subtle dashed yellow boundary) */}
              <div
                className={`absolute top-1/2 left-1/2 bg-[#3E4754] rounded-xs transform -translate-x-1/2 -translate-y-1/2 border border-dashed border-yellow-400/40 shadow-inner ${
                  isFullscreen ? 'w-40 h-40' : 'w-20 h-20'
                }`}
              />

              {/* Direction Arrows Painted on Road Lanes matching screenshot */}
              <div className={`absolute left-1/2 text-white/90 font-extrabold tracking-wider z-10 select-none ${
                isFullscreen ? 'top-6 transform -translate-x-1/2 text-sm' : 'top-3.5 transform -translate-x-1/2 text-[11px]'
              }`}>
                N ↑
              </div>
              <div className={`absolute left-1/2 text-white/90 font-extrabold tracking-wider z-10 select-none ${
                isFullscreen ? 'bottom-6 transform -translate-x-1/2 text-sm' : 'bottom-3.5 transform -translate-x-1/2 text-[11px]'
              }`}>
                S ↓
              </div>
              <div className={`absolute top-1/2 text-white/90 font-extrabold tracking-wider z-10 select-none ${
                isFullscreen ? 'left-8 transform -translate-y-1/2 text-sm' : 'left-5 transform -translate-y-1/2 text-[11px]'
              }`}>
                W ←
              </div>
              <div className={`absolute top-1/2 text-white/90 font-extrabold tracking-wider z-10 select-none ${
                isFullscreen ? 'right-8 transform -translate-y-1/2 text-sm' : 'right-5 transform -translate-y-1/2 text-[11px]'
              }`}>
                E →
              </div>


              {/* Zebra Crosswalks */}
              {/* North Crosswalk */}
              {(() => {
                const pN = state?.pedestrian_signals?.N || 'STOP';
                const isWalk = pN === 'WALK';
                return (
                  <>
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 z-10 pointer-events-none ${
                        isFullscreen
                          ? 'top-[calc(50%-145px)] w-32 h-12'
                          : 'top-[calc(50%-78px)] w-16 h-6.5'
                      }`}
                    >
                      <div className="w-full h-full flex justify-between px-0.5">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-full rounded-[0.5px] bg-white shadow-xs ${
                              isFullscreen ? 'w-[3.5px]' : 'w-[2px]'
                            }`}
                          />
                        ))}
                      </div>
                      {isWalk && (
                        <motion.div
                          className={`absolute select-none pointer-events-none filter drop-shadow-md ${
                            isFullscreen ? 'text-sm -top-4' : 'text-xs -top-3'
                          }`}
                          animate={{ left: ['-5%', '100%'], opacity: [0, 1, 1, 1, 0] }}
                          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
                        >
                          <PersonStanding size={16} className="text-slate-600" />
                        </motion.div>
                      )}
                    </div>
                    <div
                      className={`absolute z-20 ${
                        isFullscreen
                          ? 'left-[calc(50%+84px)] top-[calc(50%-148px)]'
                          : 'left-[calc(50%+42px)] top-[calc(50%-80px)]'
                      }`}
                    >
                      <PedestrianLight status={pN} isFullscreen={isFullscreen} />
                    </div>
                  </>
                );
              })()}

              {/* South Crosswalk */}
              {(() => {
                const pS = state?.pedestrian_signals?.S || 'STOP';
                const isWalk = pS === 'WALK';
                return (
                  <>
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 z-10 pointer-events-none ${
                        isFullscreen
                          ? 'top-[calc(50%+102px)] w-32 h-12'
                          : 'top-[calc(50%+55px)] w-16 h-6.5'
                      }`}
                    >
                      <div className="w-full h-full flex justify-between px-0.5">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-full rounded-[0.5px] bg-white shadow-xs ${
                              isFullscreen ? 'w-[3.5px]' : 'w-[2px]'
                            }`}
                          />
                        ))}
                      </div>
                      {isWalk && (
                        <motion.div
                          className={`absolute select-none pointer-events-none filter drop-shadow-md ${
                            isFullscreen ? 'text-sm -top-4' : 'text-xs -top-3'
                          }`}
                          animate={{ left: ['105%', '-5%'], opacity: [0, 1, 1, 1, 0] }}
                          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
                        >
                          <PersonStanding size={16} className="text-slate-600" />
                        </motion.div>
                      )}
                    </div>
                    <div
                      className={`absolute z-20 ${
                        isFullscreen
                          ? 'left-[calc(50%-98px)] top-[calc(50%+102px)]'
                          : 'left-[calc(50%-52px)] top-[calc(50%+55px)]'
                      }`}
                    >
                      <PedestrianLight status={pS} isFullscreen={isFullscreen} />
                    </div>
                  </>
                );
              })()}

              {/* West Crosswalk */}
              {(() => {
                const pW = state?.pedestrian_signals?.W || 'STOP';
                const isWalk = pW === 'WALK';
                return (
                  <>
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 z-10 flex flex-col justify-between pointer-events-none ${
                        isFullscreen
                          ? 'left-[calc(50%-145px)] w-12 h-32 py-0.5'
                          : 'left-[calc(50%-78px)] w-6.5 h-16 py-0.5'
                      }`}
                    >
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-full rounded-[0.5px] bg-white shadow-xs ${
                            isFullscreen ? 'h-[3.5px]' : 'h-[2px]'
                          }`}
                        />
                      ))}
                      {isWalk && (
                        <motion.div
                          className={`absolute select-none pointer-events-none filter drop-shadow-md ${
                            isFullscreen ? 'text-sm -left-4' : 'text-xs -left-3'
                          }`}
                          animate={{ top: ['-5%', '100%'], opacity: [0, 1, 1, 1, 0] }}
                          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
                        >
                          <PersonStanding size={16} className="text-slate-600" />
                        </motion.div>
                      )}
                    </div>
                    <div
                      className={`absolute z-20 ${
                        isFullscreen
                          ? 'left-[calc(50%-148px)] top-[calc(50%-98px)]'
                          : 'left-[calc(50%-80px)] top-[calc(50%-52px)]'
                      }`}
                    >
                      <PedestrianLight status={pW} isFullscreen={isFullscreen} />
                    </div>
                  </>
                );
              })()}

              {/* East Crosswalk */}
              {(() => {
                const pE = state?.pedestrian_signals?.E || 'STOP';
                const isWalk = pE === 'WALK';
                return (
                  <>
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 z-10 flex flex-col justify-between pointer-events-none ${
                        isFullscreen
                          ? 'left-[calc(50%+102px)] w-12 h-32 py-0.5'
                          : 'left-[calc(50%+55px)] w-6.5 h-16 py-0.5'
                      }`}
                    >
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-full rounded-[0.5px] bg-white shadow-xs ${
                            isFullscreen ? 'h-[3.5px]' : 'h-[2px]'
                          }`}
                        />
                      ))}
                      {isWalk && (
                        <motion.div
                          className={`absolute select-none pointer-events-none filter drop-shadow-md ${
                            isFullscreen ? 'text-sm -right-4' : 'text-xs -right-3'
                          }`}
                          animate={{ top: ['105%', '-5%'], opacity: [0, 1, 1, 1, 0] }}
                          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
                        >
                          <PersonStanding size={16} className="text-slate-600" />
                        </motion.div>
                      )}
                    </div>
                    <div
                      className={`absolute z-20 ${
                        isFullscreen
                          ? 'left-[calc(50%+102px)] top-[calc(50%+84px)]'
                          : 'left-[calc(50%+55px)] top-[calc(50%+42px)]'
                      }`}
                    >
                      <PedestrianLight status={pE} isFullscreen={isFullscreen} />
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Traffic Lights for 4 approaches */}
            <TrafficLight
              direction="N"
              signal={state?.signal}
              phase={state?.phase}
              emergencyActive={state?.emergencyActive && state?.emergencyDirection === 'N'}
              isFullscreen={isFullscreen}
            />
            <TrafficLight
              direction="S"
              signal={state?.signal}
              phase={state?.phase}
              emergencyActive={state?.emergencyActive && state?.emergencyDirection === 'S'}
              isFullscreen={isFullscreen}
            />
            <TrafficLight
              direction="E"
              signal={state?.signal}
              phase={state?.phase}
              emergencyActive={state?.emergencyActive && state?.emergencyDirection === 'E'}
              isFullscreen={isFullscreen}
            />
            <TrafficLight
              direction="W"
              signal={state?.signal}
              phase={state?.phase}
              emergencyActive={state?.emergencyActive && state?.emergencyDirection === 'W'}
              isFullscreen={isFullscreen}
            />

            {/* Cars simulation */}
            <AnimatePresence>
              {state?.cars &&
                Object.entries(state.cars).map(([lane, cars]) =>
                  cars.map(car => (
                    <Car
                      key={`${car.id}-${lane}`}
                      id={car.id}
                      lane={lane}
                      position={car.position}
                      speed={car.speed}
                      type={car.type}
                      isFullscreen={isFullscreen}
                    />
                  ))
                )}
            </AnimatePresence>

            {/* Weather Visual Effects Layer (Rain & Fog) */}
            <WeatherEffects weatherMode={state?.weather_mode || weatherMode || 'normal'} isFullscreen={isFullscreen} />

            {/* Queue counts per lane */}
            {state?.queues &&
              Object.entries(state.queues).map(([lane, count]) => (
                <div
                  key={lane}
                  className={`absolute text-[11px] font-bold text-white bg-[#1E293B]/90 px-2 py-0.5 rounded-md shadow-xs z-30 ${
                    lane === 'N'
                      ? 'top-2 left-1/2 transform -translate-x-1/2'
                      : lane === 'S'
                        ? 'bottom-2 left-1/2 transform -translate-x-1/2'
                        : lane === 'E'
                          ? 'right-2 top-1/2 transform -translate-y-1/2'
                          : 'left-2 top-1/2 transform -translate-y-1/2'
                  }`}
                >
                  {lane}: {count}
                </div>
              ))}

            {/* Fullscreen Floating Controls (Weather & Exit) */}
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-40 flex items-center space-x-1.5 pointer-events-auto bg-[#172333]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg select-none">
                {[
                  { mode: 'normal', label: 'Clear', icon: Sun },
                  { mode: 'rain', label: 'Rain', icon: CloudRain },
                  { mode: 'fog', label: 'Fog', icon: CloudFog }
                ].map(({ mode, label, icon: Icon }) => {
                  const currentMode = (state?.weather_mode || weatherMode || 'normal').toLowerCase();
                  const isActive = (mode === 'normal' && (currentMode === 'normal' || currentMode === 'clear')) || currentMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setWeather && setWeather(mode)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                        isActive
                          ? 'bg-[#13B8B2] text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{label}</span>
                    </button>
                  );
                })}
                <div className="w-[1px] h-4 bg-white/20 mx-1" />
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Exit Fullscreen"
                >
                  <Minimize size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Status & Control Rows directly below the intersection canvas */}
          <div className="mt-3.5 space-y-2.5">
            {/* Row 1: Current status pill & weather pills matching screenshot */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Current Signal status capsule */}
              <div className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#172333] text-white shadow-xs">
                Current: {state?.signal || 'E'} ({state?.phase || 'GREEN'}) | Green remaining: {state?.phase_remaining_sec ?? 2}s
              </div>

              {/* Weather selector pills */}
              <div className="flex items-center p-0.5 rounded-full bg-[#F1F5F9] border border-[#E3EAF0]">
                {[
                  { mode: 'normal', label: 'Clear', icon: Sun },
                  { mode: 'rain', label: 'Rain', icon: CloudRain },
                  { mode: 'fog', label: 'Fog', icon: CloudFog }
                ].map(({ mode, label, icon: Icon }) => {
                  const currentMode = (state?.weather_mode || weatherMode || 'normal').toLowerCase();
                  const isActive = (mode === 'normal' && (currentMode === 'normal' || currentMode === 'clear')) || currentMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setWeather && setWeather(mode)}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center space-x-1 cursor-pointer ${
                        isActive
                          ? 'bg-[#13B8B2] text-white shadow-xs'
                          : 'text-[#64748B] hover:text-[#172333]'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Manual clearance info & EMERGENCY MODE button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F1F5F9]">
              {/* Manual clearance status */}
              <div className="flex items-center space-x-1 text-xs text-[#64748B]">
                <TrafficCone size={16} className="text-slate-700" />
                <span className="font-semibold text-[#172333]">Manual:</span>
                <span>Yellow {state?.yellow_duration || 3}s → All-red {state?.all_red_duration || 1}s</span>
              </div>

              {/* Emergency button matching screenshot */}
              <button
                onClick={() => triggerEmergencyVehicle && triggerEmergencyVehicle()}
                disabled={state?.emergencyActive}
                className={`px-5 py-1.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer ${
                  state?.emergencyActive
                    ? 'bg-red-700 animate-pulse cursor-default'
                    : 'bg-[#EF4444] hover:bg-red-600 active:scale-95'
                }`}
                title="Dispatch emergency vehicle"
              >
                <AlertTriangle size={16} className="text-amber-500" />
                <span>{state?.emergencyActive ? `EMERGENCY ACTIVE (${state?.emergencyDirection || ''})` : 'EMERGENCY MODE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Analytics Panel matching screenshot */}
        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-[#E3EAF0]">
          {/* Analytics Header */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-[#13B8B2]" />
              <h3 className="text-sm font-bold text-[#172333]">Analytics</h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F0FDFA] text-[#13B8B2] border border-[#CCFBF1]">
              Real-Time ∨
            </span>
          </div>

          {/* 3 Quick Status Cards matching screenshot */}
          <div className="space-y-2 mb-3.5">
            {/* 1. Current Signal */}
            <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <TrafficCone size={16} className="text-slate-700" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#13B8B2]">
                    Current Signal
                  </div>
                  <div className="text-sm font-extrabold text-[#172333]">
                    {currentSignalDir} <span className="font-normal text-xs text-[#64748B]">{dirNames[currentSignalDir] || ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Active Roads */}
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CarIcon size={16} className="text-slate-600" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A]">
                    Active Roads
                  </div>
                  <div className="text-sm font-extrabold text-[#172333]">
                    {activeRoadsCount} / 4 <span className="font-normal text-xs text-[#64748B]">N, S, E, W</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Wait Time */}
            <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock size={16} className="text-slate-600" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
                    Wait Time
                  </div>
                  <div className="text-sm font-extrabold text-[#EA580C]">
                    {(state?.avg_wait_time || 31.0).toFixed(1)} s
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#16A34A]">
                  ↓ -18%
                </span>
                <div className="text-[9px] text-[#94A3B8]">
                  vs. last 5 min
                </div>
              </div>
            </div>
          </div>

          {/* Chart Panel (Wait Time Line Chart, Queue Lengths Bar Chart, Traffic Summary) */}
          <ChartPanel metrics={metrics} state={state} />
        </div>
      </div>

      {/* 4. SYSTEM CONTROLS matching screenshot */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E3EAF0] p-4 sm:p-5">
        {/* System Controls Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#F0FDFA] flex items-center justify-center border border-[#CCFBF1]">
              <Sliders className="w-4 h-4 text-[#13B8B2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172333]">System Controls</h3>
              <p className="text-[11px] text-[#64748B]">Configure simulation parameters and system actions</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Timestamp matching screenshot */}
            <span className="text-xs text-[#64748B] font-mono">
              {currentTimeFormatted}
            </span>

            {/* Chevron toggle to collapse/expand */}
            <button
              onClick={() => setShowControls(prev => !prev)}
              className="p-1 rounded-lg text-[#94A3B8] hover:text-[#172333] hover:bg-slate-100 transition cursor-pointer"
              title={showControls ? 'Collapse' : 'Expand'}
            >
              {showControls ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expandable Control Options */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-4 mt-4 border-t border-[#F1F5F9]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* 1. Generated Traffic */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Generated Traffic
                    </label>
                    {demandPendingReset && useMock && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        Next reset
                      </span>
                    )}
                  </div>
                  {useMock ? (
                    <div className="flex space-x-1 p-1 rounded-xl bg-[#F1F5F9]">
                      <button
                        onClick={() => setGeneratedDemandMultiplier && setGeneratedDemandMultiplier(0.5)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                          stagedDemand === 0.5
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#172333]'
                        }`}
                        title="Moderate demand: 0.5x"
                      >
                        Moderate (0.5x)
                      </button>
                      <button
                        onClick={() => setGeneratedDemandMultiplier && setGeneratedDemandMultiplier(1.0)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                          stagedDemand === 1.0
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'text-[#64748B] hover:text-[#172333]'
                        }`}
                        title="Peak time demand: 1.0x"
                      >
                        Peak (1.0x)
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 text-center">
                      Managed by Backend
                    </div>
                  )}
                </div>

                {/* 3. Simulation Speed */}
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Simulation Speed
                  </label>
                  {useMock ? (
                    <div className="flex space-x-1 p-1 rounded-xl bg-[#F1F5F9]">
                      {[1, 2, 3].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setSpeed(spd)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                            simulationSpeed === spd
                              ? 'bg-white text-[#172333] shadow-xs border border-[#E3EAF0]'
                              : 'text-[#64748B] hover:text-[#172333]'
                          }`}
                        >
                          {spd}x {spd === 1 ? '(Real Time)' : ''}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 text-center">
                      1x (Real Time)
                    </div>
                  )}
                </div>

                {/* 4. Actions */}
                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Actions
                  </label>
                  <button
                    onClick={resetSimulation}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white border border-[#E3EAF0] text-[#172333] hover:bg-slate-50 transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                  >
                    <RotateCcw size={13} className="text-[#64748B]" />
                    <span>Reset Simulation</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
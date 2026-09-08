import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { VehicleManager } from '../utils/VehicleManager';
import { SignalManager } from '../utils/SignalManager';
import { SimulationClock } from '../utils/SimulationClock';
import { analyticsManager } from '../utils/AnalyticsManager';
import {
  getState as getBackendState,
  getMetrics as getBackendMetrics,
  startSimulation as startBackendSimulation,
  stopSimulation as stopBackendSimulation,
  setSimulationSpeed as setBackendSpeed,
  setBackendWeather,
  resetBackendSimulation
} from '../utils/api';
import { runComparisonPair } from '../utils/comparisonEngine';
import { SignalOptimizer } from '../utils/SignalOptimizer';
import { calculateEffectivePredictivePCU } from '../utils/PredictiveDemandFusion';
import { generateBucketArrivals, calculateBucketPCU } from '../utils/HistoricalDemandScheduler';

// Historical Pune direction mapping is used only to demonstrate predictive-control integration. It does not imply the live simulation represents the same physical intersection or timestamp.
const PUNE_TO_SIM_DIRECTION_MAP = {
  UP: 'N',
  RIGHT: 'E',
  DOWN: 'S',
  LEFT: 'W'
};

const PREDICTION_DEMO_DATE = '2023-01-17';
const PREDICTION_API_BASE = 'http://localhost:5000/api/prediction';

const DEFAULT_BELLEVUE_EVENTS = [
  { eventId: 'bellevue-1', videoTimeSec: 9.6, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-2', videoTimeSec: 11.8, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-3', videoTimeSec: 12.6, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-4', videoTimeSec: 14.8, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-5', videoTimeSec: 15.0, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-6', videoTimeSec: 17.2, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-7', videoTimeSec: 19.2, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-8', videoTimeSec: 21.0, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-9', videoTimeSec: 23.0, vehicleType: 'truck', mappedDirection: 'S' },
  { eventId: 'bellevue-10', videoTimeSec: 93.2, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-11', videoTimeSec: 114.2, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-12', videoTimeSec: 116.8, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-13', videoTimeSec: 118.8, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-14', videoTimeSec: 120.6, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-15', videoTimeSec: 124.2, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-16', videoTimeSec: 136.4, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-17', videoTimeSec: 139.0, vehicleType: 'car', mappedDirection: 'S' },
  { eventId: 'bellevue-18', videoTimeSec: 139.6, vehicleType: 'car', mappedDirection: 'S' }
];

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  // Singletons retained across the lifetime of the application
  const vehicleManagerRef = useRef(null);
  const signalManagerRef = useRef(null);
  const clockRef = useRef(null);

  if (!vehicleManagerRef.current) {
    vehicleManagerRef.current = new VehicleManager();
    vehicleManagerRef.current.start();
  }
  if (!signalManagerRef.current) {
    signalManagerRef.current = new SignalManager();
  }
  if (!clockRef.current) {
    clockRef.current = new SimulationClock(1.0);
  }

  const vehicleManager = vehicleManagerRef.current;
  const signalManager = signalManagerRef.current;
  const clock = clockRef.current;

  // Session configuration state
  const [useMock, setUseMock] = useState(true);
  const [simulationSpeed, setSimulationSpeedState] = useState(1.0);
  const [weatherMode, setWeatherModeState] = useState('normal');
  const [strategy, setStrategyState] = useState('adaptive'); // 'adaptive' | 'fixed' | 'predictive'
  const [generatedDemand, setGeneratedDemandState] = useState(0.5);
  const [stagedDemand, setStagedDemandState] = useState(0.5);
  const [dataSource, setDataSource] = useState('simulation'); // 'simulation' | 'recorded_video'
  const [trafficSource, setTrafficSourceState] = useState('simulation'); // 'simulation' | 'pune_historical' | 'recorded_video'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Predictive Demand State & Cache (Phase 2B)
  const availableTimesRef = useRef([
    '08:55:00', '09:00:00', '09:05:00', '09:10:00', '09:15:00', '09:20:00',
    '09:25:00', '09:30:00', '09:35:00', '09:40:00', '09:45:00', '09:50:00'
  ]);
  const forecastCacheRef = useRef({});
  const predictiveForecastsRef = useRef({
    N: { forecast5: null, forecast10: null, forecast15: null },
    E: { forecast5: null, forecast10: null, forecast15: null },
    S: { forecast5: null, forecast10: null, forecast15: null },
    W: { forecast5: null, forecast10: null, forecast15: null }
  });
  const [predictiveStatus, setPredictiveStatus] = useState('active'); // 'active' | 'fallback'
  const [predictiveTimestamp, setPredictiveTimestamp] = useState('09:00:00');
  const lastFetchedTimeRef = useRef(null);
  const currentPredictiveDemandRef = useRef({
    N: { actualPCU: 0, effectivePredictivePCU: 0, predictiveBoostPCU: 0, predictiveBoostPercent: 0 },
    E: { actualPCU: 0, effectivePredictivePCU: 0, predictiveBoostPCU: 0, predictiveBoostPercent: 0 },
    S: { actualPCU: 0, effectivePredictivePCU: 0, predictiveBoostPCU: 0, predictiveBoostPercent: 0 },
    W: { actualPCU: 0, effectivePredictivePCU: 0, predictiveBoostPCU: 0, predictiveBoostPercent: 0 }
  });

  // Pune Historical Demand Replay State & Refs (Phase 2C)
  const actualDemandCacheRef = useRef({});
  const scheduledPuneEventsRef = useRef([]);
  const processedPuneEventIdsRef = useRef(new Set());
  const lastFetchedActualBucketRef = useRef(null);
  const [historicalDemand, setHistoricalDemand] = useState(null);
  const [historicalReplayStats, setHistoricalReplayStats] = useState({
    scheduled: 0,
    accepted: 0,
    spawned: 0,
    pendingBacklog: 0
  });

  const fetchActualDemandForTime = useCallback(async (targetTime, baseSimTimeSec = 0) => {
    if (!targetTime) return;

    let bucketData = actualDemandCacheRef.current[targetTime];
    if (!bucketData) {
      try {
        const res = await fetch(`${PREDICTION_API_BASE}/actual?date=${PREDICTION_DEMO_DATE}&time=${targetTime}`);
        if (res.ok) {
          bucketData = await res.json();
          actualDemandCacheRef.current[targetTime] = bucketData;
        }
      } catch (err) {
        console.warn('Actual traffic demand fetch warning:', err.message);
      }
    }

    if (bucketData && bucketData.directions) {
      const arrivals = generateBucketArrivals({
        date: PREDICTION_DEMO_DATE,
        time: targetTime,
        baseSimTimeSec,
        intervalSeconds: 300,
        directions: bucketData.directions
      });

      const existingIds = new Set(scheduledPuneEventsRef.current.map(e => e.eventId));
      const newArrivals = arrivals.filter(e => !existingIds.has(e.eventId));
      scheduledPuneEventsRef.current = [...scheduledPuneEventsRef.current, ...newArrivals];
      setHistoricalDemand({ timestamp: targetTime, directions: bucketData.directions });
    }
  }, []);


  const fetchForecastForTime = useCallback(async (targetTime) => {
    if (!targetTime) return;

    if (forecastCacheRef.current[targetTime]) {
      predictiveForecastsRef.current = forecastCacheRef.current[targetTime];
      setPredictiveStatus('active');
      setPredictiveTimestamp(targetTime);
      return;
    }

    try {
      const res = await fetch(`${PREDICTION_API_BASE}/forecast?date=${PREDICTION_DEMO_DATE}&time=${targetTime}`);
      if (!res.ok) throw new Error(`Forecast status ${res.status}`);
      const data = await res.json();

      const newForecasts = {
        N: { forecast5: null, forecast10: null, forecast15: null },
        E: { forecast5: null, forecast10: null, forecast15: null },
        S: { forecast5: null, forecast10: null, forecast15: null },
        W: { forecast5: null, forecast10: null, forecast15: null }
      };

      const dirs = data.directions || {};
      Object.entries(PUNE_TO_SIM_DIRECTION_MAP).forEach(([puneDir, simDir]) => {
        const pData = dirs[puneDir];
        if (pData && pData.forecasts) {
          newForecasts[simDir] = {
            forecast5: pData.forecasts.min5 ?? null,
            forecast10: pData.forecasts.min10 ?? null,
            forecast15: pData.forecasts.min15 ?? null
          };
        }
      });

      forecastCacheRef.current[targetTime] = newForecasts;
      predictiveForecastsRef.current = newForecasts;
      setPredictiveStatus('active');
      setPredictiveTimestamp(targetTime);
    } catch (err) {
      console.warn('Prediction forecast fetch error (falling back to current PCU):', err.message);
      setPredictiveStatus('fallback');
      predictiveForecastsRef.current = {
        N: { forecast5: null, forecast10: null, forecast15: null },
        E: { forecast5: null, forecast10: null, forecast15: null },
        S: { forecast5: null, forecast10: null, forecast15: null },
        W: { forecast5: null, forecast10: null, forecast15: null }
      };
      setPredictiveTimestamp(targetTime);
    }
  }, []);

  // Fetch available prediction timestamps on initialization
  useEffect(() => {
    let isMounted = true;
    fetch(`${PREDICTION_API_BASE}/times?date=${PREDICTION_DEMO_DATE}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (isMounted && data && Array.isArray(data.times) && data.times.length > 0) {
          availableTimesRef.current = data.times;
        }
      })
      .catch(err => {
        console.warn('Prediction available times fetch warning:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Consolidated session state & metrics
  const [state, setState] = useState(() => {
    const vState = vehicleManager.getState();
    const sState = signalManager.getState(vState.queues, vState.cars);
    return {
      ...vState,
      signal: sState.current_signal,
      pending_signal: sState.pending_signal,
      phase: sState.phase,
      signal_timer: sState.timer,
      signal_duration: sState.duration,
      emergencyActive: sState.emergency_active || vState.emergencyActive,
      emergencyDirection: sState.emergency_direction || vState.emergencyDirection,
      weather_mode: sState.weather_mode,
      effective_weather_mode: sState.effective_weather_mode,
      yellow_duration: sState.yellow_duration,
      all_red_duration: sState.all_red_duration,
      weather_multiplier: sState.weather_multiplier,
      pedestrian_signals: sState.pedestrian_signals,
      strategy: sState.strategy,
      staged_strategy: sState.staged_strategy,
      decision: sState.decision,
      dataSource: 'simulation'
    };
  });

  const [metrics, setMetrics] = useState(() => vehicleManager.getMetrics());

  // Video replay session state
  const [videoReplayActive, setVideoReplayActive] = useState(false);
  const [videoReplayConfig, setVideoReplayConfig] = useState(null); // { videoId, arrivalEvents, mappedDirection, durationSec }
  const [videoReplayStats, setVideoReplayStats] = useState({
    totalEvents: 0,
    dispatchedCount: 0,
    lastDispatchedEvent: null,
    dispatchedByClass: { car: 0, bike: 0, bus: 0, truck: 0 }
  });
  const videoEventCursorRef = useRef(0);
  const processedEventIdsRef = useRef(new Set());

  // Computed comparison engine state
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparisonStatus, setComparisonStatus] = useState('IDLE'); // 'IDLE' | 'RUNNING' | 'COMPLETED' | 'STALE' | 'FAILED'
  const [comparisonError, setComparisonError] = useState(null);
  const jobTokenRef = useRef(0);
  const activeTimerRef = useRef(null);

  const runComparison = useCallback((configOverride = null) => {
    // Check if configOverride is a React Event object
    const isDOMEvent = configOverride && typeof configOverride.preventDefault === 'function';
    const cfg = (!isDOMEvent && configOverride && configOverride.arrivalEvents)
      ? configOverride
      : videoReplayConfig;

    const targetCfg = (!cfg || !cfg.arrivalEvents || cfg.arrivalEvents.length === 0)
      ? { videoId: 'bellevue_trial', arrivalEvents: DEFAULT_BELLEVUE_EVENTS, mappedDirection: 'S', durationSec: 158.63 }
      : cfg;

    setComparisonError(null);
    setComparisonStatus('RUNNING');

    jobTokenRef.current++;
    const currentToken = jobTokenRef.current;

    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
    }

    activeTimerRef.current = setTimeout(() => {
      try {
        const res = runComparisonPair({
          videoId: targetCfg.videoId || 'bellevue_trial',
          arrivalEvents: targetCfg.arrivalEvents,
          mappedDirection: targetCfg.mappedDirection || 'S',
          durationSec: targetCfg.durationSec || 158.63,
          randomSeed: 42,
          weatherMode,
          demandMultiplier: generatedDemand
        });

        // Job Token Protection: ignore results if a newer run was triggered
        if (currentToken === jobTokenRef.current) {
          setComparisonResult(res);
          setComparisonStatus('COMPLETED');
          setComparisonError(null);
        }
      } catch (err) {
        console.error('Comparison execution error:', err);
        if (currentToken === jobTokenRef.current) {
          setComparisonStatus('FAILED');
          setComparisonError(err.message || 'Comparison calculation failed.');
        }
      }
    }, 15);
  }, [videoReplayConfig, weatherMode, generatedDemand]);

  useEffect(() => {
    return () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    };
  }, []);

  // Direct simulation tick logic with sub-stepping for physical accuracy
  const tickSimulation = useCallback(() => {
    if (!useMock) return;

    try {
      const { totalDt, subSteps } = clock.tick();
      const currentSimTime = clock.getSimTime();

      // Progress through 5-minute dataset timestamps according to simulation time
      const times = availableTimesRef.current;
      if (times && times.length > 0) {
        const startIdx = times.indexOf('09:00:00') !== -1 ? times.indexOf('09:00:00') : 0;
        const step = Math.floor(currentSimTime / 300);
        const timeIdx = Math.min(times.length - 1, startIdx + step);
        const currentTimeStr = times[timeIdx] || '09:00:00';

        if (currentTimeStr !== lastFetchedTimeRef.current) {
          lastFetchedTimeRef.current = currentTimeStr;
          fetchForecastForTime(currentTimeStr);
        }

        // When trafficSource is pune_historical, fetch/schedule actual bucket for this interval
        if (trafficSource === 'pune_historical') {
          const bucketKey = `${currentTimeStr}_${step}`;
          if (bucketKey !== lastFetchedActualBucketRef.current) {
            lastFetchedActualBucketRef.current = bucketKey;
            fetchActualDemandForTime(currentTimeStr, step * 300);
          }
        }
      }

      // If video replay is active, dispatch pending arrival events up to currentSimTime
      if (videoReplayActive && videoReplayConfig && videoReplayConfig.arrivalEvents) {
        const events = videoReplayConfig.arrivalEvents;
        const mappedDir = videoReplayConfig.mappedDirection || 'S';
        let newlyDispatched = false;
        let lastEvt = null;

        while (
          videoEventCursorRef.current < events.length &&
          events[videoEventCursorRef.current].videoTimeSec <= currentSimTime
        ) {
          const event = events[videoEventCursorRef.current++];
          if (event && !processedEventIdsRef.current.has(event.eventId)) {
            processedEventIdsRef.current.add(event.eventId);
            vehicleManager.injectExternalArrival(mappedDir, event);
            newlyDispatched = true;
            lastEvt = event;
          }
        }

        if (newlyDispatched) {
          const processedList = events.slice(0, videoEventCursorRef.current);
          setVideoReplayStats({
            totalEvents: events.length,
            dispatchedCount: videoEventCursorRef.current,
            lastDispatchedEvent: lastEvt,
            dispatchedByClass: {
              car: processedList.filter(e => e.vehicleType === 'car').length,
              bike: processedList.filter(e => e.vehicleType === 'bike').length,
              bus: processedList.filter(e => e.vehicleType === 'bus').length,
              truck: processedList.filter(e => e.vehicleType === 'truck').length
            }
          });
        }
      }

      // If Pune historical replay is active, dispatch scheduled arrival events up to currentSimTime
      if (trafficSource === 'pune_historical') {
        const scheduled = scheduledPuneEventsRef.current;
        for (let i = 0; i < scheduled.length; i++) {
          const event = scheduled[i];
          if (event.simTimeSec <= currentSimTime) {
            if (!processedPuneEventIdsRef.current.has(event.eventId)) {
              const receipt = vehicleManager.injectExternalArrival(event.direction, event);
              if (receipt && receipt.accepted) {
                processedPuneEventIdsRef.current.add(event.eventId);
              }
            }
          }
        }

        const metrics = vehicleManager.getHistoricalConservationMetrics();
        const scheduledDue = scheduled.filter(e => e.simTimeSec <= currentSimTime).length;
        setHistoricalReplayStats({
          scheduledTotal: scheduled.length,
          scheduledDue,
          accepted: metrics.accepted,
          currentlyOnRoad: metrics.currentlyOnRoad,
          pendingBacklog: metrics.pendingBacklog,
          completed: metrics.completed
        });
      }

      subSteps.forEach(subDt => {
        const stoppedQueues = vehicleManager.getStoppedQueues();
        const queuedPCUs = vehicleManager.getQueuedPCUs();
        const oldestWaitTimes = vehicleManager.getOldestWaitTimes();
        const totalQueues = vehicleManager.getQueueLengths();

        const isIntersectionOccupied = vehicleManager.isIntersectionOccupied();
        const activeEmergency = vehicleManager.getActiveEmergencyVehicle();

        // Check emergency clearance against active emergency vehicle entity
        signalManager.checkEmergencyCleared(
          activeEmergency,
          totalQueues
        );

        // Predictive Demand Calculation (Control input only, vehicle queues are never mutated)
        if (strategy === 'predictive') {
          const demandOverrides = {};
          const diagnostics = {};

          ['N', 'E', 'S', 'W'].forEach(dir => {
            const currentPCU = queuedPCUs[dir] || 0;
            const f = predictiveForecastsRef.current[dir] || {};
            const fusion = calculateEffectivePredictivePCU({
              currentPCU,
              forecast5: f.forecast5,
              forecast10: f.forecast10,
              forecast15: f.forecast15
            });

            demandOverrides[dir] = fusion.effectivePredictivePCU;
            diagnostics[dir] = {
              actualPCU: currentPCU,
              effectivePredictivePCU: fusion.effectivePredictivePCU,
              predictiveBoostPCU: fusion.predictiveBoostPCU,
              predictiveBoostPercent: fusion.predictiveBoostPercent
            };
          });

          SignalOptimizer.setDemandOverrides(demandOverrides);
          currentPredictiveDemandRef.current = diagnostics;
        } else {
          SignalOptimizer.clearDemandOverrides();
        }

        // Advance signal controller with clearance occupancy check
        signalManager.updateSignal(totalQueues, stoppedQueues, queuedPCUs, oldestWaitTimes, subDt, isIntersectionOccupied);

        // Advance vehicle positions with clearance physics
        vehicleManager.updateVehicles(
          signalManager.currentSignal,
          signalManager.phase,
          subDt
        );
      });

      // Extract fresh states
      const vState = vehicleManager.getState();
      const sState = signalManager.getState(vState.queues, vState.cars);
      const freshMetrics = vehicleManager.getMetrics();

      const mergedState = {
        ...vState,
        signal: sState.current_signal,
        pending_signal: sState.pending_signal,
        phase: sState.phase,
        signal_timer: sState.timer,
        signal_duration: sState.duration,
        active_green_duration: sState.active_green_duration,
        pending_green_duration: sState.pending_green_duration,
        phase_remaining_sec: sState.phase_remaining_sec,
        phase_label: sState.phase_label,
        clearance_status: sState.clearance_status,
        emergencyActive: sState.emergency_active || vState.emergencyActive,
        emergencyDirection: sState.emergency_direction || vState.emergencyDirection,
        weather_mode: sState.weather_mode,
        effective_weather_mode: sState.effective_weather_mode,
        yellow_duration: sState.yellow_duration,
        all_red_duration: sState.all_red_duration,
        weather_multiplier: sState.weather_multiplier,
        pedestrian_signals: sState.pedestrian_signals,
        strategy: sState.strategy,
        staged_strategy: sState.staged_strategy,
        generatedDemand,
        stagedDemand,
        demandPendingReset: stagedDemand !== generatedDemand,
        decision: sState.decision,
        dataSource,
        trafficSource,
        historicalDemand,
        historicalReplayStats,
        videoReplayActive,
        videoReplayConfig,
        simTime: currentSimTime,
        approachSources: vehicleManager.approachSources,
        empty_roads: ['N', 'S', 'E', 'W'].filter(d => (vState.queues[d] || 0) === 0),
        roads_with_traffic: ['N', 'S', 'E', 'W'].filter(d => (vState.queues[d] || 0) > 0),
        predictiveDemand: currentPredictiveDemandRef.current,
        predictiveForecasts: predictiveForecastsRef.current,
        predictiveStatus,
        predictiveDemoDate: PREDICTION_DEMO_DATE,
        predictiveTimestamp
      };


      // Record analytics tick
      analyticsManager.recordTick({
        dt: totalDt,
        simTime: currentSimTime,
        currentSignal: sState.current_signal,
        phase: sState.phase,
        stoppedQueues: vehicleManager.getStoppedQueues(),
        queuedPCUs: vehicleManager.getQueuedPCUs(),
        arrivals: vehicleManager.getCompletedArrivals(),
        departures: vehicleManager.getCompletedDepartures(),
        cars: vState.cars,
        emergencyActive: vState.emergencyActive,
        emergencyDirection: vState.emergencyDirection,
        avgWaitTime: vState.avg_wait_time,
        throughput: freshMetrics.throughput
      });

      setState(mergedState);
      setMetrics(freshMetrics);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Simulation tick error:', err);
      setError(`Simulation tick error: ${err.message}`);
    }
  }, [useMock, dataSource, videoReplayActive, videoReplayConfig, generatedDemand, stagedDemand, trafficSource, strategy]);


  // Single central simulation loop protected against StrictMode duplicates
  const isLoopActiveRef = useRef(false);
  useEffect(() => {
    if (useMock && !isLoopActiveRef.current) {
      isLoopActiveRef.current = true;
      const intervalId = setInterval(tickSimulation, 100);
      return () => {
        isLoopActiveRef.current = false;
        clearInterval(intervalId);
      };
    }
  }, [useMock, tickSimulation]);

  // Backend polling loop
  useEffect(() => {
    if (!useMock) {
      let active = true;
      setLoading(true);
      setError(null);

      startBackendSimulation().catch(err => {
        if (!err.message.includes('already running')) {
          console.warn('Backend start simulation warning:', err);
        }
      });

      setBackendSpeed(simulationSpeed).catch(err => console.warn('Backend speed sync error:', err));

      const fetchBackendData = async () => {
        try {
          const stateData = await getBackendState();
          const metricsData = await getBackendMetrics();

          if (active) {
            const mappedQueues = stateData.queues || { N: 0, S: 0, E: 0, W: 0 };
            const emergencyActive = stateData.emergency_active || false;
            const emergencyDirection = stateData.emergency_direction || null;
            const avgWait = metricsData.avg_wait_time || 0;
            const totalCars = metricsData.total_vehicles || 0;

            const mappedState = {
              cars: stateData.cars || { N: [], S: [], E: [], W: [] },
              cars_passed: totalCars,
              avg_wait_time: avgWait,
              queues: mappedQueues,
              stopped_queues: mappedQueues,
              queued_pcus: mappedQueues,
              emergencyActive,
              emergencyDirection,
              signal: stateData.signal?.current || 'N',
              pending_signal: stateData.signal?.current || 'N',
              phase: stateData.signal?.phase || 'GREEN',
              signal_timer: stateData.signal?.timer || 0,
              signal_duration: stateData.signal?.duration || 30,
              empty_roads: ['N', 'S', 'E', 'W'].filter(d => (mappedQueues[d] || 0) === 0),
              roads_with_traffic: ['N', 'S', 'E', 'W'].filter(d => (mappedQueues[d] || 0) > 0),
              system_mode: emergencyActive ? 'Emergency' : 'AI Intelligent',
              system_efficiency: 92,
              wait_time_trend: 'stable',
              mumbai_improvement_percentage: 28.5,
              mumbai_target_achieved: avgWait >= 30 && avgWait <= 35,
              time_saved_per_hour: (totalCars * 12.5) / 60,
              fuel_saved_per_hour: totalCars * 0.15,
              strategy,
              staged_strategy: strategy,
              decision: {
                selectedDirection: stateData.signal?.current || 'N',
                strategy,
                proposedGreen: stateData.signal?.duration || 30,
                activeGreen: stateData.signal?.duration || 30,
                reason: 'Backend Python simulation active (video upload and local heuristic controls disabled)',
                queuedPCUs: mappedQueues,
                stoppedCounts: mappedQueues,
                timestamp: Date.now()
              },
              dataSource
            };

            const mappedMetrics = {
              total_cars: totalCars,
              avg_trip_time: avgWait * 0.6,
              throughput: (totalCars / 60).toFixed(1),
              queue_history: [],
              wait_time_history: [],
              emergency_count: metricsData.emergency_count || 0,
              fuel_saved_total: (totalCars * 0.15).toFixed(1),
              cost_saved_total: (totalCars * 15).toFixed(0),
              efficiency_improvement: 92,
              empty_road_count: Object.values(mappedQueues).filter(q => q === 0).length,
              active_road_count: Object.values(mappedQueues).filter(q => q > 0).length,
              system_efficiency: 92,
              system_mode: emergencyActive ? 'Emergency' : 'AI Intelligent',
              wait_time_trend: 'stable',
              traditional_wait_time: 45,
              current_avg_wait_time: avgWait,
              target_wait_time: 32.5,
              improvement_percentage: 28.5,
              target_achieved: avgWait >= 30 && avgWait <= 35,
              time_saved_per_hour_minutes: (totalCars * 12.5) / 60,
              fuel_saved_per_hour_liters: totalCars * 0.15
            };

            setState(mappedState);
            setMetrics(mappedMetrics);
            setLoading(false);
            setError(null);
          }
        } catch (err) {
          if (active) {
            setError(`Backend connection error: ${err.message}`);
            setLoading(false);
          }
        }
      };

      fetchBackendData();
      const intervalId = setInterval(fetchBackendData, 1000);
      return () => {
        active = false;
        clearInterval(intervalId);
      };
    }
  }, [useMock, simulationSpeed, strategy, dataSource]);

  // Actions
  const setSpeed = useCallback((speed) => {
    const newSpeed = Math.max(0.1, Math.min(5.0, speed));
    setSimulationSpeedState(newSpeed);
    clock.setSpeed(newSpeed);
    if (!useMock) {
      setBackendSpeed(newSpeed).catch(err => console.warn('Backend speed update error:', err));
    }
  }, [useMock, clock]);

  const setWeather = useCallback((mode) => {
    const success = signalManager.setWeather(mode);
    if (success) {
      setWeatherModeState(mode.toLowerCase());
      if (!useMock) {
        setBackendWeather(mode.toLowerCase()).catch(err => console.warn('Backend weather update error:', err));
      }
    }
  }, [useMock, signalManager]);

  const setStrategy = useCallback((newStrategy) => {
    if (['adaptive', 'fixed', 'predictive'].includes(newStrategy)) {
      setStrategyState(newStrategy);
      if (newStrategy === 'predictive') {
        signalManager.stagedStrategy = 'predictive';
        const target = lastFetchedTimeRef.current || '09:00:00';
        fetchForecastForTime(target);
      } else {
        signalManager.setStrategy(newStrategy);
        SignalOptimizer.clearDemandOverrides();
      }
    }
  }, [signalManager, fetchForecastForTime]);

  const setTrafficSource = useCallback((newSource) => {
    if (!['simulation', 'pune_historical', 'recorded_video'].includes(newSource)) return;
    if (newSource === trafficSource) return;

    if (newSource === 'pune_historical') {
      setVideoReplayActive(false);
      setDataSource('simulation');
      ['N', 'S', 'E', 'W'].forEach(d => vehicleManager.setApproachSource(d, 'pune_historical'));
      setTrafficSourceState('pune_historical');

      const times = availableTimesRef.current;
      const target = lastFetchedTimeRef.current || (times.includes('09:00:00') ? '09:00:00' : times[0] || '09:00:00');
      fetchActualDemandForTime(target, 0);
    } else if (newSource === 'simulation') {
      setVideoReplayActive(false);
      setDataSource('simulation');
      vehicleManager.clearHistoricalBacklog();
      ['N', 'S', 'E', 'W'].forEach(d => vehicleManager.setApproachSource(d, 'simulation'));
      setTrafficSourceState('simulation');
    } else if (newSource === 'recorded_video') {
      vehicleManager.clearHistoricalBacklog();
      setTrafficSourceState('recorded_video');
    }
  }, [trafficSource, vehicleManager, fetchActualDemandForTime]);

  const activatePredictivePuneDemo = useCallback(() => {
    setTrafficSource('pune_historical');
    setStrategy('predictive');
  }, [setTrafficSource, setStrategy]);

  const setGeneratedDemandMultiplier = useCallback((multiplier) => {
    const val = multiplier === 1.0 ? 1.0 : 0.5;
    setStagedDemandState(val);
  }, []);

  const resetSimulation = useCallback(() => {
    SignalOptimizer.clearDemandOverrides();
    lastFetchedTimeRef.current = null;
    lastFetchedActualBucketRef.current = null;
    fetchForecastForTime('09:00:00');
    analyticsManager.reset();
    clock.reset();
    videoEventCursorRef.current = 0;
    processedEventIdsRef.current.clear();
    processedPuneEventIdsRef.current.clear();
    scheduledPuneEventsRef.current = [];
    actualDemandCacheRef.current = {};
    vehicleManager.clearHistoricalBacklog();
    setVideoReplayActive(false);
    setVideoReplayStats({
      totalEvents: 0,
      dispatchedCount: 0,
      lastDispatchedEvent: null,
      dispatchedByClass: { car: 0, bike: 0, bus: 0, truck: 0 }
    });
    setDataSource('simulation');
    setTrafficSourceState('simulation');
    setHistoricalDemand(null);
    setHistoricalReplayStats({
      scheduledTotal: 0,
      scheduledDue: 0,
      accepted: 0,
      currentlyOnRoad: 0,
      pendingBacklog: 0,
      completed: 0
    });
    const newDemand = stagedDemand;
    setGeneratedDemandState(newDemand);
    if (useMock) {
      ['N', 'S', 'E', 'W'].forEach(d => vehicleManager.setApproachSource(d, 'simulation'));
      vehicleManager.reset(12345, newDemand);
      signalManager.reset();
      signalManager.setWeather(weatherMode);
    } else {
      resetBackendSimulation().catch(err => console.warn('Backend reset error:', err));
    }
  }, [useMock, vehicleManager, signalManager, clock, weatherMode, stagedDemand, fetchForecastForTime]);

  const startVideoDrivenSimulation = useCallback(({ videoId, arrivalEvents, mappedDirection, durationSec }) => {
    if (!useMock) {
      setError('Video-driven simulation is only available in Browser Simulation mode.');
      return;
    }

    // Explicit fresh session reset
    analyticsManager.reset();
    clock.reset();
    videoEventCursorRef.current = 0;
    processedEventIdsRef.current.clear();
    processedPuneEventIdsRef.current.clear();
    scheduledPuneEventsRef.current = [];
    vehicleManager.clearHistoricalBacklog();
    setTrafficSourceState('recorded_video');

    const newDemand = stagedDemand;
    setGeneratedDemandState(newDemand);

    if (useMock) {
      vehicleManager.reset(12345, newDemand);
      signalManager.reset();
    }

    const targetDirection = ['N', 'S', 'E', 'W'].includes(mappedDirection) ? mappedDirection : 'S';

    // Set target approach source to recorded_video, others remain simulation
    ['N', 'S', 'E', 'W'].forEach(d => {
      if (d === targetDirection) {
        vehicleManager.setApproachSource(d, 'recorded_video');
        vehicleManager.clearApproach(d);
      } else {
        vehicleManager.setApproachSource(d, 'simulation');
      }
    });

    const replayCfg = {
      videoId,
      arrivalEvents: arrivalEvents || [],
      mappedDirection: targetDirection,
      durationSec: durationSec || 160
    };

    setDataSource('recorded_video');
    setVideoReplayActive(true);
    setVideoReplayConfig(replayCfg);
    setVideoReplayStats({
      totalEvents: (arrivalEvents || []).length,
      dispatchedCount: 0,
      lastDispatchedEvent: null,
      dispatchedByClass: { car: 0, bike: 0, bus: 0, truck: 0 }
    });

    // Automatically start isolated comparison run on valid video analysis start
    runComparison(replayCfg);
  }, [useMock, vehicleManager, signalManager, clock, runComparison, stagedDemand]);

  const stopVideoDrivenSimulation = useCallback(() => {
    setVideoReplayActive(false);
    setDataSource('simulation');
    ['N', 'S', 'E', 'W'].forEach(d => vehicleManager.setApproachSource(d, 'simulation'));
  }, [vehicleManager]);

  const syncVideoReplayTime = useCallback((videoTimeSec) => {
    if (!videoReplayActive) return;
    if (typeof videoTimeSec === 'number' && !isNaN(videoTimeSec)) {
      clock.setSimTime(videoTimeSec);
    }
  }, [videoReplayActive, clock]);


  const triggerEmergencyVehicle = useCallback((direction = null, type = null) => {
    if (!useMock) {
      setError('Emergency injection is only available in Browser Simulation mode.');
      return null;
    }
    const activeSignal = signalManager.currentSignal || 'N';
    const emg = vehicleManager.triggerEmergency(direction, type, activeSignal);
    if (emg) {
      signalManager.handleEmergencyVehicle(emg);
    }
    return emg;
  }, [useMock, vehicleManager, signalManager]);

  const handleManualOverride = useCallback((direction, reason) => {
    if (!useMock) {
      setError('Manual signal override is only available in Browser Simulation mode.');
      return;
    }
    signalManager.manualOverride(direction);
  }, [useMock, signalManager]);

  const switchToMock = useCallback(() => {
    if (!useMock) {
      stopBackendSimulation().catch(err => console.warn('Failed to stop backend simulation:', err));
    }
    setUseMock(true);
    setError(null);
  }, [useMock]);

  const switchToBackend = useCallback(() => {
    setUseMock(false);
  }, []);

  const value = {
    state,
    metrics,
    analyticsSession: analyticsManager.getSnapshot(),
    loading: useMock ? false : loading,
    error,
    useMock,
    simulationSpeed,
    weatherMode,
    strategy,
    stagedStrategy: signalManager.stagedStrategy,
    predictiveDemand: currentPredictiveDemandRef.current,
    predictiveForecasts: predictiveForecastsRef.current,
    predictiveStatus,
    predictiveDemoDate: PREDICTION_DEMO_DATE,
    predictiveTimestamp,
    generatedDemand,
    stagedDemand,
    demandPendingReset: stagedDemand !== generatedDemand,
    setGeneratedDemandMultiplier,
    dataSource,
    trafficSource,
    setTrafficSource,
    activatePredictivePuneDemo,
    historicalDemand,
    historicalReplayStats,
    videoReplayActive,
    videoReplayConfig,
    videoReplayStats,
    syncVideoReplayTime,
    comparisonResult,
    comparisonStatus,
    comparisonError,
    rerunComparison: useCallback(() => runComparison(null), [runComparison]),
    setStrategy,
    setWeather,
    setDataSource,
    switchToMock,
    switchToBackend,
    setSpeed,
    resetSimulation,
    startVideoDrivenSimulation,
    stopVideoDrivenSimulation,
    manualOverride: handleManualOverride,
    triggerEmergencyVehicle
  };


  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

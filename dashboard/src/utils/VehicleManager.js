import { TRAFFIC_CONSTANTS } from './constants';

// Position threshold (0–100 scale) at which a car is considered to have
// entered the intersection and must be allowed to finish crossing.
// Cars at or beyond this point continue moving regardless of signal state —
// stopping them mid-intersection would look broken and be a collision risk.
// Cars below this point are still at the stop line and obey the signal normally.
const INTERSECTION_ENTRY_THRESHOLD = 42;

// Minimum position gap (in the 0–100 scale) that must exist between the
// position values of any two consecutive cars in the same lane.
// Increase this if SVG vehicle shapes are larger and need more visual breathing room.
// Arnav is halving shape sizes in parallel; together both changes close the overlap gap.
const MIN_VEHICLE_GAP = 8;

// Maximum position a queued (red-light) car may reach before the stop line.
// This is set deliberately below INTERSECTION_ENTRY_THRESHOLD so no stopped
// car ever drifts into the visual intersection box while waiting.
const STOP_LINE_POSITION = INTERSECTION_ENTRY_THRESHOLD - MIN_VEHICLE_GAP; // = 34

export class VehicleManager {
  constructor() {
    this.cars = { N: [], S: [], E: [], W: [] };
    this.carIdCounter = 0;
    this.emergencyVehicleCount = 0;
    this.emergencyCooldown = 0;
    this.carsPassed = 0;
    this.isRunning = false;
    this._startTime = Date.now();

    // Rolling history buffers used by chart panels
    this._queueHistory = [];      // last 30 queue snapshots
    this._waitTimeHistory = [];   // per-car wait times from passed cars
    this._throughputHistory = []; // throughput data points
  }

  updateVehicles(currentSignal) {
    Object.keys(this.cars).forEach(direction => {
      const updatedCars = this.cars[direction].filter(car => {

        // --- Intersection-entry check (Bug 1 fix) ---
        // Once a car crosses INTERSECTION_ENTRY_THRESHOLD it is committed to
        // the crossing. Flag it so the check survives future ticks even if
        // the signal switches away from this direction mid-crossing.
        if (car.position >= INTERSECTION_ENTRY_THRESHOLD && !car.inIntersection) {
          car.inIntersection = true;
        }

        // A car should move if ANY of the following is true:
        //   1. It is an emergency vehicle (always has priority).
        //   2. Its direction currently has the green light.
        //   3. It has already entered the intersection and must clear through
        //      — regardless of the current signal — to avoid freezing mid-cross.
        const hasGreen = direction === currentSignal;
        const mustClear = car.inIntersection; // committed to crossing

        if (hasGreen || mustClear || car.type === 'emergency') {
          car.position += car.speed;

          // --- Following-distance clamp ---
          // Find the car directly ahead of this one in the lane array.
          // Lane array is ordered front-to-back: index 0 is furthest ahead.
          // The current car's index inside updatedCars is not yet known at
          // filter time, so we look it up in the still-mutating this.cars array.
          const laneArr = this.cars[direction];
          const myIndex = laneArr.indexOf(car);
          if (myIndex > 0) {
            const carAhead = laneArr[myIndex - 1];
            if (carAhead && car.position > carAhead.position - MIN_VEHICLE_GAP) {
              // Clamp: stay at least MIN_VEHICLE_GAP behind the car ahead.
              car.position = carAhead.position - MIN_VEHICLE_GAP;
            }
          }

          // Check if car has fully passed the intersection
          if (car.position >= 100) {
            this.carsPassed++;
            // Record wait time only if the car genuinely waited (stopped cars only)
            if ((car.waitTime || 0) > 0) {
              this._waitTimeHistory.push(car.waitTime);
              if (this._waitTimeHistory.length > 100) {
                this._waitTimeHistory.shift();
              }
            }
            return false; // Remove from lane
          }
        } else {
          // Car is before the intersection stop line and its signal is red.
          // Accumulate wait time — this is the only place waitTime grows.
          // Also clamp to STOP_LINE_POSITION so queued cars never push into
          // the intersection box while waiting (visual + logic correctness).
          car.waitTime = (car.waitTime || 0) + 1;
          if (car.position > STOP_LINE_POSITION) {
            car.position = STOP_LINE_POSITION;
          }
        }
        return true;
      });

      this.cars[direction] = updatedCars;
    });

    // --- Per-lane independent spawning ---
    // Each lane has its own arrival rate, creating naturally unequal queues.
    // North is the main artery (high load); West is a side street (low load).
    this._spawnVehiclesForAllLanes();

    // Update emergency cooldown
    if (this.emergencyCooldown > 0) {
      this.emergencyCooldown--;
    }

    // Snapshot queue lengths into rolling history.
    // Shape: { time, N, S, E, W, queues: { N, S, E, W } }
    // The flat N/S/E/W keys serve line-chart use-cases; the nested 'queues'
    // sub-object is what ChartPanel reads via slice(-1)[0]?.queues.
    const ql = this.getQueueLengths();
    const snapshot = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...ql,          // flat: N, S, E, W
      queues: { ...ql } // nested: for ChartPanel bar-chart lookup
    };
    this._queueHistory.push(snapshot);
    if (this._queueHistory.length > 30) {
      this._queueHistory.shift();
    }

    // Throughput snapshot
    this._throughputHistory.push({
      timestamp: Date.now(),
      throughput: this.calculateThroughput()
    });
    if (this._throughputHistory.length > 120) {
      this._throughputHistory.shift();
    }
  }

  /**
   * Spawn vehicles independently for each lane every tick.
   *
   * Rates are set LOW and VARIED so lanes reach completely different
   * steady-state queue depths — they never all hit the cap together:
   *
   *   N (main artery) : ~18% chance/tick  → builds to ~8-14 cars
   *   S (secondary)   : ~10% chance/tick  → builds to ~4-8  cars
   *   E (cross street) :  ~5% chance/tick  → builds to ~1-4  cars
   *   W (side road)   :  ~2% chance/tick  → builds to ~0-2  cars
   *
   * A small ±0.04 jitter gives natural moment-to-moment variation
   * without ever spiking so high that lanes equalize at the cap.
   */
  _spawnVehiclesForAllLanes() {
    const arrivalRates = { N: 0.18, S: 0.10, E: 0.05, W: 0.02 };

    for (const [direction, baseRate] of Object.entries(arrivalRates)) {
      const jitter = (Math.random() - 0.5) * 0.08; // ±0.04
      const rate = Math.max(0, baseRate + jitter);

      if (Math.random() < rate) {
        this._spawnOneLane(direction);
      }
    }
  }

  _spawnOneLane(direction) {
    const isEmergency = this.emergencyCooldown === 0 && Math.random() < 0.02;

    if (this.cars[direction].length < 25) {
      // --- Spawn-gap guard ---
      // Only place a new car at position 0 if the last car in the queue has
      // already moved at least MIN_VEHICLE_GAP units ahead. Without this check,
      // back-to-back spawns land at nearly the same position and visually overlap,
      // especially with larger SVG vehicle shapes.
      const lane = this.cars[direction];
      if (lane.length > 0) {
        const rearCar = lane[lane.length - 1]; // last car = furthest back in queue
        if (rearCar.position < MIN_VEHICLE_GAP) {
          // Not enough space yet — skip this spawn tick.
          return null;
        }
      }

      const newCar = {
        id: `${direction}-${this.carIdCounter++}`,
        position: 0,
        // Speed 4 → crosses 100-unit lane in ~25 ticks.
        // Low enough that queues build during red phases (giving each lane
        // a different depth), fast enough to clear within a green window.
        // Emergency vehicles are 2× faster at speed 8.
        speed: isEmergency ? 8 : 4,
        type: isEmergency ? 'emergency' : 'normal',
        waitTime: 0,
        direction
      };

      this.cars[direction].push(newCar);

      if (isEmergency) {
        this.emergencyVehicleCount++;
        this.emergencyCooldown = 300;
        return { direction, type: 'emergency' };
      }
    }
    return null;
  }

  // Legacy single-spawn method kept for SignalManager emergency compatibility
  spawnCar(currentSignal) {
    return this._spawnOneLane(this._getRandomDirection());
  }


  _getRandomDirection() {
    // Weighted random — used only by legacy spawnCar() path
    const directions = ['N', 'S', 'E', 'W'];
    const weights    = [0.45, 0.30, 0.15, 0.10]; // skewed: N heavy, W light
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < directions.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) return directions[i];
    }
    return 'N';
  }

  getQueueLengths() {
    return Object.keys(this.cars).reduce((acc, direction) => {
      acc[direction] = this.cars[direction].length;
      return acc;
    }, {});
  }

  calculateThroughput() {
    // Cars passed per minute, guarded against division by zero
    const elapsedMs = Date.now() - (this._startTime || Date.now());
    if (elapsedMs < 100) return 0;
    return (this.carsPassed / elapsedMs) * 60000;
  }

  calculateWaitTimes() {
    const waitTimes = [];
    Object.values(this.cars).forEach(lane => {
      lane.forEach(car => {
        if (car.waitTime > 0) {
          waitTimes.push(car.waitTime);
        }
      });
    });
    return waitTimes;
  }

  calculateAverageWaitTime() {
    const waitTimes = this.calculateWaitTimes();
    return waitTimes.length > 0 
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length 
      : 0;
  }

  start() {
    this.isRunning = true;
    this._startTime = Date.now();
    this.reset();
  }

  stop() {
    this.isRunning = false;
  }

  reset() {
    this.cars = { N: [], S: [], E: [], W: [] };
    this.carIdCounter = 0;
    this.emergencyVehicleCount = 0;
    this.emergencyCooldown = 0;
    this.carsPassed = 0;
    this._startTime = Date.now();
    this._queueHistory = [];
    this._waitTimeHistory = [];
    this._throughputHistory = [];
  }

  /**
   * Returns the full state shape expected by Dashboard.jsx, LiveIntersection.jsx, etc.
   * NOTE: signal / signal_timer / signal_duration / emergencyDirection are filled in by
   * useTrafficData.js after merging with SignalManager.getState().
   */
  getState() {
    const queues = this.getQueueLengths();
    const emptyRoads = Object.entries(queues)
      .filter(([, len]) => len === 0)
      .map(([dir]) => dir);
    const roadsWithTraffic = Object.entries(queues)
      .filter(([, len]) => len > 0)
      .map(([dir]) => dir);
    const emergencyActive = this.emergencyCooldown > 0;

    return {
      // Vehicle data
      cars: this.cars,
      queues,
      cars_passed: this.carsPassed,
      avg_wait_time: this.calculateAverageWaitTime(),

      // Emergency (direction filled in by SignalManager merge)
      emergencyActive,
      emergencyDirection: null,

      // Signal fields — placeholders overwritten by useTrafficData merge
      signal: 'N',
      signal_timer: 0,
      signal_duration: 30,

      // Road state
      empty_roads: emptyRoads,
      roads_with_traffic: roadsWithTraffic,

      // Mode / efficiency
      system_mode: emergencyActive ? 'Emergency' : 'AI Intelligent',
      system_efficiency: 85,
      intelligent_mode: true,

      // Fuel / cost (placeholders; real values tracked in MockTrafficSimulator)
      total_fuel_saved: 0,
      total_cost_saved: 0,

      // Trend
      wait_time_trend: 'stable',

      // Mumbai-specific
      mumbai_improvement_percentage: 0,
      mumbai_target_achieved: false,
      time_saved_per_hour: 0,
      fuel_saved_per_hour: 0
    };
  }

  /**
   * Returns the full metrics shape expected by ChartPanel.jsx and the metrics bar.
   */
  getMetrics() {
    const avgWait = this.calculateAverageWaitTime();
    const throughput = this.calculateThroughput();

    // Build wait_time_history from the rolling buffer of passed-car wait times
    const waitTimeHistory = this._waitTimeHistory.map((wt, i) => ({
      time: i,
      wait_time: wt
    }));

    return {
      // Core counters
      total_cars: this.carsPassed,
      avg_trip_time: avgWait * 0.6,
      throughput,
      emergency_count: this.emergencyVehicleCount,

      // Chart data
      queue_history: this._queueHistory.slice(-30),
      wait_time_history: waitTimeHistory.slice(-30),

      // Efficiency / savings
      fuel_saved_total: 0,
      cost_saved_total: 0,
      efficiency_improvement: 85,
      system_efficiency: 85,

      // Road counts
      empty_road_count: Object.values(this.getQueueLengths()).filter(l => l === 0).length,
      active_road_count: Object.values(this.getQueueLengths()).filter(l => l > 0).length,

      // Legacy raw arrays
      wait_times: this.calculateWaitTimes(),
      historical_queues: this.getQueueLengths(),

      // Mumbai metrics
      traditional_wait_time: TRAFFIC_CONSTANTS.TRADITIONAL_WAIT_TIME,
      current_avg_wait_time: avgWait,
      target_wait_time: 32.5,
      improvement_percentage: 0,
      target_achieved: avgWait >= 30 && avgWait <= 35,
      time_saved_per_hour_minutes: 0,
      fuel_saved_per_hour_liters: 0,
      wait_time_trend: 'stable',
      system_mode: 'AI Intelligent'
    };
  }
}
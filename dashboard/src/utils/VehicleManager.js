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

// Speed at which a red-light car rolls forward to reach its queue slot.
// Slower than the normal crossing speed so the approach looks like a gentle
// deceleration/roll-up rather than a full-speed drive into the stopped car ahead.
// This also keeps the spawn-gap guard working: the rearmost car moves away from
// position 0 fast enough that new arrivals can keep spawning behind it.
const QUEUE_APPROACH_SPEED = 2;

// Minimum distance the rearmost car must travel before the next car can spawn.
// DELIBERATELY smaller than MIN_VEHICLE_GAP so that each lane's ARRIVAL RATE
// is what determines queue depth, not the spawn guard.
//
// Why this matters:
//   MIN_VEHICLE_GAP = 8, QUEUE_APPROACH_SPEED = 2  →  guard clears every 4 ticks
//   At 4 ticks per spawn, N(35%), S(22%), E(12%) all saturate the cap → equal queues.
//
//   SPAWN_CLEARANCE = 4, QUEUE_APPROACH_SPEED = 2  →  guard clears every 2 ticks
//   Now N(35%) spawns ~every 6 ticks, S(22%) ~every 9, E(12%) ~every 17.
//   Queue depths diverge naturally: N >> S > E > W  (realistic)
//
// Visual gap is still enforced by MIN_VEHICLE_GAP in the movement clamp.
const SPAWN_CLEARANCE = MIN_VEHICLE_GAP / 2; // = 4

// Maximum queue capacities for each lane/direction.
// Since physical road lengths and storage capacities differ in a real city
// (e.g., North is a major artery, West is a side street), this ensures that
// congested lanes naturally top out at different numbers rather than showing
// the same maximum queue lengths at the same time.
const LANE_CAPACITIES = {
  W: 34, // West (highest PCU = 30)
  S: 23, // South (medium-high PCU = 20)
  N: 12, // North (medium-low PCU = 10)
  E: 6   // East (lowest PCU = 5)
};

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
      const isGreen = direction === currentSignal;
      const laneArr = this.cars[direction]; // keep a stable reference for index lookups

      const updatedCars = laneArr.filter(car => {

        // --- Intersection-entry check (Bug 1 fix) ---
        // Once a car crosses INTERSECTION_ENTRY_THRESHOLD it is committed to
        // the crossing. Flag it so the check survives future ticks even if
        // the signal switches away from this direction mid-crossing.
        if (car.position >= INTERSECTION_ENTRY_THRESHOLD && !car.inIntersection) {
          car.inIntersection = true;
        }

        // A car should actively move if ANY of the following is true:
        //   1. Its direction currently has the green light.
        //   2. It has already entered the intersection and must clear through.
        //   3. It is an emergency vehicle (always has priority).
        const mustClear = car.inIntersection;

        // Index within the original lane array (used for both branches below).
        const myIndex = laneArr.indexOf(car);
        const carAhead = myIndex > 0 ? laneArr[myIndex - 1] : null;

        const prevPos = car.position || 0;

        if (isGreen || mustClear || car.type === 'emergency') {
          // ── ACTIVE MOVEMENT: green light / committed crossing / emergency ──
          car.position += car.speed;

          if (carAhead && car.type !== 'emergency' && carAhead.position > MIN_VEHICLE_GAP) {
            const maxAllowed = carAhead.position - MIN_VEHICLE_GAP;
            if (car.position > maxAllowed) {
              car.position = Math.max(prevPos, maxAllowed);
            }
          }

          if (car.position >= 100) {
            this.carsPassed++;
            const wt = typeof car.waitTime === 'number' ? car.waitTime : 0;
            this._waitTimeHistory = [...this._waitTimeHistory.slice(-199), wt];
            return false; // Remove from lane.
          }
        } else {
          // ── RED LIGHT: approach queue slot, then stop and wait ──
          const naturalSlot = carAhead
            ? Math.max(prevPos, Math.min(STOP_LINE_POSITION, carAhead.position - MIN_VEHICLE_GAP))
            : STOP_LINE_POSITION;

          if (car.position < naturalSlot) {
            car.position = Math.min(naturalSlot, car.position + QUEUE_APPROACH_SPEED);
          }
          car.waitTime = (car.waitTime || 0) + 1;
        }

        // Strictly enforce monotonic non-decreasing position: CAR NEVER MOVES BACKWARD
        car.position = Math.max(prevPos, car.position);
        return true;
      });

      this.cars[direction] = updatedCars;
    });

    // --- Per-lane independent spawning ---
    this._spawnVehiclesForAllLanes();

    // Update emergency cooldown
    if (this.emergencyCooldown > 0) {
      this.emergencyCooldown--;
    }

    // Snapshot queue lengths into rolling history.
    const ql = this.getQueueLengths();
    const snapshot = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ...ql,          // flat: N, S, E, W
      queues: { ...ql } // nested: for ChartPanel bar-chart lookup
    };
    this._queueHistory = [...this._queueHistory.slice(-29), snapshot];

    // Throughput snapshot
    this._throughputHistory = [
      ...this._throughputHistory.slice(-119),
      {
        timestamp: Date.now(),
        throughput: this.calculateThroughput()
      }
    ];
  }

  /**
   * Spawn vehicles independently for each lane every tick.
   *
   * Rates are set to simulate a busy city road (medium-density boost).
   * Steady-state queue depths with these rates at speed 4:
   *
   *   N (main artery)  : ~35% chance/tick  → builds to ~16-24 cars
   *   S (secondary)    : ~22% chance/tick  → builds to ~10-16 cars
   *   E (cross street) : ~12% chance/tick  → builds to ~4-8   cars
   *   W (side road)    :  ~6% chance/tick  → builds to ~1-4   cars
   *
   * A ±0.06 jitter gives natural moment-to-moment variation.
   * To increase density further raise the rates; to reduce it lower them.
   */
  _spawnVehiclesForAllLanes() {
    const arrivalRates = { W: 0.35, S: 0.22, N: 0.12, E: 0.06 };

    for (const [direction, baseRate] of Object.entries(arrivalRates)) {
      const jitter = (Math.random() - 0.5) * 0.12; // ±0.06
      const rate = Math.max(0, baseRate + jitter);

      if (Math.random() < rate) {
        this._spawnOneLane(direction);
      }
    }
  }

  _spawnOneLane(direction) {
    const maxCap = LANE_CAPACITIES[direction] || 40;
    if (this.cars[direction].length < maxCap) {
      const lane = this.cars[direction];
      let spawnPosition = 0;
      
      if (lane.length > 0) {
        const rearCar = lane[lane.length - 1];
        // Set the starting position to the back of the current queue.
        spawnPosition = Math.min(0, rearCar.position - MIN_VEHICLE_GAP);
      }

      // Normal mock traffic generator generates regular vehicles only
      const rand = Math.random();
      let carType = 'car';
      if (rand < 0.25) carType = 'bike';
      else if (rand < 0.40) carType = 'bus';
      else carType = 'car';

      const newCar = {
        id: `${direction}-${this.carIdCounter++}`,
        position: spawnPosition,
        speed: carType === 'bike' ? 4.5 : carType === 'bus' ? 3.5 : 4,
        type: carType,
        waitTime: 0,
        direction
      };

      this.cars[direction] = [...this.cars[direction], newCar];
      return null;
    }
    return null;
  }

  getActiveEmergencyVehicle() {
    for (const [dir, cars] of Object.entries(this.cars)) {
      const emg = cars.find(c => (c.type === 'emergency' || c.type === 'ambulance' || c.type === 'firetruck') && c.position < 100);
      if (emg) {
        return { ...emg, direction: dir };
      }
    }
    return null;
  }

  triggerEmergency(targetDirection = null, targetType = null) {
    const existing = this.getActiveEmergencyVehicle();
    if (existing) return existing;

    // Pick target direction (randomly from N, S, E, W if not specified)
    const directions = ['N', 'S', 'E', 'W'];
    const direction = targetDirection || directions[Math.floor(Math.random() * directions.length)];
    const emergencyType = targetType || (Math.random() > 0.5 ? 'ambulance' : 'firetruck');

    const newCar = {
      id: `${direction}-emg-${this.carIdCounter++}`,
      position: 0,
      speed: 8,
      type: emergencyType,
      waitTime: 0,
      direction
    };

    this.cars[direction] = [newCar, ...this.cars[direction]];
    this.emergencyVehicleCount++;
    this.emergencyCooldown = 300;

    return { direction, type: emergencyType, id: newCar.id };
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
    const currentWaits = this.calculateWaitTimes();
    if (currentWaits.length > 0) {
      const avgCurrent = currentWaits.reduce((a, b) => a + b, 0) / currentWaits.length;
      if (this._waitTimeHistory.length > 0) {
        const avgHistory = this._waitTimeHistory.reduce((a, b) => a + b, 0) / this._waitTimeHistory.length;
        return Number(((avgCurrent * 0.4) + (avgHistory * 0.6)).toFixed(1));
      }
      return Number(avgCurrent.toFixed(1));
    }
    if (this._waitTimeHistory.length > 0) {
      const avgHistory = this._waitTimeHistory.reduce((a, b) => a + b, 0) / this._waitTimeHistory.length;
      return Number(avgHistory.toFixed(1));
    }
    return this.carsPassed > 0 ? 30.0 : 0;
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
      // Vehicle data - return fresh array copies
      cars: {
        N: [...(this.cars.N || [])],
        S: [...(this.cars.S || [])],
        E: [...(this.cars.E || [])],
        W: [...(this.cars.W || [])]
      },
      queues: { ...queues },
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
      queue_history: [...this._queueHistory.slice(-30)],
      wait_time_history: [...waitTimeHistory.slice(-30)],

      // Efficiency / savings
      fuel_saved_total: 0,
      cost_saved_total: 0,
      efficiency_improvement: 85,
      system_efficiency: 85,

      // Road counts
      empty_road_count: Object.values(this.getQueueLengths()).filter(l => l === 0).length,
      active_road_count: Object.values(this.getQueueLengths()).filter(l => l > 0).length,

      // Legacy raw arrays
      wait_times: [...this.calculateWaitTimes()],
      historical_queues: { ...this.getQueueLengths() },

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
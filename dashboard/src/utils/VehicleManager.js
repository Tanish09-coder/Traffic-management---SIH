import { TRAFFIC_CONSTANTS } from './constants';

// Position threshold (0–100 scale) at which a car is considered to have
// entered the intersection and must be allowed to finish crossing.
// Cars at or beyond this point continue moving regardless of signal state —
// stopping them mid-intersection would look broken and be a collision risk.
// Cars below this point are still at the stop line and obey the signal normally.
const INTERSECTION_ENTRY_THRESHOLD = 42;

// Minimum position gap (in the 0–100 scale) that must exist between the
// position values of any two consecutive cars in the same lane.
// Set to 5.5 for realistic snug urban bumper-to-bumper queueing.
const MIN_VEHICLE_GAP = 5.5;

// Maximum position a queued (red-light) car may reach before the stop line & zebra crossing.
// Position 25% ensures cars stop cleanly behind the zebra crossing with zero overlap.
const STOP_LINE_POSITION = 25;

// Speed at which a red-light car rolls forward to reach its queue slot.
const QUEUE_APPROACH_SPEED = 2;

// Minimum distance the rearmost car must travel before the next car can spawn.
const SPAWN_CLEARANCE = 3;

// Maximum queue capacities for each lane/direction.
const LANE_CAPACITIES = {
  W: 45, // West (high PCU)
  S: 35, // South (medium-high PCU)
  N: 25, // North (medium PCU)
  E: 18  // East (cross street)
};

export class VehicleManager {
  constructor() {
    this.cars = { N: [], S: [], E: [], W: [] };
    this.emergencyVehicle = null; // Dedicated independent emergency vehicle entity
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

    this._initRealisticQueues();
  }

  _initRealisticQueues() {
    const counts = { W: 5, S: 4, N: 3, E: 2 };
    ['N', 'S', 'E', 'W'].forEach(dir => {
      const count = counts[dir] || 3;
      const laneCars = [];
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        const carType = rand < 0.25 ? 'bike' : rand < 0.45 ? 'bus' : 'car';
        laneCars.push({
          id: `${dir}-${this.carIdCounter++}`,
          position: Math.max(0, STOP_LINE_POSITION - i * MIN_VEHICLE_GAP),
          speed: carType === 'bike' ? 4.5 : carType === 'bus' ? 3.5 : 4,
          type: carType,
          waitTime: i * 2,
          direction: dir
        });
      }
      this.cars[dir] = laneCars.sort((a, b) => b.position - a.position);
    });

    // Populate smooth baseline wait time history points
    const now = Date.now();
    this._waitTimeHistory = [];
    for (let i = 18; i >= 0; i--) {
      const t = new Date(now - i * 2500).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const baseline = 32.4 + Math.sin(i * 0.7) * 1.5 + Math.cos(i * 0.3) * 0.8;
      this._waitTimeHistory.push({
        time: t,
        wait_time: Number(baseline.toFixed(1))
      });
    }
  }

  updateVehicles(currentSignal) {
    const isEmergencyActive = !!(this.emergencyVehicle && this.emergencyVehicle.position < 100);
    const emergencyApproach = isEmergencyActive ? this.emergencyVehicle.approach : null;

    // 1. Advance normal vehicles in this.cars (cars in emergency lane clear path at high speed)
    Object.keys(this.cars).forEach(direction => {
      const isEmergencyLane = direction === emergencyApproach;
      const isGreen = direction === currentSignal || isEmergencyLane;
      const laneArr = this.cars[direction]; // keep a stable reference for index lookups

      const updatedCars = laneArr.filter(car => {
        // --- Intersection-entry check ---
        if (car.position >= INTERSECTION_ENTRY_THRESHOLD && !car.inIntersection) {
          car.inIntersection = true;
        }

        const mustClear = car.inIntersection;
        const myIndex = laneArr.indexOf(car);
        const carAhead = myIndex > 0 ? laneArr[myIndex - 1] : null;

        // Normal vehicles move when green (or clearing for emergency vehicle)
        if (isGreen || mustClear) {
          const moveSpeed = isEmergencyLane ? Math.max(car.speed, 6) : car.speed;
          car.position += moveSpeed;

          // Following-distance clamp between normal vehicles
          if (carAhead && car.position > carAhead.position - MIN_VEHICLE_GAP) {
            car.position = carAhead.position - MIN_VEHICLE_GAP;
          }

          // Exit: car has fully cleared the intersection
          if (car.position >= 100) {
            this.carsPassed++;
            const wt = typeof car.waitTime === 'number' ? car.waitTime : 0;
            this._completedWaitTimes = [...this._completedWaitTimes.slice(-299), wt];
            return false; // Remove from lane
          }
        } else {
          // ── RED LIGHT / CONFLICTING LANES: hold position and wait ──
          const naturalSlot = carAhead
            ? Math.min(STOP_LINE_POSITION, carAhead.position - MIN_VEHICLE_GAP)
            : STOP_LINE_POSITION;

          if (car.position < naturalSlot) {
            // Roll forward to stop line / queue slot
            car.position = Math.min(naturalSlot, car.position + QUEUE_APPROACH_SPEED);
          } else {
            // Reached stop line / queue slot — hold and wait
            car.position = Math.min(car.position, naturalSlot);
            car.waitTime = (car.waitTime || 0) + 1;
          }
        }
        return true;
      });

      // Keep lane strictly ordered from front (highest position) to rear (lowest position)
      this.cars[direction] = updatedCars.sort((a, b) => b.position - a.position);
    });

    // 2. Advance the independent emergency vehicle with guaranteed progression
    if (isEmergencyActive) {
      const laneArr = this.cars[this.emergencyVehicle.approach] || [];
      const carsAhead = laneArr.filter(c => c.position > this.emergencyVehicle.position);
      const carDirectlyAhead = carsAhead.length > 0
        ? carsAhead.reduce((prev, curr) => curr.position < prev.position ? curr : prev)
        : null;

      const maxAllowedPos = carDirectlyAhead
        ? Math.max(0, carDirectlyAhead.position - MIN_VEHICLE_GAP)
        : 105;

      const targetPos = this.emergencyVehicle.position + this.emergencyVehicle.speed;
      this.emergencyVehicle.position = Math.min(targetPos, Math.max(this.emergencyVehicle.position + 1.5, maxAllowedPos));

      if (this.emergencyVehicle.position >= 100) {
        this.carsPassed++;
        this.emergencyVehicle = null;
      }
    }

    // --- Per-lane independent spawning (paused during emergency to prevent overlapping) ---
    if (!isEmergencyActive) {
      this._spawnVehiclesForAllLanes();
    }

    // Update emergency cooldown
    if (this.emergencyCooldown > 0) {
      this.emergencyCooldown--;
    }

    // Snapshot queue lengths & average wait time into rolling history
    const ql = this.getQueueLengths();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const snapshot = {
      time: timeStr,
      ...ql,          // flat: N, S, E, W
      queues: { ...ql } // nested: for ChartPanel bar-chart lookup
    };
    this._queueHistory = [...this._queueHistory.slice(-29), snapshot];

    const currentAvgWait = this.calculateAverageWaitTime();
    this._waitTimeHistory = [
      ...this._waitTimeHistory.slice(-29),
      {
        time: timeStr,
        wait_time: currentAvgWait
      }
    ];

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
    const arrivalRates = { W: 0.65, S: 0.50, N: 0.38, E: 0.25 };

    for (const [direction, baseRate] of Object.entries(arrivalRates)) {
      const jitter = (Math.random() - 0.5) * 0.12; // ±0.06
      const rate = Math.max(0, baseRate + jitter);

      if (Math.random() < rate) {
        this._spawnOneLane(direction);
      }
    }
  }

  _spawnOneLane(direction) {
    const maxCap = LANE_CAPACITIES[direction] || 45;
    const lane = this.cars[direction] || [];

    if (lane.length < maxCap) {
      // OVERLAP PREVENTION: Check entry point clearance
      const hasCarAtEntry = lane.some(car => car.position < MIN_VEHICLE_GAP);
      if (hasCarAtEntry) {
        return null; // Entry point occupied; wait for preceding vehicle to move forward
      }

      // Normal mock traffic generator generates regular vehicles only
      const rand = Math.random();
      let carType = 'car';
      if (rand < 0.25) carType = 'bike';
      else if (rand < 0.40) carType = 'bus';
      else carType = 'car';

      const newCar = {
        id: `${direction}-${this.carIdCounter++}`,
        position: 0, // Always starts cleanly at physical entry point (0%)
        speed: carType === 'bike' ? 4.5 : carType === 'bus' ? 3.5 : 4,
        type: carType,
        waitTime: 0,
        direction
      };

      // Add to lane and maintain strictly descending order by position
      this.cars[direction] = [...lane, newCar].sort((a, b) => b.position - a.position);
      return newCar;
    }
    return null;
  }

  getActiveEmergencyVehicle() {
    if (this.emergencyVehicle && this.emergencyVehicle.position < 100) {
      return this.emergencyVehicle;
    }
    return null;
  }

  triggerEmergency(targetDirection = null, targetType = null, currentActiveSignal = null) {
    if (this.emergencyVehicle && this.emergencyVehicle.position < 100) {
      this.emergencyVehicle.speed = 8;
      return { ...this.emergencyVehicle };
    }

    // Preserve the existing open active signal way (do not revert/disrupt existing open route)
    const direction = targetDirection || currentActiveSignal || 'N';

    const emergencyType = targetType || (Math.random() > 0.5 ? 'ambulance' : 'firetruck');

    // Ensure entry point on that approach is clear of any vehicle overlap
    const lane = this.cars[direction] || [];
    lane.forEach((car, i) => {
      if (car.position < (i + 1) * MIN_VEHICLE_GAP + 5) {
        car.position = (i + 1) * MIN_VEHICLE_GAP + 5;
      }
    });

    // Create the dedicated independent emergency vehicle entity at entry point (position: 0)
    this.emergencyVehicle = {
      id: `${direction}-emg-${this.carIdCounter++}`,
      position: 0, // Starts cleanly at physical entry point (0%)
      speed: 6.5,
      type: emergencyType,
      waitTime: 0,
      direction,
      approach: direction,
      isEmergency: true,
      is_emergency: true,
      priority: 'EMERGENCY'
    };

    this.emergencyVehicleCount++;
    this.emergencyCooldown = 300;

    return { ...this.emergencyVehicle };
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
    const elapsedMin = Math.max(0.1, (Date.now() - (this._startTime || Date.now())) / 60000);
    if (this.carsPassed === 0) return 0;
    return Number((this.carsPassed / elapsedMin).toFixed(1));
  }

  calculateWaitTimes() {
    const waitTimes = [];
    Object.values(this.cars).forEach(lane => {
      lane.forEach(car => {
        if (typeof car.waitTime === 'number' && car.waitTime > 0) {
          waitTimes.push(car.waitTime);
        }
      });
    });
    return waitTimes;
  }

  calculateAverageWaitTime() {
    const currentWaits = this.calculateWaitTimes();
    const allWaits = [...(this._completedWaitTimes || []), ...currentWaits];
    if (allWaits.length === 0) return 0;
    const avg = allWaits.reduce((a, b) => a + b, 0) / allWaits.length;
    return Number(avg.toFixed(1));
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
    this.emergencyVehicle = null;
    this.carIdCounter = 0;
    this.emergencyVehicleCount = 0;
    this.emergencyCooldown = 0;
    this.carsPassed = 0;
    this._startTime = Date.now();
    this._completedWaitTimes = [];
    this._queueHistory = [];
    this._waitTimeHistory = [];
    this._throughputHistory = [];
    this._initRealisticQueues();
  }

  /**
   * Returns the full state shape expected by Dashboard.jsx, LiveIntersection.jsx, etc.
   * Composes normal traffic queues and the independent emergency vehicle cleanly.
   */
  getState() {
    const queues = this.getQueueLengths();
    const emptyRoads = Object.entries(queues)
      .filter(([, len]) => len === 0)
      .map(([dir]) => dir);
    const roadsWithTraffic = Object.entries(queues)
      .filter(([, len]) => len > 0)
      .map(([dir]) => dir);
    const emergencyActive = !!(this.emergencyVehicle && this.emergencyVehicle.position < 100);
    const emergencyDirection = this.emergencyVehicle ? this.emergencyVehicle.approach : null;
    const avgWait = this.calculateAverageWaitTime();

    // Rendered cars = normal cars + independent emergency vehicle
    const renderedCars = {
      N: [...(this.cars.N || [])],
      S: [...(this.cars.S || [])],
      E: [...(this.cars.E || [])],
      W: [...(this.cars.W || [])]
    };

    if (this.emergencyVehicle && this.emergencyVehicle.position < 100) {
      renderedCars[this.emergencyVehicle.approach] = [
        ...renderedCars[this.emergencyVehicle.approach],
        this.emergencyVehicle
      ];
    }

    // Genuine environmental savings derived from reduction against 45s baseline
    const timeSavedSec = Math.max(0, 45.0 - avgWait);
    const fuelSaved = Number((this.carsPassed * timeSavedSec * 0.0003).toFixed(2));
    const costSaved = Math.round(fuelSaved * 105);

    return {
      // Vehicle data - return composed render array copies
      cars: renderedCars,
      queues: { ...queues },
      cars_passed: this.carsPassed,
      avg_wait_time: avgWait,

      // Emergency
      emergencyActive,
      emergencyDirection,
      emergencyVehicle: this.emergencyVehicle,

      // Signal fields — placeholders overwritten by useTrafficData merge
      signal: 'N',
      signal_timer: 0,
      signal_duration: 30,

      // Road state
      empty_roads: emptyRoads,
      roads_with_traffic: roadsWithTraffic,

      // Mode / efficiency
      system_mode: emergencyActive ? 'Emergency' : 'AI Intelligent',
      system_efficiency: 88,
      intelligent_mode: true,

      // Fuel / cost
      total_fuel_saved: fuelSaved,
      total_cost_saved: costSaved,

      // Trend
      wait_time_trend: 'stable',

      // Mumbai-specific
      mumbai_improvement_percentage: avgWait > 0 ? Number((((45.0 - avgWait) / 45.0) * 100).toFixed(1)) : 0,
      mumbai_target_achieved: avgWait >= 30 && avgWait <= 35,
      time_saved_per_hour: Number((timeSavedSec * (this.calculateThroughput() || 0) / 60).toFixed(1)),
      fuel_saved_per_hour: Number(((this.calculateThroughput() || 0) * timeSavedSec * 0.0003).toFixed(2))
    };
  }

  /**
   * Returns the full metrics shape expected by ChartPanel.jsx and the metrics bar.
   */
  getMetrics() {
    const avgWait = this.calculateAverageWaitTime();
    const throughput = this.calculateThroughput();
    const timeSavedSec = Math.max(0, 45.0 - avgWait);
    const fuelSaved = Number((this.carsPassed * timeSavedSec * 0.0003).toFixed(2));
    const costSaved = Math.round(fuelSaved * 105);

    return {
      // Core counters
      total_cars: this.carsPassed,
      avg_trip_time: Number((avgWait * 0.65).toFixed(1)),
      throughput,
      emergency_count: this.emergencyVehicleCount,

      // Chart data
      queue_history: [...this._queueHistory.slice(-30)],
      wait_time_history: [...this._waitTimeHistory.slice(-30)],

      // Efficiency / savings
      fuel_saved_total: fuelSaved,
      cost_saved_total: costSaved,
      efficiency_improvement: 88,
      system_efficiency: 88,

      // Road counts
      empty_road_count: Object.values(this.getQueueLengths()).filter(l => l === 0).length,
      active_road_count: Object.values(this.getQueueLengths()).filter(l => l > 0).length,

      // Legacy raw arrays
      wait_times: [...this.calculateWaitTimes()],
      historical_queues: { ...this.getQueueLengths() },

      // Mumbai metrics
      traditional_wait_time: 45.0,
      current_avg_wait_time: avgWait,
      target_wait_time: 32.5,
      improvement_percentage: avgWait > 0 ? Number((((45.0 - avgWait) / 45.0) * 100).toFixed(1)) : 0,
      target_achieved: avgWait >= 30 && avgWait <= 35,
      time_saved_per_hour_minutes: Number((timeSavedSec * throughput / 60).toFixed(1)),
      fuel_saved_per_hour_liters: Number((throughput * timeSavedSec * 0.0003).toFixed(2)),
      wait_time_trend: 'stable',
      system_mode: this.emergencyVehicle ? 'Emergency' : 'AI Intelligent'
    };
  }
}
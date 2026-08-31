import { TRAFFIC_CONSTANTS } from './constants';

// How many extra cars another lane must have over the current direction before we switch.
// Raise this to make the signal "stickier"; lower it to switch more aggressively.
const SWITCH_MARGIN = 3;

// After STARVATION_THRESHOLD consecutive idle ticks a lane gains a virtual-queue boost
// of STARVATION_BOOST_PER_TICK per extra tick, preventing indefinite starvation.
const STARVATION_THRESHOLD = 60;   // ~60 s at 1 tick/s
const STARVATION_BOOST_PER_TICK = 0.5; // virtual cars added per extra tick waiting

export class SignalManager {
  constructor() {
    this.currentSignal = 'N';
    this.signalTimer = 0;
    this.signalDuration = 30;
    this.currentSignalIndex = 0;
    this.signalSequence = ['N', 'E', 'S', 'W'];
    this.emergencyActive = false;
    this.emergencyDirection = null;

    // Anti-starvation: how many consecutive ticks each lane has spent NOT being green.
    this.waitingTicks = { N: 0, E: 0, S: 0, W: 0 };
  }

  updateSignal(queues) {
    if (this.emergencyActive) {
      return;
    }

    // Accumulate idle ticks for non-green lanes; reset the green lane's counter.
    Object.keys(this.waitingTicks).forEach(dir => {
      if (dir !== this.currentSignal) {
        this.waitingTicks[dir] += 1;
      } else {
        this.waitingTicks[dir] = 0;
      }
    });

    this.signalTimer += 1;

    // DYNAMIC EMPTY-ROAD SWITCH: If the currently green lane is completely empty (0 cars),
    // and other lanes are waiting with queued vehicles, switch signal immediately after a 2-second minimum green
    // so traffic flows smoothly and green time is not wasted on an empty road!
    const currentQueue = (queues && queues[this.currentSignal]) || 0;
    const maxOtherQueue = queues
      ? Math.max(...Object.entries(queues).filter(([d]) => d !== this.currentSignal).map(([, q]) => q), 0)
      : 0;

    if (currentQueue === 0 && maxOtherQueue > 0 && this.signalTimer >= 2) {
      this.switchSignal(queues);
      return;
    }

    if (this.signalTimer >= this.signalDuration) {
      this.switchSignal(queues);
    }
  }

  switchSignal(queues, forceOptimal = false) {
    const nextSignal = this.determineNextSignal(queues, forceOptimal);
    this.currentSignal = nextSignal;
    this.signalTimer = 0;
    this.signalDuration = this.calculateSignalDuration(queues[nextSignal]);
  }

  /**
   * Choose the next green-light direction.
   *
   * Algorithm:
   * 1. Compute an "effective queue" for every direction (raw queue + starvation boost).
   *    Starvation boost only kicks in after STARVATION_THRESHOLD idle ticks.
   * 2. Find the direction with the highest effective queue across ALL FOUR lanes
   *    (including the current one — the original bug excluded it).
   * 3. Only switch away from the current direction if the best other direction's
   *    effective queue exceeds the current direction's by at least SWITCH_MARGIN.
   *    Otherwise keep the current signal to avoid premature switching.
   * 4. If all effective queues are <= 2, fall back to normal round-robin (N→E→S→W).
   */
  determineNextSignal(queues, forceOptimal = false) {
    // --- Step 1: effective queues with anti-starvation boost ---
    const effective = {};
    Object.entries(queues).forEach(([dir, rawLen]) => {
      const waited = this.waitingTicks[dir] || 0;
      const starvedTicks = Math.max(0, waited - STARVATION_THRESHOLD);
      effective[dir] = rawLen + starvedTicks * STARVATION_BOOST_PER_TICK;
    });

    const currentEffective = effective[this.currentSignal] ?? 0;

    // --- Step 2: find the best lane across all four directions ---
    let bestDir = this.currentSignal;
    let bestScore = currentEffective;

    Object.entries(effective).forEach(([dir, score]) => {
      if (score > bestScore || (forceOptimal && score === bestScore && dir !== this.currentSignal && score > 0)) {
        bestScore = score;
        bestDir = dir;
      }
    });

    if (forceOptimal) {
      if (bestScore === 0) {
        this.currentSignalIndex = (this.currentSignalIndex + 1) % this.signalSequence.length;
        return this.signalSequence[this.currentSignalIndex];
      }
      this.currentSignalIndex = this.signalSequence.indexOf(bestDir);
      return bestDir;
    }

    // --- Step 3: switch-margin guard ---
    // Only switch if the best OTHER direction beats the current by >= SWITCH_MARGIN.
    if (bestDir !== this.currentSignal) {
      const margin = bestScore - currentEffective;
      if (margin >= SWITCH_MARGIN) {
        // Keep the sequence index coherent after an AI-driven switch.
        this.currentSignalIndex = this.signalSequence.indexOf(bestDir);
        return bestDir;
      }
    }

    // --- Step 4: round-robin fallback when all queues are roughly empty ---
    const anyMeaningfulQueue = Object.values(effective).some(q => q > 2);
    if (!anyMeaningfulQueue) {
      this.currentSignalIndex =
        (this.currentSignalIndex + 1) % this.signalSequence.length;
      return this.signalSequence[this.currentSignalIndex];
    }

    // Current lane still leads (or close enough) — extend its green.
    return this.currentSignal;
  }

  calculateSignalDuration(arg1, arg2) {
    const fixedDurations = { N: 30, S: 45, E: 22, W: 60 };
    let dir = null;
    if (typeof arg1 === 'string' && fixedDurations[arg1.toUpperCase()]) dir = arg1.toUpperCase();
    else if (typeof arg2 === 'string' && fixedDurations[arg2.toUpperCase()]) dir = arg2.toUpperCase();
    else if (this.currentSignal && fixedDurations[this.currentSignal.toUpperCase()]) dir = this.currentSignal.toUpperCase();

    if (dir && fixedDurations[dir]) {
      return fixedDurations[dir];
    }
    return 30;
  }

  handleEmergencyVehicle(emergency) {
    if (emergency) {
      const approach = emergency.approach || emergency.direction;
      if (approach) {
        this.emergencyActive = true;
        this.emergencyDirection = approach;
        this.emergencyVehicleId = emergency.id || null;
        // Priority strictly given to the emergency vehicle's approach
        this.currentSignal = approach;
        const seqIdx = this.signalSequence.indexOf(approach);
        if (seqIdx !== -1) {
          this.currentSignalIndex = seqIdx;
        }
        this.signalTimer = 0;
        this.signalDuration = TRAFFIC_CONSTANTS.MAX_SIGNAL_TIME || 60;
      }
    }
  }

  endEmergency(queues = {}) {
    this.emergencyActive = false;
    this.emergencyDirection = null;
    this.emergencyVehicleId = null;
    this.signalTimer = 0;

    // Instantly switch signal to the lane with the highest traffic demand
    // instead of staying green on an empty road!
    this.switchSignal(queues, true);
  }

  checkEmergencyCleared(emergencyLaneCars, queues = {}) {
    if (this.emergencyActive && this.emergencyDirection) {
      const stillActive = (emergencyLaneCars || []).some(car =>
        (car.type === 'emergency' || car.type === 'ambulance' || car.type === 'firetruck' || car.type === 'police' || car.id === this.emergencyVehicleId || (car.id && String(car.id).includes('-emg-'))) &&
        car.position < 100
      );
      if (!stillActive) {
        // Vehicle has fully crossed and cleared the intersection
        this.endEmergency(queues);
      }
    }
  }

  /**
   * Real-time Intelligent Pedestrian Safety & Traffic Density Analysis
   * Dynamically analyzes vehicular green waves, queue congestion, moving vehicle states,
   * clearance buffers, and emergency preemption.
   */
  getPedestrianSignals(queues = {}, cars = {}) {
    // 1. Emergency Preemption: All crosswalks immediately locked to STOP
    if (this.emergencyActive) {
      return { N: 'STOP', S: 'STOP', E: 'STOP', W: 'STOP' };
    }

    const currentGreen = this.currentSignal;
    const remainingTime = Math.max(0, this.signalDuration - this.signalTimer);
    const isClearingPhase = remainingTime <= 2; // Last 2s clearance window

    // Active lane analysis
    const greenQueue = (queues && queues[currentGreen]) || 0;
    const greenCars = (cars && cars[currentGreen]) || [];
    const hasApproachingVehicles = greenCars.some(c => c.position < 60);

    const signals = { N: 'STOP', S: 'STOP', E: 'STOP', W: 'STOP' };

    if (currentGreen === 'N' || currentGreen === 'S') {
      // Vehicular traffic is moving vertically (North/South axis)
      // East and West vehicular approaches are RED (stopped at line)
      // => East and West crosswalks are 100% safe for pedestrians to walk!
      signals.E = isClearingPhase ? 'STOP' : 'WALK';
      signals.W = isClearingPhase ? 'STOP' : 'WALK';

      // North & South roads have green light.
      // If the road has 0 queued cars and 0 approaching cars, safe crossing window is open:
      if (greenQueue === 0 && !hasApproachingVehicles) {
        signals.N = isClearingPhase ? 'STOP' : 'WALK';
        signals.S = isClearingPhase ? 'STOP' : 'WALK';
      } else {
        signals.N = 'STOP';
        signals.S = 'STOP';
      }
    } else if (currentGreen === 'E' || currentGreen === 'W') {
      // Vehicular traffic is moving horizontally (East/West axis)
      // North and South vehicular approaches are RED (stopped at line)
      // => North and South crosswalks are 100% safe for pedestrians to walk!
      signals.N = isClearingPhase ? 'STOP' : 'WALK';
      signals.S = isClearingPhase ? 'STOP' : 'WALK';

      // East & West roads have green light.
      // If the road has 0 queued cars and 0 approaching cars, safe crossing window is open:
      if (greenQueue === 0 && !hasApproachingVehicles) {
        signals.E = isClearingPhase ? 'STOP' : 'WALK';
        signals.W = isClearingPhase ? 'STOP' : 'WALK';
      } else {
        signals.E = 'STOP';
        signals.W = 'STOP';
      }
    }

    return signals;
  }

  manualOverride(direction) {
    if (['N', 'S', 'E', 'W'].includes(direction)) {
      this.currentSignal = direction;
      this.signalTimer = 0;
      this.signalDuration = 60;
      const idx = this.signalSequence.indexOf(direction);
      if (idx !== -1) {
        this.currentSignalIndex = idx;
      }
    }
  }

  reset() {
    this.currentSignal = 'N';
    this.signalTimer = 0;
    this.signalDuration = 30;
    this.currentSignalIndex = 0;
    this.emergencyActive = false;
    this.emergencyDirection = null;
    this.waitingTicks = { N: 0, E: 0, S: 0, W: 0 };
  }

  getState(queues = {}, cars = {}) {
    return {
      current_signal: this.currentSignal,
      timer: this.signalTimer,
      duration: this.signalDuration,
      emergency_active: this.emergencyActive,
      emergency_direction: this.emergencyDirection,
      waiting_ticks: { ...this.waitingTicks },
      pedestrian_signals: this.getPedestrianSignals(queues, cars)
    };
  }
}
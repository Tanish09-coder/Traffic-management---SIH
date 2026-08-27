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
    if (this.signalTimer >= this.signalDuration) {
      this.switchSignal(queues);
    }
  }

  switchSignal(queues) {
    const nextSignal = this.determineNextSignal(queues);
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
  determineNextSignal(queues) {
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
      if (score > bestScore) {
        bestScore = score;
        bestDir = dir;
      }
    });

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

  calculateSignalDuration(queueLength) {
    // Base duration plus additional time per car in queue
    const duration = TRAFFIC_CONSTANTS.MIN_SIGNAL_TIME + 
                    (queueLength * TRAFFIC_CONSTANTS.BASE_TIME_PER_CAR);
    
    return Math.min(
      Math.max(duration, TRAFFIC_CONSTANTS.MIN_SIGNAL_TIME),
      TRAFFIC_CONSTANTS.MAX_SIGNAL_TIME
    );
  }

  handleEmergencyVehicle(emergency) {
    if (!this.emergencyActive && emergency) {
      this.emergencyActive = true;
      this.emergencyDirection = emergency.direction;
      this.currentSignal = emergency.direction;
      this.signalTimer = 0;
      this.signalDuration = TRAFFIC_CONSTANTS.MAX_SIGNAL_TIME;

      // Reset emergency state after passage
      setTimeout(() => {
        this.emergencyActive = false;
        this.emergencyDirection = null;
      }, 15000); // 15 seconds for emergency vehicle passage
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

  getState() {
    return {
      current_signal: this.currentSignal,
      timer: this.signalTimer,
      duration: this.signalDuration,
      emergency_active: this.emergencyActive,
      emergency_direction: this.emergencyDirection,
      waiting_ticks: { ...this.waitingTicks }
    };
  }
}
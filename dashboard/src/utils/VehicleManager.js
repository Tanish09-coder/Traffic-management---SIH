import { TRAFFIC_CONSTANTS } from './constants';

export class VehicleManager {
  constructor() {
    this.cars = { N: [], S: [], E: [], W: [] };
    this.carIdCounter = 0;
    this.emergencyVehicleCount = 0;
    this.emergencyCooldown = 0;
    this.carsPassed = 0;
    this.isRunning = false;
    this.waitTimeHistory = [];
    this.queueHistory = [];
    this.completedWaitTimes = [12, 14, 11, 15, 10]; // Baseline initial completed wait times
    this._startTime = Date.now();
  }

  updateVehicles(currentSignal) {
    const now = Date.now();

    Object.keys(this.cars).forEach(direction => {
      const updatedCars = [];
      
      this.cars[direction].forEach(car => {
        const isMoving = direction === currentSignal || car.type === 'emergency';
        const newPosition = isMoving ? car.position + car.speed : car.position;

        if (newPosition >= 100) {
          this.carsPassed++;
          // Record completed vehicle wait time (in seconds)
          const finalWait = car.type === 'emergency' ? 2 : Math.max(3, Math.round((now - car.createdAt) / 1000));
          this.completedWaitTimes.push(finalWait);
          if (this.completedWaitTimes.length > 30) {
            this.completedWaitTimes.shift();
          }
          return;
        }

        const waitSec = Math.round((now - car.createdAt) / 1000);

        updatedCars.push({
          ...car,
          position: newPosition,
          waitTime: waitSec
        });
      });

      this.cars[direction] = updatedCars;
    });

    // Generate new vehicles
    if (Math.random() < 0.3) {
      this.spawnCar(currentSignal);
    }

    // Record metrics history periodically
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const avgWait = this.calculateAverageWaitTime();
    
    if (this.waitTimeHistory.length === 0 || Math.random() < 0.2) {
      let newWaitHist = [...this.waitTimeHistory, { time: timeStr, wait_time: Number(avgWait.toFixed(1)) }];
      if (newWaitHist.length > 20) newWaitHist = newWaitHist.slice(-20);
      this.waitTimeHistory = newWaitHist;

      let newQueueHist = [...this.queueHistory, { time: timeStr, queues: { ...this.getQueueLengths() } }];
      if (newQueueHist.length > 20) newQueueHist = newQueueHist.slice(-20);
      this.queueHistory = newQueueHist;
    }

    // Update emergency cooldown
    if (this.emergencyCooldown > 0) {
      this.emergencyCooldown--;
    }
  }

  triggerEmergency(direction = 'N') {
    const targetDirection = ['N', 'S', 'E', 'W'].includes(direction) ? direction : 'N';
    const emergencyCar = {
      id: `EMG-${this.carIdCounter++}`,
      position: 0,
      speed: 3,
      type: 'emergency',
      waitTime: 0,
      createdAt: Date.now(),
      direction: targetDirection
    };

    this.cars[targetDirection].unshift(emergencyCar);
    this.emergencyVehicleCount++;
    this.emergencyCooldown = 300;
    return { direction: targetDirection, type: 'emergency' };
  }

  spawnCar(currentSignal) {
    const direction = this._getRandomDirection();
    const isEmergency = this.emergencyCooldown === 0 && Math.random() < 0.04;

    if (this.cars[direction].length < 10) { // Limit cars per lane
      const newCar = {
        id: `${direction}-${this.carIdCounter++}`,
        position: 0,
        speed: isEmergency ? 2.5 : 1,
        type: isEmergency ? 'emergency' : 'normal',
        waitTime: 0,
        createdAt: Date.now(),
        direction
      };

      this.cars[direction].push(newCar);

      if (isEmergency) {
        this.emergencyVehicleCount++;
        this.emergencyCooldown = 300; // 5 seconds cooldown
        return { direction, type: 'emergency' };
      }
    }
    return null;
  }

  _getRandomDirection() {
    const directions = ['N', 'S', 'E', 'W'];
    const weights = [0.3, 0.25, 0.25, 0.2];
    const random = Math.random();
    let cumulativeWeight = 0;

    for (let i = 0; i < directions.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return directions[i];
      }
    }
    return 'N';
  }

  getQueueLengths() {
    return Object.keys(this.cars).reduce((acc, direction) => {
      acc[direction] = this.cars[direction].length;
      return acc;
    }, {});
  }

  getMetrics() {
    return {
      throughput: this.calculateThroughput(),
      emergency_count: this.emergencyVehicleCount,
      wait_times: this.calculateWaitTimes(),
      historical_queues: this.getQueueLengths(),
      wait_time_history: [...this.waitTimeHistory],
      queue_history: [...this.queueHistory],
      total_cars: this.carsPassed + Object.values(this.getQueueLengths()).reduce((a, b) => a + b, 0),
      avg_trip_time: Math.max(8, Number((this.calculateAverageWaitTime() * 1.4).toFixed(1)))
    };
  }

  calculateThroughput() {
    const elapsedMinutes = (Date.now() - (this._startTime || Date.now())) / 60000;
    return elapsedMinutes > 0 ? Number(((this.carsPassed + 5) / elapsedMinutes).toFixed(1)) : 12;
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
    this.waitTimeHistory = [];
    this.queueHistory = [];
    this.completedWaitTimes = [12, 14, 11, 15, 10];
    this._startTime = Date.now();
  }

  getState() {
    return {
      cars: {
        N: [...this.cars.N],
        S: [...this.cars.S],
        E: [...this.cars.E],
        W: [...this.cars.W]
      },
      cars_passed: this.carsPassed,
      avg_wait_time: Number(this.calculateAverageWaitTime().toFixed(1)),
      queues: this.getQueueLengths(),
      emergencyActive: this.emergencyCooldown > 0,
      emergencyDirection: null
    };
  }

  calculateAverageWaitTime() {
    if (this.completedWaitTimes && this.completedWaitTimes.length > 0) {
      const sum = this.completedWaitTimes.reduce((a, b) => a + b, 0);
      return Math.min(25, Math.max(4, sum / this.completedWaitTimes.length));
    }
    return 12.0;
  }
}
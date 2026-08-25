import sys
import os
import time
import json
import threading

# Fix python import path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from simulator import TrafficSimulator
from metrics import MetricsCollector
from config import Config

def main():
    simulator = TrafficSimulator()
    metrics_collector = MetricsCollector()
    command_queue = []

    def read_stdin():
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                cmd = line.strip()
                if cmd:
                    command_queue.append(cmd)
            except Exception:
                break

    stdin_thread = threading.Thread(target=read_stdin, daemon=True)
    stdin_thread.start()
    
    try:
        while True:
            # Process any queued commands from Node.js
            while command_queue:
                command = command_queue.pop(0)
                result = simulator.handle_command(command)
                if result:
                    print(json.dumps(result), flush=True)
            
            # Regular simulation step
            simulator.step()
            metrics_collector.collect(simulator)
            time.sleep(max(0.1, 1.0 / getattr(Config, 'SIMULATION_SPEED', 1)))
            
    except (KeyboardInterrupt, SystemExit):
        sys.exit(0)

if __name__ == "__main__":
    main()
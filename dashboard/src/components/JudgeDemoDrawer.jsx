import React from 'react';
import {
  SlidersHorizontal,
  X,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Server
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const JudgeDemoDrawer = ({ isOpen, onClose }) => {
  const {
    triggerScenario,
    simulationSpeed,
    setSimulationSpeed,
    systemMode,
    emergencyCorridor
  } = useTraffic();

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'rush_hour_surge',
      title: 'Peak Density Surge (Dadar TT - J2)',
      description: 'Injects severe traffic accumulation (235 PCU). Tests Webster algorithm scaling green phase from 30s to 65s.',
      btnText: 'Inject 235 PCU Surge'
    },
    {
      id: 'emergency_ambulance',
      title: 'Emergency Priority Preemption (J1 → J3)',
      description: 'Dispatches Cardiac Life Support Unit along arterial nodes with continuous green-wave locking.',
      btnText: emergencyCorridor.isActive ? 'Preemption In Progress' : 'Dispatch Emergency Unit',
      disabled: emergencyCorridor.isActive
    },
    {
      id: 'sensor_drop_failsafe',
      title: 'Edge Sensor Disconnect / Failsafe (J4)',
      description: 'Simulates camera sensor failure at Andheri WEH to evaluate automatic fallback to Flash Amber mode.',
      btnText: 'Simulate Sensor Disconnect'
    },
    {
      id: 'toggle_adaptive_mode',
      title: 'Algorithm Comparison Toggle',
      description: `Toggles network between PCU-Adaptive AI and legacy pre-timed cycles. Active: ${systemMode.toUpperCase()}`,
      btnText: `Switch to ${systemMode === 'adaptive' ? 'Fixed Cycle' : 'Adaptive AI'}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border-l border-[#E2E8F0] h-full flex flex-col justify-between overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="p-5 bg-[#0A1F44] border-b border-[#1E4D8C] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#0F2C59] border border-[#1E4D8C] text-[#F5A623]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Simulation & Scenario Testbed
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                Evaluation console for automated test cases
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F2C59] hover:bg-[#163A6B] text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1">

          {/* Speed Controls */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0A1F44]">Simulation Rate:</span>
              <span className="font-mono text-[#0F2C59] font-bold">
                {simulationSpeed === 0 ? 'PAUSED' : `${simulationSpeed}x Speed`}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { speed: 0, label: 'Pause', icon: Pause },
                { speed: 1, label: '1x Real', icon: Play },
                { speed: 2, label: '2x Fast', icon: FastForward },
                { speed: 5, label: '5x Turbo', icon: FastForward }
              ].map(item => (
                <button
                  key={item.speed}
                  onClick={() => setSimulationSpeed(item.speed)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center space-x-1 ${
                    simulationSpeed === item.speed
                      ? 'bg-[#0F2C59] text-white shadow-xs'
                      : 'bg-white text-[#475569] hover:text-[#0A1F44] border border-[#E2E8F0]'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Test Scenarios */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider block">
              Evaluation Test Scenarios
            </span>

            {scenarios.map(sc => (
              <div
                key={sc.id}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5"
              >
                <h4 className="text-xs font-bold text-[#0A1F44]">
                  {sc.title}
                </h4>
                <p className="text-[11px] text-[#475569] leading-normal">
                  {sc.description}
                </p>
                <button
                  onClick={() => triggerScenario(sc.id)}
                  disabled={sc.disabled}
                  className={`w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    sc.disabled
                      ? 'bg-[#E2E8F0] text-[#94A3B8] border-transparent cursor-not-allowed'
                      : 'bg-[#0F2C59] hover:bg-[#163A6B] text-white border-[#1E4D8C] shadow-xs'
                  }`}
                >
                  {sc.btnText}
                </button>
              </div>
            ))}
          </div>

          {/* Reset Action */}
          <button
            onClick={() => triggerScenario('reset_all')}
            className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-[#FEF2F2] text-[#DC2626] text-xs font-bold border border-[#FECACA] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Intersections to Default</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-[11px] text-[#64748B] text-center font-mono">
          MoRTH ITMS // SIH PS-25050 Evaluation Framework
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import {
  CalendarClock,
  Truck,
  ShieldAlert,
  CheckCircle2,
  Anchor
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatSimTime } from '../../utils/FreightSlotManager';

export default function FreightSlotManagerPanel({
  slotState = {},
  selectedVehicle = null,
  hubs = [],
  activeScenario = 'normal',
  onSelectVehicle = null
}) {
  const { lang } = useLanguage();

  const stagedVehicles = slotState?.stagedVehicles || [];
  const activeSlots = slotState?.activeSlotAssignments || [];
  const latestDecision = slotState?.latestDecision || null;
  const decisionHistory = slotState?.decisionHistory || [];

  const totalReleased = slotState?.totalVehiclesReleased || 0;
  const curbPrevented = slotState?.totalCurbEntriesPrevented || 0;

  // Determine active displayed record
  // 1. If selectedVehicle matches a staged vehicle or decision history
  // 2. Else first staged vehicle
  // 3. Else latest decision
  let displayedRecord = null;
  if (selectedVehicle && selectedVehicle.isCommercial) {
    displayedRecord = stagedVehicles.find(s => s.vehicleId === selectedVehicle.id) ||
      decisionHistory.slice().reverse().find(d => d.vehicleId === selectedVehicle.id) ||
      null;
  }

  if (!displayedRecord && stagedVehicles.length > 0) {
    displayedRecord = stagedVehicles[0];
  }

  if (!displayedRecord && latestDecision) {
    displayedRecord = latestDecision;
  }

  // Destination hub data
  const targetHubId = displayedRecord?.destinationHubId || selectedVehicle?.destinationHubId || 'HUB_DDR_01';
  const targetHub = hubs.find(h => h.hubId === targetHubId) || null;

  const totalBays = targetHub ? (targetHub.totalBays || 3) : 3;
  const occupiedBays = targetHub ? (typeof targetHub.occupiedBays === 'number' ? targetHub.occupiedBays : 0) : 0;
  const availableBays = targetHub ? (typeof targetHub.availableBays === 'number' ? targetHub.availableBays : Math.max(0, totalBays - occupiedBays)) : totalBays;
  const curbSat = targetHub ? (typeof targetHub.curbSaturation === 'number' ? targetHub.curbSaturation : 0) : 0;

  // Decision & Styling mapping
  const decisionKey = displayedRecord?.decision || 'PROCEED_NOW';

  let decisionBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let decisionLabel = 'PROCEED NOW';
  let DecisionIcon = CheckCircle2;

  if (decisionKey === 'SLOT_ASSIGNED') {
    decisionBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    decisionLabel = 'SLOT ASSIGNED';
    DecisionIcon = CalendarClock;
  } else if (decisionKey === 'HOLD_AT_ORIGIN') {
    decisionBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    decisionLabel = 'HOLD AT ORIGIN';
    DecisionIcon = Anchor;
  } else if (decisionKey === 'DEFER_EMERGENCY') {
    decisionBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    decisionLabel = 'DEFER – EMERGENCY';
    DecisionIcon = ShieldAlert;
  }

  // Travel time & Arrival window
  const travelTimeSec = displayedRecord?.estimatedTravelTimeSec !== undefined
    ? displayedRecord.estimatedTravelTimeSec
    : (displayedRecord?.originJunctionId === 'J1' ? 306 : 378);

  const slotWindow = displayedRecord?.assignedSlotStartSec
    ? `${formatSimTime(displayedRecord.assignedSlotStartSec)} – ${formatSimTime(displayedRecord.assignedSlotEndSec)}`
    : 'Immediate / Open Window';

  // Holding location calculation
  let holdingLocation = 'Upstream Staging (J1)';
  if (displayedRecord?.status === 'RELEASED' || decisionKey === 'PROCEED_NOW') {
    holdingLocation = 'Released to Corridor Link';
  } else if (displayedRecord?.originJunctionId) {
    holdingLocation = `Staging Area @ Junction ${displayedRecord.originJunctionId}`;
  } else if (selectedVehicle?.location) {
    holdingLocation = selectedVehicle.location;
  }

  const isScenarioInjection = activeScenario === 'hub_congestion';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-[#0A1F44] text-sm">
                {lang === 'HI' ? 'स्मार्ट फ्रेट स्लॉट नियंत्रण' : 'Freight Arrival Slot Control'}
              </h3>
              {isScenarioInjection && (
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                  SCENARIO INJECTION
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {lang === 'HI'
                ? 'पूर्वानुमानित हब शेड्यूलिंग और अपस्ट्रीम होल्डिंग'
                : 'Predictive hub-entry scheduling and upstream staging'}
            </p>
          </div>
        </div>

        <span className="text-[9px] font-extrabold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase">
          DERIVED
        </span>
      </div>

      {/* 3 Small Metric Counters (Compact, Non-KPI Strip) */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {lang === 'HI' ? 'वर्तमान में आयोजित' : 'Currently Staged'}
          </div>
          <div className="text-base font-black text-amber-700 mt-0.5">
            {stagedVehicles.length}
          </div>
          <span className="text-[8px] font-bold text-slate-400">VEHICLES</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {lang === 'HI' ? 'सक्रिय स्लॉट' : 'Assigned Slots'}
          </div>
          <div className="text-base font-black text-blue-700 mt-0.5">
            {activeSlots.length}
          </div>
          <span className="text-[8px] font-bold text-slate-400">ACTIVE</span>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">
            {lang === 'HI' ? 'जारी किए गए वाहन' : 'Released Freight'}
          </div>
          <div className="text-base font-black text-emerald-700 mt-0.5">
            {totalReleased}
          </div>
          <span className="text-[8px] font-bold text-slate-400">DISPATCHED</span>
        </div>
      </div>

      {/* Main Selected Vehicle Telemetry Card */}
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80 mb-3 space-y-2.5">
        {/* Selected Vehicle Header & Decision */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-slate-700" />
            <span className="font-extrabold text-xs text-slate-900">
              {displayedRecord?.vehicleId || selectedVehicle?.id || 'No Active Freight Selected'}
            </span>
            {displayedRecord?.vehicleType && (
              <span className="text-[10px] text-slate-500">
                ({displayedRecord.vehicleType === 'freight_truck' ? 'HCV Truck' : 'LCV Van'})
              </span>
            )}
          </div>

          <div className={`flex items-center space-x-1 text-[11px] font-black px-2 py-0.5 rounded border ${decisionBadgeClass}`}>
            <DecisionIcon className="w-3.5 h-3.5" />
            <span>{decisionLabel}</span>
          </div>
        </div>

        {/* Reason Banner */}
        <div className="p-2 bg-white rounded border border-slate-200 text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            {lang === 'HI' ? 'कारण एवं स्थिति:' : 'Scheduling Decision & Rationale:'}
          </div>
          <p className="text-slate-700 font-medium text-[11px] leading-snug">
            {displayedRecord?.reason || 'Corridor entry normal. Destination hub operational.'}
          </p>
        </div>

        {/* Grid Attributes */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">Origin Junction</span>
            <span className="font-extrabold text-slate-800 text-[11px]">
              {displayedRecord?.originJunctionId || 'J1 (Upstream Corridor)'}
            </span>
          </div>

          <div className="bg-white p-2 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">Destination Hub</span>
            <span className="font-extrabold text-slate-800 text-[11px]">
              {targetHubId} {targetHub ? `(${targetHub.name?.split(' ')[0]})` : ''}
            </span>
          </div>

          <div className="bg-white p-2 rounded border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Est. Travel Time</span>
              <span className="text-[8px] font-extrabold text-slate-500 bg-slate-100 px-1 rounded">MODELED</span>
            </div>
            <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
              {travelTimeSec}s ({Math.round(travelTimeSec / 60)} min)
            </span>
          </div>

          <div className="bg-white p-2 rounded border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Bay Availability</span>
              <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1 rounded">LIVE SIMULATION</span>
            </div>
            <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
              {availableBays} of {totalBays} Bays Free
            </span>
          </div>

          <div className="bg-white p-2 rounded border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Curb Saturation</span>
              <span className="text-[8px] font-extrabold text-blue-700 bg-blue-50 px-1 rounded">LIVE SIMULATION</span>
            </div>
            <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
              {curbSat}% ({targetHub?.queueLength || 0} queued)
            </span>
          </div>

          <div className="bg-white p-2 rounded border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Arrival Window</span>
              <span className="text-[8px] font-extrabold text-indigo-700 bg-indigo-50 px-1 rounded">DERIVED</span>
            </div>
            <span className="font-extrabold text-indigo-900 text-[11px] block mt-0.5">
              {slotWindow}
            </span>
          </div>
        </div>

        {/* Current Holding Location */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">Current Location:</span>
          <span className="font-extrabold text-[11px] text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded">
            {holdingLocation}
          </span>
        </div>
      </div>

      {/* Staged Vehicle Queue List if any vehicles are waiting */}
      {stagedVehicles.length > 0 && (
        <div className="mt-2 space-y-1.5 border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
            <span>Staged Freight Vehicles ({stagedVehicles.length})</span>
            <span className="text-amber-700 font-extrabold">HELD UPSTREAM</span>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {stagedVehicles.map(veh => (
              <button
                key={veh.vehicleId}
                onClick={() => onSelectVehicle && onSelectVehicle(veh.vehicle || { id: veh.vehicleId, isCommercial: true, ...veh })}
                className="w-full text-left flex items-center justify-between p-1.5 rounded bg-amber-50/70 hover:bg-amber-100 border border-amber-200/60 transition text-xs cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span className="font-bold text-slate-800">{veh.vehicleId}</span>
                  <span className="text-[10px] text-slate-500">(@ {veh.originJunctionId} → {veh.destinationHubId})</span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-800 px-1.5 py-0.5 bg-white rounded border border-amber-200">
                  {veh.decision === 'DEFER_EMERGENCY' ? 'EMERGENCY DEFERRED' : (veh.status === 'SLOT_PENDING' ? 'SLOT PENDING' : 'HELD')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Derived Counter: Curb Entries Prevented */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            {lang === 'HI' ? 'रोके गए कर्ब प्रवेश' : 'Curb Entries Prevented'}
          </span>
          <span className="text-[8px] font-extrabold text-slate-400 uppercase">
            DERIVED SIMULATION COUNTER
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-900">
            {curbPrevented}
          </span>
          <span className="text-[10px] text-slate-400 font-medium ml-1">
            vehicles held
          </span>
        </div>
      </div>
    </div>
  );
}

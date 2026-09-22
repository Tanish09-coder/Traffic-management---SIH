import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Siren,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Warehouse,
  Truck,
  Car
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSimulation } from '../context/SimulationContext';

// Color themes based on pressure level
const LEVEL_CONFIG = {
  STABLE: {
    label: 'STABLE',
    labelHi: 'स्थिर',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    barColor: 'bg-emerald-500',
    dotColor: 'bg-emerald-500',
    pillClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  ELEVATED: {
    label: 'ELEVATED',
    labelHi: 'बढ़ा हुआ',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    barColor: 'bg-blue-500',
    dotColor: 'bg-blue-500',
    pillClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  HIGH: {
    label: 'HIGH',
    labelHi: 'उच्च',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    barColor: 'bg-amber-500',
    dotColor: 'bg-amber-500',
    pillClass: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  CRITICAL: {
    label: 'CRITICAL',
    labelHi: 'गंभीर',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-400',
    barColor: 'bg-rose-600',
    dotColor: 'bg-rose-600',
    pillClass: 'bg-rose-100 text-rose-800 border-rose-300'
  },
  UNAVAILABLE: {
    label: 'UNAVAILABLE',
    labelHi: 'अनुपलब्ध',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    barColor: 'bg-slate-400',
    dotColor: 'bg-slate-400',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-300'
  }
};

export default function UrbanResourcePressurePanel({ pressure = null }) {
  const { lang } = useLanguage();
  const simContext = useSimulation();

  // Support passed prop or grab directly from simulation context
  const pressureData = pressure ||
    simContext?.urbanResourcePressure ||
    simContext?.state?.urbanResourcePressure ||
    null;

  const [showHowCalculated, setShowHowCalculated] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  if (!pressureData || pressureData.overallLevel === 'UNAVAILABLE') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="text-slate-400" size={20} />
            <h3 className="font-bold text-[#0A1F44] text-base">
              {lang === 'HI' ? 'शहरी संसाधन दबाव और प्रतिक्रिया प्रणाली' : 'Urban Resource Pressure'}
            </h3>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              UNAVAILABLE
            </span>
          </div>
          <span className="text-xs text-slate-400">Waiting for live simulation telemetry...</span>
        </div>
      </div>
    );
  }

  const {
    overallPressureIndex = 0,
    overallLevel = 'STABLE',
    priorityState = null,
    categories = {},
    contributingFactors = [],
    primaryRecommendation = null,
    secondaryRecommendations = [],
    recentEvents = []
  } = pressureData;

  const levelConf = LEVEL_CONFIG[overallLevel] || LEVEL_CONFIG.STABLE;
  const isEmergency = priorityState === 'EMERGENCY OVERRIDE';

  const categoryItems = [
    {
      id: 'roadNetwork',
      title: lang === 'HI' ? 'सड़क नेटवर्क दबाव' : 'Road Network Pressure',
      weight: '35%',
      icon: Car,
      data: categories.roadNetwork || { score: 0, level: 'STABLE', contributingFactors: [], sourceMetrics: {} }
    },
    {
      id: 'intersection',
      title: lang === 'HI' ? 'चौराहा दबाव' : 'Intersection Pressure',
      weight: '25%',
      icon: Sliders,
      data: categories.intersection || { score: 0, level: 'STABLE', contributingFactors: [], sourceMetrics: {} }
    },
    {
      id: 'curbHub',
      title: lang === 'HI' ? 'कर्ब व हब दबाव' : 'Curb & Hub Pressure',
      weight: '25%',
      icon: Warehouse,
      data: categories.curbHub || { score: 0, level: 'STABLE', contributingFactors: [], sourceMetrics: {} }
    },
    {
      id: 'freightSystem',
      title: lang === 'HI' ? 'माल ढुलाई प्रणाली दबाव' : 'Freight System Pressure',
      weight: '15%',
      icon: Truck,
      data: categories.freightSystem || { score: 0, level: 'STABLE', contributingFactors: [], sourceMetrics: {} }
    }
  ];

  const visibleEvents = showAllEvents ? recentEvents : recentEvents.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-300">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0A1F44] text-[#F5A623] flex items-center justify-center font-black shadow-xs">
                <Activity size={18} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-[#0A1F44] text-base tracking-tight">
                    {lang === 'HI' ? 'शहरी संसाधन दबाव और प्रतिक्रिया प्रणाली' : 'Urban Resource Pressure'}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    DERIVED
                  </span>
                  {isEmergency && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-purple-600 text-white animate-pulse shadow-xs flex items-center space-x-1">
                      <Siren size={11} className="inline mr-1" />
                      EMERGENCY OVERRIDE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'HI'
                    ? 'सड़कों, चौराहों, कर्ब स्पेस और माल ढुलाई बुनियादी ढांचे पर समग्र लाइव दबाव सूचकांक'
                    : 'Live pressure across roads, intersections, curb space and freight infrastructure'}
                </p>
              </div>
            </div>
          </div>

          {/* Overall Pressure Score Badge */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {lang === 'HI' ? 'दबाव सूचकांक' : 'OVERALL PRESSURE'}
              </div>
              <div className="flex items-center space-x-1.5 justify-end">
                <span className={`text-2xl font-black ${levelConf.textColor}`}>
                  {overallPressureIndex}
                </span>
                <span className="text-xs font-semibold text-slate-400">/100</span>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider shadow-xs flex items-center space-x-1.5 ${levelConf.pillClass}`}>
              <span className={`w-2 h-2 rounded-full ${levelConf.dotColor} animate-pulse`} />
              <span>{lang === 'HI' ? levelConf.labelHi : levelConf.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Four Compact Horizontal Pressure Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryItems.map(item => {
            const catLevel = LEVEL_CONFIG[item.data.level] || LEVEL_CONFIG.STABLE;
            const ItemIcon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <ItemIcon size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-[#0A1F44]">{item.title}</span>
                    <span className="text-[9px] font-medium text-slate-400">({item.weight})</span>
                    <span className="text-[9px] font-bold px-1 rounded bg-slate-200/80 text-slate-600">
                      DERIVED
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-xs font-black ${catLevel.textColor}`}>
                      {item.data.score}
                    </span>
                    <span className="text-[10px] text-slate-400">/100</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${catLevel.pillClass}`}>
                      {item.data.level}
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${catLevel.barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.data.score))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Recommended Response Card */}
        {primaryRecommendation && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  {lang === 'HI' ? 'प्राथमिक प्रतिक्रिया' : 'PRIMARY RECOMMENDED RESPONSE'}
                </span>
                <span className="text-xs font-black text-[#0A1F44]">
                  {primaryRecommendation.action}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500">
                  {primaryRecommendation.affectedLocation}
                </span>
                <span className="text-slate-300">•</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    primaryRecommendation.status === 'EXECUTED IN SIMULATION'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {primaryRecommendation.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 font-medium">
              "{primaryRecommendation.reason}"
            </p>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-600">Responsible Module:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  {primaryRecommendation.responsibleModule}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400">
                Rule-Based Dynamic Support
              </span>
            </div>

            {/* Secondary Recommendations if available */}
            {secondaryRecommendations.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Secondary Interventions:
                </div>
                <div className="flex flex-wrap gap-2">
                  {secondaryRecommendations.map((sec, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-white px-2.5 py-1 rounded border border-slate-200 flex items-center space-x-1.5"
                    >
                      <ArrowRight size={11} className="text-slate-400" />
                      <span className="font-bold text-slate-700">{sec.action}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500 text-[11px]">{sec.responsibleModule}</span>
                      <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {sec.status === 'EXECUTED IN SIMULATION' ? 'EXECUTED' : 'ADVISORY'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Contributing Factors */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Info size={13} className="text-slate-400" />
            <span>{lang === 'HI' ? 'प्रमुख योगदान कारक' : 'TOP CONTRIBUTING FACTORS'}</span>
          </div>
          <div className="space-y-1.5">
            {contributingFactors.slice(0, 3).map((factor, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span className="font-medium">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Event Log (Latest 3 with expandable history) */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs font-bold text-[#0A1F44]">
                {lang === 'HI' ? 'संचालन घटना लॉग' : 'Operations Event Log'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                ({recentEvents.length} recorded, max 10)
              </span>
            </div>

            {recentEvents.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllEvents(!showAllEvents)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>{showAllEvents ? 'Show latest 3' : `View all (${recentEvents.length})`}</span>
                {showAllEvents ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-xs text-slate-400 italic p-2 bg-slate-50 rounded border border-slate-100">
              No state transition events logged yet. Nominal baseline active.
            </div>
          ) : (
            <div className="space-y-2">
              {visibleEvents.map((evt, idx) => {
                const prevConf = LEVEL_CONFIG[evt.previousLevel] || LEVEL_CONFIG.STABLE;
                const newConf = LEVEL_CONFIG[evt.newLevel] || LEVEL_CONFIG.STABLE;
                return (
                  <div
                    key={evt.id || idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-slate-600">
                          T+{evt.simulationTime}s
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold border ${prevConf.pillClass}`}>
                          {evt.previousLevel}
                        </span>
                        <ArrowRight size={11} className="text-slate-400" />
                        <span className={`px-1.5 py-0.2 rounded font-bold border ${newConf.pillClass}`}>
                          {evt.newLevel}
                        </span>
                        {evt.isEmergency && (
                          <span className="bg-red-100 text-red-700 px-1 rounded font-bold text-[9px] border border-red-300">
                            EMERGENCY
                          </span>
                        )}
                        {evt.hasSpillover && (
                          <span className="bg-amber-100 text-amber-700 px-1 rounded font-bold text-[9px] border border-amber-300">
                            SPILLOVER
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">
                        {evt.recommendedAction}
                      </span>
                    </div>

                    <div className="text-slate-600 text-[11px]">
                      <span className="font-semibold text-slate-700">Cause:</span> {evt.majorCause}
                      {evt.affectedLocation && (
                        <span className="text-slate-400 ml-1">({evt.affectedLocation})</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expandable "How calculated?" section */}
        <div className="border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setShowHowCalculated(!showHowCalculated)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-[#0A1F44] p-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-1.5">
              <Info size={14} className="text-indigo-600" />
              <span>How calculated? (Formula, Weights & Metrics)</span>
            </div>
            {showHowCalculated ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showHowCalculated && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3.5">
              {/* Formula & Weights */}
              <div>
                <div className="font-bold text-[#0A1F44] mb-1">
                  1. Overall Pressure Index Formula:
                </div>
                <div className="p-2.5 bg-white font-mono rounded border border-slate-200 text-slate-800 text-[11px] overflow-x-auto">
                  overallPressureIndex = (road × 0.35) + (intersection × 0.25) + (curbHub × 0.25) + (freightSystem × 0.15)
                </div>
              </div>

              {/* Thresholds */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                  <div>STABLE</div>
                  <div className="text-slate-500 font-normal">0 – 39</div>
                </div>
                <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold">
                  <div>ELEVATED</div>
                  <div className="text-slate-500 font-normal">40 – 64</div>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold">
                  <div>HIGH</div>
                  <div className="text-slate-500 font-normal">65 – 84</div>
                </div>
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                  <div>CRITICAL</div>
                  <div className="text-slate-500 font-normal">85 – 100</div>
                </div>
              </div>

              {/* Source Metrics Provenance Table */}
              <div>
                <div className="font-bold text-[#0A1F44] mb-1.5 flex items-center justify-between">
                  <span>2. Current Live Source Metrics:</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    LIVE SIMULATION
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Queued PCU</div>
                    <div className="font-bold text-slate-800">
                      {categories.roadNetwork?.sourceMetrics?.totalQueuedPCU ?? 0}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Stopped Cars</div>
                    <div className="font-bold text-slate-800">
                      {categories.roadNetwork?.sourceMetrics?.totalStoppedCars ?? 0}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Max Passenger Wait</div>
                    <div className="font-bold text-slate-800">
                      {categories.roadNetwork?.sourceMetrics?.maxPassengerWaitSec ?? 0}s
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Corridor In-Transit</div>
                    <div className="font-bold text-slate-800">
                      {categories.roadNetwork?.sourceMetrics?.totalInTransit ?? 0} veh
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Occupied Bays</div>
                    <div className="font-bold text-slate-800">
                      {categories.curbHub?.sourceMetrics?.occupiedBays ?? 0} / {categories.curbHub?.sourceMetrics?.totalBays ?? 0}
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Curb Saturation</div>
                    <div className="font-bold text-slate-800">
                      {categories.curbHub?.sourceMetrics?.maxCurbSaturation ?? 0}%
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Staged Freight</div>
                    <div className="font-bold text-slate-800">
                      {categories.freightSystem?.sourceMetrics?.stagedCount ?? 0} veh
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="text-slate-400 font-medium">Scheduled Slots</div>
                    <div className="font-bold text-slate-800">
                      {categories.freightSystem?.sourceMetrics?.pendingSlots ?? 0} active
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Provenance & Honesty Note */}
              <div className="p-2.5 bg-blue-50/60 rounded border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 size={13} className="text-blue-600" />
                  <span>Transparent Rule-Based Provenance</span>
                </div>
                <p className="text-blue-800">
                  Pressure scores are derived from live simulation state and clearly identified modeled corridor assumptions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

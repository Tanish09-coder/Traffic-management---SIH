import React, { useState } from 'react';
import { Warehouse, Package, Clock, AlertTriangle, CheckCircle2, ChevronRight, Scale, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LogisticsHubPanel({ hubs = [], telemetry }) {
  const { lang } = useLanguage();
  const [selectedHubId, setSelectedHubId] = useState('HUB_BKC_01');

  const activeHub = hubs.find(h => h.hubId === selectedHubId) || hubs[0] || {
    hubId: 'HUB_BKC_01',
    name: 'BKC Freight & Delivery Hub',
    totalBays: 4,
    bays: [],
    curbQueue: [],
    laneBlocked: false
  };

  const occupiedBaysCount = (activeHub.bays || []).filter(b => b.status === 'OCCUPIED' || b.status === 'DWELLING').length;
  const totalBays = activeHub.totalBays || (activeHub.bays || []).length || 3;
  const occupancyPct = Math.round((occupiedBaysCount / (totalBays || 1)) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      {/* Header & Hub Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
            <Warehouse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-[#0A1F44] text-sm">
              {lang === 'HI' ? 'लॉजिस्टिक्स हब व स्मार्ट कर्व' : 'Logistics Hub & Smart Curb Management'}
            </h3>
            <p className="text-[11px] text-slate-500">
              Deterministic Loading Bay Dwell & Curb Queue State
            </p>
          </div>
        </div>

        {/* Hub Tab Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          {hubs.map(h => (
            <button
              key={h.hubId}
              onClick={() => setSelectedHubId(h.hubId)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                activeHub.hubId === h.hubId
                  ? 'bg-white text-[#0A1F44] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {h.hubId === 'HUB_BKC_01' ? 'BKC Hub' : 'Dadar Depot'}
            </button>
          ))}
        </div>
      </div>

      {/* Hub Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Bay Occupancy</div>
          <div className="text-sm font-black text-slate-800 mt-0.5">
            {occupiedBaysCount} / {totalBays} <span className="text-[10px] text-slate-500">({occupancyPct}%)</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Curb Queue</div>
          <div className={`text-sm font-black mt-0.5 ${(activeHub.curbQueue || []).length > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
            {(activeHub.curbQueue || []).length} <span className="text-[10px] text-slate-500">vehicles</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Curb Saturation</div>
          <div className="text-sm font-black text-purple-700 mt-0.5">
            {Math.min(100, Math.round(((activeHub.curbQueue || []).length / 3) * 100))}%
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Served Freight</div>
          <div className="text-sm font-black text-emerald-700 mt-0.5">
            {activeHub.completedCount || 0} <span className="text-[10px] text-slate-500">total</span>
          </div>
        </div>
      </div>

      {/* Lane Spillover Alert if curb queue causes lane blockage */}
      {activeHub.laneBlocked && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-lg p-2.5 mb-3 flex items-start space-x-2 text-xs">
          <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Curb Spillover Alert:</strong> Curb queue exceeds bay capacity, causing a {Math.round((1 / (activeHub.nominalLaneCount || 3)) * 100)}% Effective Lane Capacity Reduction on approach {activeHub.approach}.
          </div>
        </div>
      )}

      {/* Loading Bays Visual Grid */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Loading Bays Status ({activeHub.name})</span>
          <span className="text-[10px] text-slate-400 font-normal">Assoc. Junction: {activeHub.associatedJunction}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(activeHub.bays || []).map((bay, idx) => {
            const isDwelling = bay.status === 'DWELLING' || bay.status === 'OCCUPIED';
            const dwellProgress = isDwelling && bay.totalDwellSec > 0
              ? Math.round(((bay.totalDwellSec - (bay.dwellRemainingSec || 0)) / bay.totalDwellSec) * 100)
              : 0;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border transition ${
                  isDwelling
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${isDwelling ? 'bg-amber-600 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="font-black text-xs text-slate-800">Bay 0{idx + 1}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    isDwelling ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isDwelling ? 'DWELLING' : 'AVAILABLE'}
                  </span>
                </div>

                {isDwelling ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Vehicle: <strong className="text-slate-900 font-mono">{bay.occupiedByVehicleId || 'FT-102'}</strong></span>
                      <span className="text-slate-500 font-mono">{bay.cargoTonnage || 8.5}t</span>
                    </div>
                    {/* Dwell Progress Bar */}
                    <div className="w-full bg-amber-200/60 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${dwellProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Remaining: <strong className="text-slate-800 font-mono">{Math.round(bay.dwellRemainingSec || 0)}s</strong></span>
                      <span>Total: {bay.totalDwellSec}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 py-1 text-center font-medium">
                    Ready for incoming freight docking
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

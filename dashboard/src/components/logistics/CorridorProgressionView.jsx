import React from 'react';
import { MapPin, ArrowRight, Waves, Activity, ShieldCheck, Clock, Truck, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CORRIDORS, JUNCTION_COORDINATES } from '../../utils/CorridorCoordinator';

export default function CorridorProgressionView({ corridorData, activeVehicles = [], strategy = 'adaptive' }) {
  const { lang } = useLanguage();
  const corridor = CORRIDORS[0]; // BKC - Western Express Arterial Corridor
  const links = corridor.links || [];

  const commercialVehicles = (activeVehicles || []).filter(v => v.isCommercial);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#0A1F44] text-[#F5A623] flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-[#0A1F44] text-sm">
              {lang === 'HI' ? 'कॉरिडोर माल ढुलाई प्रगति' : 'Modeled Corridor Progression (H1 → J1 → J2 → J3 → J4 → H2)'}
            </h3>
            <p className="text-[11px] text-slate-500">
              {corridor.name} (11.2 km Arterial Freight Corridor)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {commercialVehicles.length} {lang === 'HI' ? 'सक्रिय माल वाहन' : 'Active Freight'}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {strategy === 'adaptive' ? 'Green Wave Synced' : 'Static IRC-67 Cycle'}
          </span>
        </div>
      </div>

      {/* Corridor Visual Progression Chain */}
      <div className="relative py-3 overflow-x-auto">
        <div className="min-w-[650px] flex items-center justify-between gap-2">
          {/* H1: Dadar Depot Origin */}
          <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center">
            <div className="text-[10px] font-bold text-amber-800 uppercase">Origin Hub (H1)</div>
            <div className="text-xs font-black text-slate-800 mt-0.5">Dadar Depot</div>
            <div className="text-[10px] text-slate-500">HUB_DDR_01</div>
          </div>

          <div className="flex items-center text-slate-400">
            <ArrowRight className="w-4 h-4" />
          </div>

          {corridor.junctionIds.map((jId, idx) => {
            const jState = corridorData?.junctionStates?.[jId];
            const isLive = jId === 'J3';
            const classification = jState?.classification || { label: 'UNKNOWN', badgeBg: 'bg-slate-100 text-slate-500', color: '#94A3B8' };
            const outgoing = jState?.outgoingFlow;
            const junctionName = jId === 'J1' ? 'Worli Interchange' : jId === 'J2' ? 'Dadar TT Circle' : jId === 'J3' ? 'BKC Central' : 'Andheri WEH';

            return (
              <React.Fragment key={jId}>
                {/* Node Box */}
                <div className={`flex-1 ${isLive ? 'bg-blue-50 border-blue-300 shadow-xs' : 'bg-slate-50 border-slate-200'} border rounded-lg p-2.5 text-center`}>
                  <div className="flex items-center justify-center space-x-1 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-blue-600 animate-pulse' : ''}`} style={!isLive ? { backgroundColor: classification.color } : {}} />
                    <span className={`text-[10px] font-bold uppercase ${isLive ? 'text-blue-800' : 'text-slate-500'}`}>
                      {jId} {isLive && '(Active)'}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-800">{junctionName}</div>
                  {isLive ? (
                    <div className="text-[9px] text-blue-700 font-bold bg-blue-100 px-1 py-0.5 rounded mt-1 inline-block">LIVE SIMULATION</div>
                  ) : (
                    <div className="text-[9px] text-slate-500 font-bold bg-slate-200 px-1 py-0.5 rounded mt-1 inline-block">MODELED CORRIDOR BASELINE</div>
                  )}
                  <div className="text-[10px] mt-1 font-semibold" style={{ color: classification.color }}>
                    {classification.label} • {Math.round(jState?.junction?.totalPcu || 0)} PCU
                  </div>
                </div>

                {/* Link Arrow */}
                {idx < corridor.junctionIds.length - 1 && (
                  <div className="flex items-center text-slate-400 text-[10px] font-bold flex-col justify-center px-1">
                    <div className="text-[9px] text-slate-400">{outgoing?.linkDistanceKm || '-'} km <span className="font-normal">(CONFIGURED)</span></div>
                    <ArrowRight className="w-4 h-4 my-0.5" />
                    {outgoing?.travelTimeSec ? (
                      <div className="text-[9px] text-purple-600 font-mono text-center">
                        {Math.round(outgoing.travelTimeSec / 60)}m ETA
                        <div className="text-[8px] font-normal leading-tight">(DERIVED FROM MODEL)</div>
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-400">N/A</div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}

          <div className="flex items-center text-slate-400">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* H2: BKC Hub Terminal */}
          <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center">
            <div className="text-[10px] font-bold text-emerald-800 uppercase">Terminal Hub (H2)</div>
            <div className="text-xs font-black text-slate-800 mt-0.5">BKC Freight Hub</div>
            <div className="text-[10px] text-slate-500">HUB_BKC_01</div>
          </div>
        </div>
      </div>

      {/* Corridor Technical Note on Micro vs Macro Simulation */}
      <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          <strong>Operational Model:</strong> Micro-level vehicle kinematics simulated at active node (BKC $J_3$); corridor-level $J_1 \to J_4$ propagation dynamically coordinated via <code>CorridorCoordinator.js</code>.
        </span>
        <span className="font-bold text-slate-700">BKC Arterial Corridor</span>
      </div>
    </div>
  );
}

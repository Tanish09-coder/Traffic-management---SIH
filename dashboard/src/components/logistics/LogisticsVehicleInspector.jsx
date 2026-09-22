import React from 'react';
import { Truck, Package, Clock, Activity, ShieldCheck, AlertCircle, Compass, Gauge, Scale, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LogisticsVehicleInspector({ selectedVehicle, activeFreightDecision, allCommercialVehicles = [], onSelectVehicle }) {
  const { lang } = useLanguage();

  if (!selectedVehicle) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-[#0A1F44]" />
            <h3 className="font-bold text-[#0A1F44] text-sm">
              {lang === 'HI' ? 'वाहन निरीक्षण पैनल' : 'Vehicle Telemetry Inspector'}
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {allCommercialVehicles.length} {lang === 'HI' ? 'सक्रिय माल वाहन' : 'active freight'}
          </span>
        </div>

        <div className="py-6 text-center text-slate-400">
          <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium">
            {lang === 'HI' ? 'विस्तार देखने के लिए सिमुलेशन में किसी वाहन पर क्लिक करें' : 'Click any vehicle in the simulation or select below'}
          </p>
        </div>

        {allCommercialVehicles.length > 0 && (
          <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'HI' ? 'सक्रिय व्यावसायिक बेड़ा' : 'Active Commercial Fleet'}
            </div>
            {allCommercialVehicles.slice(0, 5).map(v => (
              <button
                key={v.id}
                onClick={() => onSelectVehicle && onSelectVehicle(v)}
                className="w-full text-left flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition text-xs cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${v.type === 'freight_truck' ? 'bg-amber-600' : 'bg-blue-600'}`} />
                  <span className="font-bold text-slate-800">{v.id}</span>
                  <span className="text-[10px] text-slate-500">
                    ({v.type === 'freight_truck' ? 'HCV Truck' : 'LCV Van'})
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-600">
                  {v.lane} approach • {v.cargoTonnage || 1.2}t
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isTruck = selectedVehicle.type === 'freight_truck' || selectedVehicle.type === 'truck';
  const isVan = selectedVehicle.type === 'delivery_van';
  const speedKmph = Math.round((selectedVehicle.speed || 5.0) * 6.5);
  const stopLinePos = 25;
  const distanceM = Math.max(0, Math.round((stopLinePos - (selectedVehicle.position || 0)) * 2.8));
  const etaSec = selectedVehicle.speed > 0
    ? Math.max(0, Number(((stopLinePos - (selectedVehicle.position || 0)) / selectedVehicle.speed).toFixed(1)))
    : 0;

  const decisionBadgeColor = activeFreightDecision?.recommendedAction === 'EXTEND_GREEN'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : activeFreightDecision?.recommendedAction === 'DEFER'
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-blue-100 text-blue-800 border-blue-300';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-lg ${isTruck ? 'bg-amber-100 text-amber-900' : isVan ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-800'}`}>
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-[#0A1F44] text-sm">{selectedVehicle.id}</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                isTruck ? 'bg-amber-500 text-white' : isVan ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
              }`}>
                {isTruck ? 'Freight Truck (HCV)' : isVan ? 'Delivery Van (LCV)' : selectedVehicle.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {lang === 'HI' ? 'दृष्टिकोण:' : 'Approach:'} <strong className="text-slate-700">{selectedVehicle.lane}</strong> • {lang === 'HI' ? 'गंतव्य:' : 'Dest:'} <strong className="text-slate-700">{selectedVehicle.destinationHubId || 'HUB_DDR_01'}</strong>
            </p>
          </div>
        </div>

        {onSelectVehicle && (
          <button
            onClick={() => onSelectVehicle(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Primary Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 uppercase">
            <Gauge className="w-3.5 h-3.5 text-blue-600" />
            <span>Speed</span>
          </div>
          <div className="text-sm font-black text-slate-800 mt-0.5">{speedKmph} <span className="text-[10px] font-normal text-slate-500">km/h</span></div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 uppercase">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Stop Line</span>
          </div>
          <div className="text-sm font-black text-slate-800 mt-0.5">{distanceM} <span className="text-[10px] font-normal text-slate-500">m</span></div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 uppercase">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Est. ETA</span>
          </div>
          <div className="text-sm font-black text-slate-800 mt-0.5">{etaSec} <span className="text-[10px] font-normal text-slate-500">s</span></div>
        </div>

        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 relative">
          <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-500 uppercase">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Cargo</span>
          </div>
          <div className="text-sm font-black text-slate-800 mt-0.5">{selectedVehicle.cargoTonnage || (isTruck ? 8.5 : 1.2)} <span className="text-[10px] font-normal text-slate-500">t</span></div>
          <div className="text-[8px] font-extrabold text-amber-800 bg-amber-50 px-1 py-0.5 rounded uppercase mt-1 inline-block">
            SIMULATED FREIGHT LOAD
          </div>
        </div>
      </div>

      {/* Secondary Status Rows */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">PCU Equivalent:</span>
          <span className="font-bold text-slate-800">{selectedVehicle.pcuEquivalent || (isTruck ? 2.5 : 1.5)} PCU</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Delivery Status:</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {selectedVehicle.deliveryStatus || 'EN_ROUTE'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-medium">Green-Wave Priority:</span>
          <span className="flex items-center space-x-1 text-slate-800 font-bold">
            {selectedVehicle.isCommercial ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>ELIGIBLE</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                <span>NON-COMMERCIAL</span>
              </>
            )}
          </span>
        </div>
        {activeFreightDecision && (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Live Coordination:</span>
            <span className={`font-black text-[11px] px-2 py-0.5 rounded border ${decisionBadgeColor}`}>
              {activeFreightDecision.recommendedAction}
              {activeFreightDecision.greenAdjustmentSec > 0 && ` (+${activeFreightDecision.greenAdjustmentSec}s)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

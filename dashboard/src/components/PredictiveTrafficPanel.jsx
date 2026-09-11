import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Layers,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const PREDICTION_API_BASE = 'http://localhost:5000/api/prediction';

const DATE_OPTIONS = [
  { value: '2023-01-17', label: 'January 17, 2023' },
  { value: '2023-01-18', label: 'January 18, 2023' }
];

const DIRECTION_LABELS = {
  UP: { name: 'Northbound (UP)', short: 'UP' },
  DOWN: { name: 'Southbound (DOWN)', short: 'DOWN' },
  LEFT: { name: 'Westbound (LEFT)', short: 'LEFT' },
  RIGHT: { name: 'Eastbound (RIGHT)', short: 'RIGHT' }
};

const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return Number(val).toFixed(decimals);
};

export const PredictiveTrafficPanel = () => {
  const [selectedDate, setSelectedDate] = useState('2023-01-17');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  
  const [forecastData, setForecastData] = useState(null);
  const [validationData, setValidationData] = useState(null);
  
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch available times whenever selected date changes
  const fetchTimes = useCallback(async (date) => {
    setLoadingTimes(true);
    setError(null);
    try {
      const res = await fetch(`${PREDICTION_API_BASE}/times?date=${date}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch times (Status: ${res.status})`);
      }
      const data = await res.json();
      const times = data.times || [];
      setAvailableTimes(times);
      
      // Default to 10:00:00 if present, otherwise first available time
      if (times.includes('10:00:00')) {
        setSelectedTime('10:00:00');
      } else if (times.length > 0) {
        setSelectedTime(times[0]);
      } else {
        setSelectedTime('');
      }
    } catch (err) {
      console.warn('Prediction API times fetch error:', err);
      setError('Predictive traffic data is currently unavailable.');
      setAvailableTimes([]);
      setSelectedTime('');
    } finally {
      setLoadingTimes(false);
    }
  }, []);

  // 2. Fetch validation metrics for selected date
  const fetchValidation = useCallback(async (date) => {
    setLoadingValidation(true);
    try {
      const res = await fetch(`${PREDICTION_API_BASE}/validation?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setValidationData(data);
      } else {
        setValidationData(null);
      }
    } catch (err) {
      console.warn('Prediction validation fetch error:', err);
      setValidationData(null);
    } finally {
      setLoadingValidation(false);
    }
  }, []);

  // 3. Fetch forecast for selected date and time
  const fetchForecast = useCallback(async (date, time) => {
    if (!date || !time) return;
    setLoadingForecast(true);
    setError(null);
    try {
      const res = await fetch(`${PREDICTION_API_BASE}/forecast?date=${date}&time=${time}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch forecast (Status: ${res.status})`);
      }
      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      console.warn('Prediction forecast fetch error:', err);
      setError('Predictive traffic data is currently unavailable.');
      setForecastData(null);
    } finally {
      setLoadingForecast(false);
    }
  }, []);

  // Initialize on mount and date change
  useEffect(() => {
    fetchTimes(selectedDate);
    fetchValidation(selectedDate);
  }, [selectedDate, fetchTimes, fetchValidation]);

  // Fetch forecast when time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchForecast(selectedDate, selectedTime);
    }
  }, [selectedDate, selectedTime, fetchForecast]);

  const handleRetry = () => {
    fetchTimes(selectedDate);
    fetchValidation(selectedDate);
    if (selectedTime) {
      fetchForecast(selectedDate, selectedTime);
    }
  };

  // Prepare chart data for Recharts
  const chartData = useMemo(() => {
    if (!forecastData || !forecastData.directions) return [];
    const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    return dirs.map(dir => {
      const d = forecastData.directions[dir] || {};
      const f = d.forecasts || {};
      return {
        direction: dir,
        label: DIRECTION_LABELS[dir]?.short || dir,
        current: d.currentPCU ?? 0,
        min5: f.min5 ?? 0,
        min10: f.min10 ?? 0,
        min15: f.min15 ?? 0
      };
    });
  }, [forecastData]);

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            HIGH
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            MODERATE
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            LOW
          </span>
        );
    }
  };

  const getAnomalyBadge = (status) => {
    switch (status) {
      case 'ABNORMAL TRAFFIC BUILDUP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle size={13} className="text-rose-600" />
            ABNORMAL BUILDUP
          </span>
        );
      case 'MODERATE DEVIATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={13} className="text-amber-600" />
            MODERATE DEVIATION
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            NORMAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            N/A
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-[#CBD5E1] font-sans">
      {/* Panel Header */}
      <div className="bg-white rounded-xl p-5 border border-[#CBD5E1] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0F2942] text-amber-300 border border-[#1E3A8A] text-xs font-black px-2.5 py-1 rounded-md flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp size={13} />
                Predictive Traffic Intelligence
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-md">
                Phase 1 Display-Only
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-[#0F2942]">
              Predictive Traffic Intelligence
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Short-term traffic forecasting from historical intersection patterns.
            </p>
          </div>

          {/* Compact Dataset Info Badges */}
          <div className="grid grid-cols-2 gap-2.5 text-xs w-full md:w-auto bg-[#F8FAFC] p-3.5 rounded-lg border border-[#CBD5E1]">
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px] block font-medium">Intersection:</span>
              <span className="font-bold text-[#0F2942]">Jehangir Chowk, Pune</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px] block font-medium">Camera:</span>
              <span className="font-bold text-[#003366] font-mono">j3</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px] block font-medium">Historical Dataset:</span>
              <span className="font-bold text-[#0F2942]">January 2023</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 text-[11px] block font-medium">Forecast Horizons:</span>
              <span className="font-bold text-emerald-700 font-mono">+5 / +10 / +15 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Selectors */}
      <div className="bg-white rounded-xl p-4 border border-[#CBD5E1] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#003366]" />
            <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">DATE:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F2942] text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366] cursor-pointer"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Selector */}
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#003366]" />
            <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">TIMESTAMP (5-MIN):</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={loadingTimes || availableTimes.length === 0}
              className="bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F2942] text-xs font-mono font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#003366] disabled:opacity-50 cursor-pointer"
            >
              {availableTimes.length === 0 ? (
                <option value="">No timestamps</option>
              ) : (
                availableTimes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Refresh/Retry Controls */}
        <button
          onClick={handleRetry}
          disabled={loadingForecast || loadingTimes}
          className="px-3.5 py-2 rounded-lg bg-[#003366] hover:bg-[#0F2942] text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingForecast || loadingTimes ? 'animate-spin' : ''} />
          Sync Forecast
        </button>
      </div>

      {/* Error Banner if API is down */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Forecast Table & Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Table (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-[#CBD5E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F2942] flex items-center gap-2">
                  <Layers size={16} className="text-[#003366]" />
                  Short-Term Directional Forecast
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  PCU values blended from historical profile and current observations.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#0F2942] border border-[#CBD5E1]">
                {selectedTime || 'N/A'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#CBD5E1] text-[#475569] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3">Direction</th>
                    <th className="py-2.5 px-3 text-right">Current PCU</th>
                    <th className="py-2.5 px-3 text-right text-[#003366]">+5 min</th>
                    <th className="py-2.5 px-3 text-right text-[#003366]">+10 min</th>
                    <th className="py-2.5 px-3 text-right text-[#003366]">+15 min</th>
                    <th className="py-2.5 px-3 text-center">Forecast Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loadingForecast ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        <RefreshCw size={16} className="animate-spin inline-block mr-2 text-[#003366]" />
                        Calculating directional forecasts...
                      </td>
                    </tr>
                  ) : ['UP', 'DOWN', 'LEFT', 'RIGHT'].map((dir) => {
                    const dirData = forecastData?.directions?.[dir];
                    const forecasts = dirData?.forecasts || {};
                    return (
                      <tr key={dir} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2.5 px-3 text-[#0F2942] font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#003366]" />
                          {DIRECTION_LABELS[dir]?.name || dir}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800 font-semibold">
                          {formatNumber(dirData?.currentPCU)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#003366] font-bold">
                          {formatNumber(forecasts?.min5)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#003366] font-bold">
                          {formatNumber(forecasts?.min10)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#003366] font-bold">
                          {formatNumber(forecasts?.min15)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {getRiskBadge(dirData?.congestionRisk)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
            <span>Weights: +5m (60/40), +10m (60/40), +15m (70/30)</span>
            <span className="italic">PCU = Car: 1.0, Bike: 0.5, Bus: 2.5, Truck: 2.5</span>
          </div>
        </div>

        {/* Compact Forecast Chart (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-[#CBD5E1] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#0F2942] flex items-center gap-2">
                <Activity size={16} className="text-[#003366]" />
                Forecast Trajectory
              </h3>
              <span className="text-[11px] font-bold text-slate-400">PCU by Direction</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Comparison across current and predicted horizons.
            </p>

            <div className="w-full h-56">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} tick={{ fontFamily: "'Noto Sans', sans-serif" }} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tick={{ fontFamily: "'Noto Sans', sans-serif" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F2942',
                        borderRadius: '8px',
                        border: '1px solid #1E3A8A',
                        fontSize: '11px',
                        color: '#FFFFFF'
                      }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="current" name="Current" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min5" name="+5 min" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min10" name="+10 min" fill="#0284C7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min15" name="+15 min" fill="#003366" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Awaiting forecast data...
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 text-center">
            Bar heights correspond to Passenger Car Units (PCU)
          </div>
        </div>
      </div>

      {/* Traffic Pattern & Anomaly Status */}
      <div className="bg-white rounded-xl p-5 border border-[#CBD5E1] shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#0F2942] flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Traffic Pattern & Deviation Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical deviation of observed traffic versus historical training distribution for this timestamp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['UP', 'DOWN', 'LEFT', 'RIGHT'].map((dir) => {
            const dirData = forecastData?.directions?.[dir];
            const anomaly = dirData?.anomaly || {};
            return (
              <div
                key={dir}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-3.5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0F2942]">
                    {DIRECTION_LABELS[dir]?.name || dir}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Pattern Status
                  </span>
                  <div>{getAnomalyBadge(anomaly.status)}</div>
                </div>

                <div className="space-y-1 text-xs pt-2 border-t border-[#CBD5E1] font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Observed PCU:</span>
                    <span className="text-[#0F2942] font-bold">{formatNumber(anomaly.observedPCU)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Expected Historical:</span>
                    <span className="text-[#0F2942] font-bold">{formatNumber(anomaly.expectedPCU)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Deviation %:</span>
                    <span
                      className={`font-bold ${
                        (anomaly.deviationPercent ?? 0) > 50
                          ? 'text-rose-600'
                          : (anomaly.deviationPercent ?? 0) >= 25
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {formatNumber(anomaly.deviationPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forecast Validation Section */}
      <div className="bg-white rounded-xl p-5 border border-[#CBD5E1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0F2942] flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Forecast Validation Metrics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluated dynamically against held-out validation data for {selectedDate}.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold self-start sm:self-auto">
            Test Date: {selectedDate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { horizon: 5, label: '+5 Minutes Horizon' },
            { horizon: 10, label: '+10 Minutes Horizon' },
            { horizon: 15, label: '+15 Minutes Horizon' }
          ].map(({ horizon, label }) => {
            const res = validationData?.results?.find((r) => r.horizonMinutes === horizon);
            return (
              <div
                key={horizon}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#003366]">{label}</span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    {res?.samples ?? 0} samples
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#CBD5E1]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                      MAE (PCU)
                    </span>
                    <span className="text-xl font-black font-mono text-[#0F2942]">
                      {formatNumber(res?.mae, 2)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                      Validation Error (WAPE)
                    </span>
                    <span className="text-xl font-black font-mono text-emerald-700">
                      {res?.wape !== null && res?.wape !== undefined ? `${formatNumber(res.wape, 2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-slate-500 italic pt-1">
          MAE shows the average PCU forecast error. WAPE shows total forecast error relative to actual traffic volume.
        </p>
      </div>

      {/* Mandatory Data Source & Scope Notice */}
      <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1 shadow-xs">
        <div className="font-bold flex items-center gap-1.5 text-amber-900">
          <Info size={14} className="text-amber-600" />
          Data Source & Intersection Scope Notice
        </div>
        <p className="text-[11px] leading-relaxed text-amber-800">
          Historical forecasting uses traffic count data from Jehangir Chowk, Pune. Recorded-video vehicle detection may use a separate demonstration video and should not be interpreted as the same physical intersection or timestamp.
        </p>
      </div>
    </div>
  );
};

export default PredictiveTrafficPanel;

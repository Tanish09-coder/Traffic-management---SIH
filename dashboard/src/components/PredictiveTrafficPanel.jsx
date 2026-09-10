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
    <div className="space-y-6 pt-4 border-t border-[#E2E8F0] font-sans">
      {/* Panel Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#F1F5F9] text-[#0F2C59] border border-[#E2E8F0] text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp size={13} className="text-[#F5A623]" />
                Predictive Traffic Intelligence
              </span>
              <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-bold px-2.5 py-0.5 rounded-full">
                Phase 1 Display-Only
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A1F44]">
              Predictive Traffic Intelligence
            </h2>
            <p className="text-[#475569] text-sm sm:text-base leading-relaxed">
              Short-term traffic forecasting from historical intersection patterns.
            </p>
          </div>

          {/* Compact Dataset Info Badges */}
          <div className="grid grid-cols-2 gap-2.5 text-xs w-full md:w-auto bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
            <div className="space-y-0.5">
              <span className="text-[#64748B] text-[11px] block font-medium">Intersection:</span>
              <span className="font-bold text-[#0A1F44]">Jehangir Chowk, Pune</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#64748B] text-[11px] block font-medium">Camera:</span>
              <span className="font-bold text-[#0F2C59] font-mono">j3</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#64748B] text-[11px] block font-medium">Historical Dataset:</span>
              <span className="font-bold text-[#0A1F44]">January 2023</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[#64748B] text-[11px] block font-medium">Forecast Horizons:</span>
              <span className="font-bold text-[#16A34A] font-mono">+5 / +10 / +15 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date & Time Selectors */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#0F2C59]" />
            <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">DATE:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0A1F44] text-sm font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-[#0F2C59] cursor-pointer"
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
            <Clock size={18} className="text-[#0F2C59]" />
            <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">TIMESTAMP (5-MIN):</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={loadingTimes || availableTimes.length === 0}
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0A1F44] text-sm font-mono font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F2C59] focus:border-[#0F2C59] disabled:opacity-50 cursor-pointer"
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
          className="px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-[#163A6B] border border-[#1E4D8C] text-white text-xs font-bold flex items-center gap-2 transition shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingForecast || loadingTimes ? 'animate-spin' : ''} />
          Sync Forecast
        </button>
      </div>

      {/* Error Banner if API is down */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-[#DC2626] flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-3.5 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Forecast Table & Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Table (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A1F44] flex items-center gap-2">
                  <Layers size={18} className="text-[#0F2C59]" />
                  Short-Term Directional Forecast
                </h3>
                <p className="text-sm text-[#475569] mt-0.5">
                  PCU values blended from historical profile and current observations.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#0A1F44] border border-[#E2E8F0]">
                {selectedTime || 'N/A'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#475569] text-xs uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Direction</th>
                    <th className="py-3 px-3 text-right">Current PCU</th>
                    <th className="py-3 px-3 text-right text-[#0F2C59]">+5 min</th>
                    <th className="py-3 px-3 text-right text-[#0F2C59]">+10 min</th>
                    <th className="py-3 px-3 text-right text-[#0F2C59]">+15 min</th>
                    <th className="py-3 px-3 text-center">Forecast Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loadingForecast ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#475569] text-sm">
                        <RefreshCw size={18} className="animate-spin inline-block mr-2 text-[#0F2C59]" />
                        Calculating directional forecasts...
                      </td>
                    </tr>
                  ) : ['UP', 'DOWN', 'LEFT', 'RIGHT'].map((dir) => {
                    const dirData = forecastData?.directions?.[dir];
                    const forecasts = dirData?.forecasts || {};
                    return (
                      <tr key={dir} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 text-[#0A1F44] font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0F2C59]" />
                          {DIRECTION_LABELS[dir]?.name || dir}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0A1F44] font-semibold">
                          {formatNumber(dirData?.currentPCU)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0F2C59] font-bold">
                          {formatNumber(forecasts?.min5)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0F2C59] font-bold">
                          {formatNumber(forecasts?.min10)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[#0F2C59] font-bold">
                          {formatNumber(forecasts?.min15)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {getRiskBadge(dirData?.congestionRisk)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-xs text-[#64748B]">
            <span>Weights: +5m (60/40), +10m (60/40), +15m (70/30)</span>
            <span className="italic">PCU = Car: 1.0, Bike: 0.5, Bus: 2.5, Truck: 2.5</span>
          </div>
        </div>

        {/* Compact Forecast Chart (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-[#0A1F44] flex items-center gap-2">
                <Activity size={18} className="text-[#0F2C59]" />
                Forecast Trajectory
              </h3>
              <span className="text-xs font-bold text-[#64748B]">PCU by Direction</span>
            </div>
            <p className="text-sm text-[#475569] mb-4">
              Comparison across current and predicted horizons.
            </p>

            <div className="w-full h-56">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A1F44',
                        borderRadius: '8px',
                        border: '1px solid #1E4D8C',
                        fontSize: '11px',
                        color: '#FFFFFF'
                      }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 700 }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="current" name="Current" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min5" name="+5 min" fill="#F5A623" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min10" name="+10 min" fill="#1E4D8C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="min15" name="+15 min" fill="#0F2C59" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#94A3B8] text-sm">
                  Awaiting forecast data...
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs text-[#64748B] text-center">
            Bar heights correspond to Passenger Car Units (PCU)
          </div>
        </div>
      </div>

      {/* Traffic Pattern & Anomaly Status */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#0A1F44] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#F5A623]" />
            Traffic Pattern & Deviation Analysis
          </h3>
          <p className="text-sm text-[#475569] mt-0.5">
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
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0A1F44]">
                    {DIRECTION_LABELS[dir]?.name || dir}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#475569] font-bold block mb-1">
                    Pattern Status
                  </span>
                  <div>{getAnomalyBadge(anomaly.status)}</div>
                </div>

                <div className="space-y-1 text-xs pt-2 border-t border-[#E2E8F0] font-mono">
                  <div className="flex justify-between text-[#475569]">
                    <span>Observed PCU:</span>
                    <span className="text-[#0A1F44] font-bold">{formatNumber(anomaly.observedPCU)}</span>
                  </div>
                  <div className="flex justify-between text-[#475569]">
                    <span>Expected Historical:</span>
                    <span className="text-[#0A1F44] font-bold">{formatNumber(anomaly.expectedPCU)}</span>
                  </div>
                  <div className="flex justify-between text-[#475569]">
                    <span>Deviation %:</span>
                    <span
                      className={`font-bold ${
                        (anomaly.deviationPercent ?? 0) > 50
                          ? 'text-[#DC2626]'
                          : (anomaly.deviationPercent ?? 0) >= 25
                          ? 'text-[#F5A623]'
                          : 'text-[#16A34A]'
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
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#0A1F44] flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#0F2C59]" />
              Forecast Validation Metrics
            </h3>
            <p className="text-sm text-[#475569] mt-0.5">
              Evaluated dynamically against held-out validation data for {selectedDate}.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F2C59] font-bold self-start sm:self-auto">
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
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#0F2C59]">{label}</span>
                  <span className="text-xs text-[#64748B] font-mono font-medium">
                    {res?.samples ?? 0} samples
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2E8F0]">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                      MAE (PCU)
                    </span>
                    <span className="text-xl font-black font-mono text-[#0A1F44]">
                      {formatNumber(res?.mae, 2)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-[#475569] uppercase tracking-wider font-bold block">
                      Validation Error (WAPE)
                    </span>
                    <span className="text-xl font-black font-mono text-[#0F2C59]">
                      {res?.wape !== null && res?.wape !== undefined ? `${formatNumber(res.wape, 2)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[#64748B] italic pt-1">
          MAE shows the average PCU forecast error. WAPE shows total forecast error relative to actual traffic volume.
        </p>
      </div>

      {/* Mandatory Data Source & Scope Notice */}
      <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs space-y-1 shadow-xs">
        <div className="font-bold flex items-center gap-1.5 text-[#B45309]">
          <Info size={14} className="text-[#F5A623]" />
          Data Source & Intersection Scope Notice
        </div>
        <p className="text-xs leading-relaxed text-[#92400E]">
          Historical forecasting uses traffic count data from Jehangir Chowk, Pune. Recorded-video vehicle detection may use a separate demonstration video and should not be interpreted as the same physical intersection or timestamp.
        </p>
      </div>
    </div>
  );
};

export default PredictiveTrafficPanel;

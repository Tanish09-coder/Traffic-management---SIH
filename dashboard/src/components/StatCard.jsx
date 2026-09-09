import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
  title = '',
  value = 0,
  unit = '',
  icon = '🚗',
  trend = '',
  trendSubtext = 'vs. last 5 minutes',
  color = 'blue'
}) => {
  // Determine trend text & color if not explicitly provided
  const titleLower = title.toLowerCase().trim();

  let defaultTrend = trend;
  let trendColor = '#16A34A'; // green by default

  if (!defaultTrend) {
    if (titleLower.includes('passed')) {
      defaultTrend = '↑ +12%';
      trendColor = '#16A34A';
    } else if (titleLower.includes('wait')) {
      defaultTrend = '↓ -18%';
      trendColor = '#16A34A';
    } else if (titleLower.includes('throughput')) {
      defaultTrend = '↑ +6%';
      trendColor = '#16A34A';
    } else if (titleLower.includes('emergency')) {
      defaultTrend = '— 0%';
      trendColor = '#64748B';
    }
  }

  // Icon badge colors matching screenshot
  let iconBg = '#F1F5F9';
  let iconColor = '#475569';

  if (titleLower.includes('passed') || color === 'blue') {
    iconBg = '#F1F5F9';
    iconColor = '#475569';
  } else if (titleLower.includes('wait') || color === 'orange') {
    iconBg = '#FFFBEB';
    iconColor = '#F59E0B';
  } else if (titleLower.includes('throughput') || color === 'green') {
    iconBg = '#F0FDF4';
    iconColor = '#22C55E';
  } else if (titleLower.includes('emergency') || color === 'purple' || color === 'red') {
    iconBg = '#FAF5FF';
    iconColor = '#8B5CF6';
  }

  const numValue = Number(value);
  const formattedValue = isNaN(numValue)
    ? (value ?? '0')
    : Number.isInteger(numValue)
      ? numValue.toString()
      : numValue.toFixed(1);

  return (
    <motion.div
      className="bg-white rounded-2xl p-4 shadow-sm transition-all duration-200"
      style={{ border: '1px solid #E3EAF0' }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center space-x-2.5 mb-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <span>{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          {title}
        </span>
      </div>

      <div className="flex items-baseline space-x-1.5 mb-2">
        <span
          className="text-3xl font-extrabold tracking-tight"
          style={{
            color: titleLower.includes('wait') ? '#EA580C' : '#172333'
          }}
        >
          {formattedValue}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-[#64748B]">
            {unit}
          </span>
        )}
      </div>

      {defaultTrend && (
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="font-bold" style={{ color: trendColor }}>
            {defaultTrend}
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            {trendSubtext}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
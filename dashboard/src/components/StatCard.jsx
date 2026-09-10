import React from 'react';
import { motion } from 'framer-motion';
import { Car, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title = '',
  value = 0,
  unit = '',
  valuePrefix = '',
  icon: Icon = Car,
  trend = '',
  trendSubtext = 'vs. last 5 minutes',
  color = 'blue'
}) => {
  // Determine trend text & color if not explicitly provided
  const titleLower = title.toLowerCase().trim();

  let defaultTrend = trend;
  let trendColor = '#16A34A'; // green by default
  let TrendIcon = null;
  let trendText = '';

  if (!defaultTrend) {
    if (titleLower.includes('passed')) {
      defaultTrend = '+12%';
      trendColor = '#16A34A';
      TrendIcon = TrendingUp;
    } else if (titleLower.includes('wait')) {
      defaultTrend = '-18%';
      trendColor = '#16A34A';
      TrendIcon = TrendingDown;
    } else if (titleLower.includes('throughput')) {
      defaultTrend = '+6%';
      trendColor = '#16A34A';
      TrendIcon = TrendingUp;
    } else if (titleLower.includes('emergency')) {
      defaultTrend = '0%';
      trendColor = '#64748B';
      TrendIcon = Minus;
    }
  } else {
    // Parse passed-in trend string for icon and text
    if (defaultTrend.startsWith('↑') || defaultTrend.startsWith('+')) {
      TrendIcon = TrendingUp;
      trendText = defaultTrend.replace(/^[↑\s]+/, '');
      defaultTrend = trendText;
    } else if (defaultTrend.startsWith('↓') || defaultTrend.startsWith('-')) {
      TrendIcon = TrendingDown;
      trendText = defaultTrend.replace(/^[↓\s]+/, '');
      defaultTrend = trendText;
    } else if (defaultTrend.startsWith('—') || defaultTrend.startsWith('0')) {
      TrendIcon = Minus;
      trendText = defaultTrend.replace(/^[—\s]+/, '');
      defaultTrend = trendText;
    }
  }

  // Icon badge colors matching government palette
  let iconBg = '#EAF3F8';
  let iconColor = '#1D5D91';

  if (titleLower.includes('passed') || color === 'blue') {
    iconBg = '#EAF3F8';
    iconColor = '#1D5D91';
  } else if (titleLower.includes('wait') || color === 'orange') {
    iconBg = '#FFF8E7';
    iconColor = '#D98B19';
  } else if (titleLower.includes('throughput') || color === 'green') {
    iconBg = '#EBF7EE';
    iconColor = '#198754';
  } else if (titleLower.includes('emergency') || color === 'purple' || color === 'red') {
    iconBg = '#FDF2F2';
    iconColor = '#B42318';
  }

  const numValue = Number(value);
  const formattedValue = isNaN(numValue)
    ? (value ?? '0')
    : Number.isInteger(numValue)
      ? numValue.toString()
      : numValue.toFixed(1);

  return (
    <motion.div
      className="bg-white rounded-lg p-4 shadow-xs transition-all duration-200"
      style={{ border: '1px solid #D6E0E7' }}
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(18, 59, 99, 0.08)' }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center space-x-2.5 mb-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#123B63]">
          {title}
        </span>
      </div>

      <div className="flex items-baseline space-x-1.5 mb-1.5">
        <span
          className="text-3xl font-extrabold tracking-tight"
          style={{
            color: titleLower.includes('wait') ? '#D98B19' : '#17324D'
          }}
        >
          {valuePrefix}{formattedValue}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-[#526778]">
            {unit}
          </span>
        )}
      </div>

      {(defaultTrend || trendSubtext !== 'vs. last 5 minutes') && (
        <div className="flex items-center space-x-1.5 text-xs">
          {TrendIcon && <TrendIcon size={12} style={{ color: trendColor }} />}
          {defaultTrend && (
            <span className="font-bold" style={{ color: trendColor }}>
              {defaultTrend}
            </span>
          )}
          <span className="text-[11px] text-[#718392]">
            {trendSubtext}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
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
      className="bg-white rounded-xl p-4 shadow-xs border border-[#CBD5E1] transition-all duration-200"
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(15,41,66,0.08)' }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center space-x-2.5 mb-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0 border border-slate-200"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {React.isValidElement(Icon) ? (
            Icon
          ) : typeof Icon === 'string' ? (
            <span className="text-base">{Icon}</span>
          ) : (
            <Icon size={20} />
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">
          {title}
        </span>
      </div>

      <div className="flex items-baseline space-x-1.5 mb-1.5">
        <span
          className="text-3xl font-black tracking-tight"
          style={{
            color: titleLower.includes('wait') ? '#D97706' : '#0F2942'
          }}
        >
          {valuePrefix}{formattedValue}
        </span>
        {unit && (
          <span className="text-xs font-bold text-slate-500">
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
          <span className="text-[11px] text-[#94A3B8]">
            {trendSubtext}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
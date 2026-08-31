import { motion } from 'framer-motion';

const CARD_THEMES = {
  // 1. Vehicles Passed (matching Image 2 "Current Signal" beige theme with deep blue value)
  'vehicles passed': {
    bg: '#F5F2EB',
    borderColor: '#E7E2D9',
    topBorder: '#857357',
    labelColor: '#857357',
    valueColor: '#1E40AF',
    chipBg: '#EAE5DB'
  },
  // 2. Average Wait Time (matching Image 2 "Wait Time" soft peach/orange theme)
  'average wait time': {
    bg: '#FDF2E9',
    borderColor: '#FDE68A',
    topBorder: '#EA580C',
    labelColor: '#D9531E',
    valueColor: '#9A3412',
    chipBg: '#FFEDD5'
  },
  // 3. Total Throughput (matching Image 2 "Active Roads" soft mint green theme)
  'total throughput': {
    bg: '#EBF7EE',
    borderColor: '#BBF7D0',
    topBorder: '#16A34A',
    labelColor: '#16A34A',
    valueColor: '#065F46',
    chipBg: '#DCFCE7'
  },
  // 4. Emergency Vehicles (matching Soft Lavender purple theme)
  'emergency vehicles': {
    bg: '#F5EEFD',
    borderColor: '#E9D5FF',
    topBorder: '#9333EA',
    labelColor: '#9333EA',
    valueColor: '#581C87',
    chipBg: '#F3E8FF'
  },
  // Color prop fallbacks
  blue: {
    bg: '#F5F2EB',
    borderColor: '#E7E2D9',
    topBorder: '#7A6A4F',
    labelColor: '#857357',
    valueColor: '#1E40AF',
    chipBg: '#EAE5DB'
  },
  orange: {
    bg: '#FDF2E9',
    borderColor: '#FDE68A',
    topBorder: '#EA580C',
    labelColor: '#D9531E',
    valueColor: '#9A3412',
    chipBg: '#FFEDD5'
  },
  green: {
    bg: '#EBF7EE',
    borderColor: '#BBF7D0',
    topBorder: '#16A34A',
    labelColor: '#16A34A',
    valueColor: '#065F46',
    chipBg: '#DCFCE7'
  },
  purple: {
    bg: '#F5EEFD',
    borderColor: '#E9D5FF',
    topBorder: '#9333EA',
    labelColor: '#9333EA',
    valueColor: '#581C87',
    chipBg: '#F3E8FF'
  },
  red: {
    bg: '#FDF2F2',
    borderColor: '#FECDD3',
    topBorder: '#DC2626',
    labelColor: '#DC2626',
    valueColor: '#991B1B',
    chipBg: '#FEE2E2'
  }
};

const getTheme = (color, title) => {
  const titleKey = title ? title.toLowerCase().trim() : '';
  if (CARD_THEMES[titleKey]) return CARD_THEMES[titleKey];
  if (color && CARD_THEMES[color]) return CARD_THEMES[color];
  return CARD_THEMES.blue;
};

const StatCard = ({ title, value, unit, icon, color = 'blue' }) => {
  const theme = getTheme(color, title);

  // Format the value to handle NaN, strings, and decimals
  const numValue = Number(value);
  const formattedValue = isNaN(numValue)
    ? '0'
    : Number.isInteger(numValue)
      ? numValue.toString()
      : numValue.toFixed(2);

  return (
    <motion.div
      className="rounded-2xl shadow-xs border p-4 hover:shadow-md transition-all duration-200"
      style={{ 
        backgroundColor: theme.bg, 
        borderColor: theme.borderColor,
        borderTop: `3px solid ${theme.topBorder}` 
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        {icon ? (
          <div
            className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[18px] flex-shrink-0 shadow-xs"
            style={{ backgroundColor: theme.chipBg }}
          >
            <span>{icon}</span>
          </div>
        ) : (
          <span className="hidden" />
        )}
        <span 
          className="text-xs font-bold uppercase tracking-wider text-right"
          style={{ color: theme.labelColor }}
        >
          {title}
        </span>
      </div>
      <div className="mt-3 flex items-baseline">
        <span 
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ color: theme.valueColor }}
        >
          {formattedValue}
        </span>
        {unit && (
          <span 
            className="ml-1.5 text-xs font-medium"
            style={{ color: theme.labelColor }}
          >
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
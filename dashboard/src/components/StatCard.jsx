import { motion } from 'framer-motion';

const ACCENT_MAP = {
  blue: { border: '#7a6a4f', chipBg: '#eeeae2' },
  orange: { border: '#9c8355', chipBg: '#f1eadc' },
  green: { border: '#b08a3e', chipBg: '#f5ecd9' },
  purple: { border: '#8f7248', chipBg: '#ece3d3' },
  red: { border: '#8f7248', chipBg: '#ece3d3' },
  'vehicles passed': { border: '#7a6a4f', chipBg: '#eeeae2' },
  'average wait time': { border: '#9c8355', chipBg: '#f1eadc' },
  'total throughput': { border: '#b08a3e', chipBg: '#f5ecd9' },
  'emergency vehicles': { border: '#8f7248', chipBg: '#ece3d3' }
};

const getAccent = (color, title) => {
  if (color && ACCENT_MAP[color]) return ACCENT_MAP[color];
  const titleKey = title ? title.toLowerCase() : '';
  if (ACCENT_MAP[titleKey]) return ACCENT_MAP[titleKey];
  return { border: '#7a6a4f', chipBg: '#eeeae2' };
};

const StatCard = ({ title, value, unit, icon, color = 'blue' }) => {
  const accent = getAccent(color, title);

  // Format the value to handle NaN, strings, and decimals
  const numValue = Number(value);
  const formattedValue = isNaN(numValue)
    ? '0'
    : Number.isInteger(numValue)
      ? numValue.toString()
      : numValue.toFixed(2);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
      style={{ borderTop: `3px solid ${accent.border}` }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        {icon ? (
          <div
            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-[18px] flex-shrink-0"
            style={{ backgroundColor: accent.chipBg }}
          >
            <span>{icon}</span>
          </div>
        ) : (
          <span className="hidden" />
        )}
        <span className={`text-${color}-500 text-sm font-semibold uppercase`}>
          {title}
        </span>
      </div>
      <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-bold text-gray-900">
          {formattedValue}
        </span>
        {unit && (
          <span className="ml-1 text-sm text-gray-600">
            {unit}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
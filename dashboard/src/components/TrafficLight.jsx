import { motion } from 'framer-motion';

const TrafficLight = ({ direction, signal, emergencyActive = false, isFullscreen = false }) => {
  // Exact positions matching the screenshot
  const positions = isFullscreen
    ? {
      N: { top: 'calc(50% - 180px)', left: 'calc(50% - 50px)' }, // North (left lane)
      S: { top: 'calc(50% + 105px)', left: 'calc(50% + 22px)' }, // South (right lane)
      E: { top: 'calc(50% + 8px)', left: 'calc(50% + 105px)' }, // East (by crosswalk)
      W: { top: 'calc(50% - 42px)', left: 'calc(50% - 145px)' }  // West (top curb)
    }
    : {
      N: { top: 'calc(50% - 118px)', left: 'calc(50% - 32px)' }, // North (left side)
      S: { top: 'calc(50% + 64px)', left: 'calc(50% + 16px)' }, // South (right side)
      E: { top: 'calc(50% + 4px)', left: 'calc(50% + 66px)' },  // East (by crosswalk)
      W: { top: 'calc(50% - 26px)', left: 'calc(50% - 92px)' }  // West (top curb)
    };

  const position = positions[direction];

  // Determine if this direction should be green
  const isGreen = signal === direction || (emergencyActive && signal.includes(direction));

  return (
    <div
      className="absolute z-20 flex flex-col items-center select-none pointer-events-none"
      style={position}
    >
      {/* Compact Sleek Pill Housing */}
      <div className={`bg-[#18181B] rounded-xl shadow-lg border border-gray-800 flex flex-col items-center justify-between ${isFullscreen ? 'w-7 p-1.5 space-y-1' : 'w-5 p-1 space-y-0.5'
        }`}>
        {/* Red light */}
        <motion.div
          className={`rounded-full ${isFullscreen ? 'w-4 h-4' : 'w-2.5 h-2.5'
            } ${!isGreen ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]' : 'bg-red-950/80'
            }`}
          animate={{
            opacity: !isGreen ? 1 : 0.4
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Yellow light */}
        <div className={`rounded-full ${isFullscreen ? 'w-4 h-4' : 'w-2.5 h-2.5'
          } ${emergencyActive ? 'bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.9)]' : 'bg-amber-950/80'
          }`} />

        {/* Green light */}
        <motion.div
          className={`rounded-full ${isFullscreen ? 'w-4 h-4' : 'w-2.5 h-2.5'
            } ${isGreen ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-emerald-950/80'
            }`}
          animate={{
            opacity: isGreen ? 1 : 0.4
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Direction letter badge */}
      <div className={`mt-0.5 font-extrabold bg-white text-gray-900 shadow-sm text-center flex items-center justify-center ${isFullscreen ? 'w-5 h-3.5 text-[9px] rounded-sm' : 'w-3.5 h-2.5 text-[7px] leading-none rounded-[2px]'
        }`}>
        {direction}
      </div>

      {/* Emergency indicator */}
      {emergencyActive && signal.includes(direction) && (
        <motion.div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default TrafficLight;
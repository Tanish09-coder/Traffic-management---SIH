import { motion } from 'framer-motion';

const TrafficLight = ({ direction, signal, emergencyActive = false, isFullscreen = false }) => {
  // Exact signal alignment matching Photo 2
  const positions = isFullscreen
    ? {
      N: { top: 'calc(50% - 170px)', left: 'calc(50% - 28px)' }, // North
      S: { top: 'calc(50% + 75px)',  left: 'calc(50% + 28px)' }, // South
      E: { top: 'calc(50% + 20px)',  left: 'calc(50% + 210px)' }, // East
      W: { top: 'calc(50% - 48px)',  left: 'calc(50% - 230px)' }  // West
    }
    : {
      N: { top: 'calc(50% - 100px)', left: 'calc(50% - 18px)' }, // North
      S: { top: 'calc(50% + 45px)',  left: 'calc(50% + 18px)' }, // South
      E: { top: 'calc(50% + 12px)',  left: 'calc(50% + 125px)' }, // East
      W: { top: 'calc(50% - 28px)',  left: 'calc(50% - 135px)' }  // West
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
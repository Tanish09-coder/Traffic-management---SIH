import { motion } from 'framer-motion';

const TrafficLight = ({ direction, signal, emergencyActive = false, isFullscreen = false }) => {
  // Equidistant coordinates relative to the 50% intersection center (matching reference layout)
  const positions = isFullscreen
    ? {
        N: { top: 'calc(50% - 240px)', left: 'calc(50% - 75px)' },
        S: { top: 'calc(50% + 140px)', left: 'calc(50% + 25px)' },
        E: { left: 'calc(50% + 195px)', top: 'calc(50% + 10px)' },
        W: { left: 'calc(50% - 240px)', top: 'calc(50% - 120px)' }
      }
    : {
        N: { top: 'calc(50% - 155px)', left: 'calc(50% - 44px)' },
        S: { top: 'calc(50% + 95px)', left: 'calc(50% + 14px)' },
        E: { left: 'calc(50% + 125px)', top: 'calc(50% + 6px)' },
        W: { left: 'calc(50% - 155px)', top: 'calc(50% - 78px)' }
      };

  const position = positions[direction];
  
  // Determine if this direction should be green
  const isGreen = signal === direction || (emergencyActive && signal.includes(direction));

  return (
    <div 
      className="absolute z-20"
      style={position}
    >
      <div className={`bg-gray-900 rounded-lg shadow-lg border border-gray-700 ${isFullscreen ? 'p-2.5' : 'p-1.5'}`}>
        <div className={`flex flex-col ${isFullscreen ? 'space-y-1.5' : 'space-y-1'}`}>
          {/* Red light */}
          <motion.div
            className={`rounded-full ${
              isFullscreen ? 'w-5 h-5' : 'w-3 h-3'
            } ${
              !isGreen ? 'bg-red-500 shadow-red-400' : 'bg-red-900'
            }`}
            animate={{
              boxShadow: !isGreen ? '0 0 10px rgba(239, 68, 68, 0.9)' : '0 0 2px rgba(153, 27, 27, 0.5)'
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Yellow light */}
          <div className={`rounded-full ${
            isFullscreen ? 'w-5 h-5' : 'w-3 h-3'
          } ${
            emergencyActive ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-900'
          }`} />
          
          {/* Green light */}
          <motion.div
            className={`rounded-full ${
              isFullscreen ? 'w-5 h-5' : 'w-3 h-3'
            } ${
              isGreen ? 'bg-green-500 shadow-green-400' : 'bg-green-900'
            }`}
            animate={{
              boxShadow: isGreen ? '0 0 10px rgba(34, 197, 94, 0.9)' : '0 0 2px rgba(20, 83, 45, 0.5)'
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* Direction label */}
      <div className={`text-center mt-1 font-bold bg-white px-1 rounded ${isFullscreen ? 'text-sm text-gray-800' : 'text-xs text-gray-700'}`}>
        {direction}
      </div>
      
      {/* Emergency indicator */}
      {emergencyActive && signal.includes(direction) && (
        <motion.div 
          className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default TrafficLight;
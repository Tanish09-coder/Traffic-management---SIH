import React from 'react';
import { motion } from 'framer-motion';
import Bike from './Bike';

// Deterministic hash helper from id string
const getDeterministicHash = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

// Sedan color variations
const SEDAN_PALETTES = [
  { body: '#2563EB', roof: '#1D4ED8', window: '#93C5FD' }, // Blue (default)
  { body: '#DC2626', roof: '#B91C1C', window: '#FECDD3' }, // Red
  { body: '#16A34A', roof: '#15803D', window: '#BBF7D0' }, // Green
  { body: '#D97706', roof: '#B45309', window: '#FDE68A' }, // Amber
  { body: '#475569', roof: '#334155', window: '#CBD5E1' }, // Slate Grey
];

// Motorcycle color variations
const BIKE_PALETTES = [
  { color: '#0284C7', helmet: '#F8FAFC' }, // Blue / White helmet
  { color: '#DC2626', helmet: '#1E293B' }, // Red / Dark helmet
  { color: '#16A34A', helmet: '#FEF08A' }, // Green / Yellow helmet
  { color: '#EA580C', helmet: '#F8FAFC' }, // Orange / White helmet
  { color: '#9333EA', helmet: '#FDE047' }, // Purple / Hi-Vis helmet
  { color: '#0F172A', helmet: '#EF4444' }, // Black / Red helmet
];

// 1. Regular Sedan Car SVG
const SedanSVG = ({ colorIndex = 0 }) => {
  const palette = SEDAN_PALETTES[colorIndex % SEDAN_PALETTES.length];
  return (
    <svg
      viewBox="0 0 24 40"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Wheels */}
      <rect x="0.2" y="6" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="6" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="0.2" y="28.5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="28.5" width="2.6" height="5.5" rx="1" fill="#0F172A" />

      {/* Main Body */}
      <rect
        x="2.5"
        y="2"
        width="19"
        height="36"
        rx="4.5"
        fill={palette.body}
        stroke="#0F172A"
        strokeWidth="0.8"
      />

      {/* Side Mirrors */}
      <rect x="0.8" y="11.5" width="1.8" height="2.8" rx="0.7" fill={palette.body} stroke="#0F172A" strokeWidth="0.4" />
      <rect x="21.4" y="11.5" width="1.8" height="2.8" rx="0.7" fill={palette.body} stroke="#0F172A" strokeWidth="0.4" />

      {/* Front Windshield with Center Divider */}
      <rect x="4.5" y="10" width="15" height="5.5" rx="1.5" fill={palette.window} stroke="#0F172A" strokeWidth="0.5" />
      <line x1="12" y1="10" x2="12" y2="15.5" stroke="#0F172A" strokeWidth="0.6" />

      {/* Roof Section */}
      <rect x="5" y="15.5" width="14" height="10" fill={palette.roof} />

      {/* Rear Window */}
      <rect x="4.5" y="25.5" width="15" height="4.5" rx="1.2" fill={palette.window} stroke="#0F172A" strokeWidth="0.5" />

      {/* Headlights (Front / Top) */}
      <circle cx="5" cy="3.5" r="1.1" fill="#FEF08A" />
      <circle cx="19" cy="3.5" r="1.1" fill="#FEF08A" />

      {/* Taillights (Rear / Bottom) */}
      <rect x="4" y="36.5" width="2.8" height="1.2" rx="0.5" fill="#EF4444" />
      <rect x="17.2" y="36.5" width="2.8" height="1.2" rx="0.5" fill="#EF4444" />
    </svg>
  );
};

// 2. Bus / Larger Vehicle SVG
const BusSVG = () => {
  return (
    <svg
      viewBox="0 0 24 42"
      className="w-full h-full drop-shadow-sm select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Wheels */}
      <rect x="0.2" y="5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="0.2" y="31" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="31" width="2.6" height="5.5" rx="1" fill="#0F172A" />

      {/* Main Bus Body */}
      <rect
        x="2.5"
        y="1.5"
        width="19"
        height="39"
        rx="3.5"
        fill="#94A3B8"
        stroke="#334155"
        strokeWidth="0.8"
      />

      {/* Front & Rear Bumpers */}
      <rect x="4.5" y="1.5" width="15" height="1.6" rx="0.5" fill="#475569" />
      <rect x="4.5" y="38.9" width="15" height="1.6" rx="0.5" fill="#475569" />

      {/* Front Windshield Strip */}
      <rect x="4.5" y="4.8" width="15" height="5.2" rx="1.3" fill="#CBD5E1" stroke="#334155" strokeWidth="0.5" />
      <line x1="12" y1="4.8" x2="12" y2="10" stroke="#334155" strokeWidth="0.6" />

      {/* Roof Sunroof / Mullion Ribs */}
      <rect x="5" y="11.8" width="14" height="20.5" rx="1" fill="#64748B" opacity="0.35" stroke="#475569" strokeWidth="0.5" />
      <line x1="5" y1="16" x2="19" y2="16" stroke="#334155" strokeWidth="0.6" />
      <line x1="5" y1="20.2" x2="19" y2="20.2" stroke="#334155" strokeWidth="0.6" />
      <line x1="5" y1="24.4" x2="19" y2="24.4" stroke="#334155" strokeWidth="0.6" />
      <line x1="5" y1="28.6" x2="19" y2="28.6" stroke="#334155" strokeWidth="0.6" />

      {/* Rear Window */}
      <rect x="4.5" y="34.5" width="15" height="3.2" rx="1" fill="#CBD5E1" stroke="#334155" strokeWidth="0.5" />

      {/* Headlights & Taillights */}
      <circle cx="4.8" cy="2.8" r="1.1" fill="#FEF08A" />
      <circle cx="19.2" cy="2.8" r="1.1" fill="#FEF08A" />
      <rect x="4" y="38.8" width="2.6" height="1.1" rx="0.4" fill="#EF4444" />
      <rect x="17.4" y="38.8" width="2.6" height="1.1" rx="0.4" fill="#EF4444" />
    </svg>
  );
};

// 3. Ambulance SVG
const AmbulanceSVG = () => {
  return (
    <svg
      viewBox="0 0 24 40"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Wheels */}
      <rect x="0.2" y="5.5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="5.5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="0.2" y="29" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="29" width="2.6" height="5.5" rx="1" fill="#0F172A" />

      {/* White Body */}
      <rect
        x="2.5"
        y="1.5"
        width="19"
        height="37"
        rx="4.5"
        fill="#FFFFFF"
        stroke="#94A3B8"
        strokeWidth="0.8"
      />

      {/* Side Mirrors */}
      <rect x="0.8" y="11" width="1.8" height="2.8" rx="0.7" fill="#F8FAFC" stroke="#64748B" strokeWidth="0.4" />
      <rect x="21.4" y="11" width="1.8" height="2.8" rx="0.7" fill="#F8FAFC" stroke="#64748B" strokeWidth="0.4" />

      {/* Roof Light Bar with Alternating SVG <animate> Beacons */}
      <rect x="6" y="2.5" width="12" height="3.2" rx="1" fill="#1E293B" />
      <circle cx="8.5" cy="4.1" r="1.3" fill="#F59E0B">
        <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
        <animate attributeName="fill" values="#F59E0B;#EF4444;#F59E0B" dur="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="15.5" cy="4.1" r="1.3" fill="#EF4444">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="0.5s" repeatCount="indefinite" />
        <animate attributeName="fill" values="#EF4444;#F59E0B;#EF4444" dur="0.5s" repeatCount="indefinite" />
      </circle>

      {/* Front Windshield */}
      <rect x="4.5" y="7" width="15" height="5.2" rx="1.3" fill="#93C5FD" stroke="#3B82F6" strokeWidth="0.5" />
      <line x1="12" y1="7" x2="12" y2="12.2" stroke="#1E40AF" strokeWidth="0.6" />

      {/* Red Cross Marking on Roof */}
      <rect x="7" y="16.5" width="10" height="3" rx="0.5" fill="#EF4444" />
      <rect x="10.5" y="13" width="3" height="10" rx="0.5" fill="#EF4444" />

      {/* AMBULANCE Text Label */}
      <text
        x="12"
        y="27.5"
        textAnchor="middle"
        fill="#334155"
        fontSize="2.5"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.2"
      >
        AMBULANCE
      </text>

      {/* Rear Door Outline & Taillights */}
      <line x1="12" y1="32" x2="12" y2="38" stroke="#CBD5E1" strokeWidth="0.6" />
      <rect x="3.8" y="37.2" width="2.4" height="1" rx="0.4" fill="#EF4444" />
      <rect x="17.8" y="37.2" width="2.4" height="1" rx="0.4" fill="#EF4444" />
    </svg>
  );
};

// 4. Fire Truck SVG
const FireTruckSVG = () => {
  return (
    <svg
      viewBox="0 0 24 42"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Wheels */}
      <rect x="0.2" y="5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="0.2" y="31" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="31" width="2.6" height="5.5" rx="1" fill="#0F172A" />

      {/* Red Body */}
      <rect
        x="2.5"
        y="1.5"
        width="19"
        height="39"
        rx="4"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="0.8"
      />

      {/* Side Mirrors */}
      <rect x="0.8" y="11" width="1.8" height="2.8" rx="0.7" fill="#DC2626" stroke="#991B1B" strokeWidth="0.4" />
      <rect x="21.4" y="11" width="1.8" height="2.8" rx="0.7" fill="#DC2626" stroke="#991B1B" strokeWidth="0.4" />

      {/* Roof Light Bar with Alternating Beacons */}
      <rect x="6" y="2.5" width="12" height="3.2" rx="1" fill="#1E293B" />
      <circle cx="8.5" cy="4.1" r="1.3" fill="#EF4444">
        <animate attributeName="opacity" values="1;0.2;1" dur="0.45s" repeatCount="indefinite" />
      </circle>
      <circle cx="15.5" cy="4.1" r="1.3" fill="#F59E0B">
        <animate attributeName="opacity" values="0.2;1;0.2" dur="0.45s" repeatCount="indefinite" />
      </circle>

      {/* Front Windshield */}
      <rect x="4.5" y="7" width="15" height="5.5" rx="1.3" fill="#FECDD3" stroke="#991B1B" strokeWidth="0.5" />
      <line x1="12" y1="7" x2="12" y2="12.5" stroke="#991B1B" strokeWidth="0.6" />

      {/* White Stripe with "FIRE" Label */}
      <rect x="3.5" y="14.8" width="17" height="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.3" />
      <text
        x="12"
        y="19.2"
        textAnchor="middle"
        fill="#DC2626"
        fontSize="3.4"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.4"
      >
        FIRE
      </text>

      {/* Rear Equipment Panel & Hoses */}
      <rect x="4.5" y="23" width="15" height="12.5" rx="1" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.5" />
      <circle cx="8.5" cy="27.5" r="1.8" fill="#1E293B" stroke="#E2E8F0" strokeWidth="0.5" />
      <circle cx="15.5" cy="27.5" r="1.8" fill="#1E293B" stroke="#E2E8F0" strokeWidth="0.5" />

      {/* Lights */}
      <rect x="3.8" y="38.8" width="2.6" height="1.1" rx="0.4" fill="#FEF08A" />
      <rect x="17.6" y="38.8" width="2.6" height="1.1" rx="0.4" fill="#FEF08A" />
    </svg>
  );
};

// 5. Police Car SVG
const PoliceSVG = () => {
  return (
    <svg
      viewBox="0 0 24 40"
      className="w-full h-full drop-shadow-md select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4 Wheels */}
      <rect x="0.2" y="6" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="6" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="0.2" y="28.5" width="2.6" height="5.5" rx="1" fill="#0F172A" />
      <rect x="21.2" y="28.5" width="2.6" height="5.5" rx="1" fill="#0F172A" />

      {/* Dark Navy Body */}
      <rect
        x="2.5"
        y="2"
        width="19"
        height="36"
        rx="4.5"
        fill="#0F172A"
        stroke="#020617"
        strokeWidth="0.8"
      />

      {/* Side Mirrors */}
      <rect x="0.8" y="11" width="1.8" height="2.8" rx="0.7" fill="#0F172A" stroke="#020617" strokeWidth="0.4" />
      <rect x="21.4" y="11" width="1.8" height="2.8" rx="0.7" fill="#0F172A" stroke="#020617" strokeWidth="0.4" />

      {/* Roof Beacon Bar (Alternating Blue & Red) */}
      <rect x="6.5" y="3.5" width="11" height="3" rx="1" fill="#020617" />
      <circle cx="8.8" cy="5" r="1.2" fill="#3B82F6">
        <animate attributeName="opacity" values="1;0.1;1" dur="0.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="15.2" cy="5" r="1.2" fill="#EF4444">
        <animate attributeName="opacity" values="0.1;1;0.1" dur="0.4s" repeatCount="indefinite" />
      </circle>

      {/* Front Windshield */}
      <rect x="4.5" y="8" width="15" height="5" rx="1.3" fill="#93C5FD" stroke="#1E293B" strokeWidth="0.5" />
      <line x1="12" y1="8" x2="12" y2="13" stroke="#1E293B" strokeWidth="0.6" />

      {/* White Roof Accent Strip */}
      <rect x="4.5" y="14.5" width="15" height="7" rx="0.8" fill="#F8FAFC" />

      {/* Rear Window */}
      <rect x="4.5" y="23.5" width="15" height="3.8" rx="1.2" fill="#93C5FD" stroke="#1E293B" strokeWidth="0.5" />

      {/* "POLICE" Text Label on Trunk */}
      <text
        x="12"
        y="32.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="2.6"
        fontWeight="bold"
        fontFamily="sans-serif"
        letterSpacing="0.3"
      >
        POLICE
      </text>

      {/* Headlights & Taillights */}
      <circle cx="5" cy="3.5" r="1.1" fill="#FEF08A" />
      <circle cx="19" cy="3.5" r="1.1" fill="#FEF08A" />
      <rect x="4" y="36.5" width="2.8" height="1.2" rx="0.5" fill="#EF4444" />
      <rect x="17.2" y="36.5" width="2.8" height="1.2" rx="0.5" fill="#EF4444" />
    </svg>
  );
};

// Shape Selector / Lookup
const VEHICLE_RENDERERS = {
  car: ({ colorIndex }) => <SedanSVG colorIndex={colorIndex} />,
  bike: ({ colorIndex }) => {
    const palette = BIKE_PALETTES[colorIndex % BIKE_PALETTES.length];
    return <Bike color={palette.color} helmetColor={palette.helmet} />;
  },
  bus: () => <BusSVG />,
  ambulance: () => <AmbulanceSVG />,
  firetruck: () => <FireTruckSVG />,
  police: () => <PoliceSVG />,
};

const resolveVehicle = (id, type) => {
  const hash = getDeterministicHash(String(id || ''));

  if (['ambulance', 'firetruck', 'police', 'bus', 'bike', 'car'].includes(type)) {
    return { kind: type, colorIndex: hash };
  }

  if (type === 'emergency') {
    const emergencyKinds = ['ambulance', 'firetruck', 'police'];
    return { kind: emergencyKinds[hash % emergencyKinds.length], colorIndex: hash };
  }

  // Normal traffic distribution: 20% bus, 30% motorcycle, 50% sedan
  const mod = hash % 10;
  if (mod === 0 || mod === 5) {
    return { kind: 'bus', colorIndex: hash };
  }
  if (mod === 1 || mod === 2 || mod === 6) {
    return { kind: 'bike', colorIndex: hash };
  }

  return { kind: 'car', colorIndex: hash };
};

const Car = ({ id, lane, position, type, isFullscreen = false }) => {
  const vehicle = resolveVehicle(id, type);
  const isLarge = vehicle.kind === 'firetruck' || vehicle.kind === 'bus';
  const isBike = vehicle.kind === 'bike';

  // Calculate position and rotation based on lane
  // Normal: Cars 11x19px, Bikes 9.5x17.5px (just smaller than cars)
  // Fullscreen: Cars 22x38px, Bikes 19x35px (scaled for rich detail)
  const getStyles = () => {
    const baseStyles = {
      position: 'absolute',
      width: isFullscreen
        ? (isLarge ? '24px' : isBike ? '19px' : '22px')
        : (isLarge ? '12px' : isBike ? '9.5px' : '11px'),
      height: isFullscreen
        ? (isLarge ? '42px' : isBike ? '35px' : '38px')
        : (isLarge ? '21px' : isBike ? '17.5px' : '19px'),
    };

    // In fullscreen, the container is huge but roads have a fixed pixel width.
    // Percentage offsets (53%/47%) would put cars outside the road.
    // Use calc(50% ± fixed offset) to keep cars in their lane.
    const laneOffsetPos = isFullscreen ? 'calc(50% + 25px)' : '53%';
    const laneOffsetNeg = isFullscreen ? 'calc(50% - 25px)' : '47%';

    switch (lane) {
      case 'N':
        return {
          ...baseStyles,
          left: laneOffsetPos,
          top: `${position}%`,
          transform: 'translateX(-50%)',
        };
      case 'S':
        return {
          ...baseStyles,
          left: laneOffsetNeg,
          bottom: `${position}%`,
          transform: 'translateX(-50%) rotate(180deg)',
        };
      case 'E':
        return {
          ...baseStyles,
          top: laneOffsetPos,
          right: `${position}%`,
          transform: 'translateY(-50%) rotate(90deg)',
        };
      case 'W':
        return {
          ...baseStyles,
          top: laneOffsetNeg,
          left: `${position}%`,
          transform: 'translateY(-50%) rotate(-90deg)',
        };
      default:
        return baseStyles;
    }
  };

  const renderShape = VEHICLE_RENDERERS[vehicle.kind] || VEHICLE_RENDERERS.car;

  return (
    <motion.div
      initial={getStyles()}
      animate={getStyles()}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'linear' }}
      style={{
        transition: 'left 400ms linear, top 400ms linear, right 400ms linear, bottom 400ms linear, transform 400ms linear',
      }}
      className="flex items-center justify-center pointer-events-none"
    >
      {renderShape({ colorIndex: vehicle.colorIndex })}
    </motion.div>
  );
};

export default Car;
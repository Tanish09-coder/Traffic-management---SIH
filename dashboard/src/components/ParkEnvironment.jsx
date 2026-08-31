import React from 'react';

// Top-down beautiful SVG Tree with realistic foliage layers & shadow
const Tree = ({ className = '', size = 32, variant = 1 }) => {
  if (variant === 1) {
    // Deciduous Lush Green Tree
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className={`select-none drop-shadow-md transition-transform hover:scale-105 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Ground Shadow */}
        <circle cx="21" cy="22" r="17" fill="#0F172A" fillOpacity="0.18" filter="blur(1px)" />
        
        {/* Base Foliage Layer */}
        <circle cx="20" cy="20" r="17" fill="#15803D" />
        
        {/* Outer Organic Foliage Lobes */}
        <circle cx="13" cy="15" r="9" fill="#16A34A" />
        <circle cx="27" cy="14" r="9.5" fill="#16A34A" />
        <circle cx="14" cy="26" r="9" fill="#15803D" />
        <circle cx="26" cy="25" r="9" fill="#16A34A" />
        <circle cx="20" cy="11" r="8.5" fill="#22C55E" />
        
        {/* Inner Highlighted Canopy */}
        <circle cx="19" cy="18" r="11" fill="#22C55E" />
        <circle cx="17" cy="16" r="7.5" fill="#4ADE80" />
        <circle cx="22" cy="15" r="6" fill="#86EFAC" fillOpacity="0.85" />
        
        {/* Center Trunk Top Core */}
        <circle cx="19" cy="18" r="2.5" fill="#78350F" />
      </svg>
    );
  }

  if (variant === 2) {
    // Pine / Conifer Evergreen Tree
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className={`select-none drop-shadow-md transition-transform hover:scale-105 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="21" cy="22" r="15" fill="#0F172A" fillOpacity="0.18" filter="blur(1px)" />
        {/* Outer Dark Fir Layer */}
        <polygon points="20,2 35,32 5,32" fill="#064E3B" />
        <polygon points="20,6 32,30 8,30" fill="#047857" />
        <polygon points="20,10 29,26 11,26" fill="#059669" />
        <polygon points="20,13 25,23 15,23" fill="#10B981" />
        <polygon points="20,15 22,20 18,20" fill="#34D399" />
      </svg>
    );
  }

  // Flowering / Blossom Tree (variant 3)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`select-none drop-shadow-md transition-transform hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="21" cy="22" r="16" fill="#0F172A" fillOpacity="0.18" filter="blur(1px)" />
      <circle cx="20" cy="20" r="16" fill="#047857" />
      <circle cx="14" cy="15" r="9" fill="#059669" />
      <circle cx="26" cy="15" r="9" fill="#10B981" />
      <circle cx="15" cy="25" r="8.5" fill="#047857" />
      <circle cx="25" cy="24" r="8.5" fill="#10B981" />
      <circle cx="20" cy="18" r="9.5" fill="#34D399" />
      {/* Blossom Highlights */}
      <circle cx="15" cy="14" r="2.2" fill="#F472B6" />
      <circle cx="24" cy="13" r="2.5" fill="#FBCFE8" />
      <circle cx="19" cy="22" r="2.2" fill="#F472B6" />
      <circle cx="26" cy="22" r="2" fill="#FDF2F8" />
      <circle cx="12" cy="20" r="1.8" fill="#FBCFE8" />
    </svg>
  );
};

// Small Bush SVG
const Bush = ({ className = '', size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`select-none drop-shadow-xs ${className}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="13" r="10" fill="#0F172A" fillOpacity="0.14" />
    <circle cx="12" cy="11" r="9.5" fill="#15803D" />
    <circle cx="9" cy="9" r="6" fill="#22C55E" />
    <circle cx="15" cy="9" r="5.5" fill="#4ADE80" />
    <circle cx="12" cy="13" r="5" fill="#16A34A" />
  </svg>
);

// Quadrant Park & Tree Environment
export const ParkEnvironment = ({ isFullscreen = false }) => {
  // Road width & center box dimensions
  // Normal: road width 80px (w-20), box is 80px x 80px (w-20 h-20) -> quadrants span 0 to calc(50% - 40px)
  // Fullscreen: road width 160px (w-40), box is 160px x 160px (w-40 h-40) -> quadrants span 0 to calc(50% - 80px)

  const roadHalf = isFullscreen ? '80px' : '40px';

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0">
      
      {/* 🌲 1. TOP-LEFT QUADRANT (Park Area) */}
      <div 
        className="absolute top-0 left-0 overflow-hidden bg-gradient-to-br from-[#D9EED9] via-[#CDE5CE] to-[#C0DCBF] border-r-4 border-b-4 border-[#94A3B8]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        {/* Sidewalk curb texture along roads */}
        <div className="absolute right-0 top-0 w-3 h-full bg-[#CBD5E1] border-l border-slate-300 shadow-inner" />
        <div className="absolute bottom-0 left-0 w-full h-3 bg-[#CBD5E1] border-t border-slate-300 shadow-inner" />
        
        {/* Trees & Landscaping */}
        <Tree size={isFullscreen ? 56 : 38} variant={1} className="absolute top-4 left-6" />
        <Tree size={isFullscreen ? 46 : 30} variant={3} className="absolute top-12 left-20" />
        <Tree size={isFullscreen ? 50 : 34} variant={2} className="absolute bottom-6 left-8" />
        <Bush size={isFullscreen ? 24 : 16} className="absolute bottom-5 left-24" />
        <Bush size={isFullscreen ? 20 : 14} className="absolute top-6 left-32" />
        
        {/* Walking Pathway in Park */}
        <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full border-4 border-amber-100/60 opacity-60" />
      </div>

      {/* 🌲 2. TOP-RIGHT QUADRANT (Park Area) */}
      <div 
        className="absolute top-0 right-0 overflow-hidden bg-gradient-to-bl from-[#D9EED9] via-[#CDE5CE] to-[#C0DCBF] border-l-4 border-b-4 border-[#94A3B8]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        <div className="absolute left-0 top-0 w-3 h-full bg-[#CBD5E1] border-r border-slate-300 shadow-inner" />
        <div className="absolute bottom-0 right-0 w-full h-3 bg-[#CBD5E1] border-t border-slate-300 shadow-inner" />
        
        <Tree size={isFullscreen ? 54 : 36} variant={2} className="absolute top-4 right-8" />
        <Tree size={isFullscreen ? 58 : 40} variant={1} className="absolute top-14 right-24" />
        <Tree size={isFullscreen ? 48 : 32} variant={3} className="absolute bottom-7 right-8" />
        <Bush size={isFullscreen ? 22 : 15} className="absolute bottom-6 right-24" />
        <Bush size={isFullscreen ? 20 : 14} className="absolute top-5 right-34" />
      </div>

      {/* 🌲 3. BOTTOM-LEFT QUADRANT (Park Area) */}
      <div 
        className="absolute bottom-0 left-0 overflow-hidden bg-gradient-to-tr from-[#D9EED9] via-[#CDE5CE] to-[#C0DCBF] border-r-4 border-t-4 border-[#94A3B8]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        <div className="absolute right-0 top-0 w-3 h-full bg-[#CBD5E1] border-l border-slate-300 shadow-inner" />
        <div className="absolute top-0 left-0 w-full h-3 bg-[#CBD5E1] border-b border-slate-300 shadow-inner" />
        
        <Tree size={isFullscreen ? 56 : 38} variant={3} className="absolute bottom-4 left-8" />
        <Tree size={isFullscreen ? 50 : 34} variant={1} className="absolute bottom-14 left-22" />
        <Tree size={isFullscreen ? 46 : 30} variant={2} className="absolute top-6 left-6" />
        <Bush size={isFullscreen ? 22 : 16} className="absolute top-6 left-22" />
        <Bush size={isFullscreen ? 18 : 13} className="absolute bottom-4 left-34" />
      </div>

      {/* 🌲 4. BOTTOM-RIGHT QUADRANT (Park Area) */}
      <div 
        className="absolute bottom-0 right-0 overflow-hidden bg-gradient-to-tl from-[#D9EED9] via-[#CDE5CE] to-[#C0DCBF] border-l-4 border-t-4 border-[#94A3B8]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        <div className="absolute left-0 top-0 w-3 h-full bg-[#CBD5E1] border-r border-slate-300 shadow-inner" />
        <div className="absolute top-0 right-0 w-full h-3 bg-[#CBD5E1] border-b border-slate-300 shadow-inner" />
        
        <Tree size={isFullscreen ? 58 : 40} variant={1} className="absolute bottom-4 right-8" />
        <Tree size={isFullscreen ? 50 : 34} variant={2} className="absolute bottom-12 right-24" />
        <Tree size={isFullscreen ? 46 : 32} variant={3} className="absolute top-7 right-8" />
        <Bush size={isFullscreen ? 24 : 16} className="absolute top-6 right-22" />
        <Bush size={isFullscreen ? 20 : 14} className="absolute bottom-6 right-36" />
      </div>

    </div>
  );
};

export default ParkEnvironment;

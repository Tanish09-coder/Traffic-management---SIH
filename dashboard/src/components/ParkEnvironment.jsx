import React from 'react';
import tree1 from '../assets/trees/tree1.png';
import tree2 from '../assets/trees/tree2.png';
import tree3 from '../assets/trees/tree3.png';
import tree4 from '../assets/trees/tree4.png';
import tree5 from '../assets/trees/tree5.png';

export const ParkEnvironment = ({ isFullscreen = false }) => {
  // Road width & center box dimensions
  // Normal: road width 80px (w-20), center box is 80px x 80px -> quadrants span 0 to calc(50% - 40px)
  // Fullscreen: road width 160px (w-40), center box is 160px x 160px -> quadrants span 0 to calc(50% - 80px)
  const roadHalf = isFullscreen ? '80px' : '40px';

  // Tree sizes: Big tree ~38-40px, Slightly larger small tree ~28px, Smaller tree ~24px
  const bigTreeClass = isFullscreen ? 'w-14 h-14' : 'w-9.5 h-9.5';
  const mediumSmallTreeClass = isFullscreen ? 'w-10 h-10' : 'w-7 h-7'; // slightly bigger (~28px)
  const smallTreeClass = isFullscreen ? 'w-8 h-8' : 'w-6 h-6'; // compact (~24px)

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-0 bg-[#D9DEE3]">

      {/* 🏙️ 1. TOP-LEFT QUADRANT */}
      <div
        className="absolute top-0 left-0 overflow-hidden bg-[#D9DEE3]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        {/* Sidewalks along road edges */}
        <div className="absolute right-0 top-0 w-3.5 h-full bg-[#CBD2D9] border-l border-[#B4BDC5]" />
        <div className="absolute bottom-0 left-0 w-full h-3.5 bg-[#CBD2D9] border-t border-[#B4BDC5]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#CBD2D9] rounded-br-2xl" />

        {/* Big Tree along West road - shifted further left (negative x direction) */}
        <img
          src={tree1}
          alt=""
          className={`absolute bottom-2.5 right-48 sm:right-72 object-contain select-none pointer-events-none ${bigTreeClass}`}
        />

        {/* Two small trees beside it along North road: shifted slightly left as well */}
        <img
          src={tree4}
          alt=""
          className={`absolute bottom-11 right-6 sm:right-7 object-contain select-none pointer-events-none ${mediumSmallTreeClass}`}
        />
        <img
          src={tree4}
          alt=""
          className={`absolute bottom-18 right-6.5 sm:right-7.5 object-contain select-none pointer-events-none ${smallTreeClass}`}
        />
      </div>

      {/* 🏙️ 2. TOP-RIGHT QUADRANT */}
      <div
        className="absolute top-0 right-0 overflow-hidden bg-[#D9DEE3]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        {/* Sidewalks along road edges */}
        <div className="absolute left-0 top-0 w-3.5 h-full bg-[#CBD2D9] border-r border-[#B4BDC5]" />
        <div className="absolute bottom-0 right-0 w-full h-3.5 bg-[#CBD2D9] border-t border-[#B4BDC5]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 bg-[#CBD2D9] rounded-bl-2xl" />

        {/* Tree along East road */}
        <img
          src={tree2}
          alt=""
          className={`absolute bottom-3.5 left-48 sm:left-57 object-contain select-none pointer-events-none ${bigTreeClass}`}
        />
      </div>

      {/* 🏙️ 3. BOTTOM-LEFT QUADRANT */}
      <div
        className="absolute bottom-0 left-0 overflow-hidden bg-[#D9DEE3]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        {/* Sidewalks along road edges */}
        <div className="absolute right-0 bottom-0 w-3.5 h-full bg-[#CBD2D9] border-l border-[#B4BDC5]" />
        <div className="absolute top-0 left-0 w-full h-3.5 bg-[#CBD2D9] border-b border-[#B4BDC5]" />
        <div className="absolute top-0 right-0 w-5 h-5 bg-[#CBD2D9] rounded-tr-2xl" />

        {/* Big Tree along West road - shifted further left (negative x direction) */}
        <img
          src={tree3}
          alt=""
          className={`absolute top-2.5 right-48 sm:right-52 object-contain select-none pointer-events-none ${bigTreeClass}`}
        />

        {/* Two small trees beside it along South road: shifted slightly left as well */}
        <img
          src={tree4}
          alt=""
          className={`absolute top-11 right-6 sm:right-7 object-contain select-none pointer-events-none ${mediumSmallTreeClass}`}
        />
        <img
          src={tree4}
          alt=""
          className={`absolute top-18 right-6.5 sm:right-7.5 object-contain select-none pointer-events-none ${smallTreeClass}`}
        />
      </div>

      {/* 🏙️ 4. BOTTOM-RIGHT QUADRANT */}
      <div
        className="absolute bottom-0 right-0 overflow-hidden bg-[#D9DEE3]"
        style={{
          width: `calc(50% - ${roadHalf})`,
          height: `calc(50% - ${roadHalf})`
        }}
      >
        {/* Sidewalks along road edges */}
        <div className="absolute left-0 bottom-0 w-3.5 h-full bg-[#CBD2D9] border-r border-[#B4BDC5]" />
        <div className="absolute top-0 right-0 w-full h-3.5 bg-[#CBD2D9] border-b border-[#B4BDC5]" />
        <div className="absolute top-0 left-0 w-5 h-5 bg-[#CBD2D9] rounded-tl-2xl" />

        {/* Small tree along South road */}
        <img
          src={tree5}
          alt=""
          className={`absolute top-14 left-6 object-contain select-none pointer-events-none ${smallTreeClass}`}
        />

        {/* Tree along East road */}
        <img
          src={tree2}
          alt=""
          className={`absolute top-2.5 left-48 sm:left-52 object-contain select-none pointer-events-none ${bigTreeClass}`}
        />
      </div>

    </div>
  );
};

export default ParkEnvironment;

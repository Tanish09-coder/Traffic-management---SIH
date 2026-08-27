import React, { useEffect, useRef } from 'react';
import { 
  Video, 
  Cpu, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw
} from 'lucide-react';
import { useTraffic } from '../context/TrafficContext';

export const JunctionInspector = () => {
  const { selectedJunction, setJunctionOverride } = useTraffic();
  const canvasRef = useRef(null);

  // Simulated YOLOv8 Bounding Box Stream with ROI Lane Counting Lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const boxes = [
      { id: 1, label: 'car 0.98', color: '#38BDF8', x: 30, y: 35, w: 60, h: 36, vx: 0.5, vy: 0.2 },
      { id: 2, label: 'bike 0.94', color: '#34D399', x: 110, y: 75, w: 26, h: 20, vx: -0.4, vy: 0.3 },
      { id: 3, label: 'bus 0.96', color: '#FBBF24', x: 155, y: 25, w: 75, h: 42, vx: 0.3, vy: -0.2 },
      { id: 4, label: 'car 0.95', color: '#38BDF8', x: 65, y: 90, w: 55, h: 30, vx: -0.5, vy: -0.2 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Matte dark asphalt
      ctx.fillStyle = '#090C12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ROI Lane Counting Boundary Lines (Yellow dashed)
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(10, 45); ctx.lineTo(canvas.width - 10, 45);
      ctx.moveTo(10, 85); ctx.lineTo(canvas.width - 10, 85);
      ctx.stroke();
      ctx.setLineDash([]);

      if (selectedJunction.cameraStatus !== 'online') {
        ctx.fillStyle = '#EF4444';
        ctx.font = '10px monospace';
        ctx.fillText('[CAMERA STREAM OFFLINE - FAILSAFE ACTIVE]', 15, canvas.height / 2);
        return;
      }

      // Detection Bounding Boxes
      boxes.forEach(box => {
        box.x += box.vx;
        box.y += box.vy;

        if (box.x < 5 || box.x + box.w > canvas.width - 5) box.vx *= -1;
        if (box.y < 5 || box.y + box.h > canvas.height - 5) box.vy *= -1;

        ctx.strokeStyle = box.color;
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x, box.y, box.w, box.h);

        // Header Tag Label
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y - 11, box.label.length * 6, 11);

        ctx.fillStyle = '#09090B';
        ctx.font = '8px monospace';
        ctx.fillText(box.label, box.x + 2, box.y - 3);
      });

      // Camera HUD Header Overlay
      ctx.fillStyle = 'rgba(9, 12, 18, 0.85)';
      ctx.fillRect(0, 0, canvas.width, 18);
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '9px monospace';
      ctx.fillText(`CAM-01 // ${selectedJunction.code} • ${selectedJunction.fps} FPS • ${selectedJunction.inferenceMs}ms • ROI-ACTIVE`, 6, 12);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [selectedJunction]);

  const approaches = [
    { dir: 'N', name: 'N-Approach', icon: ArrowUp, data: selectedJunction.approachData.N },
    { dir: 'S', name: 'S-Approach', icon: ArrowDown, data: selectedJunction.approachData.S },
    { dir: 'E', name: 'E-Approach', icon: ArrowRight, data: selectedJunction.approachData.E },
    { dir: 'W', name: 'W-Approach', icon: ArrowLeft, data: selectedJunction.approachData.W }
  ];

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Video className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wider">
            CCTV / COMPUTER VISION HUD [{selectedJunction.code}]
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono">
          <span className="text-zinc-500">PHASE:</span>
          <span className="font-bold text-emerald-400">{selectedJunction.activePhase}</span>
          <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-200">
            {selectedJunction.phaseTimer}s
          </span>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Compact Camera Feed Container */}
        <div className="rounded border border-zinc-800 bg-[#090C12] overflow-hidden">
          <canvas
            ref={canvasRef}
            width={320}
            height={115}
            className="w-full h-[115px] block"
          />
        </div>

        {/* Approach Lane ROI & PCU Matrix */}
        <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px]">
          {approaches.map(app => {
            const isApproachGreen = (app.dir === 'N' || app.dir === 'S') 
              ? selectedJunction.activePhase === 'NS' 
              : selectedJunction.activePhase === 'EW';

            return (
              <div
                key={app.dir}
                className={`p-1.5 rounded border text-center ${
                  isApproachGreen
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-center space-x-1 mb-0.5">
                  <span className="font-bold text-zinc-200">{app.dir}</span>
                  <span className={`text-[8px] font-bold px-1 py-0.1 rounded ${
                    isApproachGreen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isApproachGreen ? 'GRN' : 'RED'}
                  </span>
                </div>
                <div className="font-bold text-zinc-100 text-xs tabular-nums">
                  {app.data.pcu} <span className="text-[8px] font-normal text-zinc-500">PCU</span>
                </div>
                <div className="text-[9px] text-zinc-500 mt-0.5">
                  {app.data.count} veh ({app.data.queueMeters}m)
                </div>
              </div>
            );
          })}
        </div>

        {/* Webster Timing & Split Bar */}
        <div className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">ADAPTIVE GREEN:</span>
            <span className="font-bold text-emerald-400">{selectedJunction.dynamicGreenTime}s</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-zinc-500">FIXED PLAN:</span>
            <span className="font-bold text-zinc-400">{selectedJunction.fixedGreenTime}s</span>
          </div>
          <div className="text-cyan-400 font-bold text-[10px]">
            Δ -{Math.max(0, (selectedJunction.baselineWaitTimeSec - selectedJunction.averageWaitTimeSec).toFixed(1))}s
          </div>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ArrowRight,
  Layers,
  Crosshair,
  Sliders,
  Sparkles,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import PredictiveTrafficPanel from '../components/PredictiveTrafficPanel';

const API_BASE = 'http://localhost:5000/api/video';

const DEFAULT_REGION = [
  [0.01, 0.35],
  [0.85, 0.35],
  [0.98, 0.95],
  [0.01, 0.95]
];

const DEFAULT_LINE = {
  start: [0.02, 0.65],
  end: [0.85, 0.65],
  incomingDirection: 'positive'
};

const TrafficIntelligence = ({ onNavigate }) => {
  const { 
    startVideoDrivenSimulation, 
    stopVideoDrivenSimulation, 
    videoReplayActive, 
    videoReplayConfig,
    videoReplayStats,
    syncVideoReplayTime,
    state: simState,
    simulationSpeed,
    setSpeed,
    strategy,
    setStrategy
  } = useSimulation();

  // Video Selection
  const [selectedVideo, setSelectedVideo] = useState('bellevue_trial'); // 'bellevue_trial' or uploaded id
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Geometry configuration (normalized 0..1 coordinates)
  const [regionPoints, setRegionPoints] = useState(DEFAULT_REGION);
  const [lineConfig, setLineConfig] = useState(DEFAULT_LINE);
  const [mappedDirection, setMappedDirection] = useState('S');
  const [drawingMode, setDrawingMode] = useState('none'); // 'none' | 'region' | 'line'

  // Analysis job state
  const [analysisStatus, setAnalysisStatus] = useState('IDLE'); // IDLE | RUNNING | COMPLETED | FAILED | CANCELLED
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Video playback & overlay synchronization
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [videoDurationSec, setVideoDurationSec] = useState(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 1280, height: 720 });
  const [isReplayComplete, setIsReplayComplete] = useState(false);

  // Sync simulation speed to video playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = simulationSpeed;
    }
  }, [simulationSpeed]);

  // Load bundled video config on mount and auto-load pre-computed analysis
  useEffect(() => {
    fetch(`${API_BASE}/bundled`)
      .then(res => res.json())
      .then(data => {
        if (data.defaultConfig) {
          setRegionPoints(data.defaultConfig.region);
          setLineConfig(data.defaultConfig.line);
          setMappedDirection(data.defaultConfig.mappedDirection);

          // Auto-load pre-computed analysis for default bundled video
          fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              videoId: 'bellevue_trial',
              region: data.defaultConfig.region,
              line: data.defaultConfig.line,
              mappedDirection: data.defaultConfig.mappedDirection,
              sampleFps: 5
            })
          })
            .then(res => res.json())
            .then(analyzeData => {
              if (analyzeData.jobId) {
                setCurrentJobId(analyzeData.jobId);
                fetchAnalysisResults(analyzeData.jobId);
              }
            })
            .catch(err => console.warn('Auto analysis load notice:', err));
        }
      })
      .catch(err => console.warn('Could not fetch bundled video config:', err));
  }, []);

  // Handle local video upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);

    setIsUploading(true);
    setAnalysisError(null);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setUploadedVideoInfo(data);
      setSelectedVideo(data.videoId);
      setAnalysisResults(null);
      setAnalysisStatus('IDLE');
    } catch (err) {
      setAnalysisError(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Start analysis job
  const handleStartAnalysis = async () => {
    setAnalysisStatus('RUNNING');
    setAnalysisProgress(0);
    setAnalysisError(null);
    setAnalysisResults(null);

    try {
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: selectedVideo,
          region: regionPoints,
          line: lineConfig,
          mappedDirection,
          sampleFps: 5
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis start failed');

      setCurrentJobId(data.jobId);

      if (data.cached && data.jobId) {
        fetchAnalysisResults(data.jobId);
      }
    } catch (err) {
      setAnalysisStatus('FAILED');
      setAnalysisError(err.message);
    }
  };

  // Poll analysis job status
  useEffect(() => {
    if (analysisStatus !== 'RUNNING' || !currentJobId || currentJobId.startsWith('cached-')) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${currentJobId}`);
        const data = await res.json();

        if (data.status === 'RUNNING') {
          setAnalysisProgress(data.progress || 0);
        } else if (data.status === 'COMPLETED') {
          setAnalysisProgress(100);
          setAnalysisStatus('COMPLETED');
          clearInterval(interval);
          fetchAnalysisResults(currentJobId);
        } else if (data.status === 'FAILED') {
          setAnalysisStatus('FAILED');
          setAnalysisError(data.error || 'Analysis job failed');
          clearInterval(interval);
        }
      } catch (err) {
        console.warn('Status poll error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [analysisStatus, currentJobId]);

  // Fetch final job results
  const fetchAnalysisResults = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/results/${jobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch results');
      setAnalysisResults(data);
      setAnalysisStatus('COMPLETED');
    } catch (err) {
      setAnalysisStatus('FAILED');
      setAnalysisError(err.message);
    }
  };

  // Cancel running job
  const handleCancelAnalysis = async () => {
    if (!currentJobId) return;
    try {
      await fetch(`${API_BASE}/cancel/${currentJobId}`, { method: 'POST' });
      setAnalysisStatus('CANCELLED');
    } catch (err) {
      console.warn('Cancel error:', err);
    }
  };

  // Start connected video-driven simulation
  const handleStartSimulation = () => {
    if (!analysisResults || !analysisResults.arrivalEvents) return;

    startVideoDrivenSimulation({
      videoId: selectedVideo,
      arrivalEvents: analysisResults.arrivalEvents,
      mappedDirection,
      durationSec: analysisResults.videoMetadata?.durationSec || 160
    });

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStopSimulation = () => {
    stopVideoDrivenSimulation();
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Canvas drawing & video bounding box overlay
  const renderCanvasOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width = video.clientWidth || 800;
    const h = canvas.height = video.clientHeight || 450;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Region Polygon
    if (regionPoints && regionPoints.length > 0) {
      ctx.beginPath();
      regionPoints.forEach(([ptX, ptY], idx) => {
        const x = ptX * w;
        const y = ptY * h;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Region Vertices
      regionPoints.forEach(([ptX, ptY]) => {
        ctx.beginPath();
        ctx.arc(ptX * w, ptY * h, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // 2. Draw Counting Line & Direction Arrow
    if (lineConfig && lineConfig.start && lineConfig.end) {
      const lx1 = lineConfig.start[0] * w;
      const ly1 = lineConfig.start[1] * h;
      const lx2 = lineConfig.end[0] * w;
      const ly2 = lineConfig.end[1] * h;

      const curSec = video.currentTime;
      // Check if an arrival event is actively crossing the line (within 0.7s)
      const crossingEvent = (analysisResults?.arrivalEvents || []).find(
        e => Math.abs(e.videoTimeSec - curSec) < 0.7
      );

      ctx.beginPath();
      ctx.moveTo(lx1, ly1);
      ctx.lineTo(lx2, ly2);
      ctx.strokeStyle = crossingEvent ? '#10b981' : '#ef4444';
      ctx.lineWidth = crossingEvent ? 6 : 3;
      if (crossingEvent) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Line Endpoints
      [ [lx1, ly1], [lx2, ly2] ].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, crossingEvent ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = crossingEvent ? '#10b981' : '#dc2626';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Direction Arrow Midpoint
      const mx = (lx1 + lx2) / 2;
      const my = (ly1 + ly2) / 2;
      const dx = lx2 - lx1;
      const dy = ly2 - ly1;
      const normalX = -dy;
      const normalY = dx;
      const normLen = Math.sqrt(normalX * normalX + normalY * normalY) || 1;
      
      const arrowLen = 20;
      const sign = lineConfig.incomingDirection === 'positive' ? 1 : -1;
      const ax = mx + (normalX / normLen) * arrowLen * sign;
      const ay = my + (normalY / normLen) * arrowLen * sign;

      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(ax, ay);
      ctx.strokeStyle = crossingEvent ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // If active crossing event, draw energetic crossing badge
      if (crossingEvent) {
        const badgeText = `⚡ CROSSING: ${(crossingEvent.vehicleType || 'car').toUpperCase()} #${crossingEvent.trackId}`;
        ctx.font = 'bold 12px sans-serif';
        const tw = ctx.measureText(badgeText).width;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
        ctx.fillRect(mx - tw / 2 - 8, my - 26, tw + 16, 22);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, mx - tw / 2, my - 11);
      }
    }

    // 3. Draw Detections for Current Video Timestamp (if analyzed)
    if (analysisResults && analysisResults.frames) {
      const curSec = video.currentTime;
      // Find closest frame result
      const frameMatch = analysisResults.frames.find(f => Math.abs(f.videoTimeSec - curSec) < 0.25);
      
      if (frameMatch && frameMatch.detections) {
        frameMatch.detections.forEach(det => {
          const [bx1, by1, bx2, by2] = det.bbox;
          const rx = bx1 * w;
          const ry = by1 * h;
          const rw = (bx2 - bx1) * w;
          const rh = (by2 - by1) * h;

          ctx.strokeStyle = det.inRoi ? '#10b981' : '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(rx, ry, rw, rh);

          // Track label
          const trackLabel = (det.trackId !== null && det.trackId !== undefined) ? `#${det.trackId}` : 'untracked';
          const labelText = `${det.type} ${trackLabel}`;
          ctx.fillStyle = det.inRoi ? '#10b981' : '#64748b';
          ctx.fillRect(rx, ry - 18, Math.max(60, ctx.measureText(labelText).width + 10), 18);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(labelText, rx + 4, ry - 5);
        });
      }
    }
  }, [regionPoints, lineConfig, analysisResults]);


  // Video timeupdate loop
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTimeSec(cur);
      if (videoReplayActive && syncVideoReplayTime) {
        syncVideoReplayTime(cur);
      }
      renderCanvasOverlay();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDurationSec(videoRef.current.duration);
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
      renderCanvasOverlay();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsReplayComplete(true);
  };

  // Canvas click drawing handler
  const handleCanvasClick = (e) => {
    if (drawingMode === 'none') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = parseFloat(((e.clientX - rect.left) / rect.width).toFixed(4));
    const clickY = parseFloat(((e.clientY - rect.top) / rect.height).toFixed(4));

    if (drawingMode === 'region') {
      if (regionPoints.length >= 4) {
        setRegionPoints([[clickX, clickY]]);
      } else {
        setRegionPoints([...regionPoints, [clickX, clickY]]);
      }
    } else if (drawingMode === 'line') {
      if (!lineConfig.start || (lineConfig.start && lineConfig.end)) {
        setLineConfig({ ...lineConfig, start: [clickX, clickY], end: null });
      } else {
        setLineConfig({ ...lineConfig, end: [clickX, clickY] });
        setDrawingMode('none');
      }
    }
  };

  // Live Replay & Video Synchronization Metrics
  const allEvents = analysisResults?.arrivalEvents || [];
  const totalEventsCount = allEvents.length;
  // Events that have crossed the counting line up to current video playback time
  const pastEvents = allEvents.filter(e => e.videoTimeSec <= currentTimeSec);
  const liveEventsCount = pastEvents.length;
  const livePercent = totalEventsCount > 0 ? Math.round((liveEventsCount / totalEventsCount) * 100) : 0;

  const liveCountsByClass = {
    car: pastEvents.filter(e => (e.vehicleType || 'car') === 'car').length,
    bike: pastEvents.filter(e => e.vehicleType === 'bike').length,
    bus: pastEvents.filter(e => e.vehicleType === 'bus').length,
    truck: pastEvents.filter(e => e.vehicleType === 'truck').length,
  };

  const totalCountsByClass = analysisResults?.analysisStats?.countsByClass || {
    car: allEvents.filter(e => (e.vehicleType || 'car') === 'car').length,
    bike: allEvents.filter(e => e.vehicleType === 'bike').length,
    bus: allEvents.filter(e => e.vehicleType === 'bus').length,
    truck: allEvents.filter(e => e.vehicleType === 'truck').length,
  };

  // Recent vehicle crossing event (within the last 2.0s of playback)
  const recentCrossing = pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : null;
  const isCrossingJustNow = recentCrossing && Math.abs(currentTimeSec - recentCrossing.videoTimeSec) < 2.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles size={13} />
                Phase 2 Traffic Intelligence
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                YOLOv8 Computer Vision
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Recorded Video Vehicle Detection & Tracking
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Analyze incoming traffic footage, map one road approach (N, S, E, or W), and stream deduplicated arrival events into the active adaptive signal simulator.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate && onNavigate('live-intersection')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#07172E] hover:bg-[#0D2E5C] text-white flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Eye size={14} />
              <span>View Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Video Player & Overlay Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
            
            {/* Video Selector & Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Video size={15} /> Video Source:
                </span>
                <button
                  onClick={() => { setSelectedVideo('bellevue_trial'); setAnalysisResults(null); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedVideo === 'bellevue_trial'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Bellevue Trial Video (Default)
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="video/*"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {currentTimeSec.toFixed(1)}s / {videoDurationSec.toFixed(1)}s
                </span>
              </div>
            </div>

            {/* Video Container with Canvas Overlay */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video group shadow-inner border border-slate-800">
              <video
                ref={videoRef}
                src={`${API_BASE}/stream/${selectedVideo}`}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
              />
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`absolute inset-0 w-full h-full ${drawingMode !== 'none' ? 'cursor-crosshair' : 'cursor-default'}`}
              />

              {/* Replay Complete Alert */}
              {isReplayComplete && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white space-y-3 z-20">
                  <CheckCircle2 size={48} className="text-emerald-400" />
                  <h3 className="text-xl font-bold">Replay Complete</h3>
                  <p className="text-xs text-slate-300 max-w-sm text-center">
                    Recorded video arrival stream has finished. You can restart replay or switch back to simulated traffic.
                  </p>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                      setIsReplayComplete(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <RotateCcw size={14} />
                    <span>Restart Replay</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                        setIsPlaying(false);
                      } else {
                        videoRef.current.play();
                        setIsPlaying(true);
                      }
                    }
                  }}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                  title="Rewind to start"
                >
                  <RotateCcw size={18} />
                </button>

                <div className="flex items-center space-x-1.5 pl-2">
                  <span className="text-xs text-slate-500 font-medium">Speed:</span>
                  {[0.5, 1.0, 2.0].map(s => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        simulationSpeed === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawing Toolbar */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDrawingMode(drawingMode === 'region' ? 'none' : 'region')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    drawingMode === 'region'
                      ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Layers size={14} />
                  Edit Region ({regionPoints.length}/4)
                </button>

                <button
                  onClick={() => setDrawingMode(drawingMode === 'line' ? 'none' : 'line')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    drawingMode === 'line'
                      ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Crosshair size={14} />
                  Edit Counting Line
                </button>

                <button
                  onClick={() => {
                    setRegionPoints(DEFAULT_REGION);
                    setLineConfig(DEFAULT_LINE);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  title="Reset Region & Line Geometry"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Configuration & Analysis Controls */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Approach & Line Mapping Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders size={18} className="text-blue-600" />
              Approach Mapping
            </h3>

            {/* Road Direction Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Map Video Incoming Road To:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['N', 'S', 'E', 'W'].map(dir => (
                  <button
                    key={dir}
                    onClick={() => setMappedDirection(dir)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      mappedDirection === dir
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {dir} ({dir === 'N' ? 'North' : dir === 'S' ? 'South' : dir === 'E' ? 'East' : 'West'})
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Incoming crossings from the video will spawn as arrivals strictly on the {mappedDirection} approach of the simulator.
              </p>
            </div>

            {/* Counting Line Direction Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Counting Crossing Direction:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLineConfig({ ...lineConfig, incomingDirection: 'positive' })}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                    lineConfig.incomingDirection === 'positive'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Arrow Direction (Forward)
                </button>
                <button
                  onClick={() => setLineConfig({ ...lineConfig, incomingDirection: 'negative' })}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                    lineConfig.incomingDirection === 'negative'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Opposite Arrow (Reverse)
                </button>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Counts vehicles moving across the line in the direction of the perpendicular orange arrow.
              </p>
            </div>


            {/* Analysis Execution Control */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {analysisStatus === 'RUNNING' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Analyzing Video...</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={handleCancelAnalysis}
                    className="w-full py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all"
                  >
                    Cancel Analysis
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartAnalysis}
                  className="w-full py-3 rounded-2xl bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  Analyze Video (YOLO Tracking)
                </button>
              )}

              {/* Error Alert */}
              {analysisError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Analysis Error
                  </div>
                  <div className="text-[11px] leading-relaxed">{analysisError}</div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis & Live Replay Stream Panel */}
          {analysisResults && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-600" />
                    Detection & Arrival Stream
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {videoReplayActive ? `Streaming video arrivals into approach ${mappedDirection}` : isPlaying ? 'Playback active — tracking line crossings' : 'Ready to stream into simulation'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all flex-shrink-0 ${
                  videoReplayActive 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20' 
                    : isPlaying && liveEventsCount > 0
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {videoReplayActive ? <><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1" /> Live Injected</> : isPlaying ? '▶ Live Playback' : 'Offline Scan'}: {liveEventsCount} / {totalEventsCount}
                </span>
              </div>

              {/* Real-time Streaming Progress Bar */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    {videoReplayActive ? (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    ) : isPlaying ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    ) : (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    )}
                    <span>{liveEventsCount} of {totalEventsCount} Vehicles Crossed Line</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                    {livePercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-800 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${livePercent}%` }}
                  />
                </div>
              </div>

              {/* Class Breakdown Grid: Live Crossed / Total in Video */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between px-1">
                  <span>Vehicle Breakdown</span>
                  <span className="text-[10px] text-slate-400">Crossed / Total Detected</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {['car', 'bike', 'bus', 'truck'].map(cls => {
                    const liveCnt = liveCountsByClass[cls] || 0;
                    const totalCnt = totalCountsByClass[cls] || 0;
                    const hasActive = liveCnt > 0;
                    return (
                      <div 
                        key={cls} 
                        className={`p-2.5 rounded-xl border transition-all ${
                          hasActive ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{cls}</div>
                        <div className="flex items-baseline justify-center gap-1 mt-0.5">
                          <span className={`text-base font-extrabold ${hasActive ? 'text-emerald-700' : 'text-slate-800'}`}>
                            {liveCnt}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            / {totalCnt}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Crossing Alert / Recent Crossing Toast */}
              {recentCrossing ? (
                <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                  isCrossingJustNow 
                    ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 shadow-sm ring-2 ring-emerald-400/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className={isCrossingJustNow ? 'text-emerald-600 animate-bounce' : 'text-slate-400'} />
                    <span>
                      <strong>{(recentCrossing.vehicleType || 'car').toUpperCase()} #{recentCrossing.trackId}</strong> crossed at {recentCrossing.videoTimeSec.toFixed(1)}s
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                    → Approach {recentCrossing.mappedDirection || mappedDirection}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-xs flex items-center gap-2">
                  <Info size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="text-[11px]">As vehicles cross the counting line, arrivals stream in real-time to Approach {mappedDirection}.</span>
                </div>
              )}

              {/* Active Simulator Stream Status */}
              {videoReplayActive && (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs animate-in fade-in duration-300">
                  <div className="space-y-0.5">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Activity size={14} className="text-blue-600" />
                      Approach {mappedDirection} Active Queue: <span className="text-blue-700 font-black">{simState?.queues?.[mappedDirection] || 0}</span> vehicles
                    </div>
                    <div className="text-[11px] text-blue-700">
                      Adaptive signal controller optimizing green time for incoming stream
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('live-intersection')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm flex-shrink-0"
                  >
                    View Simulator <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Start Video Simulation Action Button */}
              <div className="pt-1">
                {videoReplayActive ? (
                  <button
                    onClick={handleStopSimulation}
                    className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Pause size={16} /> Stop Video Replay (Return to Random Traffic)
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={16} /> Start Video-Driven Simulation
                  </button>
                )}
              </div>

              {/* Offline Full Video Pre-Scan Details */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Offline YOLOv8 Pre-Scan Info</span>
                  <span className="text-slate-600 font-mono">{analysisResults.videoMetadata?.durationSec || 158.6}s duration</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono">
                  <div className="flex justify-between">
                    <span>Total Crossings Detected:</span>
                    <span className="font-bold text-slate-800">{totalEventsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Tracks:</span>
                    <span className="font-bold text-slate-800">{analysisResults.analysisStats?.totalUniqueTracks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing FPS:</span>
                    <span className="font-bold text-slate-800">{analysisResults.analysisStats?.fpsAchieved} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wall Time:</span>
                    <span className="font-bold text-slate-800">{analysisResults.analysisStats?.wallTimeSec}s</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Honest Presentation Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Info size={15} className="text-amber-600" /> Technical Scope Notice
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              This feature streams detected arrival events from a <strong>recorded traffic video</strong> into the simulated queue of approach <strong>{mappedDirection}</strong>. Other approach roads maintain simulated traffic schedules.
            </p>
          </div>

        </div>
      </div>

      {/* Predictive Traffic Intelligence Section */}
      <PredictiveTrafficPanel />
    </div>
  );
};

export default TrafficIntelligence;

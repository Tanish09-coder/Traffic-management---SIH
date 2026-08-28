import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Volume2, VolumeX } from 'lucide-react';

const SoundToggle = () => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('stms-sound-muted') === 'true';
  });
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const containerRef = useRef(null);
  
  // Create a forced re-render mechanism for the portal initialization
  const [, forceUpdate] = useState({});

  // Setup Portal DOM Node
  useEffect(() => {
    if (!containerRef.current) {
      const el = document.createElement('div');
      el.id = 'sound-toggle-portal-root';
      document.body.appendChild(el);
      containerRef.current = el;
      forceUpdate({}); // Force render to populate portal
    }
    
    return () => {
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(containerRef.current);
        containerRef.current = null;
      }
    };
  }, []);

  // Setup DOM Observer
  useEffect(() => {
    const checkEmergencyState = () => {
      const hasEmergencyClass = !!document.querySelector('.emergency-strobe-active');
      setIsEmergencyActive(hasEmergencyClass);
    };

    // Initial check
    checkEmergencyState();

    // Strategy 1: Mutation Observer
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      for (const mutation of mutations) {
        if (
          mutation.type === 'childList' || 
          (mutation.type === 'attributes' && mutation.attributeName === 'class')
        ) {
          shouldCheck = true;
          break;
        }
      }
      if (shouldCheck) {
        checkEmergencyState();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Strategy 2: Event Listener
    // Note: Other components can optionally dispatch this event:
    // window.dispatchEvent(new CustomEvent('emergency-override', { detail: { active: true } }))
    const handleEmergencyEvent = (e) => {
      if (e.detail && typeof e.detail.active === 'boolean') {
        setIsEmergencyActive(e.detail.active);
      }
    };
    window.addEventListener('emergency-override', handleEmergencyEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener('emergency-override', handleEmergencyEvent);
    };
  }, []);

  // Play/Stop Audio
  useEffect(() => {
    const playSiren = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        if (oscillatorRef.current) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.value = 0.05; // Gentle volume
        
        let startTime = ctx.currentTime;
        let isHighPitch = true;
        
        // Classic high-low siren modulation
        const modulatePitch = () => {
          if (!oscillatorRef.current) return;
          const now = ctx.currentTime;
          if (now - startTime > 0.6) {
            startTime = now;
            isHighPitch = !isHighPitch;
            osc.frequency.setValueAtTime(isHighPitch ? 850 : 650, ctx.currentTime);
          }
          animationFrameRef.current = requestAnimationFrame(modulatePitch);
        };

        osc.frequency.setValueAtTime(850, ctx.currentTime);
        osc.start();
        
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        
        modulatePitch();
      } catch (err) {
        // Fail silently if browser blocks autoplay before user interaction
      }
    };

    const stopSiren = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {}
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        try {
          gainNodeRef.current.disconnect();
        } catch (e) {}
        gainNodeRef.current = null;
      }
    };

    if (isMuted || !isEmergencyActive) {
      stopSiren();
    } else {
      playSiren();
    }

    return () => {
      stopSiren();
    };
  }, [isMuted, isEmergencyActive]);

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('stms-sound-muted', String(newState));
  };

  if (!containerRef.current) return null;

  const isPlaying = !isMuted && isEmergencyActive;

  const toggleUI = (
    <>
      <style>
        {`
          @keyframes sound-pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
            50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          }
          .animate-sound-pulse {
            animation: sound-pulse-glow 1.5s infinite;
          }
        `}
      </style>
      <div 
        className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none"
      >
        <button
          onClick={handleToggleMute}
          className={`pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
            isPlaying 
              ? 'bg-red-500 text-white animate-sound-pulse hover:bg-red-600' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
          title={isMuted ? "Unmute Emergency Siren" : "Mute Emergency Siren"}
        >
          {isMuted ? (
            <VolumeX size={20} className="opacity-70" />
          ) : (
            <Volume2 size={20} className={isPlaying ? "animate-pulse" : ""} />
          )}
        </button>
      </div>
    </>
  );

  return ReactDOM.createPortal(isEmergencyActive ? toggleUI : null, containerRef.current);
};

// Helper for teammates if they want to mount it dynamically outside React tree
export const mountSoundToggle = () => {
  if (document.getElementById('stms-sound-toggle-standalone')) return;
  const rootEl = document.createElement('div');
  rootEl.id = 'stms-sound-toggle-standalone';
  document.body.appendChild(rootEl);
  
  // Note: Using dynamic import of react-dom/client for React 18+ compatibility
  // to avoid issues if other team members use traditional render or createRoot
  import('react-dom/client').then(({ createRoot }) => {
    createRoot(rootEl).render(<SoundToggle />);
  }).catch(() => {
    // Fallback for React 17
    import('react-dom').then((ReactDOM) => {
      ReactDOM.render(<SoundToggle />, rootEl);
    });
  });
};

export default SoundToggle;

import React, { useState, useEffect, useRef } from 'react';

const SoundToggle = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Setup DOM Observer
  useEffect(() => {
    const checkEmergencyState = () => {
      const hasEmergencyClass = !!document.querySelector('.emergency-strobe-active');
      setIsEmergencyActive(hasEmergencyClass);
    };

    checkEmergencyState();

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

    if (!isEmergencyActive) {
      stopSiren();
    } else {
      playSiren();
    }

    return () => {
      stopSiren();
    };
  }, [isEmergencyActive]);

  // Headless component - returns nothing visually
  return null;
};

export default SoundToggle;

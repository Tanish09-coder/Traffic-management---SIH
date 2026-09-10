import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

/**
 * SoundToggle Component
 * Plays the official emergency vehicle siren sound (from YouTube short tIbrjdFrYmU)
 * whenever an emergency vehicle arrives or Emergency Mode is turned on.
 */
export const SoundToggle = () => {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('stms-sound-muted') === 'true';
  });
  const [customOverride, setCustomOverride] = useState(false);
  const audioRef = useRef(null);

  const { state } = useSimulation();
  const isEmergencyActive = Boolean(state?.emergencyActive || customOverride);

  // Initialize audio element with downloaded siren audio
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.55;

    // Detect browser codec preference
    const canPlayWebm = audio.canPlayType('audio/webm; codecs="opus"') !== '';
    audio.src = canPlayWebm ? '/sounds/ambulance_siren.webm' : '/sounds/ambulance_siren.m4a';

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  // Unlock browser audio context / element on any user gesture
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && isEmergencyActive && !isMuted && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [isEmergencyActive, isMuted]);

  // Listen for custom emergency-override events
  useEffect(() => {
    const handleEmergencyEvent = (e) => {
      if (e.detail && typeof e.detail.active === 'boolean') {
        setCustomOverride(e.detail.active);
      }
    };
    window.addEventListener('emergency-override', handleEmergencyEvent);
    return () => {
      window.removeEventListener('emergency-override', handleEmergencyEvent);
    };
  }, []);

  // Play / Pause based on emergency active state and mute setting
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isEmergencyActive && !isMuted) {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback waiting for user interaction:', err.message);
        });
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isEmergencyActive, isMuted]);

  const handleToggleMute = (e) => {
    e.stopPropagation();
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem('stms-sound-muted', String(newState));

    if (audioRef.current) {
      if (!newState && isEmergencyActive) {
        audioRef.current.play().catch(() => {});
      } else if (newState) {
        audioRef.current.pause();
      }
    }
  };

  const isPlaying = !isMuted && isEmergencyActive;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none select-none">
      {/* Floating Sound Toggle Button */}
      <button
        onClick={handleToggleMute}
        className={`pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer ${
          isPlaying
            ? 'bg-red-600 text-white ring-4 ring-red-300 scale-105 hover:bg-red-700'
            : isMuted
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:scale-105'
        }`}
        title={
          isMuted
            ? 'Emergency Siren is Muted (Click to Unmute)'
            : isPlaying
            ? 'Siren is Playing (Click to Mute)'
            : 'Emergency Siren is Armed (Click to Mute)'
        }
      >
        {isMuted ? (
          <VolumeX size={18} className="opacity-80 text-gray-500" />
        ) : (
          <Volume2 size={18} className={isPlaying ? 'animate-bounce text-white' : 'text-slate-700'} />
        )}
      </button>
    </div>
  );
};

export default SoundToggle;

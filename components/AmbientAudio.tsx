"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initAudio = () => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // start muted
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // 3. White noise generator (Water Waves)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400; // Deep, muffled ocean

    const waveLfo = ctx.createOscillator();
    waveLfo.type = 'sine';
    waveLfo.frequency.value = 0.03; // Much slower, gentle wave cycle
    const waveLfoGain = ctx.createGain();
    waveLfoGain.gain.value = 200; // Softer swell
    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(noiseFilter.frequency);

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.03; // Quieter overall

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    // Start everything
    whiteNoise.start();
    waveLfo.start();
  };

  const togglePlay = () => {
    if (!audioContextRef.current) {
      initAudio();
    }
    
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gain = gainNodeRef.current!;
    const now = ctx.currentTime;
    
    if (isPlaying) {
      // Fade out
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 2); // 2 second fade out

      setTimeout(() => {
        if (audioContextRef.current?.state === 'running') {
            audioContextRef.current.suspend();
        }
      }, 2000);
    } else {
      // Fade in
      if (ctx.state === 'suspended') ctx.resume();
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(1, now + 3); // 3 second slow fade in
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed top-28 right-4 md:top-28 md:right-12 lg:right-[7vw] z-[10000]">
      <button 
        onClick={togglePlay}
        className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-[#0a141e]/50 px-5 py-3 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30"
      >
        <div className="flex h-3 items-end gap-[3px]">
          <motion.div 
            animate={{ height: isPlaying ? ["20%", "100%", "20%"] : "20%" }} 
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.5, ease: "easeInOut" }} 
            className="w-[2px] rounded-full bg-[#b8ccca]" 
          />
          <motion.div 
            animate={{ height: isPlaying ? ["20%", "80%", "20%"] : "20%" }} 
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.8, ease: "easeInOut", delay: 0.2 }} 
            className="w-[2px] rounded-full bg-[#b8ccca]" 
          />
          <motion.div 
            animate={{ height: isPlaying ? ["20%", "60%", "20%"] : "20%" }} 
            transition={{ repeat: isPlaying ? Infinity : 0, duration: 1.2, ease: "easeInOut", delay: 0.4 }} 
            className="w-[2px] rounded-full bg-[#b8ccca]" 
          />
        </div>
        <span className="text-[11px] uppercase tracking-[.25em] text-[#b8ccca] transition-colors group-hover:text-white">
          {isPlaying ? 'Sound On' : 'Sound Off'}
        </span>
      </button>
    </div>
  );
}

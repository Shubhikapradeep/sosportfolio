"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Project } from "./Hero";

type ProjectSignalProps = {
  project: Project;
  isFocused: boolean;
  onClick: () => void;
};

export default function ProjectSignal({ project, isFocused, onClick }: ProjectSignalProps) {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    setIsMobile(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const scaleValue = isMobile ? 1 : (isFocused ? 1 : 0.75);
  const opacityValue = isMobile ? 1 : (isFocused ? 1 : 0.25);
  const blurValue = isMobile ? "blur(0px)" : (isFocused ? "blur(0px)" : "blur(4px)");

  return (
    <motion.button
      onClick={onClick}
      aria-label={`View ${project.title} case study`}
      animate={{ 
        scale: scaleValue, 
        opacity: opacityValue,
        filter: blurValue
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isFocused && !isMobile ? { scale: 1.02, y: -4 } : undefined}
      className={`group relative w-[90vw] max-w-[500px] text-left transition-shadow duration-700 ${isFocused || isMobile ? 'shadow-[0_0_60px_rgba(182,208,207,0.1)] z-10' : 'z-0'}`}
    >
      <motion.div
        animate={isMobile ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 8 + project.delay, repeat: Infinity, ease: "easeInOut", delay: project.delay }}
        className={`w-full h-full rounded-[32px] border bg-[#141e28]/45 p-8 md:p-12 text-ink backdrop-blur-xl transition duration-700 ${isFocused || isMobile ? 'border-white/20 shadow-[0_20px_60px_rgba(0,12,20,.6)]' : 'border-white/[.05] shadow-[0_20px_50px_rgba(0,12,20,.3)]'}`}
      >
        <p className={`mb-4 text-[11px] tracking-[.3em] transition-colors duration-500 ${isFocused || isMobile ? 'text-[#b8ccca]' : 'text-[#b8ccca]/60'}`}>
          {project.index} / SIGNAL
        </p>
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-[.02em] text-[#f4f7f6]">
          {project.title}
        </h2>
        <p className={`mt-5 text-[15px] md:text-[16px] font-light leading-[1.8] line-clamp-4 whitespace-pre-line transition-colors duration-500 ${isFocused || isMobile ? 'text-[#dce7e5]/90' : 'text-[#dce7e5]/60'}`}>
          {project.description}
        </p>
        <p className={`mt-8 text-[11px] uppercase tracking-[.25em] transition-all duration-500 ${isFocused || isMobile ? 'text-[#b8ccca] group-hover:text-[#ffffff] group-hover:drop-shadow-md' : 'text-transparent'}`}>
          view case <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </p>
      </motion.div>
    </motion.button>
  );
}

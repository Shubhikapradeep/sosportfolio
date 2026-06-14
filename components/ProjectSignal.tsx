"use client";

import { motion } from "framer-motion";
import type { Project } from "./Hero";

type ProjectSignalProps = {
  project: Project;
  isFocused: boolean;
  onClick: () => void;
};

export default function ProjectSignal({ project, isFocused, onClick }: ProjectSignalProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={`View ${project.title} case study`}
      animate={{ 
        scale: isFocused ? 1 : 0.75, 
        opacity: isFocused ? 1 : 0.25,
        filter: isFocused ? "blur(0px)" : "blur(4px)"
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isFocused ? { scale: 1.02, y: -4 } : undefined}
      className={`group relative w-[85vw] max-w-[500px] text-left transition-shadow duration-700 ${isFocused ? 'shadow-[0_0_60px_rgba(182,208,207,0.1)] z-10' : 'z-0'}`}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 8 + project.delay, repeat: Infinity, ease: "easeInOut", delay: project.delay }}
        className={`w-full h-full rounded-[32px] border bg-[#141e28]/45 p-8 md:p-12 text-ink backdrop-blur-xl transition duration-700 ${isFocused ? 'border-white/20 shadow-[0_20px_60px_rgba(0,12,20,.6)]' : 'border-white/[.05] shadow-[0_20px_50px_rgba(0,12,20,.3)]'}`}
      >
        <p className={`mb-4 text-[11px] tracking-[.3em] transition-colors duration-500 ${isFocused ? 'text-[#b8ccca]' : 'text-[#b8ccca]/60'}`}>
          {project.index} / SIGNAL
        </p>
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-[.02em] text-[#f4f7f6]">
          {project.title}
        </h2>
        <p className={`mt-5 text-[15px] md:text-[16px] font-light leading-[1.8] line-clamp-4 whitespace-pre-line transition-colors duration-500 ${isFocused ? 'text-[#dce7e5]/90' : 'text-[#dce7e5]/60'}`}>
          {project.description}
        </p>
        <p className={`mt-8 text-[11px] uppercase tracking-[.25em] transition-all duration-500 ${isFocused ? 'text-[#b8ccca] group-hover:text-[#ffffff] group-hover:drop-shadow-md' : 'text-transparent'}`}>
          view case <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </p>
      </motion.div>
    </motion.button>
  );
}

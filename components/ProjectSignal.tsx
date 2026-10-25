"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { projectKindLabel, type Project } from "./data";
import ProjectActions from "./ProjectActions";

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

  const isActive = isFocused || isMobile;

  return (
    <motion.article
      aria-labelledby={`project-${project.slug}-title`}
      animate={{
        scale: scaleValue,
        opacity: opacityValue,
        filter: blurValue
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isFocused && !isMobile ? { scale: 1.02, y: -4 } : undefined}
      className={`relative h-full w-[90vw] max-w-[500px] rounded-[32px] transition-shadow duration-700 ${isActive ? 'shadow-[0_0_60px_rgba(182,208,207,0.1)] z-10' : 'z-0'}`}
    >
      <motion.div
        animate={isMobile ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 8 + project.delay, repeat: Infinity, ease: "easeInOut", delay: project.delay }}
        className={`relative flex h-full w-full flex-col rounded-[32px] border bg-[#141e28]/45 p-8 md:p-12 text-ink backdrop-blur-xl transition duration-700 ${isActive ? 'border-white/20 shadow-[0_20px_60px_rgba(0,12,20,.6)]' : 'border-white/[.05] shadow-[0_20px_50px_rgba(0,12,20,.3)]'}`}
      >
        <p className={`mb-4 text-[11px] tracking-[.3em] transition-colors duration-500 ${isActive ? 'text-[#b8ccca]' : 'text-[#b8ccca]/60'}`}>
          {project.index} / SIGNAL
          {project.status === "in-development" && <span className="text-[#e6d3a8]/80"> · IN DEVELOPMENT</span>}
        </p>
        <p className="-mt-2 mb-4 text-[10px] uppercase tracking-[.22em] text-[#e6d3a8]/75">{projectKindLabel[project.kind]}</p>
        <h2 id={`project-${project.slug}-title`} className="font-serif text-[26px] md:text-[30px] tracking-[.02em] text-[#f4f7f6]">
          {project.title}
        </h2>
        <p className={`mt-5 text-[15px] md:text-[16px] font-light leading-[1.8] line-clamp-6 whitespace-pre-line transition-colors duration-500 ${isActive ? 'text-[#dce7e5]/90' : 'text-[#dce7e5]/60'}`}>
          {project.description}
        </p>
        <ul aria-label="Technologies" className={`mt-5 flex flex-wrap gap-2 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          {project.techStack.map((tech) => (
            <li key={tech} className="rounded-full border border-[#b5cbca]/20 bg-[#173846]/30 px-3 py-1 text-[11px] text-[#ccd9d7]/80">{tech}</li>
          ))}
        </ul>
        {/* The ::after overlay keeps the whole card clickable, as before; the actions below sit above it. */}
        <button
          type="button"
          onClick={onClick}
          aria-label={`View ${project.title} case study`}
          className={`group mt-8 self-start text-left text-[11px] uppercase tracking-[.25em] transition-all duration-500 after:absolute after:inset-0 after:rounded-[32px] after:content-[''] ${isActive ? 'text-[#b8ccca] hover:text-[#ffffff] hover:drop-shadow-md' : 'text-transparent'}`}
        >
          view case <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
        <div className="relative z-10 mt-auto pt-8">
          <ProjectActions project={project} className="border-t border-white/10 pt-6" />
        </div>
      </motion.div>
    </motion.article>
  );
}

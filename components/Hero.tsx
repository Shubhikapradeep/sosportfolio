"use client";

import { useState, useRef, useEffect, UIEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Background from "./Background";
import ProjectSignal from "./ProjectSignal";

import { projects, domains, thoughtsData, type Project, type Domain, type ThoughtArticle } from "./data";
export type { Project, Domain, ThoughtArticle };

export default function Hero() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeThought, setActiveThought] = useState<ThoughtArticle | null>(null);
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;
    
    let minDistance = Infinity;
    let closestIndex = 0;
    
    Array.from(container.children).forEach((child) => {
      const htmlChild = child as HTMLElement;
      if (!htmlChild.classList.contains('project-card')) return;
      
      const childCenter = htmlChild.offsetLeft + htmlChild.clientWidth / 2;
      const distance = Math.abs(scrollCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = parseInt(htmlChild.dataset.index || "0", 10);
      }
    });
    
    if (closestIndex !== focusedIndex) {
      setFocusedIndex(closestIndex);
    }
  };

  return (
    <main className="relative bg-deep text-ink">
      <Background />

      <section className="relative flex min-h-[100svh] flex-col px-5 py-5 sm:px-8 md:px-12 md:py-8 lg:px-[7vw] overflow-hidden">
        <header className="relative z-20 flex items-center justify-between text-[9px] uppercase tracking-[.34em] text-[#c1d1d0]/70">
          <p>Ocean signals</p>
          <p>Portfolio / 2026</p>
        </header>

        <div className="relative flex flex-1 flex-col md:flex-row md:items-center mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 1.35, ease: "easeOut" }}
            className="relative z-30 max-w-[650px] pt-8 md:pt-0"
          >
            <p className="mb-5 text-[10px] uppercase tracking-[.42em] text-[#bfd1cf]/70">
              signals from somewhere deep.
            </p>
            <h1 className="font-serif text-[clamp(4.5rem,15vw,10rem)] font-medium leading-[.9] tracking-[-.05em] text-[#f4f7f6] drop-shadow-md">
              hi, i’m
              <span className="block italic text-white drop-shadow-lg">Shubhika Pradeep.</span>
            </h1>
            <p className="mt-8 max-w-[480px] text-[18px] font-light leading-7 tracking-[.15em] text-[#dce7e5] opacity-90 md:ml-2 md:text-[19px]">
              building things that think, and
              <br className="hidden md:block" />
              {" "}sometimes feel a little human.
            </p>
          </motion.div>

          <motion.img
            src="/character.png"
            alt="me"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -10, 0], rotate: [-0.3, 0.3, -0.3] }}
            style={{ filter: "drop-shadow(0px 20px 40px rgba(2,11,16,0.6)) brightness(0.92) contrast(1.05)" }}
            className="pointer-events-none relative z-10 -ml-8 mt-4 w-[115%] max-w-[600px] object-contain md:absolute md:bottom-[-10px] md:right-[5%] md:mt-0 md:ml-0 md:w-[740px] lg:right-[10%] lg:w-[860px]"
            transition={{
              opacity: { duration: 2.2, ease: "easeOut" },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        </div>

        <footer className="relative z-40 flex items-end justify-between text-[9px] uppercase tracking-[.24em] text-[#bdcccb]/60">
          <p className="max-w-[150px] leading-5">scroll slowly<br />stay awhile</p>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#b5cbca]/40" />
            <span>01 / 05</span>
          </div>
        </footer>
      </section>

      <section className="relative z-20 min-h-screen overflow-hidden bg-[#061c27]/25 px-5 py-24 backdrop-blur-[2px] sm:px-8 md:px-12 lg:px-[7vw]">
        <SectionHeading index="02" eyebrow="selected transmissions" title="projects." />
        
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="mt-20 flex w-full gap-8 md:gap-16 snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-12 pt-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="w-[5vw] shrink-0 md:w-[calc(50vw-250px)]" />
          {projects.map((project, i) => (
            <div 
              key={project.index} 
              data-index={i}
              className="project-card shrink-0 snap-center"
            >
              <ProjectSignal 
                project={project} 
                isFocused={focusedIndex === i}
                onClick={() => {
                  if (focusedIndex === i) {
                    setActiveProject(project);
                  } else {
                    // Clicked unfocused card - scroll it into view
                    const container = scrollContainerRef.current;
                    if (container) {
                      const card = container.querySelector(`[data-index="${i}"]`) as HTMLElement;
                      if (card) {
                        container.scrollTo({
                          left: card.offsetLeft - container.clientWidth / 2 + card.clientWidth / 2,
                          behavior: "smooth"
                        });
                      }
                    }
                  }
                }} 
              />
            </div>
          ))}
          <div className="w-[5vw] shrink-0 md:w-[calc(50vw-250px)]" />
        </div>
        
        <AnimatePresence>
          {activeProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-[#020b10]/80 backdrop-blur-md"
              onClick={() => setActiveProject(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#b5cbca]/20 bg-[#061c27] p-8 md:p-12 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setActiveProject(null)}
                  className="absolute right-6 top-6 text-[#b8ccca]/60 transition-colors hover:text-white"
                >
                  ✕
                </button>
                <p className="text-[10px] tracking-[.3em] text-[#b8ccca]/55">{activeProject.index} / PROJECT OVERVIEW</p>
                <h3 className="mt-4 font-serif text-4xl text-[#dce7e5] md:text-5xl">{activeProject.title}</h3>
                <p className="mt-6 text-sm font-light leading-7 tracking-[.1em] text-[#ccd9d7]/80 md:text-base whitespace-pre-line">
                  {activeProject.description}
                </p>
                
                <div className="mt-10 grid gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[.25em] text-[#b8ccca]/50 mb-3">Tech Stack</h4>
                    <ul className="flex flex-wrap gap-2">
                      {activeProject.techStack.map(tech => (
                        <li key={tech} className="rounded-full border border-[#b5cbca]/20 bg-[#173846]/30 px-3 py-1 text-[11px] text-[#ccd9d7]/70">{tech}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[.25em] text-[#b8ccca]/50 mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {activeProject.features.map(feat => (
                        <li key={feat} className="text-xs text-[#ccd9d7]/70">• {feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12 flex items-center gap-6 border-t border-[#b5cbca]/10 pt-8">
                  <a href={activeProject.demo} className="group flex items-center gap-2 text-[11px] uppercase tracking-[.2em] text-[#e0e8e6] transition-colors hover:text-white">
                    Live Demo <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                  <a href={activeProject.github} className="text-[11px] uppercase tracking-[.2em] text-[#b8ccca]/60 transition-colors hover:text-[#e0e8e6]">
                    GitHub
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="relative z-20 flex min-h-screen flex-col justify-center bg-[#051822]/30 px-5 py-24 backdrop-blur-[2px] sm:px-8 md:px-12 lg:px-[7vw]">
        <SectionHeading index="03" eyebrow="drifting signals" title="things i think about." />
        
        {/* Mobile Fallback */}
        <div className="mt-16 flex flex-col items-center gap-8 md:hidden">
          {domains.map((domain, i) => (
            <DomainSignal 
              key={domain.id} 
              domain={domain} 
              isAnchor={i === 0} 
              onClick={() => setActiveDomain(domain)} 
              delay={i * 1.5} 
              yOffset={0}
              onMouseEnter={() => setHoveredDomain(domain.id)}
              onMouseLeave={() => setHoveredDomain(null)}
              isFaded={hoveredDomain !== null && hoveredDomain !== domain.id}
            />
          ))}
        </div>

        {/* Desktop Mindmap */}
        <div className="relative hidden md:block mt-24 w-full max-w-5xl h-[550px] mx-auto">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
            {/* Center is 50,50. Nodes are at their left/top percentages. */}
            <path 
              d="M 50 50 Q 40 30 25 25" 
              className={`fill-none transition-all duration-700 ${hoveredDomain === 'human' ? 'stroke-[#e0e8e6] stroke-[4px] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'stroke-white/20 stroke-[2px]'}`}
              vectorEffect="non-scaling-stroke"
            />
            <path 
              d="M 50 50 Q 60 30 75 20" 
              className={`fill-none transition-all duration-700 ${hoveredDomain === 'systems' ? 'stroke-[#e0e8e6] stroke-[4px] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'stroke-white/20 stroke-[2px]'}`}
              vectorEffect="non-scaling-stroke"
            />
            <path 
              d="M 50 50 Q 40 60 20 75" 
              className={`fill-none transition-all duration-700 ${hoveredDomain === 'product' ? 'stroke-[#e0e8e6] stroke-[4px] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'stroke-white/20 stroke-[2px]'}`}
              vectorEffect="non-scaling-stroke"
            />
            <path 
              d="M 50 50 Q 60 65 85 70" 
              className={`fill-none transition-all duration-700 ${hoveredDomain === 'research' ? 'stroke-[#e0e8e6] stroke-[4px] drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'stroke-white/20 stroke-[2px]'}`}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* AI (Center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <DomainSignal 
              domain={domains[0]} 
              isAnchor 
              onClick={() => setActiveDomain(domains[0])} 
              delay={0} yOffset={0} 
              onMouseEnter={() => setHoveredDomain(domains[0].id)}
              onMouseLeave={() => setHoveredDomain(null)}
              isFaded={hoveredDomain !== null && hoveredDomain !== domains[0].id}
            />
          </div>

          {/* Human (Top Left) */}
          <div className="absolute left-[25%] top-[25%] -translate-x-1/2 -translate-y-1/2 z-10">
            <DomainSignal 
              domain={domains[1]} 
              onClick={() => setActiveDomain(domains[1])} 
              delay={1.5} yOffset={0}
              onMouseEnter={() => setHoveredDomain(domains[1].id)}
              onMouseLeave={() => setHoveredDomain(null)}
              isFaded={hoveredDomain !== null && hoveredDomain !== domains[1].id && hoveredDomain !== domains[0].id}
            />
          </div>

          {/* Systems (Top Right) */}
          <div className="absolute left-[75%] top-[20%] -translate-x-1/2 -translate-y-1/2 z-10">
            <DomainSignal 
              domain={domains[2]} 
              onClick={() => setActiveDomain(domains[2])} 
              delay={2.8} yOffset={0}
              onMouseEnter={() => setHoveredDomain(domains[2].id)}
              onMouseLeave={() => setHoveredDomain(null)}
              isFaded={hoveredDomain !== null && hoveredDomain !== domains[2].id && hoveredDomain !== domains[0].id}
            />
          </div>

          {/* Product (Bottom Left) */}
          <div className="absolute left-[20%] top-[75%] -translate-x-1/2 -translate-y-1/2 z-10">
            <DomainSignal 
              domain={domains[3]} 
              onClick={() => setActiveDomain(domains[3])} 
              delay={4.1} yOffset={0}
              onMouseEnter={() => setHoveredDomain(domains[3].id)}
              onMouseLeave={() => setHoveredDomain(null)}
              isFaded={hoveredDomain !== null && hoveredDomain !== domains[3].id && hoveredDomain !== domains[0].id}
            />
          </div>

          {/* Research (Bottom Right) */}
          <div className="absolute left-[85%] top-[70%] -translate-x-1/2 -translate-y-1/2 z-10">
            <DomainSignal 
              domain={domains[4]} 
              onClick={() => setActiveDomain(domains[4])} 
              delay={5.5} yOffset={0}
              onMouseEnter={() => setHoveredDomain(domains[4].id)}
              onMouseLeave={() => setHoveredDomain(null)}
              isFaded={hoveredDomain !== null && hoveredDomain !== domains[4].id && hoveredDomain !== domains[0].id}
            />
          </div>
        </div>

        <AnimatePresence>
          {activeDomain && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-[#020b10]/80 backdrop-blur-md"
              onClick={() => setActiveDomain(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#b5cbca]/20 bg-[#061c27] p-8 md:p-12 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setActiveDomain(null)}
                  className="absolute right-6 top-6 text-[#b8ccca]/60 transition-colors hover:text-white"
                >
                  ✕
                </button>
                <p className="text-[10px] tracking-[.3em] text-[#b8ccca]/55">DEEP DIVE</p>
                <h3 className="mt-4 font-serif text-3xl text-[#dce7e5] md:text-4xl">{activeDomain.title}</h3>
                <p className="mt-6 text-sm font-light leading-relaxed tracking-[.05em] text-[#ccd9d7]/80">
                  {activeDomain.description}
                </p>
                
                <div className="mt-10 border-t border-[#b5cbca]/10 pt-8">
                  <h4 className="text-[10px] uppercase tracking-[.25em] text-[#b8ccca]/50 mb-4">Related Work</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeDomain.related.map(rel => (
                      <span key={rel} className="rounded-full bg-[#173846]/40 px-3 py-1.5 text-[11px] tracking-wide text-[#ccd9d7]/80">{rel}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="relative z-20 flex min-h-screen items-center bg-[#031721]/40 px-5 py-24 backdrop-blur-[3px] sm:px-8 md:px-12 lg:px-[7vw]">
        <div className="w-full">
          <SectionHeading index="04" eyebrow="drifting through time" title="experience." />
          <div className="mt-16 ml-auto max-w-2xl rounded-3xl border border-white/5 bg-[#0a141e]/50 p-8 backdrop-blur-md md:mt-24 md:p-12">
            <TimelineItem year="2026" title="Intern — PESU Research Foundation" detail="navigating real-world engineering." expandedDetail="worked on core systems and learned what it takes to ship resilient code at scale." />
            <TimelineItem year="2024" title="Research — QuaNAD Lab" detail="exploring what ML models actually understand." expandedDetail="worked on classifying topological phases and found that models rely more on patterns than true physical understanding." />
            <TimelineItem year="2023" title="Teaching Lead — Stanford Code in Place" detail="teaching people how to think, not just code." expandedDetail="mentored global students and contributed to automated feedback systems." />
            <TimelineItem year="2022" title="AI Intern — Mental Wellness Centre" detail="putting AI into real human environments." expandedDetail="built chatbots and workflows that had to function in actual healthcare settings." />
          </div>
        </div>
      </section>

      <section className="relative z-20 flex min-h-screen items-center bg-[#02131c]/58 px-5 py-24 backdrop-blur-[5px] sm:px-8 md:px-12 lg:px-[7vw]">
        <div className="w-full">
          <SectionHeading index="05" eyebrow="notes from below" title="thoughts." />
          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-3">
            {thoughtsData.map(t => (
              <Thought key={t.id} thought={t} onClick={() => setActiveThought(t)} />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {activeThought && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010a0f]/80 p-4 backdrop-blur-xl"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="relative max-h-[85vh] w-full max-w-[640px] overflow-y-auto rounded-3xl border border-white/10 bg-[#0a141e]/90 p-8 shadow-2xl md:p-14 hide-scrollbar"
              >
                <button
                  onClick={() => setActiveThought(null)}
                  className="absolute right-6 top-6 text-3xl font-light text-[#b8ccca]/60 transition-colors hover:text-white"
                >
                  ×
                </button>
                <p className="text-[11px] tracking-[.3em] text-[#b8ccca]/55">{activeThought.date} / NOTE</p>
                <h3 className="mt-8 font-serif text-[32px] md:text-[42px] text-[#dce7e5] leading-[1.1]">{activeThought.title}</h3>
                <div className="mt-10 text-[15px] font-light leading-relaxed tracking-wide text-[#ccd9d7]/90 md:text-[17px] whitespace-pre-line">
                  {activeThought.content}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="relative z-20 flex min-h-screen items-center bg-[#010e15]/72 px-5 py-24 backdrop-blur-[7px] sm:px-8 md:px-12 lg:px-[7vw]">
        <div className="w-full">
          <SectionHeading index="06" eyebrow="send a signal" title="contact." />
          <div className="mt-16 flex flex-col gap-6 md:mt-24 md:grid md:grid-cols-2 md:gap-8">
            <a href="mailto:pradeepshubhika@gmail.com" className="group inline-flex flex-col">
              <span className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6]">Email</span>
              <span className="mt-2 font-serif text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-[#dce7e5] transition-colors duration-500 group-hover:text-[#ffffff]">pradeepshubhika@gmail.com</span>
            </a>
            {showPhone ? (
              <a href="tel:+919818270173" className="group inline-flex flex-col">
                <span className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6]">Phone</span>
                <span className="mt-2 font-serif text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-[#dce7e5] transition-colors duration-500 group-hover:text-[#ffffff]">+91 9818270173</span>
              </a>
            ) : (
              <button onClick={() => setShowPhone(true)} className="group inline-flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6]">Phone</span>
                <span className="mt-2 font-serif text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-[#dce7e5] transition-colors duration-500 group-hover:text-[#ffffff]">click to reveal</span>
              </button>
            )}
            <a href="https://www.linkedin.com/in/shubhika-pradeep/" target="_blank" rel="noopener noreferrer" className="group inline-flex flex-col">
              <span className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6]">LinkedIn</span>
              <span className="mt-2 font-serif text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-[#dce7e5] transition-colors duration-500 group-hover:text-[#ffffff]">linkedin/shubhika-pradeep</span>
            </a>
            <a href="https://github.com/Shubhikapradeep" target="_blank" rel="noopener noreferrer" className="group inline-flex flex-col">
              <span className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6]">GitHub</span>
              <span className="mt-2 font-serif text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-[#dce7e5] transition-colors duration-500 group-hover:text-[#ffffff]">github/Shubhikapradeep</span>
            </a>
            <div className="group inline-flex flex-col">
              <span className="text-[10px] uppercase tracking-[.3em] text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6]">Discord</span>
              <span className="mt-2 font-serif text-[clamp(1.5rem,4vw,3.5rem)] leading-none text-[#dce7e5] transition-colors duration-500 group-hover:text-[#ffffff]">schrodingers_lover</span>
            </div>
          </div>
          <div className="mt-16 md:mt-24">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[11px] uppercase tracking-[.3em] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md transition-all duration-500 hover:border-white/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105"
            >
              <span>Download Resume</span>
              <span className="transition-transform duration-300 group-hover:translate-y-[2px]">↓</span>
            </a>
          </div>
          <p className="mt-12 text-[10px] uppercase tracking-[.34em] text-[#bfd1cf]/55">
            if something here resonated, we should probably talk.
          </p>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <p className="text-[10px] uppercase tracking-[.42em] text-[#bfd1cf]/60">
        {index} / {eyebrow}
      </p>
      <h2 className="mt-4 font-serif text-[clamp(4rem,9vw,8rem)] leading-[.8] tracking-[-.07em] text-[#dce7e5]">
        {title}
      </h2>
    </motion.div>
  );
}

function TimelineItem({ year, title, detail, expandedDetail }: { year: string; title: string; detail: string; expandedDetail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="mb-16 md:mb-14 cursor-pointer group last:mb-0"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center gap-4">
        <p className="text-[12px] md:text-[11px] tracking-[.25em] text-[#b8ccca]/40 transition-colors group-hover:text-[#e0e8e6]/70">{year}</p>
        <span className="text-[#b8ccca]/40 transition-transform duration-300" style={{ transform: isOpen ? "rotate(45deg)" : "none" }}>+</span>
      </div>
      <h3 className="mt-3 max-w-full md:max-w-[500px] font-serif text-[32px] leading-[1.2] tracking-[.02em] text-white/95 drop-shadow-sm transition-colors group-hover:text-white md:text-[42px]">{title}</h3>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="mt-5 max-w-full md:max-w-[500px] text-[18px] font-light leading-relaxed tracking-wide text-[#f4f7f6]/95 md:text-[20px]">{detail}</p>
            <p className="mt-4 max-w-full md:max-w-[500px] text-[16px] font-light leading-relaxed tracking-wide text-[#f4f7f6]/80 md:text-[18px]">{expandedDetail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Thought({ thought, onClick }: { thought: ThoughtArticle; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="group rounded-2xl md:rounded-xl border border-[#b5cbca]/10 md:border-0 md:border-t md:border-[#b5cbca]/20 px-6 py-8 md:px-4 md:py-6 text-left transition-all duration-500 hover:border-[#b5cbca]/40 hover:bg-white/[0.03] bg-[#0a141e]/30 md:bg-transparent"
    >
      <p className="text-[11px] md:text-[10px] tracking-[.28em] text-[#b8ccca]/60 md:text-[#b8ccca]/50 transition-colors group-hover:text-[#b8ccca]/80">{thought.date} / NOTE</p>
      <h3 className="mt-6 font-serif text-[28px] leading-[1.1] text-[#dce7e5] transition-colors group-hover:text-white md:text-4xl">{thought.title}</h3>
      <p className="mt-6 md:mt-4 text-[11px] md:text-[10px] uppercase tracking-[.24em] text-[#b8ccca]/80 md:text-[#b8ccca]/60 transition-colors group-hover:text-[#e0e8e6] md:group-hover:underline underline-offset-4">read note →</p>
    </motion.button>
  );
}

function DomainSignal({ 
  domain, 
  isAnchor = false, 
  onClick, 
  delay, 
  yOffset,
  onMouseEnter,
  onMouseLeave,
  isFaded 
}: { 
  domain: Domain; 
  isAnchor?: boolean; 
  onClick: () => void; 
  delay: number; 
  yOffset: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isFaded: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      animate={{ 
        y: [yOffset, yOffset - 10, yOffset],
      }}
      transition={{ duration: 6 + (delay % 3), repeat: Infinity, ease: "easeInOut", delay: delay * 0.5 }}
      whileHover={{ scale: 1.05 }}
      className={`group relative flex flex-col items-center justify-center transition-all duration-700 ${isFaded ? 'opacity-30' : 'opacity-100'} ${isAnchor ? 'px-4 py-6 md:px-6 md:py-6' : 'px-4 py-4'}`}
    >
      <span className={`font-serif tracking-wide transition-all duration-500 text-center max-w-[80vw] md:max-w-none md:whitespace-nowrap group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] ${isAnchor ? 'text-[#dce7e5] text-[32px] leading-[1.1] md:text-5xl drop-shadow-md' : 'text-[#ccd9d7]/80 text-[22px] leading-[1.2] md:text-2xl drop-shadow-sm'}`}>
        {domain.title}
      </span>
      {domain.subtitle && (
        <span className="md:absolute md:-bottom-4 mt-2 md:mt-0 opacity-80 md:opacity-0 transition-all duration-500 group-hover:opacity-100 text-[11px] tracking-[.15em] text-[#b8ccca]/80 text-center max-w-[70vw] md:whitespace-nowrap font-light uppercase">
          {domain.subtitle}
        </span>
      )}
    </motion.button>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import Background from "@/components/Background";
import ProjectActions from "@/components/ProjectActions";
import { hasLocalDemo, projects } from "@/components/data";
import { chip, eyebrow, panel } from "@/components/demos/ui";
import ChatbotDemo from "@/components/demos/ChatbotDemo";
import MapeerDemo from "@/components/demos/MapeerDemo";
import FocusDemo from "@/components/demos/FocusDemo";
import ForecastDemo from "@/components/demos/ForecastDemo";

// What each demo is, and what it is not. Shown on the page so nothing is mistaken for the production system.
type DemoInfo = {
  Demo: ComponentType;
  summary: string;
  disclosure: string;
  // For projects still in development: what this prototype genuinely does vs. what the real project still needs.
  prototype?: { works: string[]; notYet: string[] };
};

const DEMOS: Record<string, DemoInfo> = {
  "mental-health-chatbot": {
    Demo: ChatbotDemo,
    summary: "Talk to a small companion that reads the tone of each message, runs a safety check before replying, and remembers context from earlier in the conversation.",
    disclosure:
      "This project is still in development. The demo is a rule-based browser prototype — it does not use an LLM or any backend, nothing you type is sent or stored, and it is not a substitute for professional support.",
    prototype: {
      works: [
        "Tone tagging from a fixed list of emotion words, including simple negation (“not good”)",
        "A safety check that matches risk phrases and replaces the reply with crisis resources",
        "Session memory of your name and seven topic categories, which you can view and clear",
        "Replies assembled from templates that reflect tone, remembered topics and repeated low mood",
      ],
      notYet: [
        "A language model or trained classifier — replies are templates, not generated",
        "A backend, accounts or saved conversations — everything resets on reload",
        "A clinically reviewed safety process or hand-off to a human",
      ],
    },
  },
  mapeer: {
    Demo: MapeerDemo,
    summary: "Plan a trip, get commute options ranked by your priorities, and watch the recommendations adapt to the choices you make while tracking the CO₂ you save.",
    disclosure:
      "A browser simulation of the commute-ranking idea, not the Mapeer app from the repository (a Leaflet/OpenStreetMap mapping platform built for a hackathon, per its README). Travel times and emissions are estimates from average speeds and typical per-passenger emission factors — there is no live map, routing or traffic data here. Your choices stay in this tab.",
  },
  addfocus: {
    Demo: FocusDemo,
    summary: "Unload your tasks, check in with your energy, and let a calm focus state show you one thing at a time — with a load meter that tells you when to step back.",
    disclosure:
      "This project is still in development. The demo is a browser prototype: cognitive load is a simple heuristic from what you enter (tasks, effort, energy, time focused), there are no sensors, it is not a clinical tool, and everything stays in this tab.",
    prototype: {
      works: [
        "Task capture with effort levels, validation and a 12-task cap",
        "A load score from open effort, self-reported energy and minutes focused",
        "A next-task rule: lightest first when load is high or energy is low, hardest first otherwise",
        "A focus state that hides everything but one task, with a pausable timer and suggested length",
      ],
      notYet: [
        "Saving tasks or sessions — everything resets on reload",
        "Accounts, sync across devices, or reminders outside this page",
        "Any validated measure of cognitive load — the score is self-reported and heuristic",
      ],
    },
  },
  "stock-prediction": {
    Demo: ForecastDemo,
    summary: "Generate or paste a price series, compare simple forecasting models on a walk-forward backtest, and see which patterns actually hold up.",
    disclosure:
      "This demo is separate from the repository. The linked S&P 500 analysis is an R study of how financial fundamentals relate to price across 379 companies; it is not a time-series forecaster. Here the data are synthetic unless you paste your own, and the models are small classical baselines running in the browser. An illustration, not financial advice.",
  },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter(hasLocalDemo).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.status === "in-development" ? "Prototype" : "Interactive Demo"} | Shubhika Pradeep`,
    description: DEMOS[slug]?.summary,
  };
}

export default async function ProjectDemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const demo = DEMOS[slug];
  if (!project || !hasLocalDemo(project) || !demo) notFound();
  const { Demo } = demo;
  const isPrototype = project.status === "in-development";

  return (
    <main className="relative min-h-screen bg-deep text-ink">
      <Background />

      <div className="relative z-20 px-5 py-5 sm:px-8 md:px-12 md:py-8 lg:px-[7vw]">
        <header className="flex items-center justify-between text-[9px] uppercase tracking-[.34em] text-[#c1d1d0]/70">
          <Link href="/#projects" className="inline-flex min-h-[44px] items-center gap-2 transition-colors duration-500 hover:text-white">
            <span aria-hidden="true">←</span> back to projects
          </Link>
          <p className="hidden sm:block">Shubhika Pradeep / {isPrototype ? "Prototype" : "Interactive Demo"}</p>
        </header>

        <div className="mt-16 max-w-4xl md:mt-24">
          <p className="text-[10px] uppercase tracking-[.42em] text-[#bfd1cf]/70">
            {project.index} / {isPrototype ? <span className="text-[#e6d3a8]/80">prototype · in development</span> : "interactive demo"}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[.9] tracking-[-.04em] text-[#f4f7f6]">
            {project.title}
          </h1>
          <p className="mt-8 max-w-2xl text-[17px] font-light leading-8 tracking-[.04em] text-[#dce7e5]/90 md:text-[18px]">{demo.summary}</p>
          <ul aria-label={isPrototype ? "Planned technologies" : "Technologies"} className="mt-6 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <li key={tech} className={chip}>{tech}</li>
            ))}
          </ul>
        </div>

        <aside aria-label="About this demo" className="mt-10 max-w-3xl border-l border-[#e6d3a8]/40 pl-5">
          <p className={eyebrow}>about this demo</p>
          <p className="mt-2 text-[14px] font-light leading-relaxed text-[#dce7e5]/80">{demo.disclosure}</p>
        </aside>

        {demo.prototype && (
          <section aria-labelledby="prototype-status" className="mt-10 grid max-w-4xl gap-8 md:grid-cols-2">
            <h2 id="prototype-status" className="sr-only">Prototype status</h2>
            <div>
              <h3 className={eyebrow}>works in this prototype</h3>
              <ul className="mt-3 space-y-2 text-[14px] font-light leading-relaxed text-[#dce7e5]/85">
                {demo.prototype.works.map((item) => <li key={item}>— {item}</li>)}
              </ul>
            </div>
            <div>
              <h3 className={eyebrow}>not built yet</h3>
              <ul className="mt-3 space-y-2 text-[14px] font-light leading-relaxed text-[#b8ccca]/75">
                {demo.prototype.notYet.map((item) => <li key={item}>— {item}</li>)}
              </ul>
            </div>
          </section>
        )}

        <section aria-label={`${project.title} interactive demo`} className="mt-12 md:mt-16">
          <Demo />
        </section>

        <section aria-labelledby="original-project" className={`${panel} mt-12 md:mt-16`}>
          <h2 id="original-project" className={eyebrow}>{isPrototype ? "about the project" : "the project"}</h2>
          <p className="mt-4 whitespace-pre-line text-[15px] font-light leading-relaxed text-[#dce7e5]/85">{project.description}</p>
          <ProjectActions project={project} showDemo={false} className="mt-6" />
        </section>

        <footer className="mt-16 flex items-center justify-between pb-8 text-[9px] uppercase tracking-[.24em] text-[#bdcccb]/60">
          <Link href="/#projects" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">← all projects</Link>
          <Link href="/#contact" className="inline-flex min-h-[44px] items-center transition-colors hover:text-white">get in touch →</Link>
        </footer>
      </div>
    </main>
  );
}

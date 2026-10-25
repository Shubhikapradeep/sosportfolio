export type Project = {
  index: string;
  title: string;
  delay: number;
  description: string;
  techStack: string[];
  features: string[];
  // Stable id; local demos live at /projects/[slug].
  slug: string;
  // Where the Live Demo button goes: the in-browser demo route, or an externally deployed site.
  demo: { type: "local" } | { type: "external"; url: string };
  // Public repository URL. The GitHub action is only shown when this is set.
  repository?: string;
  // Projects whose real implementation hasn't been built yet; their demos are prototypes.
  status?: "in-development";
  // What the project is, so cards never imply more than exists: a rule-based prototype, a browser simulation, a demo built on synthetic data, or a deployed site.
  kind: ProjectKind;
};

export type ProjectKind = "prototype" | "simulation" | "synthetic-demo" | "live-site";

export const projectKindLabel: Record<ProjectKind, string> = {
  prototype: "Local prototype",
  simulation: "Browser simulation",
  "synthetic-demo": "Synthetic-data demo",
  "live-site": "Live site",
};

export const hasLocalDemo = (project: Project) => project.demo.type === "local";

export const projectDemoHref = (project: Project) =>
  project.demo.type === "external" ? project.demo.url : `/projects/${project.slug}`;

export const projects: Project[] = [
  { index: "01", title: "Mental Health AI Chatbot", slug: "mental-health-chatbot", demo: { type: "local" }, status: "in-development", kind: "prototype", delay: 0.1, description: "“trying to make AI feel a little more human”\n\nexploring tone-aware, safety-checked conversation design. The interactive demo is a rule-based browser prototype: no language model, no backend, not a clinical tool.", techStack: ["TypeScript", "React", "Rule-based NLP (prototype)"], features: ["Keyword tone tagging", "Risk-phrase safety check", "In-session memory"] },
  { index: "02", title: "Mapeer", slug: "mapeer", demo: { type: "local" }, kind: "simulation", repository: "https://github.com/Shubhikapradeep/mapeer", delay: 0.2, description: "“making sustainable choices easier, not harder”\n\na sustainable-mobility mapping platform from a hackathon (per the repository README), built around green route planning. The demo here is a separate browser simulation of the commute-ranking idea, with estimated speeds and emissions and no live map, routing or traffic data.", techStack: ["HTML", "CSS", "JavaScript", "Leaflet.js"], features: ["Eco-friendly route planning", "CO₂ savings estimates", "Priority-based ranking (demo)"] },
  { index: "03", title: "ADDfocus", slug: "addfocus", demo: { type: "local" }, status: "in-development", kind: "prototype", delay: 0.3, description: "“designing for brains that don’t follow ‘normal’ productivity rules”\n\na cognition-aware focus tool, still in development. The demo is a browser prototype with a heuristic, self-reported load score, not a validated cognitive measure.", techStack: ["Next.js", "Framer Motion", "TypeScript"], features: ["Task capture", "Heuristic load meter", "One-task focus state"] },
  { index: "04", title: "S&P 500 Stock Analysis", slug: "stock-prediction", demo: { type: "local" }, kind: "synthetic-demo", repository: "https://github.com/Shubhikapradeep/sp500-stock-analysis", delay: 0.4, description: "“seeing how far patterns can actually take you”\n\nthe repository analyses which financial fundamentals predict price across 379 S&P 500 companies, using regression, log-log modelling and neural networks in R. The demo here is a different, illustrative thing: a time-series backtest on synthetic data with simple baselines.", techStack: ["R", "Regression", "Neural networks", "Time-series demo (TypeScript)"], features: ["Fundamentals vs price (repo)", "Model RMSE comparison (repo)", "Synthetic walk-forward demo"] },
  // Details from the repository README (team project; Shubhika is listed as main website developer).
  { index: "05", title: "Kamido", slug: "kamido", demo: { type: "external", url: "https://shubhikapradeep.github.io/kamido/" }, kind: "live-site", repository: "https://github.com/Shubhikapradeep/kamido", delay: 0.5, description: "“origami made simple”\n\nbuilt the main website for a team origami tutorial site — step-by-step guides with embedded videos for five models.", techStack: ["HTML", "CSS", "JavaScript"], features: ["Step-by-step tutorials", "Embedded video guides", "Responsive layout"] },
];

export type Domain = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  // Real work this interest connects to. Items with an href link to it; items without are plain labels.
  related: { label: string; href?: string }[];
};

export const domains: Domain[] = [
  { id: "ai", title: "what do models actually learn?", subtitle: "generalization, failure analysis, interpretability", description: "Whether a model has captured real structure or just the statistics of its training data. My QuNAD research tests this on topological invariants, where the right answer can be computed.", related: [{ label: "QuNAD case study", href: "/research/qunad" }, { label: "S&P 500 analysis", href: "https://github.com/Shubhikapradeep/sp500-stock-analysis" }] },
  { id: "human", title: "human-centered everything", subtitle: "interfaces, accessibility, mental models", description: "Designing tools that respect human attention, and being honest about what a prototype can and cannot do.", related: [{ label: "Mental Health Chatbot (prototype)", href: "/projects/mental-health-chatbot" }, { label: "ADDfocus (prototype)", href: "/projects/addfocus" }] },
  { id: "systems", title: "systems, from logic to experience", subtitle: "DSA, low-level thinking, architecture", description: "Translating complex ideas into software that holds up, from the underlying logic to what a person actually experiences.", related: [] },
  { id: "product", title: "products that feel intentional", subtitle: "web dev, UX, real-world usability", description: "Crafting clear, tactile web experiences with modern frameworks and restrained, meaningful motion.", related: [{ label: "Kamido", href: "https://shubhikapradeep.github.io/kamido/" }, { label: "Mapeer", href: "/projects/mapeer" }] },
  { id: "research", title: "curiosity-driven exploration", subtitle: "research, experiments, learning", description: "Reading, prototyping and testing ideas. The next question in my research: do disorder and non-Hermitian effects separate learning an invariant from exploiting patterns? This is a proposed direction, not a finished result.", related: [{ label: "QuNAD: next questions", href: "/research/qunad#next" }] },
];

export type ThoughtArticle = {
  id: string;
  title: string;
  date: string;
  content: string;
};

export const thoughtsData: ThoughtArticle[] = [
  {
    id: "dead-software",
    title: "why most software feels dead",
    date: "08.12",
    content: "We spend most of our waking hours staring at glowing rectangles, yet the interfaces we interact with often feel entirely devoid of life. They are transactional, sterile, and hyper-optimized for metrics rather than human connection.\n\nI think about this constantly. When did we decide that \"professional\" meant removing all friction, and consequently, all texture? The best tools I've used don't just solve a problem—they have a specific weight to them. They breathe. They respond to inputs with subtle kinetic energy.\n\nAdding life to software isn't about slapping on unnecessary animations. It's about designing systems that acknowledge the human on the other side of the glass. It's the difference between a fluorescent office light and a warm desk lamp. We need more desk lamps."
  },
  {
    id: "machine-intelligence",
    title: "the illusion of machine intelligence",
    date: "05.04",
    content: "It's easy to look at the output of a large language model and feel a sense of awe. The syntax is perfect, the logic flows, and the tone is whatever you asked it to be. But working closely with these systems reveals the sleight of hand.\n\nThey don't \"know\" anything in the way we do. They map probabilistic relationships across vast latent spaces. When a model generates a beautiful paragraph, it isn't having a thought; it's completing a highly complex statistical puzzle.\n\nUnderstanding this doesn't make the technology less impressive, but it changes how we should build with it. If we treat AI as an infallible oracle, we build fragile systems. But if we treat it as a powerful, sometimes hallucinatory reasoning engine, we can design interfaces that catch its falls and amplify its strengths."
  },
  {
    id: "building-for-you",
    title: "building things you actually want to use",
    date: "02.18",
    content: "There's a specific kind of burnout that comes from building things you don't actually care about. For a long time, I found myself optimizing for the hypothetical \"user persona\"—a statistical aggregate of behaviors and pain points.\n\nThe shift happened when I started building things strictly because I wanted them to exist. The standards change when you are your own primary user. You notice the tiny, imperceptible latencies. You care deeply about the typography. You refuse to ship something that feels cheap.\n\nThe irony is that by designing for an audience of one, you often end up creating something that resonates far more deeply with others. Authenticity scales better than market research."
  }
];

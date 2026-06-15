export type Project = {
  index: string;
  title: string;
  delay: number;
  description: string;
  techStack: string[];
  features: string[];
  github: string;
  demo: string;
};

export const projects: Project[] = [
  { index: "01", title: "Mental Health AI Chatbot", delay: 0.1, description: "“trying to make AI feel a little more human”\n\nbuilt conversational systems with tone awareness, safety checks, and real-world mental health use cases.", techStack: ["Python", "LLMs", "React"], features: ["Tone awareness", "Safety checks", "Contextual memory"], github: "#", demo: "#" },
  { index: "02", title: "Mapeer", delay: 0.2, description: "“making sustainable choices easier, not harder”\n\nused machine learning to recommend eco-friendly commute options based on user behavior.", techStack: ["TensorFlow", "React", "Node.js"], features: ["Behavioral modeling", "Real-time routing", "Carbon tracking"], github: "#", demo: "#" },
  { index: "03", title: "ADDfocus", delay: 0.3, description: "“designing for brains that don’t follow ‘normal’ productivity rules”\n\nbuilt a cognition-aware system to reduce overload and improve focus.", techStack: ["Next.js", "Framer Motion", "TypeScript"], features: ["Cognitive load tracking", "Minimalist UI", "Focus states"], github: "#", demo: "#" },
  { index: "04", title: "Stock Prediction System", delay: 0.4, description: "“seeing how far patterns can actually take you”\n\nexperimented with neural networks and time-series models on market data.", techStack: ["PyTorch", "Pandas", "Python"], features: ["Time-series forecasting", "Data visualization", "Pattern recognition"], github: "#", demo: "#" },
];

export type Domain = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  related: string[];
};

export const domains: Domain[] = [
  { id: "ai", title: "building intelligent systems", subtitle: "the core engine", description: "Exploring the boundary between human intent and machine execution, crafting systems that augment rather than replace.", related: ["Quiet Machines", "Neural Atlas"] },
  { id: "human", title: "human-centered everything", subtitle: "interfaces, accessibility, mental models", description: "Designing tools that respect human attention and operate quietly in the background of our lives.", related: ["Echo Archive", "Liminal OS"] },
  { id: "systems", title: "systems, from logic to experience", subtitle: "DSA, low-level thinking, architecture", description: "Building robust architectures from the ground up, translating complex ideas into highly performant living systems.", related: ["Neural Atlas", "Custom Renderers"] },
  { id: "product", title: "products that feel intentional", subtitle: "web dev, UX, real-world usability", description: "Crafting beautiful, tactile digital experiences using modern frameworks and subtle, meaningful motion.", related: ["Liminal OS", "Portfolio"] },
  { id: "research", title: "curiosity-driven exploration", subtitle: "research, experiments, learning", description: "Constantly learning, reading, and prototyping weird ideas that might one day become something real.", related: ["Echo Archive", "Open Source"] },
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

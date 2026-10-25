import Link from "next/link";
import { projectDemoHref, type Project } from "./data";

const pill =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-[10px] uppercase tracking-[.25em] backdrop-blur-md transition-colors duration-500";
const demoPill = `${pill} group/demo border-white/25 bg-white/[.06] text-[#e0e8e6] hover:border-white/50 hover:bg-white/[.12] hover:text-white`;

// Live Demo + GitHub actions, shared by the project cards, the project dialog and the demo pages.
export default function ProjectActions({
  project,
  className = "",
  showDemo = true,
}: {
  project: Project;
  className?: string;
  showDemo?: boolean;
}) {
  const external = project.demo.type === "external";
  const demoLabel = `${external ? "Live site of" : "Interactive demo of"} ${project.title}${project.status === "in-development" ? " (prototype)" : ""}`;

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {showDemo &&
        (project.demo.type === "external" ? (
          <a
            href={projectDemoHref(project)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${demoLabel} (opens the deployed site in a new tab)`}
            className={demoPill}
          >
            Live Site <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <Link href={projectDemoHref(project)} aria-label={demoLabel} className={demoPill}>
            Try Demo <span aria-hidden="true" className="transition-transform duration-300 group-hover/demo:translate-x-1">→</span>
          </Link>
        ))}
      {project.repository ? (
        <a
          href={project.repository}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`GitHub repository for ${project.title} (opens in a new tab)`}
          className={`${pill} border-white/10 bg-transparent text-[#b8ccca]/80 hover:border-white/30 hover:text-[#e0e8e6]`}
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <span className="px-1 text-[10px] uppercase tracking-[.25em] text-[#b8ccca]/50">
          {project.status === "in-development" ? "In development · no repo yet" : "No public repo"}
        </span>
      )}
    </div>
  );
}

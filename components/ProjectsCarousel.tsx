import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

export default function ProjectsCarousel({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Projects</h2>
          <span className="text-xs text-muted">Swipe left-right ➔</span>
        </div>

        {projects.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-line bg-card p-8 text-sm text-muted">
            Projects are on the way. Check back soon.
          </p>
        ) : (
          <div
            className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-scroll scroll-pl-6 px-6 pb-6 pt-2"
            tabIndex={0}
            aria-label="Projects carousel"
          >
            {projects.map((project) => (
              <div key={project.id} className="w-[82%] shrink-0 snap-start sm:w-[360px]">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

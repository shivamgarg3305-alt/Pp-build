"use client";

import { useMemo, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/types";

const FILTERS = ["All", "Android Apps", "AI Tools", "Web Apps"] as const;
type Filter = (typeof FILTERS)[number];

const EMPTY: Record<Filter, string> = {
  All: "No projects yet. Check back soon.",
  "Android Apps": "No Android apps yet. Check back soon.",
  "AI Tools": "No AI tools yet. Check back soon.",
  "Web Apps": "No web apps yet. Check back soon.",
};

export default function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter]
  );

  return (
    <>
      <div
        className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-2"
        role="group"
        aria-label="Filter projects by category"
      >
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f)}
              className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-black"
                  : "border border-line bg-chip text-muted hover:text-fg"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-line bg-card p-8 text-muted">{EMPTY[filter]}</p>
      ) : (
        <div className="mt-10 flex flex-col gap-6">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} variant="large" />
          ))}
        </div>
      )}
    </>
  );
}

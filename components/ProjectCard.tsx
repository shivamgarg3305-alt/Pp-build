import { Bot, Download, ExternalLink, Globe, Package, Smartphone } from "lucide-react";
import type { Project } from "@/lib/types";
import { isApk, safeUrl } from "@/lib/utils";

function CategoryIcon({ category, className }: { category: Project["category"]; className?: string }) {
  switch (category) {
    case "Android Apps":
      return <Smartphone className={className} aria-hidden="true" />;
    case "AI Tools":
      return <Bot className={className} aria-hidden="true" />;
    case "Web Apps":
      return <Globe className={className} aria-hidden="true" />;
    default:
      return <Package className={className} aria-hidden="true" />;
  }
}

export default function ProjectCard({
  project,
  variant = "carousel",
}: {
  project: Project;
  variant?: "carousel" | "large";
}) {
  const large = variant === "large";
  const download = safeUrl(project.download_url);
  const website = safeUrl(project.website_url);
  const image = safeUrl(project.image_url);
  const tags = project.tech_stack ?? [];

  const base =
    "flex h-full flex-col rounded-3xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-glow motion-reduce:transform-none";

  return (
    <article className={`${base} ${large ? "p-6 sm:p-8" : "p-5"}`}>
      <div className="flex items-start gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-chip text-fg ${
            large ? "h-20 w-20" : "h-14 w-14"
          }`}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover grayscale" loading="lazy" />
          ) : (
            <CategoryIcon category={project.category} className={large ? "h-9 w-9" : "h-6 w-6"} />
          )}
        </div>
        <div className="min-w-0">
          {project.category && (
            <span className="inline-block rounded-full border border-line bg-chip px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-muted">
              {project.category}
            </span>
          )}
          <h3
            className={`mt-2 break-words font-semibold leading-tight text-fg ${
              large ? "text-3xl" : "text-xl"
            }`}
          >
            {project.title}
          </h3>
        </div>
      </div>

      {project.description && (
        <p
          className={`mt-4 text-muted ${
            large ? "text-base leading-relaxed" : "line-clamp-4 text-sm leading-relaxed"
          }`}
        >
          {project.description}
        </p>
      )}

      {tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
          {tags.map((tag) => (
            <li
              key={tag}
              className="rounded-lg border border-line bg-chip px-2.5 py-1 text-xs text-fg/80"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {(download || website) && (
        <div className={`mt-auto flex flex-wrap gap-3 ${large ? "pt-8" : "pt-6"}`}>
          {download && (
            <a
              href={download}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {isApk(download) ? "Download APK" : "Download File"}
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line bg-chip px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-white/50"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Visit Website
            </a>
          )}
        </div>
      )}
    </article>
  );
}

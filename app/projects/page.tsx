import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import ProjectsExplorer from "@/components/ProjectsExplorer";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects | P BUILDS",
  description: "Apps and tools I have built. Download them or try them live.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-[#0A0A0A]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-chip px-4 py-2 text-xs font-medium text-fg transition-colors hover:border-white/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <Link href="/" aria-label="P BUILDS home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-14 sm:pt-20">
        <h1 className="text-6xl font-semibold tracking-tight sm:text-8xl">Projects</h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          Apps and tools I have built. Download them or try them live.
        </p>
        <div className="mt-10">
          <ProjectsExplorer projects={projects} />
        </div>
      </main>

      <Footer />
    </>
  );
}

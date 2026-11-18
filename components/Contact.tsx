import { Github, Mail } from "lucide-react";
import { EMAIL, GITHUB_URL } from "@/lib/constants";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-16 pb-24 pt-10 sm:pb-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
          <p className="mt-2 text-sm text-muted">Have an idea or a project in mind? Say hello.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`mailto:${EMAIL}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-line bg-chip px-4 py-3 text-sm text-fg transition-colors hover:border-white/50"
            >
              <Mail className="h-4 w-4 shrink-0 text-fg" aria-hidden="true" />
              <span className="min-w-0 truncate">{EMAIL}</span>
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

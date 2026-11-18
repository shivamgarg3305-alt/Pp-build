import { Github, Mail } from "lucide-react";
import { EMAIL, GITHUB_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-xs text-muted">© 2026 P Builds. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted transition-colors hover:text-fg"
          >
            <Github className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={`mailto:${EMAIL}`}
            aria-label="Email"
            className="text-muted transition-colors hover:text-fg"
          >
            <Mail className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}

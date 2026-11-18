"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const linkClass =
  "text-[10px] sm:text-xs uppercase tracking-widest text-muted transition-colors hover:text-fg";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-line bg-[#0A0A0A]/70 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link href="/" aria-label="P BUILDS home">
          <Logo />
        </Link>
        <div className="flex items-center gap-3 sm:gap-8">
          <a href="#about" className={linkClass}>
            About
          </a>
          <Link href="/projects" className={linkClass}>
            Projects
          </Link>
          <a href="#contact" className={linkClass}>
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}

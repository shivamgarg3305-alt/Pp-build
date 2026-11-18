import Link from "next/link";
import VoxelCharacter from "@/components/VoxelCharacter";

export default function Hero() {
  return (
    <section
      className="min-h-screen w-full relative overflow-hidden bg-[#0A0A0A] flex flex-col justify-between p-6 z-10"
      style={{ minHeight: "100svh" }}
    >
      {/* Soft white glow behind the character */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 72%, rgba(255,255,255,0.12), rgba(255,255,255,0.04) 45%, transparent 72%)",
        }}
      />

      {/* Huge title behind the character */}
      <h1
        className="pointer-events-none absolute left-1/2 top-[30%] z-0 -translate-x-1/2 -translate-y-[45%] select-none whitespace-nowrap font-display text-[15vw] leading-none tracking-tight text-[#F5F5F5] opacity-95 sm:top-1/2"
      >
        P BUILDS
      </h1>

      {/* Character, in front of the title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
        <VoxelCharacter className="h-[56vh] sm:h-[66vh] lg:h-[72vh]" />
      </div>

      <div className="h-14" aria-hidden="true" />

      <div className="relative z-20 flex items-end justify-between gap-4">
        <Link
          href="/projects"
          className="text-xs font-medium uppercase tracking-widest text-white transition-colors hover:text-neutral-400"
        >
          Explore Projects →
        </Link>
        <a
          href="#contact"
          className="rounded-full bg-gradient-to-r from-white to-neutral-500 p-[1.5px] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
        >
          <span className="block rounded-full bg-[#0A0A0A] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-fg">
            Contact Me
          </span>
        </a>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center">
        <a
          href="#projects"
          aria-label="Scroll to projects"
          className="pointer-events-auto animate-bounce text-xl text-muted hover:text-fg motion-reduce:animate-none"
        >
          ↓
        </a>
      </div>
    </section>
  );
}

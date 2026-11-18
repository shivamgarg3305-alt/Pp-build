"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { PointerState } from "@/lib/characterSpec";

// three.js is client-only and loaded lazily so it never blocks first paint.
const Character3D = dynamic(() => import("@/components/Character3D"), { ssr: false });

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function VoxelCharacter({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<PointerState>({ x: 0, y: 0 });

  const [webgl, setWebgl] = useState<"checking" | "yes" | "no">("checking");
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);

  // capability + reduced-motion
  useEffect(() => {
    setWebgl(hasWebGL() ? "yes" : "no");
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // pause rendering while the hero is off screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // mouse + touch tracking, shared with the 3D scene through a ref
  useEffect(() => {
    if (reduced) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }
    const update = (cx: number, cy: number) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width * 0.5;
      const ey = r.top + r.height * 0.25;
      pointer.current.x = clamp((cx - ex) / (window.innerWidth * 0.5), -1, 1);
      pointer.current.y = clamp((cy - ey) / (window.innerHeight * 0.5), -1, 1);
    };
    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) update(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [reduced]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="3D voxel character waving hello"
      className={`relative aspect-square shrink-0 ${className}`}
    >
      {webgl === "yes" && (
        <div className={`h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
          <Character3D
            pointer={pointer}
            reduced={reduced}
            active={active}
            onReady={() => setReady(true)}
          />
        </div>
      )}
      {webgl === "no" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/voxel/voxel-poster.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-full w-full select-none object-contain object-bottom"
        />
      )}
    </div>
  );
}

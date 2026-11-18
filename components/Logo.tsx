import { SITE_NAME } from "@/lib/constants";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
      <span className="font-display text-sm tracking-wide text-fg">{SITE_NAME}</span>
    </span>
  );
}

import Link from "next/link";
import { cn } from "@/lib/cn";

/** Arch window with a three-drupelet raspberry cluster and a leaf — drawn to sit on the 4px grid. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d="M8 36V19C8 11.3 13.3 5 20 5s12 6.3 12 14v17z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="16.4" cy="22" r="3.4" fill="var(--logo-accent, #b51f59)" />
      <circle cx="23.6" cy="22" r="3.4" fill="var(--logo-accent, #b51f59)" />
      <circle cx="20" cy="28.6" r="3.4" fill="var(--logo-accent, #b51f59)" />
      <path d="M20 15.5c1.8-2.2 4.6-2.4 6-.7-1.9 1.9-4.4 2.1-6 .7z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span dir="ltr" className={cn("font-display text-[1.7rem] font-medium italic leading-none tracking-tight sm:text-[2rem]", className)}>
      Cosmetics
    </span>
  );
}

export function Logo({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Cosmetics کازمتیکس — صفحه اصلی"
      style={onDark ? ({ "--logo-accent": "#f4c6d8" } as React.CSSProperties) : undefined}
      className={cn("inline-flex items-center gap-2", onDark ? "text-blush-100" : "text-plum-900", className)}
    >
      <LogoMark className="size-8 shrink-0 sm:size-9" />
      <span className="flex flex-col items-start leading-none">
        <Wordmark />
        <span className={cn("mt-1 text-[0.68rem] font-medium", onDark ? "text-rasp-200" : "text-rasp-600")}>کازمتیکس</span>
      </span>
    </Link>
  );
}

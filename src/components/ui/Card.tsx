import type { HTMLAttributes, PropsWithChildren } from "react";

export function Card({
  className = "",
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={`glass rounded-xl p-6 md:p-8 bloom-on-hover ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  className = "",
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={`font-mono-label uppercase text-label-sm rounded-full px-3 py-1 bg-surface-container-high text-on-surface-variant border border-glass-border ${className}`}
    >
      {children}
    </span>
  );
}

export function BehindTheScenesBadge({ label }: { label: string }) {
  return (
    <span className="font-mono-label uppercase text-label-sm rounded-full px-4 py-1.5 bg-primary-container/90 text-white shadow-bloom-sm backdrop-blur-sm border border-white/20">
      {label}
    </span>
  );
}

export function Eyebrow({ children }: PropsWithChildren) {
  return (
    <span className="font-mono-label uppercase text-label-sm text-primary block mb-4">
      {children}
    </span>
  );
}

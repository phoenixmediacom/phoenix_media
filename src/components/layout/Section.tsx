import type { HTMLAttributes, PropsWithChildren } from "react";

export function Section({
  id,
  className = "",
  innerClassName = "",
  children,
  ...props
}: PropsWithChildren<
  HTMLAttributes<HTMLElement> & { id: string; innerClassName?: string }
>) {
  return (
    <section
      id={id}
      className={`relative min-h-screen w-full flex items-center py-section-gap ${className}`}
      {...props}
    >
      <div className={`relative z-10 max-w-content mx-auto w-full px-margin-mobile md:px-margin-desktop ${innerClassName}`}>
        {children}
      </div>
    </section>
  );
}

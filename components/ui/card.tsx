import type { ReactNode } from "react";

/** A white, bordered panel that groups related content. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

/** Heading for the content of a `Card`. */
export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-base font-semibold text-slate-900">{children}</h2>;
}

/** Placeholder text for a list or panel that has nothing to show yet. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-4 text-center text-sm text-slate-500">{children}</p>;
}

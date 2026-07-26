import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** Section label + a card of grouped rows, dividers inserted between children. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="mb-2 px-1 text-sm font-semibold tracking-wide text-black/40 uppercase">
        {title}
      </h2>
      <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

import type { ComponentType } from "react";
import Link from "next/link";

import { ChevronRight, type LucideProps } from "lucide-react";

interface SettingsRowProps {
  icon: ComponentType<LucideProps>;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  href?: string;
  badge?: string;
  badgeClassName?: string;
}

/**
 * One row inside a grouped settings/profile section — icon chip, title,
 * optional subtitle, optional status badge, and a chevron when it links
 * somewhere. Pass no `href` for a display-only row (e.g. email).
 */
export function SettingsRow({
  icon: Icon,
  iconClassName = "bg-[#1B1F3B]/5 text-[#1B1F3B]",
  title,
  subtitle,
  href,
  badge,
  badgeClassName = "bg-[#1B1F3B]/5 text-[#1B1F3B]"
}: SettingsRowProps) {
  const content = (
    <>
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#1B1F3B]">{title}</p>
        {subtitle ? <p className="truncate text-sm text-black/50">{subtitle}</p> : null}
      </div>
      {badge ? (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClassName}`}
        >
          {badge}
        </span>
      ) : null}
      {href ? <ChevronRight className="size-4 shrink-0 text-black/30" /> : null}
    </>
  );

  const rowClassName =
    "flex items-center gap-3 px-4 py-3.5 transition first:rounded-t-2xl last:rounded-b-2xl";

  if (href) {
    return (
      <Link href={href} className={`${rowClassName} hover:bg-black/[0.02]`}>
        {content}
      </Link>
    );
  }

  return <div className={rowClassName}>{content}</div>;
}

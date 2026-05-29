"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/watchlist", label: "Watchlist" },
  { href: "/dashboard/subscription", label: "Subscription" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px scrollbar-hide">
      {links.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-[var(--sv-orange)] text-[var(--sv-orange)]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

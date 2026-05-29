"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/genres", label: "Genres" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      {links.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              active
                ? "bg-purple-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

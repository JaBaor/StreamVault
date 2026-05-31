"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { genres } from "@/lib/mock-data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Browse" },
];

export function Header() {
  const pathname = usePathname();
  const { user, role, logout, isAdmin } = useAuth();
  const { notifications } = useUserData();
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[var(--sv-bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sv-orange)] text-sm font-black text-white">
            SV
          </span>
          <span className="hidden font-bold text-white sm:inline">StreamVault</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-[var(--sv-orange)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white"
            >
              Genres ▾
            </button>
            <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-lg border border-zinc-800 bg-zinc-900 py-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
              {genres.map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.slug}`}
                  className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <form action="/search" className="hidden max-w-md flex-1 lg:block">
          <input
            name="q"
            type="search"
            placeholder="Search anime..."
            className="w-full rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[var(--sv-orange)] focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/search"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </Link>

          {user ? (
            <>
              {role !== "guest" && (
                <Link
                  href="/dashboard/notifications"
                  className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  aria-label="Notifications"
                >
                  <BellIcon />
                  {unread > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--sv-orange)] text-[10px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white sm:block"
              >
                My List
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden rounded-lg px-3 py-2 text-sm text-purple-400 hover:text-purple-300 sm:block"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white sm:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[var(--sv-orange)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--sv-orange-hover)]"
              >
                Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <MobileMenu
          user={user}
          isAdmin={isAdmin}
          onClose={() => setMenuOpen(false)}
          onLogout={logout}
        />
      )}
    </header>
  );
}

function MobileMenu({
  user,
  isAdmin,
  onClose,
  onLogout,
}: {
  user: { displayName: string } | null;
  isAdmin: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <nav className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
      <Link href="/" onClick={onClose} className="block py-2 text-zinc-300">
        Home
      </Link>
      <Link href="/search" onClick={onClose} className="block py-2 text-zinc-300">
        Browse
      </Link>
      {user && (
        <>
          <Link href="/dashboard" onClick={onClose} className="block py-2 text-zinc-300">
            Dashboard
          </Link>
          <Link href="/profile" onClick={onClose} className="block py-2 text-zinc-300">
            Profile
          </Link>
        </>
      )}
      {isAdmin && (
        <Link href="/admin" onClick={onClose} className="block py-2 text-purple-400">
          Admin Panel
        </Link>
      )}
      <p className="mt-2 text-xs font-semibold uppercase text-zinc-500">Genres</p>
      {genres.map((g) => (
        <Link
          key={g.id}
          href={`/genre/${g.slug}`}
          onClick={onClose}
          className="block py-1.5 pl-2 text-sm text-zinc-400"
        >
          {g.name}
        </Link>
      ))}
      {!user && (
        <div className="mt-4 flex gap-2">
          <Link
            href="/login"
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-700 py-2 text-center text-sm"
          >
            Log in
          </Link>
          <Link
            href="/register"
            onClick={onClose}
            className="flex-1 rounded-lg bg-[var(--sv-orange)] py-2 text-center text-sm font-semibold"
          >
            Sign up
          </Link>
        </div>
      )}
      {user && (
        <button
          type="button"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="mt-4 w-full rounded-lg border border-zinc-700 py-2 text-sm text-zinc-400"
        >
          Log out
        </button>
      )}
    </nav>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ) : (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-bold text-white">StreamVault</p>
            <p className="mt-2 text-sm text-zinc-500">
              Anime streaming demo — built for Web Application Development.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">Browse</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-500">
              <li><Link href="/search" className="hover:text-white">All shows</Link></li>
              <li><Link href="/genre/action" className="hover:text-white">Action</Link></li>
              <li><Link href="/genre/romance" className="hover:text-white">Romance</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">Account</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-500">
              <li><Link href="/login" className="hover:text-white">Log in</Link></li>
              <li><Link href="/register" className="hover:text-white">Register</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">Demo accounts</p>
            <ul className="mt-2 space-y-1 text-xs text-zinc-500">
              <li>user@streamvault.dev / User123!</li>
              <li>admin@streamify.com / Admin123!</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} StreamVault. Uses lightweight sample videos only.
        </p>
      </div>
    </footer>
  );
}

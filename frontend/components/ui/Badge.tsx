export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "premium" | "live" | "admin";
}) {
  const styles = {
    default: "bg-zinc-800 text-zinc-300",
    premium: "bg-amber-500/20 text-amber-400 border border-amber-500/40",
    live: "bg-red-500/20 text-red-400",
    admin: "bg-purple-500/20 text-purple-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

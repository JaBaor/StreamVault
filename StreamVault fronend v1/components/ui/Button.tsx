import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--sv-orange)] text-white hover:bg-[var(--sv-orange-hover)] shadow-lg shadow-orange-900/20",
  secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
  ghost: "bg-transparent text-zinc-300 hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-500",
  outline:
    "border border-zinc-600 text-zinc-200 hover:border-[var(--sv-orange)] hover:text-[var(--sv-orange)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

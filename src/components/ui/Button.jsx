import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-teal-700 text-white shadow-soft hover:bg-teal-800 focus-visible:ring-teal-500",
  secondary:
    "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-300",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300",
  danger:
    "bg-red-600 text-white shadow-soft hover:bg-red-700 focus-visible:ring-red-400",
};

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  as: Component = "button",
  className,
  children,
  disabled,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      type={Component === "button" ? type : undefined}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      <span>{children}</span>
    </Component>
  );
}

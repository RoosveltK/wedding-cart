import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-neutral-900 text-white hover:bg-neutral-700 disabled:hover:bg-neutral-900",
  secondary:
    "border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 disabled:hover:bg-white",
  danger: "text-red-600 hover:bg-red-50 disabled:hover:bg-transparent",
  ghost: "text-neutral-500 hover:text-neutral-900 disabled:hover:text-neutral-500",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: {
  variant?: keyof typeof variants;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    />
  );
}

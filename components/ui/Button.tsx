import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-[#24439c] text-white shadow-sm hover:bg-[#1a3277] disabled:hover:bg-[#24439c]",
  secondary:
    "border border-[#e3dccb] text-[#4a4234] bg-white hover:border-[#c8a862] hover:bg-[#faf7f0] disabled:hover:bg-white disabled:hover:border-[#e3dccb]",
  danger: "text-red-600 hover:bg-red-50 disabled:hover:bg-transparent",
  ghost: "text-[#8a7f6a] hover:text-[#332e25] disabled:hover:text-[#8a7f6a]",
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
        "rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24439c] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    />
  );
}

import { cn } from "@/lib/cn";

const variants = {
  success: "bg-green-50 text-green-700 border-green-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-neutral-50 text-neutral-700 border-neutral-200",
};

export function Banner({
  variant,
  children,
}: {
  variant: keyof typeof variants;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("rounded-md border px-3 py-2 text-sm", variants[variant])}>{children}</p>
  );
}

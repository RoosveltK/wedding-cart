import { cn } from "@/lib/cn";

const variants = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-[#faf7f0] text-[#4a4234] border-[#e3dccb]",
};

export function Banner({
  variant,
  children,
}: {
  variant: keyof typeof variants;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("rounded-lg border px-3.5 py-2.5 text-sm", variants[variant])}>{children}</p>
  );
}

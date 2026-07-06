import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-lg border border-neutral-200 bg-white shadow-sm",
        className,
      )}
    />
  );
}

export function CardHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-neutral-100 px-6 py-4">
      <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

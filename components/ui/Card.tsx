import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden rounded-2xl border border-[#e8e2d2] bg-white shadow-[0_1px_3px_rgba(51,46,37,0.06)]",
        className,
      )}
    />
  );
}

export function CardHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  /** Boutons/liens affichés à droite du titre. */
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebdd] bg-[#fdfcf8] px-6 py-4">
      <div>
        <h2 className="flex items-center gap-2.5 text-base font-semibold text-[#332e25]">
          <span aria-hidden className="h-4 w-1 rounded-full bg-gradient-to-b from-[#e0af2e] to-[#c8a862]" />
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-[#8a7f6a]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

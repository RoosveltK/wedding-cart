import { cn } from "@/lib/cn";

const controlClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10";

export function TextField({
  label,
  description,
  className,
  ...props
}: {
  label: string;
  description?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <input {...props} className={cn(controlClass, className)} />
      {description && <span className="block text-xs text-neutral-500">{description}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  description,
  className,
  ...props
}: {
  label: string;
  description?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <textarea {...props} className={cn(controlClass, "resize-none", className)} />
      {description && <span className="block text-xs text-neutral-500">{description}</span>}
    </label>
  );
}

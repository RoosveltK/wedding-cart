import { cn } from "@/lib/cn";

const controlClass =
  "w-full rounded-lg border border-[#e3dccb] bg-white px-3 py-2 text-sm text-[#332e25] placeholder:text-[#b3a98f] outline-none transition focus:border-[#24439c] focus:ring-2 focus:ring-[#24439c]/15";

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
      <span className="text-sm font-medium text-[#4a4234]">{label}</span>
      <input {...props} className={cn(controlClass, className)} />
      {description && <span className="block text-xs text-[#8a7f6a]">{description}</span>}
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
      <span className="text-sm font-medium text-[#4a4234]">{label}</span>
      <textarea {...props} className={cn(controlClass, "resize-none", className)} />
      {description && <span className="block text-xs text-[#8a7f6a]">{description}</span>}
    </label>
  );
}

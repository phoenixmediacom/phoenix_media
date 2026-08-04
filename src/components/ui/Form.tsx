import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-lg bg-surface-container-low border border-glass-border px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-colors focus:border-primary focus:shadow-bloom-sm";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-on-surface-variant">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-on-surface-variant/70">{hint}</span>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${fieldBase} ${className}`} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea ref={ref} className={`${fieldBase} min-h-[120px] resize-y ${className}`} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", children, ...props }, ref) => (
    <select ref={ref} className={`${fieldBase} ${className}`} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export function Checkbox({
  label,
  checked,
  onChange,
  id,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`h-5 w-5 rounded-md border transition-colors flex items-center justify-center text-xs ${
          checked
            ? "bg-primary-container border-primary-container text-white"
            : "border-glass-border bg-surface-container-low"
        }`}
        aria-hidden="true"
      >
        {checked ? "✓" : ""}
      </span>
      <span className="text-sm text-on-surface">{label}</span>
    </label>
  );
}

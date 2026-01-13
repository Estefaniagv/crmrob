import * as React from "react";
import { cn } from "./utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-center gap-2 text-sm", className)}>
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="h-4 w-4 rounded border border-app accent-[hsl(var(--primary))]"
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";


import * as React from "react";
import { cn } from "./utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
}

export function Progress({ value, className, ...props }: ProgressProps) {
  const safe = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-[hsl(var(--primary))] transition-[width] duration-300"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}


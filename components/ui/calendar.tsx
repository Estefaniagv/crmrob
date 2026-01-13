import * as React from "react";
import { cn } from "./utils";

// Calendario minimalista basado en input[type=date] para evitar dependencias externas.
export function Calendar({
  selected,
  onSelect,
  className,
}: {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  className?: string;
}) {
  const value = selected ? selected.toISOString().slice(0, 10) : "";
  return (
    <div className={cn("w-full", className)}>
      <input
        aria-label="Seleccionar fecha"
        type="date"
        className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-app"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) onSelect?.(undefined);
          else onSelect?.(new Date(`${v}T00:00:00`));
        }}
      />
    </div>
  );
}


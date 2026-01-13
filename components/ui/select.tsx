import * as React from "react";
import { cn } from "./utils";

interface SelectContextValue {
  value: string | undefined;
  setValue: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  placeholder?: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState<string>(defaultValue ?? "");
  const [open, setOpen] = React.useState(false);
  const controlled = typeof value === "string";
  const current = controlled ? (value ?? "") : internal;

  const setValue = React.useCallback(
    (v: string) => {
      onValueChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onValueChange],
  );

  return (
    <SelectContext.Provider value={{ value: current, setValue, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectTrigger debe usarse dentro de <Select>");
  return (
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm transition hover:bg-[hsl(var(--secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app",
        className,
      )}
      onClick={(e) => {
        props.onClick?.(e);
        ctx.setOpen(!ctx.open);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectValue debe usarse dentro de <Select>");
  const label = ctx.value ? ctx.value : placeholder ?? "Seleccionar...";
  return <span className={cn(!ctx.value ? "text-black/60 dark:text-white/70" : "")}>{label}</span>;
}

export function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectContent debe usarse dentro de <Select>");
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ctx.open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) ctx.setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ctx]);

  if (!ctx.open) return null;
  return (
    <div
      ref={ref}
      role="listbox"
      className={cn(
        "absolute z-50 mt-2 w-full overflow-hidden rounded-[calc(var(--radius))] border border-app bg-card p-1 shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) throw new Error("SelectItem debe usarse dentro de <Select>");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={cn(
        "flex w-full items-center justify-between rounded-[calc(var(--radius))] px-3 py-2 text-left text-sm hover:bg-[hsl(var(--secondary))]",
        active ? "bg-[hsl(var(--secondary))]" : "",
        className,
      )}
      onClick={() => {
        ctx.setValue(value);
        ctx.setOpen(false);
      }}
    >
      <span>{children}</span>
      {active ? <span className="text-xs text-black/60 dark:text-white/70">✓</span> : null}
    </button>
  );
}


import * as React from "react";
import { cn } from "./utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export function DropdownMenu({
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState(defaultOpen ?? false);
  const controlled = typeof open === "boolean";
  const value = controlled ? open : internal;

  const setOpen = React.useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!controlled) setInternal(v);
    },
    [controlled, onOpenChange],
  );

  return <DropdownContext.Provider value={{ open: value, setOpen }}>{children}</DropdownContext.Provider>;
}

export function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenuTrigger debe usarse dentro de <DropdownMenu>");
  const child = React.Children.only(children);
  const props = {
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  };
  return asChild ? React.cloneElement(child, props) : React.cloneElement(child, props);
}

export function DropdownMenuContent({
  className,
  children,
  align = "start",
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenuContent debe usarse dentro de <DropdownMenu>");
  const { open, setOpen } = ctx;
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-40 mt-2 min-w-48 overflow-hidden rounded-[calc(var(--radius))] border border-app bg-card p-1 shadow-soft",
        align === "end" ? "ml-auto" : "",
        className,
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  onSelect,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { onSelect?: () => void }) {
  const ctx = React.useContext(DropdownContext);
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded-[calc(var(--radius))] px-3 py-2 text-sm hover:bg-[hsl(var(--secondary))]",
        className,
      )}
      onClick={(e) => {
        props.onClick?.(e);
        onSelect?.();
        ctx?.setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-[hsl(var(--border))]", className)} {...props} />;
}


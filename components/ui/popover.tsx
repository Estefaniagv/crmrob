import * as React from "react";
import { cn } from "./utils";

interface PopoverContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

export function Popover({
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

  return <PopoverContext.Provider value={{ open: value, setOpen }}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("PopoverTrigger debe usarse dentro de <Popover>");
  const child = React.Children.only(children);
  const props = {
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      ctx.setOpen(!ctx.open);
    },
  };
  return asChild ? React.cloneElement(child, props) : React.cloneElement(child, props);
}

export function PopoverContent({
  className,
  align = "start",
  children,
}: {
  className?: string;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("PopoverContent debe usarse dentro de <Popover>");
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
        "relative z-40 mt-2 w-72 rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft",
        align === "end" ? "ml-auto" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}


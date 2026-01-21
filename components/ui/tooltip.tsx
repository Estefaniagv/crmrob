import * as React from "react";
import { cn } from "./utils";

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}>{children}</TooltipContext.Provider>;
}

export function TooltipTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("TooltipTrigger debe usarse dentro de <Tooltip>");
  const child = React.Children.only(children);
  const props = {
    onMouseEnter: (e: React.MouseEvent) => {
      child.props.onMouseEnter?.(e);
      ctx.setOpen(true);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      child.props.onMouseLeave?.(e);
      ctx.setOpen(false);
    },
    onFocus: (e: React.FocusEvent) => {
      child.props.onFocus?.(e);
      ctx.setOpen(true);
    },
    onBlur: (e: React.FocusEvent) => {
      child.props.onBlur?.(e);
      ctx.setOpen(false);
    },
  };
  return asChild ? React.cloneElement(child, props) : React.cloneElement(child, props);
}

export function TooltipContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("TooltipContent debe usarse dentro de <Tooltip>");
  if (!ctx.open) return null;
  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 mt-2 rounded-[calc(var(--radius))] border border-app bg-card px-2 py-1 text-xs shadow-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}


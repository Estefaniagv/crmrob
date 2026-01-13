import * as React from "react";
import { cn } from "./utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  const variants: Record<BadgeVariant, string> = {
    default: "bg-[hsl(var(--primary))] text-white",
    secondary: "bg-[hsl(var(--secondary))] text-app",
    outline: "border border-app text-app",
    success: "bg-[hsl(var(--success))] text-white",
    warning: "bg-[hsl(var(--warning))] text-black",
    destructive: "bg-[hsl(var(--destructive))] text-white",
    info: "bg-[hsl(var(--info))] text-white",
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}


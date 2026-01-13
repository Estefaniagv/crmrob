import * as React from "react";
import { cn } from "./utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius))] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app disabled:pointer-events-none disabled:opacity-50";

    const variants: Record<ButtonVariant, string> = {
      default: "bg-[hsl(var(--primary))] text-white hover:opacity-90",
      secondary: "bg-[hsl(var(--secondary))] text-app hover:bg-[hsl(var(--muted))]",
      outline:
        "border border-app bg-transparent hover:bg-[hsl(var(--secondary))] hover:text-app",
      ghost: "bg-transparent hover:bg-[hsl(var(--secondary))]",
      destructive: "bg-[hsl(var(--destructive))] text-white hover:opacity-90",
    };

    const sizes: Record<ButtonSize, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-6",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";


import * as React from "react";
import { cn } from "./utils";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

export function AlertDialog({
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
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (!controlled) setInternal(v);
  };
  return (
    <AlertDialogContext.Provider value={{ open: value, setOpen }}>
      <Dialog open={value} onOpenChange={setOpen}>
        {children}
      </Dialog>
    </AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  // Reutiliza DialogTrigger semánticamente (por simplicidad)
  return children;
}

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <DialogContent className={cn("max-w-lg", className)}>{children}</DialogContent>;
}

export function AlertDialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <DialogHeader {...props} />;
}

export function AlertDialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <DialogTitle {...props} />;
}

export function AlertDialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <DialogDescription {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-2 p-5 pt-0", className)} {...props} />;
}

export function AlertDialogCancel({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AlertDialogContext);
  return (
    <Button
      variant="outline"
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        ctx?.setOpen(false);
      }}
    >
      {children ?? "Cancelar"}
    </Button>
  );
}

export function AlertDialogAction({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(AlertDialogContext);
  return (
    <Button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        ctx?.setOpen(false);
      }}
    >
      {children ?? "Confirmar"}
    </Button>
  );
}


import { Toaster } from "sonner";

export function SonnerToaster({ theme }: { theme?: "light" | "dark" | "system" }) {
  return (
    <Toaster
      richColors
      closeButton
      position="top-right"
      theme={theme ?? "system"}
      toastOptions={{
        style: { borderRadius: "var(--radius)" },
      }}
    />
  );
}


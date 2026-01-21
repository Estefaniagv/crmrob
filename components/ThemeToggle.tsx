import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { darkMode, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema"
      title="Cambiar tema"
      onClick={toggle}
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}


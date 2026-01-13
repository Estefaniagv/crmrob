import {
  AlertCircle,
  CheckSquare,
  Home,
  Menu,
  Monitor,
  Settings,
  User,
  Users,
  Zap,
} from "lucide-react";
import * as React from "react";
import { useNavigation } from "./NavigationContext";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cn } from "./ui/utils";

export function MobileNavbar({ onLogout }: { onLogout: () => void }) {
  const { route, navigate } = useNavigation();

  const main = [
    { icon: Home, route: "dashboard" as const, label: "Dashboard" },
    { icon: Users, route: "clients" as const, label: "Clientes" },
    { icon: CheckSquare, route: "tasks" as const, label: "Tareas" },
    { icon: AlertCircle, route: "issues" as const, label: "Incidencias" },
    { icon: Monitor, route: "terminals" as const, label: "TPV" },
  ];

  return (
    <>
      {/* Top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-app bg-card px-3 lg:hidden">
        <button
          type="button"
          className="flex items-center gap-2 rounded-[calc(var(--radius))] px-2 py-1 hover:bg-[hsl(var(--secondary))]"
          onClick={() => navigate("dashboard")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[calc(var(--radius))] bg-[hsl(var(--primary))] text-white">
            <Home className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">CRM Suite</span>
        </button>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationCenter />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menú">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => navigate("automations")}>
                <Zap className="h-4 w-4" /> Automations
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("settings")}>
                <Settings className="h-4 w-4" /> System Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("profile")}>
                <User className="h-4 w-4" /> Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onLogout}>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-app bg-card lg:hidden">
        {main.map((item) => {
          const active = route.name === item.route;
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => navigate(item.route)}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-0.5 py-2 text-xs transition",
                active ? "text-[hsl(var(--primary))]" : "text-black/60 dark:text-white/70",
              )}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}


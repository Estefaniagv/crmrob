import {
  AlertCircle,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
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
import { safeGetLocalStorage, safeSetLocalStorage } from "./storage";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

const SIDEBAR_KEY = "crm.sidebar.collapsed";

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { route, navigate } = useNavigation();
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = safeGetLocalStorage(SIDEBAR_KEY);
    setCollapsed(saved === "true");
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    safeSetLocalStorage(SIDEBAR_KEY, String(next));
  };

  const nav = [
    { name: "Dashboard", icon: Home, route: "dashboard" as const },
    { name: "Clientes", icon: Users, route: "clients" as const },
    { name: "Tareas", icon: CheckSquare, route: "tasks" as const },
    { name: "Incidencias", icon: AlertCircle, route: "issues" as const },
    { name: "Terminales", icon: Monitor, route: "terminals" as const },
  ];

  const secondary = [
    { name: "Automations", icon: Zap, route: "automations" as const },
    { name: "System Settings", icon: Settings, route: "settings" as const },
    { name: "Perfil", icon: User, route: "profile" as const },
  ];

  return (
    <aside
      className={cn(
        "hidden h-screen shrink-0 border-r border-app bg-card lg:flex lg:flex-col",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div className="flex items-center justify-between gap-2 p-4">
        <button
          type="button"
          className="flex items-center gap-3 rounded-[calc(var(--radius))] px-2 py-1 hover:bg-[hsl(var(--secondary))]"
          onClick={() => navigate("dashboard")}
          aria-label="Ir al dashboard"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[calc(var(--radius))] bg-[hsl(var(--primary))] text-white">
            <Home className="h-5 w-5" />
          </div>
          {!collapsed ? <div className="text-sm font-semibold">CRM Suite</div> : null}
        </button>
        <Button variant="ghost" size="icon" aria-label="Colapsar sidebar" onClick={toggle}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {nav.map((item) => {
          const active = route.name === item.route;
          const Icon = item.icon;
          return (
            <button
              key={item.route}
              type="button"
              onClick={() => navigate(item.route)}
              className={cn(
                "flex items-center gap-3 rounded-[calc(var(--radius))] px-3 py-2 text-sm transition",
                active ? "bg-[hsl(var(--secondary))] font-semibold" : "hover:bg-[hsl(var(--secondary))]",
              )}
              aria-label={item.name}
            >
              <Icon className="h-5 w-5" />
              {!collapsed ? <span>{item.name}</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-app p-3">
        <div className={cn("mb-2 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            {!collapsed ? <span className="text-sm font-medium">Centro</span> : null}
          </div>
          {!collapsed ? <ThemeToggle /> : null}
        </div>

        <div className="flex flex-col gap-1">
          {secondary.map((item) => {
            const active = route.name === item.route;
            const Icon = item.icon;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                className={cn(
                  "flex items-center gap-3 rounded-[calc(var(--radius))] px-3 py-2 text-sm transition",
                  active ? "bg-[hsl(var(--secondary))] font-semibold" : "hover:bg-[hsl(var(--secondary))]",
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed ? <span>{item.name}</span> : null}
              </button>
            );
          })}
        </div>

        <Button
          className={cn("mt-3 w-full", collapsed ? "px-0" : "")}
          variant="outline"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed ? <span>Cerrar sesión</span> : null}
        </Button>
      </div>
    </aside>
  );
}


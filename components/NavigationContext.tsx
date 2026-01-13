import * as React from "react";

export type RouteName =
  | "login"
  | "dashboard"
  | "clients"
  | "clientDetail"
  | "tasks"
  | "issues"
  | "terminals"
  | "profile"
  | "settings"
  | "automations"
  | "automationBuilder";

export interface RouteState {
  name: RouteName;
  params?: Record<string, string>;
}

interface NavigationContextValue {
  route: RouteState;
  navigate: (name: RouteName, params?: Record<string, string>) => void;
  goBack: () => void;
  hrefFor: (name: RouteName, params?: Record<string, string>) => string;
}

const NavigationContext = React.createContext<NavigationContextValue | null>(null);

function parseRouteFromLocation(): RouteState {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/dashboard") return { name: "dashboard" };
  if (path === "/login") return { name: "login" };
  if (path === "/clients") return { name: "clients" };
  if (path.startsWith("/clients/")) return { name: "clientDetail", params: { clientId: path.split("/")[2] ?? "" } };
  if (path === "/tasks") return { name: "tasks" };
  if (path === "/issues") return { name: "issues" };
  if (path === "/terminals") return { name: "terminals" };
  if (path === "/profile") return { name: "profile" };
  if (path === "/settings") return { name: "settings" };
  if (path === "/automations") return { name: "automations" };
  if (path.startsWith("/automations/builder")) {
    const parts = path.split("/");
    return { name: "automationBuilder", params: { automationId: parts[3] ?? "" } };
  }
  return { name: "dashboard" };
}

function hrefFor(name: RouteName, params?: Record<string, string>) {
  switch (name) {
    case "login":
      return "/login";
    case "dashboard":
      return "/dashboard";
    case "clients":
      return "/clients";
    case "clientDetail":
      return `/clients/${params?.clientId ?? ""}`;
    case "tasks":
      return "/tasks";
    case "issues":
      return "/issues";
    case "terminals":
      return "/terminals";
    case "profile":
      return "/profile";
    case "settings":
      return "/settings";
    case "automations":
      return "/automations";
    case "automationBuilder":
      return `/automations/builder/${params?.automationId ?? ""}`.replace(/\/+$/, "");
    default:
      return "/dashboard";
  }
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = React.useState<RouteState>(() => parseRouteFromLocation());

  React.useEffect(() => {
    const onPop = () => setRoute(parseRouteFromLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = React.useCallback((name: RouteName, params?: Record<string, string>) => {
    const href = hrefFor(name, params);
    window.history.pushState({}, "", href);
    setRoute({ name, params });
  }, []);

  const goBack = React.useCallback(() => {
    window.history.back();
  }, []);

  const value = React.useMemo<NavigationContextValue>(
    () => ({ route, navigate, goBack, hrefFor }),
    [route, navigate, goBack],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation debe usarse dentro de <NavigationProvider>");
  return ctx;
}


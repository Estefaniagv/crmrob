import * as React from "react";
import { AppProvider, useApp } from "./components/AppContext";
import { Automations } from "./components/Automations";
import { AutomationBuilder } from "./components/AutomationBuilder";
import { ClientDetail } from "./components/ClientDetail";
import { Clients } from "./components/Clients";
import { Dashboard } from "./components/Dashboard";
import { Issues } from "./components/Issues";
import { LoginScreen } from "./components/LoginScreen";
import { MobileNavbar } from "./components/MobileNavbar";
import { NavigationProvider, useNavigation } from "./components/NavigationContext";
import { NotificationProvider } from "./components/NotificationContext";
import { Profile } from "./components/Profile";
import { Sidebar } from "./components/Sidebar";
import { SystemSettings } from "./components/SystemSettings";
import { Terminals } from "./components/Terminals";
import { ThemeProvider } from "./components/ThemeContext";
import { Tasks } from "./components/Tasks";
import { safeGetLocalStorage, safeRemoveLocalStorage, safeSetLocalStorage } from "./components/storage";
import { SonnerToaster } from "./components/ui/sonner";

const AUTH_KEY = "crm.auth.loggedIn";
const AUTH_EMAIL_KEY = "crm.auth.email";

function AppShell() {
  const { route, navigate } = useNavigation();
  const { preferences } = useApp();

  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setLoggedIn(safeGetLocalStorage(AUTH_KEY) === "true");
    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) setLoggedIn(e.newValue === "true");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  React.useEffect(() => {
    // Si no está logueado, forzar ruta login
    if (!loggedIn && route.name !== "login") navigate("login");
    if (loggedIn && route.name === "login") navigate("dashboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, route.name]);

  const onLogout = () => {
    safeRemoveLocalStorage(AUTH_KEY);
    safeRemoveLocalStorage(AUTH_EMAIL_KEY);
    setLoggedIn(false);
    navigate("login");
  };

  const content = (() => {
    if (!loggedIn) return <LoginScreen onLogin={(email) => { safeSetLocalStorage(AUTH_KEY, "true"); safeSetLocalStorage(AUTH_EMAIL_KEY, email); setLoggedIn(true); navigate("dashboard"); }} />;
    switch (route.name) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <Clients />;
      case "clientDetail":
        return <ClientDetail />;
      case "tasks":
        return <Tasks />;
      case "issues":
        return <Issues />;
      case "terminals":
        return <Terminals />;
      case "profile":
        return <Profile />;
      case "settings":
        return <SystemSettings />;
      case "automations":
        return <Automations />;
      case "automationBuilder":
        return <AutomationBuilder />;
      default:
        return <Dashboard />;
    }
  })();

  return (
    <div className="min-h-screen bg-app">
      <div className="flex">
        {loggedIn ? <Sidebar onLogout={onLogout} /> : null}
        <main className="min-h-screen w-full">{content}</main>
      </div>
      {loggedIn ? <MobileNavbar onLogout={onLogout} /> : null}
      <SonnerToaster theme={preferences.darkMode ? "dark" : "light"} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <NavigationProvider>
          <AppProvider>
            <AppShell />
          </AppProvider>
        </NavigationProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}


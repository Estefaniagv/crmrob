import * as React from "react";
import { toast } from "sonner";
import { safeGetLocalStorage, safeJsonParse, safeSetLocalStorage } from "./storage";
import type { NotificationItem } from "./types";

const NOTIFICATIONS_KEY = "crm.notifications.v1";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = React.createContext<NotificationContextValue | null>(null);

function uid(prefix = "ntf") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function persist(items: NotificationItem[]) {
  safeSetLocalStorage(NOTIFICATIONS_KEY, JSON.stringify(items));
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);

  React.useEffect(() => {
    const saved = safeJsonParse<NotificationItem[]>(safeGetLocalStorage(NOTIFICATIONS_KEY));
    if (saved && Array.isArray(saved)) setNotifications(saved);
  }, []);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== NOTIFICATIONS_KEY) return;
      const saved = safeJsonParse<NotificationItem[]>(e.newValue);
      if (saved && Array.isArray(saved)) setNotifications(saved);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const push = React.useCallback(
    (type: NotificationItem["type"], title: string, message?: string) => {
      const item: NotificationItem = {
        id: uid(),
        title,
        message: message ?? "",
        type,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 200);
        persist(next);
        return next;
      });
      const full = message ? `${title}\n${message}` : title;
      if (type === "success") toast.success(full);
      if (type === "error") toast.error(full);
      if (type === "warning") toast.warning(full);
      if (type === "info") toast(full);
    },
    [],
  );

  const markAllRead = React.useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, []);

  const markRead = React.useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(next);
      return next;
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
    persist([]);
  }, []);

  const unreadCount = React.useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showSuccess: (t, m) => push("success", t, m),
        showError: (t, m) => push("error", t, m),
        showInfo: (t, m) => push("info", t, m),
        showWarning: (t, m) => push("warning", t, m),
        markAllRead,
        markRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de <NotificationProvider>");
  return ctx;
}


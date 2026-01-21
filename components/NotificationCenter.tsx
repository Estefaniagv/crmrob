import { Bell, CheckCheck, Trash2 } from "lucide-react";
import * as React from "react";
import { useNotifications } from "./NotificationContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { formatDate } from "./ui/utils";

export function NotificationCenter() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--destructive))] px-1 text-[10px] font-semibold text-white">
                {Math.min(99, unreadCount)}
              </span>
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm font-semibold">Notificaciones</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Marcar todas como leídas" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Borrar todas" onClick={clearAll}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-auto">
          {notifications.length === 0 ? (
            <div className="px-3 py-4 text-sm text-black/60 dark:text-white/70">Sin notificaciones.</div>
          ) : (
            notifications.slice(0, 30).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="items-start"
                onSelect={() => markRead(n.id)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{n.title}</span>
                      {!n.read ? <Badge variant="info">Nuevo</Badge> : null}
                    </div>
                    {n.message ? (
                      <div className="mt-0.5 line-clamp-2 text-xs text-black/60 dark:text-white/70">{n.message}</div>
                    ) : null}
                    <div className="mt-1 text-[11px] text-black/50 dark:text-white/60">{formatDate(n.createdAt)}</div>
                  </div>
                  <Badge variant={n.type === "success" ? "success" : n.type === "warning" ? "warning" : n.type === "error" ? "destructive" : "info"}>
                    {n.type}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


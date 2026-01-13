import { Plus, Search } from "lucide-react";
import * as React from "react";
import { useApp } from "./AppContext";
import { useNavigation } from "./NavigationContext";
import { useNotifications } from "./NotificationContext";
import { TaskForm } from "./forms/TaskForm";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import type { Task, TaskPriority, TaskStatus } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatDate } from "./ui/utils";

function priorityVariant(p: TaskPriority) {
  if (p === "High") return "destructive" as const;
  if (p === "Medium") return "warning" as const;
  return "secondary" as const;
}

export function Tasks() {
  const { tasks, clients, preferences, updateUserPreferences, updateTask } = useApp();
  const { navigate } = useNavigation();
  const { showSuccess } = useNotifications();
  const { startDrag, registerDropZone, dragOverZone, isDragging } = useDragAndDrop<Task>();

  const [openNew, setOpenNew] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = React.useState<TaskPriority | "all">("all");
  const [filterAssigned, setFilterAssigned] = React.useState<"all" | "me" | "team" | "allPeople">("all");
  const [filterClientId, setFilterClientId] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterAssigned !== "all") {
        if (filterAssigned === "allPeople" && t.assignedTo !== "all") return false;
        if (filterAssigned === "me" && t.assignedTo !== "me") return false;
        if (filterAssigned === "team" && t.assignedTo !== "team") return false;
      }
      if (filterClientId !== "all" && (t.clientId ?? "") !== filterClientId) return false;
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    });
  }, [tasks, query, filterStatus, filterPriority, filterAssigned, filterClientId]);

  const setView = (view: "list" | "kanban") => updateUserPreferences({ tasksView: view });

  const onDropToStatus = (status: TaskStatus) => (task: Task) => {
    updateTask(task.id, { status });
    showSuccess("Tarea actualizada", `${task.title} → ${status}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tareas</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Lista y Kanban con drag & drop.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setView(preferences.tasksView === "list" ? "kanban" : "list")}>
            Vista: {preferences.tasksView === "list" ? "Lista" : "Kanban"}
          </Button>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" /> Nueva tarea
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/60" />
            <Input className="pl-9" placeholder="Buscar tareas..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="To Do">To Do</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <select
          className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
          value={filterClientId}
          onChange={(e) => setFilterClientId(e.target.value)}
        >
          <option value="all">Todos los clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.companyName}
            </option>
          ))}
        </select>
      </div>

      {preferences.tasksView === "list" ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((t) => {
                const client = clients.find((c) => c.id === t.clientId);
                const overdue = new Date(t.dueDate).getTime() < Date.now() && t.status !== "Done";
                return (
                  <div
                    key={t.id}
                    className="rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-semibold">{t.title}</div>
                          <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                          {overdue ? <Badge variant="destructive">Vencida</Badge> : null}
                        </div>
                        {t.description ? (
                          <div className="mt-1 text-sm text-black/60 dark:text-white/70">{t.description}</div>
                        ) : null}
                        <div className="mt-2 text-xs text-black/60 dark:text-white/70">
                          Vence: {formatDate(t.dueDate)} · Asignado: {t.assignedTo}
                        </div>
                        {client ? (
                          <button
                            type="button"
                            className="mt-1 text-xs underline underline-offset-4"
                            onClick={() => navigate("clientDetail", { clientId: client.id })}
                          >
                            Cliente: {client.companyName}
                          </button>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={t.status} onValueChange={(v) => updateTask(t.id, { status: v as TaskStatus })}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 ? (
                <div className="text-sm text-black/60 dark:text-white/70">No hay tareas.</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-[980px] gap-4">
            {(["To Do", "In Progress", "Done"] as TaskStatus[]).map((status) => {
              const zoneId = `tasks_${status}`;
              const column = filtered.filter((t) => t.status === status);
              const highlight = dragOverZone === zoneId;
              return (
                <div key={status} className="w-[320px] shrink-0" {...registerDropZone(zoneId, onDropToStatus(status))}>
                  <div className={`mb-2 rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft ${highlight ? "ring-2 ring-app" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{status}</div>
                      <Badge variant="secondary">{column.length}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-black/60 dark:text-white/70">Arrastra para cambiar estado.</div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {column.map((t) => {
                      const client = clients.find((c) => c.id === t.clientId);
                      const overdue = new Date(t.dueDate).getTime() < Date.now() && t.status !== "Done";
                      return (
                        <div
                          key={t.id}
                          className={`rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft ${isDragging ? "select-none" : ""}`}
                          {...startDrag(t)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{t.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                                {overdue ? <Badge variant="destructive">Vencida</Badge> : null}
                                <Badge variant="outline">{formatDate(t.dueDate)}</Badge>
                              </div>
                            </div>
                          </div>
                          {t.description ? (
                            <div className="mt-2 line-clamp-2 text-sm text-black/60 dark:text-white/70">{t.description}</div>
                          ) : null}
                          {client ? (
                            <button
                              type="button"
                              className="mt-3 text-xs underline underline-offset-4"
                              onClick={() => navigate("clientDetail", { clientId: client.id })}
                            >
                              {client.companyName}
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
            <DialogDescription>Crear tarea con validación.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <TaskForm onCreated={() => setOpenNew(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


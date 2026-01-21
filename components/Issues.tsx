import { Plus, Search } from "lucide-react";
import * as React from "react";
import { useApp } from "./AppContext";
import { useNotifications } from "./NotificationContext";
import { IssueForm } from "./forms/IssueForm";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import type { Issue, IssuePriority, IssueStatus } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatDate } from "./ui/utils";

function priorityVariant(p: IssuePriority) {
  if (p === "Urgent" || p === "High") return "destructive" as const;
  if (p === "Medium") return "warning" as const;
  return "secondary" as const;
}

export function Issues() {
  const { issues, clients, updateIssue } = useApp();
  const { showSuccess } = useNotifications();
  const { startDrag, registerDropZone, dragOverZone, isDragging } = useDragAndDrop<Issue>();

  const [openNew, setOpenNew] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<IssueStatus | "all">("all");
  const [filterPriority, setFilterPriority] = React.useState<IssuePriority | "all">("all");
  const [filterClientId, setFilterClientId] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter((i) => {
      if (filterStatus !== "all" && i.status !== filterStatus) return false;
      if (filterPriority !== "all" && i.priority !== filterPriority) return false;
      if (filterClientId !== "all" && (i.clientId ?? "") !== filterClientId) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.reporter.toLowerCase().includes(q);
    });
  }, [issues, query, filterStatus, filterPriority, filterClientId]);

  const onDropToStatus = (status: IssueStatus) => (issue: Issue) => {
    updateIssue(issue.id, { status });
    showSuccess("Incidencia actualizada", `${issue.title} → ${status}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Incidencias</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Kanban con estados y timestamps.</p>
        </div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="h-4 w-4" /> Nueva incidencia
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/60" />
            <Input className="pl-9" placeholder="Buscar incidencias..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
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
            <SelectItem value="Urgent">Urgent</SelectItem>
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

      <div className="mt-4 overflow-x-auto">
        <div className="flex min-w-[980px] gap-4">
          {(["Open", "In Progress", "Resolved"] as IssueStatus[]).map((status) => {
            const zoneId = `issues_${status}`;
            const column = filtered.filter((i) => i.status === status);
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
                  {column.map((i) => {
                    const client = clients.find((c) => c.id === i.clientId);
                    return (
                      <Card key={i.id} className={isDragging ? "select-none" : ""} {...startDrag(i)}>
                        <CardHeader>
                          <CardTitle className="text-sm">{i.title}</CardTitle>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant={priorityVariant(i.priority)}>{i.priority}</Badge>
                            <Badge variant="outline">{status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {client ? (
                            <div className="text-xs text-black/60 dark:text-white/70">Cliente: {client.companyName}</div>
                          ) : null}
                          <div className="mt-1 text-xs text-black/60 dark:text-white/70">Reporter: {i.reporter}</div>
                          <div className="mt-2 text-xs text-black/60 dark:text-white/70">
                            Creación: {formatDate(i.createdAt)} · Actualización: {formatDate(i.updatedAt)}
                          </div>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm underline underline-offset-4">Ver descripción</summary>
                            <div className="mt-2 text-sm text-black/70 dark:text-white/80">{i.description}</div>
                          </details>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva incidencia</DialogTitle>
            <DialogDescription>Crear incidencia con validación.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <IssueForm onCreated={() => setOpenNew(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


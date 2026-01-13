import * as React from "react";
import { useApp } from "../AppContext";
import { useNotifications } from "../NotificationContext";
import type { TaskPriority, TaskStatus } from "../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export function TaskForm({
  defaultClientId,
  onCreated,
}: {
  defaultClientId?: string;
  onCreated?: (taskId: string) => void;
}) {
  const { clients, taskTypes, addTask } = useApp();
  const { showSuccess, showError } = useNotifications();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("To Do");
  const [priority, setPriority] = React.useState<TaskPriority>("Medium");
  const [assignedTo, setAssignedTo] = React.useState<"me" | "team" | "all">("me");
  const [dueDate, setDueDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [clientId, setClientId] = React.useState<string>(defaultClientId ?? "");
  const [typeId, setTypeId] = React.useState<string>(taskTypes[0]?.id ?? "");

  const canSubmit = title.trim().length > 2 && dueDate.trim().length > 0 && typeId.trim().length > 0;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) {
          showError("Formulario incompleto", "Completa título, tipo y vencimiento.");
          return;
        }
        const id = addTask({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          assignedTo,
          dueDate,
          clientId: clientId || undefined,
          typeId,
        });
        showSuccess("Tarea creada", "Se agregó correctamente.");
        onCreated?.(id);
      }}
    >
      <div className="space-y-2">
        <Label>Título *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="To Do">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridad..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Asignado</Label>
          <Select value={assignedTo} onValueChange={(v) => setAssignedTo(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Asignado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="me">Yo</SelectItem>
              <SelectItem value="team">Equipo</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Vencimiento *</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Cliente relacionado</Label>
          <select
            className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">(sin cliente)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <select
            className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
          >
            {taskTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          Crear tarea
        </Button>
      </div>
    </form>
  );
}


import * as React from "react";
import { useApp } from "../AppContext";
import { useNotifications } from "../NotificationContext";
import type { IssuePriority, IssueStatus } from "../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export function IssueForm({ onCreated }: { onCreated?: (issueId: string) => void }) {
  const { clients, currentUser, addIssue } = useApp();
  const { showSuccess, showError } = useNotifications();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<IssueStatus>("Open");
  const [priority, setPriority] = React.useState<IssuePriority>("Medium");
  const [clientId, setClientId] = React.useState("");
  const [reporter, setReporter] = React.useState(currentUser.name);

  const canSubmit = title.trim().length > 2 && description.trim().length > 5;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) {
          showError("Formulario incompleto", "Completa título y descripción.");
          return;
        }
        const id = addIssue({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          clientId: clientId || undefined,
          reporter: reporter.trim() || currentUser.name,
        });
        showSuccess("Incidencia creada", "Se agregó correctamente.");
        onCreated?.(id);
      }}
    >
      <div className="space-y-2">
        <Label>Título *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Descripción *</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridad..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Cliente</Label>
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
          <Label>Reporter</Label>
          <Input value={reporter} onChange={(e) => setReporter(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit}>
          Crear incidencia
        </Button>
      </div>
    </form>
  );
}


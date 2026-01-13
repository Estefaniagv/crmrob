import { CheckCircle, Clock, Package, Plus, Search, Truck } from "lucide-react";
import * as React from "react";
import { useApp } from "./AppContext";
import { useNotifications } from "./NotificationContext";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import type { Terminal, TerminalStatus } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { formatDate } from "./ui/utils";

function statusMeta(status: TerminalStatus) {
  switch (status) {
    case "Pedido":
      return { label: "Pedido", color: "warning" as const, Icon: Clock };
    case "Recibido":
      return { label: "Recibido", color: "info" as const, Icon: Package };
    case "Enviado":
      return { label: "Enviado", color: "secondary" as const, Icon: Truck };
    case "Instalado":
      return { label: "Instalado", color: "success" as const, Icon: CheckCircle };
    default:
      return { label: status, color: "secondary" as const, Icon: Clock };
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function patchDatesForStatus(t: Terminal, nextStatus: TerminalStatus): Partial<Terminal> {
  const d = today();
  if (nextStatus === "Pedido") return { status: nextStatus };
  if (nextStatus === "Recibido") return { status: nextStatus, receivedDate: t.receivedDate ?? d };
  if (nextStatus === "Enviado")
    return { status: nextStatus, receivedDate: t.receivedDate ?? d, shippedDate: t.shippedDate ?? d };
  return {
    status: nextStatus,
    receivedDate: t.receivedDate ?? d,
    shippedDate: t.shippedDate ?? d,
    installedDate: t.installedDate ?? d,
  };
}

export function Terminals() {
  const { terminals, clients, addTerminal, updateTerminal, advanceTerminalStatus } = useApp();
  const { showSuccess } = useNotifications();
  const { startDrag, registerDropZone, dragOverZone, isDragging } = useDragAndDrop<Terminal>();

  const [openNew, setOpenNew] = React.useState(false);
  const [editing, setEditing] = React.useState<Terminal | null>(null);

  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<TerminalStatus | "all">("all");
  const [filterClientId, setFilterClientId] = React.useState("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return terminals.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterClientId !== "all" && (t.clientId ?? "") !== filterClientId) return false;
      if (!q) return true;
      return (
        t.serialNumber.toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [terminals, query, filterStatus, filterClientId]);

  const onDropToStatus = (status: TerminalStatus) => (terminal: Terminal) => {
    updateTerminal(terminal.id, patchDatesForStatus(terminal, status));
    showSuccess("Terminal actualizado", `${terminal.serialNumber} → ${status}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Terminales (TPV)</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Pipeline logístico con drag & drop y avance.</p>
        </div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="h-4 w-4" /> Nuevo terminal
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/60" />
            <Input className="pl-9" placeholder="Buscar por SN, modelo o notas..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Pedido">Pedido</SelectItem>
            <SelectItem value="Recibido">Recibido</SelectItem>
            <SelectItem value="Enviado">Enviado</SelectItem>
            <SelectItem value="Instalado">Instalado</SelectItem>
          </SelectContent>
        </Select>
        <select
          className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm md:col-span-2"
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
        <div className="flex min-w-[1200px] gap-4">
          {(["Pedido", "Recibido", "Enviado", "Instalado"] as TerminalStatus[]).map((status) => {
            const { Icon, color } = statusMeta(status);
            const zoneId = `tpv_${status}`;
            const column = filtered.filter((t) => t.status === status);
            const highlight = dragOverZone === zoneId;
            return (
              <div key={status} className="w-[300px] shrink-0" {...registerDropZone(zoneId, onDropToStatus(status))}>
                <div className={`mb-2 rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft ${highlight ? "ring-2 ring-app" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Icon className="h-4 w-4" /> {status}
                    </div>
                    <Badge variant={color}>{column.length}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-black/60 dark:text-white/70">Arrastra o usa “Avanzar”.</div>
                </div>
                <div className="flex flex-col gap-3">
                  {column.map((t) => {
                    const client = clients.find((c) => c.id === t.clientId);
                    return (
                      <Card
                        key={t.id}
                        className={isDragging ? "select-none" : ""}
                        {...startDrag(t)}
                      >
                        <CardHeader>
                          <CardTitle className="text-sm">{t.serialNumber}</CardTitle>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="text-xs text-black/60 dark:text-white/70">{t.model}</div>
                            <Badge variant={color}>{status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-black/60 dark:text-white/70">
                            Pedido: {formatDate(t.orderDate)}
                          </div>
                          {client ? (
                            <div className="mt-1 text-xs text-black/60 dark:text-white/70">Cliente: {client.companyName}</div>
                          ) : (
                            <div className="mt-1 text-xs text-black/60 dark:text-white/70">Cliente: (sin asignar)</div>
                          )}
                          {t.notes ? <div className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/80">{t.notes}</div> : null}
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditing(t)}>
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                advanceTerminalStatus(t.id);
                                showSuccess("Avanzado", `${t.serialNumber} avanzó de estado.`);
                              }}
                              disabled={t.status === "Instalado"}
                            >
                              Avanzar
                            </Button>
                          </div>
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
            <DialogTitle>Nuevo terminal</DialogTitle>
            <DialogDescription>Formulario completo (mínimo requerido).</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <TerminalForm
              clients={clients.map((c) => ({ id: c.id, name: c.companyName }))}
              onSave={(data) => {
                addTerminal(data);
                showSuccess("Terminal creado");
                setOpenNew(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar terminal</DialogTitle>
            <DialogDescription>Click en guardar para aplicar cambios.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            {editing ? (
              <TerminalForm
                defaultValues={editing}
                clients={clients.map((c) => ({ id: c.id, name: c.companyName }))}
                onSave={(data) => {
                  updateTerminal(editing.id, data);
                  showSuccess("Terminal actualizado");
                  setEditing(null);
                }}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TerminalForm({
  clients,
  defaultValues,
  onSave,
}: {
  clients: Array<{ id: string; name: string }>;
  defaultValues?: Partial<Terminal>;
  onSave: (terminal: Omit<Terminal, "id" | "updatedAt">) => void;
}) {
  const [serialNumber, setSerialNumber] = React.useState(defaultValues?.serialNumber ?? "");
  const [model, setModel] = React.useState(defaultValues?.model ?? "");
  const [clientId, setClientId] = React.useState(defaultValues?.clientId ?? "");
  const [status, setStatus] = React.useState<TerminalStatus>(defaultValues?.status ?? "Pedido");
  const [orderDate, setOrderDate] = React.useState(defaultValues?.orderDate ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = React.useState(defaultValues?.notes ?? "");

  const can = serialNumber.trim().length > 2 && model.trim().length > 2 && orderDate.trim().length === 10;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!can) return;
        onSave({
          serialNumber: serialNumber.trim(),
          model: model.trim(),
          clientId: clientId || undefined,
          status,
          orderDate,
          notes: notes.trim(),
          receivedDate: defaultValues?.receivedDate,
          shippedDate: defaultValues?.shippedDate,
          installedDate: defaultValues?.installedDate,
        });
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Número de serie *</Label>
          <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Modelo *</Label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Cliente</Label>
          <select
            className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">(sin asignar)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TerminalStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pedido">Pedido</SelectItem>
              <SelectItem value="Recibido">Recibido</SelectItem>
              <SelectItem value="Enviado">Enviado</SelectItem>
              <SelectItem value="Instalado">Instalado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Fecha de pedido *</Label>
          <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!can}>
          Guardar
        </Button>
      </div>
    </form>
  );
}


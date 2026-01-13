import { Mail, MoreVertical, Phone, Plus, Search, Trash2, Users } from "lucide-react";
import * as React from "react";
import { useApp } from "./AppContext";
import { useNavigation } from "./NavigationContext";
import { useNotifications } from "./NotificationContext";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import type { Client, ClientStatus } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatCurrencyEUR } from "./ui/utils";
import { NewClientForm } from "./NewClientForm";

function statusBadgeVariant(status: ClientStatus) {
  if (status === "Activo") return "success" as const;
  if (status === "Potencial") return "info" as const;
  return "destructive" as const;
}

function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return (parts[0]?.[0] ?? "C").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

export function Clients() {
  const {
    clients,
    preferences,
    updateUserPreferences,
    bulkUpdateClientStatus,
    bulkDeleteClients,
    updateClient,
    deleteClient,
  } = useApp();
  const { navigate } = useNavigation();
  const { showSuccess } = useNotifications();
  const { startDrag, registerDropZone, dragOverZone, isDragging } = useDragAndDrop<Client>();

  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<ClientStatus | "all">("all");
  const [filterSector, setFilterSector] = React.useState<string>("all");
  const [filterValue, setFilterValue] = React.useState<"all" | "alto" | "bajo">("all");

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [openNew, setOpenNew] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);

  const sectors = React.useMemo(() => {
    const s = new Set(clients.map((c) => c.sector).filter(Boolean));
    return ["all", ...Array.from(s)];
  }, [clients]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterSector !== "all" && c.sector !== filterSector) return false;
      if (filterValue === "alto" && c.valueEUR < 1000) return false;
      if (filterValue === "bajo" && c.valueEUR >= 1000) return false;
      if (!q) return true;
      return (
        c.companyName.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [clients, query, filterStatus, filterSector, filterValue]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const allSelected = selectedIds.length > 0 && selectedIds.length === filtered.length;

  const setView = (view: "list" | "kanban") => updateUserPreferences({ clientsView: view });

  const onDropToStatus = (status: ClientStatus) => (client: Client) => {
    updateClient(client.id, { status });
    showSuccess("Estado actualizado", `${client.companyName} → ${status}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Clientes</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Gestión de clientes (lista y kanban).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setView(preferences.clientsView === "list" ? "kanban" : "list")}>
            Vista: {preferences.clientsView === "list" ? "Lista" : "Kanban"}
          </Button>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/60" />
            <Input
              placeholder="Buscar por empresa, contacto o email..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="Potencial">Potencial</SelectItem>
            <SelectItem value="Activo">Activo</SelectItem>
            <SelectItem value="Perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterValue} onValueChange={(v) => setFilterValue(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Valor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="alto">Alto (≥ 1000€)</SelectItem>
            <SelectItem value="bajo">Bajo (&lt; 1000€)</SelectItem>
          </SelectContent>
        </Select>
        <select
          className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm md:col-span-1"
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Todos los sectores" : s}
            </option>
          ))}
        </select>
      </div>

      {preferences.clientsView === "list" ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Lista de clientes
              </span>
              {selectedIds.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Select
                    value="bulk"
                    onValueChange={(v) => {
                      if (v === "bulk") return;
                      bulkUpdateClientStatus(selectedIds, v as ClientStatus);
                      showSuccess("Actualización masiva", `Estado cambiado para ${selectedIds.length} clientes.`);
                      setSelectedIds([]);
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Cambiar estado masivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulk">Cambiar estado masivo</SelectItem>
                      <SelectItem value="Potencial">Potencial</SelectItem>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      bulkDeleteClients(selectedIds);
                      showSuccess("Eliminación masiva", `Eliminados ${selectedIds.length} clientes.`);
                      setSelectedIds([]);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                </div>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-[hsl(var(--secondary))] text-left">
                  <tr>
                    <th className="p-2">
                      <Checkbox
                        checked={allSelected}
                        onChange={() => {
                          if (allSelected) setSelectedIds([]);
                          else setSelectedIds(filtered.map((c) => c.id));
                        }}
                        aria-label="Seleccionar todos"
                      />
                    </th>
                    <th className="p-2">Empresa</th>
                    <th className="p-2">Contacto</th>
                    <th className="p-2">Estado</th>
                    <th className="p-2">Sector</th>
                    <th className="p-2">Valor</th>
                    <th className="p-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-app hover:bg-[hsl(var(--secondary))]">
                      <td className="p-2">
                        <Checkbox
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelection(c.id)}
                          aria-label={`Seleccionar ${c.companyName}`}
                        />
                      </td>
                      <td className="p-2">
                        <button className="font-medium hover:underline" onClick={() => navigate("clientDetail", { clientId: c.id })}>
                          {c.companyName}
                        </button>
                      </td>
                      <td className="p-2">{c.contactName}</td>
                      <td className="p-2">
                        <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                      </td>
                      <td className="p-2">{c.sector || "-"}</td>
                      <td className="p-2">{formatCurrencyEUR(c.valueEUR)}</td>
                      <td className="p-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Acciones">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => navigate("clientDetail", { clientId: c.id })}>
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setEditing(c)}>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => {
                                deleteClient(c.id);
                                showSuccess("Cliente eliminado", c.companyName);
                              }}
                            >
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 ? (
                <div className="p-4 text-sm text-black/60 dark:text-white/70">No hay resultados.</div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <div className="flex min-w-[980px] gap-4">
            {(["Potencial", "Activo", "Perdido"] as ClientStatus[]).map((status) => {
              const zoneId = `clients_${status}`;
              const column = filtered.filter((c) => c.status === status);
              const highlight = dragOverZone === zoneId;
              return (
                <div
                  key={status}
                  className="w-[320px] shrink-0"
                  {...registerDropZone(zoneId, onDropToStatus(status))}
                >
                  <div
                    className={cn(
                      "mb-2 rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft",
                      highlight ? "ring-2 ring-app" : "",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{status}</div>
                      <Badge variant={statusBadgeVariant(status)}>{column.length}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-black/60 dark:text-white/70">
                      Arrastra tarjetas para cambiar estado.
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {column.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          "rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft transition",
                          isDragging ? "select-none" : "",
                        )}
                        {...startDrag(c)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            className="min-w-0 text-left"
                            onClick={() => navigate("clientDetail", { clientId: c.id })}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-sm font-semibold">
                                {initials(c.companyName)}
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">{c.companyName}</div>
                                <div className="truncate text-xs text-black/60 dark:text-white/70">{c.contactName}</div>
                              </div>
                            </div>
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                          <span className="text-sm font-semibold">{formatCurrencyEUR(c.valueEUR)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <a
                              href={`mailto:${c.email}`}
                              className="rounded p-1 hover:bg-[hsl(var(--secondary))]"
                              aria-label="Email"
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                            <a
                              href={`tel:${c.phone}`}
                              className="rounded p-1 hover:bg-[hsl(var(--secondary))]"
                              aria-label="Teléfono"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Acciones">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => navigate("clientDetail", { clientId: c.id })}>
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setEditing(c)}>Editar</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => {
                                  deleteClient(c.id);
                                  showSuccess("Cliente eliminado", c.companyName);
                                }}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nuevo cliente */}
      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>Crear cliente y asignar productos.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <NewClientForm
              onCreated={(id) => {
                setOpenNew(false);
                navigate("clientDetail", { clientId: id });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Editar cliente */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>Actualiza datos básicos.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            {editing ? <EditClientForm client={editing} onSave={(patch) => updateClient(editing.id, patch)} /> : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditClientForm({
  client,
  onSave,
}: {
  client: Client;
  onSave: (patch: Partial<Client>) => void;
}) {
  const { showSuccess } = useNotifications();
  const [companyName, setCompanyName] = React.useState(client.companyName);
  const [contactName, setContactName] = React.useState(client.contactName);
  const [email, setEmail] = React.useState(client.email);
  const [phone, setPhone] = React.useState(client.phone);
  const [sector, setSector] = React.useState(client.sector);
  const [address, setAddress] = React.useState(client.address);
  const [status, setStatus] = React.useState<ClientStatus>(client.status);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          sector: sector.trim(),
          address: address.trim(),
          status,
        });
        showSuccess("Cliente actualizado");
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Empresa</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Contacto</Label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Potencial">Potencial</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sector</Label>
          <Input value={sector} onChange={(e) => setSector(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Dirección</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


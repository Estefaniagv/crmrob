import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useApp } from "./AppContext";
import { useNavigation } from "./NavigationContext";
import { useNotifications } from "./NotificationContext";
import { BulkTerminalsForm } from "./BulkTerminalsForm";
import type { ActivityType, Client, ClientStatus } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { formatCurrencyEUR, formatDate } from "./ui/utils";

function statusVariant(status: ClientStatus) {
  if (status === "Activo") return "success" as const;
  if (status === "Potencial") return "info" as const;
  return "destructive" as const;
}

export function ClientDetail() {
  const { route, navigate } = useNavigation();
  const clientId = route.params?.clientId ?? "";
  const {
    clients,
    terminals,
    products,
    addClientProduct,
    removeClientProduct,
    addNote,
    deleteClient,
    updateClient,
  } = useApp();
  const { showSuccess, showWarning } = useNotifications();

  const client = React.useMemo(() => clients.find((c) => c.id === clientId) ?? null, [clients, clientId]);
  const clientTerminals = React.useMemo(() => terminals.filter((t) => t.clientId === clientId), [terminals, clientId]);

  const [tab, setTab] = React.useState("general");
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openAddProduct, setOpenAddProduct] = React.useState(false);

  if (!client) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cliente no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate("clients")}>
              Volver a Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("clients")}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{client.companyName}</h1>
              <Badge variant={statusVariant(client.status)}>{client.status}</Badge>
            </div>
            <div className="text-sm text-black/60 dark:text-white/70">{client.contactName}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setOpenEdit(true)}>
            <Edit className="h-4 w-4" /> Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("¿Eliminar este cliente?")) {
                deleteClient(client.id);
                showWarning("Cliente eliminado");
                navigate("clients");
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="general">Información</TabsTrigger>
          <TabsTrigger value="products">Productos/Servicios</TabsTrigger>
          <TabsTrigger value="terminals">Terminales TPV</TabsTrigger>
          <TabsTrigger value="activity">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Datos de contacto</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Contacto" value={client.contactName} />
                <Field label="Email" value={client.email} />
                <Field label="Teléfono" value={client.phone} />
                <Field label="Dirección" value={client.address} />
                <Field label="Sector" value={client.sector} />
                <Field label="Último contacto" value={formatDate(client.lastContact)} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-[calc(var(--radius))] border border-app p-3">
                  <div className="text-xs text-black/60 dark:text-white/70">Valor total</div>
                  <div className="text-lg font-semibold">{formatCurrencyEUR(client.valueEUR)}</div>
                </div>
                <div className="rounded-[calc(var(--radius))] border border-app p-3">
                  <div className="text-xs text-black/60 dark:text-white/70">Terminales asignados</div>
                  <div className="text-lg font-semibold">{clientTerminals.length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Productos contratados</span>
                <Button onClick={() => setOpenAddProduct(true)}>
                  <Plus className="h-4 w-4" /> Agregar Producto
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-[820px] w-full text-sm">
                  <thead className="bg-[hsl(var(--secondary))] text-left">
                    <tr>
                      <th className="p-2">Producto</th>
                      <th className="p-2">Precio</th>
                      <th className="p-2">Cantidad</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">Inicio</th>
                      <th className="p-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.products.map((p) => (
                      <tr key={p.id} className="border-t border-app">
                        <td className="p-2">{p.productName}</td>
                        <td className="p-2">{formatCurrencyEUR(p.price)}</td>
                        <td className="p-2">{p.quantity}</td>
                        <td className="p-2">{formatCurrencyEUR(p.price * p.quantity)}</td>
                        <td className="p-2">{formatDate(p.startDate)}</td>
                        <td className="p-2 text-right">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              removeClientProduct(client.id, p.id);
                              showSuccess("Producto eliminado");
                            }}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {client.products.length === 0 ? (
                <div className="mt-3 text-sm text-black/60 dark:text-white/70">Sin productos aún.</div>
              ) : null}
              <div className="mt-4 rounded-[calc(var(--radius))] border border-app bg-[hsl(var(--secondary))] p-3 text-sm">
                <span className="font-medium">Valor total calculado:</span> {formatCurrencyEUR(client.valueEUR)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terminals">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Terminales asignados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clientTerminals.length === 0 ? (
                  <div className="text-sm text-black/60 dark:text-white/70">Aún no hay terminales asignados.</div>
                ) : (
                  clientTerminals.slice(0, 20).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-[calc(var(--radius))] border border-app p-3 text-left hover:bg-[hsl(var(--secondary))]"
                      onClick={() => navigate("terminals")}
                    >
                      <div>
                        <div className="text-sm font-semibold">{t.serialNumber}</div>
                        <div className="text-xs text-black/60 dark:text-white/70">{t.model}</div>
                      </div>
                      <Badge variant={t.status === "Instalado" ? "success" : t.status === "Pedido" ? "warning" : "info"}>
                        {t.status}
                      </Badge>
                    </button>
                  ))
                )}
                {clientTerminals.length > 20 ? (
                  <div className="text-xs text-black/60 dark:text-white/70">Mostrando 20 de {clientTerminals.length}.</div>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Entrada bulk</CardTitle>
              </CardHeader>
              <CardContent>
                <BulkTerminalsForm clientId={client.id} onSaved={() => {}} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.notes.length === 0 ? (
                    <div className="text-sm text-black/60 dark:text-white/70">Sin actividad registrada.</div>
                  ) : (
                    client.notes
                      .slice()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((n) => (
                        <div key={n.id} className="rounded-[calc(var(--radius))] border border-app p-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{n.type}</Badge>
                            <div className="text-xs text-black/60 dark:text-white/70">{formatDate(n.date)}</div>
                          </div>
                          <div className="mt-2 text-sm">{n.content}</div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Agregar nota</CardTitle>
              </CardHeader>
              <CardContent>
                <AddNoteForm
                  onAdd={(type, content) => {
                    addNote(client.id, { type, content });
                    showSuccess("Nota agregada");
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Editar cliente */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
            <DialogDescription>Actualiza información general.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <EditClientForm
              client={client}
              onSave={(patch) => {
                updateClient(client.id, patch);
                showSuccess("Cliente actualizado");
                setOpenEdit(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Agregar producto */}
      <Dialog open={openAddProduct} onOpenChange={setOpenAddProduct}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar producto</DialogTitle>
            <DialogDescription>Se recalcula el valor total automáticamente.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <AddProductForm
              products={products.filter((p) => p.active)}
              onAdd={(productId, price, quantity, startDate) => {
                addClientProduct(client.id, { productId, price, quantity, startDate });
                showSuccess("Producto agregado");
                setOpenAddProduct(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[calc(var(--radius))] border border-app p-3">
      <div className="text-xs text-black/60 dark:text-white/70">{label}</div>
      <div className="mt-1 text-sm font-medium">{value || "-"}</div>
    </div>
  );
}

function AddNoteForm({ onAdd }: { onAdd: (type: ActivityType, content: string) => void }) {
  const [type, setType] = React.useState<ActivityType>("Llamada");
  const [content, setContent] = React.useState("");
  const can = content.trim().length > 3;
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!can) return;
        onAdd(type, content.trim());
        setContent("");
      }}
    >
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Llamada">Llamada</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Reunión">Reunión</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Contenido</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Detalle..." />
      </div>
      <Button type="submit" disabled={!can} className="w-full">
        Agregar
      </Button>
    </form>
  );
}

function AddProductForm({
  products,
  onAdd,
}: {
  products: Array<{ id: string; name: string; price: number }>;
  onAdd: (productId: string, price: number, quantity: number, startDate: string) => void;
}) {
  const [productId, setProductId] = React.useState(products[0]?.id ?? "");
  const selected = products.find((p) => p.id === productId);
  const [price, setPrice] = React.useState(selected?.price ?? 0);
  const [quantity, setQuantity] = React.useState(1);
  const [startDate, setStartDate] = React.useState(new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    const p = products.find((x) => x.id === productId);
    if (p) setPrice(p.price);
  }, [productId, products]);

  const can = productId && quantity > 0 && startDate;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!can) return;
        onAdd(productId, price, quantity, startDate);
      }}
    >
      <div className="space-y-2">
        <Label>Producto</Label>
        <select
          className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Precio</Label>
          <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Cantidad</Label>
          <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Fecha inicio</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={!can} className="w-full">
        Agregar
      </Button>
    </form>
  );
}

function EditClientForm({
  client,
  onSave,
}: {
  client: Client;
  onSave: (patch: Partial<Client>) => void;
}) {
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
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}


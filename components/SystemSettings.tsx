import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "./AppContext";
import { useNotifications } from "./NotificationContext";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import type { CustomField, CustomFieldType, Product, TaskTypeConfig } from "./types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { formatCurrencyEUR } from "./ui/utils";

export function SystemSettings() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <h1 className="text-xl font-semibold">System Settings</h1>
      <p className="text-sm text-black/60 dark:text-white/70">Configuración del sistema y catálogos.</p>

      <Card className="mt-6">
        <CardContent className="pt-5">
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Productos/Servicios</TabsTrigger>
              <TabsTrigger value="taskTypes">Tipos de tareas</TabsTrigger>
              <TabsTrigger value="customFields">Campos personalizados</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ProductsSettings />
            </TabsContent>
            <TabsContent value="taskTypes">
              <TaskTypesSettings />
            </TabsContent>
            <TabsContent value="customFields">
              <CustomFieldsSettings />
            </TabsContent>
            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsSettings() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const { showSuccess } = useNotifications();
  const [openNew, setOpenNew] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Catálogo</div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="h-4 w-4" /> Nuevo producto
        </Button>
      </div>
      <div className="overflow-x-auto rounded-[calc(var(--radius))] border border-app">
        <table className="min-w-[860px] w-full text-sm">
          <thead className="bg-[hsl(var(--secondary))] text-left">
            <tr>
              <th className="p-2">Nombre</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Descripción</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-app">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{formatCurrencyEUR(p.price)}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      aria-label="Activo"
                      checked={p.active}
                      onCheckedChange={(v) => {
                        updateProduct(p.id, { active: v });
                        showSuccess("Producto actualizado");
                      }}
                    />
                    <Badge variant={p.active ? "success" : "secondary"}>{p.active ? "Activo" : "Inactivo"}</Badge>
                  </div>
                </td>
                <td className="p-2 text-black/70 dark:text-white/80">{p.description}</td>
                <td className="p-2 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(p)}>
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm("¿Eliminar producto?")) {
                          deleteProduct(p.id);
                          showSuccess("Producto eliminado");
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
            <DialogDescription>CRUD completo con validación.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <ProductForm
              onSave={(data) => {
                addProduct(data);
                showSuccess("Producto creado");
                setOpenNew(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>Actualiza el catálogo.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            {editing ? (
              <ProductForm
                defaultValues={editing}
                onSave={(data) => {
                  updateProduct(editing.id, data);
                  showSuccess("Producto actualizado");
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

function ProductForm({
  defaultValues,
  onSave,
}: {
  defaultValues?: Partial<Product>;
  onSave: (data: Omit<Product, "id">) => void;
}) {
  const [name, setName] = React.useState(defaultValues?.name ?? "");
  const [price, setPrice] = React.useState<number>(defaultValues?.price ?? 0);
  const [description, setDescription] = React.useState(defaultValues?.description ?? "");
  const [active, setActive] = React.useState(defaultValues?.active ?? true);
  const can = name.trim().length > 2 && price >= 0;
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!can) return;
        onSave({ name: name.trim(), price, description: description.trim(), active });
      }}
    >
      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Precio (€) *</Label>
        <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      </div>
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex items-center justify-between rounded-[calc(var(--radius))] border border-app p-3">
        <div className="text-sm font-medium">Activo</div>
        <Switch aria-label="Activo" checked={active} onCheckedChange={setActive} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!can}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

function TaskTypesSettings() {
  const { taskTypes, addTaskType, updateTaskType, deleteTaskType } = useApp();
  const { showSuccess } = useNotifications();
  const [openNew, setOpenNew] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskTypeConfig | null>(null);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Tipos personalizados</div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="h-4 w-4" /> Nuevo tipo
        </Button>
      </div>
      <div className="space-y-2">
        {taskTypes.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-[calc(var(--radius))] border border-app p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: `hsl(${t.colorHsl})` }} />
                <span className="truncate text-sm font-semibold">{t.name}</span>
                <Badge variant="outline">{t.icon}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(t)}>
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("¿Eliminar tipo?")) {
                    deleteTaskType(t.id);
                    showSuccess("Tipo eliminado");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo tipo de tarea</DialogTitle>
            <DialogDescription>Nombre, color e icono.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <TaskTypeForm
              onSave={(data) => {
                addTaskType(data);
                showSuccess("Tipo creado");
                setOpenNew(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tipo</DialogTitle>
            <DialogDescription>Vista previa incluida.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            {editing ? (
              <TaskTypeForm
                defaultValues={editing}
                onSave={(data) => {
                  updateTaskType(editing.id, data);
                  showSuccess("Tipo actualizado");
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

function TaskTypeForm({
  defaultValues,
  onSave,
}: {
  defaultValues?: Partial<TaskTypeConfig>;
  onSave: (data: Omit<TaskTypeConfig, "id">) => void;
}) {
  const [name, setName] = React.useState(defaultValues?.name ?? "");
  const [colorHsl, setColorHsl] = React.useState(defaultValues?.colorHsl ?? "221 83% 53%");
  const [icon, setIcon] = React.useState<TaskTypeConfig["icon"]>((defaultValues?.icon as any) ?? "Phone");
  const can = name.trim().length > 2;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!can) return;
        onSave({ name: name.trim(), colorHsl: colorHsl.trim(), icon });
      }}
    >
      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Color (HSL) *</Label>
        <Input value={colorHsl} onChange={(e) => setColorHsl(e.target.value)} placeholder="221 83% 53%" />
        <div className="text-xs text-black/60 dark:text-white/70">
          Ejemplo: <code>221 83% 53%</code>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Icono</Label>
        <Select value={icon} onValueChange={(v) => setIcon(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Icono" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Phone">Phone</SelectItem>
            <SelectItem value="Users">Users</SelectItem>
            <SelectItem value="FileText">FileText</SelectItem>
            <SelectItem value="Clock">Clock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-[calc(var(--radius))] border border-app p-3">
        <div className="text-xs text-black/60 dark:text-white/70">Vista previa</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ background: `hsl(${colorHsl})` }} />
          <span className="text-sm font-semibold">{name || "Tipo"}</span>
          <Badge variant="outline">{icon}</Badge>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!can}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

function CustomFieldsSettings() {
  const { customFields, addCustomField, updateCustomField, deleteCustomField, reorderCustomFields } = useApp();
  const { showSuccess } = useNotifications();
  const [openNew, setOpenNew] = React.useState(false);
  const { startDrag, registerDropZone, dragOverZone } = useDragAndDrop<CustomField>();

  const sorted = React.useMemo(() => customFields.slice().sort((a, b) => a.order - b.order), [customFields]);

  const onDropAtIndex = (index: number) => (field: CustomField) => {
    const ids = sorted.map((f) => f.id);
    const from = ids.indexOf(field.id);
    if (from === -1) return;
    ids.splice(from, 1);
    ids.splice(index, 0, field.id);
    reorderCustomFields(ids);
    showSuccess("Orden actualizado");
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Campos de cliente</div>
        <Button onClick={() => setOpenNew(true)}>
          <Plus className="h-4 w-4" /> Nuevo campo
        </Button>
      </div>

      <div className="space-y-2">
        {sorted.map((f, idx) => {
          const zoneId = `cf_${idx}`;
          const highlight = dragOverZone === zoneId;
          return (
            <div key={f.id} {...registerDropZone(zoneId, onDropAtIndex(idx))}>
              <div
                className={`flex items-center justify-between rounded-[calc(var(--radius))] border border-app bg-card p-3 shadow-soft ${highlight ? "ring-2 ring-app" : ""}`}
              >
                <div className="min-w-0" {...startDrag(f)}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">#{f.order}</Badge>
                    <span className="truncate text-sm font-semibold">{f.name}</span>
                    <Badge variant="outline">{f.type}</Badge>
                    {f.required ? <Badge variant="warning">Requerido</Badge> : null}
                  </div>
                  {f.type === "select" && f.options?.length ? (
                    <div className="mt-1 text-xs text-black/60 dark:text-white/70">
                      Opciones: {f.options.join(", ")}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = prompt("Nombre del campo", f.name) ?? f.name;
                      updateCustomField(f.id, { name });
                      showSuccess("Campo actualizado");
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm("¿Eliminar campo?")) {
                        deleteCustomField(f.id);
                        showSuccess("Campo eliminado");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={openNew} onOpenChange={setOpenNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo campo</DialogTitle>
            <DialogDescription>Configura tipo y validación.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <CustomFieldForm
              nextOrder={sorted.length + 1}
              onSave={(data) => {
                addCustomField(data);
                showSuccess("Campo creado");
                setOpenNew(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomFieldForm({
  nextOrder,
  onSave,
}: {
  nextOrder: number;
  onSave: (data: Omit<CustomField, "id">) => void;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<CustomFieldType>("text");
  const [required, setRequired] = React.useState(false);
  const [options, setOptions] = React.useState("opción 1, opción 2");
  const can = name.trim().length > 2;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!can) return;
        onSave({
          name: name.trim(),
          type,
          required,
          order: nextOrder,
          options: type === "select" ? options.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        });
      }}
    >
      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="number">Número</SelectItem>
            <SelectItem value="date">Fecha</SelectItem>
            <SelectItem value="select">Select</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {type === "select" ? (
        <div className="space-y-2">
          <Label>Opciones (separadas por coma)</Label>
          <Input value={options} onChange={(e) => setOptions(e.target.value)} />
        </div>
      ) : null}
      <div className="flex items-center justify-between rounded-[calc(var(--radius))] border border-app p-3">
        <div className="text-sm font-medium">Requerido</div>
        <Switch aria-label="Requerido" checked={required} onCheckedChange={setRequired} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!can}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

function GeneralSettings() {
  const { showSuccess } = useNotifications();
  const key = "crm.settings.general.v1";
  const [state, setState] = React.useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(key) ?? "null") ?? {
          company: "Empresa S.A.",
          language: "es-ES",
          timezone: "Europe/Madrid",
          dateFormat: "dd/MM/yyyy",
          currency: "EUR",
        }
      );
    } catch {
      return { company: "Empresa S.A.", language: "es-ES", timezone: "Europe/Madrid", dateFormat: "dd/MM/yyyy", currency: "EUR" };
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // noop
    }
  }, [state]);

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Empresa</Label>
        <Input value={state.company} onChange={(e) => setState((s: any) => ({ ...s, company: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Idioma</Label>
        <Input value={state.language} onChange={(e) => setState((s: any) => ({ ...s, language: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Zona horaria</Label>
        <Input value={state.timezone} onChange={(e) => setState((s: any) => ({ ...s, timezone: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Formato de fecha</Label>
        <Input value={state.dateFormat} onChange={(e) => setState((s: any) => ({ ...s, dateFormat: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Moneda</Label>
        <Input value={state.currency} onChange={(e) => setState((s: any) => ({ ...s, currency: e.target.value }))} />
      </div>
      <div className="flex items-end justify-end">
        <Button onClick={() => showSuccess("Configuración guardada (auto)")}>Guardar (auto)</Button>
      </div>
    </div>
  );
}


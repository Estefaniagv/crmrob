import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigation } from "./NavigationContext";
import { useNotifications } from "./NotificationContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";

export interface Automation {
  id: string;
  name: string;
  active: boolean;
  trigger: string;
  actionsCount: number;
  lastRun?: string;
  flow: { nodes: any[]; edges: any[] };
}

const KEY = "crm.automations.v1";

function uid() {
  return `aut_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function load(): Automation[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Automation[]) : null;
    if (parsed && Array.isArray(parsed)) return parsed;
  } catch {
    // noop
  }
  return [
    {
      id: "aut_demo_1",
      name: "Nuevo cliente → Crear tarea de bienvenida",
      active: true,
      trigger: "Nuevo cliente",
      actionsCount: 1,
      lastRun: new Date().toISOString(),
      flow: { nodes: [], edges: [] },
    },
    {
      id: "aut_demo_2",
      name: "Tarea vencida → Notificar usuario",
      active: false,
      trigger: "Tarea vencida",
      actionsCount: 1,
      lastRun: undefined,
      flow: { nodes: [], edges: [] },
    },
  ];
}

function save(items: Automation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // noop
  }
}

export function Automations() {
  const { navigate } = useNavigation();
  const { showSuccess } = useNotifications();
  const [items, setItems] = React.useState<Automation[]>(() => load());

  React.useEffect(() => save(items), [items]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Automations</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Automatizaciones con builder visual.</p>
        </div>
        <Button
          onClick={() => {
            const id = uid();
            setItems((prev) => [
              { id, name: "Nueva automatización", active: false, trigger: "Nuevo cliente", actionsCount: 0, flow: { nodes: [], edges: [] } },
              ...prev,
            ]);
            navigate("automationBuilder", { automationId: id });
          }}
        >
          <Plus className="h-4 w-4" /> Nueva Automatización
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="text-base">{a.name}</CardTitle>
              <CardDescription>
                Trigger: {a.trigger} · Acciones: {a.actionsCount}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-[calc(var(--radius))] border border-app p-3">
                <div>
                  <div className="text-sm font-medium">Activo</div>
                  <div className="text-xs text-black/60 dark:text-white/70">
                    Última ejecución: {a.lastRun ? new Date(a.lastRun).toLocaleString("es-ES") : "—"}
                  </div>
                </div>
                <Switch
                  aria-label="Activo"
                  checked={a.active}
                  onCheckedChange={(v) => {
                    setItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, active: v } : x)));
                    showSuccess("Automatización actualizada");
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("automationBuilder", { automationId: a.id })}>
                  <Edit className="h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const copyId = uid();
                    setItems((prev) => [
                      { ...a, id: copyId, name: `${a.name} (copia)`, active: false, lastRun: undefined },
                      ...prev,
                    ]);
                    showSuccess("Duplicada");
                  }}
                >
                  <Copy className="h-4 w-4" /> Duplicar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (!confirm("¿Eliminar automatización?")) return;
                    setItems((prev) => prev.filter((x) => x.id !== a.id));
                    showSuccess("Eliminada");
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


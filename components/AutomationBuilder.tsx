import { ArrowLeft, Save, Play, X } from "lucide-react";
import * as React from "react";
import { useNavigation } from "./NavigationContext";
import { useNotifications } from "./NotificationContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

type NodeKind = "trigger" | "condition" | "action";
type NodeType =
  | "Nuevo cliente"
  | "Tarea vencida"
  | "Estado cambió"
  | "Fecha específica"
  | "Si valor es..."
  | "Si estado es..."
  | "Si fecha es..."
  | "Enviar email"
  | "Crear tarea"
  | "Cambiar estado"
  | "Notificar usuario";

interface FlowNode {
  id: string;
  kind: NodeKind;
  type: NodeType;
  x: number;
  y: number;
  config: Record<string, string>;
}

interface FlowEdge {
  id: string;
  from: string;
  to: string;
}

const KEY = "crm.automations.v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function loadAutomationName(id: string): string {
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as any[]) : [];
    const found = items.find((x) => x.id === id);
    return found?.name ?? "Automatización";
  } catch {
    return "Automatización";
  }
}

function saveAutomation(id: string, patch: { name?: string; trigger?: string; actionsCount?: number; flow?: any }) {
  try {
    const raw = localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as any[]) : [];
    const next = items.map((x) => (x.id === id ? { ...x, ...patch } : x));
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // noop
  }
}

const palette: Array<{ kind: NodeKind; type: NodeType }> = [
  { kind: "trigger", type: "Nuevo cliente" },
  { kind: "trigger", type: "Tarea vencida" },
  { kind: "trigger", type: "Estado cambió" },
  { kind: "trigger", type: "Fecha específica" },
  { kind: "condition", type: "Si valor es..." },
  { kind: "condition", type: "Si estado es..." },
  { kind: "condition", type: "Si fecha es..." },
  { kind: "action", type: "Enviar email" },
  { kind: "action", type: "Crear tarea" },
  { kind: "action", type: "Cambiar estado" },
  { kind: "action", type: "Notificar usuario" },
];

export function AutomationBuilder() {
  const { route, navigate } = useNavigation();
  const automationId = route.params?.automationId ?? "";
  const { showSuccess, showError, showInfo } = useNotifications();

  const [name, setName] = React.useState(() => loadAutomationName(automationId));
  const [nodes, setNodes] = React.useState<FlowNode[]>([]);
  const [edges, setEdges] = React.useState<FlowEdge[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [connectFrom, setConnectFrom] = React.useState<string | null>(null);

  const selected = React.useMemo(() => nodes.find((n) => n.id === selectedId) ?? null, [nodes, selectedId]);

  const validate = () => {
    const triggers = nodes.filter((n) => n.kind === "trigger").length;
    const actions = nodes.filter((n) => n.kind === "action").length;
    if (triggers < 1) return "Debe existir al menos 1 trigger.";
    if (actions < 1) return "Debe existir al menos 1 acción.";
    return null;
  };

  const actionsCount = React.useMemo(() => nodes.filter((n) => n.kind === "action").length, [nodes]);
  const triggerName = React.useMemo(() => nodes.find((n) => n.kind === "trigger")?.type ?? "—", [nodes]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("automations")}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <div>
            <div className="text-sm text-black/60 dark:text-white/70">Automation Builder</div>
            <div className="text-xl font-semibold">{name}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const err = validate();
              if (err) showError("Flujo inválido", err);
              else showInfo("OK", "Flujo válido (simulado).");
            }}
          >
            <Play className="h-4 w-4" /> Probar
          </Button>
          <Button
            onClick={() => {
              const err = validate();
              if (err) {
                showError("No se puede guardar", err);
                return;
              }
              saveAutomation(automationId, { name: name.trim() || "Automatización", trigger: triggerName, actionsCount, flow: { nodes, edges } });
              showSuccess("Guardado", "Automatización actualizada.");
            }}
          >
            <Save className="h-4 w-4" /> Guardar
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              setSelectedId(null);
              setConnectFrom(null);
            }}
          >
            <X className="h-4 w-4" /> Limpiar
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Paleta */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Paleta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {palette.map((p) => (
              <button
                key={`${p.kind}_${p.type}`}
                type="button"
                className="w-full rounded-[calc(var(--radius))] border border-app px-3 py-2 text-left text-sm hover:bg-[hsl(var(--secondary))]"
                onClick={() => {
                  const id = uid("node");
                  setNodes((prev) => [
                    ...prev,
                    { id, kind: p.kind, type: p.type, x: 80 + prev.length * 10, y: 80 + prev.length * 10, config: {} },
                  ]);
                  setSelectedId(id);
                }}
              >
                <div className="font-semibold">{p.type}</div>
                <div className="text-xs text-black/60 dark:text-white/70">{p.kind}</div>
              </button>
            ))}
            <div className="mt-2 text-xs text-black/60 dark:text-white/70">
              Tip: click para agregar al canvas. Para conectar: click “Conectar” en un nodo y luego click en otro nodo.
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[520px] w-full overflow-hidden rounded-[calc(var(--radius))] border border-app bg-[hsl(var(--secondary))]">
              {/* Edges (simple lines) */}
              <svg className="absolute inset-0 h-full w-full">
                {edges.map((e) => {
                  const from = nodes.find((n) => n.id === e.from);
                  const to = nodes.find((n) => n.id === e.to);
                  if (!from || !to) return null;
                  return (
                    <line
                      key={e.id}
                      x1={from.x + 60}
                      y1={from.y + 20}
                      x2={to.x + 60}
                      y2={to.y + 20}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      markerEnd="url(#arrow)"
                    />
                  );
                })}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--primary))" />
                  </marker>
                </defs>
              </svg>

              {nodes.map((n) => {
                const active = n.id === selectedId;
                const connecting = connectFrom === n.id;
                return (
                  <div
                    key={n.id}
                    className={`absolute w-36 cursor-pointer rounded-[calc(var(--radius))] border border-app bg-card p-2 shadow-soft ${active ? "ring-2 ring-app" : ""} ${connecting ? "outline outline-2 outline-[hsl(var(--warning))]" : ""}`}
                    style={{ left: n.x, top: n.y }}
                    onMouseDown={(e) => {
                      // Drag dentro del canvas (mouse)
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const ox = n.x;
                      const oy = n.y;
                      const onMove = (ev: MouseEvent) => {
                        setNodes((prev) =>
                          prev.map((x) =>
                            x.id === n.id ? { ...x, x: Math.max(0, Math.min(520, ox + (ev.clientX - startX))), y: Math.max(0, Math.min(460, oy + (ev.clientY - startY))) } : x,
                          ),
                        );
                      };
                      const onUp = () => {
                        window.removeEventListener("mousemove", onMove);
                        window.removeEventListener("mouseup", onUp);
                      };
                      window.addEventListener("mousemove", onMove);
                      window.addEventListener("mouseup", onUp);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectFrom && connectFrom !== n.id) {
                        setEdges((prev) => [...prev, { id: uid("edge"), from: connectFrom, to: n.id }]);
                        setConnectFrom(null);
                        showSuccess("Conexión creada");
                        return;
                      }
                      setSelectedId(n.id);
                    }}
                  >
                    <div className="text-xs text-black/60 dark:text-white/70">{n.kind}</div>
                    <div className="text-sm font-semibold">{n.type}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <button
                        type="button"
                        className="text-xs underline underline-offset-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectFrom((prev) => (prev === n.id ? null : n.id));
                        }}
                      >
                        Conectar
                      </button>
                      <button
                        type="button"
                        className="text-xs text-[hsl(var(--destructive))] underline underline-offset-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEdges((prev) => prev.filter((x) => x.from !== n.id && x.to !== n.id));
                          setNodes((prev) => prev.filter((x) => x.id !== n.id));
                          if (selectedId === n.id) setSelectedId(null);
                        }}
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-black/60 dark:text-white/70">
              <span>Nodos: {nodes.length} · Conexiones: {edges.length}</span>
              <span>Minimap: (simplificado)</span>
            </div>
          </CardContent>
        </Card>

        {/* Config */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Configuración</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {selected ? (
              <>
                <div className="rounded-[calc(var(--radius))] border border-app p-3">
                  <div className="text-xs text-black/60 dark:text-white/70">Nodo seleccionado</div>
                  <div className="mt-1 text-sm font-semibold">{selected.type}</div>
                </div>

                <div className="space-y-2">
                  <Label>Parámetro</Label>
                  <Input
                    value={selected.config.param ?? ""}
                    onChange={(e) =>
                      setNodes((prev) =>
                        prev.map((n) => (n.id === selected.id ? { ...n, config: { ...n.config, param: e.target.value } } : n)),
                      )
                    }
                    placeholder="Ej: email destinatario, nombre tarea..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Detalle</Label>
                  <Textarea
                    value={selected.config.detail ?? ""}
                    onChange={(e) =>
                      setNodes((prev) =>
                        prev.map((n) => (n.id === selected.id ? { ...n, config: { ...n.config, detail: e.target.value } } : n)),
                      )
                    }
                    placeholder="Descripción/plantilla..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo (opcional)</Label>
                  <Select
                    value={selected.type}
                    onValueChange={(v) =>
                      setNodes((prev) => prev.map((n) => (n.id === selected.id ? { ...n, type: v as any } : n)))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {palette.map((p) => (
                        <SelectItem key={`${p.kind}_${p.type}`} value={p.type}>
                          {p.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="text-sm text-black/60 dark:text-white/70">Selecciona un nodo para editar su configuración.</div>
            )}

            <div className="rounded-[calc(var(--radius))] border border-app p-3 text-xs text-black/60 dark:text-white/70">
              Validación: al menos 1 trigger y 1 acción.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


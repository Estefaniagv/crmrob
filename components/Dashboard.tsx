import { Calendar, DollarSign, Plus, Target, TrendingUp, Users } from "lucide-react";
import * as React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "./AppContext";
import { useNavigation } from "./NavigationContext";
import { useNotifications } from "./NotificationContext";
import { IssueForm } from "./forms/IssueForm";
import { TaskForm } from "./forms/TaskForm";
import { NewClientForm } from "./NewClientForm";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Progress } from "./ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { formatCurrencyEUR, formatDate } from "./ui/utils";

type MetricKey = "clientes" | "tareas" | "ingresos";
type RangeKey = "7d" | "30d" | "12m";

function buildSeries(metric: MetricKey, range: RangeKey) {
  const count = range === "7d" ? 7 : range === "30d" ? 30 : 12;
  const now = new Date();
  const points = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === "12m") d.setMonth(d.getMonth() - i);
    else d.setDate(d.getDate() - i);
    const seed = (d.getTime() / 86400000) % 1000;
    const base = metric === "clientes" ? 40 : metric === "tareas" ? 25 : 12000;
    const amp = metric === "ingresos" ? 2500 : 10;
    const value = Math.round(base + (Math.sin(seed) + 1) * (amp / 2) + (seed % 7) * (amp / 20));
    points.push({
      name: range === "12m" ? d.toLocaleString("es-ES", { month: "short" }) : d.toISOString().slice(5, 10),
      value,
    });
  }
  return points;
}

export function Dashboard() {
  const { clients, tasks, issues } = useApp();
  const { navigate } = useNavigation();
  const { showInfo } = useNotifications();

  const activeClients = React.useMemo(() => clients.filter((c) => c.status === "Activo").length, [clients]);
  const pendingTasks = React.useMemo(() => tasks.filter((t) => t.status !== "Done").length, [tasks]);
  const openIssues = React.useMemo(() => issues.filter((i) => i.status !== "Resolved").length, [issues]);
  const monthRevenue = React.useMemo(() => clients.reduce((sum, c) => sum + c.valueEUR, 0), [clients]);

  const [metric, setMetric] = React.useState<MetricKey>("ingresos");
  const [range, setRange] = React.useState<RangeKey>("30d");
  const series = React.useMemo(() => buildSeries(metric, range), [metric, range]);

  const [openNewClient, setOpenNewClient] = React.useState(false);
  const [openNewTask, setOpenNewTask] = React.useState(false);
  const [openNewIssue, setOpenNewIssue] = React.useState(false);

  const recentActivity = React.useMemo(() => {
    const notes = clients.flatMap((c) =>
      c.notes.map((n) => ({
        type: "nota" as const,
        date: n.date,
        title: `${n.type} - ${c.companyName}`,
        detail: n.content,
        clientId: c.id,
      })),
    );
    const t = tasks.map((t) => ({
      type: "tarea" as const,
      date: t.updatedAt,
      title: `Tarea: ${t.title}`,
      detail: `${t.status} · ${t.priority}`,
      clientId: t.clientId,
    }));
    return [...notes, ...t]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [clients, tasks]);

  const goals = [
    { title: "Nuevos clientes", value: 6, target: 10 },
    { title: "Tareas completadas", value: tasks.filter((t) => t.status === "Done").length, target: 12 },
    { title: "Incidencias resueltas", value: issues.filter((i) => i.status === "Resolved").length, target: 5 },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Resumen del negocio y actividad reciente.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Acciones rápidas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setOpenNewClient(true)}>Nuevo Cliente</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpenNewTask(true)}>Crear Tarea</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpenNewIssue(true)}>Reportar Incidencia</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => showInfo("Atajo", "Tip: puedes arrastrar tarjetas en vistas Kanban.")}
              >
                Tips
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Clientes Activos</span>
              <Users className="h-4 w-4 text-black/60 dark:text-white/70" />
            </CardTitle>
            <CardDescription>
              <Badge variant="info">+12%</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{activeClients}</div>
            <div className="mt-2 text-sm text-black/60 dark:text-white/70">En estado “Activo”.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tareas Pendientes</span>
              <TrendingUp className="h-4 w-4 text-black/60 dark:text-white/70" />
            </CardTitle>
            <CardDescription>
              <Badge variant="warning">Tendencia</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{pendingTasks}</div>
            <div className="mt-2 text-sm text-black/60 dark:text-white/70">No completadas.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Incidencias Abiertas</span>
              <Calendar className="h-4 w-4 text-black/60 dark:text-white/70" />
            </CardTitle>
            <CardDescription>
              <Badge variant={openIssues > 0 ? "destructive" : "success"}>{openIssues > 0 ? "Alertas" : "OK"}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{openIssues}</div>
            <div className="mt-2 text-sm text-black/60 dark:text-white/70">Sin resolver.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ingresos (valor)</span>
              <DollarSign className="h-4 w-4 text-black/60 dark:text-white/70" />
            </CardTitle>
            <CardDescription>
              <Badge variant="success">+5%</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrencyEUR(monthRevenue)}</div>
            <div className="mt-2 text-sm text-black/60 dark:text-white/70">Suma de valor por cliente.</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span>Gráfico</span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Métrica" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clientes">Clientes</SelectItem>
                    <SelectItem value="tareas">Tareas</SelectItem>
                    <SelectItem value="ingresos">Ingresos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7d</SelectItem>
                    <SelectItem value="30d">30d</SelectItem>
                    <SelectItem value="12m">12m</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
            <CardDescription>Interactivo y responsivo (Recharts).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <XAxis dataKey="name" />
                  <YAxis width={40} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Objetivos del mes</span>
              <Target className="h-4 w-4 text-black/60 dark:text-white/70" />
            </CardTitle>
            <CardDescription>Progreso estimado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((g) => {
              const pct = Math.round((g.value / g.target) * 100);
              return (
                <div key={g.title} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-black/60 dark:text-white/70">
                      {g.value}/{g.target}
                    </span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
            <Button variant="outline" onClick={() => navigate("tasks")}>
              Ver tareas
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Timeline de acciones y notas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((a, idx) => (
                <button
                  key={`${a.type}_${idx}`}
                  type="button"
                  className="flex w-full items-start gap-3 rounded-[calc(var(--radius))] p-3 text-left hover:bg-[hsl(var(--secondary))]"
                  onClick={() => {
                    if (a.clientId) navigate("clientDetail", { clientId: a.clientId });
                  }}
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{a.title}</span>
                      <span className="shrink-0 text-xs text-black/60 dark:text-white/70">{formatDate(a.date)}</span>
                    </div>
                    <div className="mt-0.5 text-sm text-black/60 dark:text-white/70">{a.detail}</div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modales acciones rápidas */}
      <Dialog open={openNewClient} onOpenChange={setOpenNewClient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>Crear cliente con productos/servicios.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <NewClientForm
              onCreated={(id) => {
                setOpenNewClient(false);
                navigate("clientDetail", { clientId: id });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openNewTask} onOpenChange={setOpenNewTask}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
            <DialogDescription>Crear una tarea y asignarla.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <TaskForm
              onCreated={() => {
                setOpenNewTask(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openNewIssue} onOpenChange={setOpenNewIssue}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Incidencia</DialogTitle>
            <DialogDescription>Reportar una incidencia y darle seguimiento.</DialogDescription>
          </DialogHeader>
          <div className="p-5 pt-0">
            <IssueForm
              onCreated={() => {
                setOpenNewIssue(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


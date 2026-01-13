import { BadgeCheck, Briefcase, Crown, Rocket, Shield, Smile, Star, User, Users } from "lucide-react";
import * as React from "react";
import { useApp } from "./AppContext";
import { useNotifications } from "./NotificationContext";
import { useTheme } from "./ThemeContext";
import { AvatarSelector } from "./AvatarSelector";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Users,
  Briefcase,
  Shield,
  Star,
  Smile,
  Rocket,
  Crown,
  BadgeCheck,
};

export function Profile() {
  const { currentUser, preferences, updateUser, updateUserPreferences } = useApp();
  const { showSuccess } = useNotifications();
  const { darkMode, setDarkMode } = useTheme();

  React.useEffect(() => {
    // Sincroniza preferencia con ThemeContext
    if (preferences.darkMode !== darkMode) setDarkMode(preferences.darkMode);
  }, [preferences.darkMode, darkMode, setDarkMode]);

  const AvatarIcon = currentUser.avatar.type === "icon" ? iconMap[currentUser.avatar.value] ?? User : User;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 lg:pb-6 lg:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Perfil</h1>
          <p className="text-sm text-black/60 dark:text-white/70">Preferencias con guardado automático.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {currentUser.avatar.type === "image" ? (
                <img
                  src={currentUser.avatar.value}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full border border-app object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-app bg-[hsl(var(--secondary))]">
                  <AvatarIcon className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">{currentUser.name}</div>
                <div className="truncate text-sm text-black/60 dark:text-white/70">{currentUser.position}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="secondary">{currentUser.email}</Badge>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <AvatarSelector
                value={currentUser.avatar}
                onChange={(avatar) => {
                  updateUser({ avatar });
                  showSuccess("Avatar actualizado");
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList>
                <TabsTrigger value="personal">Información</TabsTrigger>
                <TabsTrigger value="prefs">Preferencias</TabsTrigger>
                <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Nombre" value={currentUser.name} onChange={(v) => updateUser({ name: v })} />
                  <Field label="Email" type="email" value={currentUser.email} onChange={(v) => updateUser({ email: v })} />
                  <Field label="Teléfono" value={currentUser.phone ?? ""} onChange={(v) => updateUser({ phone: v })} />
                  <Field label="Posición" value={currentUser.position} onChange={(v) => updateUser({ position: v })} />
                  <Field label="Departamento" value={currentUser.department ?? ""} onChange={(v) => updateUser({ department: v })} />
                  <Field label="Ubicación" value={currentUser.location ?? ""} onChange={(v) => updateUser({ location: v })} />
                  <Field label="Empresa" value={currentUser.company ?? ""} onChange={(v) => updateUser({ company: v })} />
                  <div className="md:col-span-2 space-y-2">
                    <Label>Bio</Label>
                    <Textarea value={currentUser.bio ?? ""} onChange={(e) => updateUser({ bio: e.target.value })} />
                    <div className="text-xs text-black/60 dark:text-white/70">Se guarda automáticamente.</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prefs">
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Vista predeterminada para Clientes</Label>
                    <select
                      className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
                      value={preferences.clientsView}
                      onChange={(e) => updateUserPreferences({ clientsView: e.target.value as any })}
                    >
                      <option value="list">Lista</option>
                      <option value="kanban">Kanban</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vista predeterminada para Tareas</Label>
                    <select
                      className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
                      value={preferences.tasksView}
                      onChange={(e) => updateUserPreferences({ tasksView: e.target.value as any })}
                    >
                      <option value="list">Lista</option>
                      <option value="kanban">Kanban</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Visibilidad de tareas</Label>
                    <select
                      className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3 text-sm shadow-sm"
                      value={preferences.tasksVisibility}
                      onChange={(e) => updateUserPreferences({ tasksVisibility: e.target.value as any })}
                    >
                      <option value="all">Todas</option>
                      <option value="mine">Mías</option>
                      <option value="team">Equipo</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-[calc(var(--radius))] border border-app p-3">
                    <div>
                      <div className="text-sm font-medium">Tema oscuro</div>
                      <div className="text-xs text-black/60 dark:text-white/70">Persistencia en localStorage.</div>
                    </div>
                    <Switch
                      aria-label="Tema oscuro"
                      checked={preferences.darkMode}
                      onCheckedChange={(v) => {
                        updateUserPreferences({ darkMode: v });
                        setDarkMode(v);
                      }}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationPrefs />
              </TabsContent>

              <TabsContent value="security">
                <SecurityPrefs />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NotificationPrefs() {
  const { showSuccess } = useNotifications();
  const key = "crm.profile.notifications.v1";
  const [state, setState] = React.useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(key) ?? "null") ?? {
          email: true,
          push: true,
          tasks: true,
          clients: true,
          issues: true,
        }
      );
    } catch {
      return { email: true, push: true, tasks: true, clients: true, issues: true };
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
    <div className="mt-4 space-y-4">
      <div className="rounded-[calc(var(--radius))] border border-app p-4">
        <div className="text-sm font-semibold">Canales</div>
        <div className="mt-3 flex flex-col gap-3">
          <Row label="Email" checked={state.email} onChange={(v) => setState((s: any) => ({ ...s, email: v }))} />
          <Row label="Push" checked={state.push} onChange={(v) => setState((s: any) => ({ ...s, push: v }))} />
        </div>
      </div>
      <div className="rounded-[calc(var(--radius))] border border-app p-4">
        <div className="text-sm font-semibold">Módulos</div>
        <div className="mt-3 flex flex-col gap-3">
          <Row label="Tareas" checked={state.tasks} onChange={(v) => setState((s: any) => ({ ...s, tasks: v }))} />
          <Row label="Clientes" checked={state.clients} onChange={(v) => setState((s: any) => ({ ...s, clients: v }))} />
          <Row label="Incidencias" checked={state.issues} onChange={(v) => setState((s: any) => ({ ...s, issues: v }))} />
        </div>
      </div>
      <Button
        onClick={() => {
          showSuccess("Preferencias guardadas");
        }}
      >
        Guardar (auto)
      </Button>
    </div>
  );
}

function SecurityPrefs() {
  const { showSuccess } = useNotifications();
  const [twoFA, setTwoFA] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPassword2, setNewPassword2] = React.useState("");

  const canChange = currentPassword.length > 0 && newPassword.length >= 6 && newPassword === newPassword2;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between rounded-[calc(var(--radius))] border border-app p-4">
        <div>
          <div className="text-sm font-semibold">Autenticación de dos factores</div>
          <div className="text-xs text-black/60 dark:text-white/70">Simulado.</div>
        </div>
        <Switch aria-label="2FA" checked={twoFA} onCheckedChange={setTwoFA} />
      </div>

      <div className="rounded-[calc(var(--radius))] border border-app p-4">
        <div className="text-sm font-semibold">Cambiar contraseña</div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Contraseña actual</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nueva contraseña</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Repetir nueva contraseña</Label>
            <Input type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            disabled={!canChange}
            onClick={() => {
              showSuccess("Contraseña actualizada (simulado)");
              setCurrentPassword("");
              setNewPassword("");
              setNewPassword2("");
            }}
          >
            Cambiar contraseña
          </Button>
        </div>
      </div>

      <div className="rounded-[calc(var(--radius))] border border-app p-4">
        <div className="text-sm font-semibold">Sesiones</div>
        <div className="mt-2 text-xs text-black/60 dark:text-white/70">
          Cerrar sesión en todos los dispositivos (simulado).
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="destructive" onClick={() => showSuccess("Sesiones cerradas (simulado)")}>
            Cerrar sesión en todos
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch aria-label={label} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}


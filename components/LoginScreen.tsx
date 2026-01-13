import { Eye, EyeOff, Mail } from "lucide-react";
import * as React from "react";
import { useNotifications } from "./NotificationContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const { showSuccess, showInfo } = useNotifications();
  const [mode, setMode] = React.useState<"login" | "recover">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [recoverEmail, setRecoverEmail] = React.useState("");
  const [recoverSent, setRecoverSent] = React.useState(false);

  const canLogin = isValidEmail(email) && password.trim().length > 0;
  const canRecover = isValidEmail(recoverEmail);

  return (
    <div className="min-h-screen bg-app">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Iniciar sesión" : "Recuperar contraseña"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Demo: acepta cualquier email/contraseña válidos."
                : "Introduce tu email y te enviaremos un enlace (simulado)."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canLogin) return;
                  showSuccess("Login exitoso", "Bienvenida/o al CRM Suite.");
                  onLogin(email.trim());
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 dark:text-white/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="maria.garcia@empresa.com"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {!email ? null : !isValidEmail(email) ? (
                    <div className="text-xs text-[hsl(var(--destructive))]">Formato de email inválido.</div>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-[hsl(var(--secondary))]"
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!canLogin}>
                  Entrar
                </Button>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-black/70 underline underline-offset-4 hover:text-app dark:text-white/70"
                    onClick={() => {
                      setMode("recover");
                      setRecoverEmail(email);
                      setRecoverSent(false);
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <button
                    type="button"
                    className="text-sm text-black/70 underline underline-offset-4 hover:text-app dark:text-white/70"
                    onClick={() => {
                      showInfo("Tip", "Puedes usar cualquier credencial en modo demo.");
                    }}
                  >
                    Ayuda
                  </button>
                </div>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!canRecover) return;
                  setRecoverSent(true);
                  showSuccess("Enlace enviado", "Simulación: revisa tu bandeja de entrada.");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="recoverEmail">Email</Label>
                  <Input
                    id="recoverEmail"
                    type="email"
                    placeholder="tu.email@empresa.com"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    required
                  />
                  {recoverEmail && !isValidEmail(recoverEmail) ? (
                    <div className="text-xs text-[hsl(var(--destructive))]">Formato de email inválido.</div>
                  ) : null}
                </div>
                <Button type="submit" className="w-full" disabled={!canRecover}>
                  Enviar enlace
                </Button>
                {recoverSent ? (
                  <div className="rounded-[calc(var(--radius))] border border-app bg-[hsl(var(--secondary))] p-3 text-sm">
                    Si el email existe, recibirás instrucciones en unos minutos.
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  Volver al login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


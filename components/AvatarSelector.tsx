import {
  BadgeCheck,
  Briefcase,
  Crown,
  Rocket,
  Shield,
  Smile,
  Star,
  User,
  Users,
} from "lucide-react";
import * as React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export type AvatarValue = { type: "image" | "icon"; value: string };

const iconOptions = [
  { name: "User", Icon: User },
  { name: "Users", Icon: Users },
  { name: "Briefcase", Icon: Briefcase },
  { name: "Shield", Icon: Shield },
  { name: "Star", Icon: Star },
  { name: "Smile", Icon: Smile },
  { name: "Rocket", Icon: Rocket },
  { name: "Crown", Icon: Crown },
  { name: "BadgeCheck", Icon: BadgeCheck },
];

export function AvatarSelector({
  value,
  onChange,
}: {
  value: AvatarValue;
  onChange: (next: AvatarValue) => void;
}) {
  const [tab, setTab] = React.useState<"icon" | "image">("icon");
  const [preview, setPreview] = React.useState<string>(value.type === "image" ? value.value : "");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="icon">Iconos</TabsTrigger>
            <TabsTrigger value="image">Subir imagen</TabsTrigger>
          </TabsList>

          <TabsContent value="icon">
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {iconOptions.map(({ name, Icon }) => {
                const active = value.type === "icon" && value.value === name;
                return (
                  <button
                    key={name}
                    type="button"
                    className={`flex items-center justify-center rounded-[calc(var(--radius))] border border-app p-3 transition ${active ? "bg-[hsl(var(--secondary))] ring-2 ring-app" : "hover:bg-[hsl(var(--secondary))]"}`}
                    aria-label={`Seleccionar icono ${name}`}
                    onClick={() => onChange({ type: "icon", value: name })}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="image">
            <div className="mt-4 space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const url = String(reader.result ?? "");
                    setPreview(url);
                    onChange({ type: "image", value: url });
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {preview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={preview}
                    alt="Preview avatar"
                    className="h-16 w-16 rounded-full border border-app object-cover"
                  />
                  <Button type="button" variant="outline" onClick={() => { setPreview(""); onChange({ type: "icon", value: "User" }); }}>
                    Quitar imagen
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-black/60 dark:text-white/70">Sube una imagen (se guarda como preview local).</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}


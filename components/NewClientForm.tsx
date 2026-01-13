import * as React from "react";
import { useApp } from "./AppContext";
import { useNotifications } from "./NotificationContext";
import type { ClientStatus } from "./types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

interface ProductRow {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  startDate: string;
}

function uid() {
  return `row_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function NewClientForm({ onCreated }: { onCreated?: (clientId: string) => void }) {
  const { products, addClient } = useApp();
  const { showSuccess, showError } = useNotifications();

  const [companyName, setCompanyName] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<ClientStatus>("Potencial");
  const [sector, setSector] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [rows, setRows] = React.useState<ProductRow[]>([
    { id: uid(), productId: products[0]?.id ?? "", quantity: 1, price: products[0]?.price ?? 0, startDate: new Date().toISOString().slice(0, 10) },
  ]);

  const canSubmit =
    companyName.trim().length > 1 &&
    contactName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim().length > 3;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) {
          showError("Formulario incompleto", "Revisa los campos requeridos.");
          return;
        }

        const clientProducts = rows
          .filter((r) => r.productId && r.quantity > 0)
          .map((r) => {
            const p = products.find((x) => x.id === r.productId);
            return {
              id: "",
              productId: r.productId,
              productName: p?.name ?? "Producto",
              price: r.price,
              quantity: r.quantity,
              startDate: r.startDate,
            };
          });

        const id = addClient({
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          status,
          sector: sector.trim(),
          address: address.trim(),
          lastContact: new Date().toISOString().slice(0, 10),
          products: clientProducts.map((p) => ({ ...p, id: `cp_${Math.random().toString(16).slice(2)}` })),
          notes: [],
        });

        showSuccess("Cliente creado", "Se agregó correctamente.");
        onCreated?.(id);
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Empresa *</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Contacto *</Label>
          <Input value={contactName} onChange={(e) => setContactName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Teléfono *</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
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
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, ciudad..." />
      </div>

      <div className="space-y-2">
        <Label>Productos/Servicios</Label>
        <div className="overflow-x-auto rounded-[calc(var(--radius))] border border-app">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-[hsl(var(--secondary))] text-left">
              <tr>
                <th className="p-2">Producto</th>
                <th className="p-2">Precio (€)</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Fecha inicio</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-app">
                  <td className="p-2">
                    <select
                      className="h-10 w-full rounded-[calc(var(--radius))] border border-app bg-transparent px-3"
                      value={r.productId}
                      onChange={(e) => {
                        const productId = e.target.value;
                        const p = products.find((x) => x.id === productId);
                        setRows((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, productId, price: p?.price ?? 0 } : x)),
                        );
                      }}
                    >
                      <option value="">(sin producto)</option>
                      {products
                        .filter((p) => p.active)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      value={r.price}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, price: Number(e.target.value) } : x)),
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={1}
                      value={r.quantity}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, quantity: Number(e.target.value) } : x)),
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="date"
                      value={r.startDate}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, startDate: e.target.value } : x)),
                        )
                      }
                    />
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setRows((prev) => prev.filter((x) => x.id !== r.id))}
                      disabled={rows.length === 1}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="button" variant="outline" onClick={() => setRows((prev) => [...prev, { id: uid(), productId: "", quantity: 1, price: 0, startDate: new Date().toISOString().slice(0, 10) }])}>
          Agregar producto
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!canSubmit}>
          Crear cliente
        </Button>
      </div>
    </form>
  );
}


import * as React from "react";
import { useApp } from "./AppContext";
import { useNotifications } from "./NotificationContext";
import type { TerminalStatus } from "./types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface Row {
  id: string;
  serialNumber: string;
  model: string;
  orderDate: string;
  notes: string;
  status: TerminalStatus;
}

function uid() {
  return `row_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function BulkTerminalsForm({
  clientId,
  onSaved,
}: {
  clientId?: string;
  onSaved?: (terminalIds: string[]) => void;
}) {
  const { addTerminalsBulk } = useApp();
  const { showSuccess, showError } = useNotifications();
  const [rows, setRows] = React.useState<Row[]>([
    {
      id: uid(),
      serialNumber: "",
      model: "",
      orderDate: new Date().toISOString().slice(0, 10),
      notes: "",
      status: "Pedido",
    },
  ]);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { id: uid(), serialNumber: "", model: "", orderDate: new Date().toISOString().slice(0, 10), notes: "", status: "Pedido" },
    ]);

  const removeRow = (id: string) => setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));

  const isValidRow = (r: Row) =>
    r.serialNumber.trim().length > 2 && r.model.trim().length > 2 && r.orderDate.trim().length === 10;

  const canSave = rows.every(isValidRow);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Agregar terminales en bulk</div>
          <div className="text-xs text-black/60 dark:text-white/70">Todos los campos marcados son requeridos.</div>
        </div>
        <Button type="button" variant="outline" onClick={addRow}>
          Agregar fila
        </Button>
      </div>

      <div className="overflow-x-auto rounded-[calc(var(--radius))] border border-app">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-[hsl(var(--secondary))] text-left">
            <tr>
              <th className="p-2">Número de serie *</th>
              <th className="p-2">Modelo *</th>
              <th className="p-2">Fecha pedido *</th>
              <th className="p-2">Notas</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-app">
                <td className="p-2">
                  <Input
                    value={r.serialNumber}
                    onChange={(e) =>
                      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, serialNumber: e.target.value } : x)))
                    }
                    placeholder="SN-1234"
                    required
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={r.model}
                    onChange={(e) =>
                      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, model: e.target.value } : x)))
                    }
                    placeholder="PAX A920"
                    required
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="date"
                    value={r.orderDate}
                    onChange={(e) =>
                      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, orderDate: e.target.value } : x)))
                    }
                    required
                  />
                </td>
                <td className="p-2">
                  <Textarea
                    className="min-h-10"
                    value={r.notes}
                    onChange={(e) =>
                      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, notes: e.target.value } : x)))
                    }
                    placeholder="Observaciones..."
                  />
                </td>
                <td className="p-2 text-right">
                  <Button type="button" variant="ghost" onClick={() => removeRow(r.id)} disabled={rows.length === 1}>
                    Eliminar fila
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canSave ? (
        <div className="rounded-[calc(var(--radius))] border border-app bg-[hsl(var(--secondary))] p-3 text-sm">
          <Label>Validación</Label>
          <div className="text-xs text-black/60 dark:text-white/70">
            Revisa que cada fila tenga serial, modelo y fecha de pedido.
          </div>
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={() => {
            if (!canSave) {
              showError("Errores en el formulario", "Completa todos los campos requeridos.");
              return;
            }
            const terminalIds = addTerminalsBulk(
              clientId,
              rows.map((r) => ({
                serialNumber: r.serialNumber.trim(),
                model: r.model.trim(),
                orderDate: r.orderDate,
                status: r.status,
                clientId,
                notes: r.notes.trim(),
              })),
            );
            showSuccess("Terminales guardados", `Se agregaron ${terminalIds.length} terminales.`);
            onSaved?.(terminalIds);
            setRows([{ id: uid(), serialNumber: "", model: "", orderDate: new Date().toISOString().slice(0, 10), notes: "", status: "Pedido" }]);
          }}
          disabled={!canSave}
        >
          Guardar terminales
        </Button>
      </div>
    </div>
  );
}


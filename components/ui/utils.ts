export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrencyEUR(value: number): string {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
  } catch {
    return `${value.toFixed(2)} €`;
  }
}

export function formatDate(value: Date | string | number): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("es-ES", { year: "numeric", month: "short", day: "2-digit" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}


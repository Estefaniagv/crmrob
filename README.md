# CRM Suite (Demo)

CRM Suite minimalista tipo “mini HubSpot” para pymes. Todo es **front-end** (sin backend) con **mock data**, persistencia en `localStorage`, tema claro/oscuro, notificaciones, navegación interna y vistas Kanban con drag & drop.

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Notas

- **Login demo**: acepta cualquier email válido + contraseña no vacía.
- **Persistencia**: preferencias, tema, auth demo y datos del CRM se guardan en `localStorage`.
- **Navegación**: rutas tipo `/clients/:id` (deep linking interno con History API).


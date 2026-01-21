export type ID = string;

export type ClientStatus = "Potencial" | "Activo" | "Perdido";
export type TaskStatus = "To Do" | "In Progress" | "Done";
export type IssueStatus = "Open" | "In Progress" | "Resolved";
export type TerminalStatus = "Pedido" | "Recibido" | "Enviado" | "Instalado";

export type TaskPriority = "Low" | "Medium" | "High";
export type IssuePriority = "Low" | "Medium" | "High" | "Urgent";

export type ActivityType = "Llamada" | "Email" | "WhatsApp" | "Reunión";

export interface ClientProduct {
  id: ID;
  productId: ID;
  productName: string;
  price: number;
  quantity: number;
  startDate: string; // ISO date
}

export interface ClientActivityNote {
  id: ID;
  date: string; // ISO
  type: ActivityType;
  content: string;
}

export interface Client {
  id: ID;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: ClientStatus;
  valueEUR: number;
  lastContact: string; // ISO
  address: string;
  sector: string;
  avatarUrl?: string;
  products: ClientProduct[];
  notes: ClientActivityNote[];
  custom?: Record<string, string | number | boolean | null>;
}

export interface TaskTypeConfig {
  id: ID;
  name: string;
  colorHsl: string; // e.g. "221 83% 53%"
  icon: "Phone" | "Users" | "FileText" | "Clock";
}

export interface Task {
  id: ID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  typeId: ID;
  assignedTo: "me" | "team" | "all";
  dueDate: string; // ISO date
  clientId?: ID;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Issue {
  id: ID;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  clientId?: ID;
  reporter: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface Terminal {
  id: ID;
  serialNumber: string;
  model: string;
  clientId?: ID;
  status: TerminalStatus;
  orderDate: string; // ISO date
  receivedDate?: string; // ISO date
  shippedDate?: string; // ISO date
  installedDate?: string; // ISO date
  notes?: string;
  updatedAt: string; // ISO
}

export interface Product {
  id: ID;
  name: string;
  price: number;
  description: string;
  active: boolean;
}

export type CustomFieldType = "text" | "number" | "date" | "select";

export interface CustomField {
  id: ID;
  name: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[];
  order: number;
}

export interface UserPreferences {
  clientsView: "list" | "kanban";
  tasksView: "list" | "kanban";
  tasksVisibility: "all" | "mine" | "team";
  darkMode: boolean;
}

export interface CurrentUser {
  id: ID;
  name: string;
  email: string;
  position: string;
  phone?: string;
  department?: string;
  location?: string;
  company?: string;
  bio?: string;
  avatar: { type: "image" | "icon"; value: string };
}

export interface NotificationItem {
  id: ID;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  createdAt: string;
  read: boolean;
}


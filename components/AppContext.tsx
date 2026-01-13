import * as React from "react";
import { safeGetLocalStorage, safeJsonParse, safeSetLocalStorage } from "./storage";
import type {
  Client,
  ClientActivityNote,
  ClientProduct,
  CustomField,
  CurrentUser,
  ID,
  Issue,
  Product,
  Task,
  TaskTypeConfig,
  Terminal,
  TerminalStatus,
  UserPreferences,
} from "./types";

const DATA_KEY = "crm.data.v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export interface AppState {
  clients: Client[];
  tasks: Task[];
  issues: Issue[];
  terminals: Terminal[];
  products: Product[];
  taskTypes: TaskTypeConfig[];
  customFields: CustomField[];
  currentUser: CurrentUser;
  preferences: UserPreferences;
}

function createInitialState(): AppState {
  const products: Product[] = [
    { id: "prod_crm", name: "Software CRM", price: 500, description: "Licencia mensual CRM", active: true },
    { id: "prod_consult", name: "Consultoría Digital", price: 1500, description: "Proyecto de consultoría", active: true },
    { id: "prod_support", name: "Soporte Premium", price: 200, description: "Soporte prioritario", active: true },
    { id: "prod_training", name: "Formación", price: 800, description: "Formación al equipo", active: true },
  ];

  const taskTypes: TaskTypeConfig[] = [
    { id: "type_call", name: "Llamada", colorHsl: "221 83% 53%", icon: "Phone" },
    { id: "type_meeting", name: "Reunión", colorHsl: "142 71% 45%", icon: "Users" },
    { id: "type_proposal", name: "Propuesta", colorHsl: "38 92% 50%", icon: "FileText" },
    { id: "type_followup", name: "Seguimiento", colorHsl: "270 95% 75%", icon: "Clock" },
  ];

  const clients: Client[] = [
    {
      id: "cli_alpha",
      companyName: "Alpha Retail S.L.",
      contactName: "Carlos Pérez",
      email: "carlos@alpha-retail.com",
      phone: "+34 600 111 222",
      status: "Activo",
      valueEUR: 2300,
      lastContact: daysAgoISO(3),
      address: "C/ Gran Vía 123, Madrid",
      sector: "Retail",
      products: [
        { id: "cp1", productId: "prod_crm", productName: "Software CRM", price: 500, quantity: 2, startDate: daysAgoISO(20) },
      ],
      notes: [
        { id: "n1", date: daysAgoISO(3), type: "Llamada", content: "Revisión de necesidades y próximos pasos." },
      ],
    },
    {
      id: "cli_beta",
      companyName: "Beta Logistics",
      contactName: "Lucía Gómez",
      email: "lucia@beta-logistics.com",
      phone: "+34 600 333 444",
      status: "Potencial",
      valueEUR: 1500,
      lastContact: daysAgoISO(7),
      address: "Av. Andalucía 45, Sevilla",
      sector: "Logística",
      products: [],
      notes: [{ id: "n2", date: daysAgoISO(7), type: "Email", content: "Enviada propuesta inicial." }],
    },
    {
      id: "cli_gamma",
      companyName: "Gamma Studio",
      contactName: "Ana Ruiz",
      email: "ana@gamma-studio.com",
      phone: "+34 600 555 666",
      status: "Activo",
      valueEUR: 700,
      lastContact: daysAgoISO(1),
      address: "C/ Valencia 9, Barcelona",
      sector: "Servicios",
      products: [{ id: "cp2", productId: "prod_support", productName: "Soporte Premium", price: 200, quantity: 1, startDate: daysAgoISO(10) }],
      notes: [{ id: "n3", date: daysAgoISO(1), type: "WhatsApp", content: "Confirmación de instalación de terminal." }],
    },
    {
      id: "cli_delta",
      companyName: "Delta Foods",
      contactName: "Miguel Torres",
      email: "miguel@delta-foods.com",
      phone: "+34 600 777 888",
      status: "Perdido",
      valueEUR: 0,
      lastContact: daysAgoISO(40),
      address: "Pol. Industrial Norte, Valencia",
      sector: "Alimentación",
      products: [],
      notes: [{ id: "n4", date: daysAgoISO(40), type: "Reunión", content: "No encaja presupuesto en este trimestre." }],
    },
  ];

  const tasks: Task[] = [
    {
      id: "tsk_1",
      title: "Llamar a Beta Logistics",
      description: "Confirmar alcance y fechas de implementación.",
      status: "To Do",
      priority: "High",
      typeId: "type_call",
      assignedTo: "me",
      dueDate: daysAgoISO(-1),
      clientId: "cli_beta",
      createdAt: daysAgoISO(2),
      updatedAt: daysAgoISO(2),
    },
    {
      id: "tsk_2",
      title: "Preparar propuesta Gamma Studio",
      description: "Enviar propuesta para formación.",
      status: "In Progress",
      priority: "Medium",
      typeId: "type_proposal",
      assignedTo: "team",
      dueDate: daysAgoISO(5),
      clientId: "cli_gamma",
      createdAt: daysAgoISO(6),
      updatedAt: daysAgoISO(1),
    },
    {
      id: "tsk_3",
      title: "Revisar pipeline terminales",
      description: "Validar estados y fechas.",
      status: "Done",
      priority: "Low",
      typeId: "type_followup",
      assignedTo: "all",
      dueDate: daysAgoISO(10),
      createdAt: daysAgoISO(12),
      updatedAt: daysAgoISO(9),
    },
  ];

  const issues: Issue[] = [
    {
      id: "iss_1",
      title: "Terminal no conecta a red",
      description: "Cliente reporta problemas intermitentes de conectividad.",
      status: "Open",
      priority: "High",
      clientId: "cli_alpha",
      reporter: "María García",
      createdAt: daysAgoISO(1),
      updatedAt: daysAgoISO(1),
    },
    {
      id: "iss_2",
      title: "Error en sincronización de datos",
      description: "La app muestra datos desactualizados en reportes.",
      status: "In Progress",
      priority: "Medium",
      clientId: "cli_gamma",
      reporter: "María García",
      createdAt: daysAgoISO(4),
      updatedAt: daysAgoISO(2),
    },
  ];

  const models = ["Ingenico iCT250", "Verifone V400m", "PAX A920"];
  const terminals: Terminal[] = Array.from({ length: 10 }).map((_, i) => {
    const status: TerminalStatus =
      i < 3 ? "Pedido" : i < 6 ? "Recibido" : i < 8 ? "Enviado" : "Instalado";
    const model = models[i % models.length]!;
    const serialNumber = `SN-${1000 + i}`;
    const base: Terminal = {
      id: `tpv_${i}`,
      serialNumber,
      model,
      clientId: i % 2 === 0 ? "cli_alpha" : i % 3 === 0 ? "cli_gamma" : undefined,
      status,
      orderDate: daysAgoISO(20 - i),
      notes: i % 4 === 0 ? "Requiere revisión de accesorios" : "",
      updatedAt: new Date().toISOString(),
    };
    if (status === "Recibido" || status === "Enviado" || status === "Instalado") base.receivedDate = daysAgoISO(10 - i);
    if (status === "Enviado" || status === "Instalado") base.shippedDate = daysAgoISO(6 - i);
    if (status === "Instalado") base.installedDate = daysAgoISO(2 - i);
    return base;
  });

  const customFields: CustomField[] = [
    { id: "cf_1", name: "Tamaño empresa", type: "select", required: false, options: ["1-10", "11-50", "51-200", "200+"], order: 1 },
    { id: "cf_2", name: "NIF", type: "text", required: false, order: 2 },
  ];

  const currentUser: CurrentUser = {
    id: "usr_maria",
    name: "María García",
    email: "maria.garcia@empresa.com",
    position: "Account Manager",
    avatar: { type: "icon", value: "User" },
    phone: "+34 600 999 000",
    department: "Ventas",
    location: "Madrid",
    company: "Empresa S.A.",
    bio: "Me enfoco en impulsar crecimiento en pymes con procesos simples y medibles.",
  };

  const preferences: UserPreferences = {
    clientsView: "list",
    tasksView: "kanban",
    tasksVisibility: "all",
    darkMode: false,
  };

  return { clients, tasks, issues, terminals, products, taskTypes, customFields, currentUser, preferences };
}

function computeClientValue(products: ClientProduct[]): number {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
}

interface AppContextValue extends AppState {
  // Clientes
  addClient: (client: Omit<Client, "id" | "products" | "notes" | "valueEUR"> & { products?: ClientProduct[]; notes?: ClientActivityNote[] }) => ID;
  updateClient: (id: ID, patch: Partial<Client>) => void;
  deleteClient: (id: ID) => void;
  bulkUpdateClientStatus: (ids: ID[], status: Client["status"]) => void;
  bulkDeleteClients: (ids: ID[]) => void;
  addClientProduct: (clientId: ID, product: Omit<ClientProduct, "id" | "productName">) => void;
  updateClientProduct: (clientId: ID, productId: ID, patch: Partial<ClientProduct>) => void;
  removeClientProduct: (clientId: ID, clientProductId: ID) => void;
  addNote: (clientId: ID, note: Omit<ClientActivityNote, "id" | "date"> & { date?: string }) => void;
  updateNote: (clientId: ID, noteId: ID, patch: Partial<ClientActivityNote>) => void;
  deleteNote: (clientId: ID, noteId: ID) => void;

  // Tareas
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => ID;
  updateTask: (id: ID, patch: Partial<Task>) => void;
  deleteTask: (id: ID) => void;

  // Incidencias
  addIssue: (issue: Omit<Issue, "id" | "createdAt" | "updatedAt">) => ID;
  updateIssue: (id: ID, patch: Partial<Issue>) => void;
  deleteIssue: (id: ID) => void;

  // Terminales
  addTerminal: (terminal: Omit<Terminal, "id" | "updatedAt">) => ID;
  addTerminalsBulk: (clientId: ID | undefined, terminals: Array<Omit<Terminal, "id" | "updatedAt">>) => ID[];
  updateTerminal: (id: ID, patch: Partial<Terminal>) => void;
  deleteTerminal: (id: ID) => void;
  advanceTerminalStatus: (id: ID) => void;

  // Productos / Tipos / Campos
  addProduct: (product: Omit<Product, "id">) => ID;
  updateProduct: (id: ID, patch: Partial<Product>) => void;
  deleteProduct: (id: ID) => void;

  addTaskType: (type: Omit<TaskTypeConfig, "id">) => ID;
  updateTaskType: (id: ID, patch: Partial<TaskTypeConfig>) => void;
  deleteTaskType: (id: ID) => void;

  addCustomField: (field: Omit<CustomField, "id">) => ID;
  updateCustomField: (id: ID, patch: Partial<CustomField>) => void;
  deleteCustomField: (id: ID) => void;
  reorderCustomFields: (idsInOrder: ID[]) => void;

  // Usuario / Preferencias
  updateUser: (patch: Partial<CurrentUser>) => void;
  updateUserPreferences: (patch: Partial<UserPreferences>) => void;
  resetAllData: () => void;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(() => {
    const saved = safeJsonParse<AppState>(safeGetLocalStorage(DATA_KEY));
    return saved ?? createInitialState();
  });

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== DATA_KEY) return;
      const saved = safeJsonParse<AppState>(e.newValue);
      if (saved) setState(saved);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = React.useCallback((next: AppState) => {
    safeSetLocalStorage(DATA_KEY, JSON.stringify(next));
  }, []);

  const setNext = React.useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  // Clientes
  const addClient = React.useCallback<AppContextValue["addClient"]>((client) => {
    const id = uid("cli");
    setNext((prev) => {
      const products = client.products ?? [];
      const notes = client.notes ?? [];
      const valueEUR = computeClientValue(products);
      return {
        ...prev,
        clients: [
          {
            ...client,
            id,
            products,
            notes,
            valueEUR,
          },
          ...prev.clients,
        ],
      };
    });
    return id;
  }, [setNext]);

  const updateClient = React.useCallback<AppContextValue["updateClient"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== id) return c;
        const next = { ...c, ...patch };
        // Si cambian productos, recalcular valor
        if (patch.products) next.valueEUR = computeClientValue(patch.products);
        return next;
      }),
    }));
  }, [setNext]);

  const deleteClient = React.useCallback<AppContextValue["deleteClient"]>((id) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
      tasks: prev.tasks.map((t) => (t.clientId === id ? { ...t, clientId: undefined } : t)),
      issues: prev.issues.map((i) => (i.clientId === id ? { ...i, clientId: undefined } : i)),
      terminals: prev.terminals.map((t) => (t.clientId === id ? { ...t, clientId: undefined } : t)),
    }));
  }, [setNext]);

  const bulkUpdateClientStatus = React.useCallback<AppContextValue["bulkUpdateClientStatus"]>((ids, status) => {
    const idSet = new Set(ids);
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (idSet.has(c.id) ? { ...c, status } : c)),
    }));
  }, [setNext]);

  const bulkDeleteClients = React.useCallback<AppContextValue["bulkDeleteClients"]>((ids) => {
    ids.forEach((id) => deleteClient(id));
  }, [deleteClient]);

  const addClientProduct = React.useCallback<AppContextValue["addClientProduct"]>((clientId, product) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const productEntity = prev.products.find((p) => p.id === product.productId);
        const nextProducts = [
          ...c.products,
          {
            id: uid("cp"),
            productId: product.productId,
            productName: productEntity?.name ?? "Producto",
            price: product.price,
            quantity: product.quantity,
            startDate: product.startDate,
          },
        ];
        return { ...c, products: nextProducts, valueEUR: computeClientValue(nextProducts) };
      }),
    }));
  }, [setNext]);

  const updateClientProduct = React.useCallback<AppContextValue["updateClientProduct"]>((clientId, clientProductId, patch) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const nextProducts = c.products.map((p) => (p.id === clientProductId ? { ...p, ...patch } : p));
        return { ...c, products: nextProducts, valueEUR: computeClientValue(nextProducts) };
      }),
    }));
  }, [setNext]);

  const removeClientProduct = React.useCallback<AppContextValue["removeClientProduct"]>((clientId, clientProductId) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const nextProducts = c.products.filter((p) => p.id !== clientProductId);
        return { ...c, products: nextProducts, valueEUR: computeClientValue(nextProducts) };
      }),
    }));
  }, [setNext]);

  const addNote = React.useCallback<AppContextValue["addNote"]>((clientId, note) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        const nextNotes = [
          { id: uid("note"), date: note.date ?? new Date().toISOString(), type: note.type, content: note.content },
          ...c.notes,
        ];
        return { ...c, notes: nextNotes };
      }),
    }));
  }, [setNext]);

  const updateNote = React.useCallback<AppContextValue["updateNote"]>((clientId, noteId, patch) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, notes: c.notes.map((n) => (n.id === noteId ? { ...n, ...patch } : n)) };
      }),
    }));
  }, [setNext]);

  const deleteNote = React.useCallback<AppContextValue["deleteNote"]>((clientId, noteId) => {
    setNext((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === clientId ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c)),
    }));
  }, [setNext]);

  // Tareas
  const addTask = React.useCallback<AppContextValue["addTask"]>((task) => {
    const id = uid("tsk");
    const now = new Date().toISOString();
    setNext((prev) => ({ ...prev, tasks: [{ ...task, id, createdAt: now, updatedAt: now }, ...prev.tasks] }));
    return id;
  }, [setNext]);

  const updateTask = React.useCallback<AppContextValue["updateTask"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)),
    }));
  }, [setNext]);

  const deleteTask = React.useCallback<AppContextValue["deleteTask"]>((id) => {
    setNext((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
  }, [setNext]);

  // Incidencias
  const addIssue = React.useCallback<AppContextValue["addIssue"]>((issue) => {
    const id = uid("iss");
    const now = new Date().toISOString();
    setNext((prev) => ({ ...prev, issues: [{ ...issue, id, createdAt: now, updatedAt: now }, ...prev.issues] }));
    return id;
  }, [setNext]);

  const updateIssue = React.useCallback<AppContextValue["updateIssue"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      issues: prev.issues.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i)),
    }));
  }, [setNext]);

  const deleteIssue = React.useCallback<AppContextValue["deleteIssue"]>((id) => {
    setNext((prev) => ({ ...prev, issues: prev.issues.filter((i) => i.id !== id) }));
  }, [setNext]);

  // Terminales
  const addTerminal = React.useCallback<AppContextValue["addTerminal"]>((terminal) => {
    const id = uid("tpv");
    setNext((prev) => ({
      ...prev,
      terminals: [{ ...terminal, id, updatedAt: new Date().toISOString() }, ...prev.terminals],
    }));
    return id;
  }, [setNext]);

  const addTerminalsBulk = React.useCallback<AppContextValue["addTerminalsBulk"]>((clientId, terminals) => {
    const ids: ID[] = [];
    terminals.forEach((t) => {
      const id = addTerminal({ ...t, clientId });
      ids.push(id);
    });
    return ids;
  }, [addTerminal]);

  const updateTerminal = React.useCallback<AppContextValue["updateTerminal"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      terminals: prev.terminals.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)),
    }));
  }, [setNext]);

  const deleteTerminal = React.useCallback<AppContextValue["deleteTerminal"]>((id) => {
    setNext((prev) => ({ ...prev, terminals: prev.terminals.filter((t) => t.id !== id) }));
  }, [setNext]);

  const advanceTerminalStatus = React.useCallback<AppContextValue["advanceTerminalStatus"]>((id) => {
    setNext((prev) => ({
      ...prev,
      terminals: prev.terminals.map((t) => {
        if (t.id !== id) return t;
        const now = todayISO();
        if (t.status === "Pedido") return { ...t, status: "Recibido", receivedDate: now, updatedAt: new Date().toISOString() };
        if (t.status === "Recibido") return { ...t, status: "Enviado", shippedDate: now, updatedAt: new Date().toISOString() };
        if (t.status === "Enviado") return { ...t, status: "Instalado", installedDate: now, updatedAt: new Date().toISOString() };
        return t;
      }),
    }));
  }, [setNext]);

  // Productos / Tipos / Campos
  const addProduct = React.useCallback<AppContextValue["addProduct"]>((product) => {
    const id = uid("prod");
    setNext((prev) => ({ ...prev, products: [{ ...product, id }, ...prev.products] }));
    return id;
  }, [setNext]);

  const updateProduct = React.useCallback<AppContextValue["updateProduct"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, [setNext]);

  const deleteProduct = React.useCallback<AppContextValue["deleteProduct"]>((id) => {
    setNext((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, [setNext]);

  const addTaskType = React.useCallback<AppContextValue["addTaskType"]>((type) => {
    const id = uid("type");
    setNext((prev) => ({ ...prev, taskTypes: [{ ...type, id }, ...prev.taskTypes] }));
    return id;
  }, [setNext]);

  const updateTaskType = React.useCallback<AppContextValue["updateTaskType"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      taskTypes: prev.taskTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, [setNext]);

  const deleteTaskType = React.useCallback<AppContextValue["deleteTaskType"]>((id) => {
    setNext((prev) => ({ ...prev, taskTypes: prev.taskTypes.filter((t) => t.id !== id) }));
  }, [setNext]);

  const addCustomField = React.useCallback<AppContextValue["addCustomField"]>((field) => {
    const id = uid("cf");
    setNext((prev) => ({ ...prev, customFields: [...prev.customFields, { ...field, id }].sort((a, b) => a.order - b.order) }));
    return id;
  }, [setNext]);

  const updateCustomField = React.useCallback<AppContextValue["updateCustomField"]>((id, patch) => {
    setNext((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)).sort((a, b) => a.order - b.order),
    }));
  }, [setNext]);

  const deleteCustomField = React.useCallback<AppContextValue["deleteCustomField"]>((id) => {
    setNext((prev) => ({ ...prev, customFields: prev.customFields.filter((f) => f.id !== id) }));
  }, [setNext]);

  const reorderCustomFields = React.useCallback<AppContextValue["reorderCustomFields"]>((idsInOrder) => {
    setNext((prev) => {
      const index = new Map(idsInOrder.map((id, idx) => [id, idx]));
      const next = prev.customFields
        .map((f) => ({ ...f, order: (index.get(f.id) ?? f.order) + 1 }))
        .sort((a, b) => a.order - b.order);
      return { ...prev, customFields: next };
    });
  }, [setNext]);

  // Usuario / Preferencias
  const updateUser = React.useCallback<AppContextValue["updateUser"]>((patch) => {
    setNext((prev) => ({ ...prev, currentUser: { ...prev.currentUser, ...patch } }));
  }, [setNext]);

  const updateUserPreferences = React.useCallback<AppContextValue["updateUserPreferences"]>((patch) => {
    setNext((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }));
  }, [setNext]);

  const resetAllData = React.useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
    persist(fresh);
  }, [persist]);

  const value: AppContextValue = React.useMemo(
    () => ({
      ...state,
      addClient,
      updateClient,
      deleteClient,
      bulkUpdateClientStatus,
      bulkDeleteClients,
      addClientProduct,
      updateClientProduct,
      removeClientProduct,
      addNote,
      updateNote,
      deleteNote,
      addTask,
      updateTask,
      deleteTask,
      addIssue,
      updateIssue,
      deleteIssue,
      addTerminal,
      addTerminalsBulk,
      updateTerminal,
      deleteTerminal,
      advanceTerminalStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      addTaskType,
      updateTaskType,
      deleteTaskType,
      addCustomField,
      updateCustomField,
      deleteCustomField,
      reorderCustomFields,
      updateUser,
      updateUserPreferences,
      resetAllData,
    }),
    [
      state,
      addClient,
      updateClient,
      deleteClient,
      bulkUpdateClientStatus,
      bulkDeleteClients,
      addClientProduct,
      updateClientProduct,
      removeClientProduct,
      addNote,
      updateNote,
      deleteNote,
      addTask,
      updateTask,
      deleteTask,
      addIssue,
      updateIssue,
      deleteIssue,
      addTerminal,
      addTerminalsBulk,
      updateTerminal,
      deleteTerminal,
      advanceTerminalStatus,
      addProduct,
      updateProduct,
      deleteProduct,
      addTaskType,
      updateTaskType,
      deleteTaskType,
      addCustomField,
      updateCustomField,
      deleteCustomField,
      reorderCustomFields,
      updateUser,
      updateUserPreferences,
      resetAllData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
}


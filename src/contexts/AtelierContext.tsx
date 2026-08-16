import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import orderWedding from "@/assets/order-wedding.jpg";
import orderSuit from "@/assets/order-suit.jpg";
import orderAgbada from "@/assets/order-agbada.jpg";

// ---------- Types ----------
export type OrderStatus = "requested" | "active" | "completed" | "declined";
export type DeliveryMethod = "pickup" | "delivery";
export type DeliveryStatus = "pending" | "ready" | "out_for_delivery" | "received";
export type ContactChannel = "sms" | "whatsapp" | "email";
export type MeasurementUnit = "in" | "cm";
export type TaskStatus = "not_started" | "in_progress" | "completed";
export type TaskPriority = "normal" | "urgent";

// ---------- Per-order materials tracking ----------
export type MaterialSource = "procure" | "client";
export type OrderMaterialStatus = "needed" | "ordered" | "dropped_off" | "received";

export interface MaterialConfirmation {
  at: number;
  byName: string;
  byRole: "designer" | "worker";
  photo?: string; // base64 data URL proof of receipt
}

export interface OrderMaterial {
  id: string;
  name: string;
  source: MaterialSource;
  neededBy?: string; // ISO date (yyyy-mm-dd)
  requiredToStart: boolean;
  status: OrderMaterialStatus;
  droppedOffAt?: number; // client marked as dropped off
  confirmation?: MaterialConfirmation;
  createdAt: number;
}

export const MATERIAL_STATUS_LABEL: Record<OrderMaterialStatus, string> = {
  needed: "Needed",
  ordered: "Ordered",
  dropped_off: "Client dropped off",
  received: "Received",
};

// The flow differs by where the material comes from.
export const materialFlow = (source: MaterialSource): OrderMaterialStatus[] =>
  source === "client"
    ? ["needed", "dropped_off", "received"]
    : ["needed", "ordered", "received"];

export interface MaterialsProgress {
  total: number;
  received: number;
  requiredTotal: number;
  requiredReceived: number;
  ready: boolean;          // all "required to start" items received
  waitingOn: string[];     // names of required items not yet received
  waitingOnClient: number; // outstanding client-supplied items
  waitingOnUs: number;     // outstanding items we must procure
}

export const materialsProgress = (list?: OrderMaterial[]): MaterialsProgress => {
  const items = list || [];
  const required = items.filter((m) => m.requiredToStart);
  const outstanding = items.filter((m) => m.status !== "received");
  return {
    total: items.length,
    received: items.filter((m) => m.status === "received").length,
    requiredTotal: required.length,
    requiredReceived: required.filter((m) => m.status === "received").length,
    ready: items.length === 0 || required.every((m) => m.status === "received"),
    waitingOn: required.filter((m) => m.status !== "received").map((m) => m.name),
    waitingOnClient: outstanding.filter((m) => m.source === "client").length,
    waitingOnUs: outstanding.filter((m) => m.source === "procure").length,
  };
};

// Items whose needed-by date is within `days` and that aren't confirmed yet.
export const materialsDueSoon = (list: OrderMaterial[] | undefined, days = 3) => {
  const limit = Date.now() + days * 86400000;
  return (list || []).filter((m) =>
    m.status !== "received" && m.neededBy && new Date(m.neededBy).getTime() <= limit);
};

export interface StageHistoryEntry {
  stageIdx: number;
  stage: string;
  timestamp: number;
  photoUrl?: string;
  workerId?: string;
  workerName?: string;
}

export interface WorkerTask {
  id: string;
  orderId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  title: string;
  deadline: string;
  stageIdx?: number; // links task to a production stage on the parent order
  status: TaskStatus;
  priority: TaskPriority;
  images: string[]; // base64 data URLs of finished-work photos
  createdAt: string;
  flaggedAt?: string;
  flagReason?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  gender: string;
  notes: string;
  initials: string;
  joined: string;
  referralSource?: string;
  address?: string;
  preferredChannel?: ContactChannel;
}

export interface Measurement {
  id: string;
  clientId: string;
  garment: string;
  gender: string;
  ageGroup: string;
  category: string;
  fields: Record<string, string>;
  notes?: string;
  createdAt: string;
  unit?: MeasurementUnit;
  photo?: string; // base64 data URL, single reference photo
}

export interface OrderPayment {
  id: string;
  amount: number;
  method: string;
  date: string;
}

export interface InventoryUse {
  id: string; // fabric or material id
  name: string;
  amount: number;
  unit: string;
}

export interface Order {
  id: string;
  clientId: string;
  client: string;
  type: string;
  category: string;
  garment: string;
  styleDesc: string;
  price: number;
  currency: string;
  dueDate: string;
  img: string;
  stages: string[];
  currentStage: number;
  fabricUse: InventoryUse[];
  materialUse: InventoryUse[];
  status: OrderStatus;
  payments: OrderPayment[];
  createdAt: string;
  source?: "manual" | "marketplace";
  designerId?: string;
  photos?: string[]; // reference/inspiration photos, base64 data URLs
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: string;
  deliveryDate?: string; // ISO date-time
  deliveryStatus?: DeliveryStatus;
  costs?: { fabric?: number; materials?: number; labor?: number };
  stageHistory?: StageHistoryEntry[];
  /** Per-order materials checklist (procurement + client handoff). */
  materialsList?: OrderMaterial[];
  /** True while the order sits in the "Awaiting Materials" stage, before Cutting. */
  awaitingMaterials?: boolean;
}

export interface Fabric {
  id: string;
  name: string;
  brand: string;
  color: string;
  qty: string;
  price: string;
  image: string | null;
  fabricType: string;
  source: string;
  dateReceived: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  qty: string;
  unitCost: string;
  totalCost: string;
  linkedOrder: string;
}

// ---------- Helpers ----------
export const parseQty = (qty: string): { n: number; unit: string } => {
  const m = /^\s*([\d.]+)\s*(.*)$/.exec(qty || "");
  return { n: m ? parseFloat(m[1]) : NaN, unit: (m && m[2].trim()) || "" };
};

export const formatQty = (n: number, unit: string) => {
  const rounded = Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, "");
  return unit ? `${rounded} ${unit}` : rounded;
};

export const fabricLowStock = (qty: string) => {
  const { n } = parseQty(qty);
  return !Number.isNaN(n) && n < 2;
};

export const materialLowStock = (qty: string) => {
  const { n } = parseQty(qty);
  return !Number.isNaN(n) && n < 5;
};

export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase() || "").join("");

export const slugId = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).slice(2, 6)}`;

export const money = (n: number, currency = "GHS") => `${currency} ${n.toLocaleString()}`;

export const parsePrice = (s: string) => {
  const m = /([\d,]+(?:\.\d+)?)/.exec(s || "");
  return m ? parseFloat(m[1].replace(/,/g, "")) : 0;
};

// Per-unit price for an inventory item priced as a total (e.g. "GHS 350" for "5 yards").
// Returns 0 when the qty is missing/zero or the price can't be parsed.
export const perUnitPrice = (priceStr: string, qtyStr: string) => {
  const total = parsePrice(priceStr);
  const { n } = parseQty(qtyStr);
  if (!total || !n || Number.isNaN(n)) return 0;
  return total / n;
};

export const costFromFabricUse = (
  uses: InventoryUse[],
  fabrics: Fabric[],
) =>
  uses.reduce((sum, u) => {
    const f = fabrics.find((x) => x.id === u.id);
    if (!f) return sum;
    return sum + perUnitPrice(f.price, f.qty) * u.amount;
  }, 0);

export const costFromMaterialUse = (
  uses: InventoryUse[],
  materials: Material[],
) =>
  uses.reduce((sum, u) => {
    const m = materials.find((x) => x.id === u.id);
    if (!m) return sum;
    // materials store an explicit unit cost, prefer that; fallback to total/qty.
    const unit = parsePrice(m.unitCost) || perUnitPrice(m.totalCost, m.qty);
    return sum + unit * u.amount;
  }, 0);

// ---------- Seeds ----------
const now = new Date().toISOString();

const seedClients: Client[] = [
  { id: "ama-serwaa", name: "Ama Serwaa", phone: "024 123 4567", gender: "Female", notes: "Prefers form-fitting styles. Allergic to synthetic fabrics.", initials: "AS", joined: "Jan 2024" },
  { id: "kofi-mensah", name: "Kofi Mensah", phone: "055 987 6543", gender: "Male", notes: "", initials: "KM", joined: "Feb 2024" },
  { id: "yaw-boateng", name: "Yaw Boateng", phone: "020 456 7890", gender: "Male", notes: "", initials: "YB", joined: "Dec 2023" },
  { id: "abena-poku", name: "Abena Poku", phone: "050 321 0987", gender: "Female", notes: "", initials: "AP", joined: "Feb 2024" },
  { id: "kwame-asante", name: "Kwame Asante", phone: "027 654 3210", gender: "Male", notes: "", initials: "KA", joined: "Jan 2024" },
  { id: "mrs-adjei", name: "Mrs. Adjei", phone: "024 555 1122", gender: "Female", notes: "School uniforms client", initials: "MA", joined: "Mar 2024" },
];

const seedMeasurements: Measurement[] = [
  { id: "m1", clientId: "ama-serwaa", garment: "Gown", gender: "female", ageGroup: "adult", category: "women", fields: { Bust: "36", Waist: "28", Hip: "38", Shoulder: "15", Sleeve: "24", Length: "42" }, createdAt: "2024-03-15" },
  { id: "m2", clientId: "ama-serwaa", garment: "Blouse", gender: "female", ageGroup: "adult", category: "women", fields: { Bust: "35.5", Shoulder: "15", Sleeve: "24" }, createdAt: "2024-01-10" },
];

const seedOrders: Order[] = [
  {
    id: "o-ama-serwaa", clientId: "ama-serwaa", client: "Ama Serwaa",
    type: "Wedding Gown", category: "Women", garment: "Bridal",
    styleDesc: "Sweetheart neckline, mermaid silhouette with cathedral train and crystal embellishments",
    price: 2500, currency: "GHS", dueDate: "Mar 25", img: orderWedding,
    stages: ["Cutting", "Sewing", "Beading", "Fitting", "Finishing", "Quality Check"], currentStage: 1,
    fabricUse: [], materialUse: [],
    status: "active",
    payments: [{ id: "p1", amount: 1500, method: "Mobile Money", date: "2024-03-10" }],
    createdAt: "2024-03-01", source: "manual",
  },
  {
    id: "o-kofi-mensah", clientId: "kofi-mensah", client: "Kofi Mensah",
    type: "3-Piece Suit", category: "Men", garment: "Suit",
    styleDesc: "Slim fit, peak lapel, double-breasted waistcoat, flat-front trousers",
    price: 1800, currency: "GHS", dueDate: "Mar 28", img: orderSuit,
    stages: ["Cutting", "Sewing", "Fitting", "Finishing", "Quality Check"], currentStage: 0,
    fabricUse: [], materialUse: [],
    status: "active",
    payments: [{ id: "p2", amount: 1800, method: "Bank Transfer", date: "2024-03-05" }],
    createdAt: "2024-03-05", source: "manual",
  },
  {
    id: "o-yaw-boateng", clientId: "yaw-boateng", client: "Yaw Boateng",
    type: "Agbada Set", category: "Men", garment: "Agbada",
    styleDesc: "Full-length agbada with heavy hand-embroidered patterns, matching sokoto and fila cap",
    price: 3200, currency: "GHS", dueDate: "Mar 15", img: orderAgbada,
    stages: ["Cutting", "Sewing", "Beading", "Finishing", "Quality Check"], currentStage: 4,
    fabricUse: [], materialUse: [],
    status: "completed",
    payments: [{ id: "p3", amount: 2500, method: "Cash", date: "2024-02-20" }],
    createdAt: "2024-02-15", source: "manual",
  },
  {
    id: "o-abena-poku", clientId: "abena-poku", client: "Abena Poku",
    type: "Evening Dress", category: "Women", garment: "Gown",
    styleDesc: "Crystal beading on bodice", price: 1500, currency: "GHS", dueDate: "Apr 2", img: orderWedding,
    stages: ["Cutting", "Sewing", "Beading", "Finishing", "Quality Check"], currentStage: 2,
    fabricUse: [], materialUse: [], status: "active",
    payments: [{ id: "p4", amount: 500, method: "Mobile Money", date: "2024-03-20" }],
    createdAt: "2024-03-15", source: "manual",
  },
  {
    id: "o-mrs-adjei", clientId: "mrs-adjei", client: "Mrs. Adjei",
    type: "School Uniform Set", category: "Children", garment: "Uniforms",
    styleDesc: "5 sets, white shirts with navy trousers", price: 600, currency: "GHS", dueDate: "Apr 5", img: orderSuit,
    stages: ["Cutting", "Sewing", "Finishing", "Quality Check"], currentStage: 2,
    fabricUse: [], materialUse: [], status: "active",
    payments: [{ id: "p5", amount: 300, method: "Cash", date: "2024-03-25" }],
    createdAt: "2024-03-20", source: "manual",
  },
];

const seedFabrics: Fabric[] = [
  { id: "f1", name: "Ankara Print", brand: "Vlisco", color: "Multi", qty: "5 yards", price: "GHS 350", image: null, fabricType: "Ankara", source: "Designer", dateReceived: "2024-03-10" },
  { id: "f2", name: "Silk Satin", brand: "Premium", color: "Navy/Gold", qty: "3 yards", price: "GHS 520", image: null, fabricType: "Silk", source: "Client", dateReceived: "2024-03-08" },
  { id: "f3", name: "French Lace", brand: "Imported", color: "Ivory", qty: "4 yards", price: "GHS 780", image: null, fabricType: "Lace", source: "Designer", dateReceived: "2024-03-05" },
  { id: "f4", name: "Kente Cloth", brand: "Bonwire", color: "Gold/Green", qty: "6 yards", price: "GHS 900", image: null, fabricType: "Kente", source: "Designer", dateReceived: "2024-02-28" },
  { id: "f5", name: "Cotton Poplin", brand: "Local", color: "White", qty: "10 yards", price: "GHS 150", image: null, fabricType: "Cotton", source: "Designer", dateReceived: "2024-02-20" },
];

const seedMaterials: Material[] = [
  { id: "mat1", name: "Gold Embroidery Thread", category: "Threads", qty: "12 spools", unitCost: "GHS 15", totalCost: "GHS 180", linkedOrder: "Wedding Gown" },
  { id: "mat2", name: "Pearl Beads (4mm)", category: "Beads", qty: "500 pcs", unitCost: "GHS 0.50", totalCost: "GHS 250", linkedOrder: "Evening Dress" },
  { id: "mat3", name: "Invisible Zip (22\")", category: "Zips", qty: "8 pcs", unitCost: "GHS 12", totalCost: "GHS 96", linkedOrder: "—" },
  { id: "mat4", name: "Coat Buttons – Gold", category: "Buttons", qty: "24 pcs", unitCost: "GHS 5", totalCost: "GHS 120", linkedOrder: "3-Piece Suit" },
  { id: "mat5", name: "Polyester Lining – Black", category: "Linings", qty: "3 yards", unitCost: "GHS 35", totalCost: "GHS 105", linkedOrder: "Agbada Set" },
];

// ---------- Context ----------
export const PAYMENT_METHODS = ["Mobile Money", "Cash", "Bank Transfer", "Card"];
export const BASE_STAGES = ["Cutting", "Sewing", "Finishing", "Quality Check"];
export const OPTIONAL_STAGES = ["Beading", "Fitting"];

interface AtelierState {
  clients: Client[];
  measurements: Measurement[];
  orders: Order[];
  fabrics: Fabric[];
  materials: Material[];
  measurementTemplates: Record<string, string[]>;
  tasks: WorkerTask[];

  addClient: (c: Omit<Client, "id" | "initials" | "joined"> & { id?: string; initials?: string; joined?: string }) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addMeasurement: (m: Omit<Measurement, "id" | "createdAt">) => Measurement;
  addOrder: (o: Omit<Order, "id" | "createdAt" | "img"> & { img?: string }) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  setDeliveryStatus: (orderId: string, status: DeliveryStatus) => void;
  advanceStage: (orderId: string, stageIdx: number) => void;
  setStage: (
    orderId: string,
    stageIdx: number,
    opts?: { photoUrl?: string; workerId?: string; workerName?: string }
  ) => void;
  undoLastStage: (orderId: string) => void;
  addPayment: (orderId: string, p: Omit<OrderPayment, "id">) => void;
  confirmOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;

  addOrderMaterial: (orderId: string, m: {
    name: string; source: MaterialSource; neededBy?: string; requiredToStart?: boolean;
  }) => void;
  updateOrderMaterial: (orderId: string, materialId: string, patch: Partial<OrderMaterial>) => void;
  removeOrderMaterial: (orderId: string, materialId: string) => void;
  setMaterialStatus: (orderId: string, materialId: string, status: OrderMaterialStatus) => void;
  clientMarkDroppedOff: (orderId: string, materialId: string) => void;
  confirmMaterialReceived: (
    orderId: string, materialId: string,
    by: { name: string; role: "designer" | "worker"; photo?: string },
  ) => void;
  startProduction: (orderId: string) => void;

  setFabrics: React.Dispatch<React.SetStateAction<Fabric[]>>;
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  deductFabric: (id: string, amount: number) => void;
  deductMaterial: (id: string, amount: number) => void;

  addTemplateField: (garment: string, field: string) => void;
  removeTemplateField: (garment: string, field: string) => void;

  addTask: (t: Omit<WorkerTask, "id" | "createdAt" | "status" | "images" | "priority"> & {
    status?: TaskStatus; priority?: TaskPriority; images?: string[];
  }) => WorkerTask;
  updateTask: (id: string, patch: Partial<WorkerTask>) => void;
  deleteTask: (id: string) => void;
  tasksByWorker: (workerId: string) => WorkerTask[];
  tasksByOrder: (orderId: string) => WorkerTask[];
  flagTask: (id: string, reason: string) => void;

  latestMeasurement: (clientId: string, garment: string) => Measurement | undefined;
  clientById: (id: string) => Client | undefined;
  orderById: (id: string) => Order | undefined;
  ordersByClient: (clientId: string) => Order[];
  measurementsByClient: (clientId: string) => Measurement[];
}

const AtelierContext = createContext<AtelierState | null>(null);

function useLS<T>(key: string, seed: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : seed;
    } catch { return seed; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

export const AtelierProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = useLS<Client[]>("stitchova.clients", seedClients);
  const [measurements, setMeasurements] = useLS<Measurement[]>("stitchova.measurements", seedMeasurements);
  const [orders, setOrders] = useLS<Order[]>("stitchova.orders", seedOrders);
  const [fabrics, setFabrics] = useLS<Fabric[]>("stitchova.fabrics", seedFabrics);
  const [materials, setMaterials] = useLS<Material[]>("stitchova.materials", seedMaterials);
  const [measurementTemplates, setMeasurementTemplates] = useLS<Record<string, string[]>>(
    "stitchova.measurementTemplates.v1",
    {},
  );
  const [tasks, setTasks] = useLS<WorkerTask[]>("stitchova.tasks.v1", [
    // Seed a couple tasks so the worker dashboard is populated on first run.
    {
      id: "t-seed-1", orderId: "o-ama-serwaa", workerId: "w-tunde", workerName: "Tunde A.", workerAvatar: "TA",
      title: "Sew bodice structure", deadline: "Mar 23", stageIdx: 1,
      status: "in_progress", priority: "urgent", images: [], createdAt: new Date().toISOString(),
    },
    {
      id: "t-seed-2", orderId: "o-kofi-mensah", workerId: "w-tunde", workerName: "Tunde A.", workerAvatar: "TA",
      title: "Cut fabric pieces", deadline: "Mar 28", stageIdx: 0,
      status: "not_started", priority: "normal", images: [], createdAt: new Date().toISOString(),
    },
    {
      id: "t-seed-3", orderId: "o-abena-poku", workerId: "w-tunde", workerName: "Tunde A.", workerAvatar: "TA",
      title: "Attach crystal beading", deadline: "Apr 2", stageIdx: 2,
      status: "not_started", priority: "normal", images: [], createdAt: new Date().toISOString(),
    },
  ]);

  const addClient: AtelierState["addClient"] = useCallback((c) => {
    const id = c.id || slugId(c.name);
    const client: Client = {
      id,
      name: c.name,
      phone: c.phone || "",
      gender: c.gender || "",
      notes: c.notes || "",
      initials: c.initials || initialsOf(c.name),
      joined: c.joined || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      referralSource: c.referralSource,
      address: c.address,
      preferredChannel: c.preferredChannel,
    };
    setClients((prev) => [client, ...prev]);
    return client;
  }, [setClients]);

  const updateClient: AtelierState["updateClient"] = useCallback((id, patch) => {
    setClients((prev) => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  }, [setClients]);

  const addMeasurement: AtelierState["addMeasurement"] = useCallback((m) => {
    const rec: Measurement = { ...m, id: `mea-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] };
    setMeasurements((prev) => [rec, ...prev]);
    return rec;
  }, [setMeasurements]);

  const addOrder: AtelierState["addOrder"] = useCallback((o) => {
    const img = o.img || (o.category === "Women" ? orderWedding : o.category === "Children" ? orderSuit : orderAgbada);
    const order: Order = {
      ...o, img,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      deliveryStatus: o.deliveryStatus || "pending",
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, [setOrders]);

  const updateOrder: AtelierState["updateOrder"] = useCallback((id, patch) => {
    setOrders((prev) => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  }, [setOrders]);

  const setDeliveryStatus: AtelierState["setDeliveryStatus"] = useCallback((orderId, status) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, deliveryStatus: status } : o));
  }, [setOrders]);

  const advanceStage: AtelierState["advanceStage"] = useCallback((orderId, stageIdx) => {
    setOrders((prev) => prev.map(o => {
      if (o.id !== orderId) return o;
      const status: OrderStatus = stageIdx >= o.stages.length - 1 ? "completed" : o.status === "requested" ? "active" : o.status;
      return { ...o, currentStage: stageIdx, status };
    }));
  }, [setOrders]);

  const setStage: AtelierState["setStage"] = useCallback((orderId, stageIdx, opts = {}) => {
    setOrders((prev) => prev.map(o => {
      if (o.id !== orderId) return o;
      const stageName = o.stages[stageIdx];
      if (!stageName) return o;
      const entry: StageHistoryEntry = {
        stageIdx,
        stage: stageName,
        timestamp: Date.now(),
        photoUrl: opts.photoUrl,
        workerId: opts.workerId,
        workerName: opts.workerName,
      };
      const stageHistory = [...(o.stageHistory || []), entry];
      const status: OrderStatus = stageIdx >= o.stages.length - 1
        ? "completed"
        : o.status === "requested" ? "active" : o.status;
      return { ...o, currentStage: stageIdx, stageHistory, status };
    }));
  }, [setOrders]);

  const undoLastStage: AtelierState["undoLastStage"] = useCallback((orderId) => {
    setOrders((prev) => prev.map(o => {
      if (o.id !== orderId) return o;
      const history = [...(o.stageHistory || [])];
      if (history.length === 0) return o;
      history.pop();
      const prevIdx = history.length > 0 ? history[history.length - 1].stageIdx : 0;
      const status: OrderStatus = o.status === "completed" && prevIdx < o.stages.length - 1 ? "active" : o.status;
      return { ...o, currentStage: prevIdx, stageHistory: history, status };
    }));
  }, [setOrders]);

  const addPayment: AtelierState["addPayment"] = useCallback((orderId, p) => {
    setOrders((prev) => prev.map(o => o.id === orderId
      ? { ...o, payments: [...o.payments, { ...p, id: `pay-${Date.now()}` }] } : o));
  }, [setOrders]);

  const confirmOrder: AtelierState["confirmOrder"] = useCallback((orderId) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: "active" } : o));
  }, [setOrders]);

  const declineOrder: AtelierState["declineOrder"] = useCallback((orderId) => {
    setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: "declined" } : o));
  }, [setOrders]);

  const deductFabric: AtelierState["deductFabric"] = useCallback((id, amount) => {
    setFabrics((prev) => prev.map(f => {
      if (f.id !== id) return f;
      const { n, unit } = parseQty(f.qty);
      if (Number.isNaN(n)) return f;
      const next = Math.max(0, n - amount);
      return { ...f, qty: formatQty(next, unit) };
    }));
  }, [setFabrics]);

  const deductMaterial: AtelierState["deductMaterial"] = useCallback((id, amount) => {
    setMaterials((prev) => prev.map(m => {
      if (m.id !== id) return m;
      const { n, unit } = parseQty(m.qty);
      if (Number.isNaN(n)) return m;
      const next = Math.max(0, n - amount);
      return { ...m, qty: formatQty(next, unit) };
    }));
  }, [setMaterials]);

  const addTemplateField: AtelierState["addTemplateField"] = useCallback((garment, field) => {
    const name = field.trim();
    if (!garment || !name) return;
    setMeasurementTemplates((prev) => {
      const existing = prev[garment] || [];
      if (existing.includes(name)) return prev;
      return { ...prev, [garment]: [...existing, name] };
    });
  }, [setMeasurementTemplates]);

  const removeTemplateField: AtelierState["removeTemplateField"] = useCallback((garment, field) => {
    setMeasurementTemplates((prev) => {
      const existing = prev[garment] || [];
      const next = existing.filter((f) => f !== field);
      if (next.length === existing.length) return prev;
      return { ...prev, [garment]: next };
    });
  }, [setMeasurementTemplates]);

  const addTask: AtelierState["addTask"] = useCallback((t) => {
    const task: WorkerTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: t.status || "not_started",
      priority: t.priority || "normal",
      images: t.images || [],
      orderId: t.orderId, workerId: t.workerId, workerName: t.workerName, workerAvatar: t.workerAvatar,
      title: t.title, deadline: t.deadline, stageIdx: t.stageIdx,
    };
    setTasks((prev) => [task, ...prev]);
    return task;
  }, [setTasks]);

  const updateTask: AtelierState["updateTask"] = useCallback((id, patch) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));
  }, [setTasks]);

  const deleteTask: AtelierState["deleteTask"] = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [setTasks]);

  const tasksByWorker = useCallback((wid: string) => tasks.filter((t) => t.workerId === wid), [tasks]);
  const tasksByOrder = useCallback((oid: string) => tasks.filter((t) => t.orderId === oid), [tasks]);

  const flagTask: AtelierState["flagTask"] = useCallback((id, reason) => {
    setTasks((prev) => prev.map((t) => t.id === id
      ? { ...t, flaggedAt: new Date().toISOString(), flagReason: reason, priority: "urgent" as TaskPriority }
      : t));
  }, [setTasks]);

  const clientById = useCallback((id: string) => clients.find(c => c.id === id), [clients]);
  const orderById = useCallback((id: string) => orders.find(o => o.id === id), [orders]);
  const ordersByClient = useCallback((cid: string) => orders.filter(o => o.clientId === cid), [orders]);
  const measurementsByClient = useCallback((cid: string) => measurements.filter(m => m.clientId === cid), [measurements]);
  const latestMeasurement = useCallback((cid: string, garment: string) => {
    return measurements
      .filter(m => m.clientId === cid && m.garment === garment)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [measurements]);

  const value: AtelierState = useMemo(() => ({
    clients, measurements, orders, fabrics, materials, measurementTemplates, tasks,
    addClient, updateClient, addMeasurement, addOrder, updateOrder, setDeliveryStatus, advanceStage, setStage, undoLastStage, addPayment, confirmOrder, declineOrder,
    setFabrics, setMaterials, deductFabric, deductMaterial,
    addTemplateField, removeTemplateField,
    addTask, updateTask, deleteTask, tasksByWorker, tasksByOrder, flagTask,
    latestMeasurement, clientById, orderById, ordersByClient, measurementsByClient,
  }), [clients, measurements, orders, fabrics, materials, measurementTemplates, tasks, addClient, updateClient, addMeasurement, addOrder, updateOrder, setDeliveryStatus, advanceStage, setStage, undoLastStage, addPayment, confirmOrder, declineOrder, setFabrics, setMaterials, deductFabric, deductMaterial, addTemplateField, removeTemplateField, addTask, updateTask, deleteTask, tasksByWorker, tasksByOrder, flagTask, latestMeasurement, clientById, orderById, ordersByClient, measurementsByClient]);

  return <AtelierContext.Provider value={value}>{children}</AtelierContext.Provider>;
};

export const useAtelier = () => {
  const ctx = useContext(AtelierContext);
  if (!ctx) throw new Error("useAtelier must be used within AtelierProvider");
  return ctx;
};

// Legacy demo IDs used across the app (kept so hardcoded routes still resolve)
export const LEGACY_CLIENT_IDS = ["ama-serwaa", "kofi-mensah", "yaw-boateng", "abena-poku", "kwame-asante", "mrs-adjei"];
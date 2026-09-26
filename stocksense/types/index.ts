// StockSense – Core TypeScript Types

export type UserRole = "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  at: string;
}

// ── Products ───────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
}

export type UnitOfMeasure = "pcs" | "sheets" | "kg" | "pairs" | "boxes";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  category?: Category;
  unit_of_measure: UnitOfMeasure;
  /** Stock level at or below which the product must be reordered. */
  reorder_point: number;
  /** Rolling average daily consumption, used for burn-rate forecasting. */
  average_daily_usage?: number;
  /** Indicative cost per unit, used for inventory valuation. */
  unit_cost?: number;
  created_at: string;
}

export type StockHealth = "healthy" | "low" | "critical" | "out";

// ── Warehouses & Locations ─────────────────────────────────────

/** A site can be a storage warehouse or an active production floor. */
export type SiteKind = "warehouse" | "production";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  kind: SiteKind;
}

export interface Location {
  id: string;
  warehouse_id: string;
  warehouse?: Warehouse;
  name: string;
}

// ── Stock ──────────────────────────────────────────────────────

export interface StockLevel {
  id: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  quantity: number;
}

export type DocType = "receipt" | "delivery" | "transfer" | "adjustment";

export interface StockLedger {
  id: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  /** Signed quantity change. Negative for stock out. */
  change_qty: number;
  /** Stock level at the location after the change was applied. */
  balance_after?: number;
  doc_type: DocType;
  doc_id: string;
  reference?: string;
  note: string;
  created_by?: string;
  created_at: string;
}

// ── Operations ─────────────────────────────────────────────────

export type OperationStatus = "draft" | "waiting" | "ready" | "done" | "canceled";

export interface ReceiptLine {
  id: string;
  receipt_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
}

export interface Receipt {
  id: string;
  reference: string;
  supplier: string;
  status: OperationStatus;
  location_id: string;
  location?: Location;
  lines: ReceiptLine[];
  created_by: string;
  created_at: string;
  validated_at?: string;
}

export interface DeliveryLine {
  id: string;
  delivery_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
}

export interface DeliveryOrder {
  id: string;
  reference: string;
  customer: string;
  status: OperationStatus;
  location_id: string;
  location?: Location;
  lines: DeliveryLine[];
  created_by: string;
  created_at: string;
  shipped_at?: string;
}

export interface TransferLine {
  id: string;
  transfer_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
}

export interface InternalTransfer {
  id: string;
  reference: string;
  from_location_id: string;
  from_location?: Location;
  to_location_id: string;
  to_location?: Location;
  status: OperationStatus;
  lines: TransferLine[];
  created_by: string;
  created_at: string;
  executed_at?: string;
}

export interface Adjustment {
  id: string;
  reference: string;
  product_id: string;
  product?: Product;
  location_id: string;
  location?: Location;
  counted_qty: number;
  previous_qty: number;
  delta: number;
  reason?: string;
  status: "done";
  created_by: string;
  created_at: string;
}

// ── Toasts ─────────────────────────────────────────────────────

export type ToastTone = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

// ── Ask StockSense ─────────────────────────────────────────────

export type AskIntent =
  | "low-stock"
  | "out-of-stock"
  | "running-out"
  | "locate"
  | "shipped"
  | "movements"
  | "pending-receipts"
  | "pending-deliveries"
  | "valuation"
  | "top-movers"
  | "help"
  | "unknown";

export interface AskProductRow {
  kind: "product";
  product: Product;
  stock: number;
  daysRemaining: number | null;
  health: StockHealth;
  locationName: string;
  siteName: string;
  reorderQty: number;
  note: string;
}

export interface AskMovementRow {
  kind: "movement";
  entry: StockLedger;
  productName: string;
  locationName: string;
  siteName: string;
}

export interface AskDocumentRow {
  kind: "document";
  reference: string;
  docType: DocType;
  party: string;
  locationName: string;
  status: OperationStatus;
  units: number;
  createdAt: string;
  productNames: string;
}

export interface AskMetricRow {
  kind: "metric";
  label: string;
  value: string;
  hint: string;
  tone: StockHealth | "neutral";
}

export type AskRow = AskProductRow | AskMovementRow | AskDocumentRow | AskMetricRow;

export interface AskResult {
  intent: AskIntent;
  title: string;
  summary: string;
  insight: string;
  insightTone: ToastTone;
  rows: AskRow[];
  followUps: string[];
  /** Number of ledger entries or docs that were folded into the summary. */
  matched: number;
}

"use client";

import React, { createContext, useContext, useState } from "react";
import {
  Category,
  Product,
  Warehouse,
  Location,
  StockLevel,
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  Adjustment,
  StockLedger,
  UnitOfMeasure,
  OperationStatus,
} from "@/types";
import {
  fetchAllData,
  addProductAction,
  createReceiptAction,
  validateReceiptAction,
  createDeliveryAction,
  updateDeliveryStatusAction,
  createTransferAction,
  validateTransferAction,
  createAdjustmentAction
} from "@/lib/actions";

export interface AddProductInput {
  name: string;
  sku: string;
  category_id: string;
  unit_of_measure: UnitOfMeasure;
  reorder_point: number;
  initialStock?: number;
  locationId?: string;
}

interface StockContextType {
  categories: Category[];
  products: Product[];
  warehouses: Warehouse[];
  locations: Location[];
  stockLevels: StockLevel[];
  receipts: Receipt[];
  deliveries: DeliveryOrder[];
  transfers: InternalTransfer[];
  adjustments: Adjustment[];
  ledger: StockLedger[];

  // Computed helpers
  getTotalStock: (productId: string) => number;
  getStockByLocation: (productId: string, locationId: string) => number;
  getLowStockProducts: () => Product[];
  getOutOfStockProducts: () => Product[];
  getPendingReceipts: () => Receipt[];
  getPendingDeliveries: () => DeliveryOrder[];
  getScheduledTransfers: () => InternalTransfer[];

  // Actions
  addProduct: (input: AddProductInput) => Product;
  createReceipt: (supplier: string, locationId: string, lines: { product_id: string; quantity: number }[]) => Receipt;
  validateReceipt: (receiptId: string) => void;
  createDelivery: (customer: string, locationId: string, lines: { product_id: string; quantity: number }[]) => DeliveryOrder;
  updateDeliveryStatus: (deliveryId: string, status: OperationStatus) => void;
  createTransfer: (fromLocationId: string, toLocationId: string, lines: { product_id: string; quantity: number }[]) => InternalTransfer;
  validateTransfer: (transferId: string) => void;
  createAdjustment: (productId: string, locationId: string, countedQty: number) => Adjustment;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [ledger, setLedger] = useState<StockLedger[]>([]);

  React.useEffect(() => {
    fetchAllData().then(data => {
      setCategories(data.categories as unknown as Category[]);
      setWarehouses(data.warehouses as unknown as Warehouse[]);
      setLocations(data.locations as unknown as Location[]);
      setProducts(data.products as unknown as Product[]);
      setStockLevels(data.stockLevels as unknown as StockLevel[]);
      setReceipts(data.receipts as unknown as Receipt[]);
      setDeliveries(data.deliveries as unknown as DeliveryOrder[]);
      setTransfers(data.transfers as unknown as InternalTransfer[]);
      setAdjustments(data.adjustments as unknown as Adjustment[]);
      setLedger(data.ledger as unknown as StockLedger[]);
    });
  }, []);

  // Helper getters
  const getTotalStock = (productId: string): number => {
    return stockLevels
      .filter((s) => s.product_id === productId)
      .reduce((sum, s) => sum + s.quantity, 0);
  };

  const getStockByLocation = (productId: string, locationId: string): number => {
    const item = stockLevels.find((s) => s.product_id === productId && s.location_id === locationId);
    return item ? item.quantity : 0;
  };

  const getLowStockProducts = (): Product[] => {
    return products.filter((p) => {
      const total = getTotalStock(p.id);
      return total > 0 && total <= p.reorder_point;
    });
  };

  const getOutOfStockProducts = (): Product[] => {
    return products.filter((p) => getTotalStock(p.id) === 0);
  };

  const getPendingReceipts = (): Receipt[] => {
    return receipts.filter((r) => ["draft", "waiting", "ready"].includes(r.status));
  };

  const getPendingDeliveries = (): DeliveryOrder[] => {
    return deliveries.filter((d) => ["draft", "waiting", "ready"].includes(d.status));
  };

  const getScheduledTransfers = (): InternalTransfer[] => {
    return transfers.filter((t) => ["draft", "waiting", "ready"].includes(t.status));
  };

  // Actions
  const addProduct = (input: AddProductInput): Product => {
    const cat = categories.find((c) => c.id === input.category_id);
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: input.name,
      sku: input.sku,
      category_id: input.category_id,
      category: cat,
      unit_of_measure: input.unit_of_measure,
      reorder_point: input.reorder_point,
      created_at: new Date().toISOString(),
    };

    setProducts((prev) => [newProd, ...prev]);

    if (input.initialStock && input.initialStock > 0 && input.locationId) {
      const loc = locations.find((l) => l.id === input.locationId);
      // Update stock levels
      setStockLevels((prev) => {
        const idx = prev.findIndex((s) => s.product_id === newProd.id && s.location_id === input.locationId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + input.initialStock! };
          return copy;
        } else {
          return [
            ...prev,
            {
              id: `sl-${Date.now()}`,
              product_id: newProd.id,
              product: newProd,
              location_id: input.locationId!,
              location: loc,
              quantity: input.initialStock!,
            },
          ];
        }
      });

      // Log in ledger
      const newLedgerItem: StockLedger = {
        id: `led-${Date.now()}`,
        product_id: newProd.id,
        product: newProd,
        location_id: input.locationId,
        location: loc,
        change_qty: input.initialStock,
        doc_type: "receipt",
        doc_id: `INIT-${newProd.sku}`,
        note: "Initial product stock",
        created_at: new Date().toISOString(),
      };
      setLedger((prev) => [newLedgerItem, ...prev]);
    }

    addProductAction(input).catch(console.error);

    return newProd;
  };

  const createReceipt = (
    supplier: string,
    locationId: string,
    rawLines: { product_id: string; quantity: number }[]
  ): Receipt => {
    const ref = `REC-${String(receipts.length + 1).padStart(3, "0")}`;
    const loc = locations.find((l) => l.id === locationId);
    const recId = `rec-${Date.now()}`;

    const newReceipt: Receipt = {
      id: recId,
      reference: ref,
      supplier,
      status: "draft",
      location_id: locationId,
      location: loc,
      lines: rawLines.map((l, i) => ({
        id: `rl-${recId}-${i}`,
        receipt_id: recId,
        product_id: l.product_id,
        product: products.find((p) => p.id === l.product_id),
        quantity: l.quantity,
      })),
      created_by: "user-1",
      created_at: new Date().toISOString(),
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    createReceiptAction(supplier, locationId, rawLines).catch(console.error);
    return newReceipt;
  };

  const validateReceipt = (receiptId: string) => {
    const rec = receipts.find((r) => r.id === receiptId);
    if (!rec || rec.status === "done") return;

    // Update status
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: "done" } : r))
    );

    const now = new Date().toISOString();
    const loc = locations.find((l) => l.id === rec.location_id);

    // Apply stock increase and ledger entries for each line
    rec.lines.forEach((line, idx) => {
      const prod = products.find((p) => p.id === line.product_id) || line.product;

      setStockLevels((prev) => {
        const existingIdx = prev.findIndex(
          (s) => s.product_id === line.product_id && s.location_id === rec.location_id
        );
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + line.quantity,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `sl-${Date.now()}-${idx}`,
              product_id: line.product_id,
              product: prod,
              location_id: rec.location_id,
              location: loc,
              quantity: line.quantity,
            },
          ];
        }
      });

      const ledgerItem: StockLedger = {
        id: `led-${Date.now()}-${idx}`,
        product_id: line.product_id,
        product: prod,
        location_id: rec.location_id,
        location: loc,
        change_qty: line.quantity,
        doc_type: "receipt",
        doc_id: rec.id,
        note: `${rec.reference} Validated (${rec.supplier})`,
        created_at: now,
      };

      setLedger((prev) => [ledgerItem, ...prev]);
    });
    
    validateReceiptAction(receiptId).catch(console.error);
  };

  const createDelivery = (
    customer: string,
    locationId: string,
    rawLines: { product_id: string; quantity: number }[]
  ): DeliveryOrder => {
    const ref = `DEL-${String(deliveries.length + 1).padStart(3, "0")}`;
    const loc = locations.find((l) => l.id === locationId);
    const delId = `del-${Date.now()}`;

    const newDelivery: DeliveryOrder = {
      id: delId,
      reference: ref,
      customer,
      status: "draft",
      location_id: locationId,
      location: loc,
      lines: rawLines.map((l, i) => ({
        id: `dl-${delId}-${i}`,
        delivery_id: delId,
        product_id: l.product_id,
        product: products.find((p) => p.id === l.product_id),
        quantity: l.quantity,
      })),
      created_by: "user-1",
      created_at: new Date().toISOString(),
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    createDeliveryAction(customer, locationId, rawLines).catch(console.error);
    return newDelivery;
  };

  const updateDeliveryStatus = (deliveryId: string, newStatus: OperationStatus) => {
    const del = deliveries.find((d) => d.id === deliveryId);
    if (!del) return;

    if (newStatus === "done" && del.status !== "done") {
      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, status: "done" } : d))
      );

      const now = new Date().toISOString();
      const loc = locations.find((l) => l.id === del.location_id);

      del.lines.forEach((line, idx) => {
        const prod = products.find((p) => p.id === line.product_id) || line.product;

        setStockLevels((prev) => {
          const existingIdx = prev.findIndex(
            (s) => s.product_id === line.product_id && s.location_id === del.location_id
          );
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: Math.max(0, updated[existingIdx].quantity - line.quantity),
            };
            return updated;
          } else {
            return prev;
          }
        });

        const ledgerItem: StockLedger = {
          id: `led-${Date.now()}-${idx}`,
          product_id: line.product_id,
          product: prod,
          location_id: del.location_id,
          location: loc,
          change_qty: -line.quantity,
          doc_type: "delivery",
          doc_id: del.id,
          note: `${del.reference} Validated (${del.customer})`,
          created_at: now,
        };

        setLedger((prev) => [ledgerItem, ...prev]);
      });
    } else {
      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, status: newStatus } : d))
      );
    }
    
    updateDeliveryStatusAction(deliveryId, newStatus).catch(console.error);
  };

  const createTransfer = (
    fromLocationId: string,
    toLocationId: string,
    rawLines: { product_id: string; quantity: number }[]
  ): InternalTransfer => {
    const ref = `INT-${String(transfers.length + 1).padStart(3, "0")}`;
    const fromLoc = locations.find((l) => l.id === fromLocationId);
    const toLoc = locations.find((l) => l.id === toLocationId);
    const trId = `tr-${Date.now()}`;

    const newTransfer: InternalTransfer = {
      id: trId,
      reference: ref,
      from_location_id: fromLocationId,
      from_location: fromLoc,
      to_location_id: toLocationId,
      to_location: toLoc,
      status: "draft",
      lines: rawLines.map((l, i) => ({
        id: `tl-${trId}-${i}`,
        transfer_id: trId,
        product_id: l.product_id,
        product: products.find((p) => p.id === l.product_id),
        quantity: l.quantity,
      })),
      created_by: "user-1",
      created_at: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    createTransferAction(fromLocationId, toLocationId, rawLines).catch(console.error);
    return newTransfer;
  };

  const validateTransfer = (transferId: string) => {
    const tr = transfers.find((t) => t.id === transferId);
    if (!tr || tr.status === "done") return;

    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: "done" } : t))
    );

    const now = new Date().toISOString();
    const fromLoc = locations.find((l) => l.id === tr.from_location_id);
    const toLoc = locations.find((l) => l.id === tr.to_location_id);

    tr.lines.forEach((line, idx) => {
      const prod = products.find((p) => p.id === line.product_id) || line.product;

      // 1. Decrease from source
      setStockLevels((prev) => {
        const fromIdx = prev.findIndex(
          (s) => s.product_id === line.product_id && s.location_id === tr.from_location_id
        );
        if (fromIdx >= 0) {
          const updated = [...prev];
          updated[fromIdx] = {
            ...updated[fromIdx],
            quantity: Math.max(0, updated[fromIdx].quantity - line.quantity),
          };
          return updated;
        }
        return prev;
      });

      // 2. Increase at destination
      setStockLevels((prev) => {
        const toIdx = prev.findIndex(
          (s) => s.product_id === line.product_id && s.location_id === tr.to_location_id
        );
        if (toIdx >= 0) {
          const updated = [...prev];
          updated[toIdx] = {
            ...updated[toIdx],
            quantity: updated[toIdx].quantity + line.quantity,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `sl-${Date.now()}-tr-${idx}`,
              product_id: line.product_id,
              product: prod,
              location_id: tr.to_location_id,
              location: toLoc,
              quantity: line.quantity,
            },
          ];
        }
      });

      // 3. Ledger entries (Out + In)
      const ledgerOut: StockLedger = {
        id: `led-${Date.now()}-out-${idx}`,
        product_id: line.product_id,
        product: prod,
        location_id: tr.from_location_id,
        location: fromLoc,
        change_qty: -line.quantity,
        doc_type: "transfer",
        doc_id: tr.id,
        note: `${tr.reference} (Out to ${toLoc?.name})`,
        created_at: now,
      };

      const ledgerIn: StockLedger = {
        id: `led-${Date.now()}-in-${idx}`,
        product_id: line.product_id,
        product: prod,
        location_id: tr.to_location_id,
        location: toLoc,
        change_qty: line.quantity,
        doc_type: "transfer",
        doc_id: tr.id,
        note: `${tr.reference} (In from ${fromLoc?.name})`,
        created_at: now,
      };

      setLedger((prev) => [ledgerIn, ledgerOut, ...prev]);
    });
    
    validateTransferAction(transferId).catch(console.error);
  };

  const createAdjustment = (productId: string, locationId: string, countedQty: number): Adjustment => {
    const prod = products.find((p) => p.id === productId);
    const loc = locations.find((l) => l.id === locationId);
    const prevQty = getStockByLocation(productId, locationId);
    const delta = countedQty - prevQty;
    const ref = `ADJ-${String(adjustments.length + 1).padStart(3, "0")}`;
    const adjId = `adj-${Date.now()}`;
    const now = new Date().toISOString();

    const newAdj: Adjustment = {
      id: adjId,
      reference: ref,
      product_id: productId,
      product: prod,
      location_id: locationId,
      location: loc,
      counted_qty: countedQty,
      previous_qty: prevQty,
      delta,
      status: "done",
      created_by: "user-1",
      created_at: now,
    };

    setAdjustments((prev) => [newAdj, ...prev]);

    // Update stock level
    setStockLevels((prev) => {
      const idx = prev.findIndex((s) => s.product_id === productId && s.location_id === locationId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: countedQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `sl-${Date.now()}`,
            product_id: productId,
            product: prod,
            location_id: locationId,
            location: loc,
            quantity: countedQty,
          },
        ];
      }
    });

    // Ledger entry
    const ledgerItem: StockLedger = {
      id: `led-${Date.now()}`,
      product_id: productId,
      product: prod,
      location_id: locationId,
      location: loc,
      change_qty: delta,
      doc_type: "adjustment",
      doc_id: adjId,
      note: `${ref} Physical count adjustment`,
      created_at: now,
    };

    setLedger((prev) => [ledgerItem, ...prev]);
    
    createAdjustmentAction(productId, locationId, countedQty).catch(console.error);

    return newAdj;
  };

  return (
    <StockContext.Provider
      value={{
        categories,
        products,
        warehouses,
        locations,
        stockLevels,
        receipts,
        deliveries,
        transfers,
        adjustments,
        ledger,
        getTotalStock,
        getStockByLocation,
        getLowStockProducts,
        getOutOfStockProducts,
        getPendingReceipts,
        getPendingDeliveries,
        getScheduledTransfers,
        addProduct,
        createReceipt,
        validateReceipt,
        createDelivery,
        updateDeliveryStatus,
        createTransfer,
        validateTransfer,
        createAdjustment,
      }}
    >
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
}

"use client";

import { useState } from "react";
import {
  Package,
  AlertTriangle,
  TruckIcon,
  PackageCheck,
  ArrowLeftRight,
  Filter,
  Warehouse as WarehouseIcon,
  Plus,
} from "lucide-react";
import { KpiCard } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { useStock } from "@/lib/stock-context";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { DocType } from "@/types";

export default function DashboardPage() {
  const {
    products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    locations,
    stockLevels,
    getLowStockProducts,
    getOutOfStockProducts,
    getPendingReceipts,
    getPendingDeliveries,
    getScheduledTransfers,
  } = useStock();

  const [typeFilter, setTypeFilter] = useState<DocType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const lowStock = getLowStockProducts();
  const outOfStock = getOutOfStockProducts();
  const pendingReceipts = getPendingReceipts();
  const pendingDeliveries = getPendingDeliveries();
  const scheduledTransfers = getScheduledTransfers();

  // Aggregate operations across all 4 types for recent activity
  const allOps = [
    ...receipts.map((r) => ({
      id: r.id,
      ref: r.reference,
      type: "receipt" as DocType,
      typeLabel: "Receipt",
      party: r.supplier,
      locationName: r.location?.name,
      status: r.status,
      date: r.created_at,
      link: "/operations/receipts",
    })),
    ...deliveries.map((d) => ({
      id: d.id,
      ref: d.reference,
      type: "delivery" as DocType,
      typeLabel: "Delivery Order",
      party: d.customer,
      locationName: d.location?.name,
      status: d.status,
      date: d.created_at,
      link: "/operations/deliveries",
    })),
    ...transfers.map((t) => ({
      id: t.id,
      ref: t.reference,
      type: "transfer" as DocType,
      typeLabel: "Internal Transfer",
      party: `${t.from_location?.name || 'Loc'} → ${t.to_location?.name || 'Loc'}`,
      locationName: t.from_location?.name,
      status: t.status,
      date: t.created_at,
      link: "/operations/transfers",
    })),
    ...adjustments.map((a) => ({
      id: a.id,
      ref: a.reference,
      type: "adjustment" as DocType,
      typeLabel: "Stock Adjustment",
      party: `${a.product?.name || 'Product'} (${a.delta > 0 ? '+' + a.delta : a.delta})`,
      locationName: a.location?.name,
      status: a.status,
      date: a.created_at,
      link: "/operations/adjustments",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter operations
  const filteredOps = allOps.filter((op) => {
    const matchesType = typeFilter === "all" || op.type === typeFilter;
    const matchesStatus = statusFilter === "all" || op.status === statusFilter;
    return matchesType && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time status of products, stock levels, and warehouse operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/operations/receipts"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={14} /> New Receipt
          </Link>
          <Link
            href="/operations/deliveries"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={14} /> New Delivery
          </Link>
        </div>
      </div>

      {/* Alert Banners */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div className="space-y-2">
          {outOfStock.length > 0 && (
            <Alert type="error">
              <strong>{outOfStock.length} product{outOfStock.length > 1 ? "s" : ""} out of stock:</strong>{" "}
              {outOfStock.map((p) => `${p.name} (${p.sku})`).join(", ")}
            </Alert>
          )}
          {lowStock.length > 0 && (
            <Alert type="warning">
              <strong>{lowStock.length} product{lowStock.length > 1 ? "s" : ""} running low (below reorder threshold):</strong>{" "}
              {lowStock.map((p) => `${p.name} (${p.sku})`).join(", ")}
            </Alert>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Products"
          value={products.length}
          icon={<Package size={20} />}
          color="blue"
        />
        <KpiCard
          title="Low Stock Alert"
          value={lowStock.length + outOfStock.length}
          icon={<AlertTriangle size={20} />}
          color={lowStock.length + outOfStock.length > 0 ? "amber" : "blue"}
        />
        <KpiCard
          title="Pending Receipts"
          value={pendingReceipts.length}
          icon={<PackageCheck size={20} />}
          color="green"
        />
        <KpiCard
          title="Pending Deliveries"
          value={pendingDeliveries.length}
          icon={<TruckIcon size={20} />}
          color="slate"
        />
        <KpiCard
          title="Scheduled Transfers"
          value={scheduledTransfers.length}
          icon={<ArrowLeftRight size={20} />}
          color="blue"
        />
      </div>

      {/* Main Grid: Recent Activity + Location Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filterable Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Recent Operations & Activity
              </h2>
              <p className="text-xs text-slate-500">Live feed of receipts, deliveries, transfers & adjustments</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-lg">
                <Filter size={12} className="text-slate-500" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as DocType | "all")}
                  className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="receipt">Receipts</option>
                  <option value="delivery">Deliveries</option>
                  <option value="transfer">Transfers</option>
                  <option value="adjustment">Adjustments</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-100 border-none text-xs font-medium text-slate-700 px-2 py-1 rounded-lg focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="waiting">Waiting</option>
                <option value="ready">Ready</option>
                <option value="done">Done</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <Table headers={["Reference", "Type", "Details / Party", "Location", "Status", "Date"]}>
              {filteredOps.length === 0 ? (
                <TableEmpty message="No matching operations found" />
              ) : (
                filteredOps.slice(0, 7).map((op) => (
                  <Tr key={op.ref + op.type + op.id}>
                    <Td>
                      <Link href={op.link} className="font-mono text-xs font-bold text-blue-600 hover:underline">
                        {op.ref}
                      </Link>
                    </Td>
                    <Td>
                      <span className="text-xs font-medium text-slate-700">{op.typeLabel}</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-slate-600 font-medium">{op.party}</span>
                    </Td>
                    <Td>
                      <span className="text-xs text-slate-500">{op.locationName || 'N/A'}</span>
                    </Td>
                    <Td>
                      <Badge status={op.status as never} />
                    </Td>
                    <Td>
                      <span className="text-xs text-slate-400">{formatDate(op.date)}</span>
                    </Td>
                  </Tr>
                ))
              )}
            </Table>
          </div>
        </div>

        {/* Warehouse Location Stock Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <WarehouseIcon size={18} className="text-blue-600" />
              Warehouse Locations
            </h2>
            <span className="text-xs font-medium text-slate-400">{locations.length} locations</span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {locations.map((loc) => {
              const items = stockLevels.filter((s) => s.location_id === loc.id && s.quantity > 0);
              const totalUnits = items.reduce((sum, s) => sum + s.quantity, 0);

              return (
                <div key={loc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800">{loc.name}</span>
                    <span className="text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {totalUnits} units
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{loc.warehouse?.name}</p>
                  {items.length > 0 && (
                    <div className="mt-2 text-[11px] text-slate-600 font-mono">
                      {items.slice(0, 3).map((item) => (
                        <span key={item.id} className="inline-block mr-2 text-slate-600">
                          • {item.product?.sku}: <strong className="text-slate-900">{item.quantity}</strong>
                        </span>
                      ))}
                      {items.length > 3 && <span className="text-slate-400">+{items.length - 3} more</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

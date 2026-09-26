"use client";

import { useState } from "react";
import { History, Search, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { ColorBadge } from "@/components/ui/Badge";
import { useStock } from "@/lib/stock-context";
import { formatDate } from "@/lib/utils";
import { DocType } from "@/types";

export default function LedgerPage() {
  const { ledger, locations } = useStock();

  const [search, setSearch] = useState("");
  const [docFilter, setDocFilter] = useState<DocType | "all">("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const filtered = ledger.filter((item) => {
    const prodName = item.product?.name || "";
    const sku = item.product?.sku || "";
    const note = item.note || "";
    const docId = item.doc_id || "";

    const matchesSearch =
      prodName.toLowerCase().includes(search.toLowerCase()) ||
      sku.toLowerCase().includes(search.toLowerCase()) ||
      note.toLowerCase().includes(search.toLowerCase()) ||
      docId.toLowerCase().includes(search.toLowerCase());

    const matchesDoc = docFilter === "all" || item.doc_type === docFilter;
    const matchesLocation = locationFilter === "all" || item.location_id === locationFilter;

    return matchesSearch && matchesDoc && matchesLocation;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <History className="text-blue-600" size={24} /> Move History & Audit Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Immutable single source of truth recording every inventory movement</p>
        </div>
        <div className="text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          Total Movements Logged: <strong className="text-slate-900">{ledger.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, SKU, reference..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Doc type filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg">
            <Filter size={12} className="text-slate-400" />
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value as DocType | "all")}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none capitalize"
            >
              <option value="all">All Document Types</option>
              <option value="receipt">Receipts (+Stock)</option>
              <option value="delivery">Deliveries (-Stock)</option>
              <option value="transfer">Transfers</option>
              <option value="adjustment">Adjustments</option>
            </select>
          </div>

          {/* Location filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.warehouse?.name} — {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table headers={["Date & Time", "Product Name & SKU", "Location", "Doc Type", "Note / Reference", "Qty Change"]}>
          {filtered.length === 0 ? (
            <TableEmpty message="No stock movements match your search filter" />
          ) : (
            filtered.map((item) => {
              let docBadge = <ColorBadge label="Receipt" color="green" />;
              if (item.doc_type === "delivery") docBadge = <ColorBadge label="Delivery" color="red" />;
              if (item.doc_type === "transfer") docBadge = <ColorBadge label="Transfer" color="blue" />;
              if (item.doc_type === "adjustment") docBadge = <ColorBadge label="Adjustment" color="amber" />;

              return (
                <Tr key={item.id}>
                  <Td>
                    <span className="text-xs font-mono text-slate-500">{formatDate(item.created_at)}</span>
                  </Td>
                  <Td>
                    <div>
                      <span className="font-semibold text-slate-900 block">{item.product?.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{item.product?.sku}</span>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-xs font-medium text-slate-700">
                      {item.location?.name} <span className="text-slate-400">({item.location?.warehouse?.name})</span>
                    </span>
                  </Td>
                  <Td>{docBadge}</Td>
                  <Td>
                    <span className="text-xs text-slate-600 font-medium">{item.note || item.doc_id}</span>
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.change_qty > 0
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : item.change_qty < 0
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.change_qty > 0 ? <ArrowUpRight size={14} /> : item.change_qty < 0 ? <ArrowDownRight size={14} /> : null}
                      {item.change_qty > 0 ? `+${item.change_qty}` : item.change_qty} {item.product?.unit_of_measure}
                    </span>
                  </Td>
                </Tr>
              );
            })
          )}
        </Table>
      </div>
    </div>
  );
}

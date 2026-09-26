"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { useStock } from "@/lib/stock-context";
import { InternalTransfer, OperationStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default function TransfersPage() {
  const { transfers, products, locations, createTransfer, validateTransfer, getStockByLocation } = useStock();

  const [statusFilter, setStatusFilter] = useState<OperationStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<InternalTransfer | null>(null);
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New transfer form
  const [form, setForm] = useState({
    from_location_id: locations[0]?.id || "",
    to_location_id: locations[1]?.id || locations[0]?.id || "",
    lines: [{ product_id: products[0]?.id || "", quantity: 2 }],
  });
  const [saving, setSaving] = useState(false);

  const filtered = transfers.filter((t) => statusFilter === "all" || t.status === statusFilter);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (form.from_location_id === form.to_location_id) {
      alert("Source and Destination locations must be different!");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const newTr = createTransfer(form.from_location_id, form.to_location_id, form.lines);

    setShowNew(false);
    setSaving(false);
    setSuccessMsg(`Internal transfer request ${newTr.reference} created.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleValidate(transfer: InternalTransfer) {
    setValidating(true);
    await new Promise((r) => setTimeout(r, 400));
    validateTransfer(transfer.id);
    setSuccessMsg(`Transfer ${transfer.reference} completed — stock moved and logged in Move History.`);
    setShowDetail(null);
    setValidating(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  function addLine() {
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { product_id: products[0]?.id || "", quantity: 1 }],
    }));
  }

  function removeLine(i: number) {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Stock Transfers</h1>
          <p className="text-sm text-slate-500 mt-0.5">Move inventory seamlessly between warehouses, racks, and bays</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Transfer
        </Button>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "draft", "waiting", "ready", "done", "canceled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
              statusFilter === s
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
            }`}
          >
            {s === "all" ? "All Transfers" : s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table headers={["Reference", "From Source Location", "To Destination Location", "Items", "Status", "Created Date", "Actions"]}>
          {filtered.length === 0 ? (
            <TableEmpty
              message="No transfer documents found"
              cta={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Transfer</Button>}
            />
          ) : (
            filtered.map((t) => (
              <Tr key={t.id}>
                <Td>
                  <span className="font-mono text-xs font-bold text-blue-600">{t.reference}</span>
                </Td>
                <Td>
                  <span className="text-xs font-semibold text-slate-800">
                    {t.from_location?.name} <span className="text-slate-400">({t.from_location?.warehouse?.name})</span>
                  </span>
                </Td>
                <Td>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    → {t.to_location?.name} ({t.to_location?.warehouse?.name})
                  </span>
                </Td>
                <Td>
                  <span className="text-xs font-medium text-slate-700">{t.lines.length} line item{t.lines.length !== 1 ? "s" : ""}</span>
                </Td>
                <Td><Badge status={t.status} /></Td>
                <Td><span className="text-xs text-slate-400">{formatDate(t.created_at)}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetail(t)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                    {t.status !== "done" && t.status !== "canceled" && (
                      <button
                        onClick={() => handleValidate(t)}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 size={12} /> Validate Move
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Table>
      </div>

      {/* New Transfer Modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Schedule Internal Transfer"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button form="transfer-form" type="submit" loading={saving}>Create Transfer</Button>
          </>
        }
      >
        <form id="transfer-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Source Location (From)</label>
              <select
                value={form.from_location_id}
                onChange={(e) => setForm((f) => ({ ...f, from_location_id: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.warehouse?.name} — {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Destination Location (To)</label>
              <select
                value={form.to_location_id}
                onChange={(e) => setForm((f) => ({ ...f, to_location_id: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-700"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.warehouse?.name} — {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase text-slate-700">Products to Transfer</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-600 font-semibold hover:underline">
                + Add Item Line
              </button>
            </div>

            <div className="space-y-2">
              {form.lines.map((line, i) => {
                const stockAtSource = getStockByLocation(line.product_id, form.from_location_id);
                return (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <select
                      value={line.product_id}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          lines: f.lines.map((l, idx) => (idx === i ? { ...l, product_id: e.target.value } : l)),
                        }))
                      }
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            lines: f.lines.map((l, idx) => (idx === i ? { ...l, quantity: Number(e.target.value) } : l)),
                          }))
                        }
                        className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 w-28">Source stock: {stockAtSource}</span>
                    {form.lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="text-slate-400 hover:text-red-500 text-lg px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {showDetail && (
        <Modal
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
          title={`Internal Transfer — ${showDetail.reference}`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDetail(null)}>Close</Button>
              {showDetail.status !== "done" && showDetail.status !== "canceled" && (
                <Button onClick={() => handleValidate(showDetail)} loading={validating}>
                  <CheckCircle2 size={16} /> Execute Transfer
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">From Source:</span>
                <span className="font-bold text-slate-800">{showDetail.from_location?.name} ({showDetail.from_location?.warehouse?.name})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">To Destination:</span>
                <span className="font-bold text-blue-700">{showDetail.to_location?.name} ({showDetail.to_location?.warehouse?.name})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge status={showDetail.status} />
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Transfer Items</h4>
            <Table headers={["Product", "SKU", "Moving Quantity"]}>
              {showDetail.lines.map((l) => (
                <Tr key={l.id}>
                  <Td><span className="font-semibold text-slate-800">{l.product?.name}</span></Td>
                  <Td><span className="font-mono text-xs">{l.product?.sku}</span></Td>
                  <Td><span className="font-bold text-blue-700">{l.quantity} {l.product?.unit_of_measure}</span></Td>
                </Tr>
              ))}
            </Table>

            {showDetail.status === "done" && (
              <Alert type="success">This transfer has been executed. Both source and destination stock balances were updated.</Alert>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

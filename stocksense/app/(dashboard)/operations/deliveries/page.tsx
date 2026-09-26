"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { useStock } from "@/lib/stock-context";
import { DeliveryOrder, OperationStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default function DeliveriesPage() {
  const { deliveries, products, locations, createDelivery, updateDeliveryStatus, getStockByLocation } = useStock();

  const [statusFilter, setStatusFilter] = useState<OperationStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<DeliveryOrder | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New delivery form state
  const [form, setForm] = useState({
    customer: "",
    location_id: locations[0]?.id || "",
    lines: [{ product_id: products[0]?.id || "", quantity: 2 }],
  });
  const [saving, setSaving] = useState(false);

  const filtered = deliveries.filter((d) => statusFilter === "all" || d.status === statusFilter);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const newDel = createDelivery(form.customer, form.location_id, form.lines);

    setShowNew(false);
    setForm({
      customer: "",
      location_id: locations[0]?.id || "",
      lines: [{ product_id: products[0]?.id || "", quantity: 2 }],
    });
    setSaving(false);
    setSuccessMsg(`Draft delivery order ${newDel.reference} created.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleAdvanceStatus(delivery: DeliveryOrder, nextStatus: OperationStatus) {
    setUpdating(true);
    await new Promise((r) => setTimeout(r, 400));
    updateDeliveryStatus(delivery.id, nextStatus);

    if (nextStatus === "done") {
      setSuccessMsg(`Delivery ${delivery.reference} validated — stock decreased and logged in Move History.`);
    } else {
      setSuccessMsg(`Delivery ${delivery.reference} status updated to ${nextStatus.toUpperCase()}.`);
    }

    setShowDetail(null);
    setUpdating(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Delivery Orders (Stock Out)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pick, pack, and validate outgoing items for customers</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Delivery
        </Button>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      {/* Status Filter tabs */}
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
            {s === "all" ? "All Deliveries" : s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table headers={["Reference", "Customer", "Source Location", "Items", "Status", "Created Date", "Workflow Step"]}>
          {filtered.length === 0 ? (
            <TableEmpty
              message="No delivery orders found"
              cta={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Delivery</Button>}
            />
          ) : (
            filtered.map((d) => (
              <Tr key={d.id}>
                <Td>
                  <span className="font-mono text-xs font-bold text-blue-600">{d.reference}</span>
                </Td>
                <Td><span className="font-semibold text-slate-800">{d.customer}</span></Td>
                <Td>
                  <span className="text-xs text-slate-600">
                    {d.location?.name} <span className="text-slate-400">({d.location?.warehouse?.name})</span>
                  </span>
                </Td>
                <Td>
                  <span className="text-xs font-medium text-slate-700">{d.lines.length} item line{d.lines.length !== 1 ? "s" : ""}</span>
                </Td>
                <Td><Badge status={d.status} /></Td>
                <Td><span className="text-xs text-slate-400">{formatDate(d.created_at)}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetail(d)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} /> Manage
                    </button>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Table>
      </div>

      {/* New Delivery Modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Create Outgoing Delivery Order"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button form="delivery-form" type="submit" loading={saving}>Create Delivery</Button>
          </>
        }
      >
        <form id="delivery-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Customer Name</label>
              <input
                value={form.customer}
                onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                placeholder="e.g. Acme Corporation"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Source Warehouse Location</label>
              <select
                value={form.location_id}
                onChange={(e) => setForm((f) => ({ ...f, location_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="text-xs font-semibold uppercase text-slate-700">Line Items to Fulfill</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-600 font-semibold hover:underline">
                + Add Item Line
              </button>
            </div>

            <div className="space-y-2">
              {form.lines.map((line, i) => {
                const currentStock = getStockByLocation(line.product_id, form.location_id);
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
                    <span className="text-[11px] text-slate-500 w-24">Avail: {currentStock}</span>
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

      {/* Pick / Pack / Validate Workflow Modal */}
      {showDetail && (
        <Modal
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
          title={`Delivery Order — ${showDetail.reference}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="secondary" onClick={() => setShowDetail(null)}>Close</Button>
              <div className="flex items-center gap-2">
                {showDetail.status === "draft" && (
                  <Button onClick={() => handleAdvanceStatus(showDetail, "waiting")} loading={updating}>
                    Mark as Picked (Waiting) <ArrowRight size={14} />
                  </Button>
                )}
                {showDetail.status === "waiting" && (
                  <Button onClick={() => handleAdvanceStatus(showDetail, "ready")} loading={updating}>
                    Mark as Packed (Ready) <ArrowRight size={14} />
                  </Button>
                )}
                {(showDetail.status === "ready" || showDetail.status === "draft") && (
                  <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => handleAdvanceStatus(showDetail, "done")} loading={updating}>
                    <CheckCircle2 size={16} /> Validate & Ship Out
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Step Stepper */}
            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1.5 font-bold ${["draft", "waiting", "ready", "done"].includes(showDetail.status) ? "text-blue-700" : "text-slate-400"}`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                1. Draft
              </div>
              <ChevronSeparator />
              <div className={`flex items-center gap-1.5 font-bold ${["waiting", "ready", "done"].includes(showDetail.status) ? "text-blue-700" : "text-slate-400"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${["waiting", "ready", "done"].includes(showDetail.status) ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}`}>2</span>
                2. Picked
              </div>
              <ChevronSeparator />
              <div className={`flex items-center gap-1.5 font-bold ${["ready", "done"].includes(showDetail.status) ? "text-blue-700" : "text-slate-400"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${["ready", "done"].includes(showDetail.status) ? "bg-blue-600 text-white" : "bg-slate-300 text-slate-600"}`}>3</span>
                3. Packed
              </div>
              <ChevronSeparator />
              <div className={`flex items-center gap-1.5 font-bold ${showDetail.status === "done" ? "text-green-700" : "text-slate-400"}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${showDetail.status === "done" ? "bg-green-600 text-white" : "bg-slate-300 text-slate-600"}`}>4</span>
                4. Validated
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Customer:</span> <span className="font-semibold text-slate-800">{showDetail.customer}</span></div>
              <div><span className="text-slate-500">Current Status:</span> <Badge status={showDetail.status} /></div>
              <div><span className="text-slate-500">Source Location:</span> <span className="font-semibold text-slate-800">{showDetail.location?.name} ({showDetail.location?.warehouse?.name})</span></div>
              <div><span className="text-slate-500">Order Date:</span> <span className="text-slate-600">{formatDate(showDetail.created_at)}</span></div>
            </div>

            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Ordered Items</h4>
            <Table headers={["Product", "SKU", "Required Qty", "Current Stock at Source"]}>
              {showDetail.lines.map((l) => {
                const stockAtLoc = getStockByLocation(l.product_id, showDetail.location_id);
                const isShort = stockAtLoc < l.quantity;

                return (
                  <Tr key={l.id}>
                    <Td><span className="font-semibold text-slate-800">{l.product?.name}</span></Td>
                    <Td><span className="font-mono text-xs">{l.product?.sku}</span></Td>
                    <Td><span className="font-bold text-slate-900">{l.quantity} {l.product?.unit_of_measure}</span></Td>
                    <Td>
                      <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${isShort ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {stockAtLoc} available
                      </span>
                    </Td>
                  </Tr>
                );
              })}
            </Table>

            {showDetail.status === "done" && (
              <Alert type="success">This order has been validated and dispatched. Inventory was decremented in the ledger.</Alert>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ChevronSeparator() {
  return <span className="text-slate-300 font-bold">›</span>;
}

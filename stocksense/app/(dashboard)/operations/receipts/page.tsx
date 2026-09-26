"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { useStock } from "@/lib/stock-context";
import { Receipt, OperationStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ReceiptsPage() {
  const { receipts, products, locations, createReceipt, validateReceipt } = useStock();

  const [statusFilter, setStatusFilter] = useState<OperationStatus | "all">("all");
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<Receipt | null>(null);
  const [validating, setValidating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New receipt form state
  const [form, setForm] = useState({
    supplier: "",
    location_id: locations[0]?.id || "",
    lines: [{ product_id: products[0]?.id || "", quantity: 10 }],
  });
  const [saving, setSaving] = useState(false);

  const filtered = receipts.filter((r) => statusFilter === "all" || r.status === statusFilter);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const newRec = createReceipt(form.supplier, form.location_id, form.lines);

    setShowNew(false);
    setForm({
      supplier: "",
      location_id: locations[0]?.id || "",
      lines: [{ product_id: products[0]?.id || "", quantity: 10 }],
    });
    setSaving(false);
    setSuccessMsg(`Draft receipt ${newRec.reference} created.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  async function handleValidate(receipt: Receipt) {
    setValidating(true);
    await new Promise((r) => setTimeout(r, 400));
    validateReceipt(receipt.id);
    setSuccessMsg(`Receipt ${receipt.reference} validated — Stock levels updated and logged in Move History.`);
    setShowDetail(null);
    setValidating(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  function addLine() {
    setForm((f) => ({
      ...f,
      lines: [...f.lines, { product_id: products[0]?.id || "", quantity: 5 }],
    }));
  }

  function removeLine(i: number) {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Receipts (Incoming Stock)</h1>
          <p className="text-sm text-slate-500 mt-0.5">Receive inventory from suppliers and increase stock counts</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Receipt
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
            {s === "all" ? "All Receipts" : s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table headers={["Reference", "Supplier", "Destination Location", "Items", "Status", "Date", "Actions"]}>
          {filtered.length === 0 ? (
            <TableEmpty
              message="No receipts found"
              cta={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> New Receipt</Button>}
            />
          ) : (
            filtered.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <span className="font-mono text-xs font-bold text-blue-600">{r.reference}</span>
                </Td>
                <Td><span className="font-semibold text-slate-800">{r.supplier}</span></Td>
                <Td>
                  <span className="text-xs text-slate-600">
                    {r.location?.name} <span className="text-slate-400">({r.location?.warehouse?.name})</span>
                  </span>
                </Td>
                <Td>
                  <span className="text-xs font-medium text-slate-700">{r.lines.length} product line{r.lines.length !== 1 ? "s" : ""}</span>
                </Td>
                <Td><Badge status={r.status} /></Td>
                <Td><span className="text-xs text-slate-400">{formatDate(r.created_at)}</span></Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDetail(r)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                    {r.status !== "done" && r.status !== "canceled" && (
                      <button
                        onClick={() => handleValidate(r)}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 size={12} /> Validate
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Table>
      </div>

      {/* New Receipt Modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Create Incoming Receipt"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button form="receipt-form" type="submit" loading={saving}>Create Receipt</Button>
          </>
        }
      >
        <form id="receipt-form" onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Supplier Name</label>
              <input
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                placeholder="e.g. TechSupply Logistics"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Receive to Warehouse Location</label>
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
              <label className="text-xs font-semibold uppercase text-slate-700">Line Items</label>
              <button type="button" onClick={addLine} className="text-xs text-blue-600 font-semibold hover:underline">
                + Add Item Line
              </button>
            </div>

            <div className="space-y-2">
              {form.lines.map((line, i) => (
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
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* View Detail / Validate Modal */}
      {showDetail && (
        <Modal
          open={!!showDetail}
          onClose={() => setShowDetail(null)}
          title={`Receipt Document — ${showDetail.reference}`}
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDetail(null)}>Close</Button>
              {showDetail.status !== "done" && showDetail.status !== "canceled" && (
                <Button onClick={() => handleValidate(showDetail)} loading={validating}>
                  <CheckCircle2 size={16} /> Validate & Increase Stock
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><span className="text-slate-500">Supplier:</span> <span className="font-semibold text-slate-800">{showDetail.supplier}</span></div>
              <div><span className="text-slate-500">Status:</span> <Badge status={showDetail.status} /></div>
              <div><span className="text-slate-500">Destination:</span> <span className="font-semibold text-slate-800">{showDetail.location?.name} ({showDetail.location?.warehouse?.name})</span></div>
              <div><span className="text-slate-500">Created:</span> <span className="text-slate-600">{formatDate(showDetail.created_at)}</span></div>
            </div>

            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Line Items to Receive</h4>
            <Table headers={["Product", "SKU", "Received Qty"]}>
              {showDetail.lines.map((l) => (
                <Tr key={l.id}>
                  <Td><span className="font-semibold text-slate-800">{l.product?.name}</span></Td>
                  <Td><span className="font-mono text-xs">{l.product?.sku}</span></Td>
                  <Td><span className="font-bold text-green-600">+{l.quantity} {l.product?.unit_of_measure}</span></Td>
                </Tr>
              ))}
            </Table>

            {showDetail.status === "done" && (
              <Alert type="success">This receipt has been validated. Stock levels were increased in the ledger.</Alert>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

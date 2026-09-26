"use client";

import { useState } from "react";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { useStock } from "@/lib/stock-context";
import { formatDate } from "@/lib/utils";

export default function AdjustmentsPage() {
  const { adjustments, products, locations, getStockByLocation, createAdjustment } = useStock();

  const [showNew, setShowNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    product_id: products[0]?.id || "",
    location_id: locations[0]?.id || "",
    counted_qty: 0,
  });

  // Calculate live recorded qty and delta for previewing
  const recordedQty = getStockByLocation(form.product_id, form.location_id);
  const delta = form.counted_qty - recordedQty;
  const selectedProduct = products.find((p) => p.id === form.product_id);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const newAdj = createAdjustment(form.product_id, form.location_id, Number(form.counted_qty));

    setShowNew(false);
    setSaving(false);
    setSuccessMsg(
      `Stock adjustment ${newAdj.reference} completed for ${newAdj.product?.name}. Quantity corrected from ${newAdj.previous_qty} to ${newAdj.counted_qty} (${newAdj.delta >= 0 ? "+" + newAdj.delta : newAdj.delta}).`
    );

    // Reset
    setForm({
      product_id: products[0]?.id || "",
      location_id: locations[0]?.id || "",
      counted_qty: 0,
    });

    setTimeout(() => setSuccessMsg(""), 5000);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Adjustments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Correct inventory counts to align system data with physical counts</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={16} /> New Stock Adjustment
        </Button>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table headers={["Reference", "Product Name & SKU", "Location", "Previous System Qty", "Physical Counted Qty", "Adjustment Delta", "Date"]}>
          {adjustments.length === 0 ? (
            <TableEmpty
              message="No stock adjustments recorded yet"
              cta={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> Perform Adjustment</Button>}
            />
          ) : (
            adjustments.map((a) => (
              <Tr key={a.id}>
                <Td>
                  <span className="font-mono text-xs font-bold text-blue-600">{a.reference}</span>
                </Td>
                <Td>
                  <div>
                    <span className="font-semibold text-slate-900 block">{a.product?.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">{a.product?.sku}</span>
                  </div>
                </Td>
                <Td>
                  <span className="text-xs font-semibold text-slate-700">
                    {a.location?.name} <span className="text-slate-400">({a.location?.warehouse?.name})</span>
                  </span>
                </Td>
                <Td>
                  <span className="text-xs font-mono text-slate-500 font-semibold">{a.previous_qty} {a.product?.unit_of_measure}</span>
                </Td>
                <Td>
                  <span className="text-xs font-mono font-bold text-slate-900">{a.counted_qty} {a.product?.unit_of_measure}</span>
                </Td>
                <Td>
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                      a.delta > 0
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : a.delta < 0
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a.delta > 0 ? <ArrowUpRight size={14} /> : a.delta < 0 ? <ArrowDownRight size={14} /> : null}
                    {a.delta > 0 ? `+${a.delta}` : a.delta} {a.product?.unit_of_measure}
                  </span>
                </Td>
                <Td><span className="text-xs text-slate-400">{formatDate(a.created_at)}</span></Td>
              </Tr>
            ))
          )}
        </Table>
      </div>

      {/* New Adjustment Modal */}
      <Modal
        open={showNew}
        onClose={() => setShowNew(false)}
        title="Perform Physical Stock Count Adjustment"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button form="adjustment-form" type="submit" loading={saving}>Submit Adjustment</Button>
          </>
        }
      >
        <form id="adjustment-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Select Product</label>
            <select
              value={form.product_id}
              onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Select Storage Location</label>
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

          {/* Real-time Recorded vs Physical Comparison Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Recorded System Qty</span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {recordedQty} {selectedProduct?.unit_of_measure}
                </span>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-0.5">Physical Counted Qty</label>
                <input
                  type="number"
                  min={0}
                  value={form.counted_qty}
                  onChange={(e) => setForm((f) => ({ ...f, counted_qty: Number(e.target.value) }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-base font-bold font-mono text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Calculated Delta */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold">Net Adjustment (Delta):</span>
              <span
                className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded ${
                  delta > 0
                    ? "bg-green-100 text-green-800"
                    : delta < 0
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta} {selectedProduct?.unit_of_measure}
              </span>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, Tr, Td, TableEmpty } from "@/components/ui/Table";
import { ColorBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { useStock } from "@/lib/stock-context";
import { UnitOfMeasure, Product } from "@/types";

export default function ProductsPage() {
  const {
    products,
    categories,
    locations,
    getTotalStock,
    getStockByLocation,
    addProduct,
  } = useStock();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  // New product form
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_id: categories[0]?.id || "",
    unit_of_measure: "pcs" as UnitOfMeasure,
    reorder_point: 5,
    initial_stock: 0,
    location_id: locations[0]?.id || "",
  });
  const [saving, setSaving] = useState(false);

  // Filter products
  const filtered = products.filter((p) => {
    const total = getTotalStock(p.id);
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category_id === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = total > p.reorder_point;
    if (stockFilter === "low_stock") matchesStock = total > 0 && total <= p.reorder_point;
    if (stockFilter === "out_of_stock") matchesStock = total === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const newProd = addProduct({
      name: form.name,
      sku: form.sku.toUpperCase(),
      category_id: form.category_id,
      unit_of_measure: form.unit_of_measure,
      reorder_point: Number(form.reorder_point),
      initialStock: Number(form.initial_stock),
      locationId: form.location_id,
    });

    setSuccessMsg(`Product "${newProd.name}" (${newProd.sku}) created successfully.`);
    setShowNewModal(false);
    setSaving(false);

    // Reset form
    setForm({
      name: "",
      sku: "",
      category_id: categories[0]?.id || "",
      unit_of_measure: "pcs",
      reorder_point: 5,
      initial_stock: 0,
      location_id: locations[0]?.id || "",
    });

    setTimeout(() => setSuccessMsg(""), 4000);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage master products, categories, and stock thresholds</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus size={16} /> Add New Product
        </Button>
      </div>

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock status filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as never)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <Table headers={["Product Name", "SKU", "Category", "Total Stock", "Reorder Point", "Status", "Actions"]}>
          {filtered.length === 0 ? (
            <TableEmpty
              message="No products found"
              cta={<Button size="sm" onClick={() => setShowNewModal(true)}><Plus size={14} /> Add Product</Button>}
            />
          ) : (
            filtered.map((p) => {
              const totalStock = getTotalStock(p.id);
              let statusBadge = <ColorBadge label="In Stock" color="green" />;
              if (totalStock === 0) {
                statusBadge = <ColorBadge label="Out of Stock" color="red" />;
              } else if (totalStock <= p.reorder_point) {
                statusBadge = <ColorBadge label="Low Stock" color="amber" />;
              }

              return (
                <Tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        <Package size={16} />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">{p.name}</span>
                        <span className="text-[11px] text-slate-400">Unit: {p.unit_of_measure}</span>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs font-semibold text-slate-700">{p.sku}</span>
                  </Td>
                  <Td>
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {p.category?.name || "Uncategorized"}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-sm font-bold text-slate-900">
                      {totalStock} <span className="text-xs font-normal text-slate-500">{p.unit_of_measure}</span>
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs text-slate-500 font-medium">{p.reorder_point} {p.unit_of_measure}</span>
                  </Td>
                  <Td>{statusBadge}</Td>
                  <Td>
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View Breakdown
                    </button>
                  </Td>
                </Tr>
              );
            })
          )}
        </Table>
      </div>

      {/* Add New Product Modal */}
      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Add New Product"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>
              Cancel
            </Button>
            <Button form="product-form" type="submit" loading={saving}>
              Save Product
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ergonomic Office Desk"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">SKU Code</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="e.g. FU-DSK-009"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit of Measure</label>
              <select
                value={form.unit_of_measure}
                onChange={(e) => setForm((f) => ({ ...f, unit_of_measure: e.target.value as UnitOfMeasure }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="boxes">Boxes</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters</option>
                <option value="pallets">Pallets</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reorder Point</label>
              <input
                type="number"
                min={0}
                value={form.reorder_point}
                onChange={(e) => setForm((f) => ({ ...f, reorder_point: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Initial Stock section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Initial Stock Seeding (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Starting Quantity</label>
                <input
                  type="number"
                  min={0}
                  value={form.initial_stock}
                  onChange={(e) => setForm((f) => ({ ...f, initial_stock: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Store at Location</label>
                <select
                  value={form.location_id}
                  onChange={(e) => setForm((f) => ({ ...f, location_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.warehouse?.name} — {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <Modal
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Stock Breakdown — ${selectedProduct.name}`}
          size="md"
          footer={
            <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">SKU:</span>{" "}
                <span className="font-mono font-bold text-slate-800">{selectedProduct.sku}</span>
              </div>
              <div>
                <span className="text-slate-500">Category:</span>{" "}
                <span className="font-semibold text-slate-800">{selectedProduct.category?.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Total Stock:</span>{" "}
                <span className="font-bold text-blue-600">{getTotalStock(selectedProduct.id)} {selectedProduct.unit_of_measure}</span>
              </div>
              <div>
                <span className="text-slate-500">Reorder Threshold:</span>{" "}
                <span className="font-semibold">{selectedProduct.reorder_point}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Quantity per Location</h4>
            <div className="space-y-2">
              {locations.map((loc) => {
                const qty = getStockByLocation(selectedProduct.id, loc.id);
                return (
                  <div key={loc.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{loc.name}</span>
                      <span className="text-slate-400 ml-2">({loc.warehouse?.name})</span>
                    </div>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${qty > 0 ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                      {qty} {selectedProduct.unit_of_measure}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

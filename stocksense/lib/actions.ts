/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { prisma } from "@/lib/prisma";

export async function fetchAllData() {
  const [
    categoriesRaw,
    products,
    warehouses,
    locations,
    stockLevels,
    receipts,
    deliveries,
    transfers,
    adjustments,
    ledger
  ] = await Promise.all([
    prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
    prisma.product.findMany(),
    prisma.warehouse.findMany(),
    prisma.location.findMany({ include: { warehouse: true } }),
    prisma.stockLevel.findMany({ include: { product: true, location: { include: { warehouse: true } } } }),
    prisma.receipt.findMany({ include: { location: { include: { warehouse: true } }, lines: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.deliveryOrder.findMany({ include: { location: { include: { warehouse: true } }, lines: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.internalTransfer.findMany({ include: { fromLocation: { include: { warehouse: true } }, toLocation: { include: { warehouse: true } }, lines: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.adjustment.findMany({ include: { product: true, location: { include: { warehouse: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.stockLedger.findMany({ include: { product: true, location: { include: { warehouse: true } } }, orderBy: { createdAt: 'desc' } }),
  ]);

  const categories = categoriesRaw.map((c, i) => ({ id: `cat-${i}`, name: c.category }));

  return {
    categories,
    products: products.map(p => ({
      id: String(p.id),
      name: p.name,
      sku: p.sku,
      category_id: p.category,
      category: { id: p.category, name: p.category },
      unit_of_measure: p.unitOfMeasure,
      reorder_point: 50,
      created_at: p.createdAt.toISOString()
    })),
    warehouses: warehouses.map(w => ({
      id: String(w.id),
      name: w.name,
      code: `WH${w.id}`,
      address: '',
      kind: 'warehouse'
    })),
    locations: locations.map((l: any) => ({
      id: String(l.id),
      warehouse_id: String(l.warehouseId),
      warehouse: { id: String(l.warehouse.id), name: l.warehouse.name, code: `WH${l.warehouse.id}`, kind: 'warehouse' },
      name: l.name,
    })),
    stockLevels: stockLevels.map((s: any) => ({
      id: String(s.id),
      product_id: String(s.productId),
      location_id: String(s.locationId),
      location: { id: String(s.location.id), name: s.location.name, warehouse: { id: String(s.location.warehouse.id), name: s.location.warehouse.name } },
      quantity: s.quantity,
    })),
    receipts: receipts.map((r: any) => ({
      id: String(r.id),
      reference: `REC-${r.id.toString().padStart(3, "0")}`,
      supplier: r.supplier,
      status: r.status,
      location_id: String(r.locationId),
      location: { id: String(r.location.id), name: r.location.name, warehouse: { id: String(r.location.warehouse.id), name: r.location.warehouse.name } },
      lines: r.lines.map((l: any) => ({
        id: String(l.id),
        receipt_id: String(l.receiptId),
        product_id: String(l.productId),
        quantity: l.quantity,
      })),
      created_by: "system",
      created_at: r.createdAt.toISOString(),
    })),
    deliveries: deliveries.map((d: any) => ({
      id: String(d.id),
      reference: `DEL-${d.id.toString().padStart(3, "0")}`,
      customer: d.customer,
      status: d.status,
      location_id: String(d.locationId),
      location: { id: String(d.location.id), name: d.location.name, warehouse: { id: String(d.location.warehouse.id), name: d.location.warehouse.name } },
      lines: d.lines.map((l: any) => ({
        id: String(l.id),
        delivery_id: String(l.deliveryId),
        product_id: String(l.productId),
        quantity: l.quantity,
      })),
      created_by: "system",
      created_at: d.createdAt.toISOString(),
    })),
    transfers: transfers.map((t: any) => ({
      id: String(t.id),
      reference: `INT-${t.id.toString().padStart(3, "0")}`,
      from_location_id: String(t.fromLocationId),
      from_location: { id: String(t.fromLocation.id), name: t.fromLocation.name, warehouse: { id: String(t.fromLocation.warehouse.id), name: t.fromLocation.warehouse.name } },
      to_location_id: String(t.toLocationId),
      to_location: { id: String(t.toLocation.id), name: t.toLocation.name, warehouse: { id: String(t.toLocation.warehouse.id), name: t.toLocation.warehouse.name } },
      status: t.status,
      lines: t.lines.map((l: any) => ({
        id: String(l.id),
        transfer_id: String(l.transferId),
        product_id: String(l.productId),
        quantity: l.quantity,
      })),
      created_by: "system",
      created_at: t.createdAt.toISOString(),
    })),
    adjustments: adjustments.map((a: any) => ({
      id: String(a.id),
      reference: `ADJ-${a.id.toString().padStart(3, "0")}`,
      product_id: String(a.productId),
      product: { id: String(a.product.id), name: a.product.name },
      location_id: String(a.locationId),
      location: { id: String(a.location.id), name: a.location.name, warehouse: { id: String(a.location.warehouse.id), name: a.location.warehouse.name } },
      counted_qty: a.countedQty,
      previous_qty: a.countedQty - a.delta,
      delta: a.delta,
      status: "done",
      created_by: "system",
      created_at: a.createdAt.toISOString(),
    })),
    ledger: ledger.map((l: any) => ({
      id: String(l.id),
      product_id: String(l.productId),
      product: { id: String(l.product.id), name: l.product.name },
      location_id: String(l.locationId),
      location: { id: String(l.location.id), name: l.location.name, warehouse: { id: String(l.location.warehouse.id), name: l.location.warehouse.name } },
      change_qty: l.changeQty,
      doc_type: l.docType,
      doc_id: String(l.docId),
      note: l.docType,
      created_at: l.createdAt.toISOString(),
    }))
  };
}

export async function addProductAction(input: any) {
  const prod = await prisma.product.create({
    data: {
      name: input.name,
      sku: input.sku,
      category: input.category_id,
      unitOfMeasure: input.unit_of_measure,
    }
  });

  if (input.initialStock && input.initialStock > 0 && input.locationId) {
    await prisma.$transaction([
      prisma.stockLevel.create({
        data: {
          productId: prod.id,
          locationId: parseInt(input.locationId, 10),
          quantity: input.initialStock,
        }
      }),
      prisma.stockLedger.create({
        data: {
          productId: prod.id,
          locationId: parseInt(input.locationId, 10),
          changeQty: input.initialStock,
          docType: "receipt",
          docId: 0,
        }
      })
    ]);
  }
  return true;
}

export async function createReceiptAction(supplier: string, locationId: string, lines: { product_id: string; quantity: number }[]) {
  await prisma.receipt.create({
    data: {
      supplier,
      locationId: parseInt(locationId, 10),
      status: "draft",
      lines: {
        create: lines.map(l => ({
          productId: parseInt(l.product_id, 10),
          quantity: l.quantity,
        }))
      }
    }
  });
  return true;
}

export async function validateReceiptAction(receiptId: string) {
  const rId = parseInt(receiptId, 10);
  const rec = await prisma.receipt.findUnique({ where: { id: rId }, include: { lines: true } });
  if (!rec || rec.status === "done") return;

  await prisma.$transaction(async (tx) => {
    await tx.receipt.update({ where: { id: rId }, data: { status: "done" } });

    for (const line of rec.lines) {
      const existing = await tx.stockLevel.findUnique({
        where: { productId_locationId: { productId: line.productId, locationId: rec.locationId } }
      });
      if (existing) {
        await tx.stockLevel.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + line.quantity }
        });
      } else {
        await tx.stockLevel.create({
          data: { productId: line.productId, locationId: rec.locationId, quantity: line.quantity }
        });
      }

      await tx.stockLedger.create({
        data: {
          productId: line.productId,
          locationId: rec.locationId,
          changeQty: line.quantity,
          docType: "receipt",
          docId: rId,
        }
      });
    }
  });
  return true;
}

export async function createDeliveryAction(customer: string, locationId: string, lines: { product_id: string; quantity: number }[]) {
  await prisma.deliveryOrder.create({
    data: {
      customer,
      locationId: parseInt(locationId, 10),
      status: "draft",
      lines: {
        create: lines.map(l => ({
          productId: parseInt(l.product_id, 10),
          quantity: l.quantity,
        }))
      }
    }
  });
  return true;
}

export async function updateDeliveryStatusAction(deliveryId: string, status: string) {
  const dId = parseInt(deliveryId, 10);
  const del = await prisma.deliveryOrder.findUnique({ where: { id: dId }, include: { lines: true } });
  if (!del || del.status === "done") return;

  if (status === "done") {
    await prisma.$transaction(async (tx) => {
      await tx.deliveryOrder.update({ where: { id: dId }, data: { status: "done" } });

      for (const line of del.lines) {
        const existing = await tx.stockLevel.findUnique({
          where: { productId_locationId: { productId: line.productId, locationId: del.locationId } }
        });
        if (existing) {
          await tx.stockLevel.update({
            where: { id: existing.id },
            data: { quantity: Math.max(0, existing.quantity - line.quantity) }
          });
        }

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            locationId: del.locationId,
            changeQty: -line.quantity,
            docType: "delivery",
            docId: dId,
          }
        });
      }
    });
  } else {
    await prisma.deliveryOrder.update({ where: { id: dId }, data: { status } });
  }
  return true;
}

export async function createTransferAction(fromLocationId: string, toLocationId: string, lines: { product_id: string; quantity: number }[]) {
  await prisma.internalTransfer.create({
    data: {
      fromLocationId: parseInt(fromLocationId, 10),
      toLocationId: parseInt(toLocationId, 10),
      status: "draft",
      lines: {
        create: lines.map(l => ({
          productId: parseInt(l.product_id, 10),
          quantity: l.quantity,
        }))
      }
    }
  });
  return true;
}

export async function validateTransferAction(transferId: string) {
  const tId = parseInt(transferId, 10);
  const tr = await prisma.internalTransfer.findUnique({ where: { id: tId }, include: { lines: true } });
  if (!tr || tr.status === "done") return;

  await prisma.$transaction(async (tx) => {
    await tx.internalTransfer.update({ where: { id: tId }, data: { status: "done" } });

    for (const line of tr.lines) {
      const existingFrom = await tx.stockLevel.findUnique({
        where: { productId_locationId: { productId: line.productId, locationId: tr.fromLocationId } }
      });
      if (existingFrom) {
        await tx.stockLevel.update({
          where: { id: existingFrom.id },
          data: { quantity: Math.max(0, existingFrom.quantity - line.quantity) }
        });
      }

      const existingTo = await tx.stockLevel.findUnique({
        where: { productId_locationId: { productId: line.productId, locationId: tr.toLocationId } }
      });
      if (existingTo) {
        await tx.stockLevel.update({
          where: { id: existingTo.id },
          data: { quantity: existingTo.quantity + line.quantity }
        });
      } else {
        await tx.stockLevel.create({
          data: { productId: line.productId, locationId: tr.toLocationId, quantity: line.quantity }
        });
      }

      await tx.stockLedger.create({
        data: {
          productId: line.productId,
          locationId: tr.fromLocationId,
          changeQty: -line.quantity,
          docType: "transfer",
          docId: tId,
        }
      });

      await tx.stockLedger.create({
        data: {
          productId: line.productId,
          locationId: tr.toLocationId,
          changeQty: line.quantity,
          docType: "transfer",
          docId: tId,
        }
      });
    }
  });
  return true;
}

export async function createAdjustmentAction(productId: string, locationId: string, countedQty: number) {
  const pId = parseInt(productId, 10);
  const lId = parseInt(locationId, 10);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.stockLevel.findUnique({
      where: { productId_locationId: { productId: pId, locationId: lId } }
    });
    
    const prevQty = existing ? existing.quantity : 0;
    const delta = countedQty - prevQty;

    if (existing) {
      await tx.stockLevel.update({
        where: { id: existing.id },
        data: { quantity: countedQty }
      });
    } else {
      await tx.stockLevel.create({
        data: { productId: pId, locationId: lId, quantity: countedQty }
      });
    }

    const adj = await tx.adjustment.create({
      data: {
        productId: pId,
        locationId: lId,
        countedQty,
        delta,
      }
    });

    await tx.stockLedger.create({
      data: {
        productId: pId,
        locationId: lId,
        changeQty: delta,
        docType: "adjustment",
        docId: adj.id,
      }
    });
  });
  return true;
}

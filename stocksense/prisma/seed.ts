import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data (children first, to satisfy FK constraints)
  await prisma.stockLedger.deleteMany()
  await prisma.adjustment.deleteMany()
  await prisma.transferLine.deleteMany()
  await prisma.internalTransfer.deleteMany()
  await prisma.deliveryLine.deleteMany()
  await prisma.deliveryOrder.deleteMany()
  await prisma.receiptLine.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.stockLevel.deleteMany()
  await prisma.product.deleteMany()
  await prisma.location.deleteMany()
  await prisma.warehouse.deleteMany()

  await prisma.$transaction(async (tx) => {
    // 1. Warehouses
    const w1 = await tx.warehouse.create({ data: { name: 'Main Warehouse' } })
    const w2 = await tx.warehouse.create({ data: { name: 'Secondary Warehouse' } })

    // 2. Locations
    const l1 = await tx.location.create({ data: { name: 'Rack A', warehouseId: w1.id } })
    const l2 = await tx.location.create({ data: { name: 'Rack B', warehouseId: w2.id } })
    const prodFloor = await tx.location.create({ data: { name: 'Production Floor', warehouseId: w1.id } })

    const locations = [l1, l2, prodFloor]

    // 3. Products
    const productsData = [
      { name: 'Steel Rods', sku: 'SR-001', category: 'Raw Materials', unitOfMeasure: 'pcs' },
      { name: 'Copper Sheets', sku: 'CS-002', category: 'Raw Materials', unitOfMeasure: 'sheets' },
      { name: 'Industrial Bolts', sku: 'IB-003', category: 'Hardware', unitOfMeasure: 'boxes' },
      { name: 'Safety Gloves', sku: 'SG-004', category: 'PPE', unitOfMeasure: 'pairs' },
      { name: 'Welding Wire', sku: 'WW-005', category: 'Consumables', unitOfMeasure: 'kg' },
      { name: 'Aluminium Plates', sku: 'AP-006', category: 'Raw Materials', unitOfMeasure: 'sheets' },
      { name: 'Packaging Boxes', sku: 'PB-007', category: 'Packaging', unitOfMeasure: 'boxes' },
      { name: 'Hydraulic Seals', sku: 'HS-008', category: 'Hardware', unitOfMeasure: 'pcs' },
    ]

    const createdProducts = []
    for (const p of productsData) {
      const prod = await tx.product.create({ data: p })
      createdProducts.push(prod)
    }

    // 4. Stock levels — spread each product across all three locations,
    // and write a matching ledger entry so the audit trail reconciles from the start
    for (const prod of createdProducts) {
      for (const loc of locations) {
        const quantity = Math.floor(Math.random() * 500) + 100

        await tx.stockLevel.create({
          data: {
            productId: prod.id,
            locationId: loc.id,
            quantity,
          }
        })

        await tx.stockLedger.create({
          data: {
            productId: prod.id,
            locationId: loc.id,
            changeQty: quantity,
            docType: 'seed',
            docId: 0,
          }
        })
      }
    }
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
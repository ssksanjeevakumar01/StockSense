# System Architecture
## StockSense – Inventory Management System

This document describes the overall system architecture, technology stack, folder structure, data flow, database schema, and key design decisions for the StockSense application.

## 1. High-Level Architecture
StockSense follows a modern full-stack architecture using Next.js and Supabase.

```
User → Next.js Frontend (UI/Client) → Next.js Backend (Server Actions / API Routes) → Supabase (PostgreSQL + Auth + Storage)
```

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js (App Router) | UI framework |
| Language | TypeScript | Type safety and better developer experience |
| Styling | Tailwind CSS | Modern and responsive UI |
| Backend | Next.js Server Actions / API Routes | Backend logic and API endpoints |
| Database | Supabase (PostgreSQL) | Database and real-time capabilities |
| Authentication | Supabase Auth | User authentication and authorization (incl. OTP reset) |
| Storage | Supabase Storage | File uploads (if required, e.g. product images) |
| Deployment | Vercel | Hosting and deployment |
| Version Control | Git + GitHub | Source code management |

## 3. Folder Structure

```
stocksense/
├── docs/                    # PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY
├── src/
│   ├── app/                 # Next.js app router (pages, layouts)
│   │   ├── (auth)/          # login, signup, reset-password
│   │   └── (dashboard)/     # dashboard, products, operations, settings, profile
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature-based modules (products, receipts, deliveries, transfers, adjustments)
│   ├── lib/                 # Supabase client, helpers, utilities
│   ├── services/            # Common business logic / external service calls
│   └── types/                # TypeScript interfaces and types
├── tests/
├── public/
├── .env.example
├── package.json
└── tsconfig.json
```

## 4. Data Flow
1. User authenticates via Supabase Auth.
2. Dashboard queries aggregate views (stock levels, pending docs) from Supabase.
3. Creating a Receipt/Delivery/Transfer/Adjustment writes a draft record.
4. On **Validate**, a server action updates the relevant `stock_levels` row(s) and inserts a row into `stock_ledger` (the audit trail).
5. Real-time subscriptions (Supabase Realtime) push stock level changes back to the dashboard/KPIs.

## 5. Database Schema (core tables)

| Table | Key Columns | Purpose |
|---|---|---|
| `products` | id, name, sku, category_id, unit_of_measure, created_at | Product master data |
| `categories` | id, name | Product categories |
| `warehouses` | id, name, address | Top-level storage sites |
| `locations` | id, warehouse_id, name (e.g. Rack A) | Sub-locations within a warehouse |
| `stock_levels` | id, product_id, location_id, quantity | Current stock per product per location |
| `receipts` | id, supplier, status, created_by, created_at | Incoming stock documents |
| `receipt_lines` | id, receipt_id, product_id, quantity | Line items per receipt |
| `delivery_orders` | id, customer, status, created_by, created_at | Outgoing stock documents |
| `delivery_lines` | id, delivery_id, product_id, quantity | Line items per delivery |
| `internal_transfers` | id, from_location_id, to_location_id, status | Internal stock moves |
| `transfer_lines` | id, transfer_id, product_id, quantity | Line items per transfer |
| `adjustments` | id, product_id, location_id, counted_qty, delta, created_by | Stock corrections |
| `stock_ledger` | id, product_id, location_id, change_qty, doc_type, doc_id, created_at | Full audit trail of every movement |
| `users` | id, name, email, role | App users (Manager / Warehouse Staff) |

## 6. Key Design Decisions
- **Status workflow** for all operation types: Draft → Waiting → Ready → Done / Canceled.
- **Stock ledger as source of truth**: `stock_levels` is a derived/cached total; every change is always paired with a `stock_ledger` entry so history is never lost.
- **Multi-warehouse from day one**: `locations` are always scoped to a `warehouse_id`, so reporting and transfers work across sites without a schema change later.

## 7. Security Considerations
- Row-Level Security (RLS) in Supabase scoped by user role (Manager vs Warehouse Staff).
- OTP-based password reset instead of plain email links.
- All stock-changing actions run through server-side validation (never trust client-submitted quantities directly).

## 8. Scalability & Future Enhancements
- Barcode/QR scanning for picking and receiving.
- Reorder automation (auto-generate draft receipts when stock < reorder point).
- Reporting/analytics module (stock turnover, aging inventory).

## 9. External Services
- Supabase (DB, Auth, Storage, Realtime)
- Vercel (hosting)

## 10. Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 11. Summary
StockSense uses a lean Next.js + Supabase stack to deliver real-time, auditable inventory tracking across multiple warehouses, with every stock change routed through a single ledger for full traceability.

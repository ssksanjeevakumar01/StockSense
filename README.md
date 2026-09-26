<div align="center">

# StockSense

**Modular Inventory Management System — ledger-first stock tracking for warehouses, locations, and every movement in between.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.6-000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.2-087ea4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma 5](https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![SQLite](https://img.shields.io/badge/SQLite-3-003b57?logo=sqlite&logoColor=white)](https://sqlite.org)

</div>

---

> ### ⚠️ Read this first — project status
>
> StockSense is an **actively developed prototype / course project**, not a production system.
>
> - The **UI, data model, and business workflows are real and working** — products, receipts, deliveries, transfers, adjustments, and the stock ledger all render and behave correctly on screen.
> - The **persistence layer has a known bug**: documents you create *in the same browser session* are held in optimistic client state, and validating them does **not** write through to the database. Reload the page and the change is gone. Documents loaded from the seed data *do* validate and persist correctly.
> - **Authentication is a mock.** There is no real auth, no session, and no route protection — every page is publicly reachable.
> - **There is no live deployment.** The app runs locally only; the SQLite datasource cannot persist on a serverless host. See [limitation 9](#9-not-deployed--the-sqlite-datasource-blocks-serverless-hosting).
> - **There are no tests.**
>
> See [Known Limitations](#-known-limitations-read-before-relying-on-this) for the full, specific list. Nothing in this README overstates what the code does.

---

## Table of Contents

- [What StockSense Is](#what-stocksense-is)
- [A Note on the Repository Name](#-a-note-on-the-repository-name)
- [Feature Tour](#-feature-tour)
- [The Core Invariant: Ledger-First Stock](#-the-core-invariant-ledger-first-stock)
- [Document Status Workflow](#-document-status-workflow)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Demo Account](#-demo-account)
- [Project Structure](#-project-structure)
- [Data Model](#-data-model)
- [Server Actions (the API Surface)](#-server-actions-the-api-surface)
- [Design System](#-design-system)
- [Seed Data](#-seed-data)
- [Known Limitations (read before relying on this)](#-known-limitations-read-before-relying-on-this)
- [Roadmap & Task Status](#-roadmap--task-status)
- [Contributing](#-contributing)
- [Design Documents](#-design-documents)

---

## What StockSense Is

StockSense is an **Inventory Management System (IMS)** that replaces manual registers, spreadsheets, and disconnected tracking with a single centralised application. It covers the full stock lifecycle:

| Lifecycle stage | Capability |
|---|---|
| **Receive** | Inbound receipts — create a draft, add supplier + lines, validate to increase stock |
| **Pick & ship** | Delivery orders — a 4-stage pick → pack → validate flow, stock decreases on validation |
| **Move** | Internal transfers between locations/warehouses, logged as two ledger entries |
| **Count** | Physical stock count adjustments with an auto-computed delta |
| **Audit** | An append-only stock ledger — every movement, forever, filterable and searchable |
| **Monitor** | Dashboard KPIs, low-stock and out-of-stock alerts, per-location breakdowns |

The target users are **Inventory Managers** (incoming/outgoing oversight, reporting) and **Warehouse Staff** (picking, shelving, transfers, counting). The UI is deliberately built for a warehouse floor: large touch targets, high-contrast status badges, sticky tables, and status never communicated by colour alone.

**What it is not:** despite the original `Odoo-stocksence` folder name, this project contains **no Odoo and no Python at all**. It is a standalone Next.js + TypeScript application. See below.

## A Note on the Repository Name

The containing folder was originally named `Odoo-stocksence`, but the project pivoted away from Odoo during planning and was built as a standalone **Next.js 16 + Prisma + SQLite** app instead. The folder name is a historical artifact. There is no `__manifest__.py`, no `models/`, no `controllers/`, and no OCA dependency anywhere in this repository.

The design documents at the root of this repo (written during the original planning phase) still describe a **Supabase / PostgreSQL** backend. That backend was never built. Treat those documents as **design intent**, not as a description of the code. See [Design Documents](#design-documents).

---

## Feature Tour

| Route | What it does |
|---|---|
| `/login` · `/signup` | Mock auth. Any non-empty email + password works. One-click demo sign-in button. |
| `/dashboard` | 5 KPI tiles (Total Products, Low Stock Alert, Pending Receipts, Pending Deliveries, Scheduled Transfers), red/amber alert banners for out-of-stock and low-stock SKUs, a merged recent-activity feed filterable by document type and status, and a per-location stock breakdown panel. |
| `/products` | Product list with name/SKU search, category filter, and stock-status filter (`in_stock` / `low_stock` / `out_of_stock`). "View Breakdown" modal shows quantity per location. "Add New Product" modal captures name, auto-uppercased SKU, category, unit of measure, reorder point, and **optional initial-stock seeding** (quantity + location). |
| `/operations/receipts` | Status filter pills (all / draft / waiting / ready / done / canceled). Create-receipt modal with a dynamic multi-line editor. Detail modal lists lines and offers **"Validate & Increase Stock"**. |
| `/operations/deliveries` | The richest workflow. Same list/filters. Create-delivery modal shows **live per-line availability** (`Avail: n`). Detail modal contains a **4-step visual stepper** (Draft → Picked → Packed → Validated); per-line "Current Stock at Source" chips turn red when short. |
| `/operations/transfers` | Move stock between locations, with source-stock display per line and identical from/to rejection. |
| `/operations/adjustments` | Physical count entry with a **live comparison card** (recorded qty vs. counted qty, delta recomputed on every keystroke). Shows previous system quantity and a signed delta in the table. |
| `/operations/ledger` | "Move History & Audit Ledger" — free-text search across product, SKU, note, and document id; doc-type and location filters; signed change pills. The immutable single source of truth. |

Every create flow is modal-based with dynamic line items. There is **no CSV import, no barcode/QR scanning, and no bulk edit** — these are listed as future work.

## The Core Invariant: Ledger-First Stock

This is the design decision the whole codebase is built around, and it is **genuinely implemented**.

> **No `stock_levels` row is ever written without a matching `stock_ledger` entry in the same transaction.**

`stock_levels` is a *derived cache* — a fast current-balance lookup. The `stock_ledger` is the *source of truth* — an append-only history of every movement. A stock quantity can always be reconstructed by replaying the ledger, so history is never lost, and a bug in the cached total can always be corrected by an adjustment.

Where the invariant is enforced:

- `lib/actions.ts` — every `$transaction` that writes a `stockLevel` (via `update` or `create`) also inserts a `stockLedger` row in the same transaction
- `lib/stock-context.tsx` — the optimistic client mirror applies the same pairing
- `prisma/seed.ts` — all 24 seeded stock levels are each paired with a `seed` ledger row, so the audit trail reconciles from the very first login

Movement semantics:

| Document | Stock effect | Ledger effect |
|---|---|---|
| Receipt validated | `+qty` at destination | one row, `docType: "receipt"`, positive `changeQty` |
| Delivery validated | `−qty` at source (clamped at 0) | one row, `docType: "delivery"`, negative `changeQty` |
| Transfer validated | `−qty` at source, `+qty` at destination | **two** rows, `docType: "transfer"`, signed per location |
| Adjustment created | set to counted quantity | one row, `docType: "adjustment"`, `changeQty` = the delta |

## Document Status Workflow

All four document types (receipts, deliveries, transfers, adjustments) share one status vocabulary, and each status has a fixed colour so the UI is learnable at a glance:

| Status | Colour | Meaning |
|---|---|---|
| `draft` | Grey | Created but not yet actioned |
| `waiting` | Amber | Awaiting a downstream step (e.g. picked) |
| `ready` | Blue | Ready for the final action (e.g. packed) |
| `done` | Green | Validated — stock has been applied and logged |
| `canceled` | Red | Abandoned |

Deliveries advance through the full `draft → waiting → ready → done` chain in the UI. Receipts and transfers are created as `draft` and go straight to `done` on validation.

---

## Tech Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) App Router (`--webpack`) | 16.3.6 |
| UI runtime | [React](https://react.dev) / React DOM | 19.2.8 |
| Language | [TypeScript](https://www.typescriptlang.org) (`strict: true`) | ^5 |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4, CSS-first config | ^4 |
| ORM | [Prisma](https://www.prisma.io) ORM | ^5.22.0 |
| Database | SQLite (`file:./dev.db`) | 3 |
| Icons | [lucide-react](https://lucide.dev) | ^1.48.0 |
| Class merging | `clsx` + `tailwind-merge` | ^2.1.1 / ^3.7.0 |
| Seed runner | `tsx` | ^4.23.15 |
| Lint | ESLint 9 + `eslint-config-next` | ^9 / 16.3.6 |

**Zero required environment variables.** There is no `.env` in this project; Prisma reads its connection string from `schema.prisma` directly.

**Architecture notes:**

- The app is **client-rendered**. All 9 route files and the dashboard layout carry `"use client"`.
- There is **no `app/api/` directory and no REST layer.** All persistence goes through 10 exported Next.js **Server Actions** in `lib/actions.ts`.
- Every page and layout is a client component, so there are no Server Components doing data work.
- There is **no `middleware.ts`**, therefore no route protection.
- `@supabase/supabase-js` is present in `package.json` as a leftover from the abandoned Supabase plan and is **not imported anywhere**.

---

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org) 18.18+ (20 LTS recommended) and npm.

```bash
git clone https://github.com/ssksanjeevakumar01/StockSense.git
cd StockSense/stocksense

npm install

# Generate the Prisma client (required — the client is not committed)
npx prisma generate

# Create prisma/dev.db from the schema (required — the database is not committed)
npx prisma db push

# Load demo data: 2 warehouses, 3 locations, 8 products, 24 stock levels
npx prisma db seed

npm run dev
```

Open **<http://localhost:8080>**.

> **Note the port.** The dev server runs on **8080**, not the Next.js default of 3000 (`next dev -p 8080 --webpack` in `package.json`).

`prisma/dev.db` is intentionally **not** committed to this repository — it is a local build artifact, listed in `.gitignore`. Every new clone must run `db push` + `db seed` before the app will show data. The seed script **wipes and rebuilds** all 12 tables.

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR on port **8080** |
| `npm run build` | Production build |
| `npm start` | Serve the production build — note this is plain `next start`, so it listens on the Next.js default of **3000**, not 8080 |
| `npm run lint` | ESLint |
| `npx prisma db push` | Sync the schema to SQLite (no migrations directory exists) |
| `npx prisma db seed` | Reset and reseed demo data |
| `npx prisma studio` | Browse the database in a GUI |

## Demo Account

There is **no credential check**. Any non-empty email and password signs you in.

| Field | Pre-filled value |
|---|---|
| Email | `manager@stocksense.io` |
| Password | `stocksense2026` |

There is also a **"⚡ One-Click Demo Sign-In"** button on the login page. The session is stored in `localStorage` under `ss_user` — and is never read back by any route.

---

## Project Structure

```
StockSense/
├── README.md              ← you are here
├── PRD.md                  Product requirements (v1.0, Draft)
├── ARCHITECTURE.md         Technical architecture & data-flow spec
├── DESIGN.md               Design system: palette, type, components, a11y
├── RULES.md                Engineering rules the codebase must follow
├── TASKS.md                12-phase build plan
├── MEMORY.md               Session status log
│
└── stocksense/             ← the application
    ├── prisma/
    │   ├── schema.prisma       12 models
    │   └── seed.ts             demo data generator
    ├── app/
    │   ├── (auth)/             login, signup
    │   └── (dashboard)/        dashboard + products + 5 operations pages
    ├── components/ui/          Button, Badge, Card, Table, Modal, Alert
    ├── lib/
    │   ├── actions.ts          Server Actions — the only persistence layer
    │   ├── stock-context.tsx   client state, optimistic updates, all selectors
    │   ├── analytics.ts        reorder/health engine (implemented, NOT wired)
    │   ├── prisma.ts           PrismaClient singleton
    │   └── utils.ts            cn(), date/number formatters
    ├── types/index.ts          full domain model
    └── public/
```

> **Two useful pieces of dead code to know about:** `lib/analytics.ts` (124 lines) is a complete reorder-point and stock-health engine (`reorderSuggestion`, `stockHealth`, `daysRemaining`, `formatCurrency`) that is **implemented but never imported**. The `AskIntent` / `AskResult` natural-language query types in `types/index.ts` are likewise fully specified but unwired. Both are ready to be hooked up.

## Data Model

12 tables. Statuses and `docType` are stored as free-text `String` (no enums or DB constraints).

| Model | Purpose | Key fields |
|---|---|---|
| `Product` | Item master | `sku` (unique), `category`, `unitOfMeasure` |
| `Warehouse` | Top-level site | `name` |
| `Location` | Rack / bin / floor, always scoped to a warehouse | `warehouseId`, `name` |
| `StockLevel` | **Derived** current balance per product+location | `quantity`, `@@unique([productId, locationId])` |
| `Receipt` / `ReceiptLine` | Inbound document + lines | `supplier`, `status`, `locationId` |
| `DeliveryOrder` / `DeliveryLine` | Outbound document + lines | `customer`, `status`, `locationId` |
| `InternalTransfer` / `TransferLine` | Location-to-location move + lines | `fromLocationId`, `toLocationId` |
| `Adjustment` | Physical count reconciliation | `countedQty`, `delta` |
| `StockLedger` | **Source of truth** — append-only movement history | `changeQty`, `docType`, `docId` |

Notes on fidelity: there is no `User` table (the domain `User`/`UserRole` types exist in `types/index.ts` but are unused), no `Category` table (`Product.category` is a plain string), and no `createdBy`, `reference`, `reason`, or `balanceAfter` columns. `fetchAllData()` synthesises `reference` values (`REC-001`, `DEL-001`, …) and back-fills `created_by` as `"system"` at read time.

## Server Actions (the API Surface)

There is no REST API. `lib/actions.ts` exports 10 `"use server"` functions — this *is* the backend:

| Action | Effect |
|---|---|
| `fetchAllData()` | 10 parallel `findMany` queries, mapped to the snake_case view model |
| `addProductAction(input)` | Creates a product; optionally seeds initial stock + a matching `receipt` ledger row |
| `createReceiptAction(supplier, locationId, lines)` | Creates a `draft` receipt with nested lines |
| `validateReceiptAction(receiptId)` | Transaction → `done`, upserts `stockLevel` (+qty), inserts ledger row |
| `createDeliveryAction(customer, locationId, lines)` | Creates a `draft` delivery with nested lines |
| `updateDeliveryStatusAction(deliveryId, status)` | On `done`: decrements `stockLevel` (clamped at 0) + ledger row |
| `createTransferAction(from, to, lines)` | Creates a `draft` transfer |
| `validateTransferAction(transferId)` | Transaction → `done`, decrements source, increments destination, **two** ledger rows |
| `createAdjustmentAction(productId, locationId, countedQty)` | Computes delta, sets level, writes adjustment + ledger row |

Mutations accept loosely-typed `any` input with no schema validation (no zod), and there is no CSRF handling, rate limiting, or server-side role enforcement.

## Design System

Defined in `DESIGN.md` and faithfully implemented in `app/globals.css` and `components/ui/`. Principle: **"Clean. Operational. Trustworthy."**

| Token | Value | Use |
|---|---|---|
| Primary | `#2563EB` | Actions, active nav, focus |
| Success | `#16A34A` | `done` status, positive deltas |
| Warning | `#F59E0B` | `waiting` status, low stock |
| Error | `#DC2626` | `canceled`, out of stock, negative deltas |
| Background | `#F8FAFC` | Page background |
| Surface | `#FFFFFF` | Cards, tables, modals |
| Text primary / secondary | `#0F172A` / `#475569` | Body copy |

- **Type scale:** Inter. H1 28/700, H2 22/600, H3 18/600, body 14/400, small 12/400, caption 11/500. 8px spacing base, ~1280px max content width, 240px collapsible sidebar.
- **Components:** `Button` (4 variants × 3 sizes, inline spinner while `loading`), `Badge` (status→colour map), `Card` / `CardHeader` / `CardBody` / `KpiCard` (5 colour variants), `Table` with `TableEmpty` state, `Modal` (`sm|md|lg`, Escape + backdrop close, `role="dialog"`, `aria-modal`), `Alert` (4 tones).
- **Accessibility:** 4.5:1 minimum contrast, full keyboard navigability, and **status is never conveyed by colour alone** — every badge pairs colour with a text label.
- **Responsive:** breakpoints at 640px and 1024px, targeting desktop and warehouse-floor tablet. Dark mode is out of scope for MVP (tokens reserved).
- **Animation:** minimal, 150–200ms ease-in-out, and never on data tables.

## Seed Data

`npx prisma db seed` wipes and rebuilds all 12 tables, then loads:

- **2 warehouses** — Main Warehouse, Secondary Warehouse
- **3 locations** — Rack A (Main), Rack B (Secondary), Production Floor (Main)
- **8 products across 5 categories**

  | SKU | Product | Category | UoM |
  |---|---|---|---|
  | `SR-001` | Steel Rods | Raw Materials | pcs |
  | `CS-002` | Copper Sheets | Raw Materials | sheets |
  | `IB-003` | Industrial Bolts | Hardware | boxes |
  | `SG-004` | Safety Gloves | PPE | pairs |
  | `WW-005` | Welding Wire | Consumables | kg |
  | `AP-006` | Aluminium Plates | Raw Materials | sheets |
  | `PB-007` | Packaging Boxes | Packaging | boxes |
  | `HS-008` | Hydraulic Seals | Hardware | pcs |

- **24 stock levels** (8 products × 3 locations), each randomly between 100 and 599, **each paired with a `seed` ledger row** so the audit trail reconciles from the start.

> Because seed quantities are `Math.random()`, **reseeding reshuffles all stock numbers.** This is intentional demo noise, not a bug, but it does mean screenshots and numbers are not reproducible.

---

## Known Limitations (read before relying on this)

This section is deliberately specific. Each item was verified against the code.

### 1. In-session document validation does not persist — the main bug

`lib/stock-context.tsx` mints temporary client-side IDs like `` `rec-${Date.now()}` `` (also `del-`, `tr-`, `adj-`, `prod-`, `sl-`, `led-`) and hands them straight to the server actions. Those actions then call `parseInt(receiptId, 10)` — and `parseInt("rec-1758…")` is `NaN`.

**Consequence:**
- Creating a document **does** persist (it only needs real `locationId` / `product_id` values).
- **Validating a document you just created does not persist.** The `findUnique` returns `null` and the action exits early. The rejection is swallowed by `.catch(console.error)`.
- The UI still *looks* correct, because `stock-context.tsx` applies identical arithmetic optimistically to local React state.
- **Reloading the page discards the change.** Validate a seeded receipt and it *will* persist, because seeded rows carry real numeric IDs.

Relevant lines: `stock-context.tsx:204,297,385,508` (temp IDs) vs. `actions.ts:195,249,303,360` (`parseInt`).

### 2. No authentication and no route protection

There is no `middleware.ts`, no session, and no `User` table. `/login` and `/signup` write `localStorage.ss_user` and **never read it back** (3 write sites, 0 read sites). Any non-empty credentials succeed, and every dashboard and operations route is directly reachable. This contradicts `RULES.md` §5, which mandates redirecting unauthenticated users and enforcing roles server-side.

### 3. `reorder_point` is hardcoded to 50 and never stored

`Product` has no `reorder_point` column, and `addProductAction` silently drops the value submitted by the "Add New Product" form. `fetchAllData()` hardcodes `reorder_point: 50` for every product at read time. So the low-stock threshold in the UI is a constant, not a per-product setting — and the value the user typed is discarded.

### 4. Deliveries clamp at zero instead of erroring

`updateDeliveryStatusAction` uses `Math.max(0, qty - line.quantity)`, silently discarding any shortfall. `RULES.md` §6 calls for an explicit "insufficient stock" error; `TASKS.md` 6.5 lists it as a task. The UI *does* flag short lines with a red chip, but the warning is visual only and never blocks validation.

### 5. Optimistic updates never reconcile

There is no revalidation, polling, or realtime. Data loads **once** on mount. `addProduct` assigns `prod-${Date.now()}` client-side while the database assigns a real autoincrement ID, so newly created products go stale at the next load.

### 6. No tests, no CI, no Docker

No test runner, no test files, no `test` script, no GitHub Actions workflow, no Dockerfile, and no container config. `RULES.md` §8 and `TASKS.md` 12.1–12.2 both require tests; neither exists. `lib/analytics.ts` is the obvious first target — it is pure, fully implemented, and currently untested and unwired.

### 7. The design documents describe a different backend

`ARCHITECTURE.md` specifies Supabase (PostgreSQL + Auth + RLS + Storage), a `src/` directory layout, `features/` and `services/` folders, a `tests/` folder, a `.env.example`, and a `users` table with Manager / Warehouse Staff roles. **None of that was built.** The shipped app uses SQLite via Prisma, has no `src/`, no `features/`, no `services/`, no `tests/`, no `.env.example`, and no users table. `TASKS.md` still reports 0 of 33 tasks complete and `MEMORY.md` still says "No code written yet" — both are stale.

### 8. Smaller items

- No `Settings` (warehouse management) or `Profile` pages, though both are in the PRD.
- `DESIGN.md` specifies Inter, but the font is never loaded (no `next/font`, no webfont link) — it silently falls back to system UI fonts.
- `public/` still contains 5 unused `create-next-app` boilerplate SVGs.
- `next.config.ts` is an empty object — no images, rewrites, or security headers.
- No migration directory; the schema is applied with `prisma db push`.
- No license file. The package is marked `private: true`.

### 9. Not deployed — the SQLite datasource blocks serverless hosting

There is no live deployment, and this is a deliberate consequence of the architecture rather than an oversight. `schema.prisma` hardcodes `provider = "sqlite"` with `url = "file:./dev.db"`, and the Server Actions import a Prisma client that writes on every validation.

Serverless hosts (Vercel, Netlify) run each request in a fresh container with a read-only filesystem outside `/tmp`, so `prisma/dev.db` can be neither written nor relied upon to persist between invocations. A deploy as-is would serve the UI while every database-backed page failed at runtime.

To deploy, one of these has to happen first:

| Option | Trade-off |
|---|---|
| Switch the datasource to **Postgres** (e.g. Neon) and supply `DATABASE_URL` | Removes the "zero env vars" property; largest diff |
| Keep SQLite but move to **Turso/libSQL** | Smallest code change, but adds a hosted dependency and a client swap |
| Add a **migration directory** and run `prisma migrate deploy` at build time | Necessary regardless, since there is currently no migrations folder |

Until then, run it locally with the Quick Start above.

## Roadmap & Task Status

`TASKS.md` defines a 12-phase plan. Reality versus the plan:

| Phase | Plan | Actual |
|---|---|---|
| 1 — Setup | Next.js, Tailwind, Git, ESLint | ✅ Mostly — Prettier not configured, Supabase not used |
| 2 — Auth | Signup, login, OTP reset, middleware | 🟡 **Mocked only** — no real auth, no OTP, no middleware |
| 3 — Products | Product + category tables, list, search, reorder rules | 🟡 Partial — no category table, reorder point not persisted |
| 4 — Warehouses | Tables + Settings page | 🟡 Partial — tables only, no Settings page |
| 5 — Receipts | Tables, form, validate → stock + ledger, filters | ✅ Built (with the persistence caveat) |
| 6 — Deliveries | Pick → pack → validate, insufficient-stock error | 🟡 Flow built; error case not implemented |
| 7 — Transfers | From → to, logged as location change | ✅ Built |
| 8 — Adjustments | Counted-qty form, auto-delta, stock + ledger | ✅ Built |
| 9 — Dashboard | KPIs, filters, low-stock banner | ✅ Built (location/category filters missing) |
| 10 — Move History | Ledger table + Move History page | ✅ Built |
| 11 — Profile & Polish | My Profile, logout, responsive pass | ❌ Not started |
| 12 — Testing & Deploy | Unit tests, e2e, Vercel deploy | ❌ Not started |

Highest-value next steps, in order: fix the temp-ID → `parseInt` persistence bug; add `middleware.ts` with real session auth; persist `reorder_point`; add tests around `lib/analytics.ts` and the ledger invariant; implement the insufficient-stock error; then wire up `lib/analytics.ts` for real reorder suggestions.

## Contributing

`RULES.md` is the source of truth for engineering standards. The load-bearing rules:

- **Never hardcode stock quantities and never bypass the ledger.** Every stock-changing action must write to `stock_ledger`; never update `stock_levels` without a matching ledger entry.
- **Never skip validation.** Quantities are validated server-side, and API errors must be clear and actionable (e.g. "insufficient stock").
- **TypeScript, and avoid `any`.** App Router, Tailwind per `DESIGN.md`, and all lint warnings must be clean.
- **Prefer Server Actions** for mutations. Reserve API routes for external callers.
- **Never expose service-role keys client-side.** Sanitize input and rate-limit sensitive requests.
- **Work on feature branches** (`feature/receipts`), keep commits small and scoped, and open focused PRs.
- **Keep the docs current:** update `TASKS.md` as work progresses, `MEMORY.md` at the end of each session, and `ARCHITECTURE.md` if the schema or structure changes.
- **Do not add a new state-management library** without discussion.

**Branch and commit conventions:** feature branches, small focused PRs.

## Design Documents

| Document | Contents |
|---|---|
| [`PRD.md`](./PRD.md) | Product requirements v1.0 — problem, goals, personas, MVP scope, navigation |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Data flow, intended stack, 14-table schema, key decisions, security model, env vars |
| [`DESIGN.md`](./DESIGN.md) | Design system — palette, type scale, components, spacing, breakpoints, states, a11y |
| [`RULES.md`](./RULES.md) | Engineering rules and review checklist |
| [`TASKS.md`](./TASKS.md) | 12-phase build plan (currently stale — see [Roadmap](#roadmap--task-status)) |
| [`MEMORY.md`](./MEMORY.md) | Session status log (currently stale) |

Reference mockup: <https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R>

---

<div align="center">

**StockSense** — built with Next.js, React, Prisma, and Tailwind CSS.

*Prototype status: UI and workflows complete, persistence and auth incomplete. See [Known Limitations](#-known-limitations-read-before-relying-on-this).*

</div>

# Project Memory
## StockSense – Context, Progress & Important Notes

This document keeps track of the current state of the project, important context, ongoing work, decisions, and things to remember. It helps maintain continuity across development sessions and when working with AI assistants.

| Last Updated | Current Phase | Overall Progress | Project Status |
|---|---|---|---|
| Sep 26, 2026 | Phase 1 | 0% | Not Started (docs complete) |

## 1. Current Status
- Documentation (PRD, ARCHITECTURE, RULES, DESIGN, TASKS) drafted based on the StockSense problem statement.
- No code written yet.

## 2. Completed Tasks
| Task | Completed On | Notes |
|---|---|---|
| — | — | — |

## 3. In Progress
| Task | Started On | Expected Completion | Notes |
|---|---|---|---|
| — | — | — | — |

## 4. Upcoming Tasks
- Phase 1: Project Setup (see TASKS.md)

## 5. Important Context
- Core entities: Products, Categories, Warehouses, Locations, Receipts, Delivery Orders, Internal Transfers, Adjustments, Stock Ledger.
- Every stock-changing action must write to `stock_ledger` — this is the single source of truth for audit history.
- Status workflow for all operation docs: Draft → Waiting → Ready → Done / Canceled.
- Reference mockup: https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R

## 6. Known Issues
- None yet.

## 7. Decisions & Rationale
- Chose Next.js + Supabase stack (consistent, fast to build, real-time support out of the box for dashboard KPIs).
- `stock_levels` treated as a cached/derived total, always paired with a `stock_ledger` entry, to avoid ever losing movement history.

## 8. Useful Links
- Mockup: https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R

## 9. Next Steps
1. Scaffold the Next.js project (Phase 1 tasks).
2. Set up Supabase project and core tables (products, warehouses, locations).
3. Build authentication flow.

## 10. Change Log
- Sep 26, 2026 — Initial docs (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY) created from problem statement.

# Project Tasks
## StockSense – Task Breakdown & Development Plan

This document contains the complete list of tasks for building the StockSense application. Tasks are divided into phases with clear deliverables, priorities and status tracking.

**Total Tasks: 33 | Completed: 0 | In Progress: 0 | Not Started: 33**

## Phase 1: Project Setup
Set up the development environment, repository and core configuration.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 1.1 | Initialize Next.js project (TypeScript) | High | Not Started | |
| 1.2 | Configure Tailwind CSS | High | Not Started | Base styles + design tokens from DESIGN.md |
| 1.3 | Set up Git repository | High | Not Started | Push to GitHub |
| 1.4 | Configure ESLint and Prettier | Medium | Not Started | |
| 1.5 | Set up Supabase project | High | Not Started | |

## Phase 2: Authentication
Implement user authentication and protected routes.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 2.1 | Create signup page | High | Not Started | |
| 2.2 | Create login page | High | Not Started | |
| 2.3 | Implement OTP-based password reset | High | Not Started | |
| 2.4 | Protect dashboard/operations routes | High | Not Started | Middleware |

## Phase 3: Product Management
Allow users to create, view, and manage products.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 3.1 | Create `products` & `categories` tables | High | Not Started | |
| 3.2 | Build product creation form | High | Not Started | Name, SKU, category, UoM, initial stock |
| 3.3 | Build product list/table view | High | Not Started | SKU search, filters |
| 3.4 | Add reordering rules field | Medium | Not Started | |

## Phase 4: Warehouses & Locations
Set up multi-warehouse support.

| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 4.1 | Create `warehouses` & `locations` tables | High | Not Started | |
| 4.2 | Build warehouse management page (Settings) | Medium | Not Started | |

## Phase 5: Receipts (Incoming Stock)
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 5.1 | Create `receipts` & `receipt_lines` tables | High | Not Started | |
| 5.2 | Build "new receipt" form (supplier + products + qty) | High | Not Started | |
| 5.3 | Implement Validate action → increase stock + ledger entry | High | Not Started | |
| 5.4 | Build receipts list with status filters | Medium | Not Started | |

## Phase 6: Delivery Orders (Outgoing Stock)
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 6.1 | Create `delivery_orders` & `delivery_lines` tables | High | Not Started | |
| 6.2 | Build pick → pack → validate flow | High | Not Started | |
| 6.3 | Implement Validate action → decrease stock + ledger entry | High | Not Started | |
| 6.4 | Handle insufficient stock error case | Medium | Not Started | |

## Phase 7: Internal Transfers
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 7.1 | Create `internal_transfers` & `transfer_lines` tables | High | Not Started | |
| 7.2 | Build transfer form (from location → to location) | High | Not Started | |
| 7.3 | Log transfer in stock ledger (location change, qty unchanged) | High | Not Started | |

## Phase 8: Stock Adjustments
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 8.1 | Create `adjustments` table | High | Not Started | |
| 8.2 | Build adjustment form (select product/location, enter counted qty) | High | Not Started | |
| 8.3 | Auto-calculate delta and update stock + ledger | High | Not Started | |

## Phase 9: Dashboard
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 9.1 | Build KPI cards (total products, low/out of stock, pending receipts/deliveries, scheduled transfers) | High | Not Started | |
| 9.2 | Build dynamic filters (doc type, status, warehouse, category) | Medium | Not Started | |
| 9.3 | Add low-stock alert banner | Medium | Not Started | |

## Phase 10: Move History & Ledger
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 10.1 | Create `stock_ledger` table | High | Not Started | Central audit trail |
| 10.2 | Build Move History page (full log view) | Medium | Not Started | |

## Phase 11: Profile & Polish
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 11.1 | Build "My Profile" page | Low | Not Started | |
| 11.2 | Implement logout | Low | Not Started | |
| 11.3 | Responsive pass (tablet/desktop) | Medium | Not Started | |

## Phase 12: Testing & Deployment
| # | Task | Priority | Status | Notes |
|---|---|---|---|---|
| 12.1 | Unit tests for stock calculation logic | High | Not Started | |
| 12.2 | End-to-end test of full flow (receive → transfer → deliver → adjust) | High | Not Started | |
| 12.3 | Deploy to Vercel | High | Not Started | |

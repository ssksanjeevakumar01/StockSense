# Product Requirements Document (PRD)
## StockSense – Modular Inventory Management System

| | |
|---|---|
| **Version** | 1.0 |
| **Date** | Sep 26, 2026 |
| **Author** | Team StockSense |
| **Status** | Draft |
| **Target Launch** | MVP (v1.0) |

## 1. Product Overview
StockSense is a modular Inventory Management System (IMS) that digitizes and streamlines all stock-related operations within a business, replacing manual registers, Excel sheets, and scattered tracking methods with a centralized, real-time, easy-to-use app.

## 2. Problem Statement
Businesses often rely on manual registers, spreadsheets, and disconnected tools to track stock. This leads to inaccurate counts, delayed visibility into shortages, and no single source of truth across warehouses and locations.

## 3. Goals
- Provide a centralized, real-time view of inventory across products, warehouses, and locations.
- Digitize the full stock lifecycle: receiving, delivery, transfers, and adjustments.
- Give managers and warehouse staff a simple, fast interface for day-to-day operations.
- Maintain a complete audit trail (stock ledger) of every movement.

## 4. Target Users
- **Inventory Managers** – manage incoming & outgoing stock, oversee reporting.
- **Warehouse Staff** – perform transfers, picking, shelving, and counting.

## 5. Core Features (MVP)

### 5.1 Authentication
- Sign up / log in
- OTP-based password reset
- Redirect to Inventory Dashboard after login

### 5.2 Dashboard
- KPIs: Total Products in Stock, Low Stock / Out of Stock Items, Pending Receipts, Pending Deliveries, Internal Transfers Scheduled
- Dynamic filters: document type (Receipts / Delivery / Internal / Adjustments), status (Draft, Waiting, Ready, Done, Canceled), warehouse/location, product category

### 5.3 Product Management
- Create/update products: Name, SKU/Code, Category, Unit of Measure, Initial stock (optional)
- Stock availability per location
- Product categories
- Reordering rules

### 5.4 Receipts (Incoming Stock)
1. Create a new receipt
2. Add supplier & products
3. Input quantities received
4. Validate → stock increases automatically

### 5.5 Delivery Orders (Outgoing Stock)
1. Pick items
2. Pack items
3. Validate → stock decreases automatically

### 5.6 Internal Transfers
- Move stock between warehouses/racks/locations inside the company
- Every movement logged in the ledger

### 5.7 Stock Adjustments
- Select product/location
- Enter counted quantity
- System auto-updates and logs the adjustment (fixes mismatches between recorded stock and physical count)

### 5.8 Move History
- Full log of every stock movement across receipts, deliveries, transfers, and adjustments

### 5.9 Settings
- Warehouse management (create/edit warehouses & locations)

### 5.10 Profile
- My Profile, Logout

## 6. Additional Features
- Alerts for low stock
- Multi-warehouse support
- SKU search & smart filters

## 7. Navigation Structure
1. Products
2. Operations (Receipts, Delivery Orders, Inventory Adjustment, Move History, Dashboard)
3. Settings (Warehouse)
4. Profile Menu (My Profile, Logout)

## 8. Reference
- Mockup: https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R

# Design System
## StockSense – Clean. Operational. Trustworthy.

This document defines the visual design system, UI components, and user experience guidelines for the StockSense application. The goal is a modern, minimal, warehouse-friendly interface with a consistent look and feel across all pages.

## 1. Design Principles
| Principle | Description |
|---|---|
| **User-Centered** | Simple and intuitive for warehouse staff, not just managers |
| **Minimal & Clean** | Reduce clutter, focus on the current task |
| **Consistent** | Follow a unified design system |
| **Accessible** | Usable for everyone (inclusive design) |
| **Responsive** | Works seamlessly on desktop and tablet (warehouse floor use) |

## 2. Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary | Blue | `#2563EB` |
| Secondary | Slate | `#64748B` |
| Success (stock in) | Green | `#16A34A` |
| Warning (low stock) | Amber | `#F59E0B` |
| Error (stock out / rejected) | Red | `#DC2626` |
| Background | Off-white | `#F8FAFC` |
| Surface | White | `#FFFFFF` |
| Text Primary | Near-black | `#0F172A` |
| Text Secondary | Slate gray | `#475569` |

## 3. Typography
- **Primary font**: Inter — clean, modern, highly legible for data-dense tables.

| Element | Size | Weight | Line Height |
|---|---|---|---|
| H1 | 28px | 700 | 36px |
| H2 | 22px | 600 | 30px |
| H3 | 18px | 600 | 26px |
| Body | 14px | 400 | 20px |
| Small | 12px | 400 | 16px |
| Caption | 11px | 500 | 14px |

## 4. UI Components

### 4.1 Buttons
- Primary (filled blue), Secondary (outline), Destructive (red) — consistent height, rounded-md corners.

### 4.2 Input Fields
- Label above field, clear placeholder, error text below in red.

### 4.3 Cards
- Used for dashboard KPI tiles and product cards. White surface, subtle shadow, rounded-lg.

### 4.4 Badges (Status)
| Status | Color |
|---|---|
| Draft | Gray |
| Waiting | Amber |
| Ready | Blue |
| Done | Green |
| Canceled | Red |

### 4.5 Alerts
- Low stock / out-of-stock banners use the Warning/Error palette with an icon + short message.

### 4.6 Navigation
- Left sidebar: Dashboard, Products, Operations (Receipts, Delivery Orders, Adjustments, Move History), Settings, Profile.
- Active nav item highlighted with primary color background.

### 4.7 Tables
- Used heavily for products, receipts, deliveries, move history. Sticky header, zebra striping optional, row hover state.

### 4.8 Filters
- Dropdown/chip-based filters above tables (document type, status, warehouse, category) per PRD dashboard requirements.

## 5. Spacing & Layout
- **Base unit**: 8px scale — 4 / 8 / 12 / 16 / 24 / 32 / 48px.
- **Max content width**: ~1280px on desktop, centered with side padding.
- **Sidebar width**: 240px fixed (collapsible to icon-only at 64px).
- **Grid**: 12-column grid for dashboard KPI tiles and product grids.

## 6. Component Guide
| Component | Usage |
|---|---|
| Button | Primary actions (Validate, Save, Create) use filled primary; secondary actions use outline |
| Input Field | Forms for products, receipts, deliveries, transfers, adjustments |
| Card | Dashboard KPI tiles, product summary cards |
| Badge | Status of any document (Draft/Waiting/Ready/Done/Canceled) |
| Alert | Low stock warnings, validation errors |
| Table | Products, receipts, deliveries, move history |
| Modal | Quick-create product, confirm destructive actions (delete, cancel document) |
| Tabs | Switching between Receipts / Deliveries / Transfers / Adjustments within Operations |

## 7. Responsive Design

### 7.1 Breakpoints
| Name | Width |
|---|---|
| Mobile | < 640px |
| Tablet | 640–1024px |
| Desktop | > 1024px |

### 7.2 Dashboard Pages
- Desktop: KPI cards in a 4-column row, filters inline above the table.
- Tablet: KPI cards wrap to 2 columns, filters collapse into a dropdown.

### 7.3 Content Pages (Products, Receipts, etc.)
- Desktop: full data table with all columns.
- Tablet/mobile: table collapses to a stacked card-per-row view (priority columns only: name/SKU, status, quantity).

## 8. Animation & Transitions
- Keep motion minimal and functional — this is an operational tool, not a marketing site.
- 150–200ms ease-in-out for hover/focus states, modal open/close, and status badge changes.
- No decorative animation on data tables (avoid distracting warehouse staff during fast data entry).

## 9. Component States

### 9.1 Loading States
- Table rows: skeleton placeholders (gray shimmer blocks) while data fetches.
- Buttons: spinner replaces label during submit (e.g. "Validating…").

### 9.2 Empty States
- Empty product list / no receipts yet: centered icon + short message + primary CTA (e.g. "No receipts yet — Create your first receipt").

### 9.3 Error States
- Inline field errors in red text below the input.
- Form-level errors (e.g. insufficient stock) shown as a red alert banner at the top of the form.

## 10. Dark Mode
- Not required for MVP; tokens below reserved for a future dark theme.

| Token | Light | Dark (reserved) |
|---|---|---|
| Background | `#F8FAFC` | `#0F172A` |
| Surface | `#FFFFFF` | `#1E293B` |
| Text Primary | `#0F172A` | `#F1F5F9` |

## 11. Theme Color
- Primary brand/theme color: `#2563EB` (used for active nav, primary buttons, links, focus rings).

## 12. Accessibility
- Minimum 4.5:1 contrast ratio for text.
- All interactive elements keyboard-navigable.
- Status conveyed by color + text/icon together (not color alone) — critical for the badge system above.

## 13. Examples / Reference
- Mockup: https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R

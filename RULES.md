# Development Rules
## StockSense – Project Guidelines for AI & Human Collaboration

This document defines the development rules, coding standards, and best practices to be followed while building the StockSense application. Both AI assistants and human contributors must follow these guidelines.

## 1. General Principles
- Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making changes.
- Keep the code clean, readable, and well-structured.
- Prioritize simplicity and maintainability.
- Do not duplicate logic. Reuse existing components, utilities, or services.
- Make small, focused changes instead of large, risky edits.
- Do not modify unrelated files.
- Write self-explanatory code with meaningful variable and function names.

## 2. Technology & Coding Standards
- **Language**: Use TypeScript. Avoid `any` unless absolutely necessary.
- **Framework**: Follow Next.js best practices (App Router).
- **Styling**: Use Tailwind CSS and follow the design system in DESIGN.md.
- **Linting**: Follow ESLint configuration. Fix all linting warnings.
- **Formatting**: Use Prettier for consistent code formatting.
- **Dependencies**: Use stable, well-maintained packages/utilities. Avoid unnecessary dependencies.
- **File Naming**: Use clear and consistent naming (e.g. `ReceiptsList.tsx`, `stockLedger.service.ts`).

## 3. Project Structure
- Follow the defined folder structure in ARCHITECTURE.md. Keep things organized and scalable.
- Place reusable UI components in `/components`.
- Feature-specific code should be inside `/features/<feature-name>` (e.g. `/features/receipts`).
- Common business logic / external service calls should be in `/services`.
- Types and interfaces should be placed in `/types`.
- Do not create new folders without a clear reason.

## 4. Database & Backend
- Every stock-changing action (receipt, delivery, transfer, adjustment) must write to `stock_ledger` — never update `stock_levels` without a matching ledger entry.
- All quantity inputs must be validated server-side before writing to the database.
- Use Supabase Row-Level Security policies for all tables containing stock or user data.

## 5. Authentication & Authorization
- All dashboard and operations routes must be protected (redirect unauthenticated users to login).
- Role checks (Inventory Manager vs Warehouse Staff) happen server-side, not just in the UI.

## 6. API Guidelines
- Prefer Next.js Server Actions for mutations; use API routes only when an external caller needs them.
- Return clear error messages for validation failures (e.g. insufficient stock for a delivery).

## 7. Security Requirements
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Sanitize and validate all user input.
- Rate-limit OTP requests for password reset.

## 8. Testing Requirements
- Write unit tests for stock calculation logic (receipts, deliveries, transfers, adjustments).
- Test the full status workflow (Draft → Waiting → Ready → Done/Canceled) for each operation type.

## 9. Git & Version Control
- Use feature branches per module (e.g. `feature/receipts`, `feature/dashboard`).
- Write clear, descriptive commit messages.
- Keep PRs small and scoped to one feature/fix.

## 10. Documentation
- Update TASKS.md as work progresses (mark tasks complete/in progress).
- Update MEMORY.md at the end of each work session with current status and decisions.
- Update ARCHITECTURE.md if the schema or folder structure changes.

## 11. What NOT To Do
- Do not hardcode stock quantities or bypass the ledger.
- Do not skip validation on quantity/location inputs.
- Do not introduce a new state management library without discussion — Next.js/React state + Supabase is sufficient for MVP.
- Do not remove or rewrite completed features without checking TASKS.md and MEMORY.md first.

## 12. Review History
- v1.0 — initial rules drafted alongside PRD/ARCHITECTURE.

# ✦ Brightloop Subscriptions — Staff Operations Hub

A commercial-grade, full-stack subscription and recurring-billing management platform developed for the Hackathon.

Built strictly according to the **Brightloop Design Reference** (`1.html`):
- **Aesthetic**: Deep navy background (`#070B19`), cyan (`#38bdf8`) & blue accents, glassmorphic cards, glowing arch banner, Inter typography.
- **Role**: Dedicated **Staff Operations Dashboard** with daily workflows and strict administrative permission boundary enforcement.
- **Currency**: Indian Rupees (**₹**) across all quotation, subscription, and invoice financial records.

---

## 🛠 Technology Stack

- **Frontend**: React.js (Vite 5), Tailwind CSS, Lucide React, Recharts, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs
- **Database**: MySQL (with Universal SQL Relational Fallback Engine executing parameterized queries)
- **API Architecture**: RESTful endpoints with role-based JWT authentication middleware (`verifyStaff`, `verifyAdmin`)

---

## 🚀 Key Modules & Capabilities

1. **Staff Operations Overview Hub**:
   - Welcome banner with live shift indicator (`Sarah Jenkins • Enterprise Ops Tier 2 • OP-BOS-402`).
   - 6 Real-time KPI Cards: Assigned Customers, Pending Quotations, Accepted Quotations, Active Subscriptions, Unpaid Invoices, Payments Collected.
   - Urgent Operational Action Queue with 1-click status actions.
   - Active Quotation Dispatch Pipeline progress track.
   - Interactive Quick Quotation Builder with real-time ₹ calculation.
   - Real-time Operational Stream synchronized with audit logs.

2. **Customer Management (Customer 360)**:
   - Full client directory with search, status filters, and pagination.
   - Customer registration modal (`POST /api/staff/customers`).
   - Customer 360 intelligence drawer displaying active subscriptions, historical subscriptions, quotations, invoices, payments, outstanding balance, and activity history.

3. **Commercial Quotation Management**:
   - Comprehensive pricing engine calculating:
     $$\text{Unit Price} = \text{Product Base Price} + \text{Variant Extra Price}$$
     $$\text{Subtotal} = \text{Unit Price} \times \text{Quantity}$$
     $$\text{Tax} = (\text{Subtotal} - \text{Discount}) \times \text{Tax Rate}$$
     $$\text{Grand Total} = \text{Subtotal} - \text{Discount} + \text{Tax}$$
   - Full quotation actions: Save Draft, Preview PDF, Dispatch Quote, Client Accept, Client Reject.
   - **Convert to Subscription**: Only ACCEPTED quotations can be converted; duplicate conversions strictly prohibited.
   - Branded, print-ready quotation PDF modal.

4. **Subscription Management**:
   - Complete tracking of subscription agreements (`SUB-YYYY-XXX`).
   - Status transitions (`DRAFT`, `QUOTATION`, `CONFIRMED`, `ACTIVE`, `CLOSED`).
   - Billing schedules, next billing dates, and renewal tracking.

5. **Invoice Management & Billing**:
   - Snapshot line-item pricing ensuring historical integrity.
   - Automated invoice generation upon quotation conversion.
   - Official tax invoice viewer with printable PDF styling.

6. **Payment Management**:
   - Record manual payments (UPI, Bank Transfer / NEFT / RTGS, Card, Cash).
   - Duplicate transaction reference / UTR protection.
   - Automated settlement status calculation (`PAID` only when full total is covered).
   - Official Brightloop Payment Receipt modal.

7. **Overdue Invoice Follow-Up Desk**:
   - 3-tier categorization: 0–7 Days, 8–30 Days, 30+ Days Critical SLA.
   - 1-click copy pre-formatted payment reminder message.

8. **Operational Activity Logs**:
   - Immutable audit trail of staff actions, registrations, dispatches, conversions, and payments.

9. **Strict Permission Enforcement**:
   - Staff accounts are blocked on the backend (HTTP 403 Forbidden) from admin-only routes (creating staff accounts, modifying global products, plans, taxes, or global discount rules).

---

## 🏃 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MySQL (Optional: app connects to MySQL on port 3306 or seamlessly runs the embedded local relational SQL engine)

### 2. Setup & Installation
```bash
# In project root
npm run backend       # Starts backend on http://localhost:5000
npm run frontend      # Starts Vite React dev server on http://localhost:5173
```
Alternatively, build and serve full stack from backend:
```bash
npm run build         # Builds frontend bundle into frontend/dist
npm start             # Starts Express serving both API and UI on http://localhost:5000
```

### 3. Run Automated End-to-End Test Suite
```bash
npm run test:e2e
```
Verifies all 13 steps of the complete workflow:
1. Staff authentication
2. Customer registration
3. Catalog lookup
4. Quotation calculation
5. Quotation dispatch
6. Client acceptance
7. Subscription & Invoice conversion
8. Duplicate conversion protection
9. Invoice snapshot inspection
10. Manual payment recording
11. Duplicate reference protection
12. Staff permission boundary enforcement (HTTP 403)
13. Dashboard KPI auto-updates

---

## 🔑 Demo Credentials

- **Staff Account**: `sarah@brightloop.io` / `password123` (Commercial Operations Tier 2)
- **Admin Account**: `admin@brightloop.io` / `password123` (System Administrator)


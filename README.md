# ✦ Brightloop — Enterprise Subscription & Billing Operations Suite

A commercial-grade, multi-role subscription and recurring-billing management platform. Built with an interconnected architecture linking **Customer Experience**, **Staff Operations**, and **Root Administration** through real-time state synchronization, automated quotation-to-subscription workflows, and official tax invoice generation.

---

## 🚀 Live Portals & Role Gateways

| Role | Login Gateway | Direct Workstation / Dashboard | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Universal Gateway** | [`index.html`](index.html) | [`index.html`](index.html) | Central interactive portal launcher with demo credentials & cross-portal status |
| **Customer Experience** | [`cust_login.html`](cust_login.html) | [`user.html`](user.html) | Product catalogue, plans comparison, quote acceptance, online checkout, payment history |
| **Staff Operations** | [`staff_login.html`](staff_login.html) | [`staff.html`](staff.html) / [`1.html`](1.html) | Real-time shift desk, ₹ quotation builder, manual payment recording (UPI/NEFT/Card), onboarding desk |
| **Admin Console** | [`admin_login.html`](admin_login.html) *(or `admin_logic.html`)* | [`admin.html`](admin.html) | Recurring revenue analytics, add products & pricing plans, staff roster, immutable audit ledger |

---

## 🔑 Demo Credentials

- **Admin Account**: `admin@brightloop.io` / `password123` *(or `admin.ops@brightloop.io`)*
- **Staff Account**: `sarah@brightloop.io` / `password123` *(Desk ID: `OP-BOS-402`, Enterprise Ops Tier 2)*
- **Customer Account**: `elena.v@neovault.tech` / `password123` *(Neovault Technologies Inc.)*

---

## 🔄 Live Cross-Portal Synchronizations

1. **Admin ➔ Customer & Staff (Catalogue & Plans Matrix)**:
   - When Admin provisions a product or configures custom subscription tiers in `admin.html`, updates are stored in `brightloop_products_catalogue`.
   - Both `user.html` (Catalogue & Plans) and `staff.html` (Quotation Engine) dynamically render the new tiers in real-time.

2. **Staff ➔ Customer (Commercial Quotations Workflow)**:
   - Staff uses the interactive Quotation Builder (seats, variants, SLA, billing intervals) to dispatch commercial proposals in Indian Rupees (**₹**).
   - The quotation is stored in `brightloop_quotations` and dispatches an instant unread notification to `user.html`.
   - The customer can review and 1-click **"Accept & Subscribe"**, which automatically activates the contract, provisions the seats, and auto-generates the tax invoice.

3. **Staff ➔ Customer & Admin (Manual Settlements)**:
   - Staff records offline/direct payments (UPI QR, NEFT/RTGS, Card, Cash) via the **Record Manual Payment** modal.
   - The customer's invoice status in `user.html` updates to **Paid**, a payment receipt is issued in **Payment History**, and an immutable trace is logged in the Admin **System Audit Ledger**.

4. **Staff / Customer ➔ Admin (Tenant Onboarding & KPI Auto-Increment)**:
   - Client self-registration via `cust_login.html` or staff enrollment via the **Register Client** modal adds the organization to `brightloop_registered_customers`.
   - Admin’s **Total Customers KPI** updates dynamically, and the organization is listed under Admin's **Customer Organizations** view.

---

## 🛠️ Technology Stack

- **Frontend Portals**: Standalone zero-dependency HTML5 / Tailwind CSS / Vanilla JS dashboards with cosmic glow styling (`#070B18`) and Inter typography.
- **React Frontend**: Vite 5, React 19, Lucide React, Tailwind CSS 4 (`frontend/admin/` and `Hackathon/frontend/`).
- **Backend API**: Node.js, Express.js, JWT Authentication, bcryptjs (`backend/` and `Hackathon/backend/`).
- **Database Architecture**:
  - MySQL relational schema (`backend/database/001_initial_tables.sql` and `Hackathon/backend/database/schema.sql`).
  - Embedded Universal Relational JSON SQL engine for local standalone execution without external database dependencies.

---

## 🏃 Quick Start Guide

### 1. Run the Web Portals
```bash
# In project root:
python3 -m http.server 8080
```
Open **[http://localhost:8080/index.html](http://localhost:8080/index.html)** in any browser.

### 2. Run the Express REST API
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 3. Run Automated End-to-End Test Suite
```bash
cd Hackathon
node test_workflow.js
```
Verifies all 16 steps of the end-to-end commercial subscription lifecycle:
1. Staff authentication & JWT verification
2. Customer onboarding & validation
3. Catalog lookup & dynamic pricing calculation
4. Commercial quotation generation (₹)
5. Quotation dispatch & mailbox delivery
6. Client quote review & acceptance
7. Automatic subscription conversion & invoice creation
8. Duplicate conversion prevention
9. Historical line-item price snapshots
10. Manual payment recording (UPI/Bank Transfer)
11. Duplicate transaction reference protection
12. Role-based permission enforcement (HTTP 403)
13. Dashboard KPI auto-updates
14. Direct subscription contract provisioning
15. Contract pause & resume state transitions
16. Monthly recurring ARR & reports aggregation

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

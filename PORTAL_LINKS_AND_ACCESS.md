# 🍲 HAANDI BY YUMTO — PORTAL LINKS & SYSTEM ACCESS DIRECTORY

> **Live Production Deployment URL:** [https://haandibyyumto.vercel.app](https://haandibyyumto.vercel.app)  
> **Master Authentication Password for Staff:** `Haandi@2026`  
> **Location:** Civic Center, Executive Block, Gulberg Greens, Islamabad  
> **Contact / Helpline:** `0330 0500600`  

---

## 🌐 1. Complete Portal Links Directory

| Portal Name | Route Path | Live Vercel Link | Authorized Roles | Primary Functionality |
| :--- | :--- | :--- | :--- | :--- |
| **🛍️ Customer Storefront** | `/#/` | [https://haandibyyumto.vercel.app/#/](https://haandibyyumto.vercel.app/#/) | Public / All | Browse clay pot handi menu, deals, sector-based delivery, table reservation, and online ordering. |
| **📍 Live Order Tracker** | `/#/track` | [https://haandibyyumto.vercel.app/#/track](https://haandibyyumto.vercel.app/#/track) | Public / All | Real-time OpenStreetMap GPS rider tracking, order progress stepper, and WhatsApp order receipts. |
| **👑 Executive Admin & Chain HQ** | `/#/admin` | [https://haandibyyumto.vercel.app/#/admin](https://haandibyyumto.vercel.app/#/admin) | `OWNER`, `ADMIN` | Multi-branch analytics, sales reporting, branch menu pricing overrides, custom recipes, staff & customer management. |
| **🏦 POS Cashier Terminal** | `/#/pos` | [https://haandibyyumto.vercel.app/#/pos](https://haandibyyumto.vercel.app/#/pos) | `CASHIER`, `MANAGER`, `ADMIN`, `OWNER` | High-speed billing, cash drawer / shift open-close reconciliation, cash denomination tracking, hold bills, and FBR/PRA receipts. |
| **👨‍🍳 Kitchen KDS Display** | `/#/kitchen` | [https://haandibyyumto.vercel.app/#/kitchen](https://haandibyyumto.vercel.app/#/kitchen) | `KITCHEN`, `MANAGER`, `ADMIN`, `OWNER` | Real-time Kitchen Order Tickets (KOT), cooking timer countdowns, handi & charcoal grill preparation status updates. |
| **📋 Floor & Table Manager** | `/#/manager` | [https://haandibyyumto.vercel.app/#/manager](https://haandibyyumto.vercel.app/#/manager) | `MANAGER`, `WAITER`, `ADMIN`, `OWNER` | Visual floorplan layout, table occupancy management, majlis VIP suite bookings, and reservation timelines. |
| **🧑‍🍳 Waiter Order Taker** | `/#/waiter` | [https://haandibyyumto.vercel.app/#/waiter](https://haandibyyumto.vercel.app/#/waiter) | `WAITER`, `MANAGER`, `ADMIN`, `OWNER` | Table-side quick order entry, item modifications, and instant kitchen punching. |
| **🛵 Fleet Rider Portal** | `/#/rider` | [https://haandibyyumto.vercel.app/#/rider](https://haandibyyumto.vercel.app/#/rider) | `RIDER`, `MANAGER`, `ADMIN`, `OWNER` | Active delivery orders, GPS route guidance, direct customer calling, and WhatsApp tracking integration. |

---

## 🔑 2. Staff Login Credentials

All staff and management portals are guarded by **Role-Based Access Control (RBAC)**. Use the credentials below to log into the respective portal:

> **Universal Staff Password:** `Haandi@2026`

| Role | Username | Login Email | Staff Member | Branch | Access Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OWNER / HQ** | `owner` | `owner@haandi.yumto.com` | Sajid Owner (HQ) | All Branches | Full Superadmin Access |
| **EXECUTIVE ADMIN** | `admin` | `admin@haandi.yumto.com` | Executive Admin | All Branches | Full System Management & Reporting |
| **BRANCH MANAGER** | `manager` | `manager@haandi.yumto.com` | Bilal Manager | Islamabad (Gulberg) | Floor, Staff, KDS, POS, & Tables |
| **POS CASHIER** | `cashier` | `cashier@haandi.yumto.com` | Nadia Cashier | Islamabad (Gulberg) | Billing, Shifts, Cash Drawer, Invoices |
| **KITCHEN CHEF** | `kitchen` | `kitchen@haandi.yumto.com` | Chef Tariq | Islamabad (Gulberg) | KDS Kitchen Display & Prep Tickets |
| **FLEET RIDER** | `rider` | `rider@haandi.yumto.com` | Zahid Rider | Islamabad (Gulberg) | Fleet Delivery & GPS Route Portal |
| **WAITER** | `waiter` | `waiter@haandi.yumto.com` | Ali Order Taker | Islamabad (Gulberg) | Table-side Order Terminal |
| **REGISTERED CUSTOMER** | `customer` | `customer@haandi.yumto.com` | Abubakar Customer | Islamabad (Gulberg) | Storefront & Saved Addresses |

---

## 🛡️ 3. Authentication Architecture & Security

### 1. Dedicated Portal Guards (`PortalGate`)
- Restricted staff routes (`/admin`, `/pos`, `/kitchen`, `/rider`, `/manager`, `/waiter`) are wrapped with the secure `PortalGate` component.
- If a user visits a staff portal without signing in or with insufficient role permissions, access is blocked and the secure Staff Authentication screen is presented.
- No dummy 1-click bypass buttons or exposed credentials exist in the login interface.

### 2. Customer Authentication (`AuthModal`)
- Customer login on the storefront features a clean, two-tab layout (**Sign In** and **Create Account**).
- New customers can register with their **Name**, **Email**, **Phone**, and **Password** (min. 6 characters).
- Customer accounts sync seamlessly across localStorage and Google Cloud Firebase Firestore (`users` collection).

### 3. Dual-Engine Data Storage
- **Reactive Local Store (`mockDb.ts` + `localStorage`):** Real-time pub/sub synchronization ensuring instant UI updates with zero latency for cash registers, kitchen timers, table statuses, and order steps.
- **Cloud Backend (`lib/firebase.ts`):** Firebase Authentication and Cloud Firestore configured under project `haandi-web-app` for multi-device sync and external automated webhooks.

---

## 📱 4. Key Workflows

1. **Dine-In Table Ordering Flow:**
   - Selecting **Dine-In** immediately displays the **Table Selection section right at the top** of the storefront.
   - Customers choose their floor (**Ground Floor Royal Majlis**, **1st Floor Executive Hall**, **Rooftop Terrace**) and select an available table before browsing dishes.
   - Adding items to the cart or checking out links directly to the confirmed table and sends KOT tickets to the kitchen.

2. **Real-Time GPS Order Tracking:**
   - Track active orders via `/#/track` or direct URL link `/#/track/[orderId]`.
   - Live stage progression (`PENDING ➔ PREPARING ➔ READY ➔ SHIPPED ➔ DELIVERED`) updates automatically in real-time.
   - Interactive OpenStreetMap route visualizes the moving rider across Gulberg Greens sectors.

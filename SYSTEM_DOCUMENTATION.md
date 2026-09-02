# Enterprise Restaurant Management & Omnichannel Dining Platform
## Comprehensive System Architecture & Functional Specification

---

### Executive Summary

This document provides a generic, brand-agnostic technical specification and functional breakdown of the **Enterprise Restaurant Management & Omnichannel Dining Platform**. The platform is an end-to-end, multi-tier operational ecosystem designed for multi-branch hospitality and food-service operations. It bridges front-of-house customer interactions, real-time kitchen preparation workflows, table reservations with spatial floor-plan management, last-mile delivery dispatching, **dedicated Point of Sale (POS) cashier counter operations**, and centralized chain-level administrative governance into a single cohesive platform.

---

### 1. High-Level System Architecture

The ecosystem employs a distributed, role-tailored architecture operating across both web and native mobile runtime environments.

```
                                  +-----------------------------------------------------------+
                                  |               Centralized Data & Events                   |
                                  |    (Pub/Sub State, Orders, Tables, Shifts, Catalog)        |
                                  +-----------------------------------------------------------+
                                       ^          ^           ^            ^          ^
          +----------------------------+          |           |            |          +------------------+
          |                                       |           |            |                             |
          v                                       v           v            v                             v
+--------------------+                 +------------------+  +------------------+  +----------+  +---------------+
|   Customer Portal  |                 |  Branch Manager  |  |  Kitchen Display |  |  Fleet   |  | POS Cashier   |
|   & Ordering App   |                 | & Dispatch Hub   |  |  System (KDS)    |  |  Rider   |  | Terminal      |
+--------------------+                 +------------------+  +------------------+  +----------+  +---------------+
          |                                       ^
          |                                       |
          +---------------------------------------+
                               |
                               v
               +-------------------------------+
               |    Executive Owner & BI Hub   |
               | (Catalog, Analytics, Branches)|
               +-------------------------------+
```

#### 1.1 Multi-Platform Support
- **Progressive Web Application (PWA) / SuperApp**: Built on a reactive single-page architecture (React 19, TypeScript, modern responsive styling) supporting omnichannel routing across all portals.
- **Hybrid Mobile Containers**: Packaged via native bridge runtimes (Capacitor) for unified Android and iOS deployments.
- **Dedicated Native Mobile Applications**: Independent Flutter modular applications compiled for targeted operational roles (Customer App, Manager Tablet, Kitchen KDS, Rider Handheld, and Executive Dashboard).

---

### 2. Core Functional Subsystems (Role-Based Portals)

The platform enforces strict role separation across five discrete operational domains:

```
+----------------------------------------------------------------------------------------------------+
|                                    FIVE OPERATIONAL MODULES                                        |
+--------------------+-------------------+-------------------+-------------------+-------------------+
| 1. Customer App    | 2. Branch Manager | 3. Kitchen KDS    | 4. Delivery Rider | 5. Owner Admin    |
| - Omnichannel Menu | - Floor Plan Mgmt | - Ticket Queue    | - Task Allocation | - Chain Analytics |
| - Table Booking    | - Table Assign    | - Elapsed Timers  | - Order Routing   | - Menu Catalog    |
| - Order Placement  | - Rider Dispatch  | - Stage Updates   | - COD Collection  | - Multi-Branch    |
| - Live Status      | - Dynamic Surge   | - Priority Flags  | - Proof of Drop   | - Access Policies |
+--------------------+-------------------+-------------------+-------------------+-------------------+
```

---

#### 2.1 Customer Facing Portal & Ordering Application
Designed for high conversion, visual clarity, and seamless user ordering across multiple channels.

- **Multi-Branch Selection & Fulfillment Modes**:
  - Selection of nearest or preferred branch location based on city or territory.
  - Three distinct order channels:
    1. **Dine-In**: Order ahead or on-premise table-bound dining.
    2. **Pick-Up / Takeaway**: Counter collection with scheduled or immediate preparation.
    3. **Doorstep Delivery**: Address-based delivery with real-time transit visibility.
- **Interactive Visual Menu & Catalog Browsing**:
  - Hierarchical categories (e.g., Starters, Signature Platters, Grills, Side Dishes, Desserts, Beverages).
  - Item detail cards featuring imagery, detailed descriptions, prices, and allergen/ingredient summaries.
  - Dynamic Item Variations and Customizations (e.g., portion sizes, cuts, spice levels, add-on dressings).
- **Interactive 2D Floor Plan & Table Reservation Engine**:
  - Interactive graphical floor maps organized by floor level (Ground Floor, Family Halls, Private Cabins, Majlis Suites).
  - Visual seat capacities with dynamic availability indicators (`Available`, `Reserved`, `Occupied`, `Blocked`).
  - Scheduling system supporting date selection, time slot picking, and party size filtering.
  - **Automated Dynamic Surge Pricing**: Configurable surcharge applied to priority reservations scheduled within a short lead time (e.g., within 2 hours of dining).
- **Cart, Checkout & Payment Gateway Integration**:
  - Real-time tally of subtotal, tax computations, delivery charges, and reservation booking fees.
  - Multiple payment settlement methods: Cash on Delivery (COD), Card on Delivery, or Pre-paid Online Gateway.
  - Post-order real-time tracking interface showing progress from order placement to final delivery or seating.

---

#### 2.2 Branch Manager & Dispatch Operations Hub
The operational command center for front-of-house coordinators and shift supervisors.

- **Dine-In Table Allocation Desk**:
  - Incoming queue for dine-in orders placed without pre-assigned tables.
  - Graphical floor map inspector allowing managers to match party size to available tables with a single click.
  - Live table release mechanism to reset table statuses to `AVAILABLE` upon guest departure.
- **Delivery Fleet Dispatch & Driver Assignment**:
  - Dispatch board displaying orders marked as `READY` by the kitchen.
  - Fleet management panel showing all active, on-duty delivery riders.
  - Instant one-click dispatch assignment linking orders to specific delivery personnel.
- **Branch-Level Operational Controls**:
  - Dynamic surge fee adjustments: modify reservation deposit amounts and priority booking rates.
  - Master toggle to activate or deactivate surge pricing algorithms per branch.
  - Real-time order status oversight across all dining types.

---

#### 2.3 Kitchen Display System (KDS)
High-contrast, tablet- and touch-screen-optimized interface for kitchen stations, line chefs, and expeditors.

- **Chronological Ticket Pipeline**:
  - Incoming tickets ordered by FIFO (First In, First Out) queue priority.
  - Complete order itemization showing quantities, item variations, custom kitchen notes, and dining channel tags.
- **Dynamic Elapsed Time & Urgency Badges**:
  - Real-time ticker calculating preparation duration per ticket.
  - Color-coded severity thresholds:
    - **Green / Normal**: Under 8 minutes.
    - **Amber / Caution**: 8 to 15 minutes.
    - **Red / Urgent**: Exceeding 15 minutes.
- **Kitchen Lifecycle State Controls**:
  - `PENDING` / `CONFIRMED` -> Transition to `PREPARING` upon start of cooking.
  - `PREPARING` -> Transition to `READY` when dishes are plated and boxed.
  - Direct completion actions for expedited counter items.

---

#### 2.4 Rider & Logistics Mobile Subsystem
A lightweight, mobile-first utility for on-the-road delivery couriers.

- **Active Delivery Manifest**:
  - Real-time display of orders assigned to the logged-in courier.
  - Destination breakdown: recipient full name, contact telephone, delivery address, order contents, and collectable amounts.
- **Action Triggers & Status Progression**:
  - Mark order as `SHIPPED` / `IN TRANSIT` upon pickup from the restaurant counter.
  - Mark order as `DELIVERED` upon arrival at the customer location.
- **Cash-on-Delivery (COD) Reconciliation**:
  - Automated reconciliation mechanism marking invoice status to `PAID` when couriers confirm successful cash collection and delivery completion.

---

#### 2.5 Executive Owner & Chain Analytics Dashboard
A comprehensive administrative portal for franchise operators, executive leadership, and catalog administrators.

- **Consolidated Business Intelligence**:
  - Multi-branch KPIs: Chain-wide Gross Revenue, Total Order Count, Total Table Reservations, and Active Branch Network.
  - Visual Revenue Distribution: Proportional comparative sales graphs across all operating branch locations.
  - Channel Share Breakdown: Comparative distribution of Delivery, Dine-In, and Takeaway volumes.
- **Centralized Menu Catalog Management**:
  - Full CRUD lifecycle (Create, Read, Update, Delete) for dishes and beverage items.
  - Image URL binding, category association, and base pricing controls.
  - Branch-Level Scoping: Multi-select selector enabling items to be sold chain-wide or restricted to specific outlets.
  - Instant Out-of-Stock (86) Toggling: Real-time availability switch that cascades immediately to customer-facing menus.
- **Branch Network Management**:
  - Outlet onboarding: add new branches with name, city, physical address, and hotline.
  - Per-branch operational parameters: baseline priority reservation fee and surge switch.

---

### 3. Data Architecture & Entity Relationship Schema

The platform is structured around a relational domain model designed for high cohesion and operational decoupling.

```
+-------------------+             1:N             +-------------------+
|      BRANCH       |----------------------------<|       FLOOR       |
+-------------------+                             +-------------------+
| id (PK)           |                                       |
| name              |                                       | 1:N
| city              |                                       v
| address           |                             +-------------------+
| phone             |                             |       TABLE       |
| premiumBookingFee |                             +-------------------+
| activeSurcharge   |                             | id (PK)           |
+-------------------+                             | floorId (FK)      |
     |           |                                | tableNumber       |
     | 1:N       | 1:N                            | capacity          |
     v           v                                | type (Std/Vip/Maj)|
+---------+ +-------------+                       | x, y, width, height|
|  ORDER  | | RESERVATION |                       | status            |
+---------+ +-------------+                       +-------------------+
| id (PK) | | id (PK)     |                                 ^
| branchId| | tableId(FK)-+---------------------------------+
| userId  | | branchId    |
| status  | | status      |
| type    | | startTime   |
| items   | | endTime     |
| total   | | guestCount  |
| riderId | +-------------+
+---------+
```

#### 3.1 Entity Definitions

| Entity | Primary Attributes | Description |
| :--- | :--- | :--- |
| **`Branch`** | `id`, `name`, `city`, `address`, `phone`, `premiumBookingFee`, `activeSurchargeToggle` | Represents a physical dining facility with dedicated inventory, staff, and pricing policies. |
| **`Floor`** | `id`, `branchId`, `name`, `level` | Architectural level within a branch housing specific dining configurations. |
| **`Table`** | `id`, `floorId`, `branchId`, `tableNumber`, `capacity`, `type`, `x`, `y`, `width`, `height`, `status` | Spatial representation of a dining unit. Types include `STANDARD`, `VIP_CABIN`, and `MAJLIS_FLOOR`. Statuses: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `BLOCKED`. |
| **`MenuItem`** | `id`, `name`, `price`, `description`, `category`, `imageUrl`, `isAvailable`, `branchesAvailable[]`, `variations[]` | Catalog item representing dishes or beverages with optional portion variations and branch-level availability. |
| **`Reservation`** | `id`, `tableId`, `branchId`, `userId`, `userName`, `userPhone`, `startTime`, `endTime`, `guestCount`, `type`, `premiumFee`, `status` | Scheduled table allocation. Statuses include `PENDING`, `CONFIRMED`, `SEATED`, `CANCELLED`. |
| **`Order`** | `id`, `branchId`, `userId`, `orderType`, `tableId`, `status`, `paymentStatus`, `paymentMethod`, `items[]`, `subtotal`, `tax`, `deliveryFee`, `total`, `riderId` | Comprehensive transactional record supporting `DINE_IN`, `PICK_UP`, and `DELIVERY`. |
| **`UserProfile`** | `id`, `name`, `phone`, `role`, `branchId` | Access identity mapping to one of five system roles: `CUSTOMER`, `KITCHEN`, `RIDER`, `MANAGER`, or `OWNER`. |

---

### 4. End-to-End Operational Lifecycle

The system operates as an interconnected workflow ensuring seamless handoffs between actors:

```
[Customer]
    │  Places Dine-In / Delivery / Pick-Up Order
    ▼
[Manager Desk] ─── (Dine-In) ───► Assigns Floor Table
    │
    ▼ (Automated Ticket Dispatch)
[Kitchen KDS]
    │  1. Receives Ticket in FIFO Queue
    │  2. Chef clicks "Start Prep" (Status: PREPARING)
    │  3. Chef clicks "Ready" (Status: READY)
    ▼
[Dispatch / Delivery]
    ├─► (Dine-In): Expedited directly to Assigned Table (Status: COMPLETED)
    ├─► (Pick-Up): Handed over to Customer at Counter (Status: COMPLETED)
    └─► (Delivery): Manager assigns Rider ──► Rider marks "In Transit" 
                                          ──► Arrives at Customer 
                                          ──► Collects COD / Marks "Completed"
    ▼
[Executive BI Dashboard]
    │  Real-time Revenue, Channel Metrics, and Inventory Availability Update
```

---

### 5. Technical Specifications & Dependencies

#### 5.1 Technology Stack Matrix
- **UI Framework**: React 19.x (Web / PWA) / Flutter 3.x (Native Cross-Platform Mobile)
- **Language / Typing**: TypeScript 5.x / Dart 3.x
- **Build Tooling**: Vite 8.x with SWC/Babel compiler plugins
- **Iconography**: Lucide Component Library
- **Native Runtime Bridge**: Capacitor Core & Android Engine v8.5.x
- **State & Data Store**: Reactive Pub/Sub event subscriber architecture with local persistence caching

#### 5.2 Responsive Layout Standards
- **Responsive Breakpoints**: Scalable across mobile portrait screens (360px–480px), kitchen tablet landscape (768px–1024px), and wide-screen management monitors (1280px+).
- **Touch Targets**: Standardized touch boundaries (minimum 44px) on kitchen and rider touchscreens for rapid, error-free input during high-volume operations.

---

### 6. Security, Governance & Extensibility

- **Role-Based Access Control (RBAC)**: Segregated operational views preventing cross-functional interference (e.g., kitchen terminals cannot alter branch financial settings).
- **Auditing & History**: State transitions record timestamp and agent IDs, enabling post-shift auditing of prep times, delivery durations, and cancellations.
- **Modular Extensibility**:
  - API pluggability for point-of-sale (POS) hardware integrations (thermal receipt printers, cash drawers).
  - External payment provider adapters (Stripe, PayPal, local bank switches).
  - Third-party courier and logistics fleet APIs.

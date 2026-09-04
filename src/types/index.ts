export type Role = 'CUSTOMER' | 'KITCHEN' | 'RIDER' | 'WAITER' | 'MANAGER' | 'OWNER' | 'CASHIER';

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  premiumBookingFee: number; // dynamically adjustable
  activeSurchargeToggle: boolean; // toggle auto peak-hour surcharge
}

export interface Floor {
  id: string;
  branchId: string;
  name: string;
  level: number;
}

export type TableType = 'STANDARD' | 'VIP_CABIN' | 'MAJLIS_FLOOR';
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'BLOCKED';

export interface Table {
  id: string;
  floorId: string;
  branchId: string;
  tableNumber: string;
  capacity: number;
  type: TableType;
  x: number; // percentage width relative to floor layout container
  y: number; // percentage height relative to floor layout container
  width: number;
  height: number;
  status: TableStatus;
}

export interface MenuItemVariation {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  branchesAvailable: string[]; // branch IDs
  variations?: MenuItemVariation[];
}

export type ReservationType = 'STANDARD' | 'PRIOR_2H_PREMIUM';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED';

export interface Reservation {
  id: string;
  tableId: string;
  branchId: string;
  userId: string;
  userName: string;
  userPhone: string;
  startTime: string; // ISO string or time string
  endTime: string;
  guestCount: number;
  type: ReservationType;
  premiumFee: number;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;
}

export type OrderType = 'DINE_IN' | 'PICK_UP' | 'DELIVERY';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  variation?: string;
}

export interface Order {
  id: string;
  branchId: string;
  userId: string;
  userName: string;
  userPhone: string;
  orderType: OrderType;
  tableId?: string; // assigned by manager or selected by customer
  reservationId?: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID';
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE' | 'SPLIT';
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;     // flat discount applied at POS
  discountPercent: number;    // percent discount applied at POS
  tax: number;
  deliveryFee: number;
  premiumReservationFee: number;
  total: number;
  deliveryAddress?: string;
  riderId?: string; // assigned delivery driver ID
  cashierId?: string; // cashier who processed the order at POS
  waiterName?: string; // server / manager who took the table order
  isBillRequested?: boolean; // flag for cashier POS terminal
  splitPayment?: SplitPayment; // multi-tender split details
  isOnline?: boolean; // created online by customer
  isPunched?: boolean; // true once cashier verifies and punches to kitchen
  isCallConfirmed?: boolean; // cashier called customer to verify
  confirmedByCashier?: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  label: string; // 'Home', 'Office', 'Farmhouse', etc.
  sector: string; // 'Civic Center', 'Executive Block', 'Block A', etc.
  address: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: Role;
  branchId?: string; // linked branch for manager/kitchen
  addresses?: CustomerAddress[];
}

// ──────────────────────────────────────────────────────────────────────────────
// POS-Specific Types
// ──────────────────────────────────────────────────────────────────────────────

export interface SystemSettings {
  isTaxActive: boolean; // Master toggle for entire Haandi system
  salesTaxCardPercent: number; // default 5%
  salesTaxCashPercent: number; // default 16%
  deliveryRadiusKm: number; // default 2.5 km
  singleBranchId: string; // 'br-isb'
  advancePrepaymentOnly: boolean;
}

export interface SplitPayment {
  cashAmount: number;
  cardAmount: number;
}

/** A parked / held POS order ticket that can be recalled later */
export interface HeldOrder {
  id: string;
  label: string; // e.g. "Table 4 - Ahmed" or "Takeaway #3"
  branchId: string;
  cashierId: string;
  parkedBy?: string; // e.g. "Manager Bilal", "Frontdesk Staff", "Cashier Nadia", "Waiter Ali"
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  tableId?: string;
  items: OrderItem[];
  discountAmount: number;
  discountPercent: number;
  heldAt: string; // ISO timestamp
}

/** Cash drawer shift opened by a cashier at the start of a service period */
export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  openedAt: string;      // ISO timestamp
  closedAt?: string;     // ISO timestamp, set on shift close
  openingFloat: number;  // cash placed in drawer at shift open
  cashSales: number;     // accumulated cash payments during shift
  cardSales: number;     // accumulated card payments during shift
  cashIn: number;        // manual cash additions (e.g. change top-up)
  cashOut: number;       // manual cash removals (e.g. petty cash & expenses)
  actualCashCounted?: number; // cashier-entered cash count at close
  status: ShiftStatus;
}

export interface TillTransaction {
  id: string;
  shiftId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  type: 'CASH_IN' | 'CASH_OUT' | 'EXPENSE' | 'INVENTORY_PURCHASE';
  amount: number;
  category: string; // 'Petty Expense', 'Vendor Inventory', 'Daily Supplies', 'Cash Top-up'
  description: string;
  supplierName?: string;
  inventoryItemName?: string;
  quantityAdded?: number;
  timestamp: string;
}

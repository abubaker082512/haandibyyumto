export type Role = 'CUSTOMER' | 'KITCHEN' | 'RIDER' | 'WAITER' | 'MANAGER' | 'OWNER' | 'ADMIN' | 'CASHIER';

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
  x: number;
  y: number;
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
  costPrice?: number; // Estimated food cost
}

// ──────────────────────────────────────────────────────────────────────────────
// Branch-Specific Menu Overrides
// ──────────────────────────────────────────────────────────────────────────────
export interface BranchMenuOverride {
  branchId: string;
  menuItemId: string;
  customPrice?: number;
  isAvailable?: boolean;
  customName?: string;
  promoTag?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Recipe & Bill of Materials (BOM) Management
// ──────────────────────────────────────────────────────────────────────────────
export interface RecipeIngredient {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: 'kg' | 'g' | 'liter' | 'ml' | 'piece' | 'packet';
  costPerUnit: number;
  totalCost: number;
}

export interface MenuItemRecipe {
  menuItemId: string;
  menuItemName: string;
  portionYield: number; // default 1 portion
  ingredients: RecipeIngredient[];
  totalFoodCost: number;
  targetSellingPrice: number;
  foodCostMarginPercent: number; // (totalFoodCost / targetSellingPrice) * 100
  preparationNotes?: string;
  lastUpdated: string;
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
  startTime: string;
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
  category?: string;
  price: number;
  quantity: number;
  variation?: string;
  itemNotes?: string;
}

export type PaymentMethodType = 'CASH' | 'CARD' | 'ONLINE';

export interface Order {
  id: string;
  branchId: string;
  userId: string;
  userName: string;
  userPhone: string;
  orderType: OrderType;
  tableId?: string;
  reservationId?: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID';
  paymentMethod: PaymentMethodType;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  serviceCharge: number;        // 5% mandatory service charges on subtotal
  serviceChargePercent: number; // default 5%
  taxableAmount: number;        // subtotal - discount + serviceCharge
  tax: number;                  // FBR GST (5% Card / 16% Cash)
  taxRatePercent: number;       // 5 or 16
  deliveryFee: number;
  premiumReservationFee: number;
  total: number;
  deliveryAddress?: string;
  riderId?: string;
  cashierId?: string;
  waiterName?: string;
  isBillRequested?: boolean;
  isOnline?: boolean;
  isPunched?: boolean;
  isCallConfirmed?: boolean;
  confirmedByCashier?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  sector: string;
  address: string;
  isDefault?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: Role;
  branchId?: string;
  addresses?: CustomerAddress[];
}

// ──────────────────────────────────────────────────────────────────────────────
// System Settings
// ──────────────────────────────────────────────────────────────────────────────
export interface SystemSettings {
  isTaxActive: boolean;
  salesTaxCardPercent: number;   // default 5%
  salesTaxCashPercent: number;   // default 16%
  serviceChargePercent: number;  // default 5%
  deliveryRadiusKm: number;      // default 2.5 km
  singleBranchId: string;        // 'br-isb'
  advancePrepaymentOnly: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Cash Tenders & Held POS Orders
// ──────────────────────────────────────────────────────────────────────────────
export interface HeldOrder {
  id: string;
  label: string; // e.g. "Table 4 - Ahmed" or "Takeaway #3"
  branchId: string;
  cashierId: string;
  parkedBy?: string;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  tableId?: string;
  items: OrderItem[];
  discountAmount: number;
  discountPercent: number;
  serviceCharge: number;
  tax: number;
  total: number;
  heldAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Shift Opening & Closing Audit (Denominations & Reconciliation)
// ──────────────────────────────────────────────────────────────────────────────
export interface CashDenominations {
  rs5000: number;
  rs1000: number;
  rs500: number;
  rs100: number;
  rs50: number;
  rs20: number;
  rs10: number;
  coins: number;
}

export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  openingNotes?: string;
  cashSales: number;
  cardSales: number;
  onlineSales: number;
  totalServiceChargesCollected: number;
  totalTaxCollected: number;
  cashIn: number;
  cashOut: number;
  inventoryBoughtFromTill: number;
  expectedCashInDrawer: number;
  actualCashCounted?: number;
  denominations?: CashDenominations;
  cashDiscrepancy?: number; // positive = over, negative = short, 0 = balanced
  closingNotes?: string;
  handoverToCashierName?: string;
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
  category: string;
  description: string;
  supplierName?: string;
  inventoryItemName?: string;
  quantityAdded?: number;
  timestamp: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Financial Accounting: Expenses, Vendors & General Ledger
// ──────────────────────────────────────────────────────────────────────────────
export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
}

export interface Expense {
  id: string;
  branchId: string;
  category: string;
  amount: number;
  paidTo: string;
  paymentMethod: 'CASH_DRAWER' | 'BANK_TRANSFER' | 'PETTY_CASH';
  recordedBy: string;
  receiptNumber?: string;
  notes: string;
  date: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  supplyCategory: string; // 'Fresh Meat', 'Desi Ghee & Dairy', 'Spices & Herbs', 'Rice & Flour', 'Packaging'
  currentBalancePayable: number;
  branchId: string;
}

export interface VendorInvoice {
  id: string;
  vendorId: string;
  vendorName: string;
  branchId: string;
  invoiceNumber: string;
  itemsPurchased: string;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  dueDate: string;
  createdAt: string;
}

export interface GeneralLedgerEntry {
  id: string;
  branchId: string;
  date: string;
  account: 'REVENUE' | 'FOOD_COST' | 'EXPENSE' | 'TAX_PAYABLE' | 'SERVICE_CHARGE' | 'PAYROLL';
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  referenceId?: string;
  description: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// HR, Staff & Payroll Management
// ──────────────────────────────────────────────────────────────────────────────
export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: Role;
  branchId: string;
  monthlySalary: number;
  designation: string;
  cnic?: string;
  joiningDate: string;
  isActive: boolean;
}

export interface StaffAttendance {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY';
  checkIn?: string;
  checkOut?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  month: string; // e.g. "September 2026"
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPayable: number;
  status: 'PENDING' | 'PROCESSED' | 'PAID';
  paidDate?: string;
  paymentMethod?: 'BANK' | 'CASH';
}

export interface RolePermission {
  role: Role;
  canAccessPOS: boolean;
  canAccessKDS: boolean;
  canAccessFloorManager: boolean;
  canAccessRiderPanel: boolean;
  canAccessAdminReports: boolean;
  canManageMenu: boolean;
  canManageBranchPricing: boolean;
  canManageRecipes: boolean;
  canManageAccounting: boolean;
  canManagePayroll: boolean;
  canOverrideDiscounts: boolean;
  canCloseShift: boolean;
}

import { HAANDI_MENU } from './menuData';
import { useState, useEffect } from 'react';
import type {
  Branch, Floor, Table, MenuItem, Reservation, Order, OrderItem,
  UserProfile, OrderStatus, TableStatus, CashierShift, HeldOrder,
  SystemSettings, TillTransaction, CustomerAddress, BranchMenuOverride,
  MenuItemRecipe, CashDenominations, Expense, Vendor,
  VendorInvoice, StaffMember,
  PayrollRecord, PaymentMethodType
} from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Mock Users
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-cust',
    name: 'Abubakar Customer',
    phone: '0300 1234567',
    role: 'CUSTOMER',
    addresses: [
      { id: 'addr-1', label: 'Executive Residence', sector: 'Executive Block', address: 'House 14, Street 7, Executive Block, Gulberg Greens, Islamabad', isDefault: true },
      { id: 'addr-2', label: 'Civic Office', sector: 'Civic Center', address: 'Suite 402, Business Center, Civic Center, Gulberg Greens, Islamabad' },
      { id: 'addr-3', label: 'Farmhouse Villa', sector: 'Sector 2 (Farmhouses)', address: 'Farmhouse 88, Main Boulevard, Sector 2, Gulberg Greens' }
    ]
  },
  { id: 'u-man1', name: 'Bilal Manager (Islamabad)', phone: '0333 4567890', role: 'MANAGER', branchId: 'br-isb' },
  { id: 'u-waiter1', name: 'Ali Order Taker (Waiter)', phone: '0322 7770001', role: 'WAITER', branchId: 'br-isb' },
  { id: 'u-waiter2', name: 'Hamza Floor Captain', phone: '0322 7770002', role: 'WAITER', branchId: 'br-isb' },
  { id: 'u-kit1', name: 'Chef Tariq', phone: '0312 3456789', role: 'KITCHEN', branchId: 'br-isb' },
  { id: 'u-ride1', name: 'Zahid Rider 1', phone: '0345 6789012', role: 'RIDER' },
  { id: 'u-ride2', name: 'Kamran Rider 2', phone: '0315 1122334', role: 'RIDER' },
  { id: 'u-own', name: 'Sajid Owner (HQ)', phone: '0300 0000000', role: 'OWNER' },
  { id: 'u-admin', name: 'Admin General Head', phone: '0311 9998877', role: 'ADMIN' },
  { id: 'u-cash1', name: 'Nadia Cashier (Islamabad)', phone: '0321 5550001', role: 'CASHIER', branchId: 'br-isb' },
  { id: 'u-cash2', name: 'Hamza Cashier (Islamabad)', phone: '0333 5550002', role: 'CASHIER', branchId: 'br-isb' },
];

// Single Location & Expansion Branches
const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-isb',
    name: 'Haandi by Yumto - Gulberg Greens, Islamabad',
    city: 'Islamabad',
    address: 'Gulberg Greens, Civic Center, Executive Block, Islamabad',
    phone: '0330 0500600',
    premiumBookingFee: 1500,
    activeSurchargeToggle: true
  },
  {
    id: 'br-rwp',
    name: 'Haandi by Yumto - Saddar / Bahria Town, Rawalpindi',
    city: 'Rawalpindi',
    address: 'Phase 7, Bahria Town / Saddar Cantt, Rawalpindi',
    phone: '0330 0500700',
    premiumBookingFee: 1200,
    activeSurchargeToggle: false
  }
];

// Mock Floors (Islamabad Gulberg Greens)
const INITIAL_FLOORS: Floor[] = [
  { id: 'fl-isb-g', branchId: 'br-isb', name: 'Ground Floor (Main Dining)', level: 0 },
  { id: 'fl-isb-f', branchId: 'br-isb', name: 'First Floor (Family Section)', level: 1 },
  { id: 'fl-isb-v', branchId: 'br-isb', name: 'Rooftop (VIP Majlis Suites)', level: 2 }
];

// Mock Tables helper
const generateTables = (branchId: string, floorG: string, floorF: string, floorV: string): Table[] => [
  // Ground Floor Tables
  { id: `tb-${branchId}-g1`, floorId: floorG, branchId, tableNumber: 'T-1', capacity: 4, type: 'STANDARD', x: 15, y: 15, width: 14, height: 12, status: 'AVAILABLE' },
  { id: `tb-${branchId}-g2`, floorId: floorG, branchId, tableNumber: 'T-2', capacity: 4, type: 'STANDARD', x: 45, y: 15, width: 14, height: 12, status: 'AVAILABLE' },
  { id: `tb-${branchId}-g3`, floorId: floorG, branchId, tableNumber: 'T-3', capacity: 2, type: 'STANDARD', x: 75, y: 15, width: 12, height: 10, status: 'OCCUPIED' },
  { id: `tb-${branchId}-g4`, floorId: floorG, branchId, tableNumber: 'T-4', capacity: 8, type: 'STANDARD', x: 15, y: 60, width: 22, height: 16, status: 'AVAILABLE' },
  { id: `tb-${branchId}-g5`, floorId: floorG, branchId, tableNumber: 'T-5', capacity: 4, type: 'STANDARD', x: 45, y: 60, width: 14, height: 12, status: 'AVAILABLE' },
  { id: `tb-${branchId}-g6`, floorId: floorG, branchId, tableNumber: 'T-6', capacity: 4, type: 'STANDARD', x: 75, y: 60, width: 14, height: 12, status: 'AVAILABLE' },

  // Family Section Tables
  { id: `tb-${branchId}-f1`, floorId: floorF, branchId, tableNumber: 'F-1', capacity: 6, type: 'STANDARD', x: 10, y: 15, width: 16, height: 12, status: 'AVAILABLE' },
  { id: `tb-${branchId}-f2`, floorId: floorF, branchId, tableNumber: 'F-2', capacity: 6, type: 'STANDARD', x: 10, y: 40, width: 16, height: 12, status: 'AVAILABLE' },
  { id: `tb-${branchId}-f3`, floorId: floorF, branchId, tableNumber: 'F-3', capacity: 6, type: 'STANDARD', x: 10, y: 65, width: 16, height: 12, status: 'AVAILABLE' },
  { id: `tb-${branchId}-f4`, floorId: floorF, branchId, tableNumber: 'F-4', capacity: 10, type: 'STANDARD', x: 45, y: 25, width: 24, height: 18, status: 'AVAILABLE' },
  { id: `tb-${branchId}-f5`, floorId: floorF, branchId, tableNumber: 'F-5', capacity: 12, type: 'STANDARD', x: 45, y: 60, width: 26, height: 20, status: 'AVAILABLE' },
  { id: `tb-${branchId}-f6`, floorId: floorF, branchId, tableNumber: 'F-6', capacity: 6, type: 'STANDARD', x: 78, y: 40, width: 16, height: 12, status: 'AVAILABLE' },

  // VIP Majlis Suite
  { id: `tb-${branchId}-v1`, floorId: floorV, branchId, tableNumber: 'Majlis M-1', capacity: 8, type: 'MAJLIS_FLOOR', x: 15, y: 15, width: 22, height: 22, status: 'AVAILABLE' },
  { id: `tb-${branchId}-v2`, floorId: floorV, branchId, tableNumber: 'Majlis M-2', capacity: 8, type: 'MAJLIS_FLOOR', x: 15, y: 60, width: 22, height: 22, status: 'AVAILABLE' },
  { id: `tb-${branchId}-v3`, floorId: floorV, branchId, tableNumber: 'VIP Cabin V-3', capacity: 6, type: 'VIP_CABIN', x: 65, y: 15, width: 22, height: 22, status: 'AVAILABLE' },
  { id: `tb-${branchId}-v4`, floorId: floorV, branchId, tableNumber: 'VIP Cabin V-4', capacity: 12, type: 'VIP_CABIN', x: 65, y: 60, width: 24, height: 24, status: 'AVAILABLE' }
];

const INITIAL_TABLES: Table[] = [
  ...generateTables('br-isb', 'fl-isb-g', 'fl-isb-f', 'fl-isb-v')
];

const INITIAL_MENU: MenuItem[] = HAANDI_MENU;

// Seed Initial Recipes & Bill of Materials (BOM)
const INITIAL_RECIPES: MenuItemRecipe[] = [
  {
    menuItemId: 'handi-c1',
    menuItemName: 'Chicken Handi (Special Desi Ghee)',
    portionYield: 1,
    ingredients: [
      { id: 'ing-1', ingredientName: 'Fresh Chicken Boneless', quantity: 0.5, unit: 'kg', costPerUnit: 850, totalCost: 425 },
      { id: 'ing-2', ingredientName: 'Pure Desi Ghee', quantity: 0.08, unit: 'kg', costPerUnit: 2200, totalCost: 176 },
      { id: 'ing-3', ingredientName: 'Dairy Cream & Yogurt', quantity: 0.1, unit: 'kg', costPerUnit: 600, totalCost: 60 },
      { id: 'ing-4', ingredientName: 'Haandi Secret Spice Blend', quantity: 0.03, unit: 'kg', costPerUnit: 1500, totalCost: 45 },
      { id: 'ing-5', ingredientName: 'Tomatoes & Ginger Garlic', quantity: 0.15, unit: 'kg', costPerUnit: 200, totalCost: 30 }
    ],
    totalFoodCost: 736,
    targetSellingPrice: 1690,
    foodCostMarginPercent: 43.5,
    preparationNotes: 'Slow-cooked in clay terracotta handi for 25 minutes over low flame.',
    lastUpdated: new Date().toISOString()
  },
  {
    menuItemId: 'mandi-1',
    menuItemName: 'Special Mutton Mandi Platter',
    portionYield: 1,
    ingredients: [
      { id: 'ing-6', ingredientName: 'Fresh Prime Mutton Shin', quantity: 0.6, unit: 'kg', costPerUnit: 2400, totalCost: 1440 },
      { id: 'ing-7', ingredientName: 'Premium Sella Basmati Rice', quantity: 0.35, unit: 'kg', costPerUnit: 420, totalCost: 147 },
      { id: 'ing-8', ingredientName: 'Fried Nuts (Almonds, Raisins)', quantity: 0.05, unit: 'kg', costPerUnit: 3000, totalCost: 150 },
      { id: 'ing-9', ingredientName: 'Mandi Special Arabian Spices', quantity: 0.04, unit: 'kg', costPerUnit: 2000, totalCost: 80 }
    ],
    totalFoodCost: 1817,
    targetSellingPrice: 3200,
    foodCostMarginPercent: 56.7,
    preparationNotes: 'Smoked with charcoal and aged basmati rice broth.',
    lastUpdated: new Date().toISOString()
  }
];

// Seed Initial Vendors
const INITIAL_VENDORS: Vendor[] = [
  { id: 'v-1', name: 'Al-Madina Meat Suppliers', contactPerson: 'Haji Aslam', phone: '0300 5551122', supplyCategory: 'Fresh Meat & Mutton', currentBalancePayable: 45000, branchId: 'br-isb' },
  { id: 'v-2', name: 'Punjab Pure Desi Dairy', contactPerson: 'Malik Qasim', phone: '0321 4443322', supplyCategory: 'Desi Ghee & Dairy Cream', currentBalancePayable: 28000, branchId: 'br-isb' },
  { id: 'v-3', name: 'Shahi Spices & Rice Mills', contactPerson: 'Rana Tariq', phone: '0333 8887766', supplyCategory: 'Basmati Rice & Spices', currentBalancePayable: 15000, branchId: 'br-isb' },
  { id: 'v-4', name: 'Eco Pack Islamabad', contactPerson: 'Zubair Packaging', phone: '0311 2223344', supplyCategory: 'Handi Terracotta & Boxes', currentBalancePayable: 12000, branchId: 'br-isb' }
];

// Seed Initial Staff Members
const INITIAL_STAFF: StaffMember[] = [
  { id: 'st-1', name: 'Bilal Manager', phone: '0333 4567890', role: 'MANAGER', branchId: 'br-isb', monthlySalary: 85000, designation: 'Branch General Manager', joiningDate: '2025-01-15', isActive: true },
  { id: 'st-2', name: 'Nadia Cashier', phone: '0321 5550001', role: 'CASHIER', branchId: 'br-isb', monthlySalary: 45000, designation: 'Head Shift Cashier', joiningDate: '2025-03-01', isActive: true },
  { id: 'st-3', name: 'Ali Order Taker', phone: '0322 7770001', role: 'WAITER', branchId: 'br-isb', monthlySalary: 35000, designation: 'Senior Order Taker / Captain', joiningDate: '2025-04-10', isActive: true },
  { id: 'st-4', name: 'Chef Tariq', phone: '0312 3456789', role: 'KITCHEN', branchId: 'br-isb', monthlySalary: 75000, designation: 'Executive Handi Master Chef', joiningDate: '2024-11-20', isActive: true },
  { id: 'st-5', name: 'Zahid Rider', phone: '0345 6789012', role: 'RIDER', branchId: 'br-isb', monthlySalary: 32000, designation: 'Senior Delivery Driver', joiningDate: '2025-06-01', isActive: true }
];

// Mock Reservations Seed
const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    tableId: 'tb-br-isb-f6',
    branchId: 'br-isb',
    userId: 'u-cust',
    userName: 'Abubakar Customer',
    userPhone: '+92 300 1234567',
    startTime: new Date(Date.now() + 4 * 3600000).toISOString(),
    endTime: new Date(Date.now() + 6 * 3600000).toISOString(),
    guestCount: 4,
    type: 'STANDARD',
    premiumFee: 0,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  }
];

// Mock Orders Seed
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    branchId: 'br-isb',
    userId: 'u-cust',
    userName: 'Abubakar Customer',
    userPhone: '+92 300 1234567',
    orderType: 'DELIVERY',
    status: 'PREPARING',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE',
    items: [
      { menuItemId: 'handi-c1', name: 'Chicken Handi', price: 1690, quantity: 1 },
      { menuItemId: 'bread-3', name: 'Haandi Special Naan', price: 190, quantity: 2 }
    ],
    subtotal: 2070,
    discountAmount: 0,
    discountPercent: 0,
    serviceCharge: 104,
    serviceChargePercent: 5,
    taxableAmount: 2174,
    tax: 109,
    taxRatePercent: 5,
    deliveryFee: 150,
    premiumReservationFee: 0,
    total: 2433,
    deliveryAddress: 'House 12, Executive Block, Gulberg Greens, Islamabad (0.4 km)',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  isTaxActive: true,
  salesTaxCardPercent: 5,
  salesTaxCashPercent: 16,
  serviceChargePercent: 5,
  deliveryRadiusKm: 2.5,
  singleBranchId: 'br-isb',
  advancePrepaymentOnly: true,
};

class MockDatabase {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    localStorage.setItem('yumto_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('yumto_branches', JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem('yumto_floors', JSON.stringify(INITIAL_FLOORS));
    localStorage.setItem('yumto_tables', JSON.stringify(INITIAL_TABLES));
    localStorage.setItem('yumto_menu', JSON.stringify(INITIAL_MENU));
    
    if (!localStorage.getItem('yumto_settings')) {
      localStorage.setItem('yumto_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('yumto_recipes')) {
      localStorage.setItem('yumto_recipes', JSON.stringify(INITIAL_RECIPES));
    }
    if (!localStorage.getItem('yumto_vendors')) {
      localStorage.setItem('yumto_vendors', JSON.stringify(INITIAL_VENDORS));
    }
    if (!localStorage.getItem('yumto_staff')) {
      localStorage.setItem('yumto_staff', JSON.stringify(INITIAL_STAFF));
    }
    if (!localStorage.getItem('yumto_expenses')) {
      localStorage.setItem('yumto_expenses', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_vendor_invoices')) {
      localStorage.setItem('yumto_vendor_invoices', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_ledger')) {
      localStorage.setItem('yumto_ledger', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_payroll')) {
      localStorage.setItem('yumto_payroll', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_branch_menu_overrides')) {
      localStorage.setItem('yumto_branch_menu_overrides', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_shifts')) {
      localStorage.setItem('yumto_shifts', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_held_orders')) {
      localStorage.setItem('yumto_held_orders', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_orders')) {
      localStorage.setItem('yumto_orders', JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem('yumto_reservations')) {
      localStorage.setItem('yumto_reservations', JSON.stringify(INITIAL_RESERVATIONS));
    }
  }

  // Pub-Sub system
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // System Settings & Global Tax Toggle
  getSettings(): SystemSettings {
    const raw = localStorage.getItem('yumto_settings');
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem('yumto_settings', JSON.stringify(updated));
    this.notify();
    return updated;
  }

  /**
   * Complete Billing Calculation Formula:
   * 1. Discounted Subtotal = Subtotal - Discount
   * 2. Service Charges (5%) = Discounted Subtotal * 0.05
   * 3. Taxable Amount = Discounted Subtotal + Service Charges
   * 4. GST = Taxable Amount * (5% Card/Online or 16% Cash)
   * 5. Total = Taxable Amount + GST
   */
  calculateBilling(discountedSubtotal: number, paymentMethod: PaymentMethodType) {
    const settings = this.getSettings();
    const scPercent = settings.serviceChargePercent || 5;
    const serviceCharge = Math.round(discountedSubtotal * (scPercent / 100));
    const taxableAmount = discountedSubtotal + serviceCharge;

    let taxRate = 0;
    let taxAmount = 0;

    if (settings.isTaxActive) {
      const isDigital = paymentMethod === 'CARD' || paymentMethod === 'ONLINE';
      taxRate = isDigital ? settings.salesTaxCardPercent : settings.salesTaxCashPercent;
      taxAmount = Math.round(taxableAmount * (taxRate / 100));
    }

    const grandTotal = taxableAmount + taxAmount;

    return {
      serviceChargePercent: scPercent,
      serviceCharge,
      taxableAmount,
      taxRatePercent: taxRate,
      taxAmount,
      grandTotal
    };
  }

  // Legacy helper mapping
  calculateSalesTax(subtotal: number, paymentMethod: string) {
    const pm: PaymentMethodType = (paymentMethod === 'CARD' || paymentMethod === 'ONLINE') ? paymentMethod : 'CASH';
    const res = this.calculateBilling(subtotal, pm);
    return {
      taxRate: res.taxRatePercent,
      taxAmount: res.taxAmount,
      serviceCharge: res.serviceCharge
    };
  }

  // Branch Menu Overrides
  getBranchMenuOverrides(branchId?: string): BranchMenuOverride[] {
    const list: BranchMenuOverride[] = JSON.parse(localStorage.getItem('yumto_branch_menu_overrides') || '[]');
    return branchId ? list.filter(o => o.branchId === branchId) : list;
  }

  setBranchMenuOverride(override: BranchMenuOverride) {
    const list = this.getBranchMenuOverrides();
    const idx = list.findIndex(o => o.branchId === override.branchId && o.menuItemId === override.menuItemId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...override };
    } else {
      list.push(override);
    }
    localStorage.setItem('yumto_branch_menu_overrides', JSON.stringify(list));
    this.notify();
  }

  getBranchEffectiveMenu(branchId: string): MenuItem[] {
    const menu = this.getMenu();
    const overrides = this.getBranchMenuOverrides(branchId);
    
    return menu.map(item => {
      const ov = overrides.find(o => o.menuItemId === item.id);
      if (ov) {
        return {
          ...item,
          name: ov.customName || item.name,
          price: ov.customPrice !== undefined ? ov.customPrice : item.price,
          isAvailable: ov.isAvailable !== undefined ? ov.isAvailable : item.isAvailable
        };
      }
      return item;
    });
  }

  // Recipes & BOM
  getRecipes(): MenuItemRecipe[] {
    return JSON.parse(localStorage.getItem('yumto_recipes') || '[]');
  }

  getRecipeByItemId(menuItemId: string): MenuItemRecipe | undefined {
    return this.getRecipes().find(r => r.menuItemId === menuItemId);
  }

  saveRecipe(recipe: MenuItemRecipe) {
    const list = this.getRecipes();
    const totalCost = recipe.ingredients.reduce((acc, i) => acc + (i.costPerUnit * i.quantity), 0);
    const margin = recipe.targetSellingPrice > 0 ? Math.round((totalCost / recipe.targetSellingPrice) * 1000) / 10 : 0;
    
    const enriched: MenuItemRecipe = {
      ...recipe,
      totalFoodCost: Math.round(totalCost),
      foodCostMarginPercent: margin,
      lastUpdated: new Date().toISOString()
    };

    const idx = list.findIndex(r => r.menuItemId === recipe.menuItemId);
    if (idx !== -1) {
      list[idx] = enriched;
    } else {
      list.push(enriched);
    }
    localStorage.setItem('yumto_recipes', JSON.stringify(list));
    this.notify();
    return enriched;
  }

  // Getters
  getUsers(): UserProfile[] {
    return JSON.parse(localStorage.getItem('yumto_users') || '[]');
  }

  getBranches(): Branch[] {
    return JSON.parse(localStorage.getItem('yumto_branches') || '[]');
  }

  getFloors(branchId?: string): Floor[] {
    const floors: Floor[] = JSON.parse(localStorage.getItem('yumto_floors') || '[]');
    return branchId ? floors.filter(f => f.branchId === branchId) : floors;
  }

  getTables(branchId?: string, floorId?: string): Table[] {
    let tables: Table[] = JSON.parse(localStorage.getItem('yumto_tables') || '[]');
    if (branchId) tables = tables.filter(t => t.branchId === branchId);
    if (floorId) tables = tables.filter(t => t.floorId === floorId);
    return tables;
  }

  getMenu(branchId?: string): MenuItem[] {
    const menu: MenuItem[] = JSON.parse(localStorage.getItem('yumto_menu') || '[]');
    if (branchId) {
      return menu.filter(item => item.branchesAvailable.includes(branchId));
    }
    return menu;
  }

  getReservations(branchId?: string): Reservation[] {
    const res: Reservation[] = JSON.parse(localStorage.getItem('yumto_reservations') || '[]');
    return branchId ? res.filter(r => r.branchId === branchId) : res;
  }

  getOrders(branchId?: string): Order[] {
    const ords: Order[] = JSON.parse(localStorage.getItem('yumto_orders') || '[]');
    return branchId ? ords.filter(o => o.branchId === branchId) : ords;
  }

  // Operations
  addMenuItem(item: Omit<MenuItem, 'id'>) {
    const menu = this.getMenu();
    const newItem: MenuItem = { ...item, id: 'm-' + generateId() };
    menu.push(newItem);
    localStorage.setItem('yumto_menu', JSON.stringify(menu));
    this.notify();
    return newItem;
  }

  updateMenuItem(item: MenuItem) {
    const menu = this.getMenu();
    const index = menu.findIndex(m => m.id === item.id);
    if (index !== -1) {
      menu[index] = item;
      localStorage.setItem('yumto_menu', JSON.stringify(menu));
      this.notify();
    }
  }

  deleteMenuItem(id: string) {
    const menu = this.getMenu();
    const filtered = menu.filter(m => m.id !== id);
    localStorage.setItem('yumto_menu', JSON.stringify(filtered));
    this.notify();
  }

  addOrder(order: Omit<Order, 'id' | 'createdAt'>) {
    const orders = this.getOrders();
    const isOnline = order.isOnline ?? true;
    const isPunched = order.isPunched ?? (order.orderType === 'DINE_IN' && !isOnline ? true : false);
    const newOrder: Order = {
      ...order,
      discountAmount: order.discountAmount ?? 0,
      discountPercent: order.discountPercent ?? 0,
      isOnline,
      isPunched,
      isCallConfirmed: order.isCallConfirmed ?? false,
      status: isPunched ? (order.status || 'PREPARING') : 'PENDING',
      id: 'ord-' + generateId(),
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder); // Add to beginning of queue
    localStorage.setItem('yumto_orders', JSON.stringify(orders));

    // If order has table assigned, mark table as occupied/reserved
    if (order.tableId) {
      this.updateTableStatus(order.tableId, 'OCCUPIED');
    }

    this.notify();
    return newOrder;
  }

  confirmAndPunchOnlineOrder(orderId: string, cashierName: string): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return false;
    
    orders[index].isCallConfirmed = true;
    orders[index].isPunched = true;
    orders[index].confirmedByCashier = cashierName;
    orders[index].status = 'PREPARING'; // Now sent to Kitchen KDS!
    localStorage.setItem('yumto_orders', JSON.stringify(orders));
    this.notify();
    return true;
  }

  editOrderItems(orderId: string, items: OrderItem[], discountAmount?: number, discountPercent?: number): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return false;
    
    // Once punched to kitchen and started, order cannot be edited
    if (orders[index].isPunched && orders[index].status !== 'PENDING') {
      return false;
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discPct = discountPercent !== undefined ? discountPercent : orders[index].discountPercent || 0;
    const discAmt = discountAmount !== undefined ? discountAmount : Math.round((subtotal * discPct) / 100);
    const discounted = Math.max(0, subtotal - discAmt);
    const taxCalc = this.calculateSalesTax(discounted, orders[index].paymentMethod);
    const total = discounted + taxCalc.taxAmount + (orders[index].deliveryFee || 0) + (orders[index].premiumReservationFee || 0);

    orders[index].items = items;
    orders[index].subtotal = subtotal;
    orders[index].discountAmount = discAmt;
    orders[index].discountPercent = discPct;
    orders[index].tax = taxCalc.taxAmount;
    orders[index].total = total;

    localStorage.setItem('yumto_orders', JSON.stringify(orders));
    this.notify();
    return true;
  }

  deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return false;
    if (orders[index].tableId) {
      this.updateTableStatus(orders[index].tableId!, 'AVAILABLE');
    }
    orders.splice(index, 1);
    localStorage.setItem('yumto_orders', JSON.stringify(orders));
    this.notify();
    return true;
  }

  getTillTransactions(branchId?: string, shiftId?: string): TillTransaction[] {
    const txs: TillTransaction[] = JSON.parse(localStorage.getItem('yumto_till_transactions') || '[]');
    let filtered = txs;
    if (branchId) filtered = filtered.filter(t => t.branchId === branchId);
    if (shiftId) filtered = filtered.filter(t => t.shiftId === shiftId);
    return filtered;
  }

  addTillTransaction(tx: Omit<TillTransaction, 'id' | 'timestamp'>): TillTransaction {
    const txs: TillTransaction[] = JSON.parse(localStorage.getItem('yumto_till_transactions') || '[]');
    const newTx: TillTransaction = {
      ...tx,
      id: 'tx-' + generateId(),
      timestamp: new Date().toISOString()
    };
    txs.unshift(newTx);
    localStorage.setItem('yumto_till_transactions', JSON.stringify(txs));

    // Update active shift cash movement
    if (tx.shiftId) {
      if (tx.type === 'CASH_IN') {
        this.recordCashMovement(tx.shiftId, 'IN', tx.amount);
      } else {
        this.recordCashMovement(tx.shiftId, 'OUT', tx.amount);
      }
    }

    this.notify();
    return newTx;
  }

  saveCustomerAddress(userId: string, address: Omit<CustomerAddress, 'id'>): CustomerAddress {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    const newAddr: CustomerAddress = {
      ...address,
      id: 'addr-' + generateId()
    };

    if (userIndex !== -1) {
      if (!users[userIndex].addresses) users[userIndex].addresses = [];
      users[userIndex].addresses!.push(newAddr);
      localStorage.setItem('yumto_users', JSON.stringify(users));
    }
    this.notify();
    return newAddr;
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      // Handle automatic table release if order is COMPLETED or CANCELLED
      if ((status === 'COMPLETED' || status === 'CANCELLED') && orders[index].tableId) {
        this.updateTableStatus(orders[index].tableId!, 'AVAILABLE');
      }
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
      this.notify();
    }
  }

  assignTableToOrder(orderId: string, tableId: string, _managerId: string) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      // Release old table if there was one
      if (orders[index].tableId) {
        this.updateTableStatus(orders[index].tableId!, 'AVAILABLE');
      }
      orders[index].tableId = tableId;
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
      
      // Occupy new table
      this.updateTableStatus(tableId, 'OCCUPIED');
      this.notify();
    }
  }

  assignRiderToOrder(orderId: string, riderId: string) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].riderId = riderId;
      orders[index].status = 'SHIPPED'; // automatically mark as shipped
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
      this.notify();
    }
  }

  addReservation(res: Omit<Reservation, 'id' | 'createdAt'>) {
    const reservations = this.getReservations();
    const newRes: Reservation = {
      ...res,
      id: 'res-' + generateId(),
      createdAt: new Date().toISOString()
    };
    reservations.push(newRes);
    localStorage.setItem('yumto_reservations', JSON.stringify(reservations));

    // Update table status
    this.updateTableStatus(res.tableId, 'RESERVED');
    this.notify();
    return newRes;
  }

  updateReservationStatus(resId: string, status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED') {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === resId);
    if (index !== -1) {
      const oldStatus = reservations[index].status;
      reservations[index].status = status;
      localStorage.setItem('yumto_reservations', JSON.stringify(reservations));

      const tableId = reservations[index].tableId;
      if (status === 'SEATED') {
        this.updateTableStatus(tableId, 'OCCUPIED');
      } else if (status === 'CANCELLED') {
        this.updateTableStatus(tableId, 'AVAILABLE');
      } else if (status === 'CONFIRMED' && oldStatus === 'CANCELLED') {
        this.updateTableStatus(tableId, 'RESERVED');
      }
      this.notify();
    }
  }

  updateTableStatus(tableId: string, status: TableStatus) {
    const tables = this.getTables();
    const index = tables.findIndex(t => t.id === tableId);
    if (index !== -1) {
      tables[index].status = status;
      localStorage.setItem('yumto_tables', JSON.stringify(tables));
      this.notify();
    }
  }

  updateBranchPremiumFee(branchId: string, fee: number) {
    const branches = this.getBranches();
    const index = branches.findIndex(b => b.id === branchId);
    if (index !== -1) {
      branches[index].premiumBookingFee = fee;
      localStorage.setItem('yumto_branches', JSON.stringify(branches));
      this.notify();
    }
  }

  updateBranchSurchargeToggle(branchId: string, toggle: boolean) {
    const branches = this.getBranches();
    const index = branches.findIndex(b => b.id === branchId);
    if (index !== -1) {
      branches[index].activeSurchargeToggle = toggle;
      localStorage.setItem('yumto_branches', JSON.stringify(branches));
      this.notify();
    }
  }

  addBranch(branch: Omit<Branch, 'id'>) {
    const branches = this.getBranches();
    const newId = 'br-' + generateId();
    const newBranch: Branch = { ...branch, id: newId };
    branches.push(newBranch);
    localStorage.setItem('yumto_branches', JSON.stringify(branches));
    
    // Seed default floor for this branch
    const floors = JSON.parse(localStorage.getItem('yumto_floors') || '[]');
    const floorId = `fl-${newId}-g`;
    floors.push({
      id: floorId,
      branchId: newId,
      name: 'Ground Floor',
      level: 1
    });
    localStorage.setItem('yumto_floors', JSON.stringify(floors));

    // Seed default tables for the floor layout view
    const tables = JSON.parse(localStorage.getItem('yumto_tables') || '[]');
    for (let i = 1; i <= 4; i++) {
      tables.push({
        id: `t-${newId}-${i}`,
        floorId: floorId,
        branchId: newId,
        tableNumber: `T0${i}`,
        capacity: 4,
        type: 'STANDARD',
        x: 10 + (i * 20),
        y: 35,
        width: 12,
        height: 12,
        status: 'AVAILABLE'
      });
    }
    localStorage.setItem('yumto_tables', JSON.stringify(tables));
    
    this.notify();
    return newBranch;
  }

  deleteBranch(branchId: string) {
    const branches = this.getBranches();
    const filtered = branches.filter(b => b.id !== branchId);
    localStorage.setItem('yumto_branches', JSON.stringify(filtered));
    this.notify();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Shift Opening, Closing, Denominations & Reconciliation
  // ─────────────────────────────────────────────────────────────────────────
  getShifts(branchId?: string): CashierShift[] {
    const list: CashierShift[] = JSON.parse(localStorage.getItem('yumto_shifts') || '[]');
    return branchId ? list.filter(s => s.branchId === branchId) : list;
  }

  getActiveShift(branchIdOrCashier?: string, cashierId?: string): CashierShift | null {
    const shifts = this.getShifts();
    if (!branchIdOrCashier) {
      return shifts.find(s => s.status === 'OPEN') || null;
    }
    return shifts.find(s => s.status === 'OPEN' && (
      s.branchId === branchIdOrCashier || s.cashierId === branchIdOrCashier || (cashierId && s.cashierId === cashierId)
    )) || null;
  }

  openShift(cashierId: string, cashierName: string, branchId: string, openingFloat: number, openingNotes?: string): CashierShift {
    return this.openShiftWithFloat(cashierId, cashierName, branchId, openingFloat, openingNotes);
  }

  openShiftWithFloat(
    cashierId: string,
    cashierName: string,
    branchId: string,
    openingFloat: number,
    openingNotes?: string
  ): CashierShift {
    const shifts = this.getShifts();
    const newShift: CashierShift = {
      id: 'sh-' + generateId(),
      cashierId,
      cashierName,
      branchId,
      openedAt: new Date().toISOString(),
      openingFloat: Math.round(openingFloat),
      openingNotes: openingNotes || '',
      cashSales: 0,
      cardSales: 0,
      onlineSales: 0,
      totalServiceChargesCollected: 0,
      totalTaxCollected: 0,
      cashIn: 0,
      cashOut: 0,
      inventoryBoughtFromTill: 0,
      expectedCashInDrawer: Math.round(openingFloat),
      status: 'OPEN'
    };
    shifts.unshift(newShift);
    localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
    this.notify();
    return newShift;
  }

  closeShiftWithDenominations(
    shiftId: string,
    denominations: CashDenominations,
    closingNotes?: string,
    handoverToCashierName?: string
  ): CashierShift | null {
    const shifts = this.getShifts();
    const idx = shifts.findIndex(s => s.id === shiftId);
    if (idx === -1) return null;

    const countedCash = 
      (denominations.rs5000 * 5000) +
      (denominations.rs1000 * 1000) +
      (denominations.rs500 * 500) +
      (denominations.rs100 * 100) +
      (denominations.rs50 * 50) +
      (denominations.rs20 * 20) +
      (denominations.rs10 * 10) +
      (denominations.coins);

    const s = shifts[idx];
    const expected = s.openingFloat + s.cashSales + s.cashIn - s.cashOut - s.inventoryBoughtFromTill;
    const discrepancy = countedCash - expected;

    shifts[idx] = {
      ...s,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      denominations,
      actualCashCounted: countedCash,
      expectedCashInDrawer: expected,
      cashDiscrepancy: discrepancy,
      closingNotes: closingNotes || '',
      handoverToCashierName: handoverToCashierName || 'Next Shift Cashier'
    };

    localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
    this.notify();
    return shifts[idx];
  }

  // Legacy close shift support
  closeShift(shiftId: string, actualCashCounted: number) {
    const defaultDenoms: CashDenominations = {
      rs5000: Math.floor(actualCashCounted / 5000),
      rs1000: 0, rs500: 0, rs100: 0, rs50: 0, rs20: 0, rs10: 0,
      coins: actualCashCounted % 5000
    };
    return this.closeShiftWithDenominations(shiftId, defaultDenoms);
  }

  recordCashMovement(shiftId: string, type: 'IN' | 'OUT', amount: number) {
    const shifts = this.getShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index !== -1) {
      if (type === 'IN') shifts[index].cashIn += amount;
      else shifts[index].cashOut += amount;
      localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
      this.notify();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Financial Accounting: Expenses, Vendors & P&L
  // ─────────────────────────────────────────────────────────────────────────
  getExpenses(branchId?: string): Expense[] {
    const list: Expense[] = JSON.parse(localStorage.getItem('yumto_expenses') || '[]');
    return branchId ? list.filter(e => e.branchId === branchId) : list;
  }

  addExpense(expense: Omit<Expense, 'id'>): Expense {
    const list = this.getExpenses();
    const newExp: Expense = { ...expense, id: 'exp-' + generateId() };
    list.unshift(newExp);
    localStorage.setItem('yumto_expenses', JSON.stringify(list));
    this.notify();
    return newExp;
  }

  deleteExpense(id: string) {
    const list = this.getExpenses();
    const filtered = list.filter(e => e.id !== id);
    localStorage.setItem('yumto_expenses', JSON.stringify(filtered));
    this.notify();
  }

  getVendors(branchId?: string): Vendor[] {
    const list: Vendor[] = JSON.parse(localStorage.getItem('yumto_vendors') || '[]');
    return branchId ? list.filter(v => v.branchId === branchId) : list;
  }

  addVendor(vendor: Omit<Vendor, 'id'>): Vendor {
    const list = this.getVendors();
    const newVen: Vendor = { ...vendor, id: 'v-' + generateId() };
    list.push(newVen);
    localStorage.setItem('yumto_vendors', JSON.stringify(list));
    this.notify();
    return newVen;
  }

  updateVendor(vendor: Vendor) {
    const list = this.getVendors();
    const idx = list.findIndex(v => v.id === vendor.id);
    if (idx !== -1) {
      list[idx] = vendor;
      localStorage.setItem('yumto_vendors', JSON.stringify(list));
      this.notify();
    }
  }

  getVendorInvoices(branchId?: string): VendorInvoice[] {
    const list: VendorInvoice[] = JSON.parse(localStorage.getItem('yumto_vendor_invoices') || '[]');
    return branchId ? list.filter(i => i.branchId === branchId) : list;
  }

  addVendorInvoice(inv: Omit<VendorInvoice, 'id' | 'createdAt'>): VendorInvoice {
    const list = this.getVendorInvoices();
    const newInv: VendorInvoice = {
      ...inv,
      id: 'vinv-' + generateId(),
      createdAt: new Date().toISOString()
    };
    list.unshift(newInv);
    localStorage.setItem('yumto_vendor_invoices', JSON.stringify(list));

    const vendors = this.getVendors();
    const vIdx = vendors.findIndex(v => v.id === inv.vendorId);
    if (vIdx !== -1) {
      vendors[vIdx].currentBalancePayable += inv.balanceDue;
      localStorage.setItem('yumto_vendors', JSON.stringify(vendors));
    }

    this.notify();
    return newInv;
  }

  payVendorInvoice(invoiceId: string, amountPaid: number) {
    const list = this.getVendorInvoices();
    const idx = list.findIndex(i => i.id === invoiceId);
    if (idx !== -1) {
      const inv = list[idx];
      const newPaid = inv.amountPaid + amountPaid;
      const newBalance = Math.max(0, inv.totalAmount - newPaid);
      list[idx] = {
        ...inv,
        amountPaid: newPaid,
        balanceDue: newBalance,
        status: newBalance === 0 ? 'PAID' : 'PARTIAL'
      };
      localStorage.setItem('yumto_vendor_invoices', JSON.stringify(list));

      const vendors = this.getVendors();
      const vIdx = vendors.findIndex(v => v.id === inv.vendorId);
      if (vIdx !== -1) {
        vendors[vIdx].currentBalancePayable = Math.max(0, vendors[vIdx].currentBalancePayable - amountPaid);
        localStorage.setItem('yumto_vendors', JSON.stringify(vendors));
      }

      this.notify();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HR, Staff & Payroll
  // ─────────────────────────────────────────────────────────────────────────
  getStaff(branchId?: string): StaffMember[] {
    const list: StaffMember[] = JSON.parse(localStorage.getItem('yumto_staff') || '[]');
    return branchId ? list.filter(s => s.branchId === branchId) : list;
  }

  addStaff(staff: Omit<StaffMember, 'id'>): StaffMember {
    const list = this.getStaff();
    const newSt: StaffMember = { ...staff, id: 'st-' + generateId() };
    list.push(newSt);
    localStorage.setItem('yumto_staff', JSON.stringify(list));
    this.notify();
    return newSt;
  }

  updateStaff(staff: StaffMember) {
    const list = this.getStaff();
    const idx = list.findIndex(s => s.id === staff.id);
    if (idx !== -1) {
      list[idx] = staff;
      localStorage.setItem('yumto_staff', JSON.stringify(list));
      this.notify();
    }
  }

  getPayroll(month?: string): PayrollRecord[] {
    const list: PayrollRecord[] = JSON.parse(localStorage.getItem('yumto_payroll') || '[]');
    return month ? list.filter(p => p.month === month) : list;
  }

  generateMonthlyPayroll(monthStr: string) {
    const staff = this.getStaff();
    const currentPayroll = this.getPayroll();
    const newRecords: PayrollRecord[] = staff.map(st => {
      const existing = currentPayroll.find(p => p.staffId === st.id && p.month === monthStr);
      if (existing) return existing;

      return {
        id: 'pay-' + generateId(),
        staffId: st.id,
        staffName: st.name,
        month: monthStr,
        baseSalary: st.monthlySalary,
        allowances: 2000,
        deductions: 0,
        netPayable: st.monthlySalary + 2000,
        status: 'PENDING'
      };
    });

    localStorage.setItem('yumto_payroll', JSON.stringify(newRecords));
    this.notify();
    return newRecords;
  }

  paySalary(payrollId: string, method: 'BANK' | 'CASH' = 'BANK') {
    const list = this.getPayroll();
    const idx = list.findIndex(p => p.id === payrollId);
    if (idx !== -1) {
      list[idx].status = 'PAID';
      list[idx].paidDate = new Date().toISOString();
      list[idx].paymentMethod = method;
      localStorage.setItem('yumto_payroll', JSON.stringify(list));
      this.notify();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Dine-In Table Tabs & Live Manager/Frontdesk Order Taking
  // ─────────────────────────────────────────────────────────────────────────
  getOrderByTableId(tableId: string): Order | undefined {
    const orders = this.getOrders();
    return orders.find(o => o.tableId === tableId && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  }

  addOrUpdateTableOrder(params: {
    tableId: string;
    branchId?: string;
    items: OrderItem[];
    waiterOrManagerName: string;
    customerName?: string;
    customerPhone?: string;
    discountPercent?: number;
    discountAmount?: number;
  }): Order {
    const branchId = params.branchId || 'br-isb';
    const subtotal = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discPct = params.discountPercent || 0;
    const discAmt = params.discountAmount || Math.round((subtotal * discPct) / 100);
    const discounted = Math.max(0, subtotal - discAmt);
    const billCalc = this.calculateBilling(discounted, 'CASH');
    const total = billCalc.grandTotal;

    const existing = this.getOrderByTableId(params.tableId);
    let order: Order;

    if (existing) {
      existing.items = params.items;
      existing.subtotal = subtotal;
      existing.discountPercent = discPct;
      existing.discountAmount = discAmt;
      existing.serviceCharge = billCalc.serviceCharge;
      existing.taxableAmount = billCalc.taxableAmount;
      existing.tax = billCalc.taxAmount;
      existing.taxRatePercent = billCalc.taxRatePercent;
      existing.total = total;
      if (params.customerName) existing.userName = params.customerName;
      if (params.customerPhone) existing.userPhone = params.customerPhone;
      existing.waiterName = params.waiterOrManagerName;
      existing.status = existing.status === 'READY' ? 'READY' : 'PREPARING';

      const orders = this.getOrders();
      const idx = orders.findIndex(o => o.id === existing.id);
      if (idx !== -1) orders[idx] = existing;
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
      order = existing;
    } else {
      order = {
        id: 'ord-tbl-' + generateId(),
        branchId,
        userId: 'u-table',
        userName: params.customerName || 'Table Guest',
        userPhone: params.customerPhone || '0330-0500600',
        orderType: 'DINE_IN',
        tableId: params.tableId,
        status: 'PREPARING',
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH',
        items: params.items,
        subtotal,
        discountPercent: discPct,
        discountAmount: discAmt,
        serviceCharge: billCalc.serviceCharge,
        serviceChargePercent: 5,
        taxableAmount: billCalc.taxableAmount,
        tax: billCalc.taxAmount,
        taxRatePercent: billCalc.taxRatePercent,
        deliveryFee: 0,
        premiumReservationFee: 0,
        total,
        waiterName: params.waiterOrManagerName,
        createdAt: new Date().toISOString()
      };
      const orders = this.getOrders();
      orders.unshift(order);
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
    }

    this.updateTableStatus(params.tableId, 'OCCUPIED');
    this.notify();
    return order;
  }

  transferTable(fromTableId: string, toTableId: string): boolean {
    const order = this.getOrderByTableId(fromTableId);
    if (!order) return false;

    order.tableId = toTableId;
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) orders[idx] = order;
    localStorage.setItem('yumto_orders', JSON.stringify(orders));

    this.updateTableStatus(fromTableId, 'AVAILABLE');
    this.updateTableStatus(toTableId, 'OCCUPIED');
    this.notify();
    return true;
  }

  markTableBillRequested(tableId: string): Order | null {
    const order = this.getOrderByTableId(tableId);
    if (!order) return null;
    order.isBillRequested = true;
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) orders[idx] = order;
    localStorage.setItem('yumto_orders', JSON.stringify(orders));
    this.notify();
    return order;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POS: Held (Parked) Orders
  // ─────────────────────────────────────────────────────────────────────────
  getHeldOrders(branchId?: string): HeldOrder[] {
    const held: HeldOrder[] = JSON.parse(localStorage.getItem('yumto_held_orders') || '[]');
    return branchId ? held.filter(h => h.branchId === branchId) : held;
  }

  holdPosOrder(ticket: Omit<HeldOrder, 'id' | 'heldAt'>): HeldOrder {
    const held = this.getHeldOrders();
    const newHeld: HeldOrder = {
      ...ticket,
      id: 'held-' + generateId(),
      heldAt: new Date().toISOString(),
    };
    held.push(newHeld);
    localStorage.setItem('yumto_held_orders', JSON.stringify(held));
    this.notify();
    return newHeld;
  }

  recallPosOrder(heldId: string): HeldOrder | null {
    const held = this.getHeldOrders();
    const index = held.findIndex(h => h.id === heldId);
    if (index === -1) return null;
    const [recalled] = held.splice(index, 1);
    localStorage.setItem('yumto_held_orders', JSON.stringify(held));
    this.notify();
    return recalled;
  }

  deleteHeldOrder(heldId: string) {
    const held = this.getHeldOrders();
    const filtered = held.filter(h => h.id !== heldId);
    localStorage.setItem('yumto_held_orders', JSON.stringify(filtered));
    this.notify();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POS: Checkout — creates a fully confirmed & paid POS order
  // ─────────────────────────────────────────────────────────────────────────
  createPosOrder(payload: {
    branchId: string;
    cashierId: string;
    cashierName: string;
    orderType: 'DINE_IN' | 'PICK_UP';
    tableId?: string;
    items: Order['items'];
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    serviceCharge: number;
    tax: number;
    taxRatePercent: number;
    total: number;
    paymentMethod: PaymentMethodType;
    shiftId?: string;
  }): Order {
    const newOrder: Order = {
      id: 'pos-' + generateId(),
      branchId: payload.branchId,
      userId: payload.cashierId,
      userName: payload.cashierName,
      userPhone: '',
      orderType: payload.orderType,
      tableId: payload.tableId,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: payload.paymentMethod,
      cashierId: payload.cashierId,
      items: payload.items,
      subtotal: payload.subtotal,
      discountAmount: payload.discountAmount,
      discountPercent: payload.discountPercent,
      serviceCharge: payload.serviceCharge,
      serviceChargePercent: 5,
      taxableAmount: payload.subtotal - payload.discountAmount + payload.serviceCharge,
      tax: payload.tax,
      taxRatePercent: payload.taxRatePercent,
      deliveryFee: 0,
      premiumReservationFee: 0,
      total: payload.total,
      createdAt: new Date().toISOString(),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem('yumto_orders', JSON.stringify(orders));

    if (payload.tableId) {
      this.updateTableStatus(payload.tableId, 'OCCUPIED');
    }

    if (payload.shiftId) {
      const shifts = this.getShifts();
      const idx = shifts.findIndex(s => s.id === payload.shiftId);
      if (idx !== -1) {
        if (payload.paymentMethod === 'CASH') {
          shifts[idx].cashSales += payload.total;
        } else if (payload.paymentMethod === 'CARD') {
          shifts[idx].cardSales += payload.total;
        } else {
          shifts[idx].onlineSales += payload.total;
        }
        shifts[idx].totalTaxCollected += payload.tax;
        shifts[idx].totalServiceChargesCollected += payload.serviceCharge;
        localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
      }
    }

    this.notify();
    return newOrder;
  }

  static useDbState() {
    const [, setTick] = useState(0);
    useEffect(() => {
      return db.subscribe(() => setTick((t: number) => t + 1));
    }, []);
    return db;
  }
}

export const db = new MockDatabase();

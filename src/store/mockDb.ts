import { HAANDI_MENU } from './menuData';
import { useState, useEffect } from 'react';
import type { Branch, Floor, Table, MenuItem, Reservation, Order, OrderItem, UserProfile, OrderStatus, TableStatus, CashierShift, HeldOrder, SystemSettings, TillTransaction, CustomerAddress } from '../types';

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
  { id: 'u-kit1', name: 'Chef Tariq', phone: '0312 3456789', role: 'KITCHEN', branchId: 'br-isb' },
  { id: 'u-ride1', name: 'Zahid Rider 1', phone: '0345 6789012', role: 'RIDER' },
  { id: 'u-ride2', name: 'Kamran Rider 2', phone: '0315 1122334', role: 'RIDER' },
  { id: 'u-own', name: 'Sajid Owner (HQ)', phone: '0300 0000000', role: 'OWNER' },
  { id: 'u-cash1', name: 'Nadia Cashier (Islamabad)', phone: '0321 5550001', role: 'CASHIER', branchId: 'br-isb' },
  { id: 'u-cash2', name: 'Hamza Cashier (Islamabad)', phone: '0333 5550002', role: 'CASHIER', branchId: 'br-isb' },
];

// Single Location — Gulberg Greens, Islamabad
const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'br-isb',
    name: 'Haandi by Yumto - Gulberg Greens, Islamabad',
    city: 'Islamabad',
    address: 'Gulberg Greens, Civic Center, Executive Block, Islamabad',
    phone: '0330 0500600',
    premiumBookingFee: 1500,
    activeSurchargeToggle: true
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
    tax: 104, // 5% for Online
    deliveryFee: 150,
    premiumReservationFee: 0,
    total: 2324,
    deliveryAddress: 'House 12, Executive Block, Gulberg Greens, Islamabad (0.4 km)',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  }
];

const DEFAULT_SETTINGS: SystemSettings = {
  isTaxActive: true,
  salesTaxCardPercent: 5,
  salesTaxCashPercent: 16,
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
    // Always force-refresh menu data to pick up any new items
    localStorage.setItem('yumto_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('yumto_branches', JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem('yumto_floors', JSON.stringify(INITIAL_FLOORS));
    localStorage.setItem('yumto_tables', JSON.stringify(INITIAL_TABLES));
    localStorage.setItem('yumto_menu', JSON.stringify(INITIAL_MENU));
    if (!localStorage.getItem('yumto_settings')) {
      localStorage.setItem('yumto_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('yumto_reservations')) {
      localStorage.setItem('yumto_reservations', JSON.stringify(INITIAL_RESERVATIONS));
    }
    if (!localStorage.getItem('yumto_orders')) {
      localStorage.setItem('yumto_orders', JSON.stringify(INITIAL_ORDERS));
    }
    // POS-specific keys – only seed once per session
    if (!localStorage.getItem('yumto_shifts')) {
      localStorage.setItem('yumto_shifts', JSON.stringify([]));
    }
    if (!localStorage.getItem('yumto_held_orders')) {
      localStorage.setItem('yumto_held_orders', JSON.stringify([]));
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

  // FBR Sales Tax Rule: Controlled by isTaxActive toggle
  calculateSalesTax(subtotal: number, paymentMethod: string): { taxRate: number; taxAmount: number } {
    const settings = this.getSettings();
    if (!settings.isTaxActive) {
      return { taxRate: 0, taxAmount: 0 };
    }
    const isDigital = paymentMethod === 'CARD' || paymentMethod === 'ONLINE';
    const rate = isDigital ? (settings.salesTaxCardPercent / 100) : (settings.salesTaxCashPercent / 100);
    return {
      taxRate: isDigital ? settings.salesTaxCardPercent : settings.salesTaxCashPercent,
      taxAmount: Math.round(subtotal * rate)
    };
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
  // POS: Cashier Shift Management
  // ─────────────────────────────────────────────────────────────────────────

  getShifts(branchId?: string): CashierShift[] {
    const shifts: CashierShift[] = JSON.parse(localStorage.getItem('yumto_shifts') || '[]');
    return branchId ? shifts.filter(s => s.branchId === branchId) : shifts;
  }

  getActiveShift(branchId: string, cashierId: string): CashierShift | null {
    return this.getShifts(branchId).find(
      s => s.cashierId === cashierId && s.status === 'OPEN'
    ) ?? null;
  }

  openShift(cashierId: string, cashierName: string, branchId: string, openingFloat: number): CashierShift {
    const shifts = this.getShifts();
    const newShift: CashierShift = {
      id: 'shift-' + generateId(),
      cashierId,
      cashierName,
      branchId,
      openedAt: new Date().toISOString(),
      openingFloat,
      cashSales: 0,
      cardSales: 0,
      cashIn: 0,
      cashOut: 0,
      status: 'OPEN',
    };
    shifts.push(newShift);
    localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
    this.notify();
    return newShift;
  }

  closeShift(shiftId: string, actualCashCounted: number) {
    const shifts = this.getShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index !== -1) {
      shifts[index].status = 'CLOSED';
      shifts[index].closedAt = new Date().toISOString();
      shifts[index].actualCashCounted = actualCashCounted;
      localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
      this.notify();
    }
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

  private _updateShiftSales(shiftId: string, paymentMethod: string, amount: number) {
    const shifts = this.getShifts();
    const index = shifts.findIndex(s => s.id === shiftId);
    if (index !== -1) {
      if (paymentMethod === 'CASH') shifts[index].cashSales += amount;
      else if (paymentMethod === 'CARD') shifts[index].cardSales += amount;
      else if (paymentMethod === 'SPLIT' && shifts[index]) {
        // split amounts are tracked separately via the order's splitPayment field
        // we add both portions
      }
      localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
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
    const taxCalc = this.calculateSalesTax(discounted, 'CASH');
    const total = discounted + taxCalc.taxAmount;

    const existing = this.getOrderByTableId(params.tableId);
    let order: Order;

    if (existing) {
      existing.items = params.items;
      existing.subtotal = subtotal;
      existing.discountPercent = discPct;
      existing.discountAmount = discAmt;
      existing.tax = taxCalc.taxAmount;
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
        tax: taxCalc.taxAmount,
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

    // Mark table as OCCUPIED
    this.updateTableStatus(params.tableId, 'OCCUPIED');
    this.notify();
    return order;
  }

  transferTable(fromTableId: string, toTableId: string): boolean {
    const order = this.getOrderByTableId(fromTableId);
    if (!order) return false;

    // Update order tableId
    order.tableId = toTableId;
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx !== -1) orders[idx] = order;
    localStorage.setItem('yumto_orders', JSON.stringify(orders));

    // Release old table, occupy new table
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

  createPosOrder(
    payload: {
      branchId: string;
      cashierId: string;
      cashierName: string;
      orderType: 'DINE_IN' | 'PICK_UP';
      tableId?: string;
      items: Order['items'];
      subtotal: number;
      discountAmount: number;
      discountPercent: number;
      tax: number;
      total: number;
      paymentMethod: 'CASH' | 'CARD' | 'SPLIT';
      splitPayment?: { cashAmount: number; cardAmount: number };
      shiftId?: string;
    }
  ): Order {
    const newOrder: Order = {
      id: 'pos-' + generateId(),
      branchId: payload.branchId,
      userId: payload.cashierId,
      userName: payload.cashierName,
      userPhone: '',
      orderType: payload.orderType,
      tableId: payload.tableId,
      status: 'CONFIRMED',          // POS orders skip PENDING — go straight to kitchen
      paymentStatus: 'PAID',        // POS always paid at counter
      paymentMethod: payload.paymentMethod,
      splitPayment: payload.splitPayment,
      cashierId: payload.cashierId,
      items: payload.items,
      subtotal: payload.subtotal,
      discountAmount: payload.discountAmount,
      discountPercent: payload.discountPercent,
      tax: payload.tax,
      deliveryFee: 0,
      premiumReservationFee: 0,
      total: payload.total,
      createdAt: new Date().toISOString(),
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem('yumto_orders', JSON.stringify(orders));

    // Mark table as OCCUPIED immediately if Dine-In
    if (payload.tableId) {
      this.updateTableStatus(payload.tableId, 'OCCUPIED');
    }

    // Record sales in the active shift
    if (payload.shiftId) {
      if (payload.paymentMethod === 'SPLIT' && payload.splitPayment) {
        const shifts = this.getShifts();
        const idx = shifts.findIndex(s => s.id === payload.shiftId);
        if (idx !== -1) {
          shifts[idx].cashSales += payload.splitPayment.cashAmount;
          shifts[idx].cardSales += payload.splitPayment.cardAmount;
          localStorage.setItem('yumto_shifts', JSON.stringify(shifts));
        }
      } else {
        this._updateShiftSales(payload.shiftId, payload.paymentMethod, payload.total);
      }
    }

    this.notify();
    return newOrder;
  }

  // Dynamic state getter hook replacement
  static useDbState() {
    const [, setTick] = useState(0);
    useEffect(() => {
      return db.subscribe(() => setTick((t: number) => t + 1));
    }, []);
    return db;
  }
}

export const db = new MockDatabase();

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../store/mockDb';
import type { Order, OrderItem, MenuItem, CashierShift, HeldOrder, Table } from '../types';
import {
  ShoppingCart, Search, Minus, Plus, Trash2,
  Clock, ReceiptText, ChevronDown,
  PauseCircle, X,
  BarChart3, LogIn, LogOut,
  Sun, Moon, Printer, Phone, PhoneCall,
  Edit3, DollarSign,
  Package, CheckCircle2, MessageSquare, ChefHat
} from 'lucide-react';
import { WhatsAppBotModal } from './WhatsAppBotModal';
import { notificationService } from '../services/notificationService';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtMoney = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`;
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

// ─── Thermal Printer Bill Modal (Matching User Screenshot) ─────────────────
interface ReceiptProps {
  order: {
    id: string;
    cashierName: string;
    branchName: string;
    orderType: string;
    tableNumber?: string;
    items: OrderItem[];
    subtotal: number;
    discountAmount: number;
    tax: number;
    taxRatePercent: number;
    total: number;
    paymentMethod: string;
    tenderedAmount?: number;
    splitPayment?: { cashAmount: number; cardAmount: number };
    createdAt: string;
  };
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptProps> = ({ order, onClose }) => {
  const [activeTab, setActiveTab] = useState<'BILL' | 'KOT'>('BILL');
  const totalQty = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const received = order.tenderedAmount && order.tenderedAmount >= order.total ? order.tenderedAmount : order.total;
  const balance = Math.max(0, received - order.total);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '12px',
          maxWidth: '430px', width: '100%',
          overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar controls */}
        <div style={{ background: '#1A120B', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer style={{ width: '16px', height: '16px', color: '#E85D04' }} />
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '13px', letterSpacing: '0.05em' }}>
              80mm Thermal Receipt
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setActiveTab('BILL')}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                border: 'none', cursor: 'pointer',
                background: activeTab === 'BILL' ? '#E85D04' : 'rgba(255,255,255,0.1)',
                color: '#fff'
              }}
            >
              Provisional Bill
            </button>
            <button
              onClick={() => setActiveTab('KOT')}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                border: 'none', cursor: 'pointer',
                background: activeTab === 'KOT' ? '#E85D04' : 'rgba(255,255,255,0.1)',
                color: '#fff'
              }}
            >
              Kitchen KOT
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', marginLeft: '6px' }}>
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div
          id="thermal-receipt-print"
          style={{
            padding: '24px 20px',
            background: '#ffffff',
            color: '#000000',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '12px',
            lineHeight: '1.4',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          {activeTab === 'BILL' ? (
            <div style={{ border: '2px solid #000', padding: '16px', borderRadius: '2px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.04em', textTransform: 'lowercase', fontFamily: 'serif' }}>
                  haandi by yumto
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: '600' }}>
                  Sector-Executive Block, Gulberg Greens, Islamabad.
                </div>
              </div>

              {/* Contact & GST info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                <span>Phone No.</span>
                <span style={{ fontWeight: '700' }}>0330-0500600</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                <span>G.S.T. / NTN No.</span>
                <span style={{ fontWeight: '700' }}>/4585147-3</span>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', margin: '8px 0 10px' }}>
                <span style={{ fontWeight: '900', fontSize: '14px', textDecoration: 'underline', letterSpacing: '0.05em' }}>
                  Provisional Bill
                </span>
              </div>

              {/* Order Meta */}
              <div style={{ fontSize: '11px', marginBottom: '8px', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Inv # : {order.id.slice(-8).toUpperCase()}</span>
                  <span>Cashier : {order.cashierName.split(' ')[0]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Date : {fmtDate(order.createdAt)}</span>
                  <span>Time : {fmtTime(order.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Table No. : ( {order.tableNumber || order.orderType} )</span>
                  <span>Server : Counter</span>
                </div>
              </div>

              {/* Items Table */}
              <div style={{ borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', padding: '4px 0', margin: '6px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '20px 1fr 55px 35px 60px', fontWeight: '800', fontSize: '11px' }}>
                  <span>#</span>
                  <span>Description</span>
                  <span style={{ textAlign: 'right' }}>Price</span>
                  <span style={{ textAlign: 'center' }}>QTY</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
              </div>

              {/* Items Rows */}
              <div style={{ minHeight: '60px' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '20px 1fr 55px 35px 60px',
                      fontSize: '11px',
                      padding: '2px 0'
                    }}
                  >
                    <span>{idx + 1}</span>
                    <span style={{ textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '4px' }}>
                      {item.name}{item.variation ? ` (${item.variation})` : ''}
                    </span>
                    <span style={{ textAlign: 'right' }}>{Math.round(item.price).toLocaleString()}</span>
                    <span style={{ textAlign: 'center' }}>{item.quantity}</span>
                    <span style={{ textAlign: 'right', fontWeight: '700' }}>
                      {Math.round(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Qty Divider */}
              <div style={{ borderTop: '1.5px solid #000', padding: '4px 0', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                <span>Total :</span>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <span>{totalQty}</span>
                  <span>{Math.round(order.subtotal).toLocaleString()}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '6px', marginTop: '4px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Total Amount</span>
                  <span style={{ fontWeight: '700' }}>{Math.round(order.subtotal).toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Discount</span>
                    <span style={{ fontWeight: '700' }}>-{Math.round(order.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>{order.taxRatePercent}.00 % Sale Tax</span>
                  <span style={{ fontWeight: '700' }}>{Math.round(order.tax).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontWeight: '800', fontSize: '12px' }}>
                  <span>Payable</span>
                  <span>{Math.round(order.total).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Received ({order.paymentMethod})</span>
                  <span style={{ fontWeight: '700' }}>{Math.round(received).toLocaleString()}</span>
                </div>
              </div>

              {/* Balance Amount */}
              <div style={{ borderTop: '1.5px solid #000', padding: '6px 0', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                <span>Balance Amount</span>
                <span>({Math.round(balance).toLocaleString()})</span>
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1.5px solid #000', paddingTop: '8px', marginTop: '6px', fontSize: '10px', lineHeight: '1.4' }}>
                <div>Software Developed by: <strong>YUMTO POS</strong></div>
                <div>Ph: <strong>+92 330 0500600</strong></div>
                <div style={{ marginTop: '4px' }}>Facebook / Instagram: <strong>@haandibyyumto</strong></div>
                <div style={{ textAlign: 'center', marginTop: '6px', fontWeight: '700', letterSpacing: '0.05em' }}>
                  THANK YOU FOR DINING WITH US!
                </div>
              </div>
            </div>
          ) : (
            <div style={{ border: '2px dashed #000', padding: '16px', borderRadius: '2px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.04em' }}>
                  *** KITCHEN ORDER TICKET (KOT) ***
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px' }}>
                  HAANDI BY YUMTO · ISLAMABAD
                </div>
              </div>

              <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '6px 0', margin: '8px 0', fontSize: '11px', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>KOT #{order.id.slice(-6).toUpperCase()}</strong>
                  <strong>Type: {order.orderType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Table: <strong>{order.tableNumber || 'Takeaway'}</strong></span>
                  <span>Time: {fmtTime(order.createdAt)}</span>
                </div>
                <div>Cashier / Waiter: {order.cashierName}</div>
              </div>

              <div style={{ margin: '10px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', fontWeight: '800', borderBottom: '1px solid #000', paddingBottom: '4px', fontSize: '11px' }}>
                  <span>QTY</span>
                  <span>ITEM DESCRIPTION</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', padding: '6px 0', borderBottom: '1px dashed #ccc', fontSize: '13px', fontWeight: '800' }}>
                    <span style={{ fontSize: '15px', color: '#000' }}>{item.quantity}x</span>
                    <div>
                      <div>{item.name}</div>
                      {item.variation && <div style={{ fontSize: '10px', color: '#555' }}>Portion: {item.variation}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', fontWeight: '700' }}>
                ** PLEASE EXPEDITE CLAY POTS & KARAHIS **
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1, background: '#1A120B', color: '#E85D04',
              border: 'none', borderRadius: '8px', padding: '12px',
              fontWeight: '800', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Printer style={{ width: '16px', height: '16px' }} />
            Print 80mm Thermal Receipt
          </button>
          <button
            onClick={onClose}
            style={{
              background: '#e5e7eb', color: '#374151',
              border: 'none', borderRadius: '8px', padding: '12px 16px',
              fontWeight: '700', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Shift Open Modal ────────────────────────────────────────────────────────
interface ShiftModalProps {
  cashierName: string;
  onOpen: (float: number) => void;
  onClose: () => void;
}
const ShiftOpenModal: React.FC<ShiftModalProps> = ({ cashierName, onOpen, onClose }) => {
  const [float, setFloat] = useState(5000);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '360px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background: '#1A120B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#E85D04', fontWeight: '800', fontSize: '14px' }}>🏦 Open Cashier Shift</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '13px', color: '#374151', marginBottom: '16px' }}>
            Cashier: <strong>{cashierName}</strong> (Gulberg Greens, Islamabad)
          </p>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b7280', marginBottom: '6px' }}>
            Opening Cash Float in Drawer
          </label>
          <input
            type="number"
            value={float}
            onChange={e => setFloat(Number(e.target.value))}
            style={{
              width: '100%', border: '2px solid #e5e7eb', borderRadius: '8px',
              padding: '10px 12px', fontSize: '16px', fontWeight: '700',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
          <button
            onClick={() => onOpen(float)}
            style={{
              marginTop: '16px', width: '100%', background: '#8B1E1E', color: '#ffffff',
              border: 'none', borderRadius: '10px', padding: '12px',
              fontWeight: '800', fontSize: '14px', cursor: 'pointer'
            }}
          >
            <LogIn style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Open Shift
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Shift Close / Z-Report Modal ───────────────────────────────────────────
interface ZReportProps {
  shift: CashierShift;
  onClose: (counted: number) => void;
  onDismiss: () => void;
}
const ZReportModal: React.FC<ZReportProps> = ({ shift, onClose, onDismiss }) => {
  const [counted, setCounted] = useState(0);
  const expectedCash = shift.openingFloat + shift.cashSales + shift.cashIn - shift.cashOut;
  const variance = counted - expectedCash;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background: '#1A120B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#E85D04', fontWeight: '800', fontSize: '14px' }}>📊 Z-Report / Close Shift</span>
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
        </div>
        <div style={{ padding: '20px', fontFamily: "'Courier New', monospace", fontSize: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '1px dashed #ccc', paddingBottom: '8px' }}>
            <strong>HAANDI BY YUMTO</strong><br />
            Gulberg Greens, Islamabad · Shift #{shift.id.slice(-6)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Opening Float</span><strong>{fmtMoney(shift.openingFloat)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#16a34a' }}>
            <span>Cash Sales (16% Tax)</span><strong>+ {fmtMoney(shift.cashSales)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2563eb' }}>
            <span>Card Sales (5% Tax)</span><strong>{fmtMoney(shift.cardSales)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Cash In</span><strong>+ {fmtMoney(shift.cashIn)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#dc2626' }}>
            <span>Cash Out / Expenses</span><strong>- {fmtMoney(shift.cashOut)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '2px dashed #374151', paddingTop: '8px', marginBottom: '14px' }}>
            <span>Expected Cash in Drawer</span><strong>{fmtMoney(expectedCash)}</strong>
          </div>

          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '6px' }}>
            Actual Counted Cash in Drawer
          </label>
          <input
            type="number"
            value={counted}
            onChange={e => setCounted(Number(e.target.value))}
            style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: '8px', padding: '10px', fontSize: '14px', fontWeight: '700', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }}
          />
          {counted > 0 && (
            <div style={{ fontSize: '12px', fontWeight: '700', color: variance >= 0 ? '#16a34a' : '#dc2626', marginBottom: '12px' }}>
              Variance: {variance >= 0 ? '+' : ''}{fmtMoney(variance)}
              {Math.abs(variance) < 1 ? ' ✅ Balanced' : variance > 0 ? ' ⚠️ Over' : ' ⚠️ Short'}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={onDismiss}
              style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onClose(counted)}
              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
            >
              <LogOut style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              Close Shift & Print Z
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Online Order Modal (Before Cashier Confirms / Punches) ────────────
interface EditOnlineOrderProps {
  order: Order;
  menu: MenuItem[];
  onSave: (items: OrderItem[], discountAmount: number) => void;
  onClose: () => void;
}
const EditOnlineOrderModal: React.FC<EditOnlineOrderProps> = ({ order, menu, onSave, onClose }) => {
  const [items, setItems] = useState<OrderItem[]>([...order.items]);
  const [flatDiscount, setFlatDiscount] = useState<number>(order.discountAmount || 0);
  const [selectedAddId, setSelectedAddId] = useState<string>('');

  const updateQty = (idx: number, delta: number) => {
    setItems(prev => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) next.splice(idx, 1);
      else next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  const handleAddItem = () => {
    if (!selectedAddId) return;
    const dish = menu.find(m => m.id === selectedAddId);
    if (!dish) return;
    const price = dish.variations && dish.variations.length > 0 ? dish.variations[0].price : dish.price;
    const variation = dish.variations && dish.variations.length > 0 ? dish.variations[0].name : undefined;

    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === dish.id && i.variation === variation);
      if (existing) {
        return prev.map(i => i.menuItemId === dish.id && i.variation === variation ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: dish.id, name: dish.name, price, quantity: 1, variation }];
    });
    setSelectedAddId('');
  };

  const currentSubtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const currentTotal = Math.max(0, currentSubtotal - flatDiscount) + (order.tax || 0) + (order.deliveryFee || 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#FDFBF7', borderRadius: '18px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '1.5px solid #EADBCC' }}>
        <div style={{ background: '#1A120B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E85D04' }}>
          <div>
            <div style={{ color: '#E85D04', fontWeight: '800', fontSize: '14px' }}>
              ✏️ Adjust Order #{order.id.slice(-6).toUpperCase()} (Pre-Punch)
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
              Customer: {order.userName} ({order.userPhone})
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ padding: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1A120B', marginBottom: '8px' }}>
            Current Items Ordered:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#111827' }}>{item.name}</div>
                  {item.variation && <div style={{ fontSize: '11px', color: '#E85D04', fontWeight: '700' }}>[{item.variation}]</div>}
                  <div style={{ fontSize: '12px', color: '#8B1E1E', fontWeight: '800' }}>{fmtMoney(item.price * item.quantity)}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => updateQty(idx, -1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus style={{ width: '12px', height: '12px' }} />
                  </button>
                  <span style={{ fontWeight: '800', fontSize: '13px', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(idx, 1)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus style={{ width: '12px', height: '12px' }} />
                  </button>
                  <button onClick={() => updateQty(idx, -item.quantity)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '6px', padding: '5px', cursor: 'pointer', marginLeft: '4px' }}>
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Additional Item */}
          <div style={{ background: '#F5EFE6', padding: '12px', borderRadius: '10px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B5B4C', marginBottom: '6px' }}>Add Extra Item to Order:</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <select
                value={selectedAddId}
                onChange={e => setSelectedAddId(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '12px', background: '#fff' }}
              >
                <option value="">-- Select dish to add --</option>
                {menu.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({fmtMoney(m.price)})</option>
                ))}
              </select>
              <button
                onClick={handleAddItem}
                disabled={!selectedAddId}
                style={{ background: '#8B1E1E', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '800', cursor: selectedAddId ? 'pointer' : 'not-allowed' }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Discount Field */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '12px', fontWeight: '700' }}>Flat Discount (Rs.):</span>
            <input
              type="number"
              value={flatDiscount || ''}
              placeholder="0"
              onChange={e => setFlatDiscount(Number(e.target.value))}
              style={{ width: '100px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '12px', fontWeight: '700', textAlign: 'right' }}
            />
          </div>

          {/* Updated Total */}
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(232,93,4,0.1)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '13px', color: '#8B1E1E' }}>
            <span>Updated Grand Total:</span>
            <span>{fmtMoney(currentTotal)}</span>
          </div>
        </div>

        <div style={{ background: '#fff', borderTop: '1px solid #EADBCC', padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => onSave(items, flatDiscount)}
            disabled={items.length === 0}
            style={{ padding: '8px 18px', borderRadius: '8px', background: '#8B1E1E', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '800', cursor: items.length > 0 ? 'pointer' : 'not-allowed' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Till Transaction Modal (Cash In, Cash Out, Petty Expense, Inventory Purchases) ───
interface TillActionModalProps {
  type: 'CASH_IN' | 'CASH_OUT' | 'EXPENSE' | 'INVENTORY_PURCHASE';
  shift: CashierShift;
  cashierName: string;
  onSave: (data: {
    type: 'CASH_IN' | 'CASH_OUT' | 'EXPENSE' | 'INVENTORY_PURCHASE';
    amount: number;
    category: string;
    description: string;
    supplierName?: string;
    inventoryItemName?: string;
    quantityAdded?: number;
  }) => void;
  onClose: () => void;
}

const TillActionModal: React.FC<TillActionModalProps> = ({ type, shift, cashierName, onSave, onClose }) => {
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>(
    type === 'INVENTORY_PURCHASE' ? 'Vendor Inventory' : type === 'EXPENSE' ? 'Daily Petty Supplies' : 'Till Movement'
  );
  const [description, setDescription] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [inventoryItemName, setInventoryItemName] = useState<string>('');
  const [quantityAdded, setQuantityAdded] = useState<number>(0);

  const title = type === 'INVENTORY_PURCHASE' ? '📦 Purchase Inventory from Cash Drawer'
    : type === 'EXPENSE' ? '💸 Daily Petty Cash Expense'
    : type === 'CASH_IN' ? '➕ Till Cash In (Float Deposit)'
    : '➖ Till Cash Out (Withdrawal)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onSave({
      type,
      amount,
      category,
      description: description.trim() || (type === 'INVENTORY_PURCHASE' ? `Purchased ${quantityAdded || 1}x ${inventoryItemName} from ${supplierName}` : `${type} by ${cashierName}`),
      supplierName: supplierName.trim() || undefined,
      inventoryItemName: inventoryItemName.trim() || undefined,
      quantityAdded: quantityAdded > 0 ? quantityAdded : undefined
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#FDFBF7', borderRadius: '18px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '1.5px solid #EADBCC' }}>
        <div style={{ background: '#1A120B', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E85D04' }}>
          <div style={{ color: '#E85D04', fontWeight: '800', fontSize: '13px' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
        </div>

        <div style={{ padding: '8px 18px 0', fontSize: '11px', color: '#6B5B4C', fontWeight: '700' }}>
          Active Shift #{shift.id.slice(-6)} · Opening Float: {fmtMoney(shift.openingFloat)}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '12px 18px 18px' }}>
          {/* Amount */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B382A', marginBottom: '4px' }}>
            Amount Deducted / Added (Rs.) *
          </label>
          <input
            type="number"
            required
            value={amount || ''}
            placeholder="e.g. 2500"
            onChange={e => setAmount(Number(e.target.value))}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '15px', fontWeight: '800', background: '#fff', marginBottom: '12px', boxSizing: 'border-box' }}
          />

          {/* Conditional Inventory Fields */}
          {type === 'INVENTORY_PURCHASE' && (
            <>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B382A', marginBottom: '4px' }}>
                Supplier / Vendor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Al-Madina Fresh Meat / Sabzi Mandi"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '12px', background: '#fff', marginBottom: '10px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B382A', marginBottom: '4px' }}>
                    Item Purchased *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desi Ghee 5kg"
                    value={inventoryItemName}
                    onChange={e => setInventoryItemName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '12px', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B382A', marginBottom: '4px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={quantityAdded || ''}
                    onChange={e => setQuantityAdded(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '12px', background: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Conditional Petty Expense Categories */}
          {type === 'EXPENSE' && (
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B382A', marginBottom: '4px' }}>
                Expense Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '12px', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Tea & Refreshments">Tea & Staff Refreshments</option>
                <option value="Rider Fuel Allowance">Rider Fuel Allowance</option>
                <option value="Ice & Herbs">Daily Ice, Lemon & Mint</option>
                <option value="Cleaning Supplies">Cleaning & Wash Supplies</option>
                <option value="Packaging Supplies">Emergency Takeaway Boxes</option>
                <option value="Miscellaneous">Miscellaneous Petty Cash</option>
              </select>
            </div>
          )}

          {/* Note / Description */}
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B382A', marginBottom: '4px' }}>
            Description / Receipt Ref
          </label>
          <input
            type="text"
            placeholder="e.g. Paid cash from till drawer, bill attached"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #d1d5db', fontSize: '12px', background: '#fff', marginBottom: '16px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0}
              style={{ padding: '8px 18px', borderRadius: '8px', background: '#8B1E1E', color: '#fff', border: 'none', fontSize: '12px', fontWeight: '800', cursor: amount > 0 ? 'pointer' : 'not-allowed' }}
            >
              Confirm & Save to Till
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Variation Picker Modal ──────────────────────────────────────────────────
interface VariationPickerProps {
  item: MenuItem;
  onSelect: (item: MenuItem, variation: string, price: number) => void;
  onClose: () => void;
}
const VariationPicker: React.FC<VariationPickerProps> = ({ item, onSelect, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 9996, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
    <div style={{ background: '#fff', borderRadius: '14px', maxWidth: '340px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
      <div style={{ background: '#1A120B', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#E85D04', fontWeight: '800', fontSize: '13px' }}>{item.name} — Portion</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
      </div>
      <div style={{ padding: '16px' }}>
        {item.variations?.map(v => (
          <button
            key={v.name}
            onClick={() => onSelect(item, v.name, v.price)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              width: '100%', background: '#f9fafb', border: '1.5px solid #e5e7eb',
              borderRadius: '8px', padding: '12px 14px',
              marginBottom: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
            }}
          >
            <span>{v.name}</span>
            <span style={{ color: '#8B1E1E', fontWeight: '700' }}>{fmtMoney(v.price)}</span>
          </button>
        ))}
        <button
          onClick={() => onSelect(item, '', item.price)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            width: '100%', background: '#FBF8F3', border: '1.5px solid #E85D04',
            borderRadius: '8px', padding: '12px 14px',
            cursor: 'pointer', fontWeight: '700', fontSize: '13px', color: '#8B1E1E'
          }}
        >
          <span>Standard</span>
          <span>{fmtMoney(item.price)}</span>
        </button>
      </div>
    </div>
  </div>
);

// ─── Held Orders & Active Table Tabs Panel ──────────────────────────────────
interface HeldPanelProps {
  heldOrders: HeldOrder[];
  tableOrders: Order[];
  tables: Table[];
  onRecallHeld: (order: HeldOrder) => void;
  onRecallTableOrder: (order: Order) => void;
  onDeleteHeld: (id: string) => void;
  onClose: () => void;
}
const HeldPanel: React.FC<HeldPanelProps> = ({ heldOrders, tableOrders, tables, onRecallHeld, onRecallTableOrder, onDeleteHeld, onClose }) => {
  const [tabType, setTabType] = useState<'TABLES' | 'COUNTER'>('TABLES');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9997, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#FDFBF7', borderRadius: '18px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '1.5px solid #EADBCC' }}>
        <div style={{ background: '#1A120B', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E85D04' }}>
          <div>
            <div style={{ color: '#E85D04', fontWeight: '800', fontSize: '14px' }}>
              ⏸️ Parked Tickets & Table Tabs
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
              Recall running table tabs or held tickets for instant 80mm printing & payment
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F5EFE6', borderBottom: '1px solid #EADBCC' }}>
          <button
            onClick={() => setTabType('TABLES')}
            style={{
              padding: '10px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
              background: tabType === 'TABLES' ? '#8B1E1E' : 'transparent',
              color: tabType === 'TABLES' ? '#ffffff' : '#6b7280'
            }}
          >
            🪑 Running Table Tabs ({tableOrders.length})
          </button>
          <button
            onClick={() => setTabType('COUNTER')}
            style={{
              padding: '10px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
              background: tabType === 'COUNTER' ? '#8B1E1E' : 'transparent',
              color: tabType === 'COUNTER' ? '#ffffff' : '#6b7280'
            }}
          >
            ⏸️ Counter Held ({heldOrders.length})
          </button>
        </div>

        <div style={{ padding: '16px', maxHeight: '420px', overflowY: 'auto' }}>
          {tabType === 'TABLES' ? (
            tableOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '13px' }}>
                No active table orders right now
              </div>
            ) : (
              tableOrders.map(tOrder => {
                const tableObj = tables.find(t => t.id === tOrder.tableId);
                const tableLabel = tableObj ? `Table ${tableObj.tableNumber}` : (tOrder.tableId || 'Table');
                const tSubtotal = tOrder.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

                return (
                  <div
                    key={tOrder.id}
                    style={{
                      background: tOrder.isBillRequested ? '#FEFCE8' : '#ffffff',
                      border: `1.5px solid ${tOrder.isBillRequested ? '#F59E0B' : '#EADBCC'}`,
                      borderRadius: '12px', padding: '12px', marginBottom: '10px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '900', fontSize: '14px', color: '#1A120B' }}>
                          {tableLabel}
                        </span>
                        {tOrder.isBillRequested && (
                          <span style={{ background: '#F59E0B', color: '#1A120B', fontSize: '9px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>
                            BILL REQUESTED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8B1E1E', fontWeight: '700', marginTop: '2px' }}>
                        👤 Parked / Taken by: {tOrder.waiterName || tOrder.userName || 'Manager Bilal'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        {tOrder.items.length} items · Subtotal: {fmtMoney(tSubtotal)}
                      </div>
                    </div>

                    <button
                      onClick={() => onRecallTableOrder(tOrder)}
                      style={{
                        background: '#8B1E1E', color: '#ffffff', border: 'none', borderRadius: '8px',
                        padding: '8px 14px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(139,30,30,0.3)'
                      }}
                    >
                      Recall & Print Bill
                    </button>
                  </div>
                );
              })
            )
          ) : (
            heldOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '13px' }}>
                No counter held tickets
              </div>
            ) : (
              heldOrders.map(h => {
                const hSubtotal = h.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
                return (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', marginBottom: '8px', background: '#ffffff' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: '#111827' }}>
                        {h.label || `Ticket #${h.id.slice(-4)}`}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8B1E1E', fontWeight: '700' }}>
                        Parked by: {h.parkedBy || 'Cashier'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {h.items.length} items · {fmtMoney(hSubtotal)} · {fmtTime(h.heldAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onRecallHeld(h)}
                        style={{ background: '#8B1E1E', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Recall
                      </button>
                      <button
                        onClick={() => onDeleteHeld(h.id)}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}
                      >
                        <Trash2 style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main CashierPortal Component ───────────────────────────────────────────
export const CashierPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  // ── Light / Dark Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  // ── Navigation Tabs
  type CashierTab = 'POS_REGISTER' | 'ONLINE_ORDERS' | 'ALL_ORDERS' | 'TILL_EXPENSES';
  const [activeTab, setActiveTab] = useState<CashierTab>('POS_REGISTER');

  // ── Single Location: Gulberg Greens Islamabad
  const selectedBranchId = 'br-isb';
  const allCashiers = dbState.getUsers().filter(u => u.role === 'CASHIER');
  const [activeCashierId, setActiveCashierId] = useState('u-cash1');
  const cashier = allCashiers.find(c => c.id === activeCashierId) || allCashiers[0] || {
    id: 'u-cash1', name: 'Nadia Cashier', phone: '0330 0500600', role: 'CASHIER', branchId: 'br-isb'
  };

  // ── Shift state
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null);
  const [showShiftOpen, setShowShiftOpen] = useState(false);
  const [showZReport, setShowZReport] = useState(false);

  useEffect(() => {
    if (cashier) {
      const s = db.getActiveShift(selectedBranchId, cashier.id);
      setActiveShift(s);
    }
  }, [dbState, cashier, selectedBranchId]);

  // ── Orders list & Online Incoming Orders
  const allOrders = dbState.getOrders(selectedBranchId);
  const unconfirmedOnlineOrders = allOrders.filter(
    o => o.isOnline && !o.isPunched && o.status !== 'CANCELLED'
  );

  // ── Edit online order state
  const [editingOnlineOrder, setEditingOnlineOrder] = useState<Order | null>(null);

  // ── Till actions modal
  const [tillActionType, setTillActionType] = useState<'CASH_IN' | 'CASH_OUT' | 'EXPENSE' | 'INVENTORY_PURCHASE' | null>(null);
  const tillTransactions = dbState.getTillTransactions(selectedBranchId);

  // ── All Orders Filter
  const [allOrdersFilter, setAllOrdersFilter] = useState<'ALL' | 'ONLINE_PENDING' | 'PREPARING' | 'READY' | 'SHIPPED' | 'COMPLETED'>('ALL');

  // ── Menu & Categories for POS
  const menu = dbState.getMenu(selectedBranchId).filter(m => m.isAvailable);
  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenu = useMemo(() => {
    return menu.filter(m => {
      const matchCat = activeCategory === 'All' || m.category === activeCategory;
      const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menu, activeCategory, searchQuery]);

  // ── Cart & Order Details
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICK_UP'>('DINE_IN');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFlat, setDiscountFlat] = useState(0);
  const [variationItem, setVariationItem] = useState<MenuItem | null>(null);

  // ── Tender / Payment (Cash = 16% Tax, Card = 5% Tax)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'SPLIT'>('CARD');
  const [cashTendered, setCashTendered] = useState(0);
  const [splitCash, setSplitCash] = useState(0);
  const [splitCard, setSplitCard] = useState(0);

  // ── Held orders & Receipt
  const [showHeldPanel, setShowHeldPanel] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const heldOrders = dbState.getHeldOrders(selectedBranchId);
  const [receiptData, setReceiptData] = useState<ReceiptProps['order'] | null>(null);

  // ── Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Floor & Table Picker (Islamabad)
  const floors = dbState.getFloors(selectedBranchId);
  const [pickerFloorId, setPickerFloorId] = useState(floors[0]?.id || 'fl-isb-g');
  useEffect(() => { if (floors.length > 0) setPickerFloorId(floors[0].id); }, [floors]);
  const pickerTables = dbState.getTables(selectedBranchId, pickerFloorId);
  const selectedTable = selectedTableId ? dbState.getTables(selectedBranchId).find(t => t.id === selectedTableId) : null;

  // ── Financials: Dynamic FBR Sales Tax (5% Card vs 16% Cash)
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountFromPercent = Math.round((subtotal * discountPercent) / 100);
  const totalDiscount = discountFromPercent + discountFlat;
  const discountedSubtotal = Math.max(0, subtotal - totalDiscount);

  const taxRate = paymentMethod === 'CARD'
    ? 0.05
    : paymentMethod === 'CASH'
      ? 0.16
      : (splitCash + splitCard > 0)
        ? ((splitCash / (splitCash + splitCard)) * 0.16 + (splitCard / (splitCash + splitCard)) * 0.05)
        : 0.05;

  const taxRatePercent = paymentMethod === 'CARD' ? 5 : paymentMethod === 'CASH' ? 16 : Math.round(taxRate * 100);
  const tax = Math.round(discountedSubtotal * taxRate);
  const total = discountedSubtotal + tax;
  const changeDue = paymentMethod === 'CASH' ? Math.max(0, cashTendered - total) : 0;

  // ── Cash presets
  const cashPresets = [total, Math.ceil(total / 500) * 500 || 500, Math.ceil(total / 1000) * 1000 || 1000, 5000];

  // ── Cart mutations
  const addToCart = (item: MenuItem, variation = '', price = item.price) => {
    setCart(prev => {
      const key = `${item.id}-${variation}`;
      const existing = prev.find(ci => `${ci.menuItemId}-${ci.variation}` === key);
      if (existing) {
        return prev.map(ci =>
          `${ci.menuItemId}-${ci.variation}` === key
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price, quantity: 1, variation: variation || undefined }];
    });
  };

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + delta };
      if (next[idx].quantity <= 0) next.splice(idx, 1);
      return next;
    });
  };

  // ── Hold / Park Ticket
  const handleHold = () => {
    if (cart.length === 0) { showToast('Cart is empty', 'error'); return; }
    const label = prompt('Enter a label or note for this parked ticket (e.g. Table 4 / Walk-in):') || `Table ${selectedTable?.tableNumber || 'Counter'}`;
    db.holdPosOrder({
      branchId: selectedBranchId,
      cashierId: cashier.id,
      items: cart,
      orderType,
      tableId: selectedTableId || undefined,
      label,
      discountAmount: totalDiscount,
      discountPercent
    });
    setCart([]);
    setSelectedTableId(null);
    setDiscountPercent(0);
    setDiscountFlat(0);
    showToast('Ticket parked successfully', 'success');
  };

  const allTables = dbState.getTables(selectedBranchId);
  const activeTableOrders = dbState.getOrders(selectedBranchId).filter(o =>
    o.orderType === 'DINE_IN' &&
    o.tableId &&
    o.status !== 'COMPLETED' &&
    o.status !== 'CANCELLED'
  );

  const handleRecall = (held: HeldOrder) => {
    setCart(held.items);
    setOrderType(held.orderType as any);
    if (held.tableId) setSelectedTableId(held.tableId);
    db.deleteHeldOrder(held.id);
    setShowHeldPanel(false);
    showToast('Ticket recalled into cart', 'info');
  };

  const handleRecallTableOrder = (tableOrder: Order) => {
    setCart([...tableOrder.items]);
    setOrderType('DINE_IN');
    if (tableOrder.tableId) setSelectedTableId(tableOrder.tableId);
    setShowHeldPanel(false);
    const tblObj = allTables.find(t => t.id === tableOrder.tableId);
    showToast(`Recalled Table ${tblObj?.tableNumber || tableOrder.tableId} (${tableOrder.items.length} items) for bill settlement`);
  };

  // ── Complete & Print Receipt
  const handleCheckout = () => {
    if (cart.length === 0) { showToast('Cart is empty', 'error'); return; }
    if (paymentMethod === 'CASH' && cashTendered > 0 && cashTendered < total) {
      showToast(`Tendered cash is less than total ${fmtMoney(total)}`, 'error');
      return;
    }
    if (paymentMethod === 'SPLIT' && splitCash + splitCard !== total) {
      showToast(`Split sum must equal total ${fmtMoney(total)}`, 'error');
      return;
    }

    const newOrder = db.createPosOrder({
      branchId: selectedBranchId,
      cashierId: cashier.id,
      cashierName: cashier.name,
      shiftId: activeShift?.id,
      orderType,
      tableId: orderType === 'DINE_IN' ? (selectedTableId || undefined) : undefined,
      paymentMethod,
      splitPayment: paymentMethod === 'SPLIT' ? { cashAmount: splitCash, cardAmount: splitCard } : undefined,
      items: cart,
      subtotal,
      discountAmount: totalDiscount,
      discountPercent,
      tax,
      total
    });

    setReceiptData({
      id: newOrder.id,
      cashierName: cashier.name,
      branchName: 'Haandi by Yumto - Islamabad',
      orderType,
      tableNumber: selectedTable?.tableNumber,
      items: cart,
      subtotal,
      discountAmount: totalDiscount,
      tax,
      taxRatePercent,
      total,
      paymentMethod,
      tenderedAmount: paymentMethod === 'CASH' ? (cashTendered || total) : total,
      splitPayment: paymentMethod === 'SPLIT' ? { cashAmount: splitCash, cardAmount: splitCard } : undefined,
      createdAt: newOrder.createdAt
    });

    // Reset cart
    setCart([]);
    setSelectedTableId(null);
    setDiscountPercent(0);
    setDiscountFlat(0);
    setCashTendered(0);
    setSplitCash(0);
    setSplitCard(0);
    showToast('Order completed & bill generated!', 'success');
  };

  // ── Online Orders Cashier Actions (Call & Confirm)
  const handleConfirmAndPunch = (order: Order) => {
    const success = db.confirmAndPunchOnlineOrder(order.id, cashier.name);
    if (success) {
      showToast(`Order #${order.id.slice(-6).toUpperCase()} verified by call & punched to Kitchen KDS!`, 'success');
      // Auto send WhatsApp confirmation update
      const trackingUrl = `${window.location.origin}/#/track/${order.id}`;
      notificationService.sendOrderWhatsAppNotification({ ...order, status: 'PREPARING' }, trackingUrl).catch(err => {
        console.warn('Auto WhatsApp notification failed:', err);
      });
    }
  };

  const handleCancelOnlineOrder = (orderId: string) => {
    const reason = prompt('Reason for cancelling order:');
    if (reason !== null) {
      db.updateOrderStatus(orderId, 'CANCELLED');
      showToast('Order cancelled', 'info');
    }
  };

  const handleSaveEditedOrder = (items: OrderItem[], discountAmount: number) => {
    if (!editingOnlineOrder) return;
    const ok = db.editOrderItems(editingOnlineOrder.id, items, discountAmount);
    if (ok) {
      showToast('Order updated successfully!');
      setEditingOnlineOrder(null);
    } else {
      showToast('Cannot edit order once punched to kitchen', 'error');
    }
  };

  // ── Till Transaction Handlers
  const handleSaveTillTx = (data: {
    type: 'CASH_IN' | 'CASH_OUT' | 'EXPENSE' | 'INVENTORY_PURCHASE';
    amount: number;
    category: string;
    description: string;
    supplierName?: string;
    inventoryItemName?: string;
    quantityAdded?: number;
  }) => {
    if (!activeShift) {
      showToast('Please open shift before recording till transactions', 'error');
      return;
    }
    db.addTillTransaction({
      shiftId: activeShift.id,
      branchId: selectedBranchId,
      cashierId: cashier.id,
      cashierName: cashier.name,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      supplierName: data.supplierName,
      inventoryItemName: data.inventoryItemName,
      quantityAdded: data.quantityAdded
    });
    setTillActionType(null);
    showToast(`${data.type.replace('_', ' ')} recorded in Till!`, 'success');
  };

  // ── Filtered All Orders
  const filteredAllOrders = useMemo(() => {
    return allOrders.filter(o => {
      if (allOrdersFilter === 'ONLINE_PENDING') return o.isOnline && !o.isPunched && o.status !== 'CANCELLED';
      if (allOrdersFilter === 'PREPARING') return o.status === 'PREPARING';
      if (allOrdersFilter === 'READY') return o.status === 'READY';
      if (allOrdersFilter === 'SHIPPED') return o.status === 'SHIPPED';
      if (allOrdersFilter === 'COMPLETED') return o.status === 'COMPLETED';
      return true;
    });
  }, [allOrders, allOrdersFilter]);

  // Theme palette mapping
  const ui = {
    bg: isDark ? '#140E0A' : '#FBF8F3',
    surface: isDark ? '#1F1711' : '#FFFFFF',
    card: isDark ? '#2A1F17' : '#FFFFFF',
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
    text: isDark ? '#FFFFFF' : '#1A120B',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.6)' : '#6B7280',
    topBarBg: '#1A120B',
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: ui.bg, color: ui.text, overflow: 'hidden' }}>
      
      {/* ─── Modals ─────────────────────────────────────────────────────────── */}
      {showShiftOpen && (
        <ShiftOpenModal
          cashierName={cashier.name}
          onOpen={(float) => {
            db.openShift(cashier.id, cashier.name, selectedBranchId, float);
            setShowShiftOpen(false);
            showToast('Shift opened successfully', 'success');
          }}
          onClose={() => setShowShiftOpen(false)}
        />
      )}
      {showZReport && activeShift && (
        <ZReportModal
          shift={activeShift}
          onClose={(counted) => {
            db.closeShift(activeShift.id, counted);
            setActiveShift(null);
            setShowZReport(false);
            showToast('Shift closed — Z-Report generated', 'success');
          }}
          onDismiss={() => setShowZReport(false)}
        />
      )}
      {showHeldPanel && (
        <HeldPanel
          heldOrders={heldOrders}
          tableOrders={activeTableOrders}
          tables={allTables}
          onRecallHeld={handleRecall}
          onRecallTableOrder={handleRecallTableOrder}
          onDeleteHeld={(id) => { db.deleteHeldOrder(id); showToast('Ticket deleted', 'info'); }}
          onClose={() => setShowHeldPanel(false)}
        />
      )}
      {variationItem && (
        <VariationPicker
          item={variationItem}
          onSelect={(item, variation, price) => { addToCart(item, variation, price); setVariationItem(null); }}
          onClose={() => setVariationItem(null)}
        />
      )}
      {receiptData && (
        <ReceiptModal order={receiptData} onClose={() => setReceiptData(null)} />
      )}
      <WhatsAppBotModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
      {editingOnlineOrder && (
        <EditOnlineOrderModal
          order={editingOnlineOrder}
          menu={menu}
          onSave={handleSaveEditedOrder}
          onClose={() => setEditingOnlineOrder(null)}
        />
      )}
      {tillActionType && activeShift && (
        <TillActionModal
          type={tillActionType}
          shift={activeShift}
          cashierName={cashier.name}
          onSave={handleSaveTillTx}
          onClose={() => setTillActionType(null)}
        />
      )}

      {/* Table picker modal */}
      {showTablePicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9995, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#1A120B', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#E85D04', fontWeight: '800', fontSize: '13px' }}>🪑 Select Table (Islamabad)</span>
              <button onClick={() => setShowTablePicker(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {floors.map(fl => (
                  <button
                    key={fl.id}
                    onClick={() => setPickerFloorId(fl.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      border: 'none', cursor: 'pointer',
                      background: pickerFloorId === fl.id ? '#8B1E1E' : '#f3f4f6',
                      color: pickerFloorId === fl.id ? '#ffffff' : '#6b7280'
                    }}
                  >
                    {fl.name}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {pickerTables.map(t => {
                  const isAvail = t.status === 'AVAILABLE';
                  const isSelected = t.id === selectedTableId;
                  return (
                    <button
                      key={t.id}
                      disabled={!isAvail && !isSelected}
                      onClick={() => { setSelectedTableId(t.id); setShowTablePicker(false); }}
                      style={{
                        padding: '10px 6px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                        border: `2px solid ${isSelected ? '#8B1E1E' : isAvail ? '#e5e7eb' : '#fee2e2'}`,
                        background: isSelected ? '#fee2e2' : isAvail ? '#f9fafb' : '#fef2f2',
                        color: isSelected ? '#8B1E1E' : isAvail ? '#111827' : '#9ca3af',
                        cursor: isAvail || isSelected ? 'pointer' : 'not-allowed',
                        textAlign: 'center'
                      }}
                    >
                      <div>{t.tableNumber}</div>
                      <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>
                        {t.capacity} seats · {t.status}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 9999,
          background: toast.type === 'error' ? '#dc2626' : toast.type === 'info' ? '#2563eb' : '#16a34a',
          color: '#fff', padding: '8px 16px', borderRadius: '8px',
          fontWeight: '700', fontSize: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* ─── Top Bar with Dark/Light Theme Switcher & Shift Controls ───────────────────────────── */}
      <div style={{
        background: ui.topBarBg, borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        flexShrink: 0
      }}>
        {/* Title & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px' }}>
          <img src="/logo.png" alt="Haandi" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: '800', fontSize: '13px', lineHeight: 1 }}>
              HAANDI <span style={{ color: '#E85D04' }}>POS TERMINAL</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px' }}>
              Gulberg Greens, Islamabad
            </div>
          </div>
        </div>

        {/* Cashier profile selector */}
        <select
          value={activeCashierId}
          onChange={e => setActiveCashierId(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', padding: '5px 8px', fontSize: '11px', outline: 'none' }}
        >
          {allCashiers.map(c => <option key={c.id} value={c.id} style={{ background: '#1A120B' }}>{c.name}</option>)}
        </select>

        {/* Location Badge */}
        <div style={{
          background: 'rgba(232,93,4,0.15)', border: '1px solid rgba(232,93,4,0.3)',
          borderRadius: '6px', padding: '5px 8px', fontSize: '11px', fontWeight: '700', color: '#E85D04'
        }}>
          📍 Gulberg Greens
        </div>

        {/* Shift Badge */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: activeShift ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
            border: `1px solid ${activeShift ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
            borderRadius: '8px', padding: '5px 10px', fontSize: '11px', fontWeight: '700',
            color: activeShift ? '#4ade80' : '#f87171', cursor: 'pointer', whiteSpace: 'nowrap'
          }}
          onClick={() => activeShift ? setShowZReport(true) : setShowShiftOpen(true)}
        >
          <Clock style={{ width: '12px', height: '12px' }} />
          {activeShift ? `Float: ${fmtMoney(activeShift.openingFloat)}` : 'Open Shift'}
        </div>

        {/* Parked Tickets */}
        <button
          onClick={() => setShowHeldPanel(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: heldOrders.length > 0 ? 'rgba(232,93,4,0.2)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${heldOrders.length > 0 ? '#E85D04' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px', padding: '5px 10px',
            color: heldOrders.length > 0 ? '#E85D04' : '#9ca3af',
            fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          <PauseCircle style={{ width: '12px', height: '12px' }} />
          Parked ({heldOrders.length})
        </button>

        {/* Z-Report */}
        {activeShift && (
          <button
            onClick={() => setShowZReport(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: '8px', padding: '5px 10px',
              color: '#f87171', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            <BarChart3 style={{ width: '12px', height: '12px' }} />
            Z-Report
          </button>
        )}

        {/* WHATSAPP BOT STATUS & QR TRIGGER */}
        <button
          onClick={() => setShowWhatsAppModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(37,211,102,0.18)',
            border: '1.5px solid #25D366',
            borderRadius: '8px', padding: '5px 10px',
            color: '#4ADE80',
            fontWeight: '800', fontSize: '11px', cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
          title="WhatsApp Order Automation Bot (Baileys)"
        >
          <MessageSquare style={{ width: '13px', height: '13px', color: '#25D366' }} />
          <span>WhatsApp Bot</span>
        </button>

        {/* THEME TOGGLE BUTTON (Light / Dark) */}
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: isDark ? 'rgba(232,93,4,0.25)' : 'rgba(255,255,255,0.15)',
            border: `1.5px solid ${isDark ? '#E85D04' : '#FFFFFF'}`,
            borderRadius: '8px', padding: '5px 10px',
            color: isDark ? '#E85D04' : '#FFFFFF',
            fontWeight: '800', fontSize: '11px', cursor: 'pointer',
            transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}
          title="Toggle Light/Dark POS Theme"
        >
          {isDark ? <Sun style={{ width: '13px', height: '13px' }} /> : <Moon style={{ width: '13px', height: '13px' }} />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* ─── CASHIER MODULE TABS NAVIGATION ─────────────────────────────────── */}
      <div style={{
        background: isDark ? '#1F1711' : '#EFEBE4',
        borderBottom: `1px solid ${ui.border}`,
        padding: '0 16px', display: 'flex', gap: '4px', flexShrink: 0
      }}>
        <button
          onClick={() => setActiveTab('POS_REGISTER')}
          style={{
            padding: '10px 16px', border: 'none', background: 'transparent',
            borderBottom: activeTab === 'POS_REGISTER' ? '3px solid #E85D04' : '3px solid transparent',
            color: activeTab === 'POS_REGISTER' ? (isDark ? '#fff' : '#1A120B') : ui.textMuted,
            fontWeight: activeTab === 'POS_REGISTER' ? '900' : '700', fontSize: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <ShoppingCart style={{ width: '14px', height: '14px' }} />
          POS Register
        </button>

        <button
          onClick={() => setActiveTab('ONLINE_ORDERS')}
          style={{
            padding: '10px 16px', border: 'none', background: 'transparent',
            borderBottom: activeTab === 'ONLINE_ORDERS' ? '3px solid #DC2626' : '3px solid transparent',
            color: activeTab === 'ONLINE_ORDERS' ? (isDark ? '#fff' : '#1A120B') : ui.textMuted,
            fontWeight: activeTab === 'ONLINE_ORDERS' ? '900' : '700', fontSize: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <PhoneCall style={{ width: '14px', height: '14px', color: '#DC2626' }} />
          <span>Incoming Online Orders (Call & Confirm)</span>
          {unconfirmedOnlineOrders.length > 0 && (
            <span style={{
              background: '#DC2626', color: '#ffffff', fontSize: '10px', fontWeight: '900',
              padding: '2px 7px', borderRadius: '99px', animation: 'pulse 1.5s infinite'
            }}>
              {unconfirmedOnlineOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ALL_ORDERS')}
          style={{
            padding: '10px 16px', border: 'none', background: 'transparent',
            borderBottom: activeTab === 'ALL_ORDERS' ? '3px solid #3B82F6' : '3px solid transparent',
            color: activeTab === 'ALL_ORDERS' ? (isDark ? '#fff' : '#1A120B') : ui.textMuted,
            fontWeight: activeTab === 'ALL_ORDERS' ? '900' : '700', fontSize: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <ReceiptText style={{ width: '14px', height: '14px' }} />
          All Branch Orders
        </button>

        <button
          onClick={() => setActiveTab('TILL_EXPENSES')}
          style={{
            padding: '10px 16px', border: 'none', background: 'transparent',
            borderBottom: activeTab === 'TILL_EXPENSES' ? '3px solid #16A34A' : '3px solid transparent',
            color: activeTab === 'TILL_EXPENSES' ? (isDark ? '#fff' : '#1A120B') : ui.textMuted,
            fontWeight: activeTab === 'TILL_EXPENSES' ? '900' : '700', fontSize: '12px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <DollarSign style={{ width: '14px', height: '14px', color: '#16A34A' }} />
          Till & Cash Drawer / Expenses
        </button>
      </div>

      {/* ─── VIEW 1: POS REGISTER (Item catalog + Cart) ────────────────────── */}
      {activeTab === 'POS_REGISTER' && (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, overflow: 'hidden' }}>
          
          {/* LEFT: Item Catalog */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${ui.border}`, background: ui.bg }}>
            
            {/* Search & Categories */}
            <div style={{ background: ui.surface, padding: '10px 14px', borderBottom: `1px solid ${ui.border}`, flexShrink: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: isDark ? '#2A1F17' : '#F3F4F6',
                border: `1px solid ${ui.border}`,
                borderRadius: '8px', padding: '8px 12px', marginBottom: '8px'
              }}>
                <Search style={{ width: '15px', height: '15px', color: ui.textMuted, flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search Handi, Karahi, BBQ, Breads..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: ui.text, fontSize: '13px', width: '100%'
                  }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: ui.textMuted, cursor: 'pointer' }}>
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '5px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                      background: activeCategory === cat ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                      color: activeCategory === cat ? '#ffffff' : ui.textMuted
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px', alignContent: 'start' }}>
              {filteredMenu.map(dish => (
                <button
                  key={dish.id}
                  onClick={() => {
                    if (dish.variations && dish.variations.length > 0) {
                      setVariationItem(dish);
                    } else {
                      addToCart(dish);
                    }
                  }}
                  style={{
                    background: ui.surface, border: `1.5px solid ${ui.border}`,
                    borderRadius: '12px', padding: '10px', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    minHeight: '85px', transition: 'all 0.15s'
                  }}
                >
                  <div>
                    <div style={{ color: ui.text, fontWeight: '800', fontSize: '12px', lineHeight: 1.2 }}>
                      {dish.name}
                    </div>
                    <div style={{ color: ui.textMuted, fontSize: '10px', marginTop: '3px' }}>
                      {dish.category}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ color: '#E85D04', fontWeight: '900', fontSize: '12px' }}>
                      {dish.variations && dish.variations.length > 0 ? `From ${fmtMoney(dish.variations[0].price)}` : fmtMoney(dish.price)}
                    </span>
                    <span style={{ background: 'rgba(232,93,4,0.15)', color: '#E85D04', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900' }}>
                      +
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: POS Cart & Bill Calculation */}
          <div style={{ display: 'flex', flexDirection: 'column', background: ui.surface, overflow: 'hidden' }}>
            
            {/* Dining Type & Table Selector */}
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${ui.border}`, background: isDark ? '#1A120B' : '#F5EFE6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                <button
                  onClick={() => setOrderType('DINE_IN')}
                  style={{
                    padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: orderType === 'DINE_IN' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                    color: orderType === 'DINE_IN' ? '#ffffff' : ui.textMuted,
                    fontWeight: '800', fontSize: '11px', textAlign: 'center'
                  }}
                >
                  🪑 Dine-In
                </button>
                <button
                  onClick={() => { setOrderType('PICK_UP'); setSelectedTableId(null); }}
                  style={{
                    padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: orderType === 'PICK_UP' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                    color: orderType === 'PICK_UP' ? '#ffffff' : ui.textMuted,
                    fontWeight: '800', fontSize: '11px', textAlign: 'center'
                  }}
                >
                  🥡 Takeaway / Counter
                </button>
              </div>

              {orderType === 'DINE_IN' && (
                <button
                  onClick={() => setShowTablePicker(true)}
                  style={{
                    width: '100%', padding: '7px 10px', borderRadius: '8px',
                    border: '1.5px solid #E85D04', background: 'rgba(232,93,4,0.1)',
                    color: '#E85D04', fontWeight: '800', fontSize: '11px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span>{selectedTable ? `Table ${selectedTable.tableNumber} (${selectedTable.capacity} seats)` : 'Select Table'}</span>
                  <ChevronDown style={{ width: '13px', height: '13px' }} />
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: ui.textMuted }}>
                  <ShoppingCart style={{ width: '32px', height: '32px', margin: '0 auto 8px', opacity: 0.3 }} />
                  <div style={{ fontWeight: '700', fontSize: '12px' }}>Cart is empty</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>Click dishes to punch counter order</div>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#2A1F17' : '#F9FAFB', border: `1px solid ${ui.border}`, borderRadius: '8px', padding: '8px 10px' }}>
                    <div style={{ flex: 1, paddingRight: '6px' }}>
                      <div style={{ fontWeight: '800', fontSize: '11px', color: ui.text }}>{item.name}</div>
                      {item.variation && <div style={{ fontSize: '10px', color: '#E85D04', fontWeight: '700' }}>[{item.variation}]</div>}
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#E85D04' }}>{fmtMoney(item.price * item.quantity)}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button onClick={() => updateQty(idx, -1)} style={{ width: '22px', height: '22px', borderRadius: '4px', border: `1px solid ${ui.border}`, background: isDark ? '#1F1711' : '#fff', color: ui.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus style={{ width: '10px', height: '10px' }} />
                      </button>
                      <span style={{ fontWeight: '800', fontSize: '11px', width: '16px', textAlign: 'center', color: ui.text }}>{item.quantity}</span>
                      <button onClick={() => updateQty(idx, 1)} style={{ width: '22px', height: '22px', borderRadius: '4px', border: `1px solid ${ui.border}`, background: isDark ? '#1F1711' : '#fff', color: ui.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus style={{ width: '10px', height: '10px' }} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Tender Controls */}
            <div style={{ background: isDark ? '#1A120B' : '#F5EFE6', borderTop: `1px solid ${ui.border}`, padding: '10px 14px' }}>
              
              {/* Financial breakdown */}
              <div style={{ fontSize: '11px', color: ui.textMuted, display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span style={{ color: ui.text, fontWeight: '700' }}>{fmtMoney(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '700' }}>
                    <span>Discount:</span>
                    <span>-{fmtMoney(totalDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>FBR Sales Tax ({taxRatePercent}%):</span>
                  <span style={{ color: ui.text, fontWeight: '700' }}>{fmtMoney(tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: '#E85D04', borderTop: `1px dashed ${ui.border}`, paddingTop: '4px', marginTop: '2px' }}>
                  <span>Total Payable:</span>
                  <span>{fmtMoney(total)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '8px' }}>
                <button
                  onClick={() => setPaymentMethod('CARD')}
                  style={{
                    padding: '7px 4px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    background: paymentMethod === 'CARD' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                    color: paymentMethod === 'CARD' ? '#ffffff' : ui.textMuted,
                    fontWeight: '700', fontSize: '10px', textAlign: 'center'
                  }}
                >
                  💳 Card (5% Tax)
                </button>
                <button
                  onClick={() => setPaymentMethod('CASH')}
                  style={{
                    padding: '7px 4px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    background: paymentMethod === 'CASH' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                    color: paymentMethod === 'CASH' ? '#ffffff' : ui.textMuted,
                    fontWeight: '700', fontSize: '10px', textAlign: 'center'
                  }}
                >
                  💵 Cash (16% Tax)
                </button>
                <button
                  onClick={() => setPaymentMethod('SPLIT')}
                  style={{
                    padding: '7px 4px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                    background: paymentMethod === 'SPLIT' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                    color: paymentMethod === 'SPLIT' ? '#ffffff' : ui.textMuted,
                    fontWeight: '700', fontSize: '10px', textAlign: 'center'
                  }}
                >
                  🔀 Split Tender
                </button>
              </div>

              {/* Cash Presets & Tendered Input */}
              {paymentMethod === 'CASH' && cart.length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '6px' }}>
                    {cashPresets.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setCashTendered(p)}
                        style={{
                          padding: '6px 2px', borderRadius: '6px',
                          background: cashTendered === p ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                          border: 'none', color: cashTendered === p ? '#fff' : ui.textMuted,
                          fontWeight: '700', fontSize: '10px', cursor: 'pointer', textAlign: 'center'
                        }}
                      >
                        {p === total ? 'Exact' : fmtMoney(p)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    value={cashTendered || ''}
                    placeholder={`Cash Received (min ${fmtMoney(total)})`}
                    onChange={e => setCashTendered(Number(e.target.value))}
                    style={{
                      width: '100%', background: isDark ? '#2A1F17' : '#F9FAFB',
                      border: `1px solid ${ui.border}`, borderRadius: '6px',
                      color: ui.text, padding: '7px 10px', fontSize: '12px', outline: 'none',
                      boxSizing: 'border-box', marginBottom: '4px'
                    }}
                  />
                  {cashTendered >= total && (
                    <div style={{ color: '#16a34a', fontWeight: '800', fontSize: '11px', textAlign: 'center', marginBottom: '4px' }}>
                      Change Due: {fmtMoney(changeDue)}
                    </div>
                  )}
                </>
              )}

              {/* Action buttons (Hold / Cancel) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                <button
                  onClick={handleHold}
                  style={{
                    padding: '8px', borderRadius: '8px', border: '1.5px solid rgba(232,93,4,0.3)',
                    background: 'rgba(232,93,4,0.1)', color: '#E85D04',
                    fontWeight: '700', fontSize: '11px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <PauseCircle style={{ width: '13px', height: '13px' }} /> Park Ticket
                </button>
                <button
                  onClick={() => { setCart([]); setSelectedTableId(null); setDiscountPercent(0); setDiscountFlat(0); }}
                  style={{
                    padding: '8px', borderRadius: '8px', border: '1.5px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    fontWeight: '700', fontSize: '11px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <Trash2 style={{ width: '13px', height: '13px' }} /> Clear
                </button>
              </div>

              {/* Complete & Print Thermal Bill */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                style={{
                  width: '100%',
                  background: cart.length === 0 ? '#9ca3af' : 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#ffffff',
                  border: 'none', borderRadius: '10px', padding: '12px',
                  fontWeight: '800', fontSize: '13px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: cart.length > 0 ? '0 4px 14px rgba(139,30,30,0.3)' : 'none'
                }}
              >
                <ReceiptText style={{ width: '16px', height: '16px' }} />
                Complete & Print Thermal Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW 2: INCOMING ONLINE ORDERS (CALL & CONFIRM) ────────────────── */}
      {activeTab === 'ONLINE_ORDERS' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: ui.bg }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            
            {/* Header Alert Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
              border: '1.5px solid #E85D04', borderRadius: '16px', padding: '18px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: '20px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(220,38,38,0.2)', border: '1.5px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall style={{ width: '22px', height: '22px', color: '#DC2626' }} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>
                    Incoming Online Customer Queue
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                    Call each customer to verify items & address. Once verified, click <strong>"Confirm & Punch to Kitchen"</strong>.
                  </div>
                </div>
              </div>

              <div style={{ background: '#DC2626', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: '900', fontSize: '14px' }}>
                {unconfirmedOnlineOrders.length} Pending Verification
              </div>
            </div>

            {/* Orders Cards Grid */}
            {unconfirmedOnlineOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: ui.surface, borderRadius: '16px', border: `1px solid ${ui.border}` }}>
                <CheckCircle2 style={{ width: '48px', height: '48px', color: '#16a34a', margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: '800', color: ui.text }}>All Online Orders Verified!</div>
                <div style={{ fontSize: '12px', color: ui.textMuted, marginTop: '4px' }}>
                  New online orders from website or mobile app will appear here instantly.
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '16px' }}>
                {unconfirmedOnlineOrders.map(ord => {
                  const cleanPhone = (ord.userPhone || '').replace(/[^0-9]/g, '');
                  const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + (cleanPhone || '3300500600');
                  const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(`🍲 *Haandi by Yumto — Calling to Confirm Order #${ord.id.slice(-6).toUpperCase()}*\n\nHello ${ord.userName}, we are confirming your order totaling Rs. ${ord.total.toLocaleString()}.`)}`;

                  return (
                    <div
                      key={ord.id}
                      style={{
                        background: ui.surface, border: '2px solid #DC2626',
                        borderRadius: '16px', padding: '18px', boxShadow: '0 8px 25px rgba(220,38,38,0.12)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: `1px solid ${ui.border}`, paddingBottom: '10px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: '900', fontSize: '16px', color: '#8B1E1E' }}>
                                #{ord.id.slice(-6).toUpperCase()}
                              </span>
                              <span style={{ background: ord.orderType === 'DELIVERY' ? 'rgba(232,93,4,0.15)' : 'rgba(37,99,235,0.15)', color: ord.orderType === 'DELIVERY' ? '#E85D04' : '#3B82F6', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px' }}>
                                {ord.orderType}
                              </span>
                            </div>
                            <div style={{ fontSize: '11px', color: ui.textMuted, marginTop: '2px' }}>
                              Placed: {fmtTime(ord.createdAt)} · {fmtDate(ord.createdAt)}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px' }}>
                              ⚠️ Unpunched (Awaiting Call)
                            </span>
                          </div>
                        </div>

                        {/* Customer & Address Details */}
                        <div style={{ background: isDark ? '#2A1F17' : '#F9FAFB', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span style={{ color: ui.textMuted }}>Customer:</span>
                            <strong style={{ color: ui.text }}>{ord.userName}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                            <span style={{ color: ui.textMuted }}>Phone:</span>
                            <a href={`tel:${ord.userPhone}`} style={{ color: '#8B1E1E', fontWeight: '800', textDecoration: 'none' }}>
                              📞 {ord.userPhone}
                            </a>
                          </div>
                          {ord.deliveryAddress && (
                            <div style={{ fontSize: '11px', color: ui.textMuted, marginTop: '4px', borderTop: `1px dashed ${ui.border}`, paddingTop: '4px' }}>
                              📍 <strong>Delivery Address:</strong> {ord.deliveryAddress}
                            </div>
                          )}
                        </div>

                        {/* Items Ordered */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: ui.textMuted, marginBottom: '6px', textTransform: 'uppercase' }}>
                            Order Items ({ord.items.length}):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {ord.items.map((item, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0' }}>
                                <span style={{ color: ui.text, fontWeight: '600' }}>
                                  <strong style={{ color: '#8B1E1E' }}>{item.quantity}x</strong> {item.name} {item.variation ? `[${item.variation}]` : ''}
                                </span>
                                <span style={{ fontWeight: '800', color: ui.text }}>
                                  {fmtMoney(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Financials */}
                        <div style={{ borderTop: `1px dashed ${ui.border}`, paddingTop: '8px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '11px', color: ui.textMuted }}>
                            Method: <strong>{ord.paymentMethod}</strong> · Tax: {fmtMoney(ord.tax)}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#8B1E1E' }}>
                            {fmtMoney(ord.total)}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <a
                          href={`tel:${ord.userPhone}`}
                          style={{
                            background: '#16a34a', color: '#fff', textDecoration: 'none',
                            padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Phone style={{ width: '14px', height: '14px' }} /> Call Customer
                        </a>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#25D366', color: '#fff', textDecoration: 'none',
                            padding: '10px', borderRadius: '8px', fontWeight: '800', fontSize: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <MessageSquare style={{ width: '14px', height: '14px' }} /> WhatsApp
                        </a>

                        <button
                          onClick={() => setEditingOnlineOrder(ord)}
                          style={{
                            background: isDark ? '#2A1F17' : '#F3F4F6', color: ui.text,
                            border: `1px solid ${ui.border}`, padding: '10px', borderRadius: '8px',
                            fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Edit3 style={{ width: '14px', height: '14px' }} /> Edit Items
                        </button>

                        <button
                          onClick={() => handleConfirmAndPunch(ord)}
                          style={{
                            background: 'linear-gradient(135deg, #8B1E1E 0%, #DC2626 100%)',
                            color: '#fff', border: 'none', padding: '10px', borderRadius: '8px',
                            fontWeight: '900', fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            boxShadow: '0 4px 12px rgba(220,38,38,0.3)'
                          }}
                        >
                          <ChefHat style={{ width: '15px', height: '15px' }} /> Punch to Kitchen
                        </button>
                      </div>

                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleCancelOnlineOrder(ord.id)}
                          style={{
                            background: 'transparent', border: 'none', color: '#ef4444',
                            fontSize: '11px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline'
                          }}
                        >
                          ✕ Reject / Cancel Order
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── VIEW 3: ALL BRANCH ORDERS MONITOR ─────────────────────────────── */}
      {activeTab === 'ALL_ORDERS' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: ui.bg }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
              {[
                { key: 'ALL', label: `All Orders (${allOrders.length})` },
                { key: 'ONLINE_PENDING', label: `Online Unverified (${unconfirmedOnlineOrders.length})` },
                { key: 'PREPARING', label: `In Kitchen (${allOrders.filter(o => o.status === 'PREPARING').length})` },
                { key: 'READY', label: `Ready (${allOrders.filter(o => o.status === 'READY').length})` },
                { key: 'SHIPPED', label: `Out with Rider (${allOrders.filter(o => o.status === 'SHIPPED').length})` },
                { key: 'COMPLETED', label: `Completed (${allOrders.filter(o => o.status === 'COMPLETED').length})` }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setAllOrdersFilter(f.key as any)}
                  style={{
                    padding: '8px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '800',
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: allOrdersFilter === f.key ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                    color: allOrdersFilter === f.key ? '#ffffff' : ui.textMuted
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div style={{ background: ui.surface, borderRadius: '16px', border: `1px solid ${ui.border}`, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 140px 100px 140px', padding: '12px 16px', background: isDark ? '#1A120B' : '#F5EFE6', fontWeight: '800', fontSize: '11px', color: ui.textMuted, textTransform: 'uppercase' }}>
                <span>Order #</span>
                <span>Type / Channel</span>
                <span>Customer / Destination</span>
                <span>Items</span>
                <span>Total</span>
                <span style={{ textAlign: 'right' }}>Status / Action</span>
              </div>

              <div>
                {filteredAllOrders.map(ord => (
                  <div key={ord.id} style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 140px 100px 140px', padding: '12px 16px', alignItems: 'center', fontSize: '12px', borderBottom: `1px solid ${ui.border}` }}>
                    <span style={{ fontWeight: '900', color: '#8B1E1E' }}>
                      #{ord.id.slice(-6).toUpperCase()}
                    </span>
                    <div>
                      <span style={{ fontWeight: '700', color: ui.text }}>{ord.orderType}</span>
                      <div style={{ fontSize: '10px', color: ui.textMuted }}>{ord.isOnline ? '🌐 Web/App' : '🏦 POS Counter'}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: ui.text }}>{ord.userName}</div>
                      <div style={{ fontSize: '10px', color: ui.textMuted }}>{ord.userPhone || (ord.tableId ? `Table ${ord.tableId}` : '')}</div>
                    </div>
                    <div>
                      <div style={{ color: ui.text, fontWeight: '600' }}>{ord.items.length} items</div>
                      <div style={{ fontSize: '10px', color: ui.textMuted }}>{ord.items.map(i => i.name).slice(0, 2).join(', ')}</div>
                    </div>
                    <span style={{ fontWeight: '900', color: '#8B1E1E' }}>
                      {fmtMoney(ord.total)}
                    </span>
                    <div style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => setReceiptData({
                          id: ord.id,
                          cashierName: ord.confirmedByCashier || cashier.name,
                          branchName: 'Haandi by Yumto - Islamabad',
                          orderType: ord.orderType,
                          tableNumber: ord.tableId,
                          items: ord.items,
                          subtotal: ord.subtotal,
                          discountAmount: ord.discountAmount || 0,
                          tax: ord.tax || 0,
                          taxRatePercent: ord.paymentMethod === 'CARD' ? 5 : 16,
                          total: ord.total,
                          paymentMethod: ord.paymentMethod,
                          createdAt: ord.createdAt
                        })}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${ui.border}`, background: 'transparent', color: ui.text, cursor: 'pointer', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Printer style={{ width: '12px', height: '12px' }} /> Bill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── VIEW 4: TILL & CASH DRAWER / EXPENSES / INVENTORY PURCHASES ───── */}
      {activeTab === 'TILL_EXPENSES' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: ui.bg }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            
            {/* Drawer Cash Summary Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: ui.surface, padding: '16px', borderRadius: '14px', border: `1.5px solid ${ui.border}` }}>
                <div style={{ fontSize: '11px', color: ui.textMuted, fontWeight: '700' }}>OPENING FLOAT</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: ui.text, marginTop: '4px' }}>
                  {activeShift ? fmtMoney(activeShift.openingFloat) : 'No Shift Open'}
                </div>
              </div>

              <div style={{ background: ui.surface, padding: '16px', borderRadius: '14px', border: `1.5px solid ${ui.border}` }}>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>CASH SALES (16% TAX)</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>
                  {activeShift ? fmtMoney(activeShift.cashSales) : 'Rs. 0'}
                </div>
              </div>

              <div style={{ background: ui.surface, padding: '16px', borderRadius: '14px', border: `1.5px solid ${ui.border}` }}>
                <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>CASH OUT / EXPENSES & INVENTORY</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>
                  {activeShift ? fmtMoney(activeShift.cashOut) : 'Rs. 0'}
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)', padding: '16px', borderRadius: '14px', border: '1.5px solid #E85D04', color: '#fff' }}>
                <div style={{ fontSize: '11px', color: '#E85D04', fontWeight: '800' }}>NET EXPECTED CASH IN DRAWER</div>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                  {activeShift ? fmtMoney(activeShift.openingFloat + activeShift.cashSales + activeShift.cashIn - activeShift.cashOut) : 'Rs. 0'}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ background: ui.surface, padding: '16px', borderRadius: '14px', border: `1.5px solid ${ui.border}`, marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setTillActionType('INVENTORY_PURCHASE')}
                style={{
                  background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px',
                  fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Package style={{ width: '15px', height: '15px' }} />
                📦 Purchase Inventory from Cash Drawer
              </button>

              <button
                onClick={() => setTillActionType('EXPENSE')}
                style={{
                  background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px',
                  fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <DollarSign style={{ width: '15px', height: '15px' }} />
                💸 Record Daily Petty Expense
              </button>

              <button
                onClick={() => setTillActionType('CASH_IN')}
                style={{
                  background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px',
                  fontWeight: '800', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Plus style={{ width: '15px', height: '15px' }} />
                ➕ Add Cash (Float Top-up)
              </button>

              <button
                onClick={() => setTillActionType('CASH_OUT')}
                style={{
                  background: isDark ? '#2A1F17' : '#E5E7EB', color: ui.text, border: `1px solid ${ui.border}`, borderRadius: '10px', padding: '10px 18px',
                  fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Minus style={{ width: '15px', height: '15px' }} />
                ➖ Cash Withdrawal / Safe Drop
              </button>
            </div>

            {/* Till Transactions Ledger */}
            <div style={{ background: ui.surface, borderRadius: '16px', border: `1.5px solid ${ui.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', background: isDark ? '#1A120B' : '#F5EFE6', borderBottom: `1px solid ${ui.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '800', fontSize: '13px', color: ui.text }}>
                  Till Ledger & Petty Cash Record
                </div>
                <div style={{ fontSize: '11px', color: ui.textMuted }}>
                  {tillTransactions.length} recorded transactions
                </div>
              </div>

              {tillTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: ui.textMuted, fontSize: '12px' }}>
                  No till transactions recorded yet for this branch
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${ui.border}`, color: ui.textMuted, textAlign: 'left', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 14px' }}>Time</th>
                        <th style={{ padding: '10px 14px' }}>Cashier</th>
                        <th style={{ padding: '10px 14px' }}>Type</th>
                        <th style={{ padding: '10px 14px' }}>Category</th>
                        <th style={{ padding: '10px 14px' }}>Description / Vendor</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tillTransactions.map(tx => (
                        <tr key={tx.id} style={{ borderBottom: `1px solid ${ui.border}` }}>
                          <td style={{ padding: '10px 14px', color: ui.textMuted }}>{fmtTime(tx.timestamp)}</td>
                          <td style={{ padding: '10px 14px', fontWeight: '700', color: ui.text }}>{tx.cashierName}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              background: tx.type === 'INVENTORY_PURCHASE' ? 'rgba(232,93,4,0.15)' : tx.type === 'CASH_IN' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                              color: tx.type === 'INVENTORY_PURCHASE' ? '#E85D04' : tx.type === 'CASH_IN' ? '#16a34a' : '#dc2626',
                              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800'
                            }}>
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', color: ui.text }}>{tx.category}</td>
                          <td style={{ padding: '10px 14px', color: ui.text }}>
                            {tx.description}
                            {tx.supplierName && <div style={{ fontSize: '10px', color: '#8B1E1E', fontWeight: '700' }}>Vendor: {tx.supplierName}</div>}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '900', color: tx.type === 'CASH_IN' ? '#16a34a' : '#dc2626' }}>
                            {tx.type === 'CASH_IN' ? '+' : '-'}{fmtMoney(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

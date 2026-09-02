import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../store/mockDb';
import type { OrderItem, MenuItem, CashierShift, HeldOrder } from '../types';
import {
  ShoppingCart, Search, Minus, Plus, Trash2,
  Clock, ReceiptText, ChevronDown,
  PauseCircle, X,
  BarChart3, LogIn, LogOut,
  Tag, Sun, Moon, Printer
} from 'lucide-react';

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

        {/* Printable Receipt Container (Exact layout from user screenshot) */}
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
            /* ==========================================================
               CUSTOMER PROVISIONAL BILL (MATCHING PHOTO ATTACHED)
               ========================================================== */
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
                  <span>Table No. : ( {order.tableNumber || 'Takeaway'} )</span>
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
                <div style={{ fontWeight: '800' }}>POS Software By:</div>
                <div>Softlinks International +92 (0) 3300500600,</div>
                <div>softlinkslhr@gmail.com / support@haandi.yumto.com</div>
              </div>
            </div>
          ) : (
            /* ==========================================================
               KITCHEN ORDER TICKET (KOT)
               ========================================================== */
            <div style={{ border: '2px dashed #000', padding: '16px', borderRadius: '2px' }}>
              <div style={{ textAlign: 'center', fontWeight: '900', fontSize: '16px', letterSpacing: '0.08em', marginBottom: '8px' }}>
                🍳 KITCHEN ORDER TICKET (KOT)
              </div>
              <div style={{ textAlign: 'center', fontSize: '11px', marginBottom: '10px' }}>
                Haandi by Yumto — Islamabad (Gulberg Greens)
              </div>

              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', marginBottom: '10px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>KOT #: {order.id.slice(-6).toUpperCase()}</span>
                  <span>Table: <strong>{order.tableNumber || 'Takeaway'}</strong></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Time: {fmtTime(order.createdAt)}</span>
                  <span>Type: <strong>{order.orderType}</strong></span>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px dotted #ccc', fontSize: '12px', fontWeight: '800' }}>
                    <span>{item.quantity} × {item.name} {item.variation ? `[${item.variation}]` : ''}</span>
                    <span>Ready</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#555', borderTop: '1px dashed #000', paddingTop: '6px' }}>
                Dispatch immediately when ready · Chef KDS Ticket
              </div>
            </div>
          )}
        </div>

        {/* Print action footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', gap: '8px' }}>
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
            <span>Cash Out</span><strong>- {fmtMoney(shift.cashOut)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', borderTop: '2px dashed #374151', paddingTop: '8px', marginBottom: '14px' }}>
            <span>Expected Cash in Drawer</span><strong>{fmtMoney(expectedCash)}</strong>
          </div>

          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '6px' }}>
            Actual Counted Cash
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

// ─── Held Orders Panel ───────────────────────────────────────────────────────
interface HeldPanelProps {
  heldOrders: HeldOrder[];
  onRecall: (order: HeldOrder) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}
const HeldPanel: React.FC<HeldPanelProps> = ({ heldOrders, onRecall, onDelete, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 9997, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
    <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
      <div style={{ background: '#1A120B', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#E85D04', fontWeight: '800', fontSize: '14px' }}>
          ⏸️ Parked / Held Tickets ({heldOrders.length})
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
      </div>
      <div style={{ padding: '16px', maxHeight: '450px', overflowY: 'auto' }}>
        {heldOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '13px' }}>
            No parked tickets right now
          </div>
        ) : (
          heldOrders.map(h => {
            const hSubtotal = h.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
            return (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', marginBottom: '8px', background: '#f9fafb' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: '#111827' }}>
                    {h.label || `Ticket #${h.id.slice(-4)}`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {h.items.length} items · {fmtMoney(hSubtotal)} · {fmtTime(h.heldAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => onRecall(h)}
                    style={{ background: '#8B1E1E', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Recall
                  </button>
                  <button
                    onClick={() => onDelete(h.id)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 8px', cursor: 'pointer' }}
                  >
                    <Trash2 style={{ width: '12px', height: '12px' }} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

// ─── Main CashierPortal Component ───────────────────────────────────────────
export const CashierPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  // ── Light / Dark Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

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

  // ── Menu & Categories
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

  const removeItem = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
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

  const handleRecall = (held: HeldOrder) => {
    setCart(held.items);
    setOrderType(held.orderType as any);
    if (held.tableId) setSelectedTableId(held.tableId);
    db.deleteHeldOrder(held.id);
    setShowHeldPanel(false);
    showToast('Ticket recalled into cart', 'info');
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
          onRecall={handleRecall}
          onDelete={(id) => { db.deleteHeldOrder(id); showToast('Ticket deleted', 'info'); }}
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

      {/* Table picker modal */}
      {showTablePicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9995, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
            <div style={{ background: '#1A120B', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#E85D04', fontWeight: '800', fontSize: '13px' }}>🪑 Select Table (Islamabad)</span>
              <button onClick={() => setShowTablePicker(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: '16px' }}>
              {/* Floor tabs */}
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
              {/* Table grid */}
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

      {/* ─── Top Bar with Dark/Light Theme Switcher ───────────────────────────── */}
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

        {/* Location Badge (Single Location Only) */}
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
          <span>{isDark ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>

      {/* ─── Main 2-Column POS Layout ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0, overflow: 'hidden' }}>

        {/* ─ LEFT: Item Catalog & Categories ─ */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${ui.border}`, background: ui.bg }}>

          {/* Search bar + Categories */}
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

            {/* Category Ribbon */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {categories.map(cat => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
                      background: isActive ? '#8B1E1E' : isDark ? '#2A1F17' : '#F3F4F6',
                      color: isActive ? '#ffffff' : ui.textMuted
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '10px' }}>
              {filteredMenu.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.variations && item.variations.length > 0) setVariationItem(item);
                    else addToCart(item);
                  }}
                  style={{
                    background: ui.card, border: `1px solid ${ui.border}`,
                    borderRadius: '10px', padding: '10px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    textAlign: 'left', position: 'relative', transition: 'transform 0.1s, box-shadow 0.1s'
                  }}
                >
                  <div style={{ width: '100%', height: '65px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#e5e7eb' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                    />
                  </div>
                  <div style={{ color: ui.text, fontWeight: '700', fontSize: '11px', lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.name}
                  </div>
                  <div style={{ marginTop: 'auto', color: '#E85D04', fontWeight: '800', fontSize: '12px' }}>
                    {fmtMoney(item.price)}
                  </div>
                  {item.variations && item.variations.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '6px', right: '6px',
                      background: 'rgba(0,0,0,0.7)', color: '#fff',
                      fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px'
                    }}>
                      Sizes
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─ RIGHT: Cart, Order Type & Tender Pane ─ */}
        <div style={{ display: 'flex', flexDirection: 'column', background: ui.surface, borderLeft: `1px solid ${ui.border}` }}>
          
          {/* Order Type & Table Picker */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${ui.border}`, background: ui.bg }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              <button
                onClick={() => setOrderType('DINE_IN')}
                style={{
                  padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: orderType === 'DINE_IN' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                  color: orderType === 'DINE_IN' ? '#ffffff' : ui.textMuted,
                  fontWeight: '700', fontSize: '11px'
                }}
              >
                🍽️ Dine In
              </button>
              <button
                onClick={() => { setOrderType('PICK_UP'); setSelectedTableId(null); }}
                style={{
                  padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: orderType === 'PICK_UP' ? '#8B1E1E' : isDark ? '#2A1F17' : '#E5E7EB',
                  color: orderType === 'PICK_UP' ? '#ffffff' : ui.textMuted,
                  fontWeight: '700', fontSize: '11px'
                }}
              >
                🥡 Takeaway
              </button>
            </div>

            {orderType === 'DINE_IN' && (
              <button
                onClick={() => setShowTablePicker(true)}
                style={{
                  width: '100%', background: selectedTable ? 'rgba(232,93,4,0.15)' : ui.card,
                  border: `1.5px solid ${selectedTable ? '#E85D04' : ui.border}`,
                  borderRadius: '8px', padding: '8px 12px',
                  color: selectedTable ? '#E85D04' : ui.textMuted,
                  fontSize: '11px', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
              >
                <span>{selectedTable ? `🪑 Table ${selectedTable.tableNumber} (${selectedTable.capacity} seats)` : 'Select Table…'}</span>
                <ChevronDown style={{ width: '13px', height: '13px' }} />
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: ui.textMuted }}>
                <ShoppingCart style={{ width: '36px', height: '36px', margin: '0 auto 8px', opacity: 0.3 }} />
                <div style={{ fontSize: '12px' }}>Cart is empty</div>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${ui.border}` }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: ui.text, fontSize: '12px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    {item.variation && <div style={{ color: ui.textMuted, fontSize: '10px' }}>{item.variation}</div>}
                    <div style={{ color: '#E85D04', fontSize: '11px', fontWeight: '800' }}>{fmtMoney(item.price * item.quantity)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => updateQty(idx, -1)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDark ? '#2A1F17' : '#E5E7EB', border: 'none', color: ui.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus style={{ width: '10px', height: '10px' }} />
                    </button>
                    <span style={{ color: ui.text, fontWeight: '700', fontSize: '12px', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQty(idx, 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDark ? '#2A1F17' : '#E5E7EB', border: 'none', color: ui.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus style={{ width: '10px', height: '10px' }} />
                    </button>
                    <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount Ribbon */}
          {cart.length > 0 && (
            <div style={{ padding: '8px 12px', borderTop: `1px solid ${ui.border}`, background: ui.bg, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag style={{ width: '13px', height: '13px', color: ui.textMuted }} />
                <span style={{ color: ui.textMuted, fontSize: '11px', fontWeight: '600' }}>Disc</span>
                <select
                  value={discountPercent}
                  onChange={e => setDiscountPercent(Number(e.target.value))}
                  style={{ background: ui.surface, border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, padding: '3px 6px', fontSize: '11px', outline: 'none' }}
                >
                  {[0, 5, 10, 15, 20, 25, 30].map(p => <option key={p} value={p}>{p}%</option>)}
                </select>
                <span style={{ color: ui.textMuted, fontSize: '11px' }}>+Rs</span>
                <input
                  type="number"
                  value={discountFlat || ''}
                  placeholder="0"
                  onChange={e => setDiscountFlat(Number(e.target.value) || 0)}
                  style={{ background: ui.surface, border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, padding: '3px 6px', fontSize: '11px', width: '60px', outline: 'none' }}
                />
                {totalDiscount > 0 && (
                  <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '11px', marginLeft: 'auto' }}>-{fmtMoney(totalDiscount)}</span>
                )}
              </div>
            </div>
          )}

          {/* Totals & Dynamic Sales Tax (Card = 5%, Cash = 16%) */}
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${ui.border}`, background: isDark ? 'rgba(0,0,0,0.2)' : '#F9FAFB', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: ui.textMuted, marginBottom: '3px' }}>
              <span>Subtotal</span><span>{fmtMoney(subtotal)}</span>
            </div>
            {totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#16a34a', marginBottom: '3px' }}>
                <span>Discount</span><span>-{fmtMoney(totalDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: paymentMethod === 'CARD' ? '#16a34a' : ui.textMuted, marginBottom: '5px' }}>
              <span>Sales Tax ({taxRatePercent}% FBR {paymentMethod === 'CARD' ? 'Card Incentive' : 'Cash'})</span>
              <span style={{ fontWeight: '700' }}>{fmtMoney(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#8B1E1E' }}>
              <span>TOTAL PAYABLE</span><span>{fmtMoney(total)}</span>
            </div>
          </div>

          {/* Tender Panel */}
          <div style={{ padding: '10px 14px', borderTop: `1px solid ${ui.border}`, background: ui.surface, flexShrink: 0 }}>
            {/* Payment method tabs with tax indicators */}
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

            {/* Cash input & presets */}
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
                  <div style={{ color: '#16a34a', fontWeight: '800', fontSize: '12px', textAlign: 'center', marginBottom: '4px' }}>
                    Change Due: {fmtMoney(changeDue)}
                  </div>
                )}
              </>
            )}

            {/* Split inputs */}
            {paymentMethod === 'SPLIT' && cart.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                <div>
                  <label style={{ color: ui.textMuted, fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '2px' }}>Cash (16% Tax)</label>
                  <input
                    type="number"
                    value={splitCash || ''}
                    placeholder="0"
                    onChange={e => setSplitCash(Number(e.target.value))}
                    style={{ width: '100%', background: isDark ? '#2A1F17' : '#F9FAFB', border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, padding: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ color: ui.textMuted, fontSize: '10px', fontWeight: '600', display: 'block', marginBottom: '2px' }}>Card (5% Tax)</label>
                  <input
                    type="number"
                    value={splitCard || ''}
                    placeholder="0"
                    onChange={e => setSplitCard(Number(e.target.value))}
                    style={{ width: '100%', background: isDark ? '#2A1F17' : '#F9FAFB', border: `1px solid ${ui.border}`, borderRadius: '6px', color: ui.text, padding: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* Action buttons (Hold / Cancel) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              <button
                onClick={handleHold}
                style={{
                  padding: '9px', borderRadius: '8px', border: '1.5px solid rgba(232,93,4,0.3)',
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
                  padding: '9px', borderRadius: '8px', border: '1.5px solid rgba(239,68,68,0.3)',
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
                marginTop: '8px', width: '100%',
                background: cart.length === 0 ? '#9ca3af' : 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                color: '#ffffff',
                border: 'none', borderRadius: '10px', padding: '13px',
                fontWeight: '800', fontSize: '13px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s', boxShadow: cart.length > 0 ? '0 4px 14px rgba(139,30,30,0.3)' : 'none'
              }}
            >
              <ReceiptText style={{ width: '16px', height: '16px' }} />
              Complete & Print Thermal Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

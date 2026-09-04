import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { useAuth } from '../context/AuthContext';
import type { OrderItem, MenuItem, Table } from '../types';
import { 
  Truck, Plus, Minus, Trash2, ArrowRightLeft, 
  X, Receipt, ChefHat, PhoneCall, ShoppingBag, UserCheck
} from 'lucide-react';

export const ManagerPortal: React.FC = () => {
  const { profile } = useAuth();
  const [dbState, setDbState] = useState(db);
  
  // Refresh on DB changes
  useEffect(() => {
    return db.subscribe(() => {
      setDbState(Object.create(db));
    });
  }, []);

  const selectedBranchId = 'br-isb';
  const [activeFloorId, setActiveFloorId] = useState('fl-isb-g');
  
  // Table Order Management States
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetTableId, setTargetTableId] = useState('');
  
  // Order Taker Staff Identity
  const [staffName, setStaffName] = useState(profile?.name || 'Manager Bilal');
  
  // New Order / Editing Order Items State
  const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [activeTabCat, setActiveTabCat] = useState('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const floors = dbState.getFloors(selectedBranchId);
  const tables = dbState.getTables(selectedBranchId, activeFloorId);
  const allTables = floors.flatMap(f => dbState.getTables(selectedBranchId, f.id));
  const orders = dbState.getOrders(selectedBranchId);
  const menu = dbState.getMenu();
  const riders = dbState.getUsers().filter(u => u.role === 'RIDER');
  const settings = dbState.getSettings();

  // Rush statistics
  const occupiedTables = allTables.filter(t => t.status === 'OCCUPIED' || dbState.getOrderByTableId(t.id));
  const activeDeliveries = orders.filter(o => o.orderType === 'DELIVERY' && o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const activeTakeaways = orders.filter(o => o.orderType === 'PICK_UP' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const unconfirmedOnlineOrders = orders.filter(o => o.isOnline && !o.isPunched && o.status !== 'CANCELLED');

  // Sync drawer items when selecting a table
  const openTableManager = (table: Table) => {
    setSelectedTable(table);
    const existingOrder = dbState.getOrderByTableId(table.id);
    if (existingOrder) {
      setCurrentOrderItems([...existingOrder.items]);
      setGuestName(existingOrder.userName || '');
      setGuestPhone(existingOrder.userPhone || '');
    } else {
      setCurrentOrderItems([]);
      setGuestName('Table Guest');
      setGuestPhone('');
    }
    setTableDrawerOpen(true);
  };

  // Add Item to table order
  const addItemToTab = (item: MenuItem, variationName?: string, priceOverride?: number) => {
    const price = priceOverride ?? (item.variations && item.variations.length > 0 ? item.variations[0].price : item.price);
    const varName = variationName ?? (item.variations && item.variations.length > 0 ? item.variations[0].name : undefined);

    setCurrentOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id && i.variation === varName);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id && i.variation === varName ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price,
        quantity: 1,
        variation: varName
      }];
    });
    showToast(`Added ${item.name} to Table`);
  };

  // Stepper increment/decrement
  const updateTabItemQty = (index: number, delta: number) => {
    setCurrentOrderItems(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].quantity = newQty;
      }
      return updated;
    });
  };

  // Save / Update Table Order
  const handleSaveTableOrder = () => {
    if (!selectedTable) return;
    if (currentOrderItems.length === 0) {
      showToast('Please add at least one item to the table order');
      return;
    }

    dbState.addOrUpdateTableOrder({
      tableId: selectedTable.id,
      items: currentOrderItems,
      waiterOrManagerName: staffName || profile?.name || 'Manager Bilal',
      customerName: guestName.trim() || 'Table Guest',
      customerPhone: guestPhone.trim() || '0330-0500600',
    });

    setTableDrawerOpen(false);
    showToast(`Table ${selectedTable.tableNumber} order updated & sent to Kitchen & POS!`);
  };

  // Table Transfer
  const handleTransferTable = () => {
    if (!selectedTable || !targetTableId) return;
    const success = dbState.transferTable(selectedTable.id, targetTableId);
    if (success) {
      const newTbl = allTables.find(t => t.id === targetTableId);
      showToast(`Transferred order from ${selectedTable.tableNumber} to ${newTbl?.tableNumber || targetTableId}!`);
      setTransferModalOpen(false);
      setTableDrawerOpen(false);
      setSelectedTable(null);
    } else {
      showToast('Transfer failed. Please verify table status.');
    }
  };

  // Mark order ready for Cashier Bill print
  const handleRequestBill = () => {
    if (!selectedTable) return;
    dbState.markTableBillRequested(selectedTable.id);
    setTableDrawerOpen(false);
    showToast(`Bill requested for Table ${selectedTable.tableNumber}! Visible at Cashier POS.`);
  };

  // Release table if guest left
  const handleReleaseTable = (tableId: string) => {
    dbState.updateTableStatus(tableId, 'AVAILABLE');
    showToast('Table marked as AVAILABLE');
  };

  // Rider assignment for delivery orders
  const readyDeliveries = orders.filter(o => 
    o.orderType === 'DELIVERY' && 
    o.status === 'READY' && 
    !o.riderId
  );

  const handleRiderAssign = (orderId: string, riderId: string) => {
    dbState.assignRiderToOrder(orderId, riderId);
    showToast('Rider assigned for delivery dispatch!');
  };

  // Running total calculation for active table
  const tabSubtotal = currentOrderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tabTaxCalc = dbState.calculateSalesTax(tabSubtotal, 'CASH');
  const tabTotal = tabSubtotal + tabTaxCalc.taxAmount;

  // Categories
  const categories = ['All', ...Array.from(new Set(menu.map(i => i.category)))];
  const filteredMenu = activeTabCat === 'All' ? menu : menu.filter(i => i.category === activeTabCat);

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '90vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Top Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
          border: '1.5px solid var(--border-warm)', borderRadius: '20px', padding: '18px 24px',
          color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '14px', marginBottom: '20px', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FDFBF7', padding: '2px', border: '2px solid var(--haandi-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Haandi" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '900', color: '#ffffff' }}>
                  Floor Operations & Table Tabs
                </h1>
                <span style={{ background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid #3B82F6', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '800' }}>
                  MANAGER & FRONTDESK
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' }}>
                Punch Table Orders, Add/Subtract Items, Transfer Tables & Request POS Bills · Islamabad
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Order Taker Staff Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '10px' }}>
              <UserCheck style={{ width: '14px', height: '14px', color: 'var(--haandi-gold)' }} />
              <select
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '11px', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
              >
                <option value="Manager Bilal" style={{ background: '#1A120B' }}>Manager Bilal</option>
                <option value="Ali Order Taker (Waiter)" style={{ background: '#1A120B' }}>Ali Order Taker (Waiter)</option>
                <option value="Hamza Floor Captain" style={{ background: '#1A120B' }}>Hamza Floor Captain</option>
              </select>
            </div>

            {/* Floor Switcher Tabs */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '12px' }}>
              {floors.map(fl => (
                <button
                  key={fl.id}
                  onClick={() => setActiveFloorId(fl.id)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
                    background: activeFloorId === fl.id ? 'var(--haandi-red)' : 'transparent',
                    color: activeFloorId === fl.id ? '#ffffff' : 'rgba(255,255,255,0.7)'
                  }}
                >
                  {fl.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rush & Floor Summary Stats Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupied Tables</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#8B1E1E', marginTop: '2px' }}>
                {occupiedTables.length} / {allTables.length} Tabs
              </div>
            </div>
            <div style={{ background: 'rgba(139,30,30,0.1)', color: '#8B1E1E', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🪑
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Deliveries</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#E85D04', marginTop: '2px' }}>
                {activeDeliveries.length} Dispatches
              </div>
            </div>
            <div style={{ background: 'rgba(232,93,4,0.1)', color: '#E85D04', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Takeaways</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#3B82F6', marginTop: '2px' }}>
                {activeTakeaways.length} Active
              </div>
            </div>
            <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{
            background: unconfirmedOnlineOrders.length > 0 ? '#FEF2F2' : '#ffffff',
            border: `1.5px solid ${unconfirmedOnlineOrders.length > 0 ? '#DC2626' : 'var(--border-warm)'}`,
            borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: unconfirmedOnlineOrders.length > 0 ? '#DC2626' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                Online Queue (POS)
              </div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: unconfirmedOnlineOrders.length > 0 ? '#DC2626' : 'var(--text-dark)', marginTop: '2px' }}>
                {unconfirmedOnlineOrders.length} Unpunched
              </div>
            </div>
            <div style={{ background: unconfirmedOnlineOrders.length > 0 ? 'rgba(220,38,38,0.15)' : 'rgba(0,0,0,0.05)', color: unconfirmedOnlineOrders.length > 0 ? '#DC2626' : 'var(--text-muted)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall style={{ width: '18px', height: '18px' }} />
            </div>
          </div>
        </div>

        {/* Main Floor Layout Grid & Table Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          
          {/* Floor Canvas */}
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>
                  Interactive Floor Plan — {floors.find(f => f.id === activeFloorId)?.name}
                </h2>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Click any table to punch or edit live order tab, add/remove items, or transfer table
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', fontSize: '11px', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🟢 Available (Start Order)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔴 Occupied (Active Tab)</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🟡 Bill Requested</span>
              </div>
            </div>

            {/* Table Floor Visual Canvas */}
            <div style={{
              height: '320px', background: 'var(--bg-dark)', borderRadius: '14px',
              position: 'relative', overflow: 'hidden', border: '1.5px solid var(--border-warm-dark)', marginBottom: '16px'
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

              {tables.map(table => {
                const order = dbState.getOrderByTableId(table.id);
                const isOccupied = table.status === 'OCCUPIED' || !!order;
                const isBillReq = order?.isBillRequested;

                return (
                  <div
                    key={table.id}
                    onClick={() => openTableManager(table)}
                    style={{
                      position: 'absolute',
                      left: `${table.x}%`,
                      top: `${table.y}%`,
                      width: `${table.width}%`,
                      height: `${table.height}%`,
                      background: isBillReq ? 'rgba(234,179,8,0.35)' : isOccupied ? 'rgba(220,38,38,0.35)' : 'rgba(21,128,61,0.35)',
                      border: `2px solid ${isBillReq ? '#F59E0B' : isOccupied ? '#DC2626' : '#16A34A'}`,
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#ffffff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <div style={{ fontWeight: '900', fontSize: '13px' }}>{table.tableNumber}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.85)' }}>
                      {table.capacity} seats · {table.type.replace('_', ' ')}
                    </div>
                    {isOccupied && (
                      <div style={{ fontSize: '9px', color: '#F4C430', fontWeight: '800', marginTop: '2px' }}>
                        {order ? `Rs. ${order.total.toLocaleString()}` : 'Occupied'}
                      </div>
                    )}
                    {isBillReq && (
                      <div style={{ fontSize: '8px', background: '#F59E0B', color: '#1A120B', fontWeight: '900', padding: '1px 4px', borderRadius: '4px', marginTop: '2px' }}>
                        BILL REQUESTED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table Quick List Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {tables.map(table => {
                const order = dbState.getOrderByTableId(table.id);
                const isOccupied = table.status === 'OCCUPIED' || !!order;

                return (
                  <div
                    key={table.id}
                    onClick={() => openTableManager(table)}
                    style={{
                      background: 'var(--bg-cream-light)', border: '1.5px solid var(--border-warm)',
                      borderRadius: '12px', padding: '12px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '900', fontSize: '13px', color: 'var(--text-dark)' }}>
                        Table {table.tableNumber}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                        background: isOccupied ? '#FEE2E2' : 'var(--emerald-light)',
                        color: isOccupied ? '#DC2626' : 'var(--emerald)'
                      }}>
                        {isOccupied ? 'Occupied' : 'Available'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {table.capacity} Seats · {table.type}
                    </div>

                    {order && (
                      <div style={{ marginTop: '8px', borderTop: '1px dashed var(--border-warm)', paddingTop: '6px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--haandi-red)' }}>
                          Rs. {order.total.toLocaleString()} ({order.items.length} items)
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Guest: {order.userName}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Dispatch Section */}
          {readyDeliveries.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Truck style={{ width: '20px', height: '20px', color: 'var(--haandi-red)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)' }}>
                  Delivery Fleet Dispatch ({readyDeliveries.length} Ready for Rider Assignment)
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {readyDeliveries.map(ord => (
                  <div key={ord.id} style={{ background: 'var(--bg-cream-light)', border: '1.5px solid var(--border-warm)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-dark)' }}>
                      Order #{ord.id.slice(-6).toUpperCase()} · Rs. {ord.total.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ord.deliveryAddress || 'Gulberg Greens, Islamabad'}
                    </div>

                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        onChange={e => e.target.value && handleRiderAssign(ord.id, e.target.value)}
                        defaultValue=""
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '11px', fontWeight: '700', background: '#ffffff' }}
                      >
                        <option value="" disabled>Assign Rider...</option>
                        {riders.map(r => (
                          <option key={r.id} value={r.id}>{r.name} (Rider)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ACTIVE TABLE TAB & ORDER PUNCHING DRAWER */}
        {tableDrawerOpen && selectedTable && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(26,18,11,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: '600px', height: '100%', background: 'var(--bg-cream-light)', borderLeft: '2px solid var(--border-warm)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)', animation: 'slideInRight 0.25s ease-out' }}>
              
              {/* Drawer Top Bar */}
              <div style={{ background: 'var(--bg-dark)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--haandi-saffron)' }}>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Table {selectedTable.tableNumber} Dining Tab</span>
                    <span style={{ fontSize: '10px', background: 'var(--haandi-red)', color: '#ffffff', padding: '2px 8px', borderRadius: '6px' }}>
                      {selectedTable.capacity} Seats
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
                    Taken by: Manager Bilal · Gulberg Greens, Islamabad
                  </div>
                </div>
                <button onClick={() => setTableDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}><X /></button>
              </div>

              {/* Guest Details & Transfer Action */}
              <div style={{ padding: '12px 16px', background: '#ffffff', borderBottom: '1px solid var(--border-warm)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Guest Name"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '12px' }}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  style={{ width: '130px', padding: '7px 10px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '12px' }}
                />
                <button
                  onClick={() => setTransferModalOpen(true)}
                  style={{
                    background: 'var(--bg-cream-light)', border: '1.5px solid var(--border-warm)', borderRadius: '8px',
                    padding: '7px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                  }}
                  title="Move order to another table"
                >
                  <ArrowRightLeft style={{ width: '13px', height: '13px', color: 'var(--haandi-red)' }} />
                  <span>Transfer Table</span>
                </button>
              </div>

              {/* Drawer Content: Split into Items on Tab + Menu Catalog */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Active Items on this Table */}
                <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Current Order Items ({currentOrderItems.length})</span>
                    <span style={{ color: 'var(--haandi-red)', fontWeight: '900' }}>Subtotal: Rs. {tabSubtotal.toLocaleString()}</span>
                  </div>

                  {currentOrderItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                      No dishes added yet. Click items from the menu below to punch order.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentOrderItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-cream-light)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-warm)' }}>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '12px', color: 'var(--text-dark)' }}>{item.name}</div>
                            {item.variation && <span style={{ fontSize: '10px', color: 'var(--haandi-saffron)', fontWeight: '700' }}>[{item.variation}] </span>}
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--haandi-red)' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="haandi-qty-stepper">
                              <button className="haandi-qty-btn" onClick={() => updateTabItemQty(idx, -1)}><Minus style={{ width: '10px', height: '10px' }} /></button>
                              <span className="haandi-qty-count">{item.quantity}</span>
                              <button className="haandi-qty-btn" onClick={() => updateTabItemQty(idx, 1)}><Plus style={{ width: '10px', height: '10px' }} /></button>
                            </div>
                            <button onClick={() => updateTabItemQty(idx, -item.quantity)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Menu Dish Picker to Add/Subtract */}
                <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>
                    Punch Dishes to Table {selectedTable.tableNumber}
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '10px', scrollbarWidth: 'none' }}>
                    {categories.map(c => (
                      <button
                        key={c}
                        onClick={() => setActiveTabCat(c)}
                        style={{
                          padding: '5px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '700',
                          border: '1px solid var(--border-warm)', cursor: 'pointer', whiteSpace: 'nowrap',
                          background: activeTabCat === c ? 'var(--haandi-red)' : 'var(--bg-cream-light)',
                          color: activeTabCat === c ? '#ffffff' : 'var(--text-muted)'
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Dishes Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                    {filteredMenu.map(dish => (
                      <button
                        key={dish.id}
                        onClick={() => addItemToTab(dish)}
                        style={{
                          background: 'var(--bg-cream-light)', border: '1.5px solid var(--border-warm)',
                          borderRadius: '8px', padding: '8px 10px', textAlign: 'left', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', lineHeight: 1.2 }}>{dish.name}</div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--haandi-red)', marginTop: '2px' }}>Rs. {dish.price}</div>
                        </div>
                        <Plus style={{ width: '14px', height: '14px', color: 'var(--haandi-saffron)' }} />
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Bottom Actions */}
              <div style={{ background: '#ffffff', borderTop: '2px solid var(--border-warm)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>Sales Tax ({settings.isTaxActive ? '16% Cash / 5% Card' : '0%'}):</span>
                  <strong>Rs. {tabTaxCalc.taxAmount.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: 'var(--haandi-red)' }}>
                  <span>Running Tab Total:</span>
                  <span>Rs. {tabTotal.toLocaleString()}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={handleSaveTableOrder}
                    style={{
                      background: 'var(--haandi-red)', color: '#ffffff', border: 'none', borderRadius: '10px',
                      padding: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <ChefHat style={{ width: '14px', height: '14px' }} />
                    <span>Send to Kitchen</span>
                  </button>
                  <button
                    onClick={handleRequestBill}
                    style={{
                      background: 'var(--haandi-saffron)', color: '#ffffff', border: 'none', borderRadius: '10px',
                      padding: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Receipt style={{ width: '14px', height: '14px' }} />
                    <span>Bill at POS Terminal</span>
                  </button>
                </div>

                <button
                  onClick={() => handleReleaseTable(selectedTable.id)}
                  style={{
                    background: 'transparent', border: '1px solid #E5E7EB', color: '#9CA3AF',
                    borderRadius: '8px', padding: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600'
                  }}
                >
                  Mark Table Empty (Release)
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TRANSFER TABLE MODAL */}
        {transferModalOpen && selectedTable && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(26,18,11,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'var(--bg-cream-light)', borderRadius: '20px', maxWidth: '400px', width: '100%', overflow: 'hidden', border: '1.5px solid var(--border-warm)', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ background: 'var(--bg-dark)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '800', fontSize: '14px' }}>Transfer Table {selectedTable.tableNumber}</div>
                <button onClick={() => setTransferModalOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}><X /></button>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Select the target destination table to transfer all active items and guest tab:
                </div>

                <select
                  value={targetTableId}
                  onChange={e => setTargetTableId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', fontSize: '13px', fontWeight: '700', background: '#ffffff', marginBottom: '16px' }}
                >
                  <option value="">-- Choose Target Table --</option>
                  {allTables
                    .filter(t => t.id !== selectedTable.id && t.status === 'AVAILABLE')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({t.capacity} Seats · {t.type})
                      </option>
                    ))}
                </select>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button onClick={() => setTransferModalOpen(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-warm)', background: 'transparent', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>Cancel</button>
                  <button onClick={handleTransferTable} disabled={!targetTableId} style={{ padding: '8px 18px', borderRadius: '8px', background: 'var(--haandi-red)', color: '#ffffff', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>Confirm Transfer</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
            background: 'var(--emerald)', color: '#ffffff', padding: '12px 20px',
            borderRadius: '12px', fontWeight: '800', fontSize: '13px', boxShadow: 'var(--shadow-lg)'
          }}>
            {toastMsg}
          </div>
        )}

      </div>
    </div>
  );
};

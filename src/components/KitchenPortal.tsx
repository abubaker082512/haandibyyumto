import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { Play, Check, Clock, ChefHat, CheckCircle } from 'lucide-react';

export const KitchenPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  const [, setTimeTick] = useState(0);
  const [selectedStation, setSelectedStation] = useState<'ALL' | 'HANDI' | 'KARAHI' | 'BBQ' | 'TANDOOR'>('ALL');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 1000);

    const unsubscribe = db.subscribe(() => {
      setDbState(Object.create(db));
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const selectedBranchId = 'br-isb';
  const tables = dbState.getTables(selectedBranchId);

  // Active kitchen orders (CONFIRMED, PREPARING, READY and already punched by Cashier/Manager)
  const rawActiveOrders = dbState.getOrders(selectedBranchId)
    .filter(o => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status) && (o.isPunched !== false || !o.isOnline))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // oldest first

  const activeOrders = rawActiveOrders.filter(order => {
    if (selectedStation === 'ALL') return true;
    if (selectedStation === 'HANDI') return order.items.some(i => i.name.toLowerCase().includes('handi'));
    if (selectedStation === 'KARAHI') return order.items.some(i => i.name.toLowerCase().includes('karahi'));
    if (selectedStation === 'BBQ') return order.items.some(i => i.name.toLowerCase().includes('bbq') || i.name.toLowerCase().includes('boti') || i.name.toLowerCase().includes('kebab') || i.name.toLowerCase().includes('tikka') || i.name.toLowerCase().includes('chops'));
    if (selectedStation === 'TANDOOR') return order.items.some(i => i.name.toLowerCase().includes('naan') || i.name.toLowerCase().includes('roti') || i.name.toLowerCase().includes('rice') || i.name.toLowerCase().includes('paratha'));
    return true;
  });

  const handleStartPrep = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'PREPARING');
  };

  const handleMarkReady = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'READY');
  };

  const handleCompleteOrder = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'COMPLETED');
  };

  const getElapsedTime = (isoString: string) => {
    const created = new Date(isoString).getTime();
    const diff = Date.now() - created;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getTimerStyle = (isoString: string) => {
    const created = new Date(isoString).getTime();
    const minutes = Math.floor((Date.now() - created) / 60000);
    if (minutes >= 15) return { color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' };
    if (minutes >= 8) return { color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' };
    return { color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' };
  };

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '90vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* KDS Top Header */}
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
                  Kitchen Display System (KDS)
                </h1>
                <span style={{ background: 'rgba(220,38,38,0.25)', color: '#F87171', border: '1px solid #DC2626', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '800' }}>
                  LIVE COOKING QUEUE
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' }}>
                Clay Pot Handi, Karahi & BBQ Grill Dispatch · Gulberg Greens, Islamabad
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(232,93,4,0.2)', border: '1px solid var(--haandi-saffron)', borderRadius: '10px', padding: '6px 14px', color: '#F4C430', fontWeight: '800', fontSize: '12px' }}>
              🔥 {rawActiveOrders.length} Total Tickets
            </div>
          </div>
        </div>

        {/* Station Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
          {[
            { id: 'ALL', label: 'All Stations', icon: '👨‍🍳' },
            { id: 'HANDI', label: 'Earthen Handi Pots', icon: '🍲' },
            { id: 'KARAHI', label: 'Shinwari Karahi Woks', icon: '🍳' },
            { id: 'BBQ', label: 'Charcoal BBQ Grill', icon: '🔥' },
            { id: 'TANDOOR', label: 'Tandoor & Rice', icon: '🫓' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setSelectedStation(st.id as any)}
              style={{
                padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800',
                border: selectedStation === st.id ? '2px solid var(--haandi-saffron)' : '1px solid var(--border-warm)',
                background: selectedStation === st.id ? 'var(--haandi-red)' : 'var(--bg-card)',
                color: selectedStation === st.id ? '#ffffff' : 'var(--text-dark)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                boxShadow: selectedStation === st.id ? '0 2px 8px rgba(139,30,30,0.3)' : 'none'
              }}
            >
              <span>{st.icon}</span>
              <span>{st.label}</span>
            </button>
          ))}
        </div>

        {/* KDS Order Tickets Grid */}
        {activeOrders.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '20px',
            padding: '60px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)'
          }}>
            <ChefHat style={{ width: '54px', height: '54px', color: 'var(--haandi-saffron)', margin: '0 auto 12px', opacity: 0.7 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>All Cooking Queues are Clear</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              New orders punched from Customer App, Manager Tablet, or POS will appear here instantly.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {activeOrders.map(order => {
              const timer = getTimerStyle(order.createdAt);
              const tblObj = order.tableId ? tables.find(t => t.id === order.tableId) : null;
              const tableText = tblObj ? `Table ${tblObj.tableNumber}` : (order.tableId || 'Takeaway');
              const isPreparing = order.status === 'PREPARING';
              const isReady = order.status === 'READY';

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `2px solid ${isReady ? '#16A34A' : isPreparing ? '#E85D04' : 'var(--border-warm)'}`,
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s'
                  }}
                >
                  {/* Ticket Header */}
                  <div style={{
                    background: isReady ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)' : 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
                    padding: '12px 16px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '900', fontSize: '14px', letterSpacing: '0.04em' }}>
                        #{order.id.slice(-6).toUpperCase()} · {order.orderType}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--haandi-gold)', fontWeight: '700' }}>
                        {order.orderType === 'DINE_IN' ? `🪑 ${tableText}` : `🛵 ${order.userName}`}
                      </div>
                    </div>

                    {/* Timer Badge */}
                    <div style={{
                      background: timer.bg, color: timer.color, border: `1px solid ${timer.border}`,
                      padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '900',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                      <Clock style={{ width: '12px', height: '12px' }} />
                      <span>{getElapsedTime(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 10px', background: 'var(--bg-cream-light)', borderRadius: '8px',
                          border: '1px solid var(--border-warm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '24px', height: '24px', borderRadius: '6px',
                            background: 'var(--haandi-red)', color: '#ffffff', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900'
                          }}>
                            {item.quantity}×
                          </span>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '12.5px', color: 'var(--text-dark)' }}>
                              {item.name}
                            </div>
                            {item.variation && (
                              <div style={{ fontSize: '10px', color: 'var(--haandi-saffron)', fontWeight: '700' }}>
                                Portion: {item.variation}
                              </div>
                            )}
                          </div>
                        </div>

                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>
                          {item.name.toLowerCase().includes('handi') ? '🍲 Clay Pot' : item.name.toLowerCase().includes('karahi') ? '🍳 Wok' : '🍢 BBQ'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Bottom Actions */}
                  <div style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1.5px solid var(--border-warm)', display: 'flex', gap: '8px' }}>
                    {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                      <button
                        onClick={() => handleStartPrep(order.id)}
                        style={{
                          flex: 1, background: 'var(--haandi-saffron)', color: '#ffffff', border: 'none',
                          borderRadius: '10px', padding: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <Play style={{ width: '14px', height: '14px' }} />
                        <span>Start Cooking</span>
                      </button>
                    ) : isPreparing ? (
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        style={{
                          flex: 1, background: 'var(--emerald)', color: '#ffffff', border: 'none',
                          borderRadius: '10px', padding: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <Check style={{ width: '14px', height: '14px' }} />
                        <span>Mark Order Ready</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCompleteOrder(order.id)}
                        style={{
                          flex: 1, background: 'var(--haandi-red)', color: '#ffffff', border: 'none',
                          borderRadius: '10px', padding: '10px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        <CheckCircle style={{ width: '14px', height: '14px' }} />
                        <span>Dispatched / Served</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

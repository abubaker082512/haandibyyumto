import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { LiveTrackingMap } from './LiveTrackingMap';
import { 
  Truck, MapPin, PackageCheck
} from 'lucide-react';

export const RiderPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  
  // Refresh on database updates
  useEffect(() => {
    return db.subscribe(() => {
      setDbState(Object.create(db));
    });
  }, []);

  const [activeRiderId, setActiveRiderId] = useState('u-ride1');
  const riders = dbState.getUsers().filter(u => u.role === 'RIDER');

  // Get orders assigned to this rider that are in transit (SHIPPED, READY) or arrived (DELIVERED)
  const assignedOrders = dbState.getOrders()
    .filter(o => o.riderId === activeRiderId && ['READY', 'SHIPPED', 'DELIVERED'].includes(o.status));

  const handleStartDelivery = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'SHIPPED');
  };

  const handleMarkArrived = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'DELIVERED');
  };

  const handleMarkCompleted = (orderId: string) => {
    const orders = dbState.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].paymentStatus = 'PAID';
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
    }
    dbState.updateOrderStatus(orderId, 'COMPLETED');
  };

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '90vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Rider Portal Top Card */}
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
                  Haandi Fleet Dispatch
                </h1>
                <span style={{ background: 'rgba(22,163,74,0.2)', color: '#4ADE80', border: '1px solid #16A34A', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '800' }}>
                  ACTIVE RIDER
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' }}>
                Hot Doorstep Dispatch (Max 2.5 km Radius) · Gulberg Greens, Islamabad
              </p>
            </div>
          </div>

          {/* Rider Profile Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Rider:</span>
            <select
              value={activeRiderId}
              onChange={e => setActiveRiderId(e.target.value)}
              style={{
                background: '#FDFBF7', border: '1.5px solid var(--haandi-saffron)',
                borderRadius: '10px', padding: '6px 12px', fontSize: '12px', fontWeight: '800',
                color: '#1A120B', outline: 'none'
              }}
            >
              {riders.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Shipments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>
              Assigned Deliveries ({assignedOrders.length})
            </h2>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--haandi-red)' }}>
              📍 2.5 km Gulberg Greens Boundary
            </span>
          </div>

          {assignedOrders.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '20px',
              padding: '50px 20px', textAlign: 'center', boxShadow: 'var(--shadow-sm)'
            }}>
              <Truck style={{ width: '48px', height: '48px', color: 'var(--haandi-saffron)', margin: '0 auto 12px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-dark)' }}>No Active Deliveries Assigned</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ready orders will appear here once dispatched by the branch manager.
              </p>
            </div>
          ) : (
            assignedOrders.map(order => (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)',
                  borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
                  padding: '14px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '15px' }}>
                      Order #{order.id.slice(-6).toUpperCase()} · Rs. {order.total.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--haandi-gold)' }}>
                      Customer: {order.userName} ({order.userPhone || '0330 0500600'})
                    </div>
                  </div>
                  <span style={{
                    background: order.status === 'DELIVERED' ? 'var(--emerald)' : 'var(--haandi-saffron)',
                    color: '#ffffff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800'
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Delivery Map & Items */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {/* Left: Map Preview */}
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '6px' }}>
                      📍 Route to Destination:
                    </div>
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-warm)' }}>
                      <LiveTrackingMap
                        orderId={order.id}
                        customerAddress={order.deliveryAddress || 'Gulberg Greens, Islamabad'}
                        height="200px"
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {order.deliveryAddress || 'Gulberg Greens, Islamabad'}
                    </div>
                  </div>

                  {/* Right: Items and Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>
                        Dish Checklist ({order.items.length} items):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', background: 'var(--bg-cream-light)', padding: '6px 10px', borderRadius: '6px' }}>
                            <span style={{ fontWeight: '700' }}>{item.quantity}× {item.name} {item.variation ? `[${item.variation}]` : ''}</span>
                            <span style={{ color: 'var(--haandi-red)', fontWeight: '800' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      {order.status === 'READY' ? (
                        <button
                          onClick={() => handleStartDelivery(order.id)}
                          style={{
                            flex: 1, background: 'var(--haandi-saffron)', color: '#ffffff', border: 'none',
                            borderRadius: '10px', padding: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <Truck style={{ width: '15px', height: '15px' }} />
                          <span>Depart & Out for Delivery</span>
                        </button>
                      ) : order.status === 'SHIPPED' ? (
                        <button
                          onClick={() => handleMarkArrived(order.id)}
                          style={{
                            flex: 1, background: 'var(--haandi-red)', color: '#ffffff', border: 'none',
                            borderRadius: '10px', padding: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <MapPin style={{ width: '15px', height: '15px' }} />
                          <span>Arrived at Customer Doorstep</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkCompleted(order.id)}
                          style={{
                            flex: 1, background: 'var(--emerald)', color: '#ffffff', border: 'none',
                            borderRadius: '10px', padding: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        >
                          <PackageCheck style={{ width: '15px', height: '15px' }} />
                          <span>Handed Over & Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

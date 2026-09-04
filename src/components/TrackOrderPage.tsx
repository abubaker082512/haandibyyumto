import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../store/mockDb';
import { LiveTrackingMap } from './LiveTrackingMap';
import {
  ArrowLeft, Phone, MessageSquare, CheckCircle2, Clock,
  Bike, ChefHat, ShoppingBag, ShieldCheck, MapPin, Share2
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const [dbState, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  const orders = dbState.getOrders('br-isb');
  const activeOrder = orderId
    ? orders.find(o => o.id.toLowerCase() === orderId.toLowerCase() || o.id.endsWith(orderId))
    : orders[orders.length - 1];

  const order = activeOrder || {
    id: orderId || 'ORD-HAANDI-ISB',
    orderType: 'DELIVERY',
    status: 'PREPARING',
    items: [
      { menuItemId: 'm1', name: 'Mutton Desi Ghee Handi', price: 2800, quantity: 1, variation: 'Half' },
      { menuItemId: 'm12', name: 'Roghni Naan', price: 90, quantity: 3 }
    ],
    subtotal: 3070,
    tax: 0,
    deliveryFee: 150,
    total: 3220,
    userName: 'Customer',
    userPhone: '0330-0500600',
    deliveryAddress: 'Executive Block, Gulberg Greens, Islamabad',
    createdAt: new Date().toISOString()
  };

  const currentStatus = order.status || 'PREPARING';

  const statusSteps = [
    { key: 'PENDING', label: 'Order Received', desc: 'Verified & pre-paid', icon: ShoppingBag },
    { key: 'PREPARING', label: 'In Earthen Kitchen', desc: 'Slow-cooking in clay pot', icon: ChefHat },
    { key: 'READY', label: 'Sealed & Packed', desc: 'Ready for rider dispatch', icon: CheckCircle2 },
    { key: 'ON_THE_WAY', label: 'Rider on the Way', desc: 'Navigating Gulberg Greens', icon: Bike },
    { key: 'COMPLETED', label: 'Delivered Hot', desc: 'Enjoy your authentic meal', icon: ShieldCheck }
  ];

  const getStepIndex = (st: string) => {
    switch (st) {
      case 'PENDING': return 0;
      case 'PREPARING': return 1;
      case 'READY': return 2;
      case 'ON_THE_WAY': case 'SHIPPED': return 3;
      case 'COMPLETED': case 'DELIVERED': return 4;
      default: return 1;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  const trackingLink = `${window.location.origin}/#/track/${order.id}`;
  const waShareText = `🍲 *HAANDI BY YUMTO — Live Order Tracking*\n\n*Order ID:* #${order.id.slice(-6).toUpperCase()}\n*Status:* ${order.status}\n*Total:* Rs. ${order.total.toLocaleString()}\n\n📍 *Track Live Route & Rider:* ${trackingLink}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waShareText)}`;

  return (
    <div style={{ background: '#F8F3EA', minHeight: '100vh', padding: '16px 12px 60px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#FFFFFF', padding: '8px 14px', borderRadius: '12px',
              border: '1.5px solid #EADBCC', color: '#1A120B', textDecoration: 'none',
              fontWeight: '800', fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            <span>Back to Menu</span>
          </Link>

          <a
            href={waShareUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#25D366', padding: '8px 14px', borderRadius: '12px',
              color: '#FFFFFF', textDecoration: 'none',
              fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 12px rgba(37,211,102,0.3)'
            }}
          >
            <Share2 style={{ width: '15px', height: '15px' }} />
            <span>Share on WhatsApp</span>
          </a>
        </div>

        {/* Order Status Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
          borderRadius: '20px', padding: '20px', color: '#ffffff',
          marginBottom: '16px', border: '2px solid #E85D04',
          boxShadow: '0 10px 30px rgba(139,30,30,0.25)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#F4C430', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Live GPS Order Tracker
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0', color: '#ffffff' }}>
                Order #{order.id.slice(-6).toUpperCase()}
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                {order.orderType === 'DELIVERY' ? '🛵 Doorstep Delivery · Gulberg Greens' : '🛍️ Takeaway · Civic Center Pickup'}
              </p>
            </div>

            <div style={{
              background: 'rgba(232,93,4,0.3)', border: '1px solid #F4C430',
              padding: '6px 14px', borderRadius: '10px', color: '#F4C430',
              fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              <span>ETA: 20-30 Mins</span>
            </div>
          </div>

          {/* Stepper Progression */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '20px' }}>
            {statusSteps.map((s, idx) => {
              const isPassed = idx <= activeIdx;
              const isCurrent = idx === activeIdx;
              const Icon = s.icon;
              return (
                <div key={s.key} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '36px', height: '36px', margin: '0 auto 6px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCurrent ? '#E85D04' : isPassed ? '#15803D' : 'rgba(255,255,255,0.15)',
                    color: '#ffffff', border: isCurrent ? '2px solid #F4C430' : 'none',
                    boxShadow: isCurrent ? '0 0 14px rgba(244,196,48,0.6)' : 'none',
                    transition: 'all 0.3s'
                  }}>
                    <Icon style={{ width: '18px', height: '18px' }} />
                  </div>
                  <div style={{
                    fontSize: '10px', fontWeight: isCurrent ? '900' : '700',
                    color: isCurrent ? '#F4C430' : isPassed ? '#ffffff' : 'rgba(255,255,255,0.45)',
                    lineHeight: 1.2
                  }}>
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live GPS Map */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', overflow: 'hidden',
          border: '1.5px solid #EADBCC', boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
          marginBottom: '16px'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #EADBCC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin style={{ width: '16px', height: '16px', color: '#8B1E1E' }} />
              <strong style={{ fontSize: '13px', color: '#1A120B' }}>Live Rider Route (Gulberg Greens Zone)</strong>
            </div>
            <span style={{ fontSize: '11px', color: '#15803D', fontWeight: '800', background: '#F0FDF4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
              ● Live Tracking Active
            </span>
          </div>

          <LiveTrackingMap
            orderId={order.id}
            riderName="Zahid Rider (Gulberg Greens)"
            riderPhone="0332 5550192"
            customerSector="Executive Block (Gulberg Greens)"
            customerAddress={order.deliveryAddress || 'Executive Block, Gulberg Greens, Islamabad'}
            orderStatus={currentStatus}
            height="340px"
            showControls={true}
          />

          {/* Rider Card */}
          <div style={{ padding: '14px 18px', background: '#FDFBF7', borderTop: '1px solid #EADBCC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#8B1E1E', color: '#ffffff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '20px'
              }}>
                🛵
              </div>
              <div>
                <div style={{ fontWeight: '900', fontSize: '14px', color: '#1A120B' }}>
                  Zahid Khan · Dedicated Rider
                </div>
                <div style={{ fontSize: '11px', color: '#5C4B3C' }}>
                  Honda CD70 · Islamabad Zone
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="tel:03325550192"
                style={{
                  background: '#8B1E1E', color: '#ffffff', textDecoration: 'none',
                  borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Phone style={{ width: '13px', height: '13px' }} />
                <span>Call</span>
              </a>

              <a
                href={`https://wa.me/923300500600?text=Hi%20Haandi!%20Inquiring%20about%20Order%20%23${order.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#25D366', color: '#ffffff', textDecoration: 'none',
                  borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '800',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <MessageSquare style={{ width: '13px', height: '13px' }} />
                <span>Help</span>
              </a>
            </div>
          </div>
        </div>

        {/* Order Items & Receipt */}
        <div style={{
          background: '#FFFFFF', borderRadius: '20px', padding: '18px',
          border: '1.5px solid #EADBCC', boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#1A120B', marginBottom: '12px' }}>
            Order Summary ({order.items.length} items)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px dashed #EADBCC', paddingBottom: '12px', marginBottom: '12px' }}>
            {order.items.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: '#1A120B' }}>
                  <strong>{item.quantity}×</strong> {item.name} {item.variation ? `(${item.variation})` : ''}
                </span>
                <span style={{ fontWeight: '800', color: '#8B1E1E' }}>
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: '#5C4B3C' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>Rs. {order.subtotal?.toLocaleString() || order.total?.toLocaleString()}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery (Gulberg Greens):</span>
                <span>Rs. {order.deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', color: '#8B1E1E', borderTop: '1px solid #EADBCC', paddingTop: '6px', marginTop: '4px' }}>
              <span>Grand Total Paid:</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

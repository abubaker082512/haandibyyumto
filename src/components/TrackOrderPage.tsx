import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../store/mockDb';
import { LiveTrackingMap } from './LiveTrackingMap';
import type { OrderStatus, Order } from '../types';
import {
  ArrowLeft, Phone, MessageSquare, CheckCircle2, Clock,
  Bike, ChefHat, ShoppingBag, ShieldCheck, MapPin, Share2,
  Search, RefreshCw, PlusCircle, Sparkles
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { orderId: urlOrderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const [dbState, setDbState] = useState(db);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(urlOrderId || null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Real-time reactive subscription to mockDb
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setDbState(Object.create(db));
    });
    return () => unsub();
  }, []);

  // Sync selectedOrderId if URL param changes
  useEffect(() => {
    if (urlOrderId) {
      setSelectedOrderId(urlOrderId);
    }
  }, [urlOrderId]);

  // All orders from reactive db
  const allOrders: Order[] = dbState.getOrders() || [];

  // Determine active order
  const activeOrder: Order | undefined = React.useMemo(() => {
    if (selectedOrderId) {
      const match = allOrders.find(
        (o: Order) => o.id.toLowerCase() === selectedOrderId.toLowerCase() ||
             o.id.toLowerCase().endsWith(selectedOrderId.toLowerCase())
      );
      if (match) return match;
    }

    // Try last order stored in localStorage
    const lastSavedId = localStorage.getItem('haandi_last_order_id');
    if (lastSavedId) {
      const match = allOrders.find((o: Order) => o.id === lastSavedId);
      if (match) return match;
    }

    // Default to most recent order if available
    return allOrders.length > 0 ? allOrders[allOrders.length - 1] : undefined;
  }, [allOrders, selectedOrderId]);

  // Filtered orders for search
  const filteredOrders = React.useMemo(() => {
    if (!searchQuery.trim()) return allOrders.slice(-6).reverse();
    const q = searchQuery.toLowerCase().trim();
    return allOrders.filter((o: Order) =>
      o.id.toLowerCase().includes(q) ||
      o.userPhone.includes(q) ||
      o.userName.toLowerCase().includes(q) ||
      (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q))
    ).reverse();
  }, [allOrders, searchQuery]);

  // Handler to create a real live order on the fly for testing / demo
  const handleCreateLiveDemoOrder = () => {
    const newOrder = dbState.addOrder({
      branchId: 'br-isb',
      userId: 'u-cust',
      userName: 'Abubakar (Live Customer)',
      userPhone: '0330 0500600',
      orderType: 'DELIVERY',
      status: 'PREPARING',
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
      items: [
        { menuItemId: 'm1', name: 'Mutton Desi Ghee Handi', price: 2800, quantity: 1, variation: 'Half' },
        { menuItemId: 'm7', name: 'Chicken Seekh Kebab', price: 950, quantity: 1 },
        { menuItemId: 'm12', name: 'Roghni Naan', price: 90, quantity: 4 }
      ],
      subtotal: 4110,
      discountAmount: 0,
      discountPercent: 0,
      serviceCharge: 206,
      serviceChargePercent: 5,
      taxableAmount: 4316,
      tax: 216,
      taxRatePercent: 5,
      deliveryFee: 150,
      premiumReservationFee: 0,
      total: 4682,
      deliveryAddress: 'House 22, Street 8, Executive Block, Gulberg Greens, Islamabad'
    });

    localStorage.setItem('haandi_last_order_id', newOrder.id);
    setSelectedOrderId(newOrder.id);
    navigate(`/track/${newOrder.id}`);
  };

  // Handler to advance stage in real-time
  const handleAdvanceStatus = (newStatus: OrderStatus) => {
    if (!activeOrder) return;
    setIsSyncing(true);
    dbState.updateOrderStatus(activeOrder.id, newStatus);
    setTimeout(() => setIsSyncing(false), 300);
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'PENDING', label: 'Order Received', desc: 'Verified & pre-paid', icon: ShoppingBag },
    { key: 'PREPARING', label: 'In Kitchen', desc: 'Slow-cooking in clay pot', icon: ChefHat },
    { key: 'READY', label: 'Sealed & Packed', desc: 'Ready for rider dispatch', icon: CheckCircle2 },
    { key: 'SHIPPED', label: 'Rider on the Way', desc: 'Live GPS in Gulberg Greens', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered Hot', desc: 'Enjoy your authentic meal', icon: ShieldCheck }
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

  const currentStatus = activeOrder?.status || 'PENDING';
  const activeIdx = getStepIndex(currentStatus);

  const trackingLink = activeOrder ? `${window.location.origin}/#/track/${activeOrder.id}` : window.location.href;
  const waShareText = activeOrder
    ? `🍲 *HAANDI BY YUMTO — Live Order Tracking*\n\n*Order ID:* #${activeOrder.id.slice(-6).toUpperCase()}\n*Status:* ${activeOrder.status}\n*Total:* Rs. ${activeOrder.total.toLocaleString()}\n*Customer:* ${activeOrder.userName}\n\n📍 *Track Live Route & Rider on Map:*\n${trackingLink}`
    : '🍲 Track your Haandi by Yumto orders in real-time!';
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waShareText)}`;

  return (
    <div style={{ background: '#F8F3EA', minHeight: '100vh', padding: '16px 12px 60px' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                setIsSyncing(true);
                setDbState(Object.create(db));
                setTimeout(() => setIsSyncing(false), 400);
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#FFFFFF', padding: '8px 12px', borderRadius: '12px',
                border: '1.5px solid #EADBCC', color: '#8B1E1E', cursor: 'pointer',
                fontWeight: '800', fontSize: '12px'
              }}
              title="Refresh Real-time Order Data"
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: isSyncing ? 'spin 0.6s linear infinite' : 'none' }} />
              <span className="hidden sm:inline">Live Sync</span>
            </button>

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
              <span>Share WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Real-time Order Search & Filter */}
        <div style={{
          background: '#FFFFFF', borderRadius: '16px', padding: '12px 16px',
          border: '1.5px solid #EADBCC', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search style={{ width: '18px', height: '18px', color: '#8B1E1E', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search active orders by Order ID (#), Customer Name, or Phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                border: 'none', outline: 'none', width: '100%', fontSize: '13px',
                color: '#1A120B', background: 'transparent', fontWeight: '600'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#9C8B7A', cursor: 'pointer', fontSize: '12px', fontWeight: '800' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Active Order Switcher Chips */}
          {filteredOrders.length > 0 && (
            <div style={{
              display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '10px',
              marginTop: '8px', borderTop: '1px solid #F5EDE2', scrollbarWidth: 'none'
            }}>
              <span style={{ fontSize: '11px', color: '#9C8B7A', fontWeight: '700', alignSelf: 'center', flexShrink: 0 }}>
                Live Orders:
              </span>
              {filteredOrders.map((o: Order) => {
                const isSelected = activeOrder?.id === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      localStorage.setItem('haandi_last_order_id', o.id);
                      navigate(`/track/${o.id}`);
                    }}
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #8B1E1E, #E85D04)' : '#FDFBF7',
                      color: isSelected ? '#ffffff' : '#1A120B',
                      border: isSelected ? '1.5px solid #E85D04' : '1px solid #EADBCC',
                      borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: '800',
                      cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>#{o.id.slice(-6).toUpperCase()}</span>
                    <span style={{
                      background: isSelected ? 'rgba(255,255,255,0.2)' : '#EEDBCE',
                      color: isSelected ? '#ffffff' : '#8B1E1E',
                      fontSize: '9px', padding: '1px 5px', borderRadius: '4px'
                    }}>
                      {o.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* If NO Active Order Found */}
        {!activeOrder ? (
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '40px 24px',
            textAlign: 'center', border: '1.5px solid #EADBCC', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px', background: '#FDF4EB',
              color: '#E85D04', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '28px'
            }}>
              🍲
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1A120B', marginBottom: '8px' }}>
              No Active Order Found
            </h2>
            <p style={{ fontSize: '13px', color: '#5C4B3C', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              You haven't placed an order yet in this session, or the order ID in the link does not exist.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/"
                style={{
                  background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#ffffff', textDecoration: 'none', padding: '10px 22px', borderRadius: '12px',
                  fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 14px rgba(232,93,4,0.3)'
                }}
              >
                Browse Menu & Order Now
              </Link>
              <button
                onClick={handleCreateLiveDemoOrder}
                style={{
                  background: '#FFFFFF', border: '2px solid #8B1E1E', color: '#8B1E1E',
                  padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <PlusCircle style={{ width: '16px', height: '16px' }} />
                <span>Create Live Real Order (Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Real-time Order Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
              borderRadius: '20px', padding: '20px', color: '#ffffff',
              marginBottom: '16px', border: '2px solid #E85D04',
              boxShadow: '0 10px 30px rgba(139,30,30,0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#F4C430', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Live GPS Real-Time Order Tracker
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '4px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Order #{activeOrder.id.slice(-6).toUpperCase()}</span>
                    <span style={{
                      fontSize: '11px', background: 'rgba(232,93,4,0.4)', border: '1px solid #F4C430',
                      color: '#F4C430', padding: '2px 8px', borderRadius: '6px', fontWeight: '800'
                    }}>
                      {activeOrder.status}
                    </span>
                  </h1>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    {activeOrder.orderType === 'DELIVERY' ? `🛵 Doorstep Delivery · ${activeOrder.deliveryAddress || 'Gulberg Greens'}` : '🛍️ Takeaway · Civic Center Pickup'}
                  </p>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                    Customer: <strong>{activeOrder.userName}</strong> ({activeOrder.userPhone}) · Placed: {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{
                  background: 'rgba(232,93,4,0.3)', border: '1px solid #F4C430',
                  padding: '8px 14px', borderRadius: '12px', color: '#F4C430',
                  fontWeight: '900', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <Clock style={{ width: '15px', height: '15px' }} />
                  <span>ETA: {activeOrder.status === 'COMPLETED' ? 'Delivered' : '20-30 Mins'}</span>
                </div>
              </div>

              {/* Stepper Progression */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '22px' }}>
                {statusSteps.map((s, idx) => {
                  const isPassed = idx <= activeIdx;
                  const isCurrent = idx === activeIdx;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '38px', height: '38px', margin: '0 auto 6px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isCurrent ? '#E85D04' : isPassed ? '#15803D' : 'rgba(255,255,255,0.15)',
                        color: '#ffffff', border: isCurrent ? '2.5px solid #F4C430' : 'none',
                        boxShadow: isCurrent ? '0 0 16px rgba(244,196,48,0.7)' : 'none',
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

            {/* Live Interactive Stage Controller (For Testing / Immediate Real-Time Demo) */}
            <div style={{
              background: '#FFFFFF', borderRadius: '16px', padding: '12px 16px',
              border: '1.5px solid #EADBCC', marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', color: '#8B1E1E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                  <span>Real-Time Stage Simulator & Kitchen/Rider Controls</span>
                </div>
                <span style={{ fontSize: '10px', color: '#5C4B3C', fontWeight: '600' }}>
                  Click to advance status live
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '6px' }}>
                <button
                  onClick={() => handleAdvanceStatus('PENDING')}
                  style={{
                    background: activeOrder.status === 'PENDING' ? '#8B1E1E' : '#FDFBF7',
                    color: activeOrder.status === 'PENDING' ? '#ffffff' : '#1A120B',
                    border: '1px solid #EADBCC', borderRadius: '8px', padding: '6px 8px',
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <ShoppingBag style={{ width: '12px', height: '12px' }} />
                  <span>1. Received</span>
                </button>

                <button
                  onClick={() => handleAdvanceStatus('PREPARING')}
                  style={{
                    background: activeOrder.status === 'PREPARING' ? '#8B1E1E' : '#FDFBF7',
                    color: activeOrder.status === 'PREPARING' ? '#ffffff' : '#1A120B',
                    border: '1px solid #EADBCC', borderRadius: '8px', padding: '6px 8px',
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <ChefHat style={{ width: '12px', height: '12px' }} />
                  <span>2. Kitchen Cook</span>
                </button>

                <button
                  onClick={() => handleAdvanceStatus('READY')}
                  style={{
                    background: activeOrder.status === 'READY' ? '#8B1E1E' : '#FDFBF7',
                    color: activeOrder.status === 'READY' ? '#ffffff' : '#1A120B',
                    border: '1px solid #EADBCC', borderRadius: '8px', padding: '6px 8px',
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                  <span>3. Packed Ready</span>
                </button>

                <button
                  onClick={() => handleAdvanceStatus('SHIPPED')}
                  style={{
                    background: (activeOrder.status === 'SHIPPED') ? '#E85D04' : '#FDFBF7',
                    color: (activeOrder.status === 'SHIPPED') ? '#ffffff' : '#1A120B',
                    border: '1px solid #EADBCC', borderRadius: '8px', padding: '6px 8px',
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <Bike style={{ width: '12px', height: '12px' }} />
                  <span>4. Rider Dispatch</span>
                </button>

                <button
                  onClick={() => handleAdvanceStatus('DELIVERED')}
                  style={{
                    background: (activeOrder.status === 'DELIVERED' || activeOrder.status === 'COMPLETED') ? '#15803D' : '#FDFBF7',
                    color: (activeOrder.status === 'DELIVERED' || activeOrder.status === 'COMPLETED') ? '#ffffff' : '#1A120B',
                    border: '1px solid #EADBCC', borderRadius: '8px', padding: '6px 8px',
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                  }}
                >
                  <ShieldCheck style={{ width: '12px', height: '12px' }} />
                  <span>5. Delivered</span>
                </button>
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
                  <strong style={{ fontSize: '13px', color: '#1A120B' }}>Live OpenStreetMap GPS Rider Route</strong>
                </div>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: '800', background: '#F0FDF4', padding: '3px 9px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  ● Real-Time Sync Active
                </span>
              </div>

              <LiveTrackingMap
                orderId={activeOrder.id}
                riderName="Zahid Rider (Gulberg Greens)"
                riderPhone="0332 5550192"
                customerSector="Executive Block (Gulberg Greens)"
                customerAddress={activeOrder.deliveryAddress || 'Executive Block, Gulberg Greens, Islamabad'}
                orderStatus={activeOrder.status}
                height="350px"
                showControls={true}
              />

              {/* Rider Contact Card */}
              <div style={{ padding: '14px 18px', background: '#FDFBF7', borderTop: '1px solid #EADBCC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
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
                      Zahid Khan · Designated Rider
                    </div>
                    <div style={{ fontSize: '11px', color: '#5C4B3C' }}>
                      Honda CD70 · Gulberg Greens Dedicated Fleet
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href="tel:03300500600"
                    style={{
                      background: '#8B1E1E', color: '#ffffff', textDecoration: 'none',
                      borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '800',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Phone style={{ width: '13px', height: '13px' }} />
                    <span>Call Helpline</span>
                  </a>

                  <a
                    href={`https://wa.me/923300500600?text=Hi%20Haandi!%20Inquiring%20about%20Order%20%23${activeOrder.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#25D366', color: '#ffffff', textDecoration: 'none',
                      borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '800',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <MessageSquare style={{ width: '13px', height: '13px' }} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Real Order Items & Receipt Breakdown */}
            <div style={{
              background: '#FFFFFF', borderRadius: '20px', padding: '20px',
              border: '1.5px solid #EADBCC', boxShadow: '0 6px 20px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#1A120B', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Real Order Items ({activeOrder.items.length})</span>
                <span style={{ fontSize: '11px', color: '#5C4B3C', fontWeight: '700' }}>
                  Payment: <span style={{ color: '#15803D', fontWeight: '800' }}>{activeOrder.paymentMethod} ({activeOrder.paymentStatus})</span>
                </span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px dashed #EADBCC', paddingBottom: '14px', marginBottom: '14px' }}>
                {activeOrder.items.map((item: any, i: number) => (
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#5C4B3C' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Item Subtotal:</span>
                  <span>Rs. {activeOrder.subtotal?.toLocaleString() || activeOrder.total?.toLocaleString()}</span>
                </div>
                {activeOrder.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D', fontWeight: '700' }}>
                    <span>Promo Discount:</span>
                    <span>- Rs. {activeOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {activeOrder.serviceCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Service Charges ({activeOrder.serviceChargePercent || 5}%):</span>
                    <span>Rs. {activeOrder.serviceCharge.toLocaleString()}</span>
                  </div>
                )}
                {activeOrder.tax > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Sales Tax / PRA ({activeOrder.taxRatePercent}%):</span>
                    <span>Rs. {activeOrder.tax.toLocaleString()}</span>
                  </div>
                )}
                {activeOrder.deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery (Gulberg Greens):</span>
                    <span>Rs. {activeOrder.deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900',
                  color: '#8B1E1E', borderTop: '1.5px solid #EADBCC', paddingTop: '8px', marginTop: '4px'
                }}>
                  <span>Total Amount Paid:</span>
                  <span>Rs. {activeOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

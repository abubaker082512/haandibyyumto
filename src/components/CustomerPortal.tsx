import React, { useState, useEffect, useRef } from 'react';
import { db } from '../store/mockDb';
import type { MenuItem, OrderType, OrderItem } from '../types';
import {
  MapPin, ShoppingBag, Calendar, CheckCircle,
  Trash, Plus, Minus, User, ChevronLeft, ChevronRight, X, Star, Navigation
} from 'lucide-react';
import { LiveTrackingMap } from './LiveTrackingMap';

const HERO_BANNERS = [
  {
    src: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1400&q=80',
    title: 'Authentic Clay Pot Handi',
    subtitle: 'Slow-cooked in traditional earthenware pots with rich desi spices',
  },
  {
    src: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1400&q=80',
    title: 'Sizzling Wok Karahi',
    subtitle: 'Prepared fresh in pure butter, black pepper & rich aromatic gravy',
  },
  {
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=80',
    title: 'Royal Charcoal BBQ & Platters',
    subtitle: 'Flame-grilled Seekh Kabab, Malai Boti & Shehnsha Platters',
  },
];

export const CustomerPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  // Form States
  const [selectedBranchId, setSelectedBranchId] = useState('br-isb');
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedItemForVariation, setSelectedItemForVariation] = useState<MenuItem | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Booking States
  const [isReservingTable, setIsReservingTable] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const getDefaultTime = () => {
    const d = new Date(); d.setHours(d.getHours() + 3);
    return `${String(d.getHours()).padStart(2,'0')}:${String(Math.floor(d.getMinutes()/15)*15).padStart(2,'0')}`;
  };
  const [bookingTime, setBookingTime] = useState(getDefaultTime());
  const [guestCount, setGuestCount] = useState(4);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [activeFloorId, setActiveFloorId] = useState('fl-isb-g');

  // Customer Details & 2.5 km Delivery Radius
  const GULBERG_SECTORS = [
    { name: 'Civic Center, Gulberg Greens', distanceKm: 0.2 },
    { name: 'Executive Block, Gulberg Greens', distanceKm: 0.4 },
    { name: 'Block A, Gulberg Greens', distanceKm: 0.9 },
    { name: 'Block B, Gulberg Greens', distanceKm: 1.4 },
    { name: 'Block C, Gulberg Greens', distanceKm: 1.9 },
    { name: 'Block D, Gulberg Greens', distanceKm: 2.3 },
    { name: 'Commercial Hub / Business Park', distanceKm: 0.8 },
    { name: 'Outside Gulberg Greens (> 2.5 km — Not Eligible)', distanceKm: 4.8 }
  ];
  const [selectedSector, setSelectedSector] = useState(GULBERG_SECTORS[0].name);
  const currentSector = GULBERG_SECTORS.find(s => s.name === selectedSector) || GULBERG_SECTORS[0];
  const isWithinDeliveryRadius = currentSector.distanceKm <= 2.5;

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [deliveryAddr, setDeliveryAddr] = useState('');
  // Advance payment only: CARD or ONLINE (No Cash / COD)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ONLINE'>('CARD');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState(false);

  // Popup Welcome & Order Mode
  const [showLandPopup, setShowLandPopup] = useState(true);
  const [tempOrderType, setTempOrderType] = useState<OrderType>('DELIVERY');

  // Hero carousel
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const renderSeatsForCustomer = (capacity: number) => {
    const seats = [];
    for (let i = 0; i < Math.min(capacity, 6); i++) {
      let style: React.CSSProperties = {};
      if (i === 0) style = { top: '-4px', left: '50%', transform: 'translateX(-50%)' };
      else if (i === 1) style = { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' };
      else if (i === 2) style = { left: '-4px', top: '50%', transform: 'translateY(-50%)' };
      else if (i === 3) style = { right: '-4px', top: '50%', transform: 'translateY(-50%)' };
      else if (i === 4) style = { top: '-4px', left: '20%' };
      else style = { top: '-4px', right: '20%' };
      seats.push(
        <span 
          key={i} 
          className="absolute w-1.5 h-1.5 rounded-full bg-zinc-600 border border-zinc-500 shadow-sm z-10" 
          style={style} 
        />
      );
    }
    return seats;
  };
  const startHeroTimer = () => {
    if (heroTimer.current) clearInterval(heroTimer.current);
    heroTimer.current = setInterval(() => setHeroIdx(p => (p + 1) % HERO_BANNERS.length), 4500);
  };
  useEffect(() => { startHeroTimer(); return () => { if (heroTimer.current) clearInterval(heroTimer.current); }; }, []);

  // Cart open state
  const [cartOpen, setCartOpen] = useState(false);

  const branches = dbState.getBranches();
  const branch = branches.find(b => b.id === selectedBranchId) || branches[0] || {
    id: 'br-isb',
    name: 'Haandi by Yumto - Gulberg Greens, Islamabad',
    city: 'Islamabad',
    address: 'Gulberg Greens, Civic Center, Executive Block, Islamabad',
    phone: '0330 0500600',
    premiumBookingFee: 1500,
    activeSurchargeToggle: true
  };
  const floors = dbState.getFloors('br-isb');
  const tables = dbState.getTables('br-isb', activeFloorId);
  const allMenuItems = dbState.getMenu('br-isb');

  useEffect(() => {
    if (floors.length > 0 && !floors.some(f => f.id === activeFloorId)) {
      setActiveFloorId(floors[0].id);
      setSelectedTableId(null);
    }
  }, [floors, activeFloorId]);

  const surcharge = (() => {
    if (!branch?.activeSurchargeToggle) return { isPremium: false, fee: 0 };
    try {
      const res = new Date(`${bookingDate}T${bookingTime}:00`);
      const diff = (res.getTime() - Date.now()) / 3600000;
      if (diff >= 0 && diff < 2) return { isPremium: true, fee: branch.premiumBookingFee };
    } catch (_) {}
    return { isPremium: false, fee: 0 };
  })();

  // Derive unique categories from all available menu items
  const categoriesFromMenu = ['All', ...Array.from(new Set(allMenuItems.map(i => i.category)))];

  // Cart operations
  const addToCart = (item: MenuItem, variation?: { name: string; price: number }) => {
    setCart(prev => {
      const varName = variation?.name;
      const finalPrice = variation ? variation.price : item.price;
      const finalName = variation ? `${item.name} - ${variation.name}` : item.name;
      const existing = prev.find(i => i.menuItemId === item.id && i.variation === varName);
      if (existing) {
        showToast(`Updated ${finalName} quantity to ${existing.quantity + 1}`, 'success');
        return prev.map(i => (i.menuItemId === item.id && i.variation === varName) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      showToast(`Added ${finalName} to cart`, 'success');
      return [...prev, { menuItemId: item.id, name: finalName, price: finalPrice, quantity: 1, variation: varName }];
    });
    setSelectedItemForVariation(null);
  };

  const handleAddToCartClick = (item: MenuItem) => {
    if (item.variations && item.variations.length > 0) setSelectedItemForVariation(item);
    else addToCart(item);
  };

  const removeFromCart = (menuItemId: string, variation?: string) => {
    setCart(prev => {
      const target = prev.find(i => i.menuItemId === menuItemId && i.variation === variation);
      if (target) showToast(`Removed ${target.name} from cart`, 'info');
      return prev.filter(i => !(i.menuItemId === menuItemId && i.variation === variation));
    });
  };

  const updateQty = (menuItemId: string, variation: string | undefined, amount: number) => {
    setCart(prev => prev.map(item => {
      if (item.menuItemId === menuItemId && item.variation === variation) {
        const newQty = item.quantity + amount;
        if (newQty <= 0) {
          showToast(`Removed ${item.name} from cart`, 'info');
          return null!;
        }
        showToast(`Updated ${item.name} quantity to ${newQty}`, 'success');
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  // Pricing: FBR Digital Tax is 5% for Card & Online Prepayments
  const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% for digital card/online advance payment
  const deliveryFee = orderType === 'DELIVERY' ? 150 : 0;
  const premiumReservationFee = isReservingTable ? surcharge.fee : 0;
  const grandTotal = subtotal + tax + deliveryFee + premiumReservationFee;
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);

  // Checkout
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 && !isReservingTable) {
      showToast('Please add items to your cart first.', 'error');
      return;
    }
    if (isReservingTable && !selectedTableId) {
      showToast('Please select a table on the floor plan.', 'error');
      return;
    }
    if (!custName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!custPhone.trim()) {
      showToast('Please enter your phone number.', 'error');
      return;
    }
    if (orderType === 'DELIVERY') {
      if (!deliveryAddr.trim()) {
        showToast('Please enter your street / house address.', 'error');
        return;
      }
      if (!isWithinDeliveryRadius) {
        showToast('⚠️ Delivery is only available within 2.5 km of Gulberg Greens Civic Center.', 'error');
        return;
      }
    }

    let reservationId;
    if (isReservingTable && selectedTableId) {
      const startDT = new Date(`${bookingDate}T${bookingTime}:00`);
      const endDT = new Date(startDT.getTime() + 2 * 3600000);
      const r = dbState.addReservation({
        tableId: selectedTableId, branchId: 'br-isb', userId: 'u-cust',
        userName: custName || 'Guest', userPhone: custPhone || '0300-0000000',
        startTime: startDT.toISOString(), endTime: endDT.toISOString(), guestCount,
        type: surcharge.isPremium ? 'PRIOR_2H_PREMIUM' : 'STANDARD', premiumFee: surcharge.fee, status: 'CONFIRMED'
      });
      reservationId = r.id;
    }

    const fullDeliveryAddress = orderType === 'DELIVERY' 
      ? `${deliveryAddr.trim()}, ${selectedSector}, Islamabad (${currentSector.distanceKm} km from Civic Center)`
      : undefined;

    const created = dbState.addOrder({
      branchId: 'br-isb', userId: 'u-cust', userName: custName || 'Guest', userPhone: custPhone || '0300-0000000',
      orderType: isReservingTable ? 'DINE_IN' : orderType, tableId: selectedTableId || undefined, reservationId,
      status: 'PENDING',
      paymentStatus: 'PAID', // Advance payment verified via Card or Online transfer
      paymentMethod,
      items: cart.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, variation: i.variation })),
      subtotal, discountAmount: 0, discountPercent: 0, tax, deliveryFee, premiumReservationFee, total: grandTotal,
      deliveryAddress: fullDeliveryAddress,
    });

    setPlacedOrderId(created.id);
    setIsOrderPlaced(true);
    setCart([]);
    setSelectedTableId(null);
    setIsReservingTable(false);
    setCartOpen(false);
    showToast('Advance Payment Received & Order Confirmed!', 'success');
  };

  const handlePopupSelect = () => {
    setSelectedBranchId('br-isb');
    setOrderType(tempOrderType);
    if (tempOrderType === 'DINE_IN') setIsReservingTable(true);
    else { setIsReservingTable(false); setSelectedTableId(null); }
    setShowLandPopup(false);
  };

  const statusSteps = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
  const getStepState = (step: string, currentStatus: string) => {
    const si = statusSteps.indexOf(step);
    const ci = statusSteps.indexOf(currentStatus);
    if (si < ci) return 'done';
    if (si === ci) return 'active';
    return 'idle';
  };

  // Filtered items
  const filteredItems = activeCategory === 'All' ? allMenuItems : allMenuItems.filter(i => i.category === activeCategory);
  const groupedByCategory = activeCategory === 'All'
    ? categoriesFromMenu.filter(c => c !== 'All').map(cat => ({ cat, items: allMenuItems.filter(i => i.category === cat) })).filter(g => g.items.length > 0)
    : [{ cat: activeCategory, items: filteredItems }];

  return (
    <>
      {/* ============================
          POPUP MODAL
          ============================ */}
      {showLandPopup && (
        <div className="modal-backdrop">
          <div className="modal-box animate-slideup">
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)' }}>
              <img src="/logo.png" alt="Haandi by Yumto" className="modal-logo" style={{ borderRadius: '12px', background: '#fff', padding: '2px', objectFit: 'contain' }} />
              <div>
                <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: '800', fontFamily: 'Playfair Display, serif' }}>Haandi by Yumto</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>Authentic Desi, Karahi, Handi & BBQ</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#E85D04', fontSize: '13px', fontWeight: '700' }}>
                <Star style={{ width: '14px', height: '14px', fill: '#E85D04' }} /> 4.9 &nbsp;
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '400' }}>(2.4k Reviews)</span>
              </div>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                How would you like to order?
              </p>
              <div className="order-type-grid">
                {(['DELIVERY', 'PICK_UP', 'DINE_IN'] as OrderType[]).map(type => (
                  <button key={type} type="button" onClick={() => setTempOrderType(type)}
                    className={`order-type-btn ${tempOrderType === type ? 'active' : ''}`}>
                    {type === 'PICK_UP' ? 'Pickup' : type === 'DINE_IN' ? 'Dine In' : 'Delivery'}
                  </button>
                ))}
              </div>

              {/* Single Location Details */}
              <div style={{
                background: '#FBF8F3', border: '1px solid rgba(232,93,4,0.3)', borderRadius: '12px',
                padding: '14px', marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <MapPin style={{ width: '16px', height: '16px', color: '#8B1E1E' }} />
                  <span style={{ fontWeight: '800', fontSize: '13px', color: '#1A120B' }}>
                    Gulberg Greens, Civic Center, Islamabad
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.5 }}>
                  Executive Block, Gulberg Greens · 0330 0500600
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', fontWeight: '700', color: '#15803d', background: '#dcfce7',
                    padding: '6px 8px', borderRadius: '6px'
                  }}>
                    <span>📍</span> Delivery exclusively within 2.5 km radius of Civic Center
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '11px', fontWeight: '700', color: '#854d0e', background: '#fef9c3',
                    padding: '6px 8px', borderRadius: '6px'
                  }}>
                    <span>💳</span> Advance Prepayment Required (Card & Online — No COD)
                  </div>
                </div>
              </div>

              <button className="modal-confirm-btn" onClick={handlePopupSelect}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          NAVBAR
          ============================ */}
      <nav className="yumto-navbar">
        <div className="yumto-navbar-inner">
          {/* Left: location */}
          <button className="nav-location-pill" onClick={() => setShowLandPopup(true)}>
            <MapPin style={{ width: '13px', height: '13px' }} />
            <span>{branch?.city || 'Select City'}</span>
            <span style={{ color: '#9ca3af', fontSize: '10px' }}>▼</span>
          </button>

          {/* Center: Logo */}
          <div style={{ flex: '0 0 auto' }}>
            <img src="/logo.png" alt="Haandi by Yumto" className="yumto-navbar-logo" style={{ borderRadius: '10px', height: '46px', width: '46px', objectFit: 'contain', background: '#fff', padding: '2px', border: '2px solid rgba(232,93,4,0.5)' }} />
          </div>

          {/* Right: track & cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowLiveTrackingModal(true)}
              style={{
                background: 'rgba(232,93,4,0.15)', border: '1px solid #E85D04',
                color: '#E85D04', borderRadius: '8px', padding: '6px 10px',
                fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
              title="Track live delivery on OpenStreetMap"
            >
              <Navigation style={{ width: '13px', height: '13px' }} />
              <span>Live Map</span>
            </button>
            <button className="nav-cart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingBag style={{ width: '16px', height: '16px' }} />
              <span>Cart</span>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </nav>

      {/* ============================
          HERO BANNER CAROUSEL
          ============================ */}
      <div className="hero-wrap">
        <div className="hero-slide">
          <img
            key={heroIdx}
            src={HERO_BANNERS[heroIdx].src}
            alt={HERO_BANNERS[heroIdx].title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=1400&q=80'; }}
          />
          <div className="hero-overlay" />
          <div className="hero-content animate-fade">
            <p style={{ fontSize: '12px', color: '#F4C430', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
              ★ Authentic Arabic Cuisine ★
            </p>
            <h2>{HERO_BANNERS[heroIdx].title}</h2>
            <p>{HERO_BANNERS[heroIdx].subtitle}</p>
            <button className="hero-order-btn" onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Order Now
            </button>
          </div>

          {/* Prev/Next arrows */}
          <button onClick={() => { setHeroIdx(p => (p - 1 + HERO_BANNERS.length) % HERO_BANNERS.length); startHeroTimer(); }}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white', transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <button onClick={() => { setHeroIdx(p => (p + 1) % HERO_BANNERS.length); startHeroTimer(); }}
            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', color: 'white', transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <ChevronRight style={{ width: '20px', height: '20px' }} />
          </button>

          <div className="hero-dots">
            {HERO_BANNERS.map((_, i) => (
              <button key={i} className={`hero-dot ${i === heroIdx ? 'active' : ''}`} onClick={() => { setHeroIdx(i); startHeroTimer(); }} />
            ))}
          </div>
        </div>
      </div>

      {/* ============================
          CATEGORY NAV TABS
          ============================ */}
      <div className="cat-nav-wrap" id="menu-section">
        <div className="cat-nav-inner">
          {categoriesFromMenu.map(cat => (
            <button key={cat} className={`cat-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ============================
          MAIN PAGE CONTENT
          ============================ */}
      <div className="page-wrap">
        <div className="page-cols">
          {/* LEFT: Menu Sections */}
          <div>
            {/* Branch/Order type strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '16px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                <MapPin style={{ width: '14px', height: '14px', color: '#F4C430' }} />
                <span style={{ fontWeight: '600', color: '#111827' }}>{branch?.name || 'Select Branch'}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                {(['DELIVERY', 'PICK_UP', 'DINE_IN'] as OrderType[]).map(type => (
                  <button key={type} type="button" onClick={() => {
                    setOrderType(type);
                    if (type === 'DINE_IN') setIsReservingTable(true);
                    else { setIsReservingTable(false); setSelectedTableId(null); }
                  }}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                      cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em', border: '2px solid',
                      background: orderType === type ? '#0d0d0d' : '#f9fafb',
                      borderColor: orderType === type ? '#0d0d0d' : '#e5e7eb',
                      color: orderType === type ? 'white' : '#6b7280',
                      transition: 'all 0.2s'
                    }}>
                    {type === 'PICK_UP' ? 'Pickup' : type === 'DINE_IN' ? 'Dine-In' : 'Delivery'}
                  </button>
                ))}
              </div>
            </div>

            {/* Order placed confirmation banner */}
            {isOrderPlaced && placedOrderId && (() => {
              const order = dbState.getOrders().find(o => o.id === placedOrderId);
              if (!order) return null;
              return (
                <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '16px', padding: '16px', marginBottom: '20px' }} className="animate-fade">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <CheckCircle style={{ width: '22px', height: '22px', color: '#16a34a', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '16px', color: '#15803d' }}>Order Placed Successfully!</div>
                      <div style={{ fontSize: '12px', color: '#4b5563' }}>Ref: <strong>{order.id.toUpperCase()}</strong></div>
                    </div>
                    <button onClick={() => setIsOrderPlaced(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                      <X style={{ width: '18px', height: '18px' }} />
                    </button>
                  </div>
                  {/* Status tracker */}
                  <div className="tracker-wrap">
                    {statusSteps.slice(0, -1).map((step, i) => {
                      const state = getStepState(step, order.status);
                      return (
                        <div key={step} className="tracker-step">
                          <div className={`tracker-dot ${state}`}>{i + 1}</div>
                          <div className={`tracker-label ${state}`}>{step.charAt(0) + step.slice(1).toLowerCase()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setIsOrderPlaced(false)} style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', background: 'none', border: '1px solid #d1d5db', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', display: 'block' }}>
                    Place Another Order
                  </button>
                </div>
              );
            })()}

            {/* Table Reservation Section */}
            {(isReservingTable || orderType === 'DINE_IN') && (
              <div style={{ background: '#fff', border: '2px solid #D4A017', borderRadius: '16px', marginBottom: '24px', overflow: 'hidden' }}>
                <div style={{ background: '#F4C430', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '16px', color: '#0d0d0d', fontFamily: 'Playfair Display, serif' }}>
                    <Calendar style={{ width: '18px', height: '18px' }} /> Reserve a Table
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setIsReservingTable(true)}
                      style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: isReservingTable ? '#0d0d0d' : 'rgba(255,255,255,0.6)', color: isReservingTable ? 'white' : '#374151', border: 'none' }}>
                      Book Table
                    </button>
                    <button onClick={() => { setIsReservingTable(false); setSelectedTableId(null); }}
                      style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', background: !isReservingTable ? '#0d0d0d' : 'rgba(255,255,255,0.6)', color: !isReservingTable ? 'white' : '#374151', border: 'none' }}>
                      Staff Assign
                    </button>
                  </div>
                </div>

                {isReservingTable ? (
                  <div style={{ padding: '16px' }}>
                    {/* Date/Time/Guests inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label className="form-label">Date</label>
                        <input type="date" value={bookingDate} min={new Date().toISOString().split('T')[0]} onChange={e => setBookingDate(e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Time</label>
                        <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label className="form-label">Guests</label>
                        <input type="number" min={1} max={20} value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} className="form-input" />
                      </div>
                    </div>

                    {/* Floor selector */}
                    <div style={{ marginBottom: '12px' }}>
                      <label className="form-label">Floor</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {floors.map(fl => (
                          <button key={fl.id} onClick={() => { setActiveFloorId(fl.id); setSelectedTableId(null); }}
                            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: activeFloorId === fl.id ? '#0d0d0d' : '#f3f4f6', color: activeFloorId === fl.id ? 'white' : '#374151', border: '1px solid', borderColor: activeFloorId === fl.id ? '#0d0d0d' : '#e5e7eb', transition: 'all 0.2s' }}>
                            {fl.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Floor plan */}
                    <div className="floorplan-container" style={{ aspectRatio: '2/1' }}>
                      {tables.map(tb => (
                        <div key={tb.id}
                          className={`map-table-element ${
                            tb.type === 'VIP_CABIN' 
                              ? 'type-cabin' 
                              : tb.type === 'MAJLIS_FLOOR' 
                                ? 'type-majlis' 
                                : 'type-standard'
                          } ${selectedTableId === tb.id ? 'status-selected' : tb.status === 'AVAILABLE' ? 'status-available' : tb.status === 'RESERVED' ? 'status-reserved' : tb.status === 'OCCUPIED' ? 'status-occupied' : 'status-blocked'}`}
                          style={{ left: `${tb.x}%`, top: `${tb.y}%`, width: `${tb.width}%`, height: `${tb.height}%` }}
                          onClick={() => tb.status === 'AVAILABLE' && setSelectedTableId(tb.id === selectedTableId ? null : tb.id)}
                        >
                          {/* CAD Seats Chairs around table */}
                          {renderSeatsForCustomer(tb.capacity)}
                          
                          <span style={{ fontSize: '10px', fontWeight: '800', zIndex: 10 }}>{tb.tableNumber}</span>
                          <span style={{ fontSize: '8px', opacity: 0.75, zIndex: 10 }}>👥{tb.capacity}</span>
                        </div>
                      ))}
                      <div className="absolute bottom-2 left-2 right-2 bg-black/85 p-1.5 rounded-lg border border-border-color flex justify-between text-[9px] items-center">
                        <div className="flex gap-2">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-alpha border border-emerald"></span> Available</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-alpha border border-amber"></span> Reserved</span>
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-ruby-alpha border border-ruby"></span> Occupied</span>
                        </div>
                        {selectedTableId && <span style={{ marginLeft: 'auto', fontWeight: '700', color: '#F4C430' }}>✓ Table {tables.find(t => t.id === selectedTableId)?.tableNumber} selected</span>}
                      </div>
                    </div>

                    {surcharge.isPremium && (
                      <div style={{ marginTop: '10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e', fontWeight: '600' }}>
                        ⚡ Peak-Hour Booking Fee: <strong>Rs. {surcharge.fee}</strong> applies for reservations within 2 hours.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '16px', fontSize: '13px', color: '#4b5563', textAlign: 'center' }}>
                    Staff will assign a table for you upon arrival. No reservation fee applies.
                  </div>
                )}
              </div>
            )}

            {/* ============================
                MENU — Yellow banners + item rows
                ============================ */}
            <div>
              {groupedByCategory.map(({ cat, items }) => (
                <div key={cat} className="menu-section animate-fade">
                  {/* YELLOW CATEGORY BANNER */}
                  <div className="cat-banner">
                    <div className="cat-banner-left">
                      <div className="cat-banner-title">{cat}</div>
                      <div className="cat-banner-count">{items.length} {items.length === 1 ? 'item' : 'items'}</div>
                    </div>
                    <img
                      src={items.find(i => i.imageUrl)?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                      alt={cat}
                      className="cat-banner-img"
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; e.currentTarget.onerror = null; }}
                    />
                  </div>

                  {/* ITEM LIST ROWS */}
                  <div className="item-list">
                    {items.map(item => (
                      <div key={item.id} className="item-row">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="item-img"
                          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; e.currentTarget.onerror = null; }}
                        />
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          {item.description && <div className="item-desc">{item.description}</div>}
                        </div>
                        <div className="item-right">
                          <div className="item-price">Rs. {item.price.toLocaleString()}</div>
                          <button className="item-add-btn" onClick={() => handleAddToCartClick(item)}>
                            <Plus style={{ width: '13px', height: '13px' }} /> Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Cart Panel (desktop) */}
          <div style={{ display: 'none' }} className="lg-cart-panel">
            <CartContent
              cart={cart} menuItems={allMenuItems} subtotal={subtotal} tax={tax}
              deliveryFee={deliveryFee} premiumReservationFee={premiumReservationFee} grandTotal={grandTotal}
              orderType={orderType} isReservingTable={isReservingTable} selectedTableId={selectedTableId}
              tables={dbState.getTables()} bookingDate={bookingDate} bookingTime={bookingTime} guestCount={guestCount}
              surcharge={surcharge} custName={custName} setCustName={setCustName}
              custPhone={custPhone} setCustPhone={setCustPhone} deliveryAddr={deliveryAddr}
              setDeliveryAddr={setDeliveryAddr}
              selectedSector={selectedSector} setSelectedSector={setSelectedSector}
              currentSector={currentSector} isWithinDeliveryRadius={isWithinDeliveryRadius}
              gulbergSectors={GULBERG_SECTORS}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              updateQty={updateQty} removeFromCart={removeFromCart} handleCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* ============================
          CART DRAWER (mobile + desktop overlay)
          ============================ */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setCartOpen(false)} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '100%', background: 'white', overflowY: 'auto', boxShadow: '-4px 0 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }} className="animate-slideup">
            <div style={{ background: '#F4C430', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '2px solid #D4A017', flexShrink: 0 }}>
              <ShoppingBag style={{ width: '20px', height: '20px', color: '#0d0d0d' }} />
              <span style={{ fontWeight: '800', fontSize: '18px', color: '#0d0d0d', fontFamily: 'Playfair Display, serif', flex: 1 }}>Your Order</span>
              <button onClick={() => setCartOpen(false)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X style={{ width: '18px', height: '18px', color: '#0d0d0d' }} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              <CartContent
                cart={cart} menuItems={allMenuItems} subtotal={subtotal} tax={tax}
                deliveryFee={deliveryFee} premiumReservationFee={premiumReservationFee} grandTotal={grandTotal}
                orderType={orderType} isReservingTable={isReservingTable} selectedTableId={selectedTableId}
                tables={dbState.getTables()} bookingDate={bookingDate} bookingTime={bookingTime} guestCount={guestCount}
                surcharge={surcharge} custName={custName} setCustName={setCustName}
                custPhone={custPhone} setCustPhone={setCustPhone} deliveryAddr={deliveryAddr}
                setDeliveryAddr={setDeliveryAddr}
                selectedSector={selectedSector} setSelectedSector={setSelectedSector}
                currentSector={currentSector} isWithinDeliveryRadius={isWithinDeliveryRadius}
                gulbergSectors={GULBERG_SECTORS}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                updateQty={updateQty} removeFromCart={removeFromCart} handleCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================
          VARIATION PICKER MODAL
          ============================ */}
      {selectedItemForVariation && selectedItemForVariation.variations && (
        <div className="modal-backdrop">
          <div className="modal-box animate-slideup" style={{ maxWidth: '380px' }}>
            <div style={{ background: '#F4C430', padding: '20px', borderBottom: '2px solid #D4A017', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={selectedItemForVariation.imageUrl} alt={selectedItemForVariation.name}
                style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)', flexShrink: 0 }}
                onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }} />
              <div>
                <div style={{ fontWeight: '800', fontSize: '16px', color: '#0d0d0d', fontFamily: 'Playfair Display, serif' }}>{selectedItemForVariation.name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.55)', marginTop: '2px' }}>Choose your portion size</div>
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedItemForVariation.variations.map((v, i) => (
                <button key={i} className="var-option-btn" onClick={() => addToCart(selectedItemForVariation, v)}>
                  <span>{v.name}</span>
                  <span style={{ fontWeight: '800', color: '#0d0d0d' }}>Rs. {v.price.toLocaleString()}</span>
                </button>
              ))}
              <button onClick={() => setSelectedItemForVariation(null)}
                style={{ marginTop: '4px', padding: '10px', background: 'transparent', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          LIVE GPS TRACKING MODAL (OPENSTREETMAP)
          ============================ */}
      {(isOrderPlaced || showLiveTrackingModal) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', maxWidth: '580px', width: '100%',
            overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.45)', border: '1.5px solid #EADBCC'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
              padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛵 Live Delivery Route Tracker</span>
                  <span style={{ fontSize: '10px', background: '#E85D04', padding: '2px 6px', borderRadius: '6px' }}>OSM GPS</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                  {placedOrderId ? `Order #${placedOrderId.slice(-6).toUpperCase()}` : 'Live Delivery Route'} · Gulberg Greens, Islamabad
                </div>
              </div>
              <button
                onClick={() => { setIsOrderPlaced(false); setShowLiveTrackingModal(false); }}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <LiveTrackingMap
                orderId={placedOrderId || 'ORD-ISB-2026'}
                customerSector={selectedSector}
                customerAddress={deliveryAddr ? `${deliveryAddr}, ${selectedSector}, Islamabad` : `${selectedSector}, Islamabad`}
                height="320px"
                showControls={true}
              />
            </div>

            <div style={{ padding: '12px 20px', background: '#FBF8F3', borderTop: '1px solid #EADBCC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                📍 Gulberg Greens Civic Center ➔ {selectedSector}
              </span>
              <button
                onClick={() => { setIsOrderPlaced(false); setShowLiveTrackingModal(false); }}
                style={{
                  background: '#8B1E1E', color: '#ffffff', border: 'none', borderRadius: '8px',
                  padding: '8px 18px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          TOAST NOTIFICATION
          ============================ */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          background: toast.type === 'error' ? '#dc2626' : toast.type === 'warning' ? '#f59e0b' : toast.type === 'info' ? '#2563eb' : '#16a34a',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toast.type === 'success' && <span style={{ fontSize: '16px' }}>✓</span>}
          {toast.type === 'error' && <span style={{ fontSize: '16px' }}>⚠</span>}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
};

// ============================================================
// CART CONTENT — Reusable cart component
// ============================================================
interface CartContentProps {
  cart: OrderItem[];
  menuItems: MenuItem[];
  subtotal: number; tax: number; deliveryFee: number; premiumReservationFee: number; grandTotal: number;
  orderType: OrderType; isReservingTable: boolean; selectedTableId: string | null;
  tables: any[]; bookingDate: string; bookingTime: string; guestCount: number;
  surcharge: { isPremium: boolean; fee: number };
  custName: string; setCustName: (v: string) => void;
  custPhone: string; setCustPhone: (v: string) => void;
  deliveryAddr: string; setDeliveryAddr: (v: string) => void;
  selectedSector: string; setSelectedSector: (v: string) => void;
  currentSector: { name: string; distanceKm: number };
  isWithinDeliveryRadius: boolean;
  gulbergSectors: { name: string; distanceKm: number }[];
  paymentMethod: 'CARD' | 'ONLINE'; setPaymentMethod: (v: 'CARD' | 'ONLINE') => void;
  updateQty: (id: string, variation: string | undefined, amount: number) => void;
  removeFromCart: (id: string, variation?: string) => void;
  handleCheckout: (e: React.FormEvent) => void;
}

const CartContent: React.FC<CartContentProps> = ({
  cart, menuItems, subtotal, tax, deliveryFee, premiumReservationFee, grandTotal,
  orderType, isReservingTable, selectedTableId, tables, bookingDate, bookingTime, guestCount, surcharge,
  custName, setCustName, custPhone, setCustPhone, deliveryAddr, setDeliveryAddr,
  selectedSector, setSelectedSector, currentSector, isWithinDeliveryRadius, gulbergSectors,
  paymentMethod, setPaymentMethod, updateQty, removeFromCart, handleCheckout
}) => {
  const isEmpty = cart.length === 0 && !isReservingTable;
  const isDeliveryBlocked = orderType === 'DELIVERY' && !isWithinDeliveryRadius;

  return (
    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Cart items */}
      {cart.length === 0 && !isReservingTable ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
          <ShoppingBag style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Your cart is empty</div>
          <div style={{ fontSize: '12px' }}>Add dishes from the Haandi menu to get started</div>
        </div>
      ) : (
        <>
          {cart.map((item, idx) => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
            return (
              <div key={`${item.menuItemId}-${item.variation || ''}-${idx}`} className="cart-item-row">
                {menuItem && (
                  <img src={menuItem.imageUrl} alt={item.name} className="cart-item-img"
                    onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; e.currentTarget.onerror = null; }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', lineHeight: '1.3' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Rs. {item.price.toLocaleString()} each</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                  <div className="cart-qty-ctrl">
                    <button type="button" className="cart-qty-btn" onClick={() => updateQty(item.menuItemId, item.variation, -1)}><Minus style={{ width: '10px', height: '10px' }} /></button>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#111827', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button type="button" className="cart-qty-btn" onClick={() => updateQty(item.menuItemId, item.variation, 1)}><Plus style={{ width: '10px', height: '10px' }} /></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#1A120B' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    <button type="button" onClick={() => removeFromCart(item.menuItemId, item.variation)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px', display: 'flex' }}>
                      <Trash style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Reservation summary */}
          {isReservingTable && selectedTableId && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#92400e' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar style={{ width: '13px', height: '13px' }} /> Reservation Summary
              </div>
              <div>Table: <strong>{tables.find(t => t.id === selectedTableId)?.tableNumber}</strong></div>
              <div>Date & Time: <strong>{bookingDate} @ {bookingTime}</strong></div>
              <div>Guests: <strong>{guestCount}</strong></div>
            </div>
          )}

          {/* Price breakdown */}
          <div style={{ borderTop: '2px solid rgba(232,93,4,0.3)', paddingTop: '14px' }}>
            <div className="price-row"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            <div className="price-row" style={{ color: '#15803d' }}>
              <span>Sales Tax (5% FBR Digital)</span>
              <span>Rs. {tax.toLocaleString()}</span>
            </div>
            {orderType === 'DELIVERY' && <div className="price-row"><span>Delivery Fee</span><span>Rs. {deliveryFee}</span></div>}
            {isReservingTable && surcharge.isPremium && <div className="price-row" style={{ color: '#92400e' }}><span>Peak Booking Fee</span><span>Rs. {premiumReservationFee}</span></div>}
            <div className="price-row total" style={{ color: '#8B1E1E' }}><span>Total Payable</span><span>Rs. {grandTotal.toLocaleString()}</span></div>
          </div>

          {/* Customer form */}
          <div>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              <User style={{ width: '13px', height: '13px', display: 'inline', marginRight: '5px' }} />Customer & Address
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input className="form-input" placeholder="Full Name *" value={custName} onChange={e => setCustName(e.target.value)} />
              <input className="form-input" placeholder="Phone Number *" value={custPhone} onChange={e => setCustPhone(e.target.value)} />
              
              {/* Delivery Zone Selection (2.5 km limit) */}
              {orderType === 'DELIVERY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#4b5563', textTransform: 'uppercase' }}>
                    Gulberg Greens Sector / Block * (Max 2.5 km)
                  </label>
                  <select
                    className="form-input"
                    value={selectedSector}
                    onChange={e => setSelectedSector(e.target.value)}
                  >
                    {gulbergSectors.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.distanceKm} km) {s.distanceKm > 2.5 ? '— ❌ Exceeds 2.5 km' : '— 🟢 Eligible'}
                      </option>
                    ))}
                  </select>

                  {!isWithinDeliveryRadius ? (
                    <div style={{
                      background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px',
                      padding: '8px 12px', fontSize: '11px', color: '#b91c1c', fontWeight: '600'
                    }}>
                      ⚠️ Delivery is strictly limited to within 2.5 km of Gulberg Greens Civic Center. Please choose an eligible address or switch to Pickup / Dine-In.
                    </div>
                  ) : (
                    <div style={{
                      background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px',
                      padding: '6px 10px', fontSize: '11px', color: '#15803d', fontWeight: '600'
                    }}>
                      🟢 Delivery address is {currentSector.distanceKm} km away (Within 2.5 km Zone)
                    </div>
                  )}

                  <textarea
                    className="form-input"
                    placeholder="House #, Street / Plaza & Landmark *"
                    value={deliveryAddr}
                    onChange={e => setDeliveryAddr(e.target.value)}
                    rows={2}
                    style={{ resize: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advance Payment Method (No Cash / COD) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: '700', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Advance Prepayment
              </div>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#8B1E1E', background: '#fee2e2', padding: '1px 6px', borderRadius: '6px' }}>
                No COD
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                style={{
                  padding: '10px 8px', border: '2px solid', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  background: paymentMethod === 'CARD' ? '#8B1E1E' : '#f9fafb',
                  borderColor: paymentMethod === 'CARD' ? '#8B1E1E' : '#e5e7eb',
                  color: paymentMethod === 'CARD' ? '#ffffff' : '#374151'
                }}
              >
                💳 Debit / Credit Card
                <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>5% Sales Tax</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                style={{
                  padding: '10px 8px', border: '2px solid', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  background: paymentMethod === 'ONLINE' ? '#8B1E1E' : '#f9fafb',
                  borderColor: paymentMethod === 'ONLINE' ? '#8B1E1E' : '#e5e7eb',
                  color: paymentMethod === 'ONLINE' ? '#ffffff' : '#374151'
                }}
              >
                📱 Raast / Transfer
                <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '2px' }}>5% Sales Tax</div>
              </button>
            </div>

            <div style={{ marginTop: '8px', fontSize: '10px', color: '#6b7280', lineHeight: 1.4 }}>
              🔒 Prepayment is mandatory for all delivery orders and table bookings. Cash on delivery (COD) is not accepted.
            </div>
          </div>

          <button
            type="submit"
            disabled={isEmpty || isDeliveryBlocked}
            className="checkout-btn"
            style={{
              background: isDeliveryBlocked ? '#9ca3af' : 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
              cursor: isDeliveryBlocked ? 'not-allowed' : 'pointer'
            }}
          >
            {isDeliveryBlocked
              ? 'Delivery Not Available (> 2.5 km)'
              : isReservingTable
                ? `Prepay Booking & Order — Rs. ${grandTotal.toLocaleString()}`
                : `Pay & Place Order — Rs. ${grandTotal.toLocaleString()}`}
          </button>
        </>
      )}
    </form>
  );
};

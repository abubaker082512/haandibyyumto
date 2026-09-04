import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import type { MenuItem, OrderType, OrderItem, CustomerAddress } from '../types';
import {
  MapPin, ShoppingBag,
  Trash2, Plus, Minus, X, Navigation,
  Sparkles, ArrowRight, CheckCircle2, User
} from 'lucide-react';
import { LiveTrackingMap } from './LiveTrackingMap';

export const CustomerPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  // Mode & Category States
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedItemForVariation, setSelectedItemForVariation] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

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
    return `${String(d.getHours()).padStart(2, '0')}:${String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, '0')}`;
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

  const { profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [custName, setCustName] = useState(profile?.name || '');
  const [custPhone, setCustPhone] = useState(profile?.phone || '');
  const [deliveryAddr, setDeliveryAddr] = useState('');

  // Customer Saved Addresses
  const customerUser = profile ? dbState.getUsers().find(u => u.id === profile.uid || u.role === 'CUSTOMER') : null;
  const savedAddresses: CustomerAddress[] = customerUser?.addresses || [
    { id: 'addr-1', label: 'Executive Residence', sector: 'Executive Block', address: 'House 14, Street 7, Executive Block, Gulberg Greens, Islamabad', isDefault: true },
    { id: 'addr-2', label: 'Civic Office', sector: 'Civic Center', address: 'Suite 402, Business Center, Civic Center, Gulberg Greens, Islamabad' },
    { id: 'addr-3', label: 'Farmhouse Villa', sector: 'Sector 2 (Farmhouses)', address: 'Farmhouse 88, Main Boulevard, Sector 2, Gulberg Greens' }
  ];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses[0]?.id || 'addr-1');
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');

  // Sync profile data
  useEffect(() => {
    if (profile) {
      if (!custName) setCustName(profile.name);
      if (!custPhone && profile.phone) setCustPhone(profile.phone);
    }
  }, [profile]);

  // Sync delivery address when selected address changes
  useEffect(() => {
    if (orderType === 'DELIVERY') {
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (activeAddr) {
        setDeliveryAddr(activeAddr.address);
      }
    }
  }, [selectedAddressId, orderType]);

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ONLINE'>('CARD');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showDiningModeModal, setShowDiningModeModal] = useState(false);
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
      setShowDiningModeModal(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [selectedDishForDetails, setSelectedDishForDetails] = useState<any | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  
  // Inquiry form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Catering & Outdoor Handi');
  const [inquiryGuests, setInquiryGuests] = useState('50');
  const [inquiryMsg, setInquiryMsg] = useState('');

  // Database Data (Single Islamabad Branch)
  const menu = dbState.getMenu();
  const floors = dbState.getFloors('br-isb');
  const tables = dbState.getTables('br-isb', activeFloorId);
  const settings = dbState.getSettings();

  // Categories list
  const allCategories = ['All', ...Array.from(new Set(menu.map(i => i.category)))];

  // Grouped by Category for display
  const groupedByCategory = (activeCategory === 'All'
    ? Array.from(new Set(menu.map(i => i.category)))
    : [activeCategory]
  ).map(cat => ({
    cat,
    items: menu.filter(i => i.category === cat)
  })).filter(g => g.items.length > 0);

  // Cart operations
  const addToCart = (item: MenuItem, variation?: { name: string; price: number }) => {
    if (!item.isAvailable) {
      showToast('Item is currently sold out', 'error');
      return;
    }
    if (item.variations && item.variations.length > 0 && !variation) {
      setSelectedItemForVariation(item);
      return;
    }

    const price = variation ? variation.price : item.price;
    const varName = variation ? variation.name : undefined;

    setCart(prev => {
      const existing = prev.find(i => i.menuItemId === item.id && i.variation === varName);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.id && i.variation === varName
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price,
        quantity: 1,
        variation: varName,
      }];
    });

    setSelectedItemForVariation(null);
    showToast(`Added ${item.name} to your Handi`, 'success');
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
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

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = orderType === 'DELIVERY' ? 150 : 0;

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'HAANDI10') {
      const disc = Math.round(subtotal * 0.10);
      setDiscountAmount(disc);
      setAppliedPromo('HAANDI10 (10% Off)');
      showToast('🎉 Promo code HAANDI10 applied: 10% discount!', 'success');
    } else if (code === 'YUMTO50') {
      setDiscountAmount(50);
      setAppliedPromo('YUMTO50 (Rs. 50 Off)');
      showToast('🎉 Promo code YUMTO50 applied: Rs. 50 off!', 'success');
    } else {
      showToast('Invalid promo code. Try "HAANDI10"', 'error');
    }
  };

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Dynamic Sales Tax: Only applied and shown if Admin Master Toggle is ACTIVE
  const taxCalc = dbState.calculateSalesTax(discountedSubtotal, paymentMethod);
  const tax = settings.isTaxActive ? taxCalc.taxAmount : 0;
  const premiumReservationFee = 0;
  const grandTotal = discountedSubtotal + tax + deliveryFee + premiumReservationFee;

  const handleCheckout = () => {
    if (!profile) {
      setShowAuthModal(true);
      showToast('Please sign in or create an account to place your order', 'info');
      return;
    }
    if (cart.length === 0) {
      showToast('Your Handi cart is empty!', 'error');
      return;
    }
    if (orderType === 'DELIVERY' && !isWithinDeliveryRadius) {
      showToast('Delivery address is outside our 2.5 km Gulberg Greens boundary', 'error');
      return;
    }
    if (orderType === 'DELIVERY' && !deliveryAddr.trim()) {
      showToast('Please enter or select your delivery address in Gulberg Greens', 'error');
      return;
    }

    let reservationId;
    if (isReservingTable && selectedTableId) {
      const startDT = new Date(`${bookingDate}T${bookingTime}:00`);
      const endDT = new Date(startDT.getTime() + 2 * 3600000);
      const r = dbState.addReservation({
        tableId: selectedTableId, branchId: 'br-isb', userId: profile.uid,
        userName: custName || profile.name, userPhone: custPhone || profile.phone || '0330-0500600',
        startTime: startDT.toISOString(), endTime: endDT.toISOString(), guestCount,
        type: 'STANDARD', premiumFee: 0, status: 'CONFIRMED'
      });
      reservationId = r.id;
    }
    const fullDeliveryAddress = orderType === 'DELIVERY'
      ? `${deliveryAddr.trim()}, ${selectedSector}, Islamabad (${currentSector.distanceKm} km from Civic Center)`
      : undefined;

    const created = dbState.addOrder({
      branchId: 'br-isb', userId: profile.uid, userName: custName || profile.name, userPhone: custPhone || profile.phone || '0330-0500600',
      orderType: isReservingTable ? 'DINE_IN' : orderType, tableId: selectedTableId || undefined, reservationId,
      status: 'PENDING',
      paymentStatus: 'PAID', // Advance prepayment verified
      paymentMethod,
      items: cart.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, variation: i.variation })),
      subtotal, discountAmount, discountPercent: appliedPromo ? 10 : 0, tax, deliveryFee, premiumReservationFee, total: grandTotal,
      deliveryAddress: fullDeliveryAddress,
    });

    setPlacedOrderId(created.id);
    setIsOrderPlaced(true);
    setCart([]);
    setSelectedTableId(null);
    setIsReservingTable(false);
    setCartOpen(false);

    // Prepare WhatsApp Message with Live Tracking Link
    const trackingUrl = `${window.location.origin}/#/track/${created.id}`;
    const waText = `🍲 *HAANDI BY YUMTO — Order Confirmed!*\n\n*Order ID:* #${created.id.slice(-6).toUpperCase()}\n*Mode:* ${created.orderType}\n*Items:* ${created.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}\n*Total:* Rs. ${created.total.toLocaleString()}\n\n📍 *Track Live Order & Rider:* ${trackingUrl}\n\n*Haandi by Yumto*\nCivic Center, Gulberg Greens, Islamabad\n📞 0330 0500600`;

    const cleanPhone = (custPhone || '').replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone.startsWith('92') ? cleanPhone : '92' + (cleanPhone || '3300500600');
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`;

    // Open WhatsApp Tracking
    try {
      window.open(waUrl, '_blank');
    } catch {
      // Handled in modal
    }

    showToast('🎉 Order Placed! WhatsApp tracking link sent.', 'success');
  };

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh' }}>
      
      {/* ============================================================
          LUXURY HAANDI SPLASH SCREEN WITH LOGO
          ============================================================ */}
      {showSplashScreen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'radial-gradient(circle at center, #2A1F17 0%, #1A120B 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            width: '120px', height: '120px', borderRadius: '32px',
            background: '#FDFBF7', padding: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(232,93,4,0.3)',
            border: '3px solid var(--haandi-saffron)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '20px',
            animation: 'pulse 2s infinite ease-in-out'
          }}>
            <img src="/logo.png" alt="Haandi by Yumto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '900',
            color: '#FDFBF7', letterSpacing: '0.06em', margin: '0 0 6px 0', textAlign: 'center'
          }}>
            HAANDI <span style={{ color: '#E85D04' }}>BY YUMTO</span>
          </h1>

          <p style={{
            fontSize: '13px', color: '#F4C430', fontWeight: '800',
            letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 24px 0'
          }}>
            Authentic Clay Pot Cuisine
          </p>

          <div style={{
            width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--haandi-saffron)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />

          <div style={{
            position: 'absolute', bottom: '28px', fontSize: '11px',
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em'
          }}>
            Civic Center, Gulberg Greens, Islamabad
          </div>
        </div>
      )}

      {/* ============================================================
          LUXURY DARK NAVBAR (Deep Roasted Charcoal & Saffron Gold)
          ============================================================ */}
      <nav style={{
        background: '#1A120B',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, zIndex: 500,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        padding: '10px 16px'
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
        }}>
          {/* Brand Logo & Title */}
          <a href="#menu-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="Haandi by Yumto"
              style={{
                width: '42px', height: '42px', borderRadius: '10px',
                objectFit: 'contain', background: '#F8F3EA', padding: '2px',
                border: '2px solid rgba(232,93,4,0.6)', flexShrink: 0
              }}
            />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '900', color: '#ffffff', letterSpacing: '0.04em', lineHeight: 1.1 }}>
                HAANDI <span style={{ color: '#E85D04' }}>BY YUMTO</span>
              </div>
              <div style={{ fontSize: '10px', color: '#F4C430', fontWeight: '700', marginTop: '2px', letterSpacing: '0.06em' }}>
                Civic Center, Gulberg Greens
              </div>
            </div>
          </a>

          {/* Center: Dark Glass Dining Mode Pill */}
          <button
            onClick={() => setShowDiningModeModal(true)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '99px', padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', transition: 'all 0.2s',
              color: '#ffffff'
            }}
          >
            <span style={{ fontSize: '14px' }}>
              {isReservingTable ? '🪑' : orderType === 'DELIVERY' ? '🛵' : '🛍️'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff' }}>
              {isReservingTable ? 'Dine-In Table' : orderType === 'DELIVERY' ? `Delivery (${selectedSector.split(' ')[0]})` : 'Takeaway'}
            </span>
            <span style={{ fontSize: '10px', color: '#F4C430', fontWeight: '900', background: 'rgba(244,196,48,0.15)', padding: '2px 6px', borderRadius: '6px' }}>
              Change
            </span>
          </button>

          {/* Right Action Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowInquiryModal(true)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#ffffff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              className="hidden sm:inline-flex"
            >
              <span>🎉</span>
              <span>Catering</span>
            </button>

            <button
              onClick={() => setShowOrderHistoryModal(true)}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                padding: '6px 12px', fontSize: '12px', fontWeight: '700', color: '#ffffff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              className="hidden sm:inline-flex"
            >
              <span>🧾</span>
              <span>My Orders</span>
            </button>

            <button
              onClick={() => setShowLiveTrackingModal(true)}
              style={{
                background: 'rgba(21,128,61,0.2)', border: '1px solid #15803D', borderRadius: '10px',
                padding: '6px 12px', fontSize: '12px', fontWeight: '800', color: '#4ADE80',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Navigation style={{ width: '13px', height: '13px' }} />
              <span className="hidden sm:inline">Track</span>
            </button>

            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '10px', padding: '6px 12px', fontSize: '12px', fontWeight: '700',
                color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <User style={{ width: '13px', height: '13px', color: '#E85D04' }} />
              <span className="hidden sm:inline">{profile ? profile.name.split(' ')[0] : 'Sign In'}</span>
            </button>

            <button
              onClick={() => setCartOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                color: '#ffffff', border: 'none', borderRadius: '10px',
                padding: '7px 14px', fontSize: '12px', fontWeight: '800',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 10px rgba(232,93,4,0.4)'
              }}
            >
              <ShoppingBag style={{ width: '14px', height: '14px' }} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{ background: '#FFFFFF', color: '#8B1E1E', fontSize: '10px', fontWeight: '900', padding: '1px 6px', borderRadius: '10px' }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ============================================================
          DARK LUXURY HERO BANNER
          ============================================================ */}
      <div style={{
        background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
        color: '#ffffff', padding: '22px 16px', borderBottom: '2px solid var(--haandi-saffron)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(232,93,4,0.2)', border: '1px solid var(--haandi-saffron)', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', color: 'var(--haandi-gold)', fontWeight: '800', marginBottom: '8px' }}>
              <span>🏺 Authentic Desi Earthenware Cuisine</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0 0 4px 0' }}>
              Slow-Cooked Clay Pot Handi & Charcoal BBQ
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              Civic Center, Executive Block, Gulberg Greens, Islamabad · 0330 0500600
            </p>
          </div>

          <button
            onClick={() => setShowDiningModeModal(true)}
            style={{
              background: 'linear-gradient(135deg, var(--haandi-red) 0%, #E85D04 100%)',
              color: '#ffffff', border: 'none', borderRadius: '12px', padding: '10px 18px',
              fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(232,93,4,0.4)'
            }}
          >
            <span>{isReservingTable ? '🪑 Dine-In' : orderType === 'DELIVERY' ? `🛵 Delivery (${selectedSector.split(',')[0]})` : '🛍️ Takeaway'}</span>
            <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>Change</span>
          </button>
        </div>
      </div>

          {/* Delivery Sector Selector */}
          {orderType === 'DELIVERY' && (
            <div style={{
              background: 'var(--bg-cream-light)', padding: '14px', borderRadius: '14px',
              border: '1px solid var(--border-warm)', display: 'flex', flexWrap: 'wrap',
              alignItems: 'center', justifyContent: 'space-between', gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin style={{ width: '18px', height: '18px', color: 'var(--haandi-red)' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    Delivery Destination in Gulberg Greens, Islamabad:
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Orders dispatched hot from Civic Center · Max distance: 2.5 km
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  style={{
                    background: '#ffffff', border: `1.5px solid ${isWithinDeliveryRadius ? 'var(--border-warm)' : '#EF4444'}`,
                    borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: '700',
                    color: 'var(--text-dark)', outline: 'none'
                  }}
                >
                  {GULBERG_SECTORS.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.distanceKm} km)
                    </option>
                  ))}
                </select>

                <div style={{
                  padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                  background: isWithinDeliveryRadius ? 'var(--emerald-light)' : '#FEE2E2',
                  color: isWithinDeliveryRadius ? 'var(--emerald)' : '#DC2626',
                  border: `1px solid ${isWithinDeliveryRadius ? 'var(--emerald-border)' : '#FCA5A5'}`
                }}>
                  {isWithinDeliveryRadius ? `✓ ${currentSector.distanceKm} km · Eligible` : '✗ Outside 2.5 km'}
                </div>
              </div>
            </div>
          )}

      {/* ============================================================
          SIGNATURE SPECIALS SHOWCASE (Creamy Cards with Fire Badges)
          ============================================================ */}
      <div style={{ maxWidth: '1200px', margin: '20px auto 30px', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--haandi-saffron)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Chef's Master Creations
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text-dark)' }}>
              Signature Clay Pot Specials
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--haandi-red)', fontSize: '12px', fontWeight: '800' }}>
            <Sparkles style={{ width: '14px', height: '14px' }} />
            <span>Slow-Cooked Fresh</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {menu.slice(0, 4).map(item => (
            <div key={item.id} className="haandi-card" style={{ flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid var(--border-warm)' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'; }}
                />
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#ffffff', fontSize: '10px', fontWeight: '900', padding: '3px 8px',
                  borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                  🔥 Clay Pot Signature
                </div>
              </div>

              <div style={{ padding: '8px 0 0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="haandi-card-name">{item.name}</div>
                  <div className="haandi-card-desc">{item.description}</div>
                </div>

                <div className="haandi-card-bottom" style={{ marginTop: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Price from</div>
                    <div className="haandi-card-price">Rs. {item.price.toLocaleString()}</div>
                  </div>

                  <button
                    className="haandi-add-btn"
                    onClick={() => addToCart(item)}
                  >
                    <Plus style={{ width: '14px', height: '14px' }} />
                    <span>Add to Handi</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          STICKY CATEGORY PILLS BAR
          ============================================================ */}
      <div id="menu-section" className="haandi-cat-nav-wrap">
        <div className="haandi-cat-nav-inner">
          {allCategories.map(cat => (
            <button
              key={cat}
              className={`haandi-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' && '🌟 All Items'}
              {cat.includes('Handi') && '🍲 ' + cat}
              {cat.includes('Karahi') && '🍳 ' + cat}
              {cat.includes('BBQ') && '🍢 ' + cat}
              {cat.includes('Rice') && '🍚 ' + cat}
              {cat.includes('Roti') && '🫓 ' + cat}
              {cat.includes('Soup') && '🥣 ' + cat}
              {cat.includes('Salad') && '🥗 ' + cat}
              {cat.includes('Beverages') && '🍹 ' + cat}
              {cat.includes('Desserts') && '🍨 ' + cat}
              {!['All', 'Handi', 'Karahi', 'BBQ', 'Rice', 'Roti', 'Soup', 'Salad', 'Beverages', 'Desserts'].some(k => cat.includes(k)) && cat}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          MAIN MENU SECTIONS (Authentic Terracotta Banners & Creamy Cards)
          ============================================================ */}
      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 16px' }}>
        {groupedByCategory.map(({ cat, items }) => (
          <div key={cat} className="haandi-menu-section animate-fade">
            {/* Terracotta/Saffron Header Banner */}
            <div className="haandi-cat-banner">
              <div>
                <div className="haandi-cat-title">{cat}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                  {items.length} {items.length === 1 ? 'Dish Available' : 'Dishes Available'} · Prepared Fresh on Order
                </div>
              </div>
              <div className="haandi-cat-badge">
                Authentic Recipe
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div className="haandi-item-grid">
              {items.map(item => {
                const inCart = cart.find(i => i.menuItemId === item.id);
                const cartIdx = cart.findIndex(i => i.menuItemId === item.id);

                return (
                  <div key={item.id} className="haandi-card">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="haandi-card-img"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDishForDetails(item)}
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                    />
                    <div className="haandi-card-info">
                      <div style={{ cursor: 'pointer' }} onClick={() => setSelectedDishForDetails(item)}>
                        <div className="haandi-card-name">{item.name}</div>
                        {item.description && <div className="haandi-card-desc">{item.description}</div>}
                      </div>

                      <div className="haandi-card-bottom">
                        <div>
                          <div className="haandi-card-price">
                            Rs. {item.price.toLocaleString()}
                          </div>
                          {item.variations && item.variations.length > 0 && (
                            <div style={{ fontSize: '10px', color: 'var(--haandi-saffron)', fontWeight: '700' }}>
                              Multiple Portions
                            </div>
                          )}
                        </div>

                        {inCart ? (
                          <div className="haandi-qty-stepper">
                            <button className="haandi-qty-btn" onClick={() => updateQuantity(cartIdx, -1)}>
                              <Minus style={{ width: '12px', height: '12px' }} />
                            </button>
                            <span className="haandi-qty-count">{inCart.quantity}</span>
                            <button className="haandi-qty-btn" onClick={() => updateQuantity(cartIdx, 1)}>
                              <Plus style={{ width: '12px', height: '12px' }} />
                            </button>
                          </div>
                        ) : (
                          <button className="haandi-add-btn" onClick={() => addToCart(item)}>
                            <Plus style={{ width: '13px', height: '13px' }} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          INTERACTIVE DINE-IN TABLE BOOKING FLOORPLAN (When Dine-In Active)
          ============================================================ */}
      <div id="booking-section" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 16px' }}>
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)',
          borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--haandi-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Floor Layout & Majlis Suites
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--text-dark)' }}>
                Reserve Your Dining Table (Islamabad Branch)
              </h3>
            </div>

            {/* Floor Tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {floors.map(fl => (
                <button
                  key={fl.id}
                  onClick={() => { setActiveFloorId(fl.id); setSelectedTableId(null); }}
                  style={{
                    padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
                    border: 'none', cursor: 'pointer',
                    background: activeFloorId === fl.id ? 'var(--haandi-red)' : 'var(--bg-cream-light)',
                    color: activeFloorId === fl.id ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  {fl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Seating Layout Canvas */}
          <div style={{
            height: '280px', background: 'var(--bg-dark)', borderRadius: '14px',
            position: 'relative', overflow: 'hidden', border: '1.5px solid var(--border-warm-dark)'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            {tables.map(table => {
              const isSelected = selectedTableId === table.id;
              const isAvail = table.status === 'AVAILABLE';

              return (
                <div
                  key={table.id}
                  onClick={() => isAvail && setSelectedTableId(table.id)}
                  style={{
                    position: 'absolute',
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                    width: `${table.width}%`,
                    height: `${table.height}%`,
                    background: isSelected ? '#8B1E1E' : isAvail ? 'rgba(21,128,61,0.25)' : 'rgba(220,38,38,0.25)',
                    border: `2px solid ${isSelected ? '#F4C430' : isAvail ? '#15803D' : '#DC2626'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isAvail ? 'pointer' : 'not-allowed',
                    color: '#ffffff',
                    boxShadow: isSelected ? '0 0 14px rgba(244,196,48,0.6)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: '900', fontSize: '12px' }}>{table.tableNumber}</div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)' }}>{table.capacity} seats</div>
                  {isSelected && <div style={{ fontSize: '8px', color: '#F4C430', fontWeight: '900' }}>SELECTED</div>}
                </div>
              );
            })}

            <div style={{
              position: 'absolute', bottom: '8px', left: '8px', right: '8px',
              background: 'rgba(26,18,11,0.9)', padding: '6px 12px', borderRadius: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#ffffff'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span>🟢 Available</span>
                <span>🔴 Occupied / Reserved</span>
                <span>⭐ Selected Table</span>
              </div>
              {selectedTableId && (
                <span style={{ color: '#F4C430', fontWeight: '800' }}>
                  ✓ Table {tables.find(t => t.id === selectedTableId)?.tableNumber} selected
                </span>
              )}
            </div>
          </div>

          {/* Booking Inputs */}
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', background: 'var(--bg-cream-light)', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Time</label>
              <input
                type="time"
                value={bookingTime}
                onChange={e => setBookingTime(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', background: 'var(--bg-cream-light)', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Guests</label>
              <select
                value={guestCount}
                onChange={e => setGuestCount(parseInt(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', background: 'var(--bg-cream-light)', fontSize: '12px', fontWeight: '700' }}
              >
                {[1, 2, 4, 6, 8, 10, 12, 16].map(n => (
                  <option key={n} value={n}>{n} Persons</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          HERITAGE STORY & BRAND TRUST PILLARS
          ============================================================ */}
      <div style={{ maxWidth: '1200px', margin: '40px auto 60px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--haandi-red)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            The Haandi Heritage
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', color: 'var(--text-dark)' }}>
            Why Dine with Haandi by Yumto?
          </h2>
        </div>

        <div className="haandi-story-grid">
          <div className="haandi-story-card">
            <div className="haandi-story-icon">🏺</div>
            <div className="haandi-story-title">Hand-Molded Earthen Pots</div>
            <div className="haandi-story-desc">
              Every Handi dish is slow-cooked in traditional earthenware that seals in natural juices and creates an authentic earthen aroma.
            </div>
          </div>

          <div className="haandi-story-card">
            <div className="haandi-story-icon">🧈</div>
            <div className="haandi-story-title">100% Pure Desi Ghee</div>
            <div className="haandi-story-desc">
              We never use artificial oils or frozen meat. Every Karahi and Handi is prepared fresh upon order using pure butter and whole spices.
            </div>
          </div>

          <div className="haandi-story-card">
            <div className="haandi-story-icon">🛵</div>
            <div className="haandi-story-title">Strict 2.5 km Hot Delivery</div>
            <div className="haandi-story-desc">
              To guarantee that food arrives piping hot and clay-fresh, our fleet operates strictly within a 2.5 km radius of Civic Center.
            </div>
          </div>

          <div className="haandi-story-card">
            <div className="haandi-story-icon">🧾</div>
            <div className="haandi-story-title">{settings.isTaxActive ? `${settings.salesTaxCardPercent}% Incentivized Tax` : '0% Tax Free'}</div>
            <div className="haandi-story-desc">
              {settings.isTaxActive 
                ? 'Enjoy 5% FBR sales tax on all digital card and online advance prepayments with instant digital receipt generation.'
                : 'Enjoy 0% sales tax currently active across all orders with authentic digital receipts.'}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          PORTION VARIATION PICKER MODAL
          ============================================================ */}
      {selectedItemForVariation && selectedItemForVariation.variations && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9997, background: 'rgba(26,18,11,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-cream-light)', borderRadius: '20px', maxWidth: '380px', width: '100%', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1.5px solid var(--border-warm)' }}>
            <div style={{ background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>{selectedItemForVariation.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--haandi-gold)' }}>Select Portion Size</div>
              </div>
              <button onClick={() => setSelectedItemForVariation(null)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedItemForVariation.variations.map((v, i) => (
                <button
                  key={i}
                  onClick={() => addToCart(selectedItemForVariation, v)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '12px',
                    padding: '14px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    color: 'var(--text-dark)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--haandi-red)'; e.currentTarget.style.background = '#FFFDF9'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-warm)'; e.currentTarget.style.background = '#ffffff'; }}
                >
                  <span>{v.name}</span>
                  <span style={{ color: 'var(--haandi-red)', fontWeight: '900' }}>Rs. {v.price.toLocaleString()}</span>
                </button>
              ))}

              <button
                onClick={() => setSelectedItemForVariation(null)}
                style={{ marginTop: '6px', padding: '10px', background: 'transparent', border: '1px solid var(--border-warm)', borderRadius: '10px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '700' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SLIDE-OVER CART & CHECKOUT DRAWER
          ============================================================ */}
      {cartOpen && (
        <div className="haandi-drawer-backdrop" onClick={() => setCartOpen(false)}>
          <div className="haandi-drawer-panel" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div style={{ background: 'var(--bg-dark)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--haandi-saffron)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag style={{ width: '20px', height: '20px', color: 'var(--haandi-gold)' }} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '15px' }}>Your Handi Cart</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{cartCount} {cartCount === 1 ? 'item' : 'items'} in order</div>
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍲</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-dark)' }}>Your Handi is Empty</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Add your favorite Karahi, Handi or BBQ to begin</div>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>{item.name}</div>
                      {item.variation && <div style={{ fontSize: '11px', color: 'var(--haandi-saffron)', fontWeight: '700' }}>[{item.variation}]</div>}
                      <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--haandi-red)', marginTop: '2px' }}>
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="haandi-qty-stepper">
                        <button className="haandi-qty-btn" onClick={() => updateQuantity(idx, -1)}><Minus style={{ width: '10px', height: '10px' }} /></button>
                        <span className="haandi-qty-count">{item.quantity}</span>
                        <button className="haandi-qty-btn" onClick={() => updateQuantity(idx, 1)}><Plus style={{ width: '10px', height: '10px' }} /></button>
                      </div>
                      <button onClick={() => removeFromCart(idx)} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
                        <Trash2 style={{ width: '15px', height: '15px' }} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Checkout Summary */}
            {cart.length > 0 && (
              <div style={{ background: '#ffffff', borderTop: '2px solid var(--border-warm)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Customer Details Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '12px', background: 'var(--bg-cream-light)' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (0330...)"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '12px', background: 'var(--bg-cream-light)' }}
                  />
                </div>

                {orderType === 'DELIVERY' && (
                  <div style={{ background: 'var(--bg-cream-light)', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase' }}>
                        📍 Saved Delivery Addresses
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                        style={{ background: 'none', border: 'none', color: '#8B1E1E', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        {showAddAddressForm ? 'Cancel' : '+ New Address'}
                      </button>
                    </div>

                    {/* Saved Address Radio Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {savedAddresses.map(addr => (
                        <label
                          key={addr.id}
                          onClick={() => { setSelectedAddressId(addr.id); setDeliveryAddr(addr.address); setShowAddAddressForm(false); }}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px',
                            borderRadius: '8px', cursor: 'pointer',
                            border: `1.5px solid ${selectedAddressId === addr.id && !showAddAddressForm ? 'var(--haandi-red)' : 'var(--border-warm)'}`,
                            background: selectedAddressId === addr.id && !showAddAddressForm ? '#ffffff' : 'rgba(255,255,255,0.6)'
                          }}
                        >
                          <input
                            type="radio"
                            name="customerAddress"
                            checked={selectedAddressId === addr.id && !showAddAddressForm}
                            onChange={() => { setSelectedAddressId(addr.id); setDeliveryAddr(addr.address); }}
                            style={{ marginTop: '2px', accentColor: 'var(--haandi-red)' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '11px', color: 'var(--text-dark)' }}>
                              {addr.label === 'Home' || addr.label === 'Executive Residence' ? '🏠 ' : addr.label === 'Office' || addr.label === 'Civic Office' ? '🏢 ' : '🌴 '}
                              {addr.label}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
                              {addr.address}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Add New Address Sub-form */}
                    {showAddAddressForm && (
                      <div style={{ marginTop: '8px', padding: '10px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-warm)' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                          {['Home', 'Office', 'Farmhouse'].map(lbl => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setNewAddrLabel(lbl)}
                              style={{
                                padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                                border: 'none', cursor: 'pointer',
                                background: newAddrLabel === lbl ? 'var(--haandi-red)' : '#f3f4f6',
                                color: newAddrLabel === lbl ? '#fff' : '#4b5563'
                              }}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="House & Street in Gulberg Greens"
                          value={newAddrText}
                          onChange={e => setNewAddrText(e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-warm)', fontSize: '11px', boxSizing: 'border-box', marginBottom: '6px' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newAddrText.trim()) return;
                            const newAddrObj: CustomerAddress = {
                              id: 'addr-' + Date.now(),
                              label: newAddrLabel,
                              sector: selectedSector,
                              address: `${newAddrText.trim()}, ${selectedSector}, Gulberg Greens`
                            };
                            db.saveCustomerAddress(profile?.uid || 'u-cust', newAddrObj);
                            setDeliveryAddr(newAddrObj.address);
                            setSelectedAddressId(newAddrObj.id);
                            setNewAddrText('');
                            setShowAddAddressForm(false);
                            showToast('Address saved to address book!', 'success');
                          }}
                          disabled={!newAddrText.trim()}
                          style={{ width: '100%', padding: '6px', borderRadius: '6px', background: 'var(--haandi-red)', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '800', cursor: newAddrText.trim() ? 'pointer' : 'not-allowed' }}
                        >
                          Save & Select Address
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Prepayment Method (No COD) */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                      border: `1.5px solid ${paymentMethod === 'CARD' ? 'var(--haandi-red)' : 'var(--border-warm)'}`,
                      background: paymentMethod === 'CARD' ? 'var(--haandi-red-light)' : '#ffffff',
                      color: paymentMethod === 'CARD' ? 'var(--haandi-red)' : 'var(--text-muted)'
                    }}
                  >
                    💳 Card {settings.isTaxActive ? `(${settings.salesTaxCardPercent}% Tax)` : ''}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('ONLINE')}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                      border: `1.5px solid ${paymentMethod === 'ONLINE' ? 'var(--haandi-red)' : 'var(--border-warm)'}`,
                      background: paymentMethod === 'ONLINE' ? 'var(--haandi-red-light)' : '#ffffff',
                      color: paymentMethod === 'ONLINE' ? 'var(--haandi-red)' : 'var(--text-muted)'
                    }}
                  >
                    📱 Online / Raast
                  </button>
                </div>

                {/* Promo Code Input */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. HAANDI10)"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    style={{
                      flex: 1, padding: '8px 10px', borderRadius: '8px',
                      border: '1.5px solid var(--border-warm)', fontSize: '11px',
                      background: 'var(--bg-cream-light)', textTransform: 'uppercase', fontWeight: '800'
                    }}
                  />
                  <button
                    onClick={applyPromo}
                    style={{
                      background: 'var(--haandi-red)', color: '#ffffff', border: 'none',
                      borderRadius: '8px', padding: '8px 12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                    }}
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: '800', display: 'flex', justifyContent: 'space-between', background: 'var(--emerald-light)', padding: '4px 8px', borderRadius: '6px' }}>
                    <span>{appliedPromo}</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {/* Calculations */}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald)', fontWeight: '700' }}>
                      <span>Voucher Discount:</span>
                      <span>-Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {settings.isTaxActive && tax > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Digital Sales Tax ({taxCalc.taxRate}%):</span>
                      <span>Rs. {tax.toLocaleString()}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Delivery (Gulberg Greens):</span>
                      <span>Rs. {deliveryFee.toLocaleString()}</span>
                    </div>
                  )}
                  {premiumReservationFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B45309', fontWeight: 'bold' }}>
                      <span>Peak Booking Fee:</span>
                      <span>Rs. {premiumReservationFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', color: 'var(--haandi-red)', borderTop: '1px dashed var(--border-warm)', paddingTop: '6px' }}>
                    <span>Grand Total:</span>
                    <span>Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Submit */}
                <button
                  onClick={handleCheckout}
                  style={{
                    background: 'linear-gradient(135deg, var(--haandi-red) 0%, #B91C1C 100%)',
                    color: '#ffffff', border: 'none', borderRadius: '12px', padding: '14px',
                    fontWeight: '900', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(139,30,30,0.4)'
                  }}
                >
                  <span>Pay Rs. {grandTotal.toLocaleString()} & Order</span>
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          ORDER CONFIRMED & WHATSAPP TRACKING MODAL
          ============================================================ */}
      {isOrderPlaced && placedOrderId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(26,18,11,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FDFBF7', borderRadius: '24px', maxWidth: '440px', width: '100%',
            overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '2px solid #EADBCC',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
              padding: '24px 20px', color: '#ffffff', textAlign: 'center'
            }}>
              <div style={{
                width: '56px', height: '56px', margin: '0 auto 10px',
                borderRadius: '50%', background: '#15803D', color: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(21,128,61,0.5)', border: '3px solid #ffffff'
              }}>
                <CheckCircle2 style={{ width: '30px', height: '30px' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px 0', color: '#ffffff' }}>
                Order Confirmed!
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--haandi-gold)', margin: 0 }}>
                Order #{placedOrderId.slice(-6).toUpperCase()} · In Earthen Kitchen
              </p>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '22px' }}>📲</div>
                <div style={{ fontSize: '12px', color: '#15803D', lineHeight: 1.4 }}>
                  <strong>WhatsApp Tracking Sent!</strong><br />
                  A WhatsApp message with your live rider tracking link has been prepared.
                </div>
              </div>

              <a
                href={`/#/track/${placedOrderId}`}
                style={{
                  background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#ffffff', textDecoration: 'none', borderRadius: '14px',
                  padding: '13px', fontSize: '14px', fontWeight: '900', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 16px rgba(139,30,30,0.35)'
                }}
              >
                <span>📍 Track Live Order & Rider on Map</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </a>

              <a
                href={`https://wa.me/${((custPhone || '').replace(/[^0-9]/g, '').startsWith('0') ? '92' + (custPhone || '').replace(/[^0-9]/g, '').slice(1) : '92' + (custPhone || '').replace(/[^0-9]/g, '')) || '923300500600'}?text=${encodeURIComponent(`🍲 *HAANDI BY YUMTO — Live Order Tracking*\n\n*Order ID:* #${placedOrderId.slice(-6).toUpperCase()}\n\n📍 *Track Live Order & Rider:* ${window.location.origin}/#/track/${placedOrderId}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#25D366', color: '#ffffff', textDecoration: 'none',
                  borderRadius: '14px', padding: '11px', fontSize: '13px', fontWeight: '800', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <span>💬 Open WhatsApp Tracking Link</span>
              </a>

              <button
                onClick={() => setIsOrderPlaced(false)}
                style={{
                  background: 'transparent', border: '1.5px solid #EADBCC', borderRadius: '12px',
                  padding: '9px', fontSize: '12px', fontWeight: '700', color: '#5C4B3C', cursor: 'pointer'
                }}
              >
                Continue Browsing Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SHORT & COMPACT DINING MODE POPUP (Screenshot 1)
          ============================================================ */}
      {showDiningModeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(26,18,11,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FDFBF7', borderRadius: '24px', maxWidth: '400px', width: '100%',
            overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', border: '2px solid #EADBCC',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
              padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="Haandi" style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FDFBF7', padding: '2px' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                    Select Dining Mode
                  </h3>
                  <div style={{ fontSize: '10px', color: 'var(--haandi-gold)' }}>Gulberg Greens, Islamabad</div>
                </div>
              </div>
              <button
                onClick={() => setShowDiningModeModal(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: '#ffffff', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* 3 Compact Option Cards */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Delivery */}
              <button
                onClick={() => {
                  setOrderType('DELIVERY');
                  setIsReservingTable(false);
                  setShowDiningModeModal(false);
                  showToast('🛵 Delivery selected (Gulberg Greens)');
                }}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '14px',
                  background: orderType === 'DELIVERY' && !isReservingTable ? '#FFF9F5' : '#FFFFFF',
                  border: `2px solid ${orderType === 'DELIVERY' && !isReservingTable ? '#8B1E1E' : '#EADBCC'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  boxShadow: orderType === 'DELIVERY' && !isReservingTable ? '0 4px 12px rgba(139,30,30,0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px', width: '38px', height: '38px', borderRadius: '10px', background: '#FBF0EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🛵
                  </div>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#1A120B' }}>Delivery</div>
                    <div style={{ fontSize: '11px', color: '#5C4B3C' }}>Gulberg Greens · Within 2.5 km</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', background: '#F0FDF4', color: '#15803D', padding: '3px 8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                  30-40 Mins
                </div>
              </button>

              {/* Takeaway */}
              <button
                onClick={() => {
                  setOrderType('PICK_UP');
                  setIsReservingTable(false);
                  setShowDiningModeModal(false);
                  showToast('🛍️ Takeaway / Pickup selected');
                }}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '14px',
                  background: orderType === 'PICK_UP' && !isReservingTable ? '#FFF9F5' : '#FFFFFF',
                  border: `2px solid ${orderType === 'PICK_UP' && !isReservingTable ? '#8B1E1E' : '#EADBCC'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  boxShadow: orderType === 'PICK_UP' && !isReservingTable ? '0 4px 12px rgba(139,30,30,0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px', width: '38px', height: '38px', borderRadius: '10px', background: '#FDF4EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🛍️
                  </div>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#1A120B' }}>Takeaway</div>
                    <div style={{ fontSize: '11px', color: '#5C4B3C' }}>Civic Center Pickup</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', background: '#FDF4EB', color: '#E85D04', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(232,93,4,0.3)' }}>
                  20 Mins
                </div>
              </button>

              {/* Dine-In */}
              <button
                onClick={() => {
                  setOrderType('DINE_IN');
                  setIsReservingTable(true);
                  setShowDiningModeModal(false);
                  document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
                  showToast('🪑 Dine-In selected · Pick your table');
                }}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '14px',
                  background: isReservingTable ? '#FFF9F5' : '#FFFFFF',
                  border: `2px solid ${isReservingTable ? '#8B1E1E' : '#EADBCC'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                  boxShadow: isReservingTable ? '0 4px 12px rgba(139,30,30,0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px', width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(244,196,48,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    🪑
                  </div>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '15px', color: '#1A120B' }}>Dine-In</div>
                    <div style={{ fontSize: '11px', color: '#5C4B3C' }}>Table & VIP Majlis Seating</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(244,196,48,0.2)', color: '#D97706', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(217,119,6,0.3)' }}>
                  Floor Plan
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          LIVE GPS TRACKING MODAL (OPENSTREETMAP)
          ============================================================ */}
      {(showLiveTrackingModal) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(26,18,11,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-cream-light)', borderRadius: '24px', maxWidth: '600px', width: '100%',
            overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1.5px solid var(--border-warm)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
              padding: '18px 22px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛵 Live Order Delivery Tracker</span>
                  <span style={{ fontSize: '10px', background: 'var(--haandi-saffron)', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>OSM GPS</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                  {placedOrderId ? `Order #${placedOrderId.slice(-6).toUpperCase()}` : 'Live Delivery Route'} · Gulberg Greens, Islamabad
                </div>
              </div>
              <button
                onClick={() => setShowLiveTrackingModal(false)}
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
                height="340px"
                showControls={true}
              />
            </div>

            <div style={{ padding: '14px 22px', background: 'var(--bg-card)', borderTop: '1.5px solid var(--border-warm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                📍 Gulberg Greens Civic Center ➔ {selectedSector}
              </span>
              <button
                onClick={() => setShowLiveTrackingModal(false)}
                style={{
                  background: 'var(--haandi-red)', color: '#ffffff', border: 'none', borderRadius: '10px',
                  padding: '8px 18px', fontSize: '12px', fontWeight: '800', cursor: 'pointer'
                }}
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          LOCATION SECTOR & 2.5 KM BOUNDARY MODAL
          ============================================================ */}
      {showSectorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(26,18,11,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-cream-light)', borderRadius: '24px', maxWidth: '480px', width: '100%', overflow: 'hidden', border: '1.5px solid var(--border-warm)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)', padding: '18px 22px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '15px' }}>📍 Single Location & Delivery Zone</div>
                <div style={{ fontSize: '11px', color: 'var(--haandi-gold)' }}>Gulberg Greens Civic Center, Islamabad</div>
              </div>
              <button onClick={() => setShowSectorModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-dark)' }}>Haandi by Yumto - Islamabad</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Civic Center, Executive Block, Gulberg Greens, Islamabad</div>
                <div style={{ fontSize: '12px', color: 'var(--haandi-red)', fontWeight: '700', marginTop: '4px' }}>📞 0330 0500600 · NTN/GST: 4585147-3</div>
              </div>

              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>
                Eligible Delivery Sectors (Within 2.5 km):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {GULBERG_SECTORS.map(s => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-warm)', fontSize: '12px' }}>
                    <span>{s.name}</span>
                    <span style={{ fontWeight: '800', color: s.distanceKm <= 2.5 ? 'var(--emerald)' : '#DC2626' }}>
                      {s.distanceKm} km {s.distanceKm <= 2.5 ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-warm)', textAlign: 'right' }}>
              <button
                onClick={() => setShowSectorModal(false)}
                style={{ background: 'var(--haandi-red)', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ONLINE INQUIRY & CATERING BOOKING MODAL
          ============================================================ */}
      {showInquiryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(26,18,11,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-cream-light)', borderRadius: '24px', maxWidth: '500px', width: '100%', overflow: 'hidden', border: '2px solid var(--border-warm)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)', padding: '18px 22px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '16px' }}>🎉 Catering & Event Inquiry</div>
                <div style={{ fontSize: '11px', color: 'var(--haandi-gold)' }}>Live Clay Pot Cooking & VIP Banquets · Islamabad</div>
              </div>
              <button onClick={() => setShowInquiryModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)' }}>Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Imran Khan"
                  value={inquiryName}
                  onChange={e => setInquiryName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginTop: '4px', fontSize: '13px', background: '#ffffff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)' }}>Phone / WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="0330 0000000"
                  value={inquiryPhone}
                  onChange={e => setInquiryPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginTop: '4px', fontSize: '13px', background: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)' }}>Occasion Type</label>
                  <select
                    value={inquiryType}
                    onChange={e => setInquiryType(e.target.value)}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginTop: '4px', fontSize: '12px', background: '#ffffff' }}
                  >
                    <option value="Catering & Outdoor Handi">Outdoor Catering</option>
                    <option value="Corporate Dinner">Corporate Dinner</option>
                    <option value="VIP Majlis Private Hall">VIP Majlis Booking</option>
                    <option value="Wedding / Daawat">Wedding / Daawat</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)' }}>Expected Guests</label>
                  <input
                    type="number"
                    value={inquiryGuests}
                    onChange={e => setInquiryGuests(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginTop: '4px', fontSize: '13px', background: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)' }}>Special Requirements / Menu Preferences</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mutton Handi, Shinwari Karahi with live tandoor and clay pot presentation"
                  value={inquiryMsg}
                  onChange={e => setInquiryMsg(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginTop: '4px', fontSize: '12px', background: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={() => {
                    if (!inquiryName.trim() || !inquiryPhone.trim()) {
                      showToast('Please enter your name and phone number', 'error');
                      return;
                    }
                    setShowInquiryModal(false);
                    showToast('🎉 Catering inquiry received! Our manager will call you within 15 mins.', 'success');
                  }}
                  style={{
                    flex: 1, background: 'var(--haandi-red)', color: '#ffffff', border: 'none',
                    borderRadius: '12px', padding: '12px', fontWeight: '900', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Submit Inquiry
                </button>

                <a
                  href={`https://wa.me/923300500600?text=Hi%20Haandi%20by%20Yumto!%20I%20want%20to%20inquire%20about%20${encodeURIComponent(inquiryType)}%20for%20${inquiryGuests}%20guests.`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#25D366', color: '#ffffff', textDecoration: 'none',
                    borderRadius: '12px', padding: '12px 16px', fontWeight: '900', fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <span>💬 WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CUSTOMER PAST ORDERS & STATUS HISTORY MODAL
          ============================================================ */}
      {showOrderHistoryModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(26,18,11,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-cream-light)', borderRadius: '24px', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflow: 'hidden', border: '2px solid var(--border-warm)', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)', padding: '18px 22px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '16px' }}>🧾 My Orders & Live Status</div>
                <div style={{ fontSize: '11px', color: 'var(--haandi-gold)' }}>Haandi by Yumto · Gulberg Greens, Islamabad</div>
              </div>
              <button onClick={() => setShowOrderHistoryModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dbState.getOrders('br-isb').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <p style={{ fontWeight: '800', fontSize: '15px' }}>No orders placed yet</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Explore our menu and place your first clay pot order!</p>
                </div>
              ) : (
                dbState.getOrders('br-isb').slice(-8).reverse().map(order => (
                  <div key={order.id} style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '900', fontSize: '13px', color: 'var(--text-dark)' }}>
                        #{order.id.slice(-6).toUpperCase()} · {order.orderType}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '6px',
                        background: order.status === 'COMPLETED' ? 'var(--emerald-light)' : order.status === 'PREPARING' ? '#FEF3C7' : 'var(--haandi-red-light)',
                        color: order.status === 'COMPLETED' ? 'var(--emerald)' : order.status === 'PREPARING' ? '#D97706' : 'var(--haandi-red)'
                      }}>
                        {order.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {order.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px dashed var(--border-warm)', paddingTop: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: '800', color: 'var(--haandi-red)' }}>Rs. {order.total.toLocaleString()}</span>
                      <button
                        onClick={() => {
                          setPlacedOrderId(order.id);
                          setShowOrderHistoryModal(false);
                          setShowLiveTrackingModal(true);
                        }}
                        style={{ background: 'var(--haandi-red-light)', color: 'var(--haandi-red)', border: '1px solid var(--haandi-red)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        📍 Track Route
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DISH DETAILS & AUTHENTIC CLAY POT STORY MODAL
          ============================================================ */}
      {selectedDishForDetails && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(26,18,11,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-cream-light)', borderRadius: '24px', maxWidth: '460px', width: '100%', overflow: 'hidden', border: '2px solid var(--border-warm)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
              <img src={selectedDishForDetails.image} alt={selectedDishForDetails.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,11,0.85) 0%, transparent 60%)' }} />
              <button onClick={() => setSelectedDishForDetails(null)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#ffffff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
              <div style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#ffffff' }}>
                <div style={{ fontWeight: '900', fontSize: '18px' }}>{selectedDishForDetails.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--haandi-gold)', fontWeight: '700' }}>Rs. {selectedDishForDetails.price.toLocaleString()} · {selectedDishForDetails.category}</div>
              </div>
            </div>

            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {selectedDishForDetails.description}
              </p>

              <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-warm)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏺 Earthenware Slow-Cooking Guarantee:</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Slow cooked inside unglazed terracotta pots over open charcoal fire. Sealed with dough to lock in the aroma and juices. Cooked with 100% Pure Desi Ghee.
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(selectedDishForDetails);
                  setSelectedDishForDetails(null);
                }}
                style={{
                  background: 'var(--haandi-red)', color: '#ffffff', border: 'none',
                  borderRadius: '12px', padding: '12px', fontWeight: '900', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px'
                }}
              >
                <span>Add to Handi Cart · Rs. {selectedDishForDetails.price.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          FLOATING WHATSAPP SUPPORT BUTTON (BOTTOM LEFT)
          ============================================================ */}
      <a
        href="https://wa.me/923300500600?text=Hi%20Haandi%20by%20Yumto!%20I%20have%20an%20inquiry%20regarding%20orders%20and%20reservations."
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          zIndex: 800,
          background: '#25D366',
          color: '#ffffff',
          borderRadius: '99px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontWeight: '800',
          fontSize: '13px',
          boxShadow: '0 4px 18px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: '16px' }}>💬</span>
        <span className="hidden sm:inline">WhatsApp Help</span>
      </a>

      {/* ============================================================
          FLOATING HAANDI LOGO CART BUTTON (BOTTOM RIGHT)
          ============================================================ */}
      <div
        onClick={() => setCartOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
          border: '2.5px solid #F4C430',
          borderRadius: '99px',
          padding: '8px 18px 8px 8px',
          boxShadow: '0 10px 30px rgba(139, 30, 30, 0.5), 0 0 20px rgba(244, 196, 48, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 30, 30, 0.7), 0 0 25px rgba(244, 196, 48, 0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 30, 30, 0.5), 0 0 20px rgba(244, 196, 48, 0.3)';
        }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src="/logo.png"
            alt="Haandi Cart"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              objectFit: 'contain',
              background: '#FDFBF7',
              padding: '2px',
              border: '2px solid #E85D04',
              display: 'block'
            }}
          />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#F4C430',
              color: '#1A120B',
              fontSize: '11px',
              fontWeight: '900',
              borderRadius: '99px',
              minWidth: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
              border: '1.5px solid #8B1E1E'
            }}>
              {cartCount}
            </span>
          )}
        </div>

        <div>
          <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '900', letterSpacing: '0.02em', lineHeight: 1.1 }}>
            View Handi
          </div>
          <div style={{ color: '#F4C430', fontSize: '11px', fontWeight: '800', marginTop: '2px' }}>
            {cartCount > 0 ? `Rs. ${subtotal.toLocaleString()}` : '0 Items'}
          </div>
        </div>
      </div>

      {/* ============================================================
          CUSTOMER AUTHENTICATION & LOGIN MODAL
          ============================================================ */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* ============================================================
          TOAST NOTIFICATION
          ============================================================ */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10000,
          background: toast.type === 'error' ? '#DC2626' : toast.type === 'warning' ? '#F59E0B' : toast.type === 'info' ? '#2563EB' : 'var(--emerald)',
          color: '#ffffff', padding: '12px 20px', borderRadius: '14px', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '700', animation: 'fadeIn 0.25s ease-out'
        }}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

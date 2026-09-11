// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../store/mockDb';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import type { MenuItem, OrderType, OrderItem, CustomerAddress } from '../types';
import { MapPin, ShoppingBag, Trash2, Plus, Minus, X, Navigation, Sparkles, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { LiveTrackingMap } from './LiveTrackingMap';
import { notificationService } from '../services/notificationService';

export const MobileCustomerApp: React.FC = () => {
  const [mobileTab, setMobileTab] = useState<'SPLASH'|'ORDER_TYPE'|'HOME'|'MENU'|'CART'|'PROFILE'>('SPLASH');
  const [custEmail, setCustEmail] = useState('');
  const [custPinLocation, setCustPinLocation] = useState('');
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
  const customerUser = profile ? dbState.getUsers().find(u => u.id === profile.uid || (profile.role === 'CUSTOMER' && u.role === 'CUSTOMER')) : null;
  const savedAddresses: CustomerAddress[] = customerUser?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(savedAddresses[0]?.id || '');
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');

  // Sync profile data
  useEffect(() => {
    if (profile) {
      setCustName(profile.name || '');
      setCustPhone(profile.phone || '');
    } else {
      setCustName('');
      setCustPhone('');
    }
  }, [profile]);

  // Sync delivery address when selected address changes
  useEffect(() => {
    if (orderType === 'DELIVERY' && savedAddresses.length > 0) {
      const activeAddr = savedAddresses.find(a => a.id === selectedAddressId);
      if (activeAddr) {
        setDeliveryAddr(activeAddr.address);
      }
    }
  }, [selectedAddressId, orderType, savedAddresses]);

  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'ONLINE'>('CARD');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [showDiningModeModal, setShowDiningModeModal] = useState(false);
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
      setMobileTab('ORDER_TYPE');
    }, 2500);
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
  const selectedTable = tables.find(t => t.id === selectedTableId) || dbState.getTables('br-isb').find(t => t.id === selectedTableId);
  const activeFloor = floors.find(f => f.id === activeFloorId) || floors[0];
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
    if (orderType === 'DINE_IN' && !selectedTableId) {
      showToast('⚠️ Please select your Dine-In table above first!', 'warning');
      const el = document.getElementById('dine-in-top-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
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

  // Dynamic Billing: Mandatory 5% Service Charge + FBR Tax (5% Card / 16% Cash)
  const billing = dbState.calculateBilling(discountedSubtotal, paymentMethod);
  const serviceCharge = billing.serviceCharge;
  const tax = settings.isTaxActive ? billing.taxAmount : 0;
  const taxableAmount = billing.taxableAmount;
  const taxRatePercent = settings.isTaxActive ? billing.taxRatePercent : 0;
  const premiumReservationFee = 0;
  const grandTotal = discountedSubtotal + serviceCharge + tax + deliveryFee + premiumReservationFee;

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
    if (orderType === 'DINE_IN' && !selectedTableId) {
      showToast('⚠️ Please select your Dine-In table before placing your order!', 'warning');
      setCartOpen(false);
      setTimeout(() => {
        const el = document.getElementById('dine-in-top-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
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
      userEmail: custEmail, userPinLocation: custPinLocation,
      orderType: isReservingTable ? 'DINE_IN' : orderType, tableId: selectedTableId || undefined, reservationId,
      status: 'PENDING',
      paymentStatus: 'PAID', // Advance prepayment verified
      paymentMethod,
      items: cart.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, variation: i.variation })),
      subtotal, discountAmount, discountPercent: appliedPromo ? 10 : 0,
      serviceCharge, serviceChargePercent: 5, taxableAmount, tax, taxRatePercent,
      deliveryFee, premiumReservationFee, total: grandTotal,
      deliveryAddress: fullDeliveryAddress,
    });

    setPlacedOrderId(created.id);
    localStorage.setItem('haandi_last_order_id', created.id);
    setIsOrderPlaced(true);
    setCart([]);
    setSelectedTableId(null);
    setIsReservingTable(false);
    setCartOpen(false);

    // 1. Automated Background WhatsApp Dispatch (Baileys Service)
    const trackingUrl = `${window.location.origin}/#/track/${created.id}`;
    notificationService.sendOrderWhatsAppNotification(created, trackingUrl).then(res => {
      if (res.success) {
        console.log('[WhatsApp Bot] Automated order receipt dispatched to customer:', res.messageId);
      }
    }).catch(err => {
      console.warn('[WhatsApp Bot] Background dispatch skipped:', err);
    });

    // 2. Direct 1-Tap Fallback WhatsApp URI
    const waText = notificationService.formatOrderWhatsAppMessage(created, trackingUrl);
    const waUrl = notificationService.getDirectWhatsAppUrl(created.userPhone, waText);

    // Optional instant open
    try {
      window.open(waUrl, '_blank');
    } catch {
      // Handled in modal
    }

    showToast('🎉 Order Placed! Automated WhatsApp tracking sent.', 'success');
  };


  // MOBILE APP LAYOUT RETURN
  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '100vh', paddingBottom: '70px', display: 'flex', flexDirection: 'column' }}>
      
      {/* ============================================================
          TOP APP BAR (Mobile Apps Order)
          ============================================================ */}
      {mobileTab !== 'SPLASH' && mobileTab !== 'ORDER_TYPE' && (
        <div style={{ 
          position: 'sticky', top: 0, zIndex: 100, background: '#1A120B', 
          padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Haandi" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
            <div style={{ color: '#E85D04', fontWeight: '900', fontSize: '18px', letterSpacing: '0.5px' }}>HAANDI</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {profile ? (
              <button onClick={() => setMobileTab('PROFILE')} style={{ background: 'none', border: 'none', color: '#fff' }}>
                <User style={{ width: '22px', height: '22px' }} />
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' }}>
                Sign In
              </button>
            )}
            <button onClick={() => setMobileTab('CART')} style={{ background: 'none', border: 'none', color: '#fff', position: 'relative' }}>
              <ShoppingBag style={{ width: '22px', height: '22px' }} />
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#E85D04', color: '#fff', fontSize: '10px', fontWeight: '900', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MAIN CONTENT AREA
          ============================================================ */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        
        {mobileTab === 'SPLASH' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'radial-gradient(circle at center, #2A1F17 0%, #1A120B 100%)', margin: '-16px', animation: 'fadeIn 0.3s ease-out' }}>
            <img src="/logo.png" alt="Haandi" style={{ width: '120px', height: '120px', borderRadius: '24px', boxShadow: '0 8px 32px rgba(232, 93, 4, 0.3)' }} />
            <h1 style={{ color: '#E85D04', marginTop: '24px', fontSize: '28px', fontWeight: '900', letterSpacing: '2px' }}>HAANDI</h1>
            <p style={{ color: '#F4C430', fontSize: '14px', fontWeight: '700', marginTop: '8px' }}>By Yumto</p>
          </div>
        )}

        {mobileTab === 'ORDER_TYPE' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'fadeIn 0.3s ease-out', padding: '20px' }}>
            <img src="/logo.png" alt="Haandi" style={{ width: '80px', height: '80px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1A120B', marginBottom: '8px' }}>Welcome!</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px', textAlign: 'center' }}>How would you like to receive your order today?</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <button 
                onClick={() => { setOrderType('DINE_IN'); setIsReservingTable(true); setMobileTab('HOME'); }}
                style={{ background: '#1A120B', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '900', boxShadow: '0 4px 12px rgba(26,18,11,0.2)' }}
              >
                🍽️ Dine-In
              </button>
              <button 
                onClick={() => { setOrderType('PICK_UP'); setIsReservingTable(false); setMobileTab('HOME'); }}
                style={{ background: '#8B1E1E', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '900', boxShadow: '0 4px 12px rgba(139,30,30,0.2)' }}
              >
                🛍️ Takeaway
              </button>
              <button 
                onClick={() => { setOrderType('DELIVERY'); setIsReservingTable(false); setMobileTab('HOME'); }}
                style={{ background: '#E85D04', color: '#fff', padding: '16px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '900', boxShadow: '0 4px 12px rgba(232,93,4,0.2)' }}
              >
                🚚 Delivery
              </button>
            </div>
          </div>
        )}

        {mobileTab === 'HOME' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {/* Delivery/Dine-In Selector at TOP */}
            <div style={{ display: 'flex', background: '#E5E7EB', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
              <button 
                onClick={() => setOrderType('DELIVERY')}
                style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', background: orderType === 'DELIVERY' ? '#1A120B' : 'transparent', color: orderType === 'DELIVERY' ? '#fff' : '#1A120B', transition: 'all 0.2s' }}
              >
                Delivery
              </button>
              <button 
                onClick={() => {
                  setOrderType('PICK_UP');
                  setIsReservingTable(false);
                }}
                style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', background: orderType === 'PICK_UP' ? '#1A120B' : 'transparent', color: orderType === 'PICK_UP' ? '#fff' : '#1A120B', transition: 'all 0.2s' }}
              >
                Takeaway
              </button>
              <button 
                onClick={() => {
                  setOrderType('DINE_IN');
                  setIsReservingTable(true);
                }}
                style={{ flex: 1, padding: '10px 4px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '13px', background: orderType === 'DINE_IN' ? '#1A120B' : 'transparent', color: orderType === 'DINE_IN' ? '#fff' : '#1A120B', transition: 'all 0.2s' }}
              >
                Dine-In
              </button>
            </div>

            {orderType === 'DINE_IN' && (
               <div style={{ background: '#fff', padding: '16px', borderRadius: '14px', marginBottom: '24px', border: '2px solid var(--border-warm)' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '900' }}>1. Select Your Table</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {tables.map(table => {
                      const isAvail = table.status === 'AVAILABLE';
                      const isSelected = selectedTableId === table.id;
                      return (
                        <button
                          key={table.id}
                          onClick={() => { if (isAvail) setSelectedTableId(table.id); }}
                          disabled={!isAvail}
                          style={{
                            padding: '12px', borderRadius: '10px', textAlign: 'left',
                            background: isSelected ? '#FFF9F5' : isAvail ? '#FFFFFF' : '#F5F5F5',
                            border: `2px solid ${isSelected ? '#8B1E1E' : isAvail ? 'var(--border-warm)' : '#E0E0E0'}`,
                            cursor: isAvail ? 'pointer' : 'not-allowed',
                            opacity: isAvail ? 1 : 0.6,
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '14px', color: isSelected ? '#8B1E1E' : '#1A120B' }}>
                              {table.tableNumber}
                            </strong>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {table.capacity} Persons
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedTableId && (
                    <button onClick={() => setMobileTab('MENU')} style={{ marginTop: '16px', width: '100%', padding: '14px', background: 'var(--haandi-red)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', fontSize: '14px' }}>
                      2. Browse Menu
                    </button>
                  )}
               </div>
            )}

              {/* Banner */}
              <div style={{ 
                background: '#1A120B', color: '#fff', padding: '32px 24px', borderRadius: '20px', 
                marginBottom: '24px', position: 'relative', overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'url("https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 0
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to right, rgba(26,18,11,0.95) 0%, rgba(26,18,11,0.8) 60%, rgba(26,18,11,0.2) 100%)',
                  zIndex: 1
                }} />
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'inline-block', background: 'rgba(232,93,4,0.3)', border: '1px solid var(--haandi-saffron)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', color: '#F4C430', fontWeight: '800', marginBottom: '12px', backdropFilter: 'blur(4px)' }}>
                    🔥 Live Charcoal BBQ
                  </div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '26px', fontWeight: '900', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    Experience <br/><span style={{ color: '#E85D04' }}>Clay Pot Handi</span>
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, maxWidth: '80%' }}>
                    Slow-cooked over natural charcoal fire. Authentic taste of tradition.
                  </p>
                  
                  <button onClick={() => setMobileTab('MENU')} style={{ 
                    marginTop: '24px', background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)', 
                    color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '12px', 
                    fontWeight: '900', fontSize: '15px', boxShadow: '0 6px 20px rgba(232,93,4,0.4)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px'
                  }}>
                    Order Now <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            
            {/* Quick Categories */}
            <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px' }}>Categories</h3>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
               {allCategories.filter(c => c !== 'All').map(cat => (
                 <button 
                   key={cat}
                   onClick={() => { setActiveCategory(cat); setMobileTab('MENU'); }}
                   style={{ minWidth: '100px', padding: '12px', borderRadius: '12px', background: '#fff', border: '1.5px solid var(--border-warm)', fontWeight: '800', fontSize: '12px', color: 'var(--text-dark)' }}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>
        )}

        {mobileTab === 'MENU' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {/* Category Swiper */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px', msOverflowStyle: 'none', scrollbarWidth: 'none', borderBottom: '1px solid var(--border-warm)' }}>
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: '99px', whiteSpace: 'nowrap',
                    background: activeCategory === cat ? '#1A120B' : 'transparent',
                    color: activeCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    border: activeCategory === cat ? 'none' : '1px solid var(--border-warm)',
                    fontWeight: '800', fontSize: '12px', transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu List */}
            {groupedByCategory.map(group => (
              <div key={group.cat} style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px', color: 'var(--haandi-red)' }}>{group.cat}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {group.items.map(item => {
                    const inCart = cart.find(i => i.menuItemId === item.id);
                    const cartIdx = cart.findIndex(i => i.menuItemId === item.id);
                    return (
                      <div key={item.id} style={{ display: 'flex', background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-warm)', gap: '12px' }}>
                         <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                           <div>
                             <div style={{ fontWeight: '900', fontSize: '14px', color: 'var(--text-dark)' }}>{item.name}</div>
                             <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description}</div>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                             <div style={{ fontWeight: '900', color: 'var(--haandi-red)', fontSize: '13px' }}>Rs. {item.price.toLocaleString()}</div>
                             {inCart ? (
                              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-cream-light)', borderRadius: '6px', border: '1px solid var(--border-warm)' }}>
                                <button onClick={() => updateQuantity(cartIdx, -1)} style={{ padding: '4px 8px', border: 'none', background: 'transparent' }}><Minus style={{ width: '12px', height: '12px' }} /></button>
                                <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: '800' }}>{inCart.quantity}</span>
                                <button onClick={() => updateQuantity(cartIdx, 1)} style={{ padding: '4px 8px', border: 'none', background: 'transparent' }}><Plus style={{ width: '12px', height: '12px' }} /></button>
                              </div>
                            ) : (
                              <button onClick={() => addToCart(item)} style={{ background: '#1A120B', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '800' }}>
                                Add
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
        )}

        {mobileTab === 'CART' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '16px' }}>Your Handi Cart</h2>
            
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <ShoppingBag style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontWeight: '800', fontSize: '16px' }}>Your cart is empty</p>
                <button onClick={() => setMobileTab('MENU')} style={{ marginTop: '16px', background: 'var(--haandi-red)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '800' }}>Browse Menu</button>
              </div>
            ) : (
              <div>
                {/* Cart Items */}
                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border-warm)', padding: '12px', marginBottom: '20px' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx < cart.length - 1 ? '1px dashed var(--border-warm)' : 'none' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-dark)' }}>{item.name}</div>
                        <div style={{ color: 'var(--haandi-red)', fontSize: '12px', fontWeight: '900', marginTop: '2px' }}>Rs. {item.price.toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-cream-light)', borderRadius: '6px', border: '1px solid var(--border-warm)' }}>
                        <button onClick={() => updateQuantity(idx, -1)} style={{ padding: '6px 10px', border: 'none', background: 'transparent' }}><Minus style={{ width: '12px', height: '12px' }} /></button>
                        <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: '900' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} style={{ padding: '6px 10px', border: 'none', background: 'transparent' }}><Plus style={{ width: '12px', height: '12px' }} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact & Location Details */}
                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border-warm)', padding: '16px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '12px' }}>Contact Details</h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginBottom: '10px', fontSize: '13px' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginBottom: '10px', fontSize: '13px' }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={custEmail}
                    onChange={e => setCustEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginBottom: '10px', fontSize: '13px' }}
                  />

                  {orderType === 'DELIVERY' && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-warm)', paddingTop: '12px' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '900', marginBottom: '12px' }}>Delivery Address</h3>
                      <select
                        value={selectedSector}
                        onChange={e => setSelectedSector(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginBottom: '10px', fontSize: '13px' }}
                      >
                        {GULBERG_SECTORS.map(s => (
                          <option key={s.name} value={s.name}>{s.name} ({s.distanceKm} km)</option>
                        ))}
                      </select>
                      <textarea
                        placeholder="Full Address (House, Street, Block)"
                        value={deliveryAddr}
                        onChange={e => setDeliveryAddr(e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid var(--border-warm)', marginBottom: '10px', fontSize: '13px' }}
                      />
                      <button 
                        onClick={() => {
                           if (navigator.geolocation) {
                             navigator.geolocation.getCurrentPosition(pos => {
                               setCustPinLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
                               showToast('Location Pinned Successfully!', 'success');
                             }, () => {
                               showToast('Location permission denied', 'error');
                             });
                           }
                        }}
                        style={{ width: '100%', padding: '10px', background: custPinLocation ? 'var(--emerald-light)' : '#E5E7EB', color: custPinLocation ? 'var(--emerald)' : '#1A120B', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <MapPin style={{ width: '16px', height: '16px' }} />
                        {custPinLocation ? '📍 Location Pinned' : '📍 Pin My Live Location'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border-warm)', padding: '16px', marginBottom: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                     <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                     <span style={{ fontWeight: '800' }}>Rs. {subtotal.toLocaleString()}</span>
                   </div>
                   {discountAmount > 0 && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                       <span style={{ color: 'var(--haandi-red)' }}>Discount</span>
                       <span style={{ fontWeight: '800', color: 'var(--haandi-red)' }}>-Rs. {discountAmount.toLocaleString()}</span>
                     </div>
                   )}
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                     <span style={{ color: 'var(--text-muted)' }}>Service Charge (5%)</span>
                     <span style={{ fontWeight: '800' }}>Rs. {serviceCharge.toLocaleString()}</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                     <span style={{ color: 'var(--text-muted)' }}>GST ({taxRatePercent}%)</span>
                     <span style={{ fontWeight: '800' }}>Rs. {tax.toLocaleString()}</span>
                   </div>
                   {deliveryFee > 0 && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                       <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                       <span style={{ fontWeight: '800' }}>Rs. {deliveryFee.toLocaleString()}</span>
                     </div>
                   )}
                   <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dashed var(--border-warm)', fontSize: '16px' }}>
                     <span style={{ fontWeight: '900' }}>Total</span>
                     <span style={{ fontWeight: '900', color: 'var(--haandi-red)' }}>
                       Rs. {grandTotal.toLocaleString()}
                     </span>
                   </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  style={{ width: '100%', padding: '16px', background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '15px' }}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        )}

        {mobileTab === 'PROFILE' && (
          <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            {profile ? (
              <div>
                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border-warm)', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: 'var(--bg-cream)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <User style={{ width: '28px', height: '28px', color: 'var(--text-muted)' }} />
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900' }}>{profile.name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{profile.phone}</p>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '12px' }}>Support & Info</h3>
                <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border-warm)', overflow: 'hidden' }}>
                  <a href="https://wa.me/923300500600" target="_blank" rel="noreferrer" style={{ display: 'flex', padding: '16px', borderBottom: '1px solid var(--border-warm)', textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '800' }}>
                    💬 WhatsApp Support
                  </a>
                  <button onClick={() => setShowOrderHistoryModal(true)} style={{ display: 'flex', width: '100%', textAlign: 'left', padding: '16px', background: 'none', border: 'none', color: 'var(--text-dark)', fontWeight: '800' }}>
                    🧾 Order History
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', borderRadius: '14px', border: '1px solid var(--border-warm)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px' }}>Join Haandi</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Sign in to track orders and save your address.</p>
                <button onClick={() => setShowAuthModal(true)} style={{ background: '#1A120B', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '10px', fontWeight: '900' }}>
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          BOTTOM NAVIGATION BAR (Mobile Apps Order)
          ============================================================ */}
      {mobileTab !== 'SPLASH' && mobileTab !== 'ORDER_TYPE' && (
        <div style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', 
          borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-around', 
          padding: '10px 0', zIndex: 100, paddingBottom: 'max(10px, env(safe-area-inset-bottom))'
        }}>
          {[
            { id: 'HOME', icon: <MapPin style={{ width: '20px', height: '20px' }} />, label: 'Home' },
            { id: 'MENU', icon: <Navigation style={{ width: '20px', height: '20px' }} />, label: 'Menu' },
            { id: 'CART', icon: (
              <div style={{ position: 'relative' }}>
                <ShoppingBag style={{ width: '20px', height: '20px' }} />
                {cart.length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-8px', background: '#E85D04', color: '#fff', fontSize: '9px', fontWeight: '900', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cart.length}
                  </span>
                )}
              </div>
            ), label: 'Cart' },
            { id: 'PROFILE', icon: <User style={{ width: '20px', height: '20px' }} />, label: 'Profile' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setMobileTab(tab.id as any)}
              style={{ 
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', gap: '4px', color: mobileTab === tab.id ? '#8B1E1E' : '#9CA3AF',
                fontWeight: mobileTab === tab.id ? '900' : '600',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              <span style={{ fontSize: '10px' }}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Auth Modal Support */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Toast Support */}
      {toast && (
        <div style={{
          position: 'fixed', top: '70px', left: '16px', right: '16px', zIndex: 10000,
          background: toast.type === 'error' ? '#DC2626' : toast.type === 'warning' ? '#F59E0B' : toast.type === 'info' ? '#2563EB' : 'var(--emerald)',
          color: '#ffffff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', animation: 'fadeIn 0.25s ease-out'
        }}>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
};


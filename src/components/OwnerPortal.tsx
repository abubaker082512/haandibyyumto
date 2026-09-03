import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import type { MenuItem } from '../types';
import { 
  Plus, Edit2, Trash2, DollarSign, 
  ShoppingBag, Calendar, Layers, X,
  Percent, Sparkles, ToggleLeft, ToggleRight
} from 'lucide-react';

export const OwnerPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  
  // Refresh on database update
  useEffect(() => {
    return db.subscribe(() => {
      setDbState(Object.create(db));
    });
  }, []);

  const menu = dbState.getMenu();
  const orders = dbState.getOrders();
  const reservations = dbState.getReservations();
  const settings = dbState.getSettings();

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TAX_CONTROL' | 'MENU' | 'BRANCHES'>('OVERVIEW');

  // Dialog / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields (Menu Item)
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Handi Special');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [branchesAvailable, setBranchesAvailable] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Tax Settings Message
  const [taxMessage, setTaxMessage] = useState<string | null>(null);

  const toggleGlobalTax = () => {
    const newTaxState = !settings.isTaxActive;
    db.updateSettings({ isTaxActive: newTaxState });
    setTaxMessage(newTaxState ? '✓ Sales Tax ACTIVATED (5% Card / 16% Cash)' : '⚠ Sales Tax DEACTIVATED (0% System-Wide Tax Exemption)');
    setTimeout(() => setTaxMessage(null), 3500);
  };

  // Stats calculation
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
  
  // Orders per type
  const deliveryCount = orders.filter(o => o.orderType === 'DELIVERY').length;
  const pickupCount = orders.filter(o => o.orderType === 'PICK_UP').length;
  const dineinCount = orders.filter(o => o.orderType === 'DINE_IN').length;

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price);
    setCategory(item.category);
    setDescription(item.description);
    setImageUrl(item.imageUrl);
    setBranchesAvailable(item.branchesAvailable);
    setIsAvailable(item.isAvailable);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setName('');
    setPrice(0);
    setCategory('Handi Special');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80');
    setBranchesAvailable(['br-isb']);
    setIsAvailable(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      dbState.deleteMenuItem(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || !category) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingItem) {
      dbState.updateMenuItem({
        id: editingItem.id,
        name,
        price,
        category,
        description,
        imageUrl,
        branchesAvailable,
        isAvailable
      });
    } else {
      dbState.addMenuItem({
        name,
        price,
        category,
        description,
        imageUrl,
        branchesAvailable,
        isAvailable
      });
    }

    setIsFormOpen(false);
  };

  return (
    <div style={{ background: 'var(--bg-cream)', minHeight: '90vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Top Header Card */}
        <div style={{
          background: 'linear-gradient(135deg, #1A120B 0%, #2A1F17 100%)',
          border: '1.5px solid var(--border-warm)', borderRadius: '20px', padding: '20px 24px',
          color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '16px', marginBottom: '24px', boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: '#FDFBF7',
              padding: '3px', border: '2px solid var(--haandi-saffron)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <img src="/logo.png" alt="Haandi" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '900', color: '#ffffff' }}>
                  Haandi Executive HQ
                </h1>
                <span style={{ background: 'rgba(244,196,48,0.2)', color: '#F4C430', border: '1px solid #F4C430', padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '800' }}>
                  OWNER
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>
                Chain Control, Global Tax Rules & Menu Management · Islamabad
              </p>
            </div>
          </div>

          {/* Master Tax Quick Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              onClick={toggleGlobalTax}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: settings.isTaxActive ? 'rgba(22,163,74,0.18)' : 'rgba(220,38,38,0.18)',
                border: `1.5px solid ${settings.isTaxActive ? '#16A34A' : '#DC2626'}`,
                borderRadius: '12px', padding: '8px 14px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Click to toggle Sales Tax system-wide"
            >
              <Percent style={{ width: '16px', height: '16px', color: settings.isTaxActive ? '#4ADE80' : '#F87171' }} />
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '800' }}>
                  Global Tax
                </div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: settings.isTaxActive ? '#4ADE80' : '#F87171' }}>
                  {settings.isTaxActive ? 'TAX ACTIVE (5%/16%)' : 'TAX DEACTIVATED (0%)'}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '12px' }}>
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
                  background: activeTab === 'OVERVIEW' ? 'var(--haandi-red)' : 'transparent',
                  color: activeTab === 'OVERVIEW' ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('TAX_CONTROL')}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
                  background: activeTab === 'TAX_CONTROL' ? 'var(--haandi-red)' : 'transparent',
                  color: activeTab === 'TAX_CONTROL' ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }}
              >
                Tax Policy
              </button>
              <button
                onClick={() => setActiveTab('MENU')}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
                  background: activeTab === 'MENU' ? 'var(--haandi-red)' : 'transparent',
                  color: activeTab === 'MENU' ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }}
              >
                Menu ({menu.length})
              </button>
              <button
                onClick={() => setActiveTab('BRANCHES')}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: 'none', cursor: 'pointer',
                  background: activeTab === 'BRANCHES' ? 'var(--haandi-red)' : 'transparent',
                  color: activeTab === 'BRANCHES' ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }}
              >
                Outlets
              </button>
            </div>
          </div>
        </div>

        {/* Tax Notification Banner */}
        {taxMessage && (
          <div style={{
            background: settings.isTaxActive ? '#F0FDF4' : '#FEF2F2',
            border: `1.5px solid ${settings.isTaxActive ? '#86EFAC' : '#FCA5A5'}`,
            color: settings.isTaxActive ? '#15803D' : '#DC2626',
            padding: '12px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '13px',
            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span>{taxMessage}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--haandi-saffron-light)', color: 'var(--haandi-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-dark)' }}>Rs. {totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--emerald-light)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orders Dispatched</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-dark)' }}>{orders.length} Total</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244,196,48,0.2)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Table Bookings</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-dark)' }}>{reservations.length} Active</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,30,30,0.1)', color: 'var(--haandi-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers style={{ width: '20px', height: '20px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Branch</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-dark)' }}>Gulberg Greens</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Order Channels */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '18px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '14px' }}>
                  Dining Channel Distribution
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>🛵 Delivery (Gulberg 2.5 km)</span>
                    <strong style={{ color: 'var(--haandi-red)' }}>{deliveryCount} orders</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>🛍️ Takeaway / Pickup</span>
                    <strong style={{ color: 'var(--haandi-saffron)' }}>{pickupCount} orders</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>🪑 Dine-In & Majlis</span>
                    <strong style={{ color: 'var(--emerald)' }}>{dineinCount} orders</strong>
                  </div>
                </div>
              </div>

              {/* Tax & Compliance Summary */}
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '18px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '14px' }}>
                  FBR Sales Tax Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>System Status:</span>
                    <strong style={{ color: settings.isTaxActive ? 'var(--emerald)' : '#DC2626' }}>
                      {settings.isTaxActive ? '✓ Tax Active' : '⚠ Tax Deactivated (0%)'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Digital / Card Rate:</span>
                    <strong>{settings.isTaxActive ? `${settings.salesTaxCardPercent}%` : '0%'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cash POS Rate:</span>
                    <strong>{settings.isTaxActive ? `${settings.salesTaxCashPercent}%` : '0%'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAX CONTROL PANEL */}
        {activeTab === 'TAX_CONTROL' && (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '20px', padding: '28px', maxWidth: '720px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--haandi-saffron-light)', color: 'var(--haandi-saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Percent style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '900', color: 'var(--text-dark)' }}>
                  Haandi System-Wide Sales Tax Control
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Activate or deactivate sales tax computation across all Web, Mobile, and POS Cashier Terminals.
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-cream-light)', border: '1.5px solid var(--border-warm)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    Master Sales Tax Switch
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {settings.isTaxActive
                      ? 'Tax is currently ENABLED. Card/Online orders charge 5% tax; Cash orders charge 16% tax.'
                      : 'Tax is currently DISABLED. All orders across customer website and POS terminals will charge 0% tax.'}
                  </div>
                </div>

                <button
                  onClick={toggleGlobalTax}
                  style={{
                    background: settings.isTaxActive ? 'var(--emerald)' : '#9CA3AF',
                    color: '#ffffff', border: 'none', borderRadius: '99px',
                    padding: '10px 20px', fontWeight: '900', fontSize: '13px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.2)', transition: 'all 0.2s'
                  }}
                >
                  {settings.isTaxActive ? <ToggleRight style={{ width: '22px', height: '22px' }} /> : <ToggleLeft style={{ width: '22px', height: '22px' }} />}
                  <span>{settings.isTaxActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}</span>
                </button>
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '8px' }}>
                Live Ticket Simulation (Rs. 1,000 Order):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: 'var(--bg-cream-light)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-warm)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-muted)' }}>💳 Card / Online Payment:</div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--haandi-red)', marginTop: '4px' }}>
                    Tax: Rs. {settings.isTaxActive ? '50 (5%)' : '0 (0%)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Total Payable: Rs. {settings.isTaxActive ? '1,050' : '1,000'}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-cream-light)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-warm)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-muted)' }}>💵 Cash POS Payment:</div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: 'var(--haandi-red)', marginTop: '4px' }}>
                    Tax: Rs. {settings.isTaxActive ? '160 (16%)' : '0 (0%)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Total Payable: Rs. {settings.isTaxActive ? '1,160' : '1,000'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MENU MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>
                  Haandi Menu Catalog
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage authentic Handi, Karahi, and BBQ items</p>
              </div>
              <button
                onClick={handleAddClick}
                style={{
                  background: 'var(--haandi-red)', color: '#ffffff', border: 'none', borderRadius: '10px',
                  padding: '10px 18px', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Add Menu Item</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {menu.map(item => (
                <div key={item.id} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '16px', padding: '14px', display: 'flex', gap: '12px' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-warm)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--haandi-saffron)', fontWeight: '700' }}>{item.category}</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--haandi-red)', marginTop: '2px' }}>
                        Rs. {item.price.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button
                        onClick={() => handleEditClick(item)}
                        style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--bg-cream-light)', border: '1px solid var(--border-warm)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <Edit2 style={{ width: '12px', height: '12px', display: 'inline', marginRight: '3px' }} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        style={{ padding: '4px 8px', borderRadius: '6px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        <Trash2 style={{ width: '12px', height: '12px', display: 'inline', marginRight: '3px' }} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OUTLET BRANCH */}
        {activeTab === 'BRANCHES' && (
          <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border-warm)', borderRadius: '20px', padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '14px' }}>
              Active Branch & Delivery Zone
            </h2>
            <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-dark)' }}>
                Haandi by Yumto - Islamabad (Single Active Location)
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Gulberg Greens, Civic Center, Executive Block, Islamabad
              </div>
              <div style={{ fontSize: '13px', color: 'var(--haandi-red)', fontWeight: '800', marginTop: '6px' }}>
                📞 0330 0500600 · NTN/GST: 4585147-3
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <span style={{ background: 'var(--emerald-light)', color: 'var(--emerald)', border: '1px solid var(--emerald-border)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '800' }}>
                  ✓ 2.5 km Delivery Radius
                </span>
                <span style={{ background: 'var(--haandi-saffron-light)', color: 'var(--haandi-saffron)', border: '1px solid var(--haandi-saffron)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: '800' }}>
                  ✓ Advance Prepayment Only
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Item Edit Modal */}
        {isFormOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(26,18,11,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'var(--bg-cream-light)', borderRadius: '20px', maxWidth: '440px', width: '100%', overflow: 'hidden', border: '1.5px solid var(--border-warm)', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ background: 'var(--bg-dark)', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '800', fontSize: '15px' }}>{editingItem ? 'Edit Menu Item' : 'Add New Item'}</div>
                <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}><X /></button>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Item Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '13px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Price (PKR)</label>
                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min={1} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '13px' }}>
                      {['Handi Special', 'Karahi Special', 'Charcoal BBQ', 'Rice & Biryani', 'Roti & Naan', 'Soup', 'Salad', 'Beverages', 'Desserts'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '12px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '4px' }}>Image URL</label>
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border-warm)', fontSize: '12px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-warm)', fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 18px', borderRadius: '8px', background: 'var(--haandi-red)', color: '#ffffff', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}>Save Dish</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

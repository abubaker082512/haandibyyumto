import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import type { MenuItem } from '../types';
import { 
  Plus, Edit2, Trash2, Shield, DollarSign, 
  ShoppingBag, Calendar, Layers, Check, X
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
  const branches = dbState.getBranches();
  const orders = dbState.getOrders();
  const reservations = dbState.getReservations();

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MENU' | 'BRANCHES'>('OVERVIEW');

  // Dialog / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields (Menu Item)
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('Mandi Platters');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [branchesAvailable, setBranchesAvailable] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  // Branch Form States
  const [isBranchFormOpen, setIsBranchFormOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('Lahore');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchFee, setBranchFee] = useState(500);
  const [branchSurcharge, setBranchSurcharge] = useState(true);

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
    setCategory('Mandi Platters');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=400&q=80');
    setBranchesAvailable(branches.map(b => b.id)); // Default all branches
    setIsAvailable(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      dbState.deleteMenuItem(id);
    }
  };

  const handleBranchToggle = (branchId: string) => {
    setBranchesAvailable(prev => 
      prev.includes(branchId) 
        ? prev.filter(id => id !== branchId) 
        : [...prev, branchId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || !category) {
      alert("Please fill in all required fields.");
      return;
    }

    const itemData = {
      name,
      price,
      description,
      category,
      imageUrl,
      branchesAvailable,
      isAvailable
    };

    if (editingItem) {
      dbState.updateMenuItem({ ...itemData, id: editingItem.id });
    } else {
      dbState.addMenuItem(itemData);
    }

    setIsFormOpen(false);
    setEditingItem(null);
  };

  const toggleItemAvailability = (item: MenuItem) => {
    dbState.updateMenuItem({
      ...item,
      isAvailable: !item.isAvailable
    });
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim() || !branchPhone.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    dbState.addBranch({
      name: branchName,
      city: branchCity,
      address: branchAddress,
      phone: branchPhone,
      premiumBookingFee: branchFee,
      activeSurchargeToggle: branchSurcharge
    });
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    setIsBranchFormOpen(false);
  };

  const handleDeleteBranch = (id: string) => {
    if (branches.length <= 1) {
      alert("At least one branch must remain in the system.");
      return;
    }
    if (confirm("Are you sure you want to delete this branch? All table layouts and configurations for it will be removed.")) {
      dbState.deleteBranch(id);
    }
  };

  return (
    <div className="animate-fade container py-6 flex flex-col items-center justify-center">
      
      {/* Laptop Mockup Wrapper */}
      <div className="device-laptop-frame bg-bg-secondary p-4 relative text-left">
        {/* Header toolbar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border-color/40 bg-bg-tertiary mb-3 rounded">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-80" />
          <span className="text-[10px] text-text-secondary ml-3 font-semibold">https://admin.yumtomandi.com/dashboard</span>
        </div>

        {/* Header section */}
        <div className="gold-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-3">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold flex items-center gap-1.5" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Shield className="text-gold w-4.5 h-4.5" /> Executive Owner Dashboard
          </h2>
          <p className="text-[11px] text-text-secondary">Chain-wide branch locations, analytics and menu catalog administration</p>
        </div>
        
        {/* Dynamic CTA button depending on tab */}
        <div className="flex gap-2 shrink-0">
          {activeTab === 'MENU' && (
            <button 
              onClick={handleAddClick} 
              className="gold-btn py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Menu Item
            </button>
          )}
          {activeTab === 'BRANCHES' && (
            <button 
              onClick={() => setIsBranchFormOpen(true)} 
              className="gold-btn py-1.5 px-3 text-[11px] font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Branch
            </button>
          )}
        </div>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #e5e7eb', paddingBottom: '2px' }}>
        {[
          { id: 'OVERVIEW', label: '📈 Chain Overview' },
          { id: 'MENU', label: '🍽️ Menu Administration' },
          { id: 'BRANCHES', label: '🏢 Branch Locations' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px 8px 0 0',
                background: isActive ? '#F4C430' : 'transparent',
                color: isActive ? '#0d0d0d' : '#4b5563',
                border: 'none',
                fontWeight: isActive ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderBottom: isActive ? 'none' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ==========================================
          TAB 1: CHAIN OVERVIEW
          ========================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4 animate-fade">
          {/* Analytics Card Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="gold-card p-3 flex items-center gap-3">
              <div className="p-2 rounded bg-gold-alpha text-gold"><DollarSign className="w-5 h-5" /></div>
              <div>
                <div className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Total Revenue</div>
                <div className="text-sm font-bold text-text-primary">Rs. {totalRevenue.toLocaleString()}</div>
              </div>
            </div>

            <div className="gold-card p-3 flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-alpha text-emerald"><ShoppingBag className="w-5 h-5" /></div>
              <div>
                <div className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Sales Volume</div>
                <div className="text-sm font-bold text-text-primary">{orders.length} Orders</div>
              </div>
            </div>

            <div className="gold-card p-3 flex items-center gap-3">
              <div className="p-2 rounded bg-amber-alpha text-amber"><Calendar className="w-5 h-5" /></div>
              <div>
                <div className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Table Reservations</div>
                <div className="text-sm font-bold text-text-primary">{reservations.length} Booked</div>
              </div>
            </div>

            <div className="gold-card p-3 flex items-center gap-3">
              <div className="p-2 rounded bg-zinc-800 text-white"><Layers className="w-5 h-5" /></div>
              <div>
                <div className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">Outlet Branches</div>
                <div className="text-sm font-bold text-text-primary">{branches.length} Outlets</div>
              </div>
            </div>

          </div>

          {/* Visual Analytics graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Branch Revenue Chart */}
            <div className="gold-card space-y-3 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-color pb-1.5">Branch Sales Breakdown</h3>
              <div className="space-y-3 pt-1">
                {branches.map(br => {
                  const rev = completedOrders.filter(o => o.branchId === br.id).reduce((acc, o) => acc + o.total, 0);
                  const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
                  return (
                    <div key={br.id} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-text-primary font-semibold">
                        <span>{br.name.split(' - ')[1] || br.name}</span>
                        <span className="text-gold">Rs. {rev.toLocaleString()} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden border border-border-color">
                        <div 
                          className="h-full bg-gold transition-all duration-500" 
                          style={{ width: `${pct || 1}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Channel Breakdown */}
            <div className="gold-card space-y-3 p-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-color pb-1.5">Order Channels</h3>
              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-text-primary">{deliveryCount}</div>
                  <div className="text-[10px] text-text-secondary uppercase">Delivery</div>
                  <div className="w-full bg-emerald h-1 rounded-full mt-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-text-primary">{dineinCount}</div>
                  <div className="text-[10px] text-text-secondary uppercase">Dine-In</div>
                  <div className="w-full bg-gold h-1 rounded-full mt-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-text-primary">{pickupCount}</div>
                  <div className="text-[10px] text-text-secondary uppercase">Pick-Up</div>
                  <div className="w-full bg-amber h-1 rounded-full mt-1.5" />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: MENU ADMINISTRATION
          ========================================== */}
      {activeTab === 'MENU' && (
        <div className="space-y-6 animate-fade">
          <h3 className="text-sm font-bold border-b border-color pb-1.5 uppercase tracking-wider text-text-secondary">Global Menu Administration</h3>
          
          {Array.from(new Set(menu.map(item => item.category))).map(cat => {
            const catItems = menu.filter(item => item.category === cat);
            return (
              <div key={cat} className="space-y-3">
                <h4 className="text-[11px] font-bold text-text-primary border-l-4 border-yellow pl-2 uppercase tracking-wider flex items-center justify-between">
                  <span>{cat}</span>
                  <span className="text-xs text-text-secondary font-normal lowercase">({catItems.length} {catItems.length === 1 ? 'item' : 'items'})</span>
                </h4>
                
                <div className="owner-menu-grid">
                  {catItems.map(item => (
                    <div key={item.id} className="border border-border-color rounded-xl p-3 bg-white flex flex-col justify-between hover:shadow-md transition">
                      <div className="flex gap-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="owner-menu-img border border-border-color bg-bg-tertiary"
                          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; }}
                        />
                        <div className="space-y-0.5 text-xs flex-1 min-w-0 font-medium">
                          <div className="font-bold text-text-primary truncate" title={item.name}>{item.name}</div>
                          <div className="text-gold font-bold">Rs. {item.price.toLocaleString()}</div>
                          <p className="text-[10px] text-text-secondary line-clamp-1 leading-normal" title={item.description}>
                            {item.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-color/40 pt-2 mt-2 flex items-center justify-between">
                        <button 
                          onClick={() => toggleItemAvailability(item)}
                          className="text-xs"
                        >
                          {item.isAvailable ? (
                            <span className="badge badge-emerald py-0.5 px-2 text-[9px]"><Check className="w-2.5 h-2.5 mr-0.5 inline" /> Active</span>
                          ) : (
                            <span className="badge badge-ruby py-0.5 px-2 text-[9px]"><X className="w-2.5 h-2.5 mr-0.5 inline" /> Paused</span>
                          )}
                        </button>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 bg-bg-tertiary hover:bg-gold-alpha text-text-secondary hover:text-gold border border-border-color rounded transition-all"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-1 bg-bg-tertiary hover:bg-ruby-alpha text-text-secondary hover:text-ruby border border-border-color rounded transition-all"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ==========================================
          TAB 3: BRANCH LOCATIONS
          ========================================== */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-4 animate-fade">
          <h3 className="text-sm font-bold border-b border-color pb-1.5 uppercase tracking-wider text-text-secondary">Outlet Network Locations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map(br => (
              <div key={br.id} className="gold-card flex flex-col justify-between p-3.5 space-y-3 border border-border-color bg-white hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex justify-between items-start border-b border-color/40 pb-2">
                    <div>
                      <div className="font-bold text-sm text-text-primary" style={{ fontFamily: 'Playfair Display, serif' }}>{br.name}</div>
                      <span className="text-[9px] font-bold tracking-wider uppercase bg-gold-alpha text-gold py-0.5 px-2 rounded-full border border-gold/10 mt-1 inline-block">
                        {br.city}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteBranch(br.id)}
                      className="p-1.5 bg-bg-tertiary hover:bg-ruby-alpha text-text-secondary hover:text-ruby border border-border-color rounded transition-all shrink-0"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-[11px] text-text-secondary space-y-1">
                    <div>📍 <strong>Address:</strong> {br.address}</div>
                    <div>📞 <strong>Phone:</strong> {br.phone}</div>
                  </div>

                  <div className="border-t border-color/40 pt-2.5 mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-text-secondary">Surcharge Fee</span>
                      <input 
                        type="number"
                        value={br.premiumBookingFee}
                        onChange={(e) => dbState.updateBranchPremiumFee(br.id, Number(e.target.value))}
                        className="bg-bg-tertiary border border-border-color rounded px-2 py-0.5 text-xs text-text-primary w-20 font-bold focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-text-secondary">Surcharge Enabled</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={br.activeSurchargeToggle}
                          onChange={(e) => dbState.updateBranchSurchargeToggle(br.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-4 bg-bg-tertiary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Modal Inline Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade">
          <div className="gold-card max-w-lg w-full space-y-4 animate-slideup max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-color pb-3">
              <h3 className="text-lg font-bold text-gold">
                {editingItem ? 'Edit Menu Item Details' : 'Add New Dish to Menu'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-text-secondary">Dish Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-text-secondary">Pricing (Rs.) *</label>
                  <input 
                    type="number" 
                    required 
                    min={1}
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-text-secondary">Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  >
                    <option value="Mandi Platters">Mandi Platters</option>
                    <option value="Grills & Shawarma">Grills & Shawarma</option>
                    <option value="Appetizers & Sides">Appetizers & Sides</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-text-secondary">Image URL</label>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-text-secondary">Description</label>
                <textarea 
                  rows={3}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2 border-t border-color/40 pt-3">
                <span className="block text-text-secondary font-semibold">Available Outlet Locations</span>
                <div className="flex gap-4">
                  {branches.map(br => (
                    <label key={br.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={branchesAvailable.includes(br.id)}
                        onChange={() => handleBranchToggle(br.id)}
                        className="rounded border-border-color text-gold focus:ring-0 focus:ring-offset-0 bg-bg-tertiary"
                      />
                      <span className="text-text-primary">{br.name.split(' - ')[1] || br.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-color/40 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded border-border-color text-gold bg-bg-tertiary"
                  />
                  <span className="text-text-primary font-semibold">Mark Available for Ordering</span>
                </label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-border-color rounded-lg text-text-secondary hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="gold-btn px-4 py-2"
                  >
                    {editingItem ? 'Save Changes' : 'Publish Dish'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: ADD BRANCH
          ========================================== */}
      {isBranchFormOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade">
          <div className="gold-card max-w-md w-full space-y-4 animate-slideup">
            <div className="flex justify-between items-center border-b border-color pb-3">
              <h3 className="text-lg font-bold text-gold">Add New Branch Outlet</h3>
              <button 
                onClick={() => setIsBranchFormOpen(false)}
                className="text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBranchSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-text-secondary">Branch Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Yumto Mandi - Gulberg"
                  value={branchName} 
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-text-secondary">City *</label>
                  <select 
                    value={branchCity} 
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-text-secondary">Contact Phone *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 0300-0000000"
                    value={branchPhone} 
                    onChange={(e) => setBranchPhone(e.target.value)}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-text-secondary">Full Location Address *</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="e.g. Plot #12-A, Main Boulevard, Lahore"
                  value={branchAddress} 
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-color/40 pt-3">
                <div className="space-y-1">
                  <label className="block text-text-secondary">Peak Booking Fee (Rs.)</label>
                  <input 
                    type="number"
                    value={branchFee} 
                    onChange={(e) => setBranchFee(Number(e.target.value))}
                    className="w-full bg-bg-tertiary border border-border-color rounded-lg p-2.5 text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={branchSurcharge}
                      onChange={(e) => setBranchSurcharge(e.target.checked)}
                      className="rounded border-border-color text-gold bg-bg-tertiary"
                    />
                    <span className="text-text-primary font-semibold">Enable Surcharge</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-color/40 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsBranchFormOpen(false)}
                  className="px-4 py-2 border border-border-color rounded-lg text-text-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="gold-btn px-4 py-2"
                >
                  Create Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
      {/* Laptop metal base bar */}
      <div className="device-laptop-base" />
    </div>
  );
};
export default OwnerPortal;

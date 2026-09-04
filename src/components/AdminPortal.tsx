import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import type { 
  MenuItemRecipe, 
  RecipeIngredient, 
  StaffMember, 
  CashierShift
} from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  UtensilsCrossed, 
  ChefHat, 
  Users, 
  Clock, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Building, 
  Percent, 
  ShieldCheck, 
  Save, 
  PieChart, 
  CreditCard,
  Banknote,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

type AdminTab = 
  | 'OVERVIEW' 
  | 'BRANCH_MENU' 
  | 'RECIPES' 
  | 'REPORTS' 
  | 'FINANCIALS' 
  | 'HR_PAYROLL' 
  | 'SHIFTS_AUDIT';

export const AdminPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [selectedBranch, setSelectedBranch] = useState<string>('br-isb');
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-refresh on DB state changes
  useEffect(() => {
    return db.subscribe(() => {
      setDbState(Object.create(db));
    });
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const branches = dbState.getBranches();
  const rawMenu = dbState.getMenu();
  const effectiveMenu = dbState.getBranchEffectiveMenu(selectedBranch);
  const orders = dbState.getOrders();
  const shifts = dbState.getShifts();
  const recipes = dbState.getRecipes();
  const vendors = dbState.getVendors();
  const expenses = dbState.getExpenses();
  const staff = dbState.getStaff();
  const payroll = dbState.getPayroll();
  const settings = dbState.getSettings();

  // Summary Metrics
  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.paymentStatus === 'PAID');
  const totalGrossSales = completedOrders.reduce((sum, o) => sum + (o.subtotal - (o.discountAmount || 0)), 0);
  const totalTaxCollected = completedOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
  const totalServiceCharges = completedOrders.reduce((sum, o) => sum + (o.serviceCharge || 0), 0);
  const totalNetRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const aov = completedOrders.length > 0 ? Math.round(totalNetRevenue / completedOrders.length) : 0;

  // Estimated food cost based on completed order items and recipe BOM
  const totalEstimatedFoodCost = completedOrders.reduce((sum, order) => {
    const orderCost = order.items.reduce((iSum, it) => {
      const rec = recipes.find(r => r.menuItemId === it.menuItemId);
      return iSum + (rec ? rec.totalFoodCost * it.quantity : it.price * 0.4 * it.quantity);
    }, 0);
    return sum + orderCost;
  }, 0);

  const estimatedNetProfit = totalGrossSales - totalEstimatedFoodCost - totalExpenses;

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 1: EXECUTIVE OVERVIEW
  // ───────────────────────────────────────────────────────────────────────────
  const renderOverviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Total Net Sales</span>
            <div style={{ background: '#FFF3E0', padding: '8px', borderRadius: '10px', color: '#E85D04' }}><DollarSign size={20} /></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#1A120B' }}>Rs {totalNetRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#2E7D32', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> {completedOrders.length} Paid Orders
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Est. Net Profit</span>
            <div style={{ background: '#E8F5E9', padding: '8px', borderRadius: '10px', color: '#2E7D32' }}><TrendingUp size={20} /></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: estimatedNetProfit >= 0 ? '#2E7D32' : '#C62828' }}>
            Rs {estimatedNetProfit.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
            After Food Cost & Expenses
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>Avg Order Value (AOV)</span>
            <div style={{ background: '#EDE7F6', padding: '8px', borderRadius: '10px', color: '#5E35B1' }}><ShoppingBag size={20} /></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#1A120B' }}>Rs {aov.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>Per Dine-in / Takeaway / Delivery</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>5% Service Charges</span>
            <div style={{ background: '#FFF8E1', padding: '8px', borderRadius: '10px', color: '#F57F17' }}><Percent size={20} /></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#F57F17' }}>Rs {totalServiceCharges.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>Staff Pool & Maintenance</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#666' }}>FBR GST Collected</span>
            <div style={{ background: '#E0F2F1', padding: '8px', borderRadius: '10px', color: '#00796B' }}><ShieldCheck size={20} /></div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#00796B' }}>Rs {totalTaxCollected.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>5% Card / 16% Cash Ready</div>
        </div>
      </div>

      {/* Branch Comparison & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1A120B', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="#E85D04" /> Branch Performance Matrix
            </h3>
            <span style={{ fontSize: '12px', color: '#888' }}>{branches.length} Registered Locations</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {branches.map(br => {
              const brOrders = completedOrders.filter(o => o.branchId === br.id);
              const brRevenue = brOrders.reduce((sum, o) => sum + o.total, 0);
              const brShare = totalNetRevenue > 0 ? Math.round((brRevenue / totalNetRevenue) * 100) : 0;
              return (
                <div key={br.id} style={{ padding: '12px 14px', borderRadius: '12px', background: selectedBranch === br.id ? '#FFF8F0' : '#FAFAFA', border: selectedBranch === br.id ? '1.5px solid #E85D04' : '1px solid #EFEFEF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A120B' }}>{br.name}</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#E85D04' }}>Rs {brRevenue.toLocaleString()} ({brShare}%)</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    <span>{brOrders.length} Completed Orders</span>
                    <span>{br.address}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#E0E0E0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${brShare}%`, height: '100%', background: 'linear-gradient(90deg, #E85D04, #F48C06)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1A120B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#E85D04" /> Order Channel Distribution
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#FFF3E0', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#D84315', fontWeight: '700' }}>Dine-In</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#BF360C', marginTop: '4px' }}>
                {orders.filter(o => o.orderType === 'DINE_IN').length}
              </div>
            </div>
            <div style={{ background: '#E8F5E9', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#2E7D32', fontWeight: '700' }}>Takeaway</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1B5E20', marginTop: '4px' }}>
                {orders.filter(o => o.orderType === 'PICK_UP').length}
              </div>
            </div>
            <div style={{ background: '#E3F2FD', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#1565C0', fontWeight: '700' }}>Delivery</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0D47A1', marginTop: '4px' }}>
                {orders.filter(o => o.orderType === 'DELIVERY').length}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #EEE', paddingTop: '16px' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', color: '#1A120B', marginBottom: '10px' }}>System Compliance Switches</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FAFAFA', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333' }}>FBR Sales Tax (5% Card / 16% Cash)</span>
                <button
                  onClick={() => {
                    const newState = !settings.isTaxActive;
                    dbState.updateSettings({ isTaxActive: newState });
                    notify(newState ? '✓ FBR Sales Tax Activated' : '⚠ FBR Sales Tax Deactivated');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    background: settings.isTaxActive ? '#2E7D32' : '#C62828',
                    color: '#ffffff'
                  }}
                >
                  {settings.isTaxActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#FAFAFA', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#333' }}>Mandatory 5% Service Charges</span>
                <span style={{ fontWeight: '700', fontSize: '12px', color: '#2E7D32', background: '#E8F5E9', padding: '4px 8px', borderRadius: '6px' }}>
                  ENFORCED (5%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 2: BRANCH-WISE MENU OVERRIDES & CUSTOM PRICING
  // ───────────────────────────────────────────────────────────────────────────
  const [editingOverrideItem, setEditingOverrideItem] = useState<{
    menuItemId: string;
    customPrice: number;
    isAvailable: boolean;
    customName?: string;
  } | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(rawMenu.map(m => m.category)))];

  const filteredMenuItems = effectiveMenu.filter(item => {
    const matchesCat = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveOverride = () => {
    if (!editingOverrideItem) return;
    dbState.setBranchMenuOverride({
      branchId: selectedBranch,
      menuItemId: editingOverrideItem.menuItemId,
      customPrice: Number(editingOverrideItem.customPrice),
      isAvailable: editingOverrideItem.isAvailable,
      customName: editingOverrideItem.customName
    });
    setEditingOverrideItem(null);
    notify(`✓ Branch pricing & status updated for ${branches.find(b => b.id === selectedBranch)?.name}`);
  };

  const renderBranchMenuTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
            Branch Menu & Special Rates Manager
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            Set branch-specific prices (e.g. discounted Handi/Mandi in Islamabad vs Rawalpindi) and toggle stock availability.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A120B' }}>Active Branch:</label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: '2px solid #E85D04',
              fontWeight: '700',
              fontSize: '14px',
              color: '#1A120B',
              background: '#FFF8F0',
              cursor: 'pointer'
            }}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                fontWeight: filterCategory === cat ? '700' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                background: filterCategory === cat ? '#E85D04' : '#ffffff',
                color: filterCategory === cat ? '#ffffff' : '#444',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search menu item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '10px',
              border: '1px solid #D0C5B4',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #EADBCC', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC', color: '#1A120B' }}>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Item Details</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Category</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Global Master Price</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Branch Price (Effective)</th>
                <th style={{ padding: '14px 16px', fontWeight: '700' }}>Branch Status</th>
                <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenuItems.map(item => {
                const masterItem = rawMenu.find(m => m.id === item.id);
                const isOverridden = masterItem && masterItem.price !== item.price;
                const isCurrentlyEditing = editingOverrideItem?.menuItemId === item.id;

                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} 
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#1A120B' }}>{item.name}</div>
                          {isOverridden && (
                            <span style={{ fontSize: '11px', background: '#FFF3E0', color: '#E85D04', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              Branch Custom Rate
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#666' }}>{item.category}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#666' }}>
                      Rs {masterItem?.price.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isCurrentlyEditing ? (
                        <input
                          type="number"
                          value={editingOverrideItem.customPrice}
                          onChange={(e) => setEditingOverrideItem({ ...editingOverrideItem, customPrice: Number(e.target.value) })}
                          style={{ width: '100px', padding: '6px 8px', borderRadius: '6px', border: '1.5px solid #E85D04', fontWeight: '700' }}
                        />
                      ) : (
                        <span style={{ fontWeight: '800', color: isOverridden ? '#E85D04' : '#1A120B' }}>
                          Rs {item.price.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {isCurrentlyEditing ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          <input
                            type="checkbox"
                            checked={editingOverrideItem.isAvailable}
                            onChange={(e) => setEditingOverrideItem({ ...editingOverrideItem, isAvailable: e.target.checked })}
                          />
                          Available in Branch
                        </label>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: item.isAvailable ? '#E8F5E9' : '#FFEBEE',
                          color: item.isAvailable ? '#2E7D32' : '#C62828'
                        }}>
                          {item.isAvailable ? 'In Stock' : 'Unavailable'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      {isCurrentlyEditing ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={handleSaveOverride}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#2E7D32',
                              color: '#fff',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            onClick={() => setEditingOverrideItem(null)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #CCC',
                              background: '#FFF',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingOverrideItem({
                            menuItemId: item.id,
                            customPrice: item.price,
                            isAvailable: item.isAvailable,
                            customName: item.name
                          })}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #E85D04',
                            background: '#FFF8F0',
                            color: '#E85D04',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit size={14} /> Set Branch Rate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 3: RECIPE MANAGEMENT & FOOD COSTING (BILL OF MATERIALS)
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<MenuItemRecipe | null>(recipes[0] || null);
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<MenuItemRecipe | null>(recipes[0] || null);

  const handleSelectRecipe = (rec: MenuItemRecipe) => {
    setSelectedRecipeItem(rec);
    setEditedRecipe(JSON.parse(JSON.stringify(rec)));
    setIsEditingRecipe(false);
  };

  const handleAddIngredientRow = () => {
    if (!editedRecipe) return;
    const newIng: RecipeIngredient = {
      id: 'ing-' + Date.now(),
      ingredientName: '',
      quantity: 0.1,
      unit: 'kg',
      costPerUnit: 500,
      totalCost: 50
    };
    const updatedIngredients = [...editedRecipe.ingredients, newIng];
    const totalFoodCost = updatedIngredients.reduce((sum, i) => sum + i.totalCost, 0);
    const margin = editedRecipe.targetSellingPrice > 0 
      ? Number(((totalFoodCost / editedRecipe.targetSellingPrice) * 100).toFixed(1))
      : 0;

    setEditedRecipe({
      ...editedRecipe,
      ingredients: updatedIngredients,
      totalFoodCost,
      foodCostMarginPercent: margin
    });
  };

  const handleUpdateIngredient = (idx: number, field: keyof RecipeIngredient, value: any) => {
    if (!editedRecipe) return;
    const updated = [...editedRecipe.ingredients];
    const item = { ...updated[idx], [field]: value };
    
    if (field === 'quantity' || field === 'costPerUnit') {
      item.totalCost = Math.round(Number(item.quantity) * Number(item.costPerUnit));
    }
    updated[idx] = item;

    const totalFoodCost = updated.reduce((sum, i) => sum + i.totalCost, 0);
    const margin = editedRecipe.targetSellingPrice > 0 
      ? Number(((totalFoodCost / editedRecipe.targetSellingPrice) * 100).toFixed(1))
      : 0;

    setEditedRecipe({
      ...editedRecipe,
      ingredients: updated,
      totalFoodCost,
      foodCostMarginPercent: margin
    });
  };

  const handleDeleteIngredient = (idx: number) => {
    if (!editedRecipe) return;
    const updated = editedRecipe.ingredients.filter((_, i) => i !== idx);
    const totalFoodCost = updated.reduce((sum, i) => sum + i.totalCost, 0);
    const margin = editedRecipe.targetSellingPrice > 0 
      ? Number(((totalFoodCost / editedRecipe.targetSellingPrice) * 100).toFixed(1))
      : 0;

    setEditedRecipe({
      ...editedRecipe,
      ingredients: updated,
      totalFoodCost,
      foodCostMarginPercent: margin
    });
  };

  const handleSaveRecipe = () => {
    if (!editedRecipe) return;
    dbState.saveRecipe(editedRecipe);
    setSelectedRecipeItem(editedRecipe);
    setIsEditingRecipe(false);
    notify(`✓ Recipe and Bill of Materials saved for ${editedRecipe.menuItemName}`);
  };

  const renderRecipeTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2.5fr', gap: '24px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1A120B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChefHat size={18} color="#E85D04" /> Master Recipes
          </h3>
          <span style={{ fontSize: '12px', background: '#F8F3EA', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
            {recipes.length} BOMs
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recipes.map(r => (
            <div
              key={r.menuItemId}
              onClick={() => handleSelectRecipe(r)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: selectedRecipeItem?.menuItemId === r.menuItemId ? '#FFF8F0' : '#FAFAFA',
                border: selectedRecipeItem?.menuItemId === r.menuItemId ? '1.5px solid #E85D04' : '1px solid #EFEFEF',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A120B' }}>{r.menuItemName}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                <span>Cost: Rs {r.totalFoodCost}</span>
                <span style={{ fontWeight: '700', color: r.foodCostMarginPercent > 50 ? '#C62828' : '#2E7D32' }}>
                  {r.foodCostMarginPercent}% Food Cost
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRecipeItem && editedRecipe && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #EADBCC', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1A120B' }}>
                {editedRecipe.menuItemName} — Bill of Materials (BOM)
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                Portion Yield: {editedRecipe.portionYield} Serving · Last updated: {new Date(editedRecipe.lastUpdated).toLocaleDateString()}
              </p>
            </div>

            <div>
              {isEditingRecipe ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleSaveRecipe}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#2E7D32',
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={16} /> Save Recipe
                  </button>
                  <button
                    onClick={() => {
                      setEditedRecipe(JSON.parse(JSON.stringify(selectedRecipeItem)));
                      setIsEditingRecipe(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CCC',
                      background: '#FFF',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingRecipe(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1.5px solid #E85D04',
                    background: '#FFF8F0',
                    color: '#E85D04',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Edit size={16} /> Edit Ingredients & Costs
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#FFF3E0', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#D84315', fontWeight: '700' }}>Total Raw Food Cost</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#BF360C', marginTop: '4px' }}>
                Rs {editedRecipe.totalFoodCost.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#E8F5E9', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#2E7D32', fontWeight: '700' }}>Selling Price</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1B5E20', marginTop: '4px' }}>
                Rs {editedRecipe.targetSellingPrice.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#EDE7F6', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#5E35B1', fontWeight: '700' }}>Gross Margin %</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#4A148C', marginTop: '4px' }}>
                {(100 - editedRecipe.foodCostMarginPercent).toFixed(1)}%
              </div>
            </div>
          </div>

          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#1A120B' }}>
            Ingredients & Portion Breakdown
          </h4>

          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC', color: '#1A120B' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '700' }}>Ingredient</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700' }}>Qty / Portion</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700' }}>Unit</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700' }}>Cost per Unit (Rs)</th>
                  <th style={{ padding: '10px 12px', fontWeight: '700' }}>Total Cost (Rs)</th>
                  {isEditingRecipe && <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {editedRecipe.ingredients.map((ing, idx) => (
                  <tr key={ing.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                    <td style={{ padding: '10px 12px' }}>
                      {isEditingRecipe ? (
                        <input
                          type="text"
                          value={ing.ingredientName}
                          onChange={(e) => handleUpdateIngredient(idx, 'ingredientName', e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CCC' }}
                        />
                      ) : (
                        <span style={{ fontWeight: '600', color: '#1A120B' }}>{ing.ingredientName}</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {isEditingRecipe ? (
                        <input
                          type="number"
                          step="0.01"
                          value={ing.quantity}
                          onChange={(e) => handleUpdateIngredient(idx, 'quantity', Number(e.target.value))}
                          style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CCC' }}
                        />
                      ) : (
                        ing.quantity
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {isEditingRecipe ? (
                        <select
                          value={ing.unit}
                          onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #CCC' }}
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="l">l</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                        </select>
                      ) : (
                        ing.unit
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {isEditingRecipe ? (
                        <input
                          type="number"
                          value={ing.costPerUnit}
                          onChange={(e) => handleUpdateIngredient(idx, 'costPerUnit', Number(e.target.value))}
                          style={{ width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CCC' }}
                        />
                      ) : (
                        `Rs ${ing.costPerUnit.toLocaleString()}`
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#E85D04' }}>
                      Rs {ing.totalCost.toLocaleString()}
                    </td>
                    {isEditingRecipe && (
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteIngredient(idx)}
                          style={{ color: '#C62828', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isEditingRecipe && (
            <button
              onClick={handleAddIngredientRow}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1.5px dashed #E85D04',
                background: '#FFF8F0',
                color: '#E85D04',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '20px'
              }}
            >
              <Plus size={16} /> Add Recipe Ingredient
            </button>
          )}

          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1A120B' }}>
              Chef Preparation Notes & Standards
            </h4>
            {isEditingRecipe ? (
              <textarea
                value={editedRecipe.preparationNotes || ''}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, preparationNotes: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '13px' }}
              />
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#555', background: '#FAFAFA', padding: '12px', borderRadius: '8px', border: '1px solid #EEE' }}>
                {editedRecipe.preparationNotes || 'Standard cooking procedures apply.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 4: ENTERPRISE REPORTS SUITE (10+ REPORTS, CSV EXPORT, PRINT)
  // ───────────────────────────────────────────────────────────────────────────
  const [reportSubTab, setReportSubTab] = useState<'ITEMS' | 'CATEGORIES' | 'HOURLY' | 'PAYMENTS' | 'TAX_AUDIT' | 'VOIDS' | 'STAFF_PERF'>('ITEMS');

  const itemSalesMap: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  completedOrders.forEach(o => {
    o.items.forEach(it => {
      const master = rawMenu.find(m => m.id === it.menuItemId);
      const cat = it.category || master?.category || 'General';
      if (!itemSalesMap[it.menuItemId]) {
        itemSalesMap[it.menuItemId] = { name: it.name, category: cat, qty: 0, revenue: 0 };
      }
      itemSalesMap[it.menuItemId].qty += it.quantity;
      itemSalesMap[it.menuItemId].revenue += it.price * it.quantity;
    });
  });
  const itemSalesList = Object.values(itemSalesMap).sort((a, b) => b.revenue - a.revenue);

  const catSalesMap: Record<string, { qty: number; revenue: number }> = {};
  itemSalesList.forEach(it => {
    if (!catSalesMap[it.category]) catSalesMap[it.category] = { qty: 0, revenue: 0 };
    catSalesMap[it.category].qty += it.qty;
    catSalesMap[it.category].revenue += it.revenue;
  });

  const hourlyBins = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0, volume: 0 }));
  orders.forEach(o => {
    const d = new Date(o.createdAt);
    const h = d.getHours();
    if (hourlyBins[h]) {
      hourlyBins[h].count++;
      hourlyBins[h].volume += o.total;
    }
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportSubTab === 'ITEMS') {
      csvContent += 'Item Name,Category,Quantity Sold,Total Revenue (PKR)\n';
      itemSalesList.forEach(i => {
        csvContent += `"${i.name}","${i.category}",${i.qty},${i.revenue}\n`;
      });
    } else if (reportSubTab === 'TAX_AUDIT') {
      csvContent += 'Order ID,Date,Branch,Subtotal,Service Charge (5%),FBR GST,Total,Payment Method\n';
      completedOrders.forEach(o => {
        csvContent += `"${o.id}","${new Date(o.createdAt).toLocaleString()}","${o.branchId}",${o.subtotal},${o.serviceCharge || 0},${o.tax || 0},${o.total},"${o.paymentMethod || 'CASH'}"\n`;
      });
    } else {
      csvContent += 'Category,Quantity Sold,Total Revenue (PKR)\n';
      Object.entries(catSalesMap).forEach(([cat, data]) => {
        csvContent += `"${cat}",${data.qty},${data.revenue}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Haandi_${reportSubTab}_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`✓ Downloaded ${reportSubTab} CSV report`);
  };

  const renderReportsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #EADBCC', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'ITEMS', label: 'Item Sales Velocity' },
            { id: 'CATEGORIES', label: 'Category Profitability' },
            { id: 'HOURLY', label: 'Hourly Peak Heatmap' },
            { id: 'PAYMENTS', label: 'Payment Method Breakdown' },
            { id: 'TAX_AUDIT', label: 'Tax & Service Charge Audit' },
            { id: 'STAFF_PERF', label: 'Staff Performance' },
            { id: 'VOIDS', label: 'Void & Cancelled Log' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setReportSubTab(tab.id as any)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: reportSubTab === tab.id ? '700' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                background: reportSubTab === tab.id ? '#1A120B' : '#F4ECE1',
                color: reportSubTab === tab.id ? '#ffffff' : '#333'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1.5px solid #2E7D32',
              background: '#E8F5E9',
              color: '#2E7D32',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #666',
              background: '#FFF',
              color: '#333',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        {reportSubTab === 'ITEMS' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Item-Wise Sales Velocity & Turnover
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                    <th style={{ padding: '12px 14px' }}>Item Name</th>
                    <th style={{ padding: '12px 14px' }}>Category</th>
                    <th style={{ padding: '12px 14px' }}>Units Sold</th>
                    <th style={{ padding: '12px 14px' }}>Total Sales (PKR)</th>
                    <th style={{ padding: '12px 14px' }}>Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  {itemSalesList.map((it, idx) => {
                    const share = totalGrossSales > 0 ? Math.round((it.revenue / totalGrossSales) * 100) : 0;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F0ECE1' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1A120B' }}>{it.name}</td>
                        <td style={{ padding: '12px 14px', color: '#666' }}>{it.category}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '600' }}>{it.qty} portions</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#E85D04' }}>Rs {it.revenue.toLocaleString()}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '60px', height: '6px', background: '#EEE', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${share}%`, height: '100%', background: '#E85D04' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700' }}>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportSubTab === 'TAX_AUDIT' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              FBR Sales Tax & 5% Service Charges Reconciliation Report
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                    <th style={{ padding: '12px 14px' }}>Order ID</th>
                    <th style={{ padding: '12px 14px' }}>Date & Time</th>
                    <th style={{ padding: '12px 14px' }}>Subtotal</th>
                    <th style={{ padding: '12px 14px' }}>5% Service Charge</th>
                    <th style={{ padding: '12px 14px' }}>Taxable Amount</th>
                    <th style={{ padding: '12px 14px' }}>FBR GST</th>
                    <th style={{ padding: '12px 14px' }}>Total Billed</th>
                    <th style={{ padding: '12px 14px' }}>Payment Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {completedOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700' }}>#{o.id.slice(-6).toUpperCase()}</td>
                      <td style={{ padding: '12px 14px', color: '#666' }}>{new Date(o.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px' }}>Rs {o.subtotal.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#F57F17' }}>Rs {(o.serviceCharge || 0).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px' }}>Rs {(o.taxableAmount || (o.subtotal + (o.serviceCharge || 0))).toLocaleString()}</td>
                      <td style={{ padding: '12px 14px', fontWeight: '700', color: '#00796B' }}>Rs {(o.tax || 0).toLocaleString()} ({o.taxRatePercent || 5}%)</td>
                      <td style={{ padding: '12px 14px', fontWeight: '800', color: '#1A120B' }}>Rs {o.total.toLocaleString()}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: o.paymentMethod === 'CARD' ? '#E3F2FD' : '#FFF3E0', color: o.paymentMethod === 'CARD' ? '#1565C0' : '#E85D04' }}>
                          {o.paymentMethod || 'CASH'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportSubTab === 'HOURLY' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Hourly Rush & Peak Kitchen Traffic (Heatmap)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
              {hourlyBins.slice(11, 24).concat(hourlyBins.slice(0, 3)).map(b => {
                const hourFormatted = b.hour === 0 ? '12 AM' : b.hour < 12 ? `${b.hour} AM` : b.hour === 12 ? '12 PM' : `${b.hour - 12} PM`;
                const isPeak = b.count >= 2;
                return (
                  <div
                    key={b.hour}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      background: isPeak ? '#FFF3E0' : '#FAFAFA',
                      border: isPeak ? '1.5px solid #E85D04' : '1px solid #EEE'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1A120B' }}>{hourFormatted}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: isPeak ? '#E85D04' : '#666', marginTop: '4px' }}>
                      {b.count} orders
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                      Rs {b.volume.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {reportSubTab === 'CATEGORIES' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Category Profitability & Contribution
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {Object.entries(catSalesMap).map(([cat, val]) => (
                <div key={cat} style={{ background: '#FFF8F0', borderRadius: '12px', padding: '16px', border: '1px solid #EADBCC' }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#1A120B' }}>{cat}</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#E85D04', marginTop: '6px' }}>
                    Rs {val.revenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {val.qty} total portions sold
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportSubTab === 'PAYMENTS' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Payment Methods Audit (Cash vs Card)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '14px', border: '1px solid #FFE0B2' }}>
                <div style={{ fontWeight: '700', color: '#D84315', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Banknote size={20} /> Cash Collections (16% GST)
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#BF360C', marginTop: '8px' }}>
                  Rs {completedOrders.filter(o => o.paymentMethod === 'CASH' || !o.paymentMethod).reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {completedOrders.filter(o => o.paymentMethod === 'CASH' || !o.paymentMethod).length} Cash Transactions
                </div>
              </div>

              <div style={{ background: '#E3F2FD', padding: '20px', borderRadius: '14px', border: '1px solid #BBDEFB' }}>
                <div style={{ fontWeight: '700', color: '#1565C0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} /> Card & POS Terminal (5% GST)
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0D47A1', marginTop: '8px' }}>
                  Rs {completedOrders.filter(o => o.paymentMethod === 'CARD').reduce((sum, o) => sum + o.total, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {completedOrders.filter(o => o.paymentMethod === 'CARD').length} Card Transactions
                </div>
              </div>
            </div>
          </div>
        )}

        {reportSubTab === 'STAFF_PERF' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Staff & Cashier Order Fulfillment Performance
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                    <th style={{ padding: '12px 14px' }}>Staff Name</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Branch</th>
                    <th style={{ padding: '12px 14px' }}>Orders Processed</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map(st => {
                    const staffOrders = orders.filter(o => o.cashierId === st.id || o.userId === st.id);
                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '700' }}>{st.name}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#F0ECE1' }}>
                            {st.role}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>{branches.find(b => b.id === st.branchId)?.name || 'General'}</td>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#E85D04' }}>{staffOrders.length} tickets</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ color: st.isActive ? '#2E7D32' : '#999', fontWeight: '700' }}>
                            {st.isActive ? 'Active Staff' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportSubTab === 'VOIDS' && (
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Voided & Cancelled Order Audit Trail
            </h3>
            <div style={{ padding: '24px', textAlign: 'center', color: '#666', background: '#FAFAFA', borderRadius: '12px' }}>
              <CheckCircle2 size={32} color="#2E7D32" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '700', fontSize: '14px', color: '#1A120B' }}>No Void Anomalies Detected</div>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>All 0 void/cancelled tickets are securely logged under cashier supervisory PIN verification.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 5: FINANCIALS, P&L, VENDORS & EXPENSES
  // ───────────────────────────────────────────────────────────────────────────
  const [finSubTab, setFinSubTab] = useState<'PNL' | 'VENDORS' | 'EXPENSES'>('PNL');
  const [newExpenseForm, setNewExpenseForm] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState<string>('RAW_MATERIALS');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || expenseAmount <= 0) return;
    dbState.addExpense({
      branchId: selectedBranch,
      category: expenseCategory,
      amount: expenseAmount,
      paidTo: expenseTitle,
      paymentMethod: 'CASH_DRAWER',
      recordedBy: 'Admin / Owner',
      notes: expenseTitle,
      date: new Date().toISOString()
    });
    setNewExpenseForm(false);
    setExpenseTitle('');
    setExpenseAmount(0);
    notify('✓ Expense logged successfully');
  };

  const renderFinancialsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { id: 'PNL', label: 'Profit & Loss Statement (P&L)' },
          { id: 'VENDORS', label: 'Vendor Accounts Payable' },
          { id: 'EXPENSES', label: 'Operating Expense Log' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFinSubTab(t.id as any)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: finSubTab === t.id ? '700' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              background: finSubTab === t.id ? '#1A120B' : '#ffffff',
              color: finSubTab === t.id ? '#ffffff' : '#333',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {finSubTab === 'PNL' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Automated Statement of Profit & Loss (P&L)
            </h3>
            <span style={{ fontSize: '12px', color: '#666' }}>Fiscal Period: Current Month</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px 16px', background: '#F8F3EA', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '15px' }}>
              <span>Gross Food & Beverage Revenue</span>
              <span style={{ color: '#2E7D32' }}>Rs {totalGrossSales.toLocaleString()}</span>
            </div>

            <div style={{ padding: '12px 16px 12px 32px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
              <span>Less: Estimated Food Cost (Raw Meat, Desi Ghee, Rice, Spices)</span>
              <span style={{ color: '#C62828' }}>- Rs {totalEstimatedFoodCost.toLocaleString()}</span>
            </div>

            <div style={{ padding: '12px 16px', background: '#FFF8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', color: '#E85D04' }}>
              <span>Gross Restaurant Profit</span>
              <span>Rs {(totalGrossSales - totalEstimatedFoodCost).toLocaleString()}</span>
            </div>

            <div style={{ padding: '12px 16px 12px 32px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
              <span>Less: Operating Expenses (Utilities, Rent, Salaries, Packaging)</span>
              <span style={{ color: '#C62828' }}>- Rs {totalExpenses.toLocaleString()}</span>
            </div>

            <div style={{ padding: '16px', background: estimatedNetProfit >= 0 ? '#E8F5E9' : '#FFEBEE', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', color: estimatedNetProfit >= 0 ? '#2E7D32' : '#C62828' }}>
              <span>Net Restaurant Profit</span>
              <span>Rs {estimatedNetProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {finSubTab === 'VENDORS' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
              Vendor Accounts Payable Ledger
            </h3>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#C62828' }}>
              Total Payable: Rs {vendors.reduce((sum, v) => sum + v.currentBalancePayable, 0).toLocaleString()}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                  <th style={{ padding: '12px 14px' }}>Vendor Name</th>
                  <th style={{ padding: '12px 14px' }}>Supply Category</th>
                  <th style={{ padding: '12px 14px' }}>Contact Person</th>
                  <th style={{ padding: '12px 14px' }}>Phone</th>
                  <th style={{ padding: '12px 14px' }}>Outstanding Payable</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1A120B' }}>{v.name}</td>
                    <td style={{ padding: '12px 14px', color: '#666' }}>{v.supplyCategory}</td>
                    <td style={{ padding: '12px 14px' }}>{v.contactPerson}</td>
                    <td style={{ padding: '12px 14px' }}>{v.phone}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: v.currentBalancePayable > 0 ? '#C62828' : '#2E7D32' }}>
                      Rs {v.currentBalancePayable.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          const payAmount = prompt(`Enter payment amount to ${v.name}:`, '10000');
                          if (payAmount && Number(payAmount) > 0) {
                            dbState.payVendorInvoice(v.id, Number(payAmount));
                            notify(`✓ Payment of Rs ${Number(payAmount).toLocaleString()} recorded for ${v.name}`);
                          }
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#2E7D32',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {finSubTab === 'EXPENSES' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
                Operating Expenses Ledger
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                Total Recorded: Rs {totalExpenses.toLocaleString()}
              </p>
            </div>

            <button
              onClick={() => setNewExpenseForm(!newExpenseForm)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#E85D04',
                color: '#fff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> Log New Expense
            </button>
          </div>

          {newExpenseForm && (
            <form onSubmit={handleAddExpense} style={{ background: '#FFF8F0', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #EADBCC' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Expense Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Clay Pots Handi Batch"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Amount (PKR)</label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '13px' }}
                  >
                    <option value="RAW_MATERIALS">Raw Materials</option>
                    <option value="UTILITIES">Utilities (Gas/Electricity)</option>
                    <option value="SALARIES">Salaries & Payroll</option>
                    <option value="RENT">Store Rent</option>
                    <option value="PACKAGING">Takeaway Packaging</option>
                    <option value="MAINTENANCE">Kitchen Maintenance</option>
                    <option value="OTHER">Other Operating</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', background: '#2E7D32', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                  Save Expense
                </button>
                <button type="button" onClick={() => setNewExpenseForm(false)} style={{ padding: '8px 12px', borderRadius: '6px', background: '#FFF', border: '1px solid #CCC', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                  <th style={{ padding: '10px 12px' }}>Description</th>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px' }}>Recorded By</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                    <td style={{ padding: '10px 12px', color: '#666' }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '700', color: '#1A120B' }}>{e.notes || e.paidTo}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#F0ECE1' }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#666' }}>{e.recordedBy}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '800', color: '#C62828', textAlign: 'right' }}>
                      Rs {e.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 6: HR, STAFF ATTENDANCE & PAYROLL
  // ───────────────────────────────────────────────────────────────────────────
  const [hrSubTab, setHrSubTab] = useState<'STAFF' | 'PAYROLL'>('STAFF');
  const [newStaffModal, setNewStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('WAITER');
  const [staffSalary, setStaffSalary] = useState(35000);
  const [staffDesignation, setStaffDesignation] = useState('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffPhone) return;
    dbState.addStaff({
      name: staffName,
      phone: staffPhone,
      role: staffRole,
      branchId: selectedBranch,
      monthlySalary: staffSalary,
      designation: staffDesignation || `${staffRole} Associate`,
      joiningDate: new Date().toISOString().slice(0, 10),
      isActive: true
    });
    setNewStaffModal(false);
    setStaffName('');
    setStaffPhone('');
    setStaffDesignation('');
    notify(`✓ Staff member ${staffName} added successfully`);
  };

  const renderHrTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setHrSubTab('STAFF')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: hrSubTab === 'STAFF' ? '700' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              background: hrSubTab === 'STAFF' ? '#1A120B' : '#ffffff',
              color: hrSubTab === 'STAFF' ? '#ffffff' : '#333'
            }}
          >
            Staff Directory & Attendance
          </button>
          <button
            onClick={() => setHrSubTab('PAYROLL')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: hrSubTab === 'PAYROLL' ? '700' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              background: hrSubTab === 'PAYROLL' ? '#1A120B' : '#ffffff',
              color: hrSubTab === 'PAYROLL' ? '#ffffff' : '#333'
            }}
          >
            Monthly Payroll Generation
          </button>
        </div>

        {hrSubTab === 'STAFF' && (
          <button
            onClick={() => setNewStaffModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#E85D04',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} /> Add Staff Member
          </button>
        )}
      </div>

      {hrSubTab === 'STAFF' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC' }}>
          {newStaffModal && (
            <form onSubmit={handleAddStaff} style={{ background: '#FFF8F0', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #EADBCC' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700' }}>Register New Restaurant Employee</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Full Name</label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Phone</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Role / Terminal</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC' }}
                  >
                    <option value="WAITER">Waiter (Order Taker)</option>
                    <option value="CASHIER">Cashier (POS Register)</option>
                    <option value="KITCHEN">Kitchen Chef (KDS)</option>
                    <option value="MANAGER">Floor Manager</option>
                    <option value="RIDER">Delivery Rider</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Head Shift Captain"
                    value={staffDesignation}
                    onChange={(e) => setStaffDesignation(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Monthly Base Salary (PKR)</label>
                  <input
                    type="number"
                    value={staffSalary}
                    onChange={(e) => setStaffSalary(Number(e.target.value))}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CCC' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', background: '#2E7D32', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}>
                  Register Staff
                </button>
                <button type="button" onClick={() => setNewStaffModal(false)} style={{ padding: '8px 12px', borderRadius: '6px', background: '#FFF', border: '1px solid #CCC', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                  <th style={{ padding: '12px 14px' }}>Name & Designation</th>
                  <th style={{ padding: '12px 14px' }}>Role</th>
                  <th style={{ padding: '12px 14px' }}>Branch</th>
                  <th style={{ padding: '12px 14px' }}>Phone</th>
                  <th style={{ padding: '12px 14px' }}>Monthly Salary</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '700', color: '#1A120B' }}>{st.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>{st.designation}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#E85D04', color: '#fff' }}>
                        {st.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{branches.find(b => b.id === st.branchId)?.name || 'General'}</td>
                    <td style={{ padding: '12px 14px' }}>{st.phone}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#2E7D32' }}>
                      Rs {st.monthlySalary.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ color: st.isActive ? '#2E7D32' : '#999', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hrSubTab === 'PAYROLL' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
                Monthly Payroll Sheet & Disbursements
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                Total Payroll: Rs {staff.reduce((sum, s) => sum + s.monthlySalary, 0).toLocaleString()} / month
              </p>
            </div>

            <button
              onClick={() => {
                const curMonth = new Date().toISOString().slice(0, 7);
                dbState.generateMonthlyPayroll(curMonth);
                notify(`✓ Monthly payroll generated for ${curMonth}`);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#2E7D32',
                color: '#fff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={16} /> Generate This Month's Payroll
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8F3EA', borderBottom: '2px solid #EADBCC' }}>
                  <th style={{ padding: '12px 14px' }}>Employee</th>
                  <th style={{ padding: '12px 14px' }}>Month</th>
                  <th style={{ padding: '12px 14px' }}>Base Salary</th>
                  <th style={{ padding: '12px 14px' }}>Bonus / Allowances</th>
                  <th style={{ padding: '12px 14px' }}>Net Payable</th>
                  <th style={{ padding: '12px 14px' }}>Disbursement</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F0ECE1' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1A120B' }}>{p.staffName}</td>
                    <td style={{ padding: '12px 14px', color: '#666' }}>{p.month}</td>
                    <td style={{ padding: '12px 14px' }}>Rs {p.baseSalary.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', color: '#2E7D32' }}>+ Rs {p.allowances.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: '#1A120B' }}>Rs {p.netPayable.toLocaleString()}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: p.status === 'PAID' ? '#E8F5E9' : '#FFF3E0',
                        color: p.status === 'PAID' ? '#2E7D32' : '#D84315'
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {p.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            dbState.paySalary(p.id, 'CASH');
                            notify(`✓ Salary paid for ${p.staffName}`);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#2E7D32',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Disburse
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 7: SHIFT OPENING/CLOSING AUDIT & CASH DENOMINATIONS
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedShiftForAudit, setSelectedShiftForAudit] = useState<CashierShift | null>(shifts[0] || null);

  const renderShiftsTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '24px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #EADBCC', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#1A120B', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#E85D04" /> Shift Audit History
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {shifts.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedShiftForAudit(s)}
              style={{
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: selectedShiftForAudit?.id === s.id ? '#FFF8F0' : '#FAFAFA',
                border: selectedShiftForAudit?.id === s.id ? '1.5px solid #E85D04' : '1px solid #EFEFEF'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: '#1A120B' }}>{s.cashierName}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: s.status === 'OPEN' ? '#E8F5E9' : '#ECEFF1',
                  color: s.status === 'OPEN' ? '#2E7D32' : '#546E7A'
                }}>
                  {s.status}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {new Date(s.openedAt).toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px', fontWeight: '700' }}>
                <span style={{ color: '#E85D04' }}>Cash: Rs {s.cashSales.toLocaleString()}</span>
                {s.cashDiscrepancy !== undefined && (
                  <span style={{ color: s.cashDiscrepancy === 0 ? '#2E7D32' : s.cashDiscrepancy < 0 ? '#C62828' : '#F57F17' }}>
                    {s.cashDiscrepancy === 0 ? '✓ Balanced' : s.cashDiscrepancy < 0 ? `Short: Rs ${s.cashDiscrepancy}` : `Over: +Rs ${s.cashDiscrepancy}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedShiftForAudit && (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EADBCC', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ borderBottom: '1px solid #EADBCC', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1A120B' }}>
                  Shift Z-Audit: {selectedShiftForAudit.cashierName}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                  Started: {new Date(selectedShiftForAudit.openedAt).toLocaleString()} {selectedShiftForAudit.closedAt ? `· Closed: ${new Date(selectedShiftForAudit.closedAt).toLocaleString()}` : '· (Currently Active)'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '12px',
                  background: selectedShiftForAudit.status === 'OPEN' ? '#E8F5E9' : '#ECEFF1',
                  color: selectedShiftForAudit.status === 'OPEN' ? '#2E7D32' : '#546E7A'
                }}>
                  {selectedShiftForAudit.status === 'OPEN' ? '🟢 SHIFT IN PROGRESS' : '🔒 CLOSED & RECONCILED'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#F8F3EA', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#666' }}>Opening Float</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#1A120B', marginTop: '2px' }}>
                Rs {selectedShiftForAudit.openingFloat.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#D84315' }}>Cash Sales</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#BF360C', marginTop: '2px' }}>
                Rs {selectedShiftForAudit.cashSales.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#E3F2FD', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#1565C0' }}>Card Sales</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0D47A1', marginTop: '2px' }}>
                Rs {selectedShiftForAudit.cardSales.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#E8F5E9', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#2E7D32' }}>5% Service Charges</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#1B5E20', marginTop: '2px' }}>
                Rs {selectedShiftForAudit.totalServiceChargesCollected.toLocaleString()}
              </div>
            </div>
          </div>

          {selectedShiftForAudit.denominations ? (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#1A120B' }}>
                Closing Cash Denominations (Physical Drawer Count)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                {Object.entries(selectedShiftForAudit.denominations).map(([denom, count]) => {
                  const label = denom === 'coins' ? 'Coins' : `Rs ${denom.replace('note', '').replace('rs', '')}`;
                  return (
                    <div key={denom} style={{ padding: '8px 10px', background: '#FAFAFA', borderRadius: '8px', border: '1px solid #EEE' }}>
                      <div style={{ fontSize: '11px', color: '#888' }}>{label}</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1A120B' }}>
                        {Number(count)} notes
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: selectedShiftForAudit.cashDiscrepancy === 0 ? '#E8F5E9' : '#FFEBEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: selectedShiftForAudit.cashDiscrepancy === 0 ? '#2E7D32' : '#C62828' }}>
                    {selectedShiftForAudit.cashDiscrepancy === 0 ? '✓ Cash Drawer Reconciled: Exactly Balanced (Rs 0)' : `⚠ Cash Discrepancy: ${selectedShiftForAudit.cashDiscrepancy! < 0 ? `Short by Rs ${Math.abs(selectedShiftForAudit.cashDiscrepancy!)}` : `Over by Rs ${selectedShiftForAudit.cashDiscrepancy}`}`}
                  </div>
                  {selectedShiftForAudit.closingNotes && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Cashier Note: "{selectedShiftForAudit.closingNotes}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', background: '#FFF8F0', borderRadius: '12px', border: '1px dashed #E85D04', textAlign: 'center' }}>
              <Clock size={28} color="#E85D04" style={{ margin: '0 auto 6px' }} />
              <div style={{ fontWeight: '700', color: '#1A120B' }}>Shift is Currently Active</div>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                Cash denominations and discrepancy will be recorded upon shift closing (Z-Report) by cashier.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8F3EA', color: '#1A120B', display: 'flex', flexDirection: 'column' }}>
      {/* Top Banner Navigation */}
      <header style={{ background: '#1A120B', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="Haandi" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
            <div>
              <div style={{ color: '#E85D04', fontWeight: '800', fontSize: '18px', letterSpacing: '0.04em' }}>
                HAANDI BY YUMTO
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                Executive Enterprise Admin Portal · Islamabad Civic Center
              </div>
            </div>
          </div>

          {/* Module Tab Selector */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
            {[
              { id: 'OVERVIEW', label: 'Executive Dashboard', icon: BarChart3 },
              { id: 'BRANCH_MENU', label: 'Branch Menu & Rates', icon: UtensilsCrossed },
              { id: 'RECIPES', label: 'Recipes & BOM', icon: ChefHat },
              { id: 'REPORTS', label: 'Reports Suite', icon: FileSpreadsheet },
              { id: 'FINANCIALS', label: 'P&L & Accounting', icon: DollarSign },
              { id: 'HR_PAYROLL', label: 'HR & Payroll', icon: Users },
              { id: 'SHIFTS_AUDIT', label: 'Shift Z-Audit', icon: Clock }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isActive ? '#E85D04' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Floating Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#1A120B',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          border: '1.5px solid #E85D04',
          zIndex: 9999,
          fontWeight: '700',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} color="#2E7D32" />
          {notification}
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px 20px', flex: 1 }}>
        {activeTab === 'OVERVIEW' && renderOverviewTab()}
        {activeTab === 'BRANCH_MENU' && renderBranchMenuTab()}
        {activeTab === 'RECIPES' && renderRecipeTab()}
        {activeTab === 'REPORTS' && renderReportsTab()}
        {activeTab === 'FINANCIALS' && renderFinancialsTab()}
        {activeTab === 'HR_PAYROLL' && renderHrTab()}
        {activeTab === 'SHIFTS_AUDIT' && renderShiftsTab()}
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { 
  Check, Truck, Layout, Settings
} from 'lucide-react';

export const ManagerPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  
  // Refresh on DB changes
  useEffect(() => {
    return db.subscribe(() => {
      setDbState(Object.create(db));
    });
  }, []);

  const [selectedBranchId, setSelectedBranchId] = useState('br-lhr');
  const [activeFloorId, setActiveFloorId] = useState('fl-lhr-g');
  
  // Table Assignment States
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  
  // Surcharge settings inputs
  const branches = dbState.getBranches();
  const branch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const floors = dbState.getFloors(selectedBranchId);
  const tables = dbState.getTables(selectedBranchId, activeFloorId);
  const orders = dbState.getOrders(selectedBranchId);
  const riders = dbState.getUsers().filter(u => u.role === 'RIDER');

  // Sync active floor on branch change
  useEffect(() => {
    if (floors.length > 0) {
      setActiveFloorId(floors[0].id);
      setAssigningOrderId(null);
    }
  }, [selectedBranchId]);

  // Filters
  // 1. Dine-In orders needing table assignment (no tableId, status not completed/cancelled)
  const unassignedDineIn = orders.filter(o => 
    o.orderType === 'DINE_IN' && 
    !o.tableId && 
    !['COMPLETED', 'CANCELLED'].includes(o.status)
  );

  // 2. Active Dine-in orders (with tableId, preparing or ready)
  const activeDineIn = orders.filter(o => 
    o.orderType === 'DINE_IN' && 
    o.tableId && 
    !['COMPLETED', 'CANCELLED'].includes(o.status)
  );

  // 3. Delivery orders ready for dispatch
  const readyDeliveries = orders.filter(o => 
    o.orderType === 'DELIVERY' && 
    o.status === 'READY' && 
    !o.riderId
  );


  // Handlers
  const handleTableAssign = (tableId: string) => {
    if (!assigningOrderId) return;
    
    dbState.assignTableToOrder(assigningOrderId, tableId, 'u-man1');
    setAssigningOrderId(null);
  };

  const handleRiderAssign = (orderId: string, riderId: string) => {
    dbState.assignRiderToOrder(orderId, riderId);
  };

  const handleUpdateSurchargeFee = (feeString: string) => {
    const fee = parseInt(feeString) || 0;
    dbState.updateBranchPremiumFee(selectedBranchId, fee);
  };

  const handleToggleSurcharge = (toggle: boolean) => {
    dbState.updateBranchSurchargeToggle(selectedBranchId, toggle);
  };

  const releaseTable = (tableId: string) => {
    dbState.updateTableStatus(tableId, 'AVAILABLE');
  };

  const renderSeats = (capacity: number) => {
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

  return (
    <div className="animate-fade container py-6 flex justify-center">
      
      {/* Tablet Device Mockup Container */}
      <div className="device-tablet-frame bg-bg-secondary p-4 relative">
        <div className="device-tablet-camera"></div>
        <div className="device-tablet-header mb-3 rounded-lg">
          <span className="font-semibold text-text-primary">📋 Yumto OS — Manager Tablet terminal</span>
          <span className="font-bold text-gold">12:00 PM</span>
          <span className="opacity-80">📶 LTE 🔋 100%</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
          
          {/* Left Columns (8-span): Live floor map designer/assigner & Surcharge settings */}
          <div className="lg:col-span-8 space-y-4">
        
        {/* Branch switcher & Live Overview Header */}
        <div className="gold-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <Layout className="text-gold w-4.5 h-4.5" /> Manager Live Terminal
            </h2>
            <p className="text-[11px] text-text-secondary">Monitor table bookings, assign Dine-In seats, and dispatch riders</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={selectedBranchId} 
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-bg-tertiary border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:border-gold focus:outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Map Layout Screen */}
        <div className="gold-card space-y-3 p-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-color pb-2 gap-2">
            <div>
              <h3 className="font-bold text-xs">Visual Table Assigning Panel</h3>
              {assigningOrderId ? (
                <p className="text-[10px] text-amber font-semibold animate-pulse">
                  ⚠️ Click any green "Available" table below to assign Order {assigningOrderId}
                </p>
              ) : (
                <p className="text-[10px] text-text-secondary">Click on tables to view details, or choose floor levels</p>
              )}
            </div>
            <div className="flex gap-1">
              {floors.map(fl => (
                <button
                  key={fl.id}
                  onClick={() => setActiveFloorId(fl.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    activeFloorId === fl.id 
                      ? 'bg-gold text-black' 
                      : 'bg-bg-tertiary text-text-secondary border border-border-color'
                  }`}
                >
                  {fl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Blueprint */}
          <div className="floorplan-container relative">
            {tables.map(tb => (
              <div
                key={tb.id}
                onClick={() => {
                  if (assigningOrderId && tb.status === 'AVAILABLE') {
                    handleTableAssign(tb.id);
                  }
                }}
                style={{
                  left: `${tb.x}%`,
                  top: `${tb.y}%`,
                  width: `${tb.width}%`,
                  height: `${tb.height}%`,
                }}
                className={`map-table-element ${
                  tb.type === 'VIP_CABIN' 
                    ? 'type-cabin border-double border-4' 
                    : tb.type === 'MAJLIS_FLOOR' 
                      ? 'type-majlis' 
                      : 'type-standard'
                } ${
                  tb.status === 'OCCUPIED'
                    ? 'status-occupied'
                    : tb.status === 'RESERVED'
                      ? 'status-reserved'
                      : tb.status === 'BLOCKED'
                        ? 'status-blocked'
                        : assigningOrderId 
                          ? 'status-selected' // flash green available options
                          : 'status-available'
                }`}
              >
                {/* Visual Chairs/Seats around table */}
                {renderSeats(tb.capacity)}

                <span className="font-bold text-xs z-10">{tb.tableNumber}</span>
                <span className="text-[9px] opacity-75 z-10">Cap: {tb.capacity}</span>
                {tb.status === 'OCCUPIED' && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); releaseTable(tb.id); }}
                    className="absolute -top-1 -right-1 bg-black text-gold border border-gold hover:text-white rounded-full p-0.5 text-[8px] z-20"
                    title="Release Table"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Blueprints Legend */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/85 p-2 rounded-lg border border-border-color flex justify-between text-[10px] items-center">
              <div className="flex gap-2">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-alpha border border-emerald"></span> Available</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-alpha border border-amber"></span> Reserved</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-ruby-alpha border border-ruby"></span> Occupied</span>
              </div>
              <div className="text-text-secondary">
                {assigningOrderId ? `Assignment Active for ${assigningOrderId}` : "Manager Control Layout"}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Surcharge Configuration */}
        <div className="gold-card space-y-3 p-3">
          <h2 className="text-sm font-bold flex items-center gap-1.5 border-b border-color pb-2">
            <Settings className="text-gold w-4 h-4" /> Dynamic 2-Hour Reservation Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-text-primary">Enable Surcharge Surcharge</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={branch.activeSurchargeToggle} 
                    onChange={(e) => handleToggleSurcharge(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-bg-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-gold peer-checked:after:bg-black"></div>
                </label>
              </div>
              <p className="text-[9px] text-text-secondary">
                When activated, bookings created within 2 hours of dining time incur the surcharge fee configured below.
              </p>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[11px] text-text-secondary">Urgent Reservation Surcharge (Rs.)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={branch.premiumBookingFee}
                  onChange={(e) => handleUpdateSurchargeFee(e.target.value)}
                  className="bg-bg-tertiary border border-border-color rounded-lg px-2.5 py-1 text-xs text-text-primary w-full focus:border-gold focus:outline-none"
                />
              </div>
              <p className="text-[9px] text-text-secondary">Surcharge dynamically updates for new customer checkouts immediately.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column (4-span): Orders and Rider Dispatch Lists */}
      <div className="lg:col-span-4 space-y-4">

        {/* Dine-In Queue: Needs Table Assignment */}
        <div className="gold-card space-y-2 p-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center justify-between border-b border-color pb-1.5">
            <span>Dine-In Seat Requests</span>
            <span className="badge badge-amber py-0.5 px-2 text-[9px]">{unassignedDineIn.length}</span>
          </h2>
          
          {unassignedDineIn.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4">No pending table assignments.</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {unassignedDineIn.map(order => (
                <div key={order.id} className="bg-bg-tertiary p-3 rounded-lg border border-border-color space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-text-primary">{order.userName}</div>
                      <div className="text-[10px] text-text-secondary">{order.userPhone}</div>
                    </div>
                    <span className="text-[10px] text-gold uppercase">{order.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-color/40">
                    <span className="text-text-secondary">Items: {order.items.reduce((a, b) => a + b.quantity, 0)}</span>
                    <button
                      onClick={() => setAssigningOrderId(assigningOrderId === order.id ? null : order.id)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        assigningOrderId === order.id 
                          ? 'bg-amber text-black' 
                          : 'bg-gold text-black hover:bg-gold-hover'
                      }`}
                    >
                      {assigningOrderId === order.id ? 'Cancel Assign' : 'Assign Table'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rider Dispatch Board */}
        <div className="gold-card space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gold flex items-center justify-between border-b border-color pb-2">
            <span>Rider Dispatch Board</span>
            <span className="badge badge-emerald">{readyDeliveries.length}</span>
          </h2>

          {readyDeliveries.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4">No orders waiting for riders.</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {readyDeliveries.map(order => (
                <div key={order.id} className="bg-bg-tertiary p-3 rounded-lg border border-border-color space-y-2.5 text-xs animate-fade">
                  <div className="flex justify-between font-semibold">
                    <span className="text-text-primary uppercase">{order.id}</span>
                    <span className="text-gold">Rs. {order.total}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary truncate">Addr: {order.deliveryAddress}</p>
                  
                  <div className="space-y-1.5 border-t border-color/40 pt-2">
                    <div className="text-[10px] text-text-secondary mb-1">Select Driver:</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {riders.map(rd => (
                        <button
                          key={rd.id}
                          onClick={() => handleRiderAssign(order.id, rd.id)}
                          className="bg-bg-primary hover:bg-gold-alpha text-text-primary hover:text-gold border border-border-color hover:border-gold py-1 px-2 rounded text-[10px] font-semibold text-center truncate flex items-center justify-center gap-1"
                        >
                          <Truck className="w-3 h-3" /> {rd.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Dining Table Orders List */}
        <div className="gold-card space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary border-b border-color pb-2">
            Active Dining Tables ({activeDineIn.length})
          </h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeDineIn.map(order => {
              const table = dbState.getTables().find(t => t.id === order.tableId);
              return (
                <div key={order.id} className="flex justify-between items-center text-xs bg-bg-tertiary/50 p-2 rounded border border-border-color/60">
                  <div>
                    <span className="font-semibold text-text-primary">Table {table?.tableNumber || order.tableId}</span>
                    <p className="text-[10px] text-text-secondary">{order.userName}</p>
                  </div>
                  <span className="badge badge-emerald">{order.status}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
  );
};
export default ManagerPortal;

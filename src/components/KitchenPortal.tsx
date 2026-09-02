import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { Play, Check, Flame, Clock, Award, Coffee } from 'lucide-react';

export const KitchenPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  
  // Tick for elapsed times
  const [timeTick, setTimeTick] = useState(0);
  
  // Use timeTick to trigger re-renders and log debug ticks
  if (timeTick === -1) console.log(timeTick);



  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(t => t + 1);
    }, 1000);

    const unsubscribe = db.subscribe(() => {
      setDbState(Object.create(db));
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const [selectedBranchId, setSelectedBranchId] = useState('br-lhr');
  const branches = dbState.getBranches();

  // Get active kitchen orders (PENDING, CONFIRMED, PREPARING, READY)
  const activeOrders = dbState.getOrders(selectedBranchId)
    .filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // oldest first

  // Progress logic
  const handleStartPrep = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'PREPARING');
  };

  const handleMarkReady = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'READY');
  };

  const handleCompleteOrder = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'COMPLETED');
  };

  // Helper for timers
  const getElapsedTime = (isoString: string) => {
    const created = new Date(isoString).getTime();
    const diff = Date.now() - created;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getTimerSeverityColor = (isoString: string) => {
    const created = new Date(isoString).getTime();
    const minutes = Math.floor((Date.now() - created) / 60000);
    if (minutes >= 15) return 'text-ruby border-ruby bg-ruby-alpha';
    if (minutes >= 8) return 'text-amber border-amber bg-amber-alpha';
    return 'text-emerald border-emerald bg-emerald-alpha';
  };

  return (
    <div className="animate-fade container py-6 flex justify-center text-left">
      
      {/* Tablet Device Mockup Container for KDS */}
      <div className="device-tablet-frame bg-bg-secondary p-4 relative w-full">
        <div className="device-tablet-camera"></div>
        <div className="device-tablet-header mb-3 rounded-lg">
          <span className="font-semibold text-text-primary">👨‍🍳 Yumto OS — KDS Terminal</span>
          <span className="font-bold text-gold">Kitchen WiFi</span>
          <span className="opacity-80">100% 🔌</span>
        </div>

        <div className="space-y-4">
      
          {/* Header and Branch select */}
      <div className="gold-card flex flex-col md:flex-row md:items-center justify-between gap-3 p-3">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold flex items-center gap-1.5">
            <Flame className="text-gold w-4.5 h-4.5 animate-pulse" /> Kitchen Display System (KDS)
          </h2>
          <p className="text-[11px] text-text-secondary">Live cooking ticket grid. Items sorted by elapsed queue time.</p>
        </div>
        <div>
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

      {/* Grid of Cooking Tickets */}
      {activeOrders.length === 0 ? (
        <div className="gold-card py-12 text-center text-text-secondary space-y-2 p-3">
          <Coffee className="w-10 h-10 text-gold mx-auto opacity-50" />
          <div className="font-bold text-base text-text-primary">All Tickets Cleared!</div>
          <p className="text-xs max-w-sm mx-auto">No pending orders in the kitchen queue. Enjoy the peaceful moments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeOrders.map(order => {
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY';
            const table = order.tableId ? dbState.getTables().find(t => t.id === order.tableId) : null;
            const timerClass = getTimerSeverityColor(order.createdAt);
            
            return (
              <div 
                key={order.id} 
                className={`gold-card flex flex-col justify-between p-3 space-y-3 border transition-all ${
                  isReady 
                    ? 'border-emerald/40 bg-emerald-alpha/5 shadow-emerald-alpha' 
                    : isPreparing 
                      ? 'border-amber/40 bg-amber-alpha/5' 
                      : 'border-border-color'
                }`}
              >
                {/* Card Top: Order ID & Timer */}
                <div className="flex justify-between items-center border-b border-color/40 pb-1.5">
                  <div>
                    <span className="font-bold text-xs text-text-primary uppercase">{order.id}</span>
                    <div className="text-[9px] text-text-secondary uppercase tracking-wider font-semibold">
                      {order.orderType.replace('_', ' ')} 
                      {table && <span className="text-gold ml-1">| Table {table.tableNumber}</span>}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 border rounded text-[9px] font-bold ${timerClass}`}>
                    <Clock className="w-3 h-3" />
                    <span>{getElapsedTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Card Items List */}
                <div className="flex-1 space-y-1.5 text-[11px]">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-1 font-medium">
                      <span className="text-text-primary">
                        <span className="text-gold font-bold text-xs mr-1">x{item.quantity}</span> 
                        {item.name}
                      </span>
                    </div>
                  ))}
                  
                  {order.deliveryAddress && (
                    <div className="text-[9px] bg-bg-tertiary/60 p-1 rounded border border-border-color/40 text-text-secondary mt-1.5 truncate" title={order.deliveryAddress}>
                      <strong>Address:</strong> {order.deliveryAddress}
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom */}
                <div className="border-t border-color/40 pt-2.5">
                  {!isPreparing && !isReady ? (
                    <button
                      onClick={() => handleStartPrep(order.id)}
                      className="gold-btn w-full py-1.5 text-[11px] font-bold flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Start Cooking
                    </button>
                  ) : isPreparing ? (
                    <button
                      onClick={() => handleMarkReady(order.id)}
                      className="bg-amber text-black hover:bg-amber-600 font-bold w-full py-1.5 text-[11px] rounded transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark Ready
                    </button>
                  ) : (
                    <div className="space-y-1 text-center">
                      <div className="text-[9px] text-emerald font-semibold flex items-center justify-center gap-0.5">
                        <Award className="w-3 h-3" /> Food is Ready!
                      </div>
                      
                      {order.orderType === 'DINE_IN' ? (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="bg-emerald text-black hover:bg-emerald-600 font-bold w-full py-1.5 text-[11px] rounded transition-all"
                        >
                          Complete (Serve to Table)
                        </button>
                      ) : order.orderType === 'PICK_UP' ? (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="bg-emerald text-black hover:bg-emerald-600 font-bold w-full py-1.5 text-[11px] rounded transition-all"
                        >
                          Complete (Handout)
                        </button>
                      ) : (
                        <div className="text-[9px] text-text-secondary p-1 bg-bg-tertiary rounded border border-border-color">
                          {order.riderId 
                            ? `Rider: ${dbState.getUsers().find(u => u.id === order.riderId)?.name.split(' ')[0]}` 
                            : 'Awaiting Dispatch'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};
export default KitchenPortal;

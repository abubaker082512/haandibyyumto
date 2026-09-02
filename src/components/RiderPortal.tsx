import React, { useState, useEffect } from 'react';
import { db } from '../store/mockDb';
import { LiveTrackingMap } from './LiveTrackingMap';
import { 
  Truck, Navigation, Phone, 
  MapPin, DollarSign, ShieldCheck
} from 'lucide-react';

export const RiderPortal: React.FC = () => {
  const [dbState, setDbState] = useState(db);
  
  // Refresh on database updates
  useEffect(() => {
    return db.subscribe(() => {
      setDbState(Object.create(db));
    });
  }, []);

  const [activeRiderId, setActiveRiderId] = useState('u-ride1');
  const riders = dbState.getUsers().filter(u => u.role === 'RIDER');
  const currentRider = riders.find(r => r.id === activeRiderId) || riders[0];

  // Get orders assigned to this rider that are in transit (SHIPPED) or arrived (DELIVERED)
  const assignedOrders = dbState.getOrders()
    .filter(o => o.riderId === activeRiderId && ['SHIPPED', 'DELIVERED'].includes(o.status));

  // Rider status actions
  const handleMarkArrived = (orderId: string) => {
    dbState.updateOrderStatus(orderId, 'DELIVERED');
  };

  const handleMarkCompleted = (orderId: string) => {
    // Also mark payment as paid if cash/card on delivery
    const orders = dbState.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].paymentStatus = 'PAID';
      localStorage.setItem('yumto_orders', JSON.stringify(orders));
    }
    dbState.updateOrderStatus(orderId, 'COMPLETED');
  };

  return (
    <div className="animate-fade container py-6 flex justify-center text-left">
      
      {/* Smartphone Mockup Container */}
      <div className="w-full max-w-[400px] bg-black rounded-[40px] p-4 border-[6px] border-zinc-800 shadow-2xl flex flex-col relative overflow-hidden" style={{ minHeight: '650px' }}>
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-zinc-800 rounded-b-2xl z-20 flex justify-center items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 mr-2"></div>
          <div className="w-10 h-1 bg-zinc-900 rounded-full"></div>
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center text-[10px] text-text-secondary px-4 pt-3 pb-2 select-none border-b border-border-color/30 mt-1.5">
          <div className="font-semibold text-text-primary">9:41</div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold">LTE</span>
            <div className="w-5 h-2.5 border border-text-secondary rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-gold rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto pt-3 px-1">
          
          {/* Driver Switcher Profile inside app */}
          <div className="bg-bg-card p-2 rounded-xl border border-border-color flex justify-between items-center mb-3">
            <div>
              <div className="text-[10px] text-text-secondary">Rider Profile:</div>
              <div className="font-semibold text-xs text-gold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> {currentRider?.name}
              </div>
            </div>
            <select
              value={activeRiderId}
              onChange={(e) => setActiveRiderId(e.target.value)}
              className="bg-bg-tertiary border border-border-color rounded-lg px-2 py-0.5 text-[10px] text-text-primary focus:border-gold focus:outline-none"
            >
              {riders.map(rd => (
                <option key={rd.id} value={rd.id}>{rd.name.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          {/* Core App View */}
          <div className="flex-1 space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-1 border-b border-color/40 pb-1.5">
              <Navigation className="text-gold w-3.5 h-3.5" /> Assigned Shipments ({assignedOrders.length})
            </h2>

            {assignedOrders.length === 0 ? (
              <div className="py-10 text-center text-text-secondary space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald mx-auto opacity-70" />
                <div className="font-semibold text-xs text-text-primary">No Active Deliveries</div>
                <p className="text-[10px] max-w-[200px] mx-auto">Wait for managers to dispatch a ready order from the branch board.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedOrders.map(order => {
                  const isShipped = order.status === 'SHIPPED';
                  const isArrived = order.status === 'DELIVERED';
                  
                  return (
                    <div key={order.id} className="bg-bg-card p-2.5 rounded-xl border border-border-color space-y-2 animate-fade">
                      {/* Top: ID, Total */}
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold uppercase text-gold">{order.id}</span>
                        <span className={`badge ${isArrived ? 'badge-emerald' : 'badge-gold'} text-[8px]`}>
                          {isArrived ? 'Arrived' : 'Transit'}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="space-y-1 text-[11px] border-t border-b border-color/40 py-1.5">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Customer:</span>
                          <span className="font-semibold text-text-primary">{order.userName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Contact:</span>
                          <a 
                            href={`tel:${order.userPhone}`} 
                            className="font-semibold text-gold flex items-center gap-0.5 hover:underline"
                          >
                            <Phone className="w-3 h-3" /> {order.userPhone}
                          </a>
                        </div>
                        <div className="text-[10px] text-text-secondary mt-1">
                          <strong className="text-text-primary block mb-0.5"><MapPin className="w-3 h-3 inline mr-0.5 text-gold" /> Address:</strong>
                          <span className="block pl-3.5 line-clamp-2 leading-relaxed bg-bg-primary/50 p-1 rounded border border-border-color/30">{order.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Payment info */}
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-text-secondary">Payment Method:</span>
                        <span className="font-semibold text-text-primary uppercase">{order.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-gold-alpha/5 p-1.5 rounded border border-gold/10">
                        <span className="font-bold text-text-secondary">Amount to Collect:</span>
                        <span className="font-extrabold text-xs text-gold">Rs. {order.total}</span>
                      </div>

                      {/* Interactive OpenStreetMap Live Navigation */}
                      <div className="pt-1">
                        <div className="flex justify-between items-center mb-1 text-[10px]">
                          <span className="text-text-secondary font-bold flex items-center gap-1">
                            <Navigation className="w-3 h-3 text-gold" /> Turn-by-Turn GPS Map
                          </span>
                          <span className="text-[9px] text-emerald font-bold">OpenStreetMap Active</span>
                        </div>
                        <LiveTrackingMap
                          orderId={order.id}
                          riderName={currentRider?.name}
                          riderPhone={currentRider?.phone}
                          customerAddress={order.deliveryAddress}
                          orderStatus={order.status}
                          height="220px"
                          showControls={true}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="pt-1">
                        {isShipped ? (
                          <button
                            onClick={() => handleMarkArrived(order.id)}
                            className="bg-gold hover:bg-gold-hover text-black font-bold w-full py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                          >
                            <Navigation className="w-3.5 h-3.5" /> Arrived at House
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkCompleted(order.id)}
                            className="bg-emerald hover:bg-emerald-600 text-black font-bold w-full py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Complete & Collect Cash
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div className="border-t border-border-color/30 pt-3 pb-1.5 flex justify-center">
            <div className="w-28 h-1 bg-zinc-800 rounded-full"></div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default RiderPortal;

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CustomerPortal } from './components/CustomerPortal';
import { ManagerPortal } from './components/ManagerPortal';
import { KitchenPortal } from './components/KitchenPortal';
import { RiderPortal } from './components/RiderPortal';
import { AdminPortal } from './components/AdminPortal';
import { CashierPortal } from './components/CashierPortal';
import { TrackOrderPage } from './components/TrackOrderPage';
import { PortalGate } from './components/PortalGate';
import { AuthProvider } from './context/AuthContext';
import { db } from './store/mockDb';

function AppContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isCustomerView = location.pathname === '/' || location.pathname.startsWith('/track');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F3EA' }}>
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>

      {isCustomerView && (
        <footer style={{
          background: '#1A120B',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '24px 16px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <img src="/logo.png" alt="Haandi" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
              <div style={{ color: '#E85D04', fontWeight: '800', fontSize: '15px', letterSpacing: '0.08em' }}>
                HAANDI BY YUMTO
              </div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', lineHeight: 1.6 }}>
              © 2026 Haandi by Yumto. Authentic Desi, Karahi, Handi & Charcoal BBQ Cuisine.<br />
              Islamabad: Gulberg Greens, Civic Center, Executive Block (0330 0500600) · NTN/GST: 4585147-3
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function App() {
  const [, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  return (
    <AuthProvider>
      <HashRouter>
        <AppContent>
          <Routes>
            <Route path="/" element={<CustomerPortal />} />
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/track/:orderId" element={<TrackOrderPage />} />
            <Route
              path="/manager"
              element={
                <PortalGate allowedRoles={['MANAGER', 'WAITER', 'OWNER', 'ADMIN']} portalName="Branch Floor & Table Manager" portalIcon="📋">
                  <ManagerPortal />
                </PortalGate>
              }
            />
            <Route
              path="/waiter"
              element={
                <PortalGate allowedRoles={['WAITER', 'MANAGER', 'OWNER', 'ADMIN']} portalName="Order Taker (Waiter) Terminal" portalIcon="🧑‍🍳">
                  <ManagerPortal />
                </PortalGate>
              }
            />
            <Route
              path="/kitchen"
              element={
                <PortalGate allowedRoles={['KITCHEN', 'MANAGER', 'OWNER', 'ADMIN']} portalName="Kitchen KDS Terminal" portalIcon="👨‍🍳">
                  <KitchenPortal />
                </PortalGate>
              }
            />
            <Route
              path="/rider"
              element={
                <PortalGate allowedRoles={['RIDER', 'MANAGER', 'OWNER', 'ADMIN']} portalName="Fleet Rider Portal" portalIcon="🛵">
                  <RiderPortal />
                </PortalGate>
              }
            />
            <Route
              path="/admin"
              element={
                <PortalGate allowedRoles={['OWNER', 'ADMIN']} portalName="Executive Admin & Enterprise Portal" portalIcon="👑">
                  <AdminPortal />
                </PortalGate>
              }
            />
            <Route
              path="/pos"
              element={
                <PortalGate allowedRoles={['CASHIER', 'MANAGER', 'OWNER', 'ADMIN']} portalName="POS Cashier Terminal" portalIcon="🏦">
                  <CashierPortal />
                </PortalGate>
              }
            />
          </Routes>
        </AppContent>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

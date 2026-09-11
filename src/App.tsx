import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CustomerPortal } from './components/CustomerPortal';
import { MobileCustomerApp } from './components/MobileCustomerApp';
import { Capacitor } from '@capacitor/core';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || Capacitor.isNativePlatform());

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768 || Capacitor.isNativePlatform());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F3EA' }}>
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>

      {isCustomerView && !isMobile && (
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
              Islamabad: Gulberg Greens, Civic Center, Executive Block (0330 0500600) · NTN/GST: 4585147-3<br />
              <span style={{ color: '#E85D04', fontWeight: '700', marginTop: '4px', display: 'inline-block' }}>
                Powered By: ABT IT innovations PVT LTD. · For Queries WhatsApp: +92-333-5945499
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

import { App as CapApp } from '@capacitor/app';

function App() {
  const [, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768 || Capacitor.isNativePlatform());
  const [splash, setSplash] = useState({ visible: false, title: 'Haandi by Yumto' });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768 || Capacitor.isNativePlatform());
    window.addEventListener('resize', handleResize);
    
    // Redirect & Splash based on Capacitor App ID (Flavor)
    if (Capacitor.isNativePlatform()) {
      CapApp.getInfo().then(info => {
        let title = 'Haandi by Yumto';
        let showSplash = true;

        if (info.id.endsWith('.pos')) { window.location.hash = '#/pos'; title = 'POS Terminal'; }
        else if (info.id.endsWith('.manager')) { window.location.hash = '#/manager'; title = 'Manager Portal'; }
        else if (info.id.endsWith('.kitchen')) { window.location.hash = '#/kitchen'; title = 'Kitchen KDS'; }
        else if (info.id.endsWith('.rider')) { window.location.hash = '#/rider'; title = 'Fleet Rider'; }
        else if (info.id.endsWith('.owner')) { window.location.hash = '#/admin'; title = 'Admin Portal'; }
        else if (info.id.endsWith('.customer')) { window.location.hash = '#/'; showSplash = false; }
        else { window.location.hash = '#/'; showSplash = false; }
        
        if (showSplash) {
          setSplash({ visible: true, title });
          setTimeout(() => setSplash({ visible: false, title }), 2500);
        }
      }).catch(console.error);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AuthProvider>
      {splash.visible && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: 'linear-gradient(135deg, #1A120B 0%, #3A2518 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeOut 0.3s ease-out 2.2s forwards'
        }}>
          <div style={{ width: '120px', height: '120px', background: '#fff', borderRadius: '24px', padding: '8px', marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'pulse 1.5s infinite' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: '#E85D04', fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '1px', textAlign: 'center' }}>Haandi {splash.title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '700', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>By Yumto</p>
        </div>
      )}
      <HashRouter>
        <AppContent>
          <Routes>
            <Route path="/" element={isMobile ? <MobileCustomerApp /> : <CustomerPortal />} />
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

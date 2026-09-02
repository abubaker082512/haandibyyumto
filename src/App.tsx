import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { db } from './store/mockDb';
import { CustomerPortal } from './components/CustomerPortal';
import { ManagerPortal } from './components/ManagerPortal';
import { KitchenPortal } from './components/KitchenPortal';
import { RiderPortal } from './components/RiderPortal';
import { OwnerPortal } from './components/OwnerPortal';
import { CashierPortal } from './components/CashierPortal';
import { PortalGate } from './components/PortalGate';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { HelpCircle, RefreshCw, X, Info, Zap, User, LogIn } from 'lucide-react';

const SIMULATION_STEPS = [
  {
    step: '1',
    title: 'Customer App',
    icon: '🍲',
    text: 'Browse new Handi, Karahi & BBQ menu. Place a Dine-In or Delivery order. Book a table at Gulberg Greens, Islamabad.'
  },
  {
    step: '2',
    title: 'Manager & KDS',
    icon: '📋',
    text: 'Unassigned Dine-In orders appear in Manager Tablet. Assign a table. Tickets appear in Kitchen KDS instantly.'
  },
  {
    step: '3',
    title: 'Kitchen & Dispatch',
    icon: '👨‍🍳',
    text: 'In Kitchen KDS, start cooking Handi/Karahi/BBQ and mark ready. For Delivery, assign a driver from the dispatch panel.'
  },
  {
    step: '4',
    title: 'Rider & Owner',
    icon: '🛵',
    text: 'Switch to Rider App to complete delivery. Check Owner Dashboard for live sales metrics and menu management.'
  },
  {
    step: '5',
    title: 'POS Cashier',
    icon: '🏦',
    text: 'Open POS Terminal (/pos) to open a shift, take counter walk-in orders, apply discounts, accept cash/card/split, and close with Z-Report.'
  },
];

function AppLayout({ children }: { children: React.ReactNode }) {
  const [showHelper, setShowHelper] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { profile } = useAuth();

  const handleResetData = () => {
    if (confirm('Reset database back to initial seed data? All custom orders and reservations will be wiped.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FBF8F3' }}>
      
      {/* ================================================================
          TOP SYSTEM NAV BAR — Minimalist for Router
          ================================================================ */}
      <div style={{
        background: '#1A120B',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky', top: 0, zIndex: 600,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          {/* Logo links back to home */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, textDecoration: 'none' }}>
            <img
              src="/logo.png"
              alt="Haandi by Yumto"
              style={{
                width: '42px', height: '42px', borderRadius: '10px',
                objectFit: 'contain', background: '#FBF8F3', padding: '2px',
                border: '2px solid rgba(232,93,4,0.6)', flexShrink: 0
              }}
            />
            <div>
              <div style={{ color: '#ffffff', fontWeight: '800', fontSize: '16px', letterSpacing: '0.04em', lineHeight: 1 }}>
                HAANDI <span style={{ color: '#E85D04' }}>BY YUMTO</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '2px' }}>
                Restaurant OS
              </div>
            </div>
          </Link>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* User Auth Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: profile ? 'rgba(232,93,4,0.15)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${profile ? 'rgba(232,93,4,0.4)' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '8px', padding: '6px 12px',
                color: '#ffffff', fontSize: '12px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              {profile ? (
                <>
                  <User style={{ width: '13px', height: '13px', color: '#E85D04' }} />
                  <span className="hidden sm:inline" style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.name.split(' ')[0]}
                  </span>
                  <span style={{
                    background: '#8B1E1E', color: '#fff', fontSize: '9px',
                    fontWeight: '800', padding: '1px 6px', borderRadius: '12px', letterSpacing: '0.05em'
                  }}>
                    {profile.role}
                  </span>
                </>
              ) : (
                <>
                  <LogIn style={{ width: '13px', height: '13px', color: '#E85D04' }} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowHelper(!showHelper)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: showHelper ? 'rgba(232,93,4,0.2)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${showHelper ? '#E85D04' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px', padding: '7px 12px',
                color: showHelper ? '#E85D04' : '#9ca3af',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              <HelpCircle style={{ width: '13px', height: '13px' }} />
              <span className="hidden sm:inline">Sim Guide</span>
            </button>
            <button
              onClick={handleResetData}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px', padding: '7px 12px',
                color: '#f87171', fontSize: '12px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
              <span className="hidden sm:inline">Reset DB</span>
            </button>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* ================================================================
          SIMULATION GUIDE PANEL — collapsible
          ================================================================ */}
      {showHelper && (
        <div style={{
          background: '#fffbeb',
          borderBottom: '2px solid #F4C430',
          padding: '16px',
          animation: 'fadeIn 0.25s ease'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '16px', height: '16px', color: '#D4A017' }} />
                <span style={{ fontWeight: '800', fontSize: '14px', color: '#0d0d0d' }}>Interactive Simulation Guide</span>
              </div>
              <button onClick={() => setShowHelper(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {SIMULATION_STEPS.map(step => (
                <div key={step.step} style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: '#F4C430', color: '#0d0d0d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '800', fontSize: '14px', flexShrink: 0
                  }}>
                    {step.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827', marginBottom: '4px' }}>
                      {step.icon} {step.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                      {step.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#9ca3af' }}>
              <Info style={{ width: '12px', height: '12px' }} />
              <span>Secret Portals: </span>
              <Link to="/manager" onClick={() => setShowHelper(false)} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>/manager</Link> | 
              <Link to="/kitchen" onClick={() => setShowHelper(false)} style={{ color: '#dc2626', fontWeight: 'bold', textDecoration: 'underline' }}>/kitchen</Link> | 
              <Link to="/rider" onClick={() => setShowHelper(false)} style={{ color: '#16a34a', fontWeight: 'bold', textDecoration: 'underline' }}>/rider</Link> | 
              <Link to="/admin" onClick={() => setShowHelper(false)} style={{ color: '#7c3aed', fontWeight: 'bold', textDecoration: 'underline' }}>/admin</Link> |
              <Link to="/pos" onClick={() => setShowHelper(false)} style={{ color: '#d97706', fontWeight: 'bold', textDecoration: 'underline' }}>/pos</Link>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          ACTIVE PORTAL CONTENT
          ================================================================ */}
      <main style={{ flex: 1, width: '100%' }}>
        {children}
      </main>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer style={{
        background: '#1A120B',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '24px 16px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function App() {
  const [, setDbState] = useState(db);
  useEffect(() => db.subscribe(() => setDbState(Object.create(db))), []);

  return (
    <AuthProvider>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<CustomerPortal />} />
            <Route
              path="/manager"
              element={
                <PortalGate allowedRoles={['MANAGER', 'OWNER']} portalName="Branch Manager Portal" portalIcon="📋">
                  <ManagerPortal />
                </PortalGate>
              }
            />
            <Route
              path="/kitchen"
              element={
                <PortalGate allowedRoles={['KITCHEN', 'MANAGER', 'OWNER']} portalName="Kitchen KDS Terminal" portalIcon="👨‍🍳">
                  <KitchenPortal />
                </PortalGate>
              }
            />
            <Route
              path="/rider"
              element={
                <PortalGate allowedRoles={['RIDER', 'MANAGER', 'OWNER']} portalName="Fleet Rider Portal" portalIcon="🛵">
                  <RiderPortal />
                </PortalGate>
              }
            />
            <Route
              path="/admin"
              element={
                <PortalGate allowedRoles={['OWNER']} portalName="Executive Owner Portal" portalIcon="👑">
                  <OwnerPortal />
                </PortalGate>
              }
            />
            <Route
              path="/pos"
              element={
                <PortalGate allowedRoles={['CASHIER', 'MANAGER', 'OWNER']} portalName="POS Cashier Terminal" portalIcon="🏦">
                  <CashierPortal />
                </PortalGate>
              }
            />
          </Routes>
        </AppLayout>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;

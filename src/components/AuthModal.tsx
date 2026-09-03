import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import {
  X, Mail, Lock, User as UserIcon, Phone,
  ShieldCheck, ArrowRight, Sparkles, CheckCircle2,
  AlertCircle, ChefHat, ShoppingBag, Truck, LayoutDashboard, Calculator
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { profile, signIn, signUp, signOut, demoLogin } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup' | 'roles'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('CUSTOMER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, name, phone, selectedRole);
      setSuccessMsg('Account registered successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = (role: Role) => {
    demoLogin(role);
    setSuccessMsg(`Switched active profile to ${role}!`);
    setTimeout(() => {
      onClose();
      setSuccessMsg(null);
    }, 800);
  };

  const ROLES_LIST: { role: Role; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { role: 'CUSTOMER', label: 'Customer', icon: <ShoppingBag style={{ width: '18px', height: '18px' }} />, desc: 'Order dining & delivery, reserve tables', color: '#E85D04' },
    { role: 'CASHIER', label: 'POS Cashier', icon: <Calculator style={{ width: '18px', height: '18px' }} />, desc: 'Take walk-in counter orders, accept cash/card', color: '#D97706' },
    { role: 'KITCHEN', label: 'Kitchen Chef', icon: <ChefHat style={{ width: '18px', height: '18px' }} />, desc: 'Live KDS queue, start cooking & mark ready', color: '#DC2626' },
    { role: 'MANAGER', label: 'Branch Manager', icon: <ShieldCheck style={{ width: '18px', height: '18px' }} />, desc: 'Floor plan table allocation & rider dispatch', color: '#2563EB' },
    { role: 'RIDER', label: 'Fleet Rider', icon: <Truck style={{ width: '18px', height: '18px' }} />, desc: 'Deliver dispatched food orders with live status', color: '#16A34A' },
    { role: 'OWNER', label: 'Chain Owner', icon: <LayoutDashboard style={{ width: '18px', height: '18px' }} />, desc: 'Revenue analytics, catalog & multi-branch control', color: '#7C3AED' }
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(26, 18, 11, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FDFBF7', borderRadius: '20px',
          maxWidth: '460px', width: '100%',
          overflow: 'hidden', boxShadow: '0 25px 60px rgba(26,18,11,0.35)',
          border: '1.5px solid #EADBCC'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Logo */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
          padding: '20px 24px', position: 'relative', color: '#ffffff'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.12)', border: 'none',
              borderRadius: '50%', width: '32px', height: '32px',
              color: '#ffffff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Haandi by Yumto"
              style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FBF8F3', padding: '2px', objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.04em' }}>
                Haandi by Yumto
              </div>
              <div style={{ fontSize: '11px', color: '#F4A261', fontWeight: '600' }}>
                {profile ? `Logged in as: ${profile.name} (${profile.role})` : 'Authentication Portal'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #EADBCC', background: '#FBF8F3' }}>
          <button
            onClick={() => { setTab('signin'); setError(null); }}
            style={{
              padding: '12px 6px', border: 'none', background: tab === 'signin' ? '#ffffff' : 'transparent',
              borderBottom: tab === 'signin' ? '2.5px solid #8B1E1E' : 'none',
              fontWeight: tab === 'signin' ? '700' : '500', color: tab === 'signin' ? '#8B1E1E' : '#6B5B4C',
              fontSize: '12px', cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null); }}
            style={{
              padding: '12px 6px', border: 'none', background: tab === 'signup' ? '#ffffff' : 'transparent',
              borderBottom: tab === 'signup' ? '2.5px solid #8B1E1E' : 'none',
              fontWeight: tab === 'signup' ? '700' : '500', color: tab === 'signup' ? '#8B1E1E' : '#6B5B4C',
              fontSize: '12px', cursor: 'pointer'
            }}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('roles'); setError(null); }}
            style={{
              padding: '12px 6px', border: 'none', background: tab === 'roles' ? '#ffffff' : 'transparent',
              borderBottom: tab === 'roles' ? '2.5px solid #E85D04' : 'none',
              fontWeight: tab === 'roles' ? '700' : '500', color: tab === 'roles' ? '#E85D04' : '#6B5B4C',
              fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
            }}
          >
            <Sparkles style={{ width: '12px', height: '12px' }} />
            Role Switch
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
              padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46',
              padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '6px' }}>
                  Username or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#9C8B7A' }} />
                  <input
                    type="text"
                    required
                    placeholder="owner, cashier, manager or email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px',
                      border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '6px' }}>
                  Password (Default: Haandi@2026)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '12px', width: '16px', height: '16px', color: '#9C8B7A' }} />
                  <input
                    type="password"
                    required
                    placeholder="Haandi@2026"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px',
                      border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '4px', background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px',
                  fontWeight: '700', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 15px rgba(139, 30, 30, 0.25)'
                }}
              >
                <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>

              {/* Quick Preset Accounts */}
              <div style={{
                background: '#FBF8F3', border: '1px dashed rgba(232,93,4,0.4)', borderRadius: '12px',
                padding: '12px', marginTop: '6px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#8B1E1E', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🔑 Quick Logins (Pass: Haandi@2026)</span>
                  <span style={{ fontSize: '9px', color: '#6b7280', fontWeight: '600' }}>Click to auto-fill</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { u: 'owner', role: 'Owner' },
                    { u: 'manager', role: 'Manager' },
                    { u: 'cashier', role: 'Cashier' },
                    { u: 'kitchen', role: 'Chef' },
                    { u: 'rider', role: 'Rider' },
                    { u: 'customer', role: 'Customer' }
                  ].map(c => (
                    <button
                      key={c.u}
                      type="button"
                      onClick={() => {
                        setEmail(c.u);
                        setPassword('Haandi@2026');
                        signIn(c.u, 'Haandi@2026').then(() => {
                          setSuccessMsg(`Logged in as ${c.u} (${c.role})`);
                          setTimeout(() => { onClose(); setSuccessMsg(null); }, 600);
                        });
                      }}
                      style={{
                        padding: '6px 4px', borderRadius: '6px',
                        background: '#ffffff', border: '1px solid #EADBCC',
                        fontSize: '10px', fontWeight: '700', color: '#1A120B',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s'
                      }}
                    >
                      <div>{c.u}</div>
                      <div style={{ fontSize: '8px', color: '#E85D04', textTransform: 'uppercase' }}>{c.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Register */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '4px' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon style={{ position: 'absolute', left: '12px', top: '10px', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asim Khan"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '4px' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '10px', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="email"
                    required
                    placeholder="asim@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '4px' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '12px', top: '10px', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="tel"
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '4px' }}>Role</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as Role)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '12px', outline: 'none', background: '#fff' }}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="CASHIER">Cashier (POS Counter)</option>
                  <option value="KITCHEN">Kitchen Staff</option>
                  <option value="MANAGER">Branch Manager</option>
                  <option value="RIDER">Delivery Rider</option>
                  <option value="OWNER">Owner / Admin</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '4px' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '10px', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '12px', outline: 'none' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px', background: '#E85D04', color: '#ffffff',
                  padding: '11px', borderRadius: '8px', border: 'none',
                  fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                }}
              >
                {loading ? 'Registering Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* TAB 3: Role Switcher (One-Click Testing) */}
          {tab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#6B5B4C', marginBottom: '4px' }}>
                Switch instantly between roles to test the app portals (Customer, Cashier, Kitchen, Manager, Rider, Owner):
              </div>
              {ROLES_LIST.map(r => {
                const isActive = profile?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => handleDemoSwitch(r.role)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 14px', borderRadius: '12px',
                      border: `1.5px solid ${isActive ? r.color : '#EADBCC'}`,
                      background: isActive ? `${r.color}15` : '#FBF8F3',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px',
                      background: r.color, color: '#ffffff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {r.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A120B' }}>{r.label}</span>
                        {isActive && (
                          <span style={{ background: r.color, color: '#fff', fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '20px' }}>
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B5B4C', marginTop: '1px' }}>{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Current profile & Sign Out action */}
          {profile && (
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #EADBCC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', color: '#6B5B4C' }}>
                Signed in: <strong>{profile.email}</strong>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  setSuccessMsg('Signed out');
                  setTimeout(() => setSuccessMsg(null), 1000);
                }}
                style={{
                  background: 'none', border: '1px solid #FCA5A5', color: '#991B1B',
                  borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth, PRESET_CREDENTIALS } from '../context/AuthContext';
import type { Role } from '../types';
import { ShieldAlert, Lock, User, Key, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react';

interface PortalGateProps {
  allowedRoles: Role[];
  portalName: string;
  portalIcon?: string;
  children: React.ReactNode;
}

export const PortalGate: React.FC<PortalGateProps> = ({
  allowedRoles,
  portalName,
  portalIcon = '🔒',
  children
}) => {
  const { profile, signIn, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check if current logged-in profile matches any of the allowed roles
  const isAuthorized = profile && allowedRoles.includes(profile.role);

  if (isAuthorized) {
    return <>{children}</>;
  }

  // Find relevant preset credential for this portal
  const primaryRole = allowedRoles[0];
  const presetForPortal = PRESET_CREDENTIALS.find(p => p.role === primaryRole) || PRESET_CREDENTIALS[0];

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(username.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: Role) => {
    const cred = PRESET_CREDENTIALS.find(p => p.role === role);
    if (!cred) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(cred.username, cred.password);
    } catch (err: any) {
      setError(err?.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'linear-gradient(180deg, #1A120B 0%, #2A1F17 100%)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#FDFBF7',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        border: '1.5px solid #EADBCC',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Header with Haandi Branding */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1E1E 0%, #1A120B 100%)',
          padding: '28px 24px 20px',
          color: '#ffffff',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 12px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '4px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/logo.png" alt="Haandi Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#F4C430', fontWeight: '800' }}>
            Restricted Staff Portal
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0', color: '#ffffff' }}>
            {portalIcon} {portalName}
          </h2>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Civic Center, Gulberg Greens, Islamabad
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {/* If signed in as wrong role */}
          {profile && !isAuthorized && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0 }} />
                <div style={{ fontSize: '11px', color: '#991B1B' }}>
                  Currently signed in as <strong>{profile.name}</strong> ({profile.role}). Requires <strong>{allowedRoles.join(' or ')}</strong>.
                </div>
              </div>
              <button
                onClick={() => signOut()}
                style={{
                  background: '#DC2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                <LogOut style={{ width: '10px', height: '10px' }} />
                <span>Switch</span>
              </button>
            </div>
          )}

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #EF4444',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              color: '#B91C1C',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Quick Demo Login One-Click Button */}
          <div style={{ marginBottom: '18px' }}>
            <button
              onClick={() => handleQuickLogin(primaryRole)}
              disabled={submitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #E85D04 0%, #F4C430 100%)',
                color: '#1A120B',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(232,93,4,0.3)',
                transition: 'transform 0.15s, opacity 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CheckCircle2 style={{ width: '16px', height: '16px' }} />
              <span>⚡ One-Click Login as {presetForPortal.name}</span>
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            fontSize: '11px',
            color: '#9CA3AF'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
            <span>or sign in manually</span>
            <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '6px' }}>
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder={`e.g. ${presetForPortal.username} or ${presetForPortal.email}`}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '13px',
                    background: '#FBF8F3',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#4B3E32', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Key style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9CA3AF' }} />
                <input
                  type="password"
                  placeholder="Default: Haandi@2026"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '10px',
                    border: '1.5px solid #E5E7EB',
                    fontSize: '13px',
                    background: '#FBF8F3',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
                Password for all accounts: <code style={{ background: '#F3F4F6', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>Haandi@2026</code>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#8B1E1E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: '800',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                opacity: submitting ? 0.7 : 1
              }}
            >
              <Lock style={{ width: '14px', height: '14px' }} />
              <span>{submitting ? 'Authenticating...' : `Access ${portalName}`}</span>
              <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div style={{
          padding: '12px 24px',
          background: '#FBF8F3',
          borderTop: '1px solid #EADBCC',
          fontSize: '11px',
          color: '#6B7280',
          textAlign: 'center'
        }}>
          Authorized staff only · Haandi by Yumto Restaurant OS
        </div>
      </div>
    </div>
  );
};

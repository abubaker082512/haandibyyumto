import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { ShieldAlert, Lock, User, Key, ArrowRight, LogOut } from 'lucide-react';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await signIn(username.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'linear-gradient(180deg, #1A120B 0%, #2A1F17 100%)'
    }}>
      <div style={{
        maxWidth: '420px',
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
          padding: '28px 24px 22px',
          color: '#ffffff',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
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
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0 }} />
                <div style={{ fontSize: '11px', color: '#991B1B', lineHeight: 1.4 }}>
                  Signed in as <strong>{profile.name}</strong> ({profile.role}). Access requires <strong>{allowedRoles.join(' / ')}</strong>.
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  background: '#DC2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                <LogOut style={{ width: '11px', height: '11px' }} />
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
              fontWeight: '700'
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Secure Staff Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Staff Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9CA3AF' }} />
                <input
                  type="text"
                  required
                  placeholder="Enter authorized username or email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '10px',
                    border: '1.5px solid #EADBCC',
                    fontSize: '13px',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Key style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9CA3AF' }} />
                <input
                  type="password"
                  required
                  placeholder="Enter staff security password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 38px',
                    borderRadius: '10px',
                    border: '1.5px solid #EADBCC',
                    fontSize: '13px',
                    background: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '13px',
                fontWeight: '900',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '6px',
                boxShadow: '0 4px 14px rgba(139,30,30,0.3)',
                opacity: submitting ? 0.75 : 1,
                transition: 'all 0.15s'
              }}
            >
              <Lock style={{ width: '14px', height: '14px' }} />
              <span>{submitting ? 'Verifying Credentials...' : `Sign In to ${portalName}`}</span>
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
          Authorized restaurant personnel only · Haandi by Yumto POS
        </div>
      </div>
    </div>
  );
};

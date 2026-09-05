import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X, Mail, Lock, User as UserIcon, Phone,
  ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { profile, signIn, signUp, signOut } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password) {
      setError('Please enter both username/email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signIn(emailOrUsername.trim(), password);
      setSuccessMsg('Signed in successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !name.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim(), phone.trim(), 'CUSTOMER');
      setSuccessMsg('Account registered and logged in successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to register account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '420px', width: '100%',
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
              style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FBF8F3', padding: '2px', objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.04em' }}>
                Haandi by Yumto
              </div>
              <div style={{ fontSize: '11px', color: '#F4A261', fontWeight: '700' }}>
                {profile ? `Logged in: ${profile.name} (${profile.role})` : 'Customer & Member Access'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #EADBCC', background: '#FBF8F3' }}>
          <button
            onClick={() => { setTab('signin'); setError(null); }}
            style={{
              padding: '12px 6px', border: 'none', background: tab === 'signin' ? '#ffffff' : 'transparent',
              borderBottom: tab === 'signin' ? '2.5px solid #8B1E1E' : 'none',
              fontWeight: tab === 'signin' ? '800' : '600', color: tab === 'signin' ? '#8B1E1E' : '#6B5B4C',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(null); }}
            style={{
              padding: '12px 6px', border: 'none', background: tab === 'signup' ? '#ffffff' : 'transparent',
              borderBottom: tab === 'signup' ? '2.5px solid #8B1E1E' : 'none',
              fontWeight: tab === 'signup' ? '800' : '600', color: tab === 'signup' ? '#8B1E1E' : '#6B5B4C',
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
              padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46',
              padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700',
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
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Username or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9C8B7A' }} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your username or email"
                    value={emailOrUsername}
                    onChange={e => setEmailOrUsername(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 12px 11px 38px', borderRadius: '10px',
                      border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none', background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9C8B7A' }} />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 12px 11px 38px', borderRadius: '10px',
                      border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none', background: '#ffffff',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '6px', background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)',
                  color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px',
                  fontWeight: '800', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 15px rgba(139, 30, 30, 0.25)',
                  opacity: loading ? 0.75 : 1
                }}
              >
                <span>{loading ? 'Authenticating…' : 'Sign In to Haandi'}</span>
                <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            </form>
          )}

          {/* TAB 2: Register */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '4px', textTransform: 'uppercase' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asim Khan"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '4px', textTransform: 'uppercase' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="email"
                    required
                    placeholder="asim@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '4px', textTransform: 'uppercase' }}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="tel"
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#4B3E32', marginBottom: '4px', textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: '#9C8B7A' }} />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1.5px solid #EADBCC', fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#ffffff' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '6px', background: 'linear-gradient(135deg, #8B1E1E 0%, #E85D04 100%)', color: '#ffffff',
                  padding: '12px', borderRadius: '10px', border: 'none',
                  fontWeight: '800', fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(139,30,30,0.25)', opacity: loading ? 0.75 : 1
                }}
              >
                {loading ? 'Registering Account...' : 'Create Customer Account'}
              </button>
            </form>
          )}

          {/* Current profile & Sign Out action */}
          {profile && (
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #EADBCC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', color: '#6B5B4C' }}>
                Signed in: <strong>{profile.email || profile.name}</strong> ({profile.role})
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  setSuccessMsg('Signed out successfully');
                  setTimeout(() => setSuccessMsg(null), 1000);
                }}
                style={{
                  background: 'none', border: '1px solid #FCA5A5', color: '#991B1B',
                  borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
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

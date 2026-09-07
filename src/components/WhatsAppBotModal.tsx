import React, { useState, useEffect } from 'react';
import {
  notificationService,
  getWhatsAppApiBase,
  setWhatsAppApiBase,
  type WhatsAppStatusResponse
} from '../services/notificationService';
import {
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Send,
  Smartphone,
  PowerOff,
  ShieldCheck,
  Globe,
  Settings,
  Copy,
  ExternalLink,
  Zap
} from 'lucide-react';

interface WhatsAppBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppBotModal: React.FC<WhatsAppBotModalProps> = ({ isOpen, onClose }) => {
  const [statusData, setStatusData] = useState<WhatsAppStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMsg, setTestMsg] = useState('Assalam-o-Alaikum! Test receipt notification from Haandi by Yumto POS. 🍲');
  const [sendResult, setSendResult] = useState<{ success?: boolean; text?: string; fallbackUrl?: string } | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(getWhatsAppApiBase());
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getWhatsAppBotStatus();
      setStatusData(data);
    } catch {
      setStatusData({
        success: false,
        status: 'disconnected',
        isReady: false,
        error: 'Backend WhatsApp service offline'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setApiUrl(getWhatsAppApiBase());
      fetchStatus();
      const interval = setInterval(fetchStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiUrl = (newUrl: string) => {
    setWhatsAppApiBase(newUrl);
    setApiUrl(newUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    fetchStatus();
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm run whatsapp:bot');
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2500);
  };

  const handleSendTest = async () => {
    if (!testPhone) return;
    setLoading(true);
    setSendResult(null);
    try {
      const res = await notificationService.sendCustomWhatsAppMessage(testPhone, testMsg);
      if (res.success) {
        setSendResult({
          success: true,
          text: `✓ Test WhatsApp message sent via Bot to ${testPhone}!`,
          fallbackUrl: res.fallbackUrl
        });
      } else {
        setSendResult({
          success: false,
          text: `Bot Server Offline: Click below to dispatch directly via WhatsApp Web/App`,
          fallbackUrl: res.fallbackUrl
        });
      }
    } catch (e: any) {
      const fallback = notificationService.getDirectWhatsAppUrl(testPhone, testMsg);
      setSendResult({
        success: false,
        text: `Error connecting to Bot server: ${e.message}`,
        fallbackUrl: fallback
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to unlink and reset the WhatsApp session?')) {
      setLoading(true);
      await notificationService.logoutWhatsAppBot();
      await fetchStatus();
      setLoading(false);
    }
  };

  const isConnected = statusData?.status === 'connected' && statusData?.isReady;
  const isQrReady = statusData?.status === 'qr_ready' && !!statusData?.qrCodeDataUrl;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#1A120B',
        border: '1.5px solid rgba(232,93,4,0.4)',
        borderRadius: '24px',
        width: '100%', maxWidth: '600px',
        color: '#FFFFFF',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(232,93,4,0.25)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,30,30,0.4) 0%, rgba(232,93,4,0.25) 100%)',
          padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 14px rgba(37,211,102,0.4)'
            }}>
              <MessageSquare style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '0.2px' }}>
                WhatsApp Order Automation & Gateway
              </h3>
              <p style={{ fontSize: '11px', color: '#F4C430', margin: '2px 0 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Zap style={{ width: '12px', height: '12px' }} />
                Dual Engine: Automated Baileys Bot + Direct Web Gateway
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Configure Bot Server URL"
              style={{
                background: showSettings ? 'rgba(232,93,4,0.3)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${showSettings ? '#E85D04' : 'rgba(255,255,255,0.15)'}`,
                color: '#FFF', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Settings style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF',
                borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer',
                fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Server Config Drawer */}
          {showSettings && (
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(232,93,4,0.35)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#F4C430', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe style={{ width: '14px', height: '14px' }} />
                  WhatsApp Microservice Endpoint URL:
                </span>
                {saveSuccess && (
                  <span style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '700' }}>✓ Saved!</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="e.g. http://localhost:5000 or https://your-bot.render.com"
                  style={{
                    flex: 1, background: '#110D09', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '8px 12px', color: '#FFF', fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={() => handleSaveApiUrl(apiUrl)}
                  style={{
                    background: '#E85D04', border: 'none', color: '#FFF',
                    borderRadius: '8px', padding: '8px 14px', fontSize: '12px',
                    fontWeight: '800', cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => handleSaveApiUrl('http://localhost:5000')}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#CCC', borderRadius: '8px', padding: '8px 10px', fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Reset Local
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#A89F91', marginTop: '6px' }}>
                Tip: When hosting on Vercel/Cloud, run the server locally with ngrok (e.g. <code style={{ color: '#4ADE80' }}>ngrok http 5000</code>) or on a cloud container and paste the URL here.
              </div>
            </div>
          )}

          {/* Status Indicator Card */}
          <div style={{
            background: isConnected
              ? 'rgba(37,211,102,0.12)'
              : isQrReady
              ? 'rgba(244,196,48,0.12)'
              : 'rgba(239,68,68,0.12)',
            border: `1.5px solid ${isConnected ? '#25D366' : isQrReady ? '#F4C430' : '#EF4444'}`,
            borderRadius: '16px', padding: '16px', marginBottom: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isConnected ? (
                <CheckCircle2 style={{ width: '32px', height: '32px', color: '#25D366', flexShrink: 0 }} />
              ) : isQrReady ? (
                <QrCode style={{ width: '32px', height: '32px', color: '#F4C430', flexShrink: 0 }} />
              ) : (
                <AlertCircle style={{ width: '32px', height: '32px', color: '#EF4444', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>
                  {isConnected
                    ? '🟢 WhatsApp Bot is Connected & Active'
                    : isQrReady
                    ? '🟡 QR Code Ready - Scan with WhatsApp'
                    : '🔴 Local WhatsApp Microservice Offline'}
                </div>
                <div style={{ fontSize: '12px', color: '#D4C5B9', marginTop: '2px' }}>
                  {isConnected
                    ? `Linked Number: +${statusData?.phoneNumber || 'Active Restaurant SIM'}`
                    : isQrReady
                    ? 'Open WhatsApp on your phone > Linked Devices > Link a Device'
                    : 'Direct WhatsApp Web Gateway is active & ready for 1-click dispatch!'}
                </div>
              </div>
            </div>

            <button
              onClick={fetchStatus}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFF', borderRadius: '10px', padding: '8px 12px', fontSize: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span>Ping</span>
            </button>
          </div>

          {/* QR Code Display if waiting to link */}
          {isQrReady && statusData?.qrCodeDataUrl && (
            <div style={{
              background: '#FFFFFF', borderRadius: '18px', padding: '20px',
              textAlign: 'center', marginBottom: '18px', color: '#1A120B'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>
                📲 Scan to Link Haandi Restaurant WhatsApp SIM
              </div>
              <img
                src={statusData.qrCodeDataUrl}
                alt="WhatsApp QR Code"
                style={{ width: '220px', height: '220px', margin: '0 auto', display: 'block', borderRadius: '10px' }}
              />
              <div style={{ fontSize: '11px', color: '#555', marginTop: '10px', lineHeight: 1.4 }}>
                1. Open WhatsApp on your phone → 2. Tap Menu (⋮) or Settings → 3. Linked Devices → 4. Scan this QR
              </div>
            </div>
          )}

          {/* If Offline: Clear Quick Start & Direct Gateway Banner */}
          {!isConnected && !isQrReady && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '16px', marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#F4C430', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smartphone style={{ width: '16px', height: '16px' }} />
                  <span>To Enable 100% Background Automation:</span>
                </div>
                <button
                  onClick={handleCopyCommand}
                  style={{
                    background: copiedCommand ? 'rgba(37,211,102,0.2)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${copiedCommand ? '#25D366' : 'rgba(255,255,255,0.2)'}`,
                    color: copiedCommand ? '#4ADE80' : '#FFF',
                    borderRadius: '6px', padding: '4px 10px', fontSize: '11px',
                    fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Copy style={{ width: '12px', height: '12px' }} />
                  <span>{copiedCommand ? 'Copied!' : 'Copy Start Command'}</span>
                </button>
              </div>

              <div style={{ fontSize: '12px', color: '#D4C5B9', lineHeight: 1.6 }}>
                1. Open terminal in the project folder.<br />
                2. Run: <code style={{ background: '#0B0806', padding: '2px 8px', borderRadius: '4px', color: '#4ADE80', fontWeight: '700' }}>npm run whatsapp:bot</code><br />
                3. The QR Code will appear above automatically to link your WhatsApp SIM.
              </div>

              <div style={{
                marginTop: '12px', padding: '10px 12px', background: 'rgba(37,211,102,0.1)',
                border: '1px solid rgba(37,211,102,0.3)', borderRadius: '10px',
                fontSize: '12px', color: '#D1FAE5', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Zap style={{ width: '16px', height: '16px', color: '#25D366', flexShrink: 0 }} />
                <span>
                  <strong>Live Fallback Active:</strong> Cashiers can always click the green WhatsApp button on any order to instantly open WhatsApp Web / App with the pre-filled luxury receipt!
                </span>
              </div>
            </div>
          )}

          {/* Connected Details & Actions */}
          {isConnected && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '16px', marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#25D366' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>Live Automation Mode:</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(37,211,102,0.2)', color: '#4ADE80', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                  Active & Ready
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#C5B8A5', lineHeight: 1.5 }}>
                • Every order placed online or punched by the cashier will automatically send a luxury receipt and live GPS rider tracking link directly to the customer's WhatsApp in the background.
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', color: '#EF4444',
                    borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: '700',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <PowerOff style={{ width: '13px', height: '13px' }} />
                  <span>Unlink / Log out WhatsApp Session</span>
                </button>
              </div>
            </div>
          )}

          {/* Test WhatsApp Message Box */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Send style={{ width: '14px', height: '14px', color: '#E85D04' }} />
              <span>Send Test WhatsApp Message:</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="tel"
                placeholder="Customer Phone (e.g. 03001234567 or 923001234567)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', padding: '10px 14px', color: '#FFF', fontSize: '13px'
                }}
              />
              <input
                type="text"
                placeholder="Test Message..."
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px', padding: '10px 14px', color: '#FFF', fontSize: '13px'
                }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSendTest}
                  disabled={loading || !testPhone}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #15803D 0%, #25D366 100%)',
                    border: 'none', borderRadius: '10px', padding: '11px 16px',
                    color: '#FFF', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    opacity: loading || !testPhone ? 0.6 : 1
                  }}
                >
                  <Send style={{ width: '14px', height: '14px' }} />
                  <span>Send Test Notification</span>
                </button>

                {testPhone && (
                  <a
                    href={notificationService.getDirectWhatsAppUrl(testPhone, testMsg)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'rgba(37,211,102,0.15)',
                      border: '1px solid #25D366',
                      borderRadius: '10px', padding: '11px 14px',
                      color: '#4ADE80', fontWeight: '700', fontSize: '12px',
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <ExternalLink style={{ width: '14px', height: '14px' }} />
                    <span>WhatsApp Web</span>
                  </a>
                )}
              </div>

              {sendResult && (
                <div style={{
                  marginTop: '8px', padding: '10px 14px', borderRadius: '10px', fontSize: '12px',
                  background: sendResult.success ? 'rgba(37,211,102,0.15)' : 'rgba(239,68,68,0.15)',
                  color: sendResult.success ? '#4ADE80' : '#FCA5A5',
                  border: `1px solid ${sendResult.success ? '#25D366' : '#EF4444'}`,
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div>{sendResult.text}</div>
                  {sendResult.fallbackUrl && (
                    <a
                      href={sendResult.fallbackUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#25D366', color: '#FFF', padding: '6px 12px',
                        borderRadius: '6px', textDecoration: 'none', fontWeight: '800',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        alignSelf: 'flex-start', fontSize: '11px'
                      }}
                    >
                      <ExternalLink style={{ width: '12px', height: '12px' }} />
                      <span>Open in WhatsApp Web / App</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ABT IT innovations PVT LTD Footer */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            <div>WhatsApp Baileys Real-time Order Engine · Haandi by Yumto</div>
            <div style={{ color: '#E85D04', fontWeight: '700' }}>
              Powered By: ABT IT innovations PVT LTD. · For Queries WhatsApp: +92-333-5945499
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

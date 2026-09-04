import React, { useState, useEffect } from 'react';
import { notificationService, type WhatsAppStatusResponse } from '../services/notificationService';
import { MessageSquare, RefreshCw, CheckCircle2, AlertCircle, QrCode, Send, Smartphone, PowerOff, ShieldCheck } from 'lucide-react';

interface WhatsAppBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppBotModal: React.FC<WhatsAppBotModalProps> = ({ isOpen, onClose }) => {
  const [statusData, setStatusData] = useState<WhatsAppStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMsg, setTestMsg] = useState('Test automated receipt from Haandi by Yumto POS! 🍲');
  const [sendResult, setSendResult] = useState<{ success?: boolean; text?: string } | null>(null);

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
      fetchStatus();
      const interval = setInterval(fetchStatus, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    if (!testPhone) return;
    setLoading(true);
    setSendResult(null);
    try {
      const res = await notificationService.sendCustomWhatsAppMessage(testPhone, testMsg);
      if (res.success) {
        setSendResult({ success: true, text: `✓ Test WhatsApp message sent to ${testPhone}!` });
      } else {
        setSendResult({ success: false, text: `✕ Failed: ${res.error || 'Check bot status'}` });
      }
    } catch (e: any) {
      setSendResult({ success: false, text: `✕ Error: ${e.message}` });
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
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#1A120B',
        border: '1.5px solid rgba(232,93,4,0.4)',
        borderRadius: '24px',
        width: '100%', maxWidth: '560px',
        color: '#FFFFFF',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(232,93,4,0.2)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,30,30,0.3) 0%, rgba(232,93,4,0.2) 100%)',
          padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', boxShadow: '0 4px 14px rgba(37,211,102,0.4)'
            }}>
              <MessageSquare style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>
                WhatsApp Order Automation Bot
              </h3>
              <p style={{ fontSize: '11px', color: '#F4C430', margin: 0, fontWeight: '600' }}>
                Self-Hosted Free Baileys Service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FFF',
              borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer',
              fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', maxHeight: '75vh', overflowY: 'auto' }}>
          {/* Status Indicator Card */}
          <div style={{
            background: isConnected
              ? 'rgba(37,211,102,0.1)'
              : isQrReady
              ? 'rgba(244,196,48,0.1)'
              : 'rgba(239,68,68,0.1)',
            border: `1.5px solid ${isConnected ? '#25D366' : isQrReady ? '#F4C430' : '#EF4444'}`,
            borderRadius: '16px', padding: '16px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isConnected ? (
                <CheckCircle2 style={{ width: '28px', height: '28px', color: '#25D366', flexShrink: 0 }} />
              ) : isQrReady ? (
                <QrCode style={{ width: '28px', height: '28px', color: '#F4C430', flexShrink: 0 }} />
              ) : (
                <AlertCircle style={{ width: '28px', height: '28px', color: '#EF4444', flexShrink: 0 }} />
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>
                  {isConnected
                    ? '🟢 WhatsApp Bot is Connected & Active'
                    : isQrReady
                    ? '🟡 QR Code Ready - Scan with WhatsApp'
                    : '🔴 WhatsApp Service Offline'}
                </div>
                <div style={{ fontSize: '12px', color: '#A89F91', marginTop: '2px' }}>
                  {isConnected
                    ? `Linked Number: +${statusData?.phoneNumber || 'Active Restaurant SIM'}`
                    : isQrReady
                    ? 'Open WhatsApp on your phone > Linked Devices > Link a Device'
                    : 'Run `npm run whatsapp:bot` in terminal on your POS system'}
                </div>
              </div>
            </div>

            <button
              onClick={fetchStatus}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#FFF', borderRadius: '10px', padding: '8px 12px', fontSize: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh</span>
            </button>
          </div>

          {/* QR Code Display if waiting to link */}
          {isQrReady && statusData?.qrCodeDataUrl && (
            <div style={{
              background: '#FFFFFF', borderRadius: '18px', padding: '20px',
              textAlign: 'center', marginBottom: '20px', color: '#1A120B'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px' }}>
                📲 Scan to Link Haandi Restaurant WhatsApp
              </div>
              <img
                src={statusData.qrCodeDataUrl}
                alt="WhatsApp QR Code"
                style={{ width: '220px', height: '220px', margin: '0 auto', display: 'block', borderRadius: '10px' }}
              />
              <div style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>
                1. Open WhatsApp on phone → 2. Tap Menu (⋮) or Settings → 3. Linked Devices → 4. Scan QR
              </div>
            </div>
          )}

          {/* If Offline Instructions */}
          {!isConnected && !isQrReady && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '16px', marginBottom: '20px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#F4C430', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone style={{ width: '16px', height: '16px' }} />
                <span>How to start the automated WhatsApp Bot:</span>
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#D4C5B9', lineHeight: 1.6 }}>
                <li>Open a new terminal window in the project folder.</li>
                <li>Run the command: <code style={{ background: '#000', padding: '2px 6px', borderRadius: '4px', color: '#4ADE80' }}>npm run whatsapp:bot</code></li>
                <li>The server will start on port 5000 and display the QR code here automatically!</li>
              </ol>
            </div>
          )}

          {/* Connected Details & Actions */}
          {isConnected && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '16px', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#25D366' }} />
                  <span style={{ fontSize: '13px', fontWeight: '800' }}>Automation Status:</span>
                </div>
                <span style={{ fontSize: '11px', background: 'rgba(37,211,102,0.2)', color: '#4ADE80', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                  100% Auto-Dispatch ON
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#C5B8A5', lineHeight: 1.5 }}>
                • Whenever a customer places an order on the Web or Mobile App, an automated luxury receipt with their live order & rider tracking link is sent automatically.
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
                  <span>Unlink / Log out Device</span>
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
                placeholder="Customer Phone (e.g. 03001234567)"
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

              <button
                onClick={handleSendTest}
                disabled={loading || !testPhone}
                style={{
                  background: 'linear-gradient(135deg, #15803D 0%, #25D366 100%)',
                  border: 'none', borderRadius: '10px', padding: '10px 16px',
                  color: '#FFF', fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: loading || !testPhone ? 0.6 : 1
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                <span>Send Test Message</span>
              </button>

              {sendResult && (
                <div style={{
                  marginTop: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '12px',
                  background: sendResult.success ? 'rgba(37,211,102,0.15)' : 'rgba(239,68,68,0.15)',
                  color: sendResult.success ? '#4ADE80' : '#F87171',
                  border: `1px solid ${sendResult.success ? '#25D366' : '#EF4444'}`
                }}>
                  {sendResult.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

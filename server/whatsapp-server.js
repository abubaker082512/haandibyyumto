import express from 'express';
import cors from 'cors';
import pino from 'pino';
import QRCode from 'qrcode';
import qrcodeTerminal from 'qrcode-terminal';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FOLDER = path.join(__dirname, 'auth_info_baileys');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-memory bot state
let sock = null;
let botState = {
  status: 'initializing', // 'initializing' | 'qr_ready' | 'connected' | 'disconnected'
  qrCodeDataUrl: null,
  rawQr: null,
  phoneNumber: null,
  lastUpdated: new Date().toISOString()
};

const logger = pino({ level: 'silent' });

async function initWhatsApp() {
  try {
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    botState.status = 'connecting';
    botState.lastUpdated = new Date().toISOString();

    sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: state,
      browser: ['Haandi by Yumto POS', 'Chrome', '1.0.0'],
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        botState.status = 'qr_ready';
        botState.rawQr = qr;
        try {
          botState.qrCodeDataUrl = await QRCode.toDataURL(qr);
        } catch (err) {
          console.error('Error generating QR DataURL:', err);
        }
        botState.lastUpdated = new Date().toISOString();

        console.log('\n========================================');
        console.log('⚡ HAANDI BY YUMTO - WHATSAPP BOT QR CODE');
        console.log('Scan this QR code with WhatsApp on your phone:');
        console.log('========================================\n');
        qrcodeTerminal.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[WhatsApp] Connection closed. Reason: ${statusCode}. Reconnecting: ${shouldReconnect}`);
        botState.status = 'disconnected';
        botState.qrCodeDataUrl = null;
        botState.phoneNumber = null;
        botState.lastUpdated = new Date().toISOString();

        if (shouldReconnect) {
          setTimeout(initWhatsApp, 4000);
        } else {
          console.log('[WhatsApp] Logged out. Clearing session files...');
          try {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
          } catch (e) {}
          setTimeout(initWhatsApp, 3000);
        }
      } else if (connection === 'open') {
        console.log('\n🎉 [WhatsApp] Connected successfully to Haandi by Yumto!');
        const phone = sock.user?.id ? sock.user.id.split(':')[0] : 'Connected';
        botState.status = 'connected';
        botState.qrCodeDataUrl = null;
        botState.rawQr = null;
        botState.phoneNumber = phone;
        botState.lastUpdated = new Date().toISOString();
        console.log(`📱 Linked WhatsApp Number: +${phone}\n`);
      }
    });

  } catch (error) {
    console.error('[WhatsApp] Initialization error:', error);
    botState.status = 'disconnected';
    botState.lastUpdated = new Date().toISOString();
    setTimeout(initWhatsApp, 6000);
  }
}

// Format Pakistani & International Phone Numbers
function formatPhoneNumberToJid(phoneStr) {
  if (!phoneStr) return null;
  // Remove all non-digits except leading +
  let clean = phoneStr.toString().replace(/[^\d]/g, '');

  // If local Pakistani format 03XXXXXXXXX -> 923XXXXXXXXX
  if (clean.startsWith('03') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }

  // Ensure minimum length
  if (clean.length < 10) return null;

  return `${clean}@s.whatsapp.net`;
}

// ─────────────────────────────────────────────────────────────
// REST API ROUTES
// ─────────────────────────────────────────────────────────────

// 1. Health & Status
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    success: true,
    ...botState,
    isReady: botState.status === 'connected' && !!sock
  });
});

// 2. Automated Order Notification
app.post('/api/whatsapp/send-order', async (req, res) => {
  try {
    const {
      orderId,
      customerName,
      customerPhone,
      items,
      total,
      orderType,
      deliveryAddress,
      trackingUrl,
      discountAmount
    } = req.body;

    if (!customerPhone) {
      return res.status(400).json({ success: false, error: 'Customer phone number is required' });
    }

    const jid = formatPhoneNumberToJid(customerPhone);
    if (!jid) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    if (botState.status !== 'connected' || !sock) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp Bot is not connected yet. Please scan the QR code first.',
        status: botState.status
      });
    }

    // Build itemized list
    let itemListText = '';
    if (Array.isArray(items) && items.length > 0) {
      itemListText = items.map(it => `  • *${it.quantity}x* ${it.name}${it.variation ? ` (${it.variation})` : ''} - Rs. ${(it.price * it.quantity).toLocaleString()}`).join('\n');
    } else {
      itemListText = '  • Order Items as placed';
    }

    const orderTypeLabel = orderType === 'DELIVERY' ? '🛵 Home Delivery' : orderType === 'PICK_UP' ? '🛍️ Takeaway / Pickup' : '🪑 Dine-In';
    const trackLink = trackingUrl || `https://haandibyyumto.com/track?id=${orderId || 'LATEST'}`;

    // Luxury Desi Theme Receipt Message
    const messageText = 
`🍲 *HAANDI BY YUMTO* 🍲
_Authentic Desi Fine Dining & Handi Delights_
📍 Civic Center, Gulberg Greens, Islamabad

Assalam-o-Alaikum *${customerName || 'Valued Customer'}*! ✨
Thank you for choosing Haandi by Yumto. Your order has been placed successfully!

━━━━━━━━━━━━━━━━━━━━━
📋 *ORDER RECEIPT*
━━━━━━━━━━━━━━━━━━━━━
🆔 *Order #:* \`${orderId || 'HD-NEW'}\`
🍽️ *Type:* ${orderTypeLabel}
${deliveryAddress ? `📍 *Address:* ${deliveryAddress}\n` : ''}
📦 *Items Ordered:*
${itemListText}

${discountAmount ? `🏷️ *Discount Applied:* -Rs. ${discountAmount.toLocaleString()}\n` : ''}💰 *Total Bill:* *Rs. ${(total || 0).toLocaleString()}* (Cash on Delivery / POS)
━━━━━━━━━━━━━━━━━━━━━

🛵 *LIVE ORDER & RIDER TRACKING:*
Click the link below to track food preparation and live rider GPS:
👉 ${trackLink}

📞 *Restaurant Helpline:*
0300-YUMTO-01 / (051) 844-9988

_We are preparing your feast with authentic spices and fresh handi aroma!_ 🌿🍲`;

    const result = await sock.sendMessage(jid, { text: messageText });

    return res.json({
      success: true,
      messageId: result?.key?.id,
      recipient: jid,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[WhatsApp] Failed to send order message:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal error while sending WhatsApp message'
    });
  }
});

// 3. Send Custom WhatsApp Message
app.post('/api/whatsapp/send-custom', async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'Phone and message are required' });
    }

    const jid = formatPhoneNumberToJid(phone);
    if (!jid) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    if (botState.status !== 'connected' || !sock) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp bot is offline or not connected'
      });
    }

    const result = await sock.sendMessage(jid, { text: message });
    return res.json({
      success: true,
      messageId: result?.key?.id,
      recipient: jid
    });
  } catch (error) {
    console.error('[WhatsApp] Send custom message error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Logout / Reset Bot
app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout().catch(() => {});
    }
    try {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    } catch (e) {}

    botState = {
      status: 'disconnected',
      qrCodeDataUrl: null,
      rawQr: null,
      phoneNumber: null,
      lastUpdated: new Date().toISOString()
    };

    setTimeout(initWhatsApp, 1500);
    return res.json({ success: true, message: 'WhatsApp session reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Haandi by Yumto - WhatsApp Bot Service running on port ${PORT}`);
  console.log(`👉 Status API: http://localhost:${PORT}/api/whatsapp/status`);
  console.log(`======================================================\n`);
  initWhatsApp();
});

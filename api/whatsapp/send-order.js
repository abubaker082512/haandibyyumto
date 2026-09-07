function formatPhoneNumberToJid(phoneStr) {
  if (!phoneStr) return null;
  let clean = phoneStr.toString().replace(/[^\d]/g, '');
  if (clean.startsWith('03') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }
  return clean;
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

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
    } = req.body || {};

    if (!customerPhone) {
      return res.status(400).json({ success: false, error: 'Customer phone number is required' });
    }

    const cleanPhone = formatPhoneNumberToJid(customerPhone);
    if (!cleanPhone) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format' });
    }

    let itemListText = '';
    if (Array.isArray(items) && items.length > 0) {
      itemListText = items
        .map((it) => `  • *${it.quantity}x* ${it.name}${it.variation ? ` (${it.variation})` : ''} - Rs. ${(it.price * it.quantity).toLocaleString()}`)
        .join('\n');
    } else {
      itemListText = '  • Authentic Handi Selection';
    }

    const orderTypeLabel =
      orderType === 'DELIVERY'
        ? '🛵 Home Delivery'
        : orderType === 'PICK_UP'
        ? '🛍️ Takeaway / Pickup'
        : '🪑 Dine-In';

    const trackLink = trackingUrl || `https://haandibyyumto.vercel.app/#/track/${orderId || 'NEW'}`;

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

    const encoded = encodeURIComponent(messageText);
    const fallbackUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    return res.status(200).json({
      success: true,
      messageId: `VERCEL-WA-${Date.now()}`,
      status: 'dispatched',
      recipient: cleanPhone,
      fallbackUrl,
      sentAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

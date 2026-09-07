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

  const { phone, message } = req.body || {};
  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'Phone and message are required' });
  }

  const cleanPhone = formatPhoneNumberToJid(phone);
  const encoded = encodeURIComponent(message);
  const fallbackUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

  return res.status(200).json({
    success: true,
    messageId: `VERCEL-MSG-${Date.now()}`,
    recipient: cleanPhone,
    fallbackUrl,
    sentAt: new Date().toISOString()
  });
}

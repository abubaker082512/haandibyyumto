export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: 'online',
    service: 'Haandi by Yumto SuperApp API',
    cloud: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
    developer: 'Powered By: ABT IT innovations PVT LTD. · WhatsApp: +92-333-5945499'
  });
}

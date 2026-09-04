# 🍲 Haandi by Yumto — Automated WhatsApp Bot Service (100% Free)

This is the self-hosted background service powered by **Node.js, Express, and `@whiskeysockets/baileys`**. It automatically sends luxury branded order receipts and live rider/order tracking links to customers over WhatsApp whenever an order is placed or punched.

---

## 🚀 How to Run the WhatsApp Bot Service

1. Open your terminal in the root project folder:
   ```bash
   npm run whatsapp:bot
   ```

2. **First Time Setup (Scan QR Code Once):**
   - The terminal will display a QR Code, and the **Cashier POS & Manager Panels** will also render the QR code right on screen.
   - Open **WhatsApp** on the restaurant phone → Tap **Menu (⋮)** / **Settings** → **Linked Devices** → **Link a Device** → Scan the QR Code.
   - Once connected, it stays logged in permanently (saved in `server/auth_info_baileys/`).

3. **Automated Features:**
   - Whenever an order is submitted on the Web or Mobile App, the bot automatically formats and dispatches the luxury Haandi receipt directly to the customer's WhatsApp.
   - When the Cashier verifies the call and punches to the Kitchen KDS, an update notification is dispatched.
   - Provides live order tracking link: `https://haandibyyumto.com/track?id=HD-XXXX`
   - Zero monthly fees, zero per-message charges!

import type { Order } from '../types';

export const getWhatsAppApiBase = (): string => {
  return localStorage.getItem('haandi_whatsapp_api_url') || (import.meta as any).env?.VITE_WHATSAPP_API_URL || 'http://localhost:5000';
};

export const setWhatsAppApiBase = (url: string): void => {
  localStorage.setItem('haandi_whatsapp_api_url', url.trim().replace(/\/+$/, ''));
};

export interface WhatsAppStatusResponse {
  success: boolean;
  status: 'initializing' | 'connecting' | 'qr_ready' | 'connected' | 'disconnected';
  isReady: boolean;
  qrCodeDataUrl?: string | null;
  phoneNumber?: string | null;
  lastUpdated?: string;
  error?: string;
}

export const notificationService = {
  /**
   * Cleans phone number string to standardized Pakistani / International format
   */
  cleanPhoneNumber(phoneStr: string): string {
    if (!phoneStr) return '';
    let clean = phoneStr.replace(/[^\d]/g, '');
    if (clean.startsWith('03') && clean.length === 11) {
      clean = '92' + clean.slice(1);
    } else if (clean.startsWith('3') && clean.length === 10) {
      clean = '92' + clean;
    }
    return clean;
  },

  /**
   * Formats a rich, authentic luxury receipt message for Haandi by Yumto
   */
  formatOrderWhatsAppMessage(order: Order, trackingUrl?: string): string {
    const trackLink =
      trackingUrl ||
      `${window.location.origin}/track?id=${order.id || 'NEW'}`;

    const itemsText = (order.items || [])
      .map(
        (it) =>
          `  • *${it.quantity}x* ${it.name}${it.variation ? ` (${it.variation})` : ''} - Rs. ${(it.price * it.quantity).toLocaleString()}`
      )
      .join('\n');

    const typeLabel =
      order.orderType === 'DELIVERY'
        ? '🛵 Home Delivery'
        : order.orderType === 'PICK_UP'
        ? '🛍️ Takeaway / Pickup'
        : '🪑 Dine-In Table';

    return (
`🍲 *HAANDI BY YUMTO* 🍲
_Authentic Desi Fine Dining & Handi Delights_
📍 Civic Center, Gulberg Greens, Islamabad

Assalam-o-Alaikum *${order.userName || 'Valued Customer'}*! ✨
Thank you for ordering with Haandi by Yumto. Your order has been placed successfully!

━━━━━━━━━━━━━━━━━━━━━
📋 *ORDER RECEIPT*
━━━━━━━━━━━━━━━━━━━━━
🆔 *Order #:* \`${order.id}\`
🍽️ *Type:* ${typeLabel}
${order.deliveryAddress ? `📍 *Address:* ${order.deliveryAddress}\n` : ''}
📦 *Items Ordered:*
${itemsText || '  • Standard Menu Selection'}

${order.discountAmount ? `🏷️ *Discount:* -Rs. ${order.discountAmount.toLocaleString()}\n` : ''}💰 *Total Amount:* *Rs. ${(order.total || 0).toLocaleString()}* (Cash / POS)
━━━━━━━━━━━━━━━━━━━━━

🛵 *LIVE ORDER & RIDER TRACKING:*
Click the link below to track food preparation and live rider GPS:
👉 ${trackLink}

📞 *Helpline & Support:*
0300-YUMTO-01 / (051) 844-9988

_We are preparing your feast with traditional slow-cooked handi perfection!_ 🌿🍲`
    );
  },

  /**
   * Generates a direct wa.me link that opens WhatsApp directly on mobile/web
   */
  getDirectWhatsAppUrl(phone: string, messageText: string): string {
    const cleanPhone = this.cleanPhoneNumber(phone);
    const encodedText = encodeURIComponent(messageText);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  },

  /**
   * Sends automated WhatsApp message through the local/cloud microservice
   * If service is offline, returns fallback URL seamlessly
   */
  /**
   * Sends automated WhatsApp message through the local/cloud microservice
   * If service is offline, returns fallback URL seamlessly
   */
  async sendOrderWhatsAppNotification(
    order: Order,
    trackingUrl?: string
  ): Promise<{ success: boolean; messageId?: string; fallbackUrl: string; error?: string }> {
    const messageText = this.formatOrderWhatsAppMessage(order, trackingUrl);
    const fallbackUrl = this.getDirectWhatsAppUrl(order.userPhone, messageText);
    const trackLink = trackingUrl || `${window.location.origin}/#/track/${order.id || 'NEW'}`;
    const apiBase = getWhatsAppApiBase();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(`${apiBase}/api/whatsapp/send-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.userName,
          customerPhone: order.userPhone,
          items: order.items,
          total: order.total,
          orderType: order.orderType,
          deliveryAddress: order.deliveryAddress,
          trackingUrl: trackLink,
          discountAmount: order.discountAmount
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.warn('[NotificationService] WhatsApp service responded with error:', errData);
        return {
          success: false,
          fallbackUrl,
          error: errData.error || 'WhatsApp service unavailable'
        };
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
        fallbackUrl
      };
    } catch (err: any) {
      console.info('[NotificationService] WhatsApp bot service is not running locally. Direct fallback available.');
      return {
        success: false,
        fallbackUrl,
        error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Service offline')
      };
    }
  },

  /**
   * Checks current connection status and retrieves QR code if waiting for link
   */
  async getWhatsAppBotStatus(): Promise<WhatsAppStatusResponse> {
    const apiBase = getWhatsAppApiBase();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${apiBase}/api/whatsapp/status`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Bot API error');
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        status: 'disconnected',
        isReady: false,
        error: 'WhatsApp Bot Service is offline. Run `npm run whatsapp:bot` to start locally, or use direct WhatsApp dispatch.'
      };
    }
  },

  /**
   * Sends custom text message via WhatsApp Bot
   */
  async sendCustomWhatsAppMessage(phone: string, message: string): Promise<{ success: boolean; fallbackUrl?: string; error?: string }> {
    const apiBase = getWhatsAppApiBase();
    const fallbackUrl = this.getDirectWhatsAppUrl(phone, message);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${apiBase}/api/whatsapp/send-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      return { ...data, fallbackUrl };
    } catch (err: any) {
      return { success: false, fallbackUrl, error: err.name === 'AbortError' ? 'Connection timed out' : (err.message || 'Service offline') };
    }
  },

  /**
   * Logouts and resets WhatsApp session
   */
  async logoutWhatsAppBot(): Promise<{ success: boolean }> {
    const apiBase = getWhatsAppApiBase();
    try {
      const res = await fetch(`${apiBase}/api/whatsapp/logout`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: false };
    }
  }
};

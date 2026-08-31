import { Product, Order, OrderItem } from '../types';

declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

/**
 * Initialize window.dataLayer if not present
 */
export const initDataLayer = (): Record<string, any>[] => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    return window.dataLayer;
  }
  return [];
};

// Initialize immediately on bundle load
if (typeof window !== 'undefined') {
  initDataLayer();
}

/**
 * Helper to safely push events to window.dataLayer with debug logging
 */
export const pushToDataLayer = (data: Record<string, any>): void => {
  try {
    if (typeof window === 'undefined') return;
    const dl = initDataLayer();
    dl.push(data);
    
    // Developer console log for real-time tracking verification
    if (data.event) {
      console.log(`%c[DataLayer] 🚀 Event: ${data.event}`, 'color: #10B981; font-weight: bold;', data);
    }
  } catch (err) {
    console.warn('[DataLayer Warning] Failed to push event:', err);
  }
};

/**
 * Helper to format product into standard GA4 item structure
 */
export const formatGA4Item = (
  product?: Product,
  quantity: number = 1,
  selectedColor?: string,
  index?: number
) => {
  if (!product) {
    return {
      item_id: '',
      item_name: '',
      price: 0,
      quantity: quantity,
    };
  }
  const price = Number(product.discountPrice || product.price || 0);
  return {
    item_id: String(product.id || ''),
    item_name: product.name || '',
    price: price,
    quantity: Number(quantity),
    item_category: product.category || 'গ্যাজেট',
    item_category2: product.subCategory || undefined,
    item_variant: selectedColor || (product.colors && product.colors[0]) || undefined,
    index: typeof index === 'number' ? index : undefined,
  };
};

// Kept empty to avoid breaking any remaining imports that were not cleaned up yet.
export const injectGTM = (gtmId: string): void => {};
export const injectGA4 = (gaMeasurementId: string): void => {};
export const injectMetaPixel = (pixelId: string): void => {};

/**
 * view_item Event (When product details page opens)
 */
export const trackViewItem = (
  product: Product,
  quantity: number = 1,
  selectedColor?: string
): void => {
  try {
    if (!product) return;
    const item = formatGA4Item(product, quantity, selectedColor);
    const value = item.price * quantity;

    pushToDataLayer({ ecommerce: null });
    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: value,
        items: [item],
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackViewItem error:', err);
  }
};

/**
 * add_to_cart Event
 */
export const trackAddToCart = (
  product: Product,
  quantity: number = 1,
  selectedColor?: string
): void => {
  try {
    if (!product) return;
    const item = formatGA4Item(product, quantity, selectedColor);
    const value = item.price * quantity;

    pushToDataLayer({ ecommerce: null });
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value: value,
        items: [item],
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackAddToCart error:', err);
  }
};

/**
 * begin_checkout Event
 */
export const trackBeginCheckout = (
  items: { product: Product; quantity: number; selectedColor?: string }[],
  value: number,
  couponCode?: string
): void => {
  try {
    const formattedItems = (items || []).map((i) =>
      formatGA4Item(i.product, i.quantity, i.selectedColor)
    );

    pushToDataLayer({ ecommerce: null });
    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: Number(value),
        coupon: couponCode || undefined,
        items: formattedItems,
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackBeginCheckout error:', err);
  }
};

/**
 * purchase Event
 * Deduplicated by transaction_id using localStorage to ensure it fires only once per order.
 */
export const trackPurchase = (order: Order): void => {
  try {
    if (!order) return;
    const transactionId = String(order.orderNumber || order.id);
    if (!transactionId) return;

    if (typeof window !== 'undefined') {
      const storedTransactionsStr = localStorage.getItem('tracked_transactions');
      let storedTransactions: string[] = [];
      if (storedTransactionsStr) {
        try {
          storedTransactions = JSON.parse(storedTransactionsStr);
        } catch (e) {}
      }
      
      if (storedTransactions.includes(transactionId)) {
        console.log(`[DataLayer] Purchase event for order ${transactionId} already tracked. Skipping duplicate.`);
        return;
      }
      
      storedTransactions.push(transactionId);
      // Keep only last 100 to prevent localstorage bloat
      if (storedTransactions.length > 100) storedTransactions.shift();
      localStorage.setItem('tracked_transactions', JSON.stringify(storedTransactions));
    }

    const formattedItems = (order.items || []).map((orderItem: OrderItem) =>
      formatGA4Item(
        orderItem.product,
        orderItem.quantity,
        orderItem.selectedColor
      )
    );

    const userData: Record<string, any> = {};
    if (order.customerEmail) userData.email = order.customerEmail;
    if (order.customerPhone) userData.phone = order.customerPhone;
    if (order.customerName || order.customerAddress) {
      userData.address = {};
      if (order.customerName) userData.address.first_name = order.customerName;
      if (order.customerAddress) userData.address.street = order.customerAddress;
    }

    pushToDataLayer({ ecommerce: null });
    
    const payload: Record<string, any> = {
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: Number(order.totalPrice),
        tax: 0,
        shipping: Number(order.deliveryFee || 0),
        currency: 'BDT',
        coupon: order.couponCode || undefined,
        items: formattedItems,
      }
    };
    
    if (Object.keys(userData).length > 0) {
      payload.user_data = userData;
    }

    pushToDataLayer(payload);
  } catch (err) {
    console.warn('[DataLayer Warning] trackPurchase error:', err);
  }
};

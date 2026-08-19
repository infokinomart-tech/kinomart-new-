import { Product, Order, OrderItem } from '../types';

// Ensure dataLayer exists on window
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

/**
 * Helper to safely push events to window.dataLayer
 */
export const pushToDataLayer = (data: Record<string, any>): void => {
  try {
    if (typeof window === 'undefined') return;
    const dl = initDataLayer();
    dl.push(data);
  } catch (err) {
    console.warn('[DataLayer Warning] Failed to push event:', err);
  }
};

/**
 * Clear the ecommerce object before pushing a new ecommerce event
 * Strict GA4 Requirement
 */
export const clearEcommerceObject = (): void => {
  pushToDataLayer({ ecommerce: null });
};

/**
 * Get tracked transactions from localStorage
 */
const getTrackedTransactions = (): Set<string> => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ga4_tracked_transactions');
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    }
  } catch (e) {
    console.warn('Could not read tracked transactions', e);
  }
  return new Set();
};

/**
 * Save tracked transaction to localStorage
 */
const saveTrackedTransaction = (transactionId: string): void => {
  try {
    if (typeof window !== 'undefined') {
      const current = getTrackedTransactions();
      current.add(transactionId);
      localStorage.setItem('ga4_tracked_transactions', JSON.stringify(Array.from(current)));
    }
  } catch (e) {
    console.warn('Could not save tracked transaction', e);
  }
};

/**
 * Helper to format product into standard GA4 item structure
 */
export const formatGA4Item = (
  product?: Product,
  quantity: number = 1,
  selectedColor?: string
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
    item_name: String(product.name || ''),
    price: price,
    quantity: Number(quantity),
    item_category: product.category ? String(product.category) : undefined,
    item_category2: product.subCategory ? String(product.subCategory) : undefined,
    item_variant: selectedColor ? String(selectedColor) : (product.colors && product.colors[0] ? String(product.colors[0]) : undefined),
  };
};

/**
 * 1. page_view Event
 */
export const trackPageView = (
  pageTitle?: string,
  pageLocation?: string,
  pagePath?: string
): void => {
  try {
    pushToDataLayer({
      event: 'page_view',
      page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
      page_location: pageLocation || (typeof window !== 'undefined' ? window.location.href : ''),
      page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackPageView error:', err);
  }
};

/**
 * 2. view_item Event
 */
export const trackViewItem = (
  product: Product,
  quantity: number = 1,
  selectedColor?: string
): void => {
  try {
    if (!product) return;
    const item = formatGA4Item(product, quantity, selectedColor);
    
    clearEcommerceObject();
    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: Number(item.price * quantity),
        items: [item],
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackViewItem error:', err);
  }
};

/**
 * 3. add_to_cart Event
 */
export const trackAddToCart = (
  product: Product,
  quantity: number = 1,
  selectedColor?: string
): void => {
  try {
    if (!product) return;
    const item = formatGA4Item(product, quantity, selectedColor);
    
    clearEcommerceObject();
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value: Number(item.price * quantity),
        items: [item],
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackAddToCart error:', err);
  }
};

/**
 * 4. remove_from_cart Event
 */
export const trackRemoveFromCart = (
  product: Product,
  quantity: number = 1,
  selectedColor?: string
): void => {
  try {
    if (!product) return;
    const item = formatGA4Item(product, quantity, selectedColor);
    
    clearEcommerceObject();
    pushToDataLayer({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'BDT',
        value: Number(item.price * quantity),
        items: [item],
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackRemoveFromCart error:', err);
  }
};

/**
 * 5. begin_checkout Event
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

    clearEcommerceObject();
    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: Number(value),
        coupon: couponCode ? String(couponCode) : undefined,
        items: formattedItems,
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackBeginCheckout error:', err);
  }
};

/**
 * 6. purchase Event
 * Deduplicated by transaction_id to ensure it fires only once per order.
 */
export const trackPurchase = (order: Order): void => {
  try {
    if (!order) return;
    const transactionId = String(order.orderNumber || order.id);

    if (!transactionId) return;

    // Prevent duplicate purchase events via localStorage
    const trackedTransactions = getTrackedTransactions();
    if (trackedTransactions.has(transactionId)) {
      console.log(`[DataLayer] Purchase event for order ${transactionId} already tracked. Skipping duplicate.`);
      return;
    }

    saveTrackedTransaction(transactionId);

    const formattedItems = (order.items || []).map((orderItem: OrderItem) =>
      formatGA4Item(
        orderItem.product,
        orderItem.quantity,
        orderItem.selectedColor
      )
    );

    // Provide user_data at the root level (not inside ecommerce)
    const userData: any = {};
    if (order.customerPhone) {
      userData.phone_number = order.customerPhone; // Can be hashed depending on exact GA4 / Ads configuration
    }
    
    if (order.customerName || order.deliveryArea) {
      userData.address = {};
      
      if (order.customerName) {
        // Only send first_name as requested
        const nameParts = order.customerName.trim().split(' ');
        userData.address.first_name = nameParts[0];
      }

      if (order.deliveryArea) {
        // Derive city from deliveryArea if possible
        if (order.deliveryArea === 'Inside Dhaka') {
          userData.address.city = 'Dhaka';
        }
      }
    }

    clearEcommerceObject();
    
    const purchaseEvent: Record<string, any> = {
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: Number(order.totalPrice),
        tax: 0,
        shipping: Number(order.deliveryFee || 0),
        currency: 'BDT',
        coupon: order.couponCode ? String(order.couponCode) : undefined,
        items: formattedItems,
      },
    };
    
    // Attach user_data if available
    if (Object.keys(userData).length > 0) {
      purchaseEvent.user_data = userData;
    }

    pushToDataLayer(purchaseEvent);
  } catch (err) {
    console.warn('[DataLayer Warning] trackPurchase error:', err);
  }
};


import { Product, Order, OrderItem } from '../types';

// Ensure dataLayer exists on window
declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

/**
 * Deduplication store for purchase transactions to prevent duplicate firing
 */
const trackedTransactions = new Set<string>();

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
  const price = product.discountPrice || product.price || 0;
  return {
    item_id: product.id || '',
    item_name: product.name || '',
    price: price,
    quantity: quantity,
    item_category: product.category || undefined,
    item_category2: product.subCategory || undefined,
    item_variant: selectedColor || (product.colors && product.colors[0]) || undefined,
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
    pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: item.price * quantity,
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
    pushToDataLayer({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value: item.price * quantity,
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
    pushToDataLayer({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'BDT',
        value: item.price * quantity,
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

    pushToDataLayer({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: value,
        coupon: couponCode || undefined,
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
    const transactionId = order.orderNumber || order.id;

    if (!transactionId) return;

    // Prevent duplicate purchase events
    if (trackedTransactions.has(transactionId)) {
      console.log(`[DataLayer] Purchase event for order ${transactionId} already tracked. Skipping duplicate.`);
      return;
    }

    trackedTransactions.add(transactionId);

    const formattedItems = (order.items || []).map((orderItem: OrderItem) =>
      formatGA4Item(
        orderItem.product,
        orderItem.quantity,
        orderItem.selectedColor
      )
    );

    pushToDataLayer({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: order.totalPrice,
        tax: 0,
        shipping: order.deliveryFee || 0,
        currency: 'BDT',
        coupon: order.couponCode || undefined,
        items: formattedItems,
      },
    });
  } catch (err) {
    console.warn('[DataLayer Warning] trackPurchase error:', err);
  }
};

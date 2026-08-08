import { Product, ProductBundle } from '../types';

export function getDefaultBundles(price: number): ProductBundle[] {
  const basePrice = Math.round(price);
  const orig1 = Math.round(basePrice * 1.31);
  
  const price2 = Math.round(basePrice * 1.82);
  const orig2 = Math.round(basePrice * 2.63);
  const save2 = Math.max(0, basePrice * 2 - price2);

  const price4 = Math.round(basePrice * 3.53);
  const orig4 = Math.round(basePrice * 5.25);
  const save4 = Math.max(0, basePrice * 4 - price4);

  return [
    {
      id: 'b-1',
      title: '1 Pc',
      quantity: 1,
      price: basePrice,
      originalPrice: orig1,
      tagText: 'ক্যাশ অন ডেলিভারী',
      isPopular: false
    },
    {
      id: 'b-2',
      title: '2 Pc',
      quantity: 2,
      price: price2,
      originalPrice: orig2,
      badgeText: `🔥 SAVE ${save2.toLocaleString('en-US')} TK`,
      tagText: 'ক্যাশ অন ডেলিভারী',
      isPopular: true
    },
    {
      id: 'b-3',
      title: '4 Pc',
      quantity: 4,
      price: price4,
      originalPrice: orig4,
      badgeText: `🔥 SAVE ${save4.toLocaleString('en-US')} TK`,
      tagText: 'ক্যাশ অন ডেলিভারী',
      isPopular: false
    }
  ];
}

export function getEffectiveBundles(product: Product): ProductBundle[] {
  if (product.bundles && product.bundles.length > 0) {
    return product.bundles;
  }
  return [];
}

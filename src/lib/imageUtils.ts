/**
 * Image Optimization Utilities for Supabase Storage, CDN, and Unsplash images
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'origin' | 'avif' | 'jpeg';
  resize?: 'cover' | 'contain' | 'fill';
}

/**
 * Transforms an image URL to a fast, compressed, responsive web-optimized version.
 * Supports Supabase Storage, Unsplash CDN, and generic image URLs.
 */
export const getOptimizedImageUrl = (
  url: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string => {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
  }

  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';
  }

  const {
    width = 480,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options;

  // 1. Supabase Storage Image Optimization
  if (cleanUrl.includes('/storage/v1/object/public/')) {
    // Check if we can use Supabase Image Transformation endpoint
    // Standard public URL: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    // Render transformation URL: https://[project].supabase.co/storage/v1/render/image/public/[bucket]/[path]?width=...
    try {
      const parsedUrl = new URL(cleanUrl);
      // If the domain is a Supabase project domain
      if (parsedUrl.pathname.includes('/storage/v1/object/public/')) {
        // Attempt using Supabase Storage transformation query params or render endpoint
        // Many Supabase setups support direct transformation via /render/image/public/
        const renderPath = parsedUrl.pathname.replace(
          '/storage/v1/object/public/',
          '/storage/v1/render/image/public/'
        );
        const transformedUrl = new URL(parsedUrl.origin + renderPath);
        transformedUrl.searchParams.set('width', String(width));
        if (height) transformedUrl.searchParams.set('height', String(height));
        transformedUrl.searchParams.set('quality', String(quality));
        transformedUrl.searchParams.set('resize', resize);

        // Fallback also supports query parameters on direct object path if custom proxy is used
        return transformedUrl.toString();
      }
    } catch {
      // If URL parsing fails, return cleanUrl
      return cleanUrl;
    }
  }

  // 2. Unsplash Image Optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const parsedUrl = new URL(cleanUrl);
      parsedUrl.searchParams.set('w', String(width));
      if (height) parsedUrl.searchParams.set('h', String(height));
      parsedUrl.searchParams.set('auto', 'format');
      parsedUrl.searchParams.set('fit', 'crop');
      parsedUrl.searchParams.set('q', String(quality));
      return parsedUrl.toString();
    } catch {
      return cleanUrl;
    }
  }

  // 3. Return cleanUrl for data URLs, SVGs, or external CDNs
  return cleanUrl;
};

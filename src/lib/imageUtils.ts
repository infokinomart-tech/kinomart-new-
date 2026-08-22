/**
 * Image processing & compression utilities
 * Compresses images client-side to prevent browser freezing/hanging,
 * prevents localStorage quota overflow, and accelerates loading.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Resizes and compresses an image File using HTML Canvas
 * Typically turns 5MB-20MB smartphone photos into ~80KB-180KB crisp images
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1080,
    maxHeight = 1080,
    quality = 0.82,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // If SVG or gif (animations), do not canvas-compress, read as DataURL directly if small
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate aspect ratio fit within maxWidth x maxHeight
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed data URL
          const compressedDataUrl = canvas.toDataURL(format, quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // Fallback to original data URL if canvas fails
          resolve(e.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Checks if a string is a base64 data URL
 */
export function isDataUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('data:image/');
}

/**
 * Checks if a string is a standard http/https web URL
 */
export function isHttpUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Optimizes an image URL for display (supports Unsplash sizing parameters and Data URLs)
 */
export function getOptimizedImageUrl(
  url?: string,
  options: { width?: number; quality?: number } = {}
): string {
  if (!url) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  
  // If data URL, return as is
  if (url.startsWith('data:')) {
    return url;
  }

  // If Unsplash URL, append or replace width & quality parameters
  if (url.includes('images.unsplash.com')) {
    const width = options.width || 600;
    const quality = options.quality || 80;
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?w=${width}&auto=format&fit=crop&q=${quality}`;
  }

  return url;
}


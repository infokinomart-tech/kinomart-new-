/**
 * High-Fidelity Image Processing & Resizing Utilities
 * Intelligently resizes and optimizes images for various placeholders
 * without resolution degradation or visual quality loss.
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png' | 'auto';
  fit?: 'contain' | 'cover' | 'inside';
  aspectRatio?: number; // e.g. 1 for square 1:1, 16/9 for banners
}

export type PlaceholderType =
  | 'product_cover'       // 1200x1200 max, square or native ratio, high sharpness
  | 'product_gallery'     // 1600x1600 max, full natural aspect ratio preserved
  | 'review_screenshot'   // 1200x1200 max, natural chat screenshot ratio
  | 'review_avatar'       // 400x400 max, square 1:1 portrait
  | 'logo'                // 800x300 max, PNG transparency preserved
  | 'favicon'             // 256x256 max, PNG transparency preserved
  | 'category_icon'       // 500x500 max, square/transparent preserved
  | 'banner';             // 1920x1080 max, high-res hero landscape

/**
 * Get preset configurations for different placeholder types
 */
export function getPlaceholderConfig(type: PlaceholderType): CompressImageOptions {
  switch (type) {
    case 'product_cover':
      return {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.90,
        fit: 'inside',
        format: 'auto'
      };
    case 'product_gallery':
      return {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.90,
        fit: 'inside',
        format: 'auto'
      };
    case 'review_screenshot':
      return {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.88,
        fit: 'inside',
        format: 'auto'
      };
    case 'review_avatar':
      return {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.90,
        fit: 'cover',
        aspectRatio: 1,
        format: 'auto'
      };
    case 'logo':
      return {
        maxWidth: 800,
        maxHeight: 300,
        quality: 0.95,
        fit: 'inside',
        format: 'image/png'
      };
    case 'favicon':
      return {
        maxWidth: 256,
        maxHeight: 256,
        quality: 0.95,
        fit: 'inside',
        format: 'image/png'
      };
    case 'category_icon':
      return {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.90,
        fit: 'inside',
        format: 'auto'
      };
    case 'banner':
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.90,
        fit: 'inside',
        format: 'auto'
      };
    default:
      return {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.88,
        fit: 'inside',
        format: 'auto'
      };
  }
}

/**
 * Resizes and optimizes an image File using HTML Canvas with high-resolution bicubic scaling.
 * Preserves sharp text, vibrant colors, and aspect ratios without blurriness.
 */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.90,
    format = 'auto',
    fit = 'inside',
    aspectRatio
  } = options;

  return new Promise((resolve, reject) => {
    // If SVG or animated GIF, read as DataURL directly to preserve vector/animation data
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    // Determine target format (retain PNG for transparency if file is PNG)
    let outputFormat: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg';
    if (format === 'auto') {
      outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    } else {
      outputFormat = format;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;

          let targetW = origW;
          let targetH = origH;

          if (fit === 'cover' && aspectRatio) {
            // Force specific aspect ratio with smart crop
            if (origW / origH > aspectRatio) {
              // Image is wider than target aspect ratio
              const cropW = origH * aspectRatio;
              targetW = Math.min(cropW, maxWidth);
              targetH = targetW / aspectRatio;
            } else {
              // Image is taller than target aspect ratio
              const cropH = origW / aspectRatio;
              targetH = Math.min(cropH, maxHeight);
              targetW = targetH * aspectRatio;
            }
          } else {
            // Inside fit (preserve original aspect ratio completely)
            if (targetW > maxWidth || targetH > maxHeight) {
              const ratio = Math.min(maxWidth / targetW, maxHeight / targetH);
              targetW = Math.round(targetW * ratio);
              targetH = Math.round(targetH * ratio);
            }
          }

          // Ensure minimum valid dimensions
          targetW = Math.max(1, Math.round(targetW));
          targetH = Math.max(1, Math.round(targetH));

          // Multi-step high quality downscaling for ultra-crisp results
          let curCanvas = document.createElement('canvas');
          curCanvas.width = origW;
          curCanvas.height = origH;
          let curCtx = curCanvas.getContext('2d');

          if (!curCtx) {
            resolve(e.target?.result as string);
            return;
          }

          curCtx.imageSmoothingEnabled = true;
          curCtx.imageSmoothingQuality = 'high';
          curCtx.drawImage(img, 0, 0, origW, origH);

          // Step down in halves if shrinking by more than 2x to avoid aliasing artifacts
          let stepW = origW;
          let stepH = origH;

          while (stepW * 0.5 > targetW && stepH * 0.5 > targetH) {
            stepW = Math.round(stepW * 0.5);
            stepH = Math.round(stepH * 0.5);

            const nextCanvas = document.createElement('canvas');
            nextCanvas.width = stepW;
            nextCanvas.height = stepH;
            const nextCtx = nextCanvas.getContext('2d');
            if (nextCtx) {
              nextCtx.imageSmoothingEnabled = true;
              nextCtx.imageSmoothingQuality = 'high';
              nextCtx.drawImage(curCanvas, 0, 0, stepW, stepH);
              curCanvas = nextCanvas;
              curCtx = nextCtx;
            }
          }

          // Final draw to exact target dimensions
          const finalCanvas = document.createElement('canvas');
          finalCanvas.width = targetW;
          finalCanvas.height = targetH;
          const finalCtx = finalCanvas.getContext('2d');

          if (!finalCtx) {
            resolve(e.target?.result as string);
            return;
          }

          finalCtx.imageSmoothingEnabled = true;
          finalCtx.imageSmoothingQuality = 'high';

          if (fit === 'cover' && aspectRatio) {
            // Draw centered crop from current canvas
            const curRatio = curCanvas.width / curCanvas.height;
            let srcX = 0;
            let srcY = 0;
            let srcW = curCanvas.width;
            let srcH = curCanvas.height;

            if (curRatio > aspectRatio) {
              srcW = curCanvas.height * aspectRatio;
              srcX = (curCanvas.width - srcW) / 2;
            } else {
              srcH = curCanvas.width / aspectRatio;
              srcY = (curCanvas.height - srcH) / 2;
            }

            finalCtx.drawImage(curCanvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
          } else {
            finalCtx.drawImage(curCanvas, 0, 0, targetW, targetH);
          }

          // Export as compressed high quality data URL
          const resultDataUrl = finalCanvas.toDataURL(
            outputFormat,
            outputFormat === 'image/png' ? undefined : quality
          );

          resolve(resultDataUrl);
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
 * Convenient helper to process an image specifically for any placeholder type in the app
 */
export async function processImageForPlaceholder(
  file: File,
  placeholderType: PlaceholderType,
  overrides: CompressImageOptions = {}
): Promise<string> {
  const preset = getPlaceholderConfig(placeholderType);
  return compressImageFile(file, { ...preset, ...overrides });
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
    const width = options.width || 800;
    const quality = options.quality || 85;
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?w=${width}&auto=format&fit=crop&q=${quality}`;
  }

  return url;
}



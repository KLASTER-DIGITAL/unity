/**
 * Generate blur placeholder for images
 *
 * Creates a tiny base64-encoded version of an image for blur-up effect.
 * This improves perceived performance by showing a blurred preview while
 * the full image loads.
 *
 * @example
 * const blurDataURL = generateBlurPlaceholder('/assets/hero.jpg');
 * <OptimizedImage src="/assets/hero.jpg" blurDataURL={blurDataURL} />
 */

/**
 * Generate a simple blur placeholder from image dimensions
 * Creates a 1x1 pixel SVG with the average color
 */
export function generateSimpleBlurPlaceholder(
	width = 1,
	height = 1,
	color = "#f0f0f0",
): string {
	const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>
  `;

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate a gradient blur placeholder
 * Creates a smooth gradient for better visual effect
 */
export function generateGradientBlurPlaceholder(
	width = 1,
	height = 1,
	colorStart = "#f0f0f0",
	colorEnd = "#e0e0e0",
): string {
	const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colorEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
    </svg>
  `;

	return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Common blur placeholders for different image types
 */
export const BLUR_PLACEHOLDERS = {
	// Avatar placeholder (neutral gray)
	avatar: generateSimpleBlurPlaceholder(1, 1, "#e5e7eb"),

	// Hero image placeholder (light gradient)
	hero: generateGradientBlurPlaceholder(1, 1, "#f3f4f6", "#e5e7eb"),

	// Card image placeholder (soft purple gradient)
	card: generateGradientBlurPlaceholder(1, 1, "#f8f6ff", "#ede9fe"),

	// Icon placeholder (very light)
	icon: generateSimpleBlurPlaceholder(1, 1, "#f9fafb"),

	// Dark mode placeholder
	dark: generateSimpleBlurPlaceholder(1, 1, "#1f2937"),
} as const;

/**
 * Get blur placeholder by image type
 */
export function getBlurPlaceholder(
	type: keyof typeof BLUR_PLACEHOLDERS = "hero",
): string {
	return BLUR_PLACEHOLDERS[type];
}

/**
 * RTL (Right-to-Left) detection and utilities
 * 
 * Provides utilities for detecting and handling RTL languages
 * like Arabic, Hebrew, Persian, Urdu, etc.
 */

export type TextDirection = 'ltr' | 'rtl';

/**
 * List of RTL language codes
 */
const RTL_LANGUAGES = [
  'ar',  // Arabic
  'he',  // Hebrew
  'fa',  // Persian (Farsi)
  'ur',  // Urdu
  'yi',  // Yiddish
  'ji',  // Yiddish (alternative code)
  'iw',  // Hebrew (alternative code)
  'ps',  // Pashto
  'sd',  // Sindhi
  'ug',  // Uyghur
  'ku',  // Kurdish (Sorani)
  'arc', // Aramaic
  'bcc', // Balochi
  'bqi', // Bakhtiari
  'ckb', // Central Kurdish
  'dv',  // Dhivehi
  'glk', // Gilaki
  'lrc', // Northern Luri
  'mzn', // Mazanderani
  'pnb', // Western Punjabi
  'ydd'  // Eastern Yiddish
];

/**
 * Check if a language code is RTL
 */
export function isRTL(languageCode: string): boolean {
  if (!languageCode) return false;
  
  // Extract base language code (e.g., 'ar' from 'ar-SA')
  const baseCode = languageCode.toLowerCase().split('-')[0];
  
  return RTL_LANGUAGES.includes(baseCode);
}

/**
 * Get text direction for a language
 */
export function getTextDirection(languageCode: string): TextDirection {
  return isRTL(languageCode) ? 'rtl' : 'ltr';
}

/**
 * Check if a string contains RTL characters
 */
export function containsRTLCharacters(text: string): boolean {
  if (!text) return false;
  
  // RTL Unicode ranges
  const rtlRanges = [
    /[\u0591-\u07FF]/,  // Hebrew, Arabic
    /[\uFB1D-\uFDFD]/,  // Hebrew and Arabic presentation forms
    /[\uFE70-\uFEFC]/   // Arabic presentation forms
  ];
  
  return rtlRanges.some(range => range.test(text));
}

/**
 * Get the dominant text direction of a string
 */
export function detectTextDirection(text: string): TextDirection {
  if (!text) return 'ltr';
  
  let rtlCount = 0;
  let ltrCount = 0;
  
  for (const char of text) {
    if (containsRTLCharacters(char)) {
      rtlCount++;
    } else if (/[a-zA-Z]/.test(char)) {
      ltrCount++;
    }
  }
  
  return rtlCount > ltrCount ? 'rtl' : 'ltr';
}

/**
 * Apply text direction to HTML element
 */
export function applyTextDirection(
  element: HTMLElement,
  direction: TextDirection
): void {
  element.dir = direction;
  element.style.direction = direction;
}

/**
 * Apply text direction to document
 */
export function applyDocumentDirection(direction: TextDirection): void {
  document.documentElement.dir = direction;
  document.documentElement.style.direction = direction;
  
  // Update body as well for better compatibility
  document.body.dir = direction;
  document.body.style.direction = direction;
}

/**
 * Get CSS class for text direction
 */
export function getDirectionClass(direction: TextDirection): string {
  return direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * Mirror a value for RTL (useful for margins, paddings, etc.)
 * 
 * @example
 * mirrorValue('left', 'rtl') // → 'right'
 * mirrorValue('right', 'rtl') // → 'left'
 * mirrorValue('left', 'ltr') // → 'left'
 */
export function mirrorValue(
  value: string,
  direction: TextDirection
): string {
  if (direction === 'ltr') return value;
  
  const mirrorMap: Record<string, string> = {
    'left': 'right',
    'right': 'left',
    'start': 'end',
    'end': 'start',
    'flex-start': 'flex-end',
    'flex-end': 'flex-start'
  };
  
  return mirrorMap[value] || value;
}

/**
 * Get logical property name for RTL support
 * 
 * @example
 * getLogicalProperty('margin-left') // → 'margin-inline-start'
 * getLogicalProperty('padding-right') // → 'padding-inline-end'
 */
export function getLogicalProperty(property: string): string {
  const logicalMap: Record<string, string> = {
    'margin-left': 'margin-inline-start',
    'margin-right': 'margin-inline-end',
    'padding-left': 'padding-inline-start',
    'padding-right': 'padding-inline-end',
    'border-left': 'border-inline-start',
    'border-right': 'border-inline-end',
    'left': 'inset-inline-start',
    'right': 'inset-inline-end',
    'text-align-left': 'text-align-start',
    'text-align-right': 'text-align-end'
  };
  
  return logicalMap[property] || property;
}

/**
 * RTL-aware class names helper
 */
export function rtlClass(
  ltrClass: string,
  rtlClass: string,
  direction: TextDirection
): string {
  return direction === 'rtl' ? rtlClass : ltrClass;
}

/**
 * Create RTL-aware style object
 */
export function rtlStyle(
  ltrStyle: React.CSSProperties,
  rtlStyle: React.CSSProperties,
  direction: TextDirection
): React.CSSProperties {
  return direction === 'rtl' ? rtlStyle : ltrStyle;
}

/**
 * Flip horizontal value for RTL
 * 
 * @example
 * flipHorizontal(10, 'rtl') // → -10
 * flipHorizontal(10, 'ltr') // → 10
 */
export function flipHorizontal(
  value: number,
  direction: TextDirection
): number {
  return direction === 'rtl' ? -value : value;
}

/**
 * Get transform for RTL (useful for animations)
 * 
 * @example
 * getTransform('translateX(100px)', 'rtl') // → 'translateX(-100px)'
 */
export function getTransform(
  transform: string,
  direction: TextDirection
): string {
  if (direction === 'ltr') return transform;
  
  // Flip translateX values
  return transform.replace(
    /translateX\((-?\d+(?:\.\d+)?)(px|%|em|rem)\)/g,
    (match, value, unit) => {
      const flipped = -parseFloat(value);
      return `translateX(${flipped}${unit})`;
    }
  );
}

/**
 * RTL configuration for a language
 */
export interface RTLConfig {
  isRTL: boolean;
  direction: TextDirection;
  languageCode: string;
  directionClass: string;
}

/**
 * Get RTL configuration for a language
 */
export function getRTLConfig(languageCode: string): RTLConfig {
  const direction = getTextDirection(languageCode);
  
  return {
    isRTL: direction === 'rtl',
    direction,
    languageCode,
    directionClass: getDirectionClass(direction)
  };
}

/**
 * Common RTL utilities
 */
export const RTL = {
  isRTL,
  getTextDirection,
  containsRTLCharacters,
  detectTextDirection,
  applyTextDirection,
  applyDocumentDirection,
  getDirectionClass,
  mirrorValue,
  getLogicalProperty,
  rtlClass,
  rtlStyle,
  flipHorizontal,
  getTransform,
  getRTLConfig
};


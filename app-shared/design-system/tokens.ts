/**
 * Design System Tokens - UNITY-v2 React Native
 *
 * Централизованные design tokens для консистентного дизайна
 * Следует iOS Human Interface Guidelines и PWA дизайну
 */

// ============================================================================
// COLORS - LIGHT THEME
// ============================================================================

export const ColorsLight = {
  // Primary
  primary: '#3B82F6', // Blue 500
  primaryDark: '#2563EB', // Blue 600
  primaryLight: '#60A5FA', // Blue 400

  // Success
  success: '#10B981', // Green 500
  successDark: '#059669', // Green 600
  successLight: '#34D399', // Green 400

  // Warning
  warning: '#F59E0B', // Amber 500
  warningDark: '#D97706', // Amber 600
  warningLight: '#FBBF24', // Amber 400

  // Error
  error: '#EF4444', // Red 500
  errorDark: '#DC2626', // Red 600
  errorLight: '#F87171', // Red 400

  // Neutral
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  card: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // iOS System Colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  systemTeal: '#5AC8FA',
};

// ============================================================================
// COLORS - DARK THEME
// ============================================================================

export const ColorsDark = {
  // Primary
  primary: '#60A5FA', // Blue 400 (lighter for dark bg)
  primaryDark: '#3B82F6', // Blue 500
  primaryLight: '#93C5FD', // Blue 300

  // Success
  success: '#34D399', // Green 400
  successDark: '#10B981', // Green 500
  successLight: '#6EE7B7', // Green 300

  // Warning
  warning: '#FBBF24', // Amber 400
  warningDark: '#F59E0B', // Amber 500
  warningLight: '#FCD34D', // Amber 300

  // Error
  error: '#F87171', // Red 400
  errorDark: '#EF4444', // Red 500
  errorLight: '#FCA5A5', // Red 300

  // Neutral
  gray50: '#1F2937', // Inverted
  gray100: '#374151',
  gray200: '#4B5563',
  gray300: '#6B7280',
  gray400: '#9CA3AF',
  gray500: '#D1D5DB',
  gray600: '#E5E7EB',
  gray700: '#F3F4F6',
  gray800: '#F9FAFB',
  gray900: '#FFFFFF',

  // Semantic
  background: '#111827', // Dark background
  backgroundSecondary: '#1F2937',
  card: '#1F2937',
  border: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',

  // iOS System Colors (adjusted for dark mode)
  systemBlue: '#0A84FF',
  systemGreen: '#30D158',
  systemRed: '#FF453A',
  systemOrange: '#FF9F0A',
  systemYellow: '#FFD60A',
  systemPurple: '#BF5AF2',
  systemPink: '#FF375F',
  systemTeal: '#64D2FF',
};

// Default to light theme (will be overridden by useTheme hook)
export const Colors = ColorsLight;

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const ResponsiveSpacing = {
  sectionPaddingX: 24,
  sectionPaddingY: 16,
  cardPadding: 16,
  cardGap: 12,
  headerPaddingTop: 60,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const FontSizes = {
  // Headings
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,

  // Body
  body: 16,
  bodyLarge: 17,
  bodySmall: 15,

  // Caption
  caption: 12,
  caption2: 11,

  // Footnote
  footnote: 13,
};

export const LineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
};

// ============================================================================
// SHADOWS (iOS-style)
// ============================================================================

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const iOSRadius = {
  button: 10,
  card: 16,
  modal: 20,
  sheet: 24,
};

// ============================================================================
// TOUCH TARGETS
// ============================================================================

export const TouchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

// ============================================================================
// ANIMATIONS
// ============================================================================

export const AnimationDuration = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
};

export const AnimationEasing = {
  default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  bounce: {
    damping: 10,
    stiffness: 100,
  },
};

// ============================================================================
// GRADIENTS
// ============================================================================

export const Gradients = {
  primary: [Colors.primary, Colors.primaryDark],
  success: [Colors.success, Colors.successDark],
  warning: [Colors.warning, Colors.warningDark],
  error: [Colors.error, Colors.errorDark],
};

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export const DesignTokens = {
  colors: Colors,
  spacing: Spacing,
  responsiveSpacing: ResponsiveSpacing,
  fontFamily: FontFamily,
  fontWeights: FontWeights,
  fontSizes: FontSizes,
  lineHeights: LineHeights,
  letterSpacing: LetterSpacing,
  shadows: Shadows,
  borderRadius: BorderRadius,
  iOSRadius,
  touchTargets: TouchTargets,
  animationDuration: AnimationDuration,
  animationEasing: AnimationEasing,
  gradients: Gradients,
};

export default DesignTokens;

// constants/theme.ts
export const colors = {
  // Primary Colors
  primary: '#0F6EC0',
  primaryLight: 'rgba(15, 114, 199, 0.08)',
  primaryMedium: 'rgba(15, 114, 199, 0.15)',
  primaryDisabled: 'rgba(15, 114, 199, 0.4)',

  // Background Colors
  background: '#F7F8FA',
  backgroundCard: '#FFFFFF',
  backgroundInput: '#F2F4F7',
  backgroundElevated: '#FFFFFF',

  // Text Colors
  textPrimary: '#0D0F11',
  textSecondary: '#3D4654',
  textTertiary: '#657084',
  textPlaceholder: '#9BA3B2',
  textLight: '#F7F8FA',
  textWhite: '#FFFFFF',
  textMuted: '#8E95A2',

  // Border Colors
  border: '#D2D6E1',
  borderLight: '#E8ECF1',
  borderActive: '#0F6EC0',
  borderFocus: 'rgba(15, 110, 192, 0.3)',

  // Status Colors
  success: '#0D9F4F',
  successLight: 'rgba(13, 159, 79, 0.1)',
  error: '#D92D20',
  errorLight: 'rgba(217, 45, 32, 0.1)',
  warning: '#F79009',
  warningLight: 'rgba(247, 144, 9, 0.1)',
  info: '#0F6EC0',
  infoLight: 'rgba(15, 110, 192, 0.1)',

  // Functional Colors
  overlay: 'rgba(13, 15, 17, 0.6)',
  shadow: 'rgba(13, 15, 17, 0.08)',
  shadowDark: 'rgba(13, 15, 17, 0.16)',
  divider: '#E8ECF1',
  skeleton: '#E8ECF1',

  // Gradient Colors
  gradientStart: '#0F6EC0',
  gradientMiddle: '#1A7DD4',
  gradientEnd: '#2589E0',
} as const;

export const typography = {
  // Font Families
  fontFamily: 'System',
  fontFamilyMono: 'Courier',

  // Font Sizes
  fontSize: {
    '2xs': 10,
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
    '7xl': 48,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
  },
} as const;

export const spacing = {
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 56,
  '6xl': 64,
  '7xl': 80,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

export const shadows = {
  xs: {
    shadowColor: '#0D0F11',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0D0F11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#0D0F11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0D0F11',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: '#0F6EC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

export const layout = {
  // Screen Padding
  screenPaddingHorizontal: 24,
  screenPaddingVertical: 16,

  // Input Heights
  inputHeight: 56,
  inputHeightSmall: 44,
  inputHeightLarge: 64,

  // Button Heights
  buttonHeight: 56,
  buttonHeightSmall: 44,
  buttonHeightLarge: 64,

  // Header Height
  headerHeight: 56,

  // Icon Sizes
  iconSize: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
    '2xl': 40,
  },

  // Avatar Sizes
  avatarSize: {
    sm: 36,
    md: 44,
    lg: 56,
    xl: 72,
  },

  // Touch Target
  minTouchTarget: 44,
} as const;

// Animation presets for consistent motion
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
} as const;

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  animation,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
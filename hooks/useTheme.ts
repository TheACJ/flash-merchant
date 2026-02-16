import { theme } from '@/constants/theme';

export const useTheme = () => {
  return theme;
};

// Helper functions for common theme operations
export const useColors = () => theme.colors;
export const useTypography = () => theme.typography;
export const useSpacing = () => theme.spacing;
export const useBorderRadius = () => theme.borderRadius;
export const useShadows = () => theme.shadows;
export const useLayout = () => theme.layout;

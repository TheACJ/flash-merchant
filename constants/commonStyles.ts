import { theme } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: theme.layout.screenPaddingHorizontal,
    paddingBottom: 40,
  },

  // Headers
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },

  title: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.semibold,
    fontSize: theme.typography.fontSize['4xl'],
    lineHeight: theme.typography.fontSize['4xl'],
    textAlign: 'center',
    color: theme.colors.textPrimary,
    marginBottom: 15,
  },

  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xl,
    lineHeight: theme.typography.lineHeight.relaxed,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },

  // Inputs
  inputGroup: {
    gap: 15,
  },

  inputLabel: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.normal,
    color: theme.colors.textPrimary,
  },

  input: {
    height: theme.layout.inputHeight,
    backgroundColor: theme.colors.backgroundCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 20,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },

  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },

  // Buttons
  button: {
    height: theme.layout.buttonHeight,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.regular,
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.fontSize.md,
    textAlign: 'center',
    color: theme.colors.textLight,
  },

  buttonSecondary: {
    backgroundColor: theme.colors.primaryLight,
  },

  buttonSecondaryText: {
    color: theme.colors.primary,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },

  // Text
  textPrimary: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.regular,
  },

  textSecondary: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.regular,
  },

  textLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },

  // Spacing
  mt1: { marginTop: theme.spacing.sm },
  mt2: { marginTop: theme.spacing.md },
  mt3: { marginTop: theme.spacing.base },
  mt4: { marginTop: theme.spacing.lg },

  mb1: { marginBottom: theme.spacing.sm },
  mb2: { marginBottom: theme.spacing.md },
  mb3: { marginBottom: theme.spacing.base },
  mb4: { marginBottom: theme.spacing.lg },

  px1: { paddingHorizontal: theme.spacing.sm },
  px2: { paddingHorizontal: theme.spacing.md },
  px3: { paddingHorizontal: theme.spacing.base },
  px4: { paddingHorizontal: theme.spacing.lg },

  py1: { paddingVertical: theme.spacing.sm },
  py2: { paddingVertical: theme.spacing.md },
  py3: { paddingVertical: theme.spacing.base },
  py4: { paddingVertical: theme.spacing.lg },
});

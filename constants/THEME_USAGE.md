# Theme System Usage Guide

## Overview

The Flash Merchant app now has a unified theme system that ensures consistency across all screens.

## Files

- `constants/theme.ts` - Theme configuration (colors, typography, spacing, etc.)
- `hooks/useTheme.ts` - Hook to access theme in components
- `constants/commonStyles.ts` - Reusable common styles

## Usage

### 1. Basic Usage

```typescript
import { useTheme } from '../../hooks/useTheme';
import { StyleSheet } from 'react-native';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
});
```

### 2. Using Individual Hooks

```typescript
import { useColors, useTypography, useSpacing } from '../../hooks/useTheme';

const MyComponent = () => {
  const colors = useColors();
  const typography = useTypography();
  const spacing = useSpacing();
  
  return (
    <View style={{ backgroundColor: colors.background, padding: spacing.xl }}>
      <Text style={{ fontSize: typography.fontSize.lg, color: colors.textPrimary }}>
        Hello
      </Text>
    </View>
  );
};
```

### 3. Using Common Styles

```typescript
import { commonStyles } from '@/constants/commonStyles';

const MyComponent = () => {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        <Text style={commonStyles.title}>My Title</Text>
        <Text style={commonStyles.subtitle}>My Subtitle</Text>
        
        <TextInput style={commonStyles.input} />
        
        <TouchableOpacity style={commonStyles.button}>
          <Text style={commonStyles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
```

### 4. Combining Theme with Custom Styles

```typescript
import { useTheme } from '../../hooks/useTheme';
import { commonStyles } from '@/constants/commonStyles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={[commonStyles.container, styles.customContainer]}>
      <Text style={[commonStyles.title, styles.customTitle]}>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  customContainer: {
    paddingTop: theme.spacing['3xl'],
  },
  customTitle: {
    textTransform: 'uppercase',
  },
});
```

## Theme Structure

### Colors
```typescript
theme.colors.primary           // #0F6EC0
theme.colors.background        // #F5F5F5
theme.colors.textPrimary       // #000000
theme.colors.success           // #128807
theme.colors.error             // #C31D1E
// ... and more
```

### Typography
```typescript
theme.typography.fontSize.xs   // 10
theme.typography.fontSize.md   // 16
theme.typography.fontSize['4xl'] // 25
theme.typography.fontWeight.semibold // '600'
```

### Spacing
```typescript
theme.spacing.xs    // 4
theme.spacing.md    // 12
theme.spacing.xl    // 24
theme.spacing['3xl'] // 40
```

### Border Radius
```typescript
theme.borderRadius.sm   // 8
theme.borderRadius.lg   // 15
theme.borderRadius.full // 9999
```

### Shadows
```typescript
theme.shadows.sm  // Small shadow
theme.shadows.md  // Medium shadow
theme.shadows.lg  // Large shadow with primary color
```

### Layout
```typescript
theme.layout.containerPadding    // 24
theme.layout.inputHeight         // 60
theme.layout.buttonHeight        // 60
theme.layout.iconSize.md         // 24
theme.layout.avatarSize.md       // 50
```

## Common Patterns

### Button Styles
```typescript
// Primary Button
<TouchableOpacity style={commonStyles.button}>
  <Text style={commonStyles.buttonText}>Click Me</Text>
</TouchableOpacity>

// Disabled Button
<TouchableOpacity style={[commonStyles.button, commonStyles.buttonDisabled]}>
  <Text style={commonStyles.buttonText}>Disabled</Text>
</TouchableOpacity>

// Secondary Button
<TouchableOpacity style={[commonStyles.button, commonStyles.buttonSecondary]}>
  <Text style={[commonStyles.buttonText, commonStyles.buttonSecondaryText]}>
    Secondary
  </Text>
</TouchableOpacity>
```

### Input Styles
```typescript
// Normal Input
<TextInput style={commonStyles.input} />

// Error Input
<TextInput style={[commonStyles.input, commonStyles.inputError]} />

// With Label
<View style={commonStyles.inputGroup}>
  <Text style={commonStyles.inputLabel}>Email</Text>
  <TextInput style={commonStyles.input} />
</View>
```

### Card Styles
```typescript
<View style={commonStyles.card}>
  <Text>Card Content</Text>
</View>
```

### Spacing Utilities
```typescript
<View style={[commonStyles.mt4, commonStyles.px3]}>
  {/* Margin top 20, Padding horizontal 16 */}
</View>
```

## Migration Guide

### Before (Hardcoded Values)
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
  },
  button: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
  },
});
```

### After (Using Theme)
```typescript
import { useTheme } from '../../hooks/useTheme';

const MyComponent = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.layout.containerPadding,
    },
    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.textPrimary,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      height: theme.layout.buttonHeight,
    },
  });
  
  return <View style={styles.container}>...</View>;
};
```

## Benefits

✅ **Consistency** - All screens use the same colors, spacing, and typography
✅ **Maintainability** - Change theme in one place, updates everywhere
✅ **Type Safety** - Full TypeScript support with autocomplete
✅ **Reusability** - Common styles reduce code duplication
✅ **Scalability** - Easy to add dark mode or multiple themes later

## Next Steps

1. Import `useTheme` in your component
2. Replace hardcoded values with theme values
3. Use `commonStyles` for standard UI elements
4. Enjoy consistent, maintainable styling! 🎨

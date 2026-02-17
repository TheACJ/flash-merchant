// settings/business-hours.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DaySchedule {
  day: string;
  shortDay: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function BusinessHoursScreen() {
  const router = useRouter();
  const [days, setDays] = useState<DaySchedule[]>([
    { day: 'Monday', shortDay: 'Mon', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Tuesday', shortDay: 'Tue', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Wednesday', shortDay: 'Wed', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Thursday', shortDay: 'Thu', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Friday', shortDay: 'Fri', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Saturday', shortDay: 'Sat', isOpen: false, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Sunday', shortDay: 'Sun', isOpen: false, openTime: '9:00 AM', closeTime: '6:00 PM' },
  ]);

  const toggleDay = (index: number) => {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Hours</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Clock
            size={layout.iconSize.sm}
            color={colors.primary}
            strokeWidth={1.8}
          />
          <Text style={styles.infoText}>
            Set your operating hours so customers know when you're available
          </Text>
        </View>

        {/* Schedule */}
        <View style={styles.scheduleContainer}>
          {days.map((day, index) => (
            <View
              key={day.day}
              style={[
                styles.dayCard,
                !day.isOpen && styles.dayCardClosed,
              ]}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <View
                    style={[
                      styles.dayStatusDot,
                      {
                        backgroundColor: day.isOpen
                          ? colors.success
                          : colors.textMuted,
                      },
                    ]}
                  />
                  <View>
                    <Text style={styles.dayName}>{day.day}</Text>
                    <Text style={styles.dayStatus}>
                      {day.isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={day.isOpen}
                  onValueChange={() => toggleDay(index)}
                  trackColor={{
                    false: colors.borderLight,
                    true: colors.primary,
                  }}
                  thumbColor={colors.backgroundCard}
                />
              </View>

              {day.isOpen && (
                <View style={styles.timeRow}>
                  <TouchableOpacity
                    style={styles.timePill}
                    activeOpacity={0.7}
                  >
                    <Clock
                      size={12}
                      color={colors.primary}
                      strokeWidth={2}
                    />
                    <Text style={styles.timeText}>{day.openTime}</Text>
                  </TouchableOpacity>
                  <Text style={styles.toText}>to</Text>
                  <TouchableOpacity
                    style={styles.timePill}
                    activeOpacity={0.7}
                  >
                    <Clock
                      size={12}
                      color={colors.primary}
                      strokeWidth={2}
                    />
                    <Text style={styles.timeText}>{day.closeTime}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save Schedule</Text>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.base,
    paddingBottom: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  scheduleContainer: {
    gap: spacing.md,
  },
  dayCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  dayCardClosed: {
    opacity: 0.7,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dayStatusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  dayName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  dayStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    marginTop: spacing['2xs'],
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  toText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
  },
  buttonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
  },
  saveButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});
import { borderRadius, colors, layout, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DayItemProps {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DayItem: React.FC<DayItemProps> = ({ day, isOpen, openTime, closeTime }) => (
  <View style={styles.dayItem as ViewStyle}>
    <View style={styles.dayLeft as ViewStyle}>
      <View style={styles.checkCircle as ViewStyle}>
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      </View>
      <Text style={styles.dayName as TextStyle}>{day}</Text>
    </View>
    <View style={styles.dayRight as ViewStyle}>
      <View style={styles.timeContainer as ViewStyle}>
        <Text style={styles.time as TextStyle}>{openTime}</Text>
        <Text style={styles.timeDivider as TextStyle}>to</Text>
        <Text style={styles.time as TextStyle}>{closeTime}</Text>
      </View>
    </View>
  </View>
);

export default function BusinessHoursScreen() {
  const router = useRouter();

  const days = [
    { day: 'Monday', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Tuesday', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Wednesday', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Thursday', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Friday', isOpen: true, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Saturday', isOpen: false, openTime: '9:00 AM', closeTime: '6:00 PM' },
    { day: 'Sunday', isOpen: false, openTime: '9:00 AM', closeTime: '6:00 PM' },
  ];

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity
          style={styles.backButton as ViewStyle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle as TextStyle}>Business hours</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        {days.map((day) => (
          <View key={day.day} style={styles.dayCard as ViewStyle}>
            <View style={styles.dayHeader as ViewStyle}>
              <View style={styles.dayInfo as ViewStyle}>
                <View style={styles.iconContainer as ViewStyle}>
                  <Ionicons name="checkmark-circle" size={24} color={day.isOpen ? colors.primary : colors.textSecondary} />
                </View>
                <Text style={styles.dayName as TextStyle}>{day.day}</Text>
              </View>
              <View style={styles.timeSlotContainer as ViewStyle}>
                <View style={styles.timeInput as ViewStyle}>
                  <Text style={styles.timeInputText as TextStyle}>{day.openTime}</Text>
                </View>
                <Text style={styles.toText as TextStyle}>to</Text>
                <View style={styles.timeInput as ViewStyle}>
                  <Text style={styles.timeInputText as TextStyle}>{day.closeTime}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer as ViewStyle}>
        <TouchableOpacity
          style={styles.nextButton as ViewStyle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText as TextStyle}>Next</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  dayCard: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  dayName: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    marginRight: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 85,
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  time: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.regular,
  },
  toText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  timeDivider: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  nextButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    fontWeight: typography.fontWeight.regular,
  },
});

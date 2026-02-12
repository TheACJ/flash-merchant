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
        <Ionicons name="checkmark-circle" size={24} color="#0F6EC0" />
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
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle as TextStyle}>Business hours</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        {days.map((day, index) => (
          <View key={day.day} style={styles.dayCard as ViewStyle}>
            <View style={styles.dayHeader as ViewStyle}>
              <View style={styles.dayInfo as ViewStyle}>
                <View style={styles.iconContainer as ViewStyle}>
                  <Ionicons name="checkmark-circle" size={24} color={day.isOpen ? '#0F6EC0' : '#323333'} />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dayCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 8,
    marginBottom: 12,
    padding: 15,
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
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 510,
  },
  dayRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    marginRight: 8,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 85,
    alignItems: 'center',
  },
  timeInputText: {
    fontSize: 16,
    color: '#000000',
  },
  time: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  toText: {
    fontSize: 12,
    color: '#323333',
    marginHorizontal: 8,
  },
  timeDivider: {
    fontSize: 12,
    color: '#323333',
    marginHorizontal: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    height: 60,
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#F5F5F5',
    fontWeight: '400',
  },
});

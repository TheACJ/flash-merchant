import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
}) => {
  return (
    <TouchableOpacity
      style={styles.settingsItem as ViewStyle}
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft as ViewStyle}>
        <View style={styles.iconContainer as ViewStyle}>
          <Ionicons name={icon as any} size={20} color="#323333" />
        </View>
        <View style={styles.textContainer as ViewStyle}>
          <Text style={styles.itemTitle as TextStyle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle as TextStyle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.itemRight as ViewStyle}>
        {showSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#D2D6E1', true: '#0F6EC0' }}
            thumbColor="#F4F6F5"
          />
        )}
        {showChevron && !showSwitch && (
          <Ionicons name="chevron-forward" size={20} color="#000000" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle as TextStyle}>{title}</Text>
);

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header as ViewStyle}>
          <Text style={styles.headerTitle as TextStyle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity
          style={styles.profileSection as ViewStyle}
          onPress={() => router.push('/settings/profile' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.profileLeft as ViewStyle}>
            <View style={styles.avatarContainer as ViewStyle}>
              <View style={styles.avatar as ViewStyle}>
                <Ionicons name="person" size={24} color="#657084" />
              </View>
              <View style={styles.verifiedBadge as ViewStyle}>
                <Ionicons name="checkmark-circle" size={16} color="#128807" />
              </View>
            </View>
            <View style={styles.profileInfo as ViewStyle}>
              <View style={styles.profileNameRow as ViewStyle}>
                <Text style={styles.profileName as TextStyle}>Cryptoguru</Text>
                <Ionicons name="checkmark-circle" size={16} color="#128807" />
              </View>
              <Text style={styles.profileRole as TextStyle}>Merchant</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section as ViewStyle}>
          <SectionHeader title="Account" />
          <View style={styles.card as ViewStyle}>
            <SettingsItem
              icon="card-outline"
              title="Bank account"
              subtitle="Manage payout methods"
              onPress={() => router.push('/settings/bank-details' as any)}
            />
            <View style={styles.divider as ViewStyle} />
            <SettingsItem
              icon="shield-checkmark-outline"
              title="Security"
              subtitle="PIN, biometric, and KYC settings"
              onPress={() => router.push('/settings/security' as any)}
            />
          </View>
        </View>

        {/* Business Settings Section */}
        <View style={styles.section as ViewStyle}>
          <SectionHeader title="Business settings" />
          <View style={styles.card as ViewStyle}>
            <SettingsItem
              icon="time-outline"
              title="Business hours"
              subtitle="Mon-Fri: 9:00 AM - 6:00 PM"
              onPress={() => router.push('/settings/business-hours' as any)}
            />
            <View style={styles.divider as ViewStyle} />
            <SettingsItem
              icon="swap-horizontal-outline"
              title="Exchange rate"
              subtitle="Customize your pricing"
              onPress={() => router.push('/settings/exchange-rate' as any)}
            />
            <View style={styles.divider as ViewStyle} />
            <SettingsItem
              icon="cash-outline"
              title="Currency"
              subtitle="Choose your currency"
              onPress={() => router.push('/settings/currency' as any)}
            />
            <View style={styles.divider as ViewStyle} />
            <SettingsItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Allow notifications"
              showChevron={false}
              showSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section as ViewStyle}>
          <SectionHeader title="Support" />
          <View style={styles.card as ViewStyle}>
            <SettingsItem
              icon="help-circle-outline"
              title="Help and support"
              subtitle="FAQs and contact support"
              onPress={() => router.push('/settings/help-support' as any)}
            />
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section as ViewStyle}>
          <TouchableOpacity
            style={styles.logoutButton as ViewStyle}
            onPress={() => router.push('/settings/logout' as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#C31D1E" />
            <Text style={styles.logoutText as TextStyle}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom navigation */}
        <View style={styles.bottomSpacer as ViewStyle} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
  },
  profileInfo: {},
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 6,
  },
  profileRole: {
    fontSize: 14,
    color: '#323333',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#323333',
    marginBottom: 10,
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    paddingVertical: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingVertical: 20,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#323333',
    marginTop: 4,
  },
  itemRight: {
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(195, 29, 30, 0.1)',
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(195, 29, 30, 0.1)',
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
    fontWeight: '400',
  },
  bottomSpacer: {
    height: 100,
  },
});

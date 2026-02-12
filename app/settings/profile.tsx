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

export default function ProfileScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle as TextStyle}>Settings</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.profileSection as ViewStyle}>
        <TouchableOpacity
          style={styles.profileCard as ViewStyle}
          onPress={() => router.push('/settings/edit-profile' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.profileLeft as ViewStyle}>
            <View style={styles.avatarContainer as ViewStyle}>
              <View style={styles.avatar as ViewStyle}>
                <Ionicons name="person" size={30} color="#657084" />
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
      </View>

      {/* Account Section */}
      <View style={styles.section as ViewStyle}>
        <Text style={styles.sectionTitle as TextStyle}>Account</Text>
        <View style={styles.card as ViewStyle}>
          <TouchableOpacity
            style={styles.menuItem as ViewStyle}
            onPress={() => router.push('/settings/bank-details' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft as ViewStyle}>
              <View style={styles.iconContainer as ViewStyle}>
                <Ionicons name="card-outline" size={20} color="#323333" />
              </View>
              <View style={styles.textContainer as ViewStyle}>
                <Text style={styles.itemTitle as TextStyle}>Bank account</Text>
                <Text style={styles.itemSubtitle as TextStyle}>Manage payout methods</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
          <View style={styles.divider as ViewStyle} />
          <TouchableOpacity
            style={styles.menuItem as ViewStyle}
            onPress={() => router.push('/settings/security' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft as ViewStyle}>
              <View style={styles.iconContainer as ViewStyle}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#323333" />
              </View>
              <View style={styles.textContainer as ViewStyle}>
                <Text style={styles.itemTitle as TextStyle}>Security</Text>
                <Text style={styles.itemSubtitle as TextStyle}>PIN, biometric, and KYC settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Business Settings Section */}
      <View style={styles.section as ViewStyle}>
        <Text style={styles.sectionTitle as TextStyle}>Business settings</Text>
        <View style={styles.card as ViewStyle}>
          <TouchableOpacity
            style={styles.menuItem as ViewStyle}
            onPress={() => router.push('/settings/business-hours' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft as ViewStyle}>
              <View style={styles.iconContainer as ViewStyle}>
                <Ionicons name="time-outline" size={20} color="#323333" />
              </View>
              <View style={styles.textContainer as ViewStyle}>
                <Text style={styles.itemTitle as TextStyle}>Business hours</Text>
                <Text style={styles.itemSubtitle as TextStyle}>Mon-Fri: 9:00 AM - 6:00 PM</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
          <View style={styles.divider as ViewStyle} />
          <TouchableOpacity
            style={styles.menuItem as ViewStyle}
            onPress={() => router.push('/settings/exchange-rate' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft as ViewStyle}>
              <View style={styles.iconContainer as ViewStyle}>
                <Ionicons name="swap-horizontal-outline" size={20} color="#323333" />
              </View>
              <View style={styles.textContainer as ViewStyle}>
                <Text style={styles.itemTitle as TextStyle}>Exchange rate</Text>
                <Text style={styles.itemSubtitle as TextStyle}>Customize your pricing</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
          <View style={styles.divider as ViewStyle} />
          <TouchableOpacity
            style={styles.menuItem as ViewStyle}
            onPress={() => router.push('/settings/currency' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft as ViewStyle}>
              <View style={styles.iconContainer as ViewStyle}>
                <Ionicons name="cash-outline" size={20} color="#323333" />
              </View>
              <View style={styles.textContainer as ViewStyle}>
                <Text style={styles.itemTitle as TextStyle}>Currency</Text>
                <Text style={styles.itemSubtitle as TextStyle}>Choose your currency</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section as ViewStyle}>
        <Text style={styles.sectionTitle as TextStyle}>Support</Text>
        <View style={styles.card as ViewStyle}>
          <TouchableOpacity
            style={styles.menuItem as ViewStyle}
            onPress={() => router.push('/settings/help-support' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.itemLeft as ViewStyle}>
              <View style={styles.iconContainer as ViewStyle}>
                <Ionicons name="help-circle-outline" size={20} color="#323333" />
              </View>
              <View style={styles.textContainer as ViewStyle}>
                <Text style={styles.itemTitle as TextStyle}>Help and support</Text>
                <Text style={styles.itemSubtitle as TextStyle}>FAQs and contact support</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000000" />
          </TouchableOpacity>
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
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
  menuItem: {
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
});

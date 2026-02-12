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

interface SupportItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showChevron?: boolean;
  subtitleColor?: string;
}

const SupportItem: React.FC<SupportItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  subtitleColor = '#0F6EC0',
}) => (
  <TouchableOpacity
    style={styles.supportItem as ViewStyle}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft as ViewStyle}>
      <View style={styles.iconContainer as ViewStyle}>
        <Ionicons name={icon as any} size={20} color="#323333" />
      </View>
      <View style={styles.textContainer as ViewStyle}>
        <Text style={styles.itemTitle as TextStyle}>{title}</Text>
        <Text style={[styles.itemSubtitle as TextStyle, { color: subtitleColor }]}>
          {subtitle}
        </Text>
      </View>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color="#000000" />
    )}
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
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
        <Text style={styles.headerTitle as TextStyle}>Help and support</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        <View style={styles.supportCard as ViewStyle}>
          <SupportItem
            icon="call-outline"
            title="Phone Support"
            subtitle="+234 800 FLASH 00"
            onPress={() => {}}
          />

          <View style={styles.divider as ViewStyle} />

          <SupportItem
            icon="mail-outline"
            title="Email Support"
            subtitle="merchant@flash.support"
            onPress={() => {}}
          />

          <View style={styles.divider as ViewStyle} />

          <SupportItem
            icon="help-circle-outline"
            title="Frequently Asked Questions"
            subtitle="common questions and tips"
            onPress={() => router.push('/settings/faq' as any)}
          />

          <View style={styles.divider as ViewStyle} />

          <SupportItem
            icon="chatbubbles-outline"
            title="Chat with support"
            subtitle="Get instant help from flash team"
            onPress={() => router.push('/misc/chat' as any)}
          />
        </View>
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
    paddingTop: 20,
  },
  supportCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    padding: 15,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
    marginTop: 4,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginLeft: 52,
    marginVertical: 4,
  },
});

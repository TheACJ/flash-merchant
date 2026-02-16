import { borderRadius, colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
  logo?: any;
  logoSize?: number;
  logoBackgroundColor?: string;
}

export default function QRCodeDisplay({
  value,
  size = 200,
  backgroundColor = colors.backgroundCard,
  color = colors.textSecondary,
  logo,
  logoSize = 50,
  logoBackgroundColor = colors.backgroundCard,
}: QRCodeDisplayProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <QRCode
        value={value}
        size={size}
        backgroundColor={backgroundColor}
        color={color}
        logo={logo}
        logoSize={logoSize}
        logoBackgroundColor={logoBackgroundColor}
        logoBorderRadius={logoSize / 2}
        logoMargin={5}
        quietZone={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
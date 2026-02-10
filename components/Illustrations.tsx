import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export const PaymentIllustration = () => (
  <View style={styles.container}>
    <Svg width="400" height="395" viewBox="0 0 400 395">
      {/* Background Circle */}
      <Circle cx="200" cy="197.5" r="150" fill="#E6F2FF" opacity="0.3" />
      
      {/* Phone Device */}
      <Rect x="140" y="100" width="120" height="220" rx="15" fill="#FFFFFF" stroke="#263238" strokeWidth="2" />
      <Rect x="145" y="110" width="110" height="190" rx="5" fill="#0F6EC0" opacity="0.1" />
      
      {/* Payment Icon */}
      <Circle cx="200" cy="170" r="30" fill="#0F6EC0" />
      <Path d="M 190 170 L 200 180 L 220 160" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Decorative elements */}
      <Circle cx="100" cy="150" r="8" fill="#0F6EC0" opacity="0.3" />
      <Circle cx="300" cy="180" r="6" fill="#0F6EC0" opacity="0.3" />
      <Circle cx="280" cy="120" r="10" fill="#0F6EC0" opacity="0.2" />
    </Svg>
  </View>
);

export const TransactionIllustration = () => (
  <View style={styles.container}>
    <Svg width="400" height="395" viewBox="0 0 400 395">
      {/* Background */}
      <Rect x="50" y="80" width="300" height="250" rx="20" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="2" />
      
      {/* Window frame */}
      <Rect x="70" y="100" width="260" height="40" rx="10" fill="#0F6EC0" opacity="0.1" />
      
      {/* Transaction rows */}
      <G>
        <Rect x="80" y="160" width="240" height="30" rx="5" fill="#F5F5F5" />
        <Circle cx="100" cy="175" r="8" fill="#0F6EC0" />
        <Rect x="120" y="167" width="100" height="4" rx="2" fill="#E0E0E0" />
        <Rect x="120" y="177" width="60" height="4" rx="2" fill="#E0E0E0" />
      </G>
      
      <G>
        <Rect x="80" y="200" width="240" height="30" rx="5" fill="#F5F5F5" />
        <Circle cx="100" cy="215" r="8" fill="#0F6EC0" />
        <Rect x="120" y="207" width="100" height="4" rx="2" fill="#E0E0E0" />
        <Rect x="120" y="217" width="60" height="4" rx="2" fill="#E0E0E0" />
      </G>
      
      <G>
        <Rect x="80" y="240" width="240" height="30" rx="5" fill="#F5F5F5" />
        <Circle cx="100" cy="255" r="8" fill="#0F6EC0" />
        <Rect x="120" y="247" width="100" height="4" rx="2" fill="#E0E0E0" />
        <Rect x="120" y="257" width="60" height="4" rx="2" fill="#E0E0E0" />
      </G>
      
      {/* Character illustration */}
      <Circle cx="320" cy="300" r="25" fill="#FFA8A7" />
      <Rect x="305" y="320" width="30" height="40" rx="5" fill="#0F6EC0" />
    </Svg>
  </View>
);

export const CurrencyIllustration = () => (
  <View style={styles.container}>
    <Svg width="400" height="395" viewBox="0 0 400 395">
      {/* Globe */}
      <Circle cx="200" cy="197.5" r="80" fill="none" stroke="#0F6EC0" strokeWidth="2" />
      <Ellipse cx="200" cy="197.5" rx="80" ry="40" fill="none" stroke="#0F6EC0" strokeWidth="1.5" opacity="0.6" />
      <Ellipse cx="200" cy="197.5" rx="40" ry="80" fill="none" stroke="#0F6EC0" strokeWidth="1.5" opacity="0.6" />
      <Path d="M 120 197.5 L 280 197.5" stroke="#0F6EC0" strokeWidth="1.5" opacity="0.6" />
      
      {/* Currency symbols */}
      <G transform="translate(100, 120)">
        <Circle cx="0" cy="0" r="20" fill="#0F6EC0" opacity="0.9" />
        <Path d="M -5 -8 L -5 8 M -5 0 L 5 0 M 5 -5 L 5 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </G>
      
      <G transform="translate(250, 150)">
        <Circle cx="0" cy="0" r="18" fill="#0F6EC0" opacity="0.8" />
        <Path d="M -4 -6 L -4 6 M -4 -6 L 2 -6 M -4 6 L 2 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </G>
      
      <G transform="translate(180, 280)">
        <Circle cx="0" cy="0" r="16" fill="#0F6EC0" opacity="0.7" />
        <Path d="M -3 -5 L -3 5 M 0 -5 L 0 5 M 3 -5 L 3 5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </G>
      
      {/* Plant decoration */}
      <G transform="translate(80, 300)">
        <Rect x="0" y="20" width="15" height="30" rx="3" fill="#263238" />
        <Ellipse cx="7.5" cy="15" rx="12" ry="18" fill="#0F6EC0" opacity="0.6" />
        <Ellipse cx="7.5" cy="8" rx="10" ry="14" fill="#0F6EC0" opacity="0.7" />
      </G>
      
      {/* Character */}
      <G transform="translate(280, 280)">
        <Circle cx="0" cy="-10" r="15" fill="#FFA8A7" />
        <Rect x="-12" y="5" width="24" height="35" rx="5" fill="#0F6EC0" />
        <Rect x="-12" y="5" width="24" height="10" rx="3" fill="#FFFFFF" opacity="0.4" />
      </G>
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 395,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
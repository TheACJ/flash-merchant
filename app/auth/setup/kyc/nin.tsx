// auth/setup/kyc/nin.tsx
import { NumpadScreen } from '@/components/kyc/NumpadScreen';
import {
  colors,
  layout,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Fingerprint } from 'lucide-react-native';
import React from 'react';

export default function NINVerification() {
  const router = useRouter();

  const handleSubmit = (value: string) => {
    router.push({
      pathname: './verifying',
      params: { type: 'NIN', number: value },
    });
  };

  return (
    <NumpadScreen
      title="NIN Verification"
      inputLabel="National Identification Number"
      placeholder="Enter your NIN"
      maxDigits={11}
      hint="Must be 11 digits long"
      icon={
        <Fingerprint
          size={layout.iconSize.md}
          color={colors.primary}
          strokeWidth={1.8}
        />
      }
      onSubmit={handleSubmit}
    />
  );
}
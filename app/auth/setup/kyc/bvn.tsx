// auth/setup/kyc/bvn.tsx
import { NumpadScreen } from '@/components/kyc/NumpadScreen';
import {
  colors,
  layout,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import React from 'react';

export default function BVNVerification() {
  const router = useRouter();

  const handleSubmit = (value: string) => {
    router.push({
      pathname: './verifying',
      params: { type: 'BVN', number: value },
    });
  };

  return (
    <NumpadScreen
      title="BVN Verification"
      inputLabel="Bank Verification Number"
      placeholder="Enter your BVN"
      maxDigits={11}
      hint="Must be 11 digits long"
      icon={
        <CreditCard
          size={layout.iconSize.md}
          color={colors.primary}
          strokeWidth={1.8}
        />
      }
      onSubmit={handleSubmit}
    />
  );
}
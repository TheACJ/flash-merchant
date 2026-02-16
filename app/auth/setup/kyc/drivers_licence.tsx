// auth/setup/kyc/drivers_licence.tsx
import { NumpadScreen } from '@/components/kyc/NumpadScreen';
import {
  colors,
  layout,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Car } from 'lucide-react-native';
import React from 'react';

export default function DriversLicenceVerification() {
  const router = useRouter();

  const handleSubmit = (value: string) => {
    router.push({
      pathname: './verifying',
      params: { type: "Driver's Licence", number: value },
    });
  };

  return (
    <NumpadScreen
      title="Driver's Licence"
      inputLabel="Licence Number"
      placeholder="Enter licence number"
      maxDigits={11}
      hint="Must be 11 digits long"
      icon={
        <Car
          size={layout.iconSize.md}
          color={colors.primary}
          strokeWidth={1.8}
        />
      }
      onSubmit={handleSubmit}
    />
  );
}
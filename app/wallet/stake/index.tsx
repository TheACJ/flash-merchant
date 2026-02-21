import Processing from '@/components/Processing';
import Success from '@/components/kyc/Success';
import { colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import EnterStakeAmount from './EnterStakeAmount';
import StakePayment from './StakePayment';
import {
  StakeData,
  StakeStep,
  STAKING_CONFIG,
  STAKING_WALLET_ADDRESS,
} from './types';

const initialStakeData: StakeData = {
  amount: '',
  walletAddress: STAKING_WALLET_ADDRESS,
  qrCodeData: '',
  estimatedReturns: '',
  stakingPeriod: `${STAKING_CONFIG.lockPeriodDays} days`,
  apr: `${STAKING_CONFIG.apr}%`,
};

export default function StakeFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StakeStep>('enterAmount');
  const [stakeData, setStakeData] = useState<StakeData>(initialStakeData);

  const calculateEstimatedReturns = (amount: number): string => {
    const dailyRate = STAKING_CONFIG.apr / 100 / 365;
    const returns = amount * dailyRate * STAKING_CONFIG.lockPeriodDays;
    return `$${returns.toFixed(2)}`;
  };

  const generateQRData = (amount: string): string => {
    return JSON.stringify({
      type: 'stake',
      amount,
      address: STAKING_WALLET_ADDRESS,
      network: 'flash',
      timestamp: Date.now(),
    });
  };

  const handleAmountSubmit = useCallback((amount: string) => {
    const numAmount = parseFloat(amount);
    const estimatedReturns = calculateEstimatedReturns(numAmount);
    const qrCodeData = generateQRData(amount);

    setStakeData((prev) => ({
      ...prev,
      amount,
      estimatedReturns,
      qrCodeData,
    }));
    setCurrentStep('payment');
  }, []);

  const handlePaymentConfirm = useCallback(async () => {
    setCurrentStep('processing');

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setCurrentStep('success');
    } catch (error) {
      setCurrentStep('error');
    }
  }, []);

  const handleGoBack = useCallback(() => {
    switch (currentStep) {
      case 'payment':
        setCurrentStep('enterAmount');
        break;
      default:
        router.back();
    }
  }, [currentStep, router]);

  const handleCancel = useCallback(() => {
    setStakeData(initialStakeData);
    setCurrentStep('enterAmount');
    router.back();
  }, [router]);

  const handleGoHome = useCallback(() => {
    setStakeData(initialStakeData);
    setCurrentStep('enterAmount');
    router.replace('/');
  }, [router]);

  const renderStep = () => {
    switch (currentStep) {
      case 'enterAmount':
        return (
          <EnterStakeAmount
            initialAmount={stakeData.amount}
            stakingConfig={STAKING_CONFIG}
            onSubmit={handleAmountSubmit}
            onBack={() => router.back()}
          />
        );

      case 'payment':
        return (
          <StakePayment
            amount={stakeData.amount}
            walletAddress={stakeData.walletAddress}
            qrCodeData={stakeData.qrCodeData}
            estimatedReturns={stakeData.estimatedReturns}
            apr={stakeData.apr}
            stakingPeriod={stakeData.stakingPeriod}
            onConfirm={handlePaymentConfirm}
            onCancel={handleCancel}
            onBack={handleGoBack}
          />
        );

      case 'processing':
        return (
          <Processing
            title="Verifying Payment"
            message="Please wait while we confirm your staking transaction..."
          />
        );

      case 'success':
        return (
          <Success
            title="Staking successful"
            message={`You have staked $${stakeData.amount}`}
            onPrimaryAction={handleGoHome}
            primaryActionLabel="Go back home"
          />
        );

      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderStep()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
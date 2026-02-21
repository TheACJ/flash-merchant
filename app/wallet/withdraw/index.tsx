import Success from '@/components/kyc/Success';
import Processing from '@/components/Processing';
import { colors } from '@/constants/theme';
import FlashTagService, { FlashTagInfo } from '@/services/FlashTagService';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import EnterAmount from './EnterAmount';
import EnterPin from './EnterPin';
import SelectFlashTagAsset from './SelectFlashTagAsset';
import {
  Asset,
  CustomerInfo,
  EXCHANGE_RATES,
  getChainForAsset,
  WithdrawalData,
  WithdrawalStep
} from './types';

const initialWithdrawalData: WithdrawalData = {
  customer: null,
  asset: null,
  amount: '',
  cryptoAmount: '',
  exchangeRate: '',
  networkFee: '',
  customerReceives: '',
  pin: '',
};

export default function WithdrawFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] =
    useState<WithdrawalStep>('selectFlashTagAsset');
  const [withdrawalData, setWithdrawalData] =
    useState<WithdrawalData>(initialWithdrawalData);
  const [resolvedTagInfo, setResolvedTagInfo] = useState<FlashTagInfo | null>(null);

  const handleFlashTagAssetSubmit = useCallback(
    async (flashTag: string, asset: Asset) => {
      try {
        // Resolve the flash tag to get wallet address for the selected asset's chain
        // Use the mapping to get the correct chain name (e.g., bnb -> bnb, usdt -> ethereum)
        const chain = getChainForAsset(asset.id);
        const tagWithoutAt = flashTag.replace('@', '');

        const resolution = await FlashTagService.resolveTag(tagWithoutAt, chain);

        let customer: CustomerInfo;

        if (!resolution.success || !resolution.data) {
          console.error('[WithdrawFlow] Failed to resolve tag:', resolution.error);
          // Fallback to placeholder data
          customer = {
            flashTag,
            name: tagWithoutAt,
            walletAddress: 'Unable to resolve wallet',
          };
          setResolvedTagInfo(null);
        } else {
          console.log('[WithdrawFlow] Tag resolved:', resolution.data);
          setResolvedTagInfo(resolution.data);
          customer = {
            flashTag,
            name: resolution.data.displayName || resolution.data.username || tagWithoutAt,
            walletAddress: resolution.data.address,
          };
        }

        const exchangeRate = asset.price || EXCHANGE_RATES[asset.id] || 1;

        setWithdrawalData((prev) => ({
          ...prev,
          customer,
          asset,
          exchangeRate: `1 ${asset.symbol}=$${exchangeRate.toLocaleString()}`,
        }));
        setCurrentStep('enterAmount');
      } catch (error) {
        console.error('Error resolving flash tag:', error);
        // Fallback with placeholder data
        const tagWithoutAt = flashTag.replace('@', '');
        const customer: CustomerInfo = {
          flashTag,
          name: tagWithoutAt,
          walletAddress: 'Unable to resolve wallet',
        };
        const exchangeRate = asset.price || EXCHANGE_RATES[asset.id] || 1;

        setResolvedTagInfo(null);
        setWithdrawalData((prev) => ({
          ...prev,
          customer,
          asset,
          exchangeRate: `1 ${asset.symbol}=$${exchangeRate.toLocaleString()}`,
        }));
        setCurrentStep('enterAmount');
      }
    },
    []
  );

  const handleAmountSubmit = useCallback(
    (amount: string) => {
      if (!withdrawalData.asset) return;

      const exchangeRate = EXCHANGE_RATES[withdrawalData.asset.id] || 1;
      const amountNum = parseFloat(amount) || 0;
      const cryptoAmount = amountNum / exchangeRate;
      const networkFee = 2.5;

      setWithdrawalData((prev) => ({
        ...prev,
        amount,
        cryptoAmount: `${cryptoAmount.toFixed(5)} ${prev.asset?.symbol}`,
        networkFee: `$${networkFee.toFixed(2)}`,
        customerReceives: `$${(amountNum - networkFee).toFixed(2)}`,
      }));
      setCurrentStep('enterPin');
    },
    [withdrawalData.asset]
  );

  const handlePinSubmit = useCallback(async (pin: string) => {
    setWithdrawalData((prev) => ({ ...prev, pin }));
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
      case 'enterAmount':
        setCurrentStep('selectFlashTagAsset');
        break;
      case 'enterPin':
        setCurrentStep('enterAmount');
        break;
      default:
        router.back();
    }
  }, [currentStep, router]);

  const handleGoHome = useCallback(() => {
    setWithdrawalData(initialWithdrawalData);
    setResolvedTagInfo(null);
    setCurrentStep('selectFlashTagAsset');
    router.replace('/');
  }, [router]);

  const renderStep = () => {
    switch (currentStep) {
      case 'selectFlashTagAsset':
        return (
          <SelectFlashTagAsset
            initialFlashTag={withdrawalData.customer?.flashTag}
            initialAsset={withdrawalData.asset}
            onSubmit={handleFlashTagAssetSubmit}
            onBack={() => router.back()}
          />
        );

      case 'enterAmount':
        return (
          <EnterAmount
            customer={withdrawalData.customer!}
            asset={withdrawalData.asset!}
            initialAmount={withdrawalData.amount}
            onSubmit={handleAmountSubmit}
            onBack={handleGoBack}
          />
        );

      case 'enterPin':
        return (
          <EnterPin
            summary={{
              amount: withdrawalData.cryptoAmount,
              exchangeRate: withdrawalData.exchangeRate,
              customerReceives: withdrawalData.customerReceives,
              networkFee: withdrawalData.networkFee,
            }}
            onSubmit={handlePinSubmit}
            onBack={handleGoBack}
          />
        );

      case 'processing':
        return (
          <Processing
            title="Processing Withdrawal"
            message="Please wait while we process your transaction..."
          />
        );

      case 'success':
        return (
          <Success
            title="Successfully sent"
            message={`Sent ${withdrawalData.cryptoAmount} to ${withdrawalData.customer?.name}`}
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
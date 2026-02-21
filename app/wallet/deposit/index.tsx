import Success from '@/components/kyc/Success';
import Processing from '@/components/Processing';
import { colors } from '@/constants/theme';
import FlashTagService, { FlashTagInfo } from '@/services/FlashTagService';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import EnterFlashTag from './EnterFlashTag';
import SelectAssetAmount from './SelectAssetAmount';
import TransactionSummary from './TransactionSummary';
import { Asset, DepositData, DepositStep, getChainForAsset } from './types';

const initialDepositData: DepositData = {
  flashTag: '',
  asset: null,
  amount: '',
  customerReceives: '',
  exchangeRate: '',
  networkFee: '',
  merchantBalance: '$8,759',
};

export default function DepositFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<DepositStep>('flashTag');
  const [depositData, setDepositData] =
    useState<DepositData>(initialDepositData);
  const [resolvedTagInfo, setResolvedTagInfo] = useState<FlashTagInfo | null>(null);
  const [isResolvingTag, setIsResolvingTag] = useState(false);

  const handleFlashTagSubmit = useCallback((flashTag: string) => {
    setDepositData((prev) => ({ ...prev, flashTag }));
    setCurrentStep('selectAsset');
  }, []);

  const handleAssetAmountSubmit = useCallback(
    async (asset: Asset, amount: string) => {
      if (!depositData.flashTag) return;

      setIsResolvingTag(true);

      try {
        // Resolve the flash tag to get wallet address for the selected asset's chain
        // Use the mapping to get the correct chain name (e.g., bnb -> bnb, usdt -> ethereum)
        const chain = getChainForAsset(asset.id);
        const tagWithoutAt = depositData.flashTag.replace('@', '');

        const resolution = await FlashTagService.resolveTag(tagWithoutAt, chain);

        if (!resolution.success || !resolution.data) {
          console.error('[DepositFlow] Failed to resolve tag:', resolution.error);
          // Still proceed but without resolved info - the summary will show the tag only
          setResolvedTagInfo(null);
        } else {
          console.log('[DepositFlow] Tag resolved:', resolution.data);
          setResolvedTagInfo(resolution.data);
        }

        // Calculate exchange rate and crypto amount
        const exchangeRate = asset.price || 0;
        const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
        const cryptoAmount = exchangeRate > 0 ? amountNum / exchangeRate : 0;
        const networkFee = 2.5;

        setDepositData((prev) => ({
          ...prev,
          asset,
          amount,
          exchangeRate: `1 ${asset.symbol}=$${exchangeRate.toLocaleString()}`,
          customerReceives: `${cryptoAmount.toFixed(5)} ${asset.symbol}`,
          networkFee: `$${networkFee.toFixed(2)}`,
        }));
        setCurrentStep('summary');
      } catch (error) {
        console.error('[DepositFlow] Error resolving tag:', error);
        setResolvedTagInfo(null);

        // Still proceed with the transaction
        const exchangeRate = asset.price || 0;
        const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
        const cryptoAmount = exchangeRate > 0 ? amountNum / exchangeRate : 0;
        const networkFee = 2.5;

        setDepositData((prev) => ({
          ...prev,
          asset,
          amount,
          exchangeRate: `1 ${asset.symbol}=$${exchangeRate.toLocaleString()}`,
          customerReceives: `${cryptoAmount.toFixed(5)} ${asset.symbol}`,
          networkFee: `$${networkFee.toFixed(2)}`,
        }));
        setCurrentStep('summary');
      } finally {
        setIsResolvingTag(false);
      }
    },
    [depositData.flashTag]
  );

  const handleConfirmDeposit = useCallback(async () => {
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
      case 'selectAsset':
        setCurrentStep('flashTag');
        break;
      case 'summary':
        setCurrentStep('selectAsset');
        break;
      default:
        router.back();
    }
  }, [currentStep, router]);

  const handleGoHome = useCallback(() => {
    setDepositData(initialDepositData);
    setResolvedTagInfo(null);
    setCurrentStep('flashTag');
    router.replace('/');
  }, [router]);

  const renderStep = () => {
    switch (currentStep) {
      case 'flashTag':
        return (
          <EnterFlashTag
            initialValue={depositData.flashTag}
            onSubmit={handleFlashTagSubmit}
            onBack={() => router.back()}
          />
        );

      case 'selectAsset':
        return (
          <SelectAssetAmount
            initialAsset={depositData.asset}
            initialAmount={depositData.amount}
            onSubmit={handleAssetAmountSubmit}
            onBack={handleGoBack}
          />
        );

      case 'summary':
        return (
          <TransactionSummary
            data={{
              yourBalance: depositData.merchantBalance,
              exchangeRate: depositData.exchangeRate,
              customerReceives: depositData.customerReceives,
              networkFee: depositData.networkFee,
              asset: depositData.asset!,
              amount: depositData.amount,
            }}
            flashTag={depositData.flashTag}
            resolvedTagInfo={resolvedTagInfo}
            onConfirm={handleConfirmDeposit}
            onBack={handleGoBack}
          />
        );

      case 'processing':
        return (
          <Processing
            title="Processing Deposit"
            message="Please wait while we process your transaction..."
          />
        );

      case 'success':
        return (
          <Success
            title="Successfully sent"
            message={`Sent ${depositData.customerReceives} to ${depositData.flashTag}`}
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

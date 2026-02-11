import Success from '@/components/kyc/Success';
import Verifying from '@/components/kyc/Verifying';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import EnterFlashTag from './EnterFlashTag';
import SelectAssetAmount from './SelectAssetAmount';
import TransactionSummary from './TransactionSummary';
import { Asset, DepositData, DepositStep } from './types';

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
  const [depositData, setDepositData] = useState<DepositData>(initialDepositData);

  const handleFlashTagSubmit = useCallback((flashTag: string) => {
    setDepositData((prev) => ({ ...prev, flashTag }));
    setCurrentStep('selectAsset');
  }, []);

  const handleAssetAmountSubmit = useCallback((asset: Asset, amount: string) => {
    // Calculate values based on asset and amount
    const exchangeRate = getExchangeRate(asset);
    const amountNum = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
    const cryptoAmount = amountNum / exchangeRate;
    const networkFee = 2.50;

    setDepositData((prev) => ({
      ...prev,
      asset,
      amount,
      exchangeRate: `1 ${asset.symbol}=$${exchangeRate.toLocaleString()}`,
      customerReceives: `${cryptoAmount.toFixed(5)} ${asset.symbol}`,
      networkFee: `$${networkFee.toFixed(2)}`,
    }));
    setCurrentStep('summary');
  }, []);

  const handleConfirmDeposit = useCallback(async () => {
    setCurrentStep('processing');
    
    try {
      // Simulate API call
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
    setCurrentStep('flashTag');
    router.replace('/');
  }, [router]);

  const getExchangeRate = (asset: Asset): number => {
    const rates: Record<string, number> = {
      btc: 40000,
      eth: 2500,
      sol: 100,
      pol: 0.85,
      zec: 25,
    };
    return rates[asset.id] || 1;
  };

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
            onConfirm={handleConfirmDeposit}
            onBack={handleGoBack}
          />
        );
      
      case 'processing':
        return (
          <Verifying
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
    backgroundColor: '#F5F5F5',
  },
});
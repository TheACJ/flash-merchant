// welcome/index.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ArrowRight } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width, height } = Dimensions.get('window');

// Lottie animation assets — place your .json files in assets/animations/
const slides = [
  {
    id: '1',
    title: 'Accept Payments\nInstantly',
    description:
      'Take crypto-to-fiat payments directly from customers with a simple scan.',
    // Replace with your own Lottie JSON file path
    lottie: require('../../assets/animations/payment.json'),
  },
  {
    id: '2',
    title: 'Manage Transactions\n& History',
    description:
      'See all your incoming and completed transactions in one place.',
    lottie: require('../../assets/animations/transactions.json'),
  },
  {
    id: '3',
    title: 'Withdraw Funds\nEasily',
    description:
      'Cash out crypto to fiat quickly through trusted agents or merchants.',
    lottie: require('../../assets/animations/withdraw.json'),
  },
];

const SLIDE_DOT_SIZE = 8;
const SLIDE_DOT_ACTIVE_WIDTH = 28;

const WelcomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slidesRef = useRef<any>(null);
  const lottieRefs = useRef<(LottieView | null)[]>([]);

  // Play the Lottie animation for the current slide
  useEffect(() => {
    lottieRefs.current[currentIndex]?.play();
  }, [currentIndex]);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Navigate to disclaimer - the disclaimer screen will set the onboarding step
      router.push('/(welcome)/disclaimer');
    }
  }, [currentIndex, router]);

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = useCallback(
    ({ item, index }: { item: (typeof slides)[0]; index: number }) => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ];

      const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.85, 1, 0.85],
        extrapolate: 'clamp',
      });

      const opacity = scrollX.interpolate({
        inputRange,
        outputRange: [0, 1, 0],
        extrapolate: 'clamp',
      });

      const translateY = scrollX.interpolate({
        inputRange,
        outputRange: [30, 0, 30],
        extrapolate: 'clamp',
      });

      return (
        <View style={[styles.slideContainer, { width, paddingTop: Math.max(insets.top, spacing['3xl']) }]}>

          <Animated.View
            style={[
              styles.illustrationContainer,
              { transform: [{ scale }], opacity },
            ]}
          >
            <LottieView
              ref={(ref) => {
                lottieRefs.current[index] = ref;
              }}
              source={item.lottie}
              style={styles.lottie}
              autoPlay={index === 0}
              loop
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.contentContainer,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </View>
      );
    },
    [scrollX]
  );

  const renderPaginator = () => (
    <View style={styles.paginatorContainer}>
      {slides.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [SLIDE_DOT_SIZE, SLIDE_DOT_ACTIVE_WIDTH, SLIDE_DOT_SIZE],
          extrapolate: 'clamp',
        });

        const dotOpacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity: dotOpacity,
                backgroundColor: colors.primary,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />


      <Animated.FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
        decelerationRate="fast"
      />

      <View style={styles.bottomContainer}>
        <View style={styles.bottomInner}>
          {renderPaginator()}

          <TouchableOpacity
            style={[
              styles.continueButton,
              isLastSlide && styles.continueButtonExpanded,
            ]}
            onPress={scrollTo}
            activeOpacity={0.85}
          >
            {isLastSlide ? (
              <Text style={styles.continueButtonText}>Get Started</Text>
            ) : null}
            <ArrowRight
              size={layout.iconSize.md}
              color={colors.textWhite}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  illustrationContainer: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lottie: {
    width: width * 0.75,
    height: width * 0.75,
  },
  contentContainer: {
    flex: 0.35,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['5xl'] * typography.lineHeight.tight,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.tight,
  },
  description: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    textAlign: 'center',
    color: colors.textTertiary,
    maxWidth: 320,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['3xl'],
  },
  bottomInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: SLIDE_DOT_SIZE,
    borderRadius: borderRadius.full,
  },
  continueButton: {
    width: layout.buttonHeight,
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  continueButtonExpanded: {
    width: 'auto',
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
  },
  continueButtonText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default WelcomeScreen;
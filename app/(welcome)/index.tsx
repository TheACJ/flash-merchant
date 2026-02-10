import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    CurrencyIllustration,
    PaymentIllustration,
    TransactionIllustration,
} from '../../components/Illustrations';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Accept Payments Instantly',
    description: 'Take crypto-to-fiat payments directly from customers with a simple scan',
    Illustration: PaymentIllustration,
  },
  {
    id: '2',
    title: 'Manage Transactions & History',
    description: 'See all your incoming and completed transactions in one place',
    Illustration: TransactionIllustration,
  },
  {
    id: '3',
    title: 'Withdraw Funds Easily',
    description: 'Cash out crypto to fiat quickly through trusted agents or merchants.',
    Illustration: CurrencyIllustration,
  },
];

const WelcomeScreen = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Navigate to disclaimer screen
      router.push('(welcome)/disclaimer');
    }
  };

  const Slide = ({ item, index }) => {
    const IllustrationComponent = item.Illustration;
    
    // Create a scale animation for the illustration
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slideContainer, { width }]}>
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <IllustrationComponent />
        </Animated.View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity,
                  backgroundColor:
                    i === currentIndex ? '#0F6EC0' : 'rgba(15, 114, 199, 0.2)',
                },
              ]}
              key={i.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      <View style={styles.statusBarSpacer} />

      <Animated.FlatList
        data={slides}
        renderItem={({ item, index }) => <Slide item={item} index={index} />}
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
        <Paginator />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={scrollTo}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBarSpacer: {
    height: 54,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 80,
  },
  contentContainer: {
    paddingHorizontal: 52,
    alignItems: 'center',
    marginBottom: 120,
    width: '100%',
  },
  title: {
    fontSize: width < 375 ? 35 : 40,
    fontWeight: '600',
    lineHeight: width < 375 ? 40 : 45,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
    fontFamily: 'SF Pro',
  },
  description: {
    fontSize: width < 375 ? 22 : 25,
    fontWeight: '400',
    lineHeight: 30,
    textAlign: 'center',
    color: '#323333',
    fontFamily: 'SF Pro',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 20,
    borderRadius: 10,
  },
  continueButton: {
    backgroundColor: '#0F6EC0',
    paddingHorizontal: 44.5,
    paddingVertical: 22,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F6EC0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: 'SF Pro',
  },
});

export default WelcomeScreen;
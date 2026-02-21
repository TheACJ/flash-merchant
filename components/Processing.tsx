import {
    borderRadius,
    colors,
    layout,
    spacing,
    typography
} from '@/constants/theme';
import { Loader2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface ProcessingProps {
    title?: string;
    message?: string;
}

export default function Processing({
    title = 'Processing',
    message = 'Please wait while we process your transaction...',
}: ProcessingProps) {
    const spinAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Spin animation
    useEffect(() => {
        const spin = Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spin.start();
        return () => spin.stop();
    }, [spinAnim]);

    // Fade in animation
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const spinInterpolation = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <View style={styles.container}>
                <Animated.View
                    style={[styles.content, { opacity: fadeAnim }]}
                >
                    <Animated.View
                        style={[
                            styles.iconCircle,
                            { transform: [{ rotate: spinInterpolation }] },
                        ]}
                    >
                        <Loader2
                            size={layout.iconSize['2xl']}
                            color={colors.primary}
                            strokeWidth={1.5}
                        />
                    </Animated.View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layout.screenPaddingHorizontal,
    },
    content: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primaryLight,
        borderWidth: 2,
        borderColor: colors.primaryMedium,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: typography.fontSize.base,
        color: colors.textTertiary,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
});

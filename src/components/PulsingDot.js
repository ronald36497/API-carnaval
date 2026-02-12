import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

const PulsingDot = React.memo(() => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.pulsingContainer}>
      <Animated.View style={[styles.pulsingRing, animatedStyle]} />
      <View style={styles.pulsingCore} />
    </View>
  );
});

const styles = StyleSheet.create({
  pulsingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  pulsingCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.live,
  },
});

export default PulsingDot;

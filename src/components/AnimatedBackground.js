import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Anel Giratório (Agora com traço mais grosso e mais visível)
const Ring = ({ size, color, strokeWidth, duration, delay = 0, style }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: duration, easing: Easing.linear }),
      -1,
      false,
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderStyle: 'dashed',
          opacity: 0.35, // AUMENTEI AQUI (era 0.15)
        },
        style,
        animatedStyle,
      ]}
    />
  );
};

// Formas Sólidas (Confetes de fundo)
const FloatingShape = ({ size, color, duration, startX, startY }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-50, {
          duration: duration,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, { duration: duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: startY,
          left: startX,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
          opacity: 0.4, // AUMENTEI AQUI (era 0.1)
        },
        animatedStyle,
      ]}
    />
  );
};

const AnimatedBackground = React.memo(() => {
  return (
    <View style={styles.bgContainer} pointerEvents="none">
      {/* 1. Base Clara Quente (Mais suave que o anterior) */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFCF2' }]} />

      {/* 2. Anéis Gigantes (Movimento Geométrico) */}
      <Ring
        size={width * 1.4}
        color={THEME.secondary}
        strokeWidth={2}
        duration={25000}
        style={{ top: -width * 0.5, right: -width * 0.5 }}
      />

      <Ring
        size={width * 0.9}
        color={THEME.primaryDark}
        strokeWidth={1.5}
        duration={20000}
        delay={1000}
        style={{ top: height * 0.25, left: -width * 0.4 }}
      />

      <Ring
        size={width * 0.7}
        color={THEME.accent}
        strokeWidth={4}
        duration={18000}
        style={{ bottom: -width * 0.2, right: -width * 0.1 }}
      />

      {/* 3. Confetes Flutuantes (Preenchimento) */}
      <FloatingShape
        size={50}
        color={THEME.primary}
        duration={4000}
        startX={40}
        startY={120}
      />
      <FloatingShape
        size={30}
        color={THEME.accent}
        duration={5000}
        startX={width - 50}
        startY={250}
      />
      <FloatingShape
        size={70}
        color={THEME.secondary}
        duration={6000}
        startX={width / 2}
        startY={height - 150}
      />
      <FloatingShape
        size={20}
        color={THEME.info}
        duration={4500}
        startX={80}
        startY={height - 80}
      />
      <FloatingShape
        size={40}
        color={THEME.primaryDark}
        duration={5500}
        startX={width - 80}
        startY={height / 2}
      />

      {/* 4. Overlay de Pontilhados para Textura (Estática) */}
      <View style={styles.dotContainer}>
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.staticDot,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                backgroundColor: i % 2 === 0 ? THEME.secondary : THEME.accent,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Importante: fica na base
  },
  dotContainer: { ...StyleSheet.absoluteFillObject },
  staticDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.2,
  },
});

export default AnimatedBackground;

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { THEME } from '../constants/theme';

const { width } = Dimensions.get('window');

const SkeletonBlocoCard = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Lado Esquerdo: Timeline Fake */}
      <View style={styles.leftColumn}>
        <Animated.View style={[styles.dot, animatedStyle]} />
        <View style={styles.line} />
      </View>

      {/* Lado Direito: Card Fake */}
      <View style={styles.rightColumn}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {/* Badge Superior */}
          <View style={styles.badgePlaceholder} />

          {/* Header (Tags) */}
          <View style={styles.row}>
            <View style={styles.tagPlaceholder} />
            <View style={[styles.tagPlaceholder, { width: 80 }]} />
          </View>

          {/* Título */}
          <View style={styles.titlePlaceholder} />
          <View style={[styles.titlePlaceholder, { width: '60%' }]} />

          {/* Endereço */}
          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={styles.iconPlaceholder} />
            <View style={styles.textPlaceholder} />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.row}>
              <View style={styles.smallTagPlaceholder} />
              <View style={styles.smallTagPlaceholder} />
            </View>
            <View style={styles.circlePlaceholder} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 0, // Ajuste conforme seu gap
  },
  leftColumn: {
    width: 30,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginTop: 20,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 5,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 15,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 160, // Altura média do seu card real
  },
  badgePlaceholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 70,
    height: 24,
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagPlaceholder: {
    width: 60,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginBottom: 10,
  },
  titlePlaceholder: {
    height: 20,
    width: '90%',
    borderRadius: 4,
    backgroundColor: '#CBD5E1', // Mais escuro para destaque
    marginBottom: 6,
  },
  iconPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  textPlaceholder: {
    height: 14,
    width: '70%',
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  smallTagPlaceholder: {
    width: 50,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  circlePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
});

export default SkeletonBlocoCard;

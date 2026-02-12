import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  withRepeat,
  withTiming,
  withSequence,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';

const HEADER_MAX_HEIGHT = 250;
const HEADER_MIN_HEIGHT = Platform.OS === 'android' ? 100 : 120;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Componente para Formas Animadas (Bolas, Confetes e Linhas)
const FloatingShape = ({
  style,
  delay = 0,
  duration = 4000,
  type = 'rect',
}) => {
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(style.opacity || 0.6);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-30, { duration }),
          withTiming(0, { duration }),
        ),
        -1,
        true,
      ),
    );

    rotation.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: duration * 2 }), -1, false),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: type === 'circle' ? '0deg' : `${rotation.value}deg` },
    ],
  }));

  return <Animated.View style={[styles.shapeBase, style, animatedStyle]} />;
};

const HomeHeader = React.memo(
  ({
    searchText,
    setSearchText,
    calendar,
    selectedDates,
    toggleDate,
    onOpenSettings,
    scrollY,
  }) => {
    const animatedContainerStyle = useAnimatedStyle(() => {
      const height = interpolate(
        scrollY.value,
        [0, SCROLL_DISTANCE],
        [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        Extrapolate.CLAMP,
      );
      return { height };
    });

    const animatedLogoStyle = useAnimatedStyle(() => {
      const opac = interpolate(
        scrollY.value,
        [0, SCROLL_DISTANCE * 0.4],
        [1, 0],
        Extrapolate.CLAMP,
      );
      return {
        opacity: opac,
        transform: [
          {
            translateY: interpolate(
              scrollY.value,
              [0, SCROLL_DISTANCE],
              [0, -20],
              Extrapolate.CLAMP,
            ),
          },
        ],
      };
    });

    const animatedSearchStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, SCROLL_DISTANCE],
        [0, -65],
        Extrapolate.CLAMP,
      );
      const widthPercent = interpolate(
        scrollY.value,
        [0, SCROLL_DISTANCE],
        [100, 90],
        Extrapolate.CLAMP,
      );
      return { width: `${widthPercent}%`, transform: [{ translateY }] };
    });

    const animatedCalendarStyle = useAnimatedStyle(() => {
      const translateY = interpolate(
        scrollY.value,
        [0, SCROLL_DISTANCE],
        [0, -55],
        Extrapolate.CLAMP,
      );
      return { transform: [{ translateY }] };
    });

    return (
      <Animated.View style={[styles.headerContainer, animatedContainerStyle]}>
        {/* BACKGROUND DECORATIVO CAMADA POR CAMADA */}
        <View style={StyleSheet.absoluteFill}>
          {/* Bolas Grandes (Bubbles) */}
          <FloatingShape
            type="circle"
            style={{
              top: -20,
              left: -30,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: THEME.secondary,
              opacity: 0.2,
            }}
          />
          <FloatingShape
            type="circle"
            style={{
              bottom: -40,
              right: -20,
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: THEME.accent,
              opacity: 0.15,
            }}
          />

          {/* Confetes Coloridos Variados */}
          <FloatingShape
            style={{
              top: 50,
              left: '25%',
              width: 25,
              height: 10,
              backgroundColor: THEME.accent,
            }}
            delay={200}
          />
          <FloatingShape
            style={{
              top: 100,
              right: '10%',
              width: 15,
              height: 15,
              backgroundColor: '#FFF',
              borderRadius: 3,
            }}
            delay={800}
          />
          <FloatingShape
            style={{
              bottom: 80,
              left: '10%',
              width: 20,
              height: 8,
              backgroundColor: THEME.secondary,
              borderRadius: 10,
            }}
            delay={400}
          />
          <FloatingShape
            style={{
              top: 150,
              left: '45%',
              width: 12,
              height: 12,
              backgroundColor: THEME.accent,
              borderRadius: 6,
            }}
            delay={1200}
          />
          <FloatingShape
            style={{
              top: 20,
              right: '30%',
              width: 30,
              height: 6,
              backgroundColor: '#FFF',
              opacity: 0.4,
            }}
            delay={100}
          />

          {/* Serpentinas (Linhas) */}
          <View
            style={[
              styles.serpentina,
              { top: 60, right: 50, transform: [{ rotate: '45deg' }] },
            ]}
          />
          <View
            style={[
              styles.serpentina,
              { top: 120, left: 30, backgroundColor: THEME.accent, width: 40 },
            ]}
          />
        </View>

        <View style={styles.headerContent}>
          <Animated.View style={[styles.topRow, animatedLogoStyle]}>
            <View>
              <Text style={styles.brandTitle}>
                Pula<Text style={{ color: THEME.secondary }}>Zé</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={onOpenSettings}
            >
              <Icon name="cog-outline" size={24} color={THEME.textTitle} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.searchWrapper, animatedSearchStyle]}>
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={22} color={THEME.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Encontre seu bloco..."
                placeholderTextColor={THEME.textLight}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.calendarWrapper, animatedCalendarStyle]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
            >
              {calendar.map((item, index) => {
                const isSelected = selectedDates.includes(item.fullDate);
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleDate(item.fullDate)}
                    style={[
                      styles.dateChip,
                      isSelected
                        ? styles.dateChipActive
                        : styles.dateChipInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateTextWeek,
                        { color: isSelected ? '#FFF' : THEME.textBody },
                      ]}
                    >
                      {item.weekDay}
                    </Text>
                    <Text
                      style={[
                        styles.dateTextDay,
                        { color: isSelected ? '#FFF' : THEME.textTitle },
                      ]}
                    >
                      {item.day}
                    </Text>
                    {isSelected && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: THEME.primary,
    paddingTop: Platform.OS === 'ios' ? 55 : 35,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 12,
    overflow: 'hidden',
  },
  headerContent: { flex: 1, alignItems: 'center' },
  shapeBase: { position: 'absolute', opacity: 0.6 },
  serpentina: {
    position: 'absolute',
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: THEME.textTitle,
    letterSpacing: -1.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.textBody,
    letterSpacing: 3,
    marginTop: -5,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchWrapper: { height: 52, zIndex: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: THEME.textTitle,
  },
  calendarWrapper: { width: '100%', marginTop: 15, height: 75 },
  dateChip: {
    width: 52,
    height: 65,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dateChipActive: {
    backgroundColor: THEME.secondary,
    borderColor: THEME.secondary,
    elevation: 4,
    shadowColor: THEME.secondary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dateChipInactive: { backgroundColor: 'rgba(255,255,255,0.6)' },
  dateTextWeek: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  dateTextDay: { fontSize: 20, fontWeight: '800' },
  activeDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
});

export default HomeHeader;

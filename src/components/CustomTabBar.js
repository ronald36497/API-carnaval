import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useDerivedValue,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/Ionicons';

import COR from '../constants/cor';
import { useTabBarVisibility } from '../context/visualizarTabBar';

const TAB_BAR_HEIGHT = 70;
const TAB_BAR_RADIUS = 20;
const COLLAPSED_SIZE = 60;

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { width } = useWindowDimensions();
  const { visibilityAnimation, setVisibility } = useTabBarVisibility();

  const tabBarWidth = width - 40;
  const tabWidth = tabBarWidth / state.routes.length;

  const springValue = useDerivedValue(() =>
    withSpring(visibilityAnimation.value, { damping: 18, stiffness: 120 }),
  );

  const isCollapsed = useDerivedValue(() => visibilityAnimation.value < 0.5);

  const containerStyle = useAnimatedStyle(() => {
    const targetX = (width - COLLAPSED_SIZE) / 2;

    return {
      // 1. ADICIONE a animação para a altura (height)
      height: interpolate(
        springValue.value,
        [0, 1], // [estado recolhido, estado expandido]
        [COLLAPSED_SIZE, TAB_BAR_HEIGHT], // altura vai de 60 para 70
      ),
      width: interpolate(
        springValue.value,
        [0, 1],
        [COLLAPSED_SIZE, tabBarWidth],
      ),
      borderRadius: interpolate(
        springValue.value,
        [0, 1],
        [COLLAPSED_SIZE / 2, TAB_BAR_RADIUS],
      ),
      left: interpolate(springValue.value, [0, 1], [targetX, 20]),
      backgroundColor:
        springValue.value < 0.5 ? COR.verdeLogo : 'rgba(20,20,20,0.6)',
    };
  });

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(springValue.value, [0.5, 1], [0, 1]),
    transform: [{ scale: springValue.value }],
  }));

  const iconCollapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(springValue.value, [0, 0.5], [1, 0]),
    transform: [{ scale: 1 - springValue.value }],
  }));

  const collapsedIconAnimatedProps = useAnimatedProps(() => {
    return {
      pointerEvents: springValue.value > 0.5 ? 'none' : 'auto',
    };
  });

  const blurStyle = useAnimatedStyle(() => ({
    opacity: springValue.value,
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(state.index * tabWidth) }],
  }));

  const handleExpand = () => {
    if (isCollapsed.value) setVisibility(true);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, containerStyle]}>
        {Platform.OS === 'ios' && (
          <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
            <BlurView style={styles.blurView} blurType="dark" blurAmount={15} />
          </Animated.View>
        )}

        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <Animated.View
            style={[
              styles.activeIndicator,
              { width: tabWidth },
              indicatorStyle,
            ]}
          />
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;

            // Dentro do map das routes no seu CustomTabBar
            let iconName;
            switch (route.name) {
              case 'Home':
                iconName = isFocused ? 'home' : 'home-outline';
                break;
              case 'Buscar':
                iconName = isFocused ? 'search' : 'search-outline';
                break;
              case 'Evento': // Nossa aba de favoritos
                iconName = isFocused ? 'heart' : 'heart-outline';
                break;
              case 'Perfil': // Nossa aba de configurações
                iconName = isFocused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'ellipse-outline';
            }

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
              >
                <Icon name={iconName} size={24} color={COR.branco} />
                <Text style={styles.label}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        <Animated.View
          style={[styles.collapsedIconContainer, iconCollapsedStyle]}
          animatedProps={collapsedIconAnimatedProps}
        >
          <TouchableOpacity onPress={handleExpand}>
            <Icon name="grid-outline" size={28} color={COR.branco} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + 50,
    alignItems: 'flex-start',
  },
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    // 2. REMOVA a altura fixa daqui, pois agora ela é controlada pela animação
    // height: TAB_BAR_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
    color: COR.branco,
  },
  activeIndicator: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderRadius: TAB_BAR_RADIUS,
  },
  collapsedIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default CustomTabBar;

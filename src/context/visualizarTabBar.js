import React, { createContext, useContext } from 'react';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

const TabBarVisibilityContext = createContext(null);

export const TabBarVisibilityProvider = ({ children }) => {
  const visibilityAnimation = useSharedValue(1); // 1 = visível, 0 = escondido (iniciando visível)

  // Esta função será chamada por eventos no Thread JS (ex: um clique de botão)
  const setVisibility = visible => {
    visibilityAnimation.value = withTiming(visible ? 1 : 0, { duration: 250 });
  };

  return (
    <TabBarVisibilityContext.Provider
      value={{ visibilityAnimation, setVisibility }}
    >
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => {
  const context = useContext(TabBarVisibilityContext);
  if (!context) {
    throw new Error(
      'useTabBarVisibility deve ser usado dentro de um TabBarVisibilityProvider',
    );
  }
  return context;
};

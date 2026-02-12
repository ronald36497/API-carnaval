import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBarVisibilityProvider } from '../context/visualizarTabBar';
import CustomTabBar from '../components/CustomTabBar';

// Importe as telas das pastas que criamos no começo
import Home from './Home'; // Verifique se dentro de Home tem um index.js
import Buscar from './Buscar';
import Favoritos from './Favoritos/index';

const Tab = createBottomTabNavigator();

// O nome da função deve ser EXATAMENTE o que você importa no Routes
const HomeTabs = () => {
  return (
    <TabBarVisibilityProvider>
      <Tab.Navigator
        initialRouteName="Home"
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={Home} />
        {/* <Tab.Screen name="Buscar" component={Buscar} /> */}
        <Tab.Screen name="Favorito" component={Favoritos} />
        {/* <Tab.Screen name="Perfil" component={Configuracao} /> */}
      </Tab.Navigator>
    </TabBarVisibilityProvider>
  );
};

export default HomeTabs; // <--- O ERRO DEVE ESTAR AQUI! Garanta que essa linha existe.

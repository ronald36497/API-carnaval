import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeTabs from '../screens/HomeTabs'; // Componente que une as 4 abas

const Stack = createNativeStackNavigator();

export default function Routes() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{ headerShown: false }}
      >
        {/* Rota principal com as abas animadas */}
        <Stack.Screen name="Main" component={HomeTabs} />

        {/* Tela de Detalhes (Abre por cima de tudo) */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

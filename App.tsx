import React from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

// Importe seus Providers e as Rotas
import { FavoritesProvider } from './src/context/FavoritesContext';
import Routes from './src/routes'; 

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      {/* PaperProvider garante que os componentes do react-native-paper funcionem */}
      <PaperProvider>
        {/* FavoritesProvider deixa os favoritos disponíveis em todo o app */}
        {/* <FavoritesProvider> */}
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor="transparent" 
            translucent 
          />
          <Routes />
        {/* </FavoritesProvider> */}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
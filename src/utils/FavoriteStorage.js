import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@pulaze:favorites';

export const FavoriteStorage = {
  toggleFavorite: async bloco => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = stored ? JSON.parse(stored) : [];

      const index = favorites.findIndex(item => item.id === bloco.id);
      let isNowFavorite = false;

      if (index >= 0) {
        favorites.splice(index, 1);
        isNowFavorite = false;
      } else {
        favorites.push(bloco);
        isNowFavorite = true;
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return isNowFavorite;
    } catch (e) {
      console.error('Storage Error:', e);
      return false;
    }
  },

  getFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  isFavorite: async id => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (!stored) return false;
      const favorites = JSON.parse(stored);
      return favorites.some(item => item.id === id);
    } catch (e) {
      return false;
    }
  },
};

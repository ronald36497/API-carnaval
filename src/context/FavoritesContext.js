import React, { createContext, useState, useEffect, useContext } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  // Carrega os favoritos ao abrir o app (Síncrono com MMKV!)
  useEffect(() => {
    try {
      const storedFavorites = storage.getString('user.favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  }, []);

  const toggleFavorite = bloco => {
    try {
      let newFavorites = [...favorites];
      const index = newFavorites.findIndex(f => f.id === bloco.id);
      if (index > -1) {
        // Remove se já for favorito
        newFavorites.splice(index, 1);
      } else {
        // Adiciona se não for
        newFavorites.push(bloco);
      }
      setFavorites(newFavorites);
      storage.set('user.favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
    }
  };

  const isFavorite = id => favorites.some(f => f.id === id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  // Se não estiver dentro do provider, retorna um valor padrão
  if (!context) {
    return {
      favorites: [],
      toggleFavorite: () => {},
      isFavorite: () => false,
    };
  }
  return context;
};

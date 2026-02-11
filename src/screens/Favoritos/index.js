import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, IconButton, Avatar } from 'react-native-paper';
import { useFavorites } from '../../context/FavoritesContext';

const Favoritos = () => {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Meus Blocos 💖
      </Text>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={styles.card} mode="outlined">
            <Card.Title
              title={item.nome}
              subtitle={`${item.data} - ${item.periodo.toUpperCase()}`}
              left={props => (
                <Avatar.Icon
                  {...props}
                  icon="star"
                  backgroundColor="#fff000"
                  color="#000"
                />
              )}
              right={props => (
                <IconButton
                  icon="heart-broken"
                  iconColor="#ff4757"
                  onPress={() => toggleFavorite(item)}
                />
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium">📍 {item.local}</Text>
              <Text variant="bodySmall" style={styles.bairroText}>
                {item.bairro}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">
              Você ainda não favoritou nenhum bloco.
            </Text>
            <Text variant="displaySmall">🎭</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd', padding: 10 },
  title: {
    marginVertical: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ff00ff',
  },
  listContent: { paddingBottom: 20 },
  card: { marginBottom: 10, borderColor: '#ff00ff55' },
  bairroText: { color: '#666', fontStyle: 'italic' },
  emptyContainer: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
});

export default Favoritos;

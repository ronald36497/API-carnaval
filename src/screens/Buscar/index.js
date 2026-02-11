import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Searchbar, Card, Text, Badge, IconButton } from 'react-native-paper';
import { useBlocos } from '../../hooks/useBlocos';

const Buscar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Passamos o 'q' para o hook, que vai disparar a busca na sua API
  const { blocos, loading } = useBlocos({ q: searchQuery });

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Qual bloco você quer?"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        loading={loading}
      />

      <FlatList
        data={blocos}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.nome}
              subtitle={`${item.data} • ${item.bairro}`}
              left={props => (
                <IconButton {...props} icon="music-note" iconColor="#ff00ff" />
              )}
              right={props => (
                <IconButton
                  {...props}
                  icon="heart-outline"
                  onPress={() => console.log('Favoritar')}
                />
              )}
            />
            <Card.Content>
              <View style={styles.row}>
                <Badge style={styles.caosBadge}>{item.nivel_caos}</Badge>
                <Text variant="bodySmall"> 🕒 {item.hora}</Text>
              </View>
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                📍 {item.local}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  searchBar: { marginBottom: 15, borderRadius: 10, backgroundColor: '#f0f0f0' },
  card: { marginBottom: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center' },
  caosBadge: { backgroundColor: '#ff00ff', color: '#fff', fontWeight: 'bold' },
});

export default Buscar;

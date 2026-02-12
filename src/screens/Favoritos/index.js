import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FavoriteStorage } from '../../utils/FavoriteStorage';

const Favoritos = ({ navigation }) => {
  const [list, setList] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const load = async () => {
        const data = await FavoriteStorage.getFavorites();
        setList(data);
      };
      load();
    }
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.favCard}
      onPress={() => navigation.navigate('BlocoDetails', { bloco: item })}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.blocoName}>{item.nome}</Text>
          <Text style={styles.blocoInfo}>
            {item.bairro} • {item.hora}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#009639" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Meus <Text style={{ color: '#009639' }}>Favoritos</Text>
        </Text>
      </View>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="heart-off-outline" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>Nenhum bloco salvo.</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  favCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  blocoName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  blocoInfo: { fontSize: 14, color: '#64748B', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94A3B8', marginTop: 10 },
});

export default Favoritos;

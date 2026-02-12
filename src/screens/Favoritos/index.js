import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FavoriteStorage } from '../../utils/FavoriteStorage'; // Ajuste o caminho
import { THEME } from '../../constants/theme'; // Ajuste o caminho
import AnimatedBackground from '../../components/AnimatedBackground'; // Ajuste o caminho

// --- CARD DE FAVORITO ESTILIZADO ---
const FavoriteCard = ({ item, onPress, onRemove }) => {
  // Formatação simples da data/hora
  const [hora] = (item.hora || '00:00').split(':');

  // Extrair dia e mês da data original se existir
  let dataFormatada = 'Data a definir';
  console.log(item, 'oie');
  if (item.originalDate) {
    const dateObj = new Date(item.originalDate);
    const dia = dateObj.getUTCDate().toString().padStart(2, '0');
    const mes = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    dataFormatada = `${dia}/${mes}`;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => onPress(item)}
    >
      {/* Detalhe decorativo no fundo (Blob estático para performance) */}
      <View style={styles.cardBlob} />

      <View style={styles.cardContent}>
        {/* Coluna da Esquerda: Horário e Data */}
        <View style={styles.timeColumn}>
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>{hora}h</Text>
          </View>
          {/* <Text style={styles.dateText}>{dataFormatada}</Text> */}
        </View>

        {/* Coluna do Meio: Informações */}
        <View style={styles.infoColumn}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.nome}
          </Text>

          <View style={styles.locationRow}>
            <Icon name="map-marker" size={14} color={THEME.secondary} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.bairro}
            </Text>
          </View>
        </View>

        {/* Coluna da Direita: Ação (Remover) */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="heart" size={24} color={THEME.live} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const Favoritos = ({ navigation }) => {
  const [list, setList] = useState([]);

  // Carrega a lista toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const loadFavorites = async () => {
    const data = await FavoriteStorage.getFavorites();
    // Ordenar por horário/data se quiser
    setList(data.reverse()); // Mostra os adicionados recentemente primeiro
  };

  const handleRemove = async item => {
    Alert.alert(
      'Remover Favorito',
      `Deseja remover "${item.nome}" da sua lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await FavoriteStorage.removeFavorite(item.id);
            loadFavorites(); // Recarrega a lista
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* 1. Background Animado para manter a identidade */}
      <AnimatedBackground />

      {/* 2. Header Personalizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Meus <Text style={styles.headerHighlight}>Favoritos</Text>
        </Text>
        <Text style={styles.headerSubtitle}>Seu roteiro da folia</Text>
      </View>

      {/* 3. Lista ou Empty State */}
      {list.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Icon name="heart-broken" size={40} color={THEME.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sua lista está vazia</Text>
          <Text style={styles.emptyText}>
            Navegue pela agenda e favorite os blocos que você não quer perder!
          </Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.goBackText}>Explorar Blocos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={bloco => navigation.navigate('BlocoDetails', { bloco })}
              onRemove={handleRemove}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container principal transparente para ver o AnimatedBackground
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // --- HEADER ---
  header: {
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: THEME.textTitle,
    letterSpacing: -1,
  },
  headerHighlight: {
    color: THEME.secondary, // Laranja do tema
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.textBody,
    marginTop: 4,
    fontWeight: '600',
  },

  // --- LISTA ---
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // --- CARD ESTILIZADO ---
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    // Sombras suaves parecidas com a Home
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
  },
  cardBlob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.primaryLight, // Amarelo claro
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  // Coluna da Esquerda (Tempo)
  timeColumn: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  timeBadge: {
    backgroundColor: THEME.textTitle,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 4,
  },
  timeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textLight,
  },

  // Coluna do Meio (Info)
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textTitle,
    marginBottom: 6,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: THEME.textBody,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Coluna da Direita (Ação)
  removeButton: {
    padding: 8,
    backgroundColor: '#FEF2F2', // Fundo vermelho bem claro
    borderRadius: 12,
    marginLeft: 8,
  },

  // --- EMPTY STATE ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textTitle,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: THEME.textBody,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  goBackButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: THEME.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goBackText: {
    color: THEME.textTitle,
    fontWeight: '800',
    fontSize: 14,
  },
});

export default Favoritos;

/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../styles/theme'; // Vamos isolar as cores depois, ou copie do seu arquivo anterior

const { width } = Dimensions.get('window');

// Seu IP local (troque pelo seu IP da máquina: ex: 192.168.1.15)
const API_URL = 'http://10.0.2.2:3000/api';

export default function BlocoDetalhes({ route, navigation }) {
  const { blocoId } = route.params;
  const [bloco, setBloco] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetalhes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDetalhes = async () => {
    try {
      const response = await fetch(`${API_URL}/blocos/${blocoId}`);
      const data = await response.json();
      setBloco(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirLink = async url => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      // eslint-disable-next-line no-alert
      alert('App não instalado. Tentando abrir no navegador...');
      Linking.openURL(url); // Tenta forçar ou abrir fallback
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!bloco) return null;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header com Imagem ou Gradiente */}
      <View style={styles.headerBanner}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{bloco.nome}</Text>
        <Text style={styles.headerSubtitle}>
          {bloco.bairro} • {bloco.hora_inicio}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* BOTÕES DE TRANSPORTE (O Pulo do Gato) */}
        <Text style={styles.sectionTitle}>Como chegar?</Text>
        <View style={styles.transportGrid}>
          <TouchableOpacity
            style={[styles.transportBtn, { backgroundColor: '#000' }]}
            onPress={() => abrirLink(bloco.links_transporte.uber)}
          >
            <Icon name="taxi" size={24} color="#FFF" />
            <Text style={styles.transportText}>Uber</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.transportBtn, { backgroundColor: '#F6AD0F' }]}
            onPress={() => abrirLink(bloco.links_transporte['99pop'])}
          >
            <Icon name="car" size={24} color="#FFF" />
            <Text style={styles.transportText}>99</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.transportBtn, { backgroundColor: '#33CCFF' }]}
            onPress={() => abrirLink(bloco.links_transporte.waze)}
          >
            <Icon name="waze" size={24} color="#FFF" />
            <Text style={styles.transportText}>Waze</Text>
          </TouchableOpacity>
        </View>

        {/* LISTA DE BANHEIROS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Banheiros Perto</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {bloco.proximidade?.banheiros?.length || 0}
            </Text>
          </View>
        </View>

        {bloco.proximidade?.banheiros?.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemCard}
            onPress={() => abrirLink(item.link_localizacao)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
              <Icon name="toilet" size={24} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>
                {item.endereco === 'Ponto de Banheiro próximo ao Bloco'
                  ? 'Ponto Oficial'
                  : item.endereco}
              </Text>
              <Text style={styles.itemSub}>
                {item.quantidade_cabines} cabines • {item.distancia_km} km
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
        ))}

        {/* LISTA DE HOSPITAIS */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Segurança / Saúde</Text>
        </View>

        {bloco.proximidade?.hospitais?.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
              <Icon name="hospital-box" size={24} color={COLORS.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.nome}</Text>
              <Text style={styles.itemSub}>{item.endereco}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBanner: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: { marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  // Grid Transporte
  transportGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  transportBtn: {
    width: (width - 60) / 3,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  transportText: { color: '#FFF', fontWeight: 'bold', marginTop: 5 },

  // List Items
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 1,
  },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.textDark },
  itemSub: { fontSize: 12, color: COLORS.textGray },
  badge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
});

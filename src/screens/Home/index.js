import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';

// 👇 IMPORTANDO SUA API REAIS
import { CarnavalApi } from '../services/api'; // Ajuste o caminho se necessário

// ==========================================
// 🌍 CONFIGURAÇÃO DE LOCALIZAÇÃO (SIMULADA)
// ==========================================
// Num app real, usaremos expo-location aqui
const USER_LAT = -19.932;
const USER_LNG = -43.938;

const COLORS = {
  primary: '#FF0055',
  secondary: '#6200EA',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  textDark: '#1A1A1A',
  textGray: '#6E7681',
  success: '#00C853',
  warning: '#FFAB00',
  danger: '#FF1744',
  blue: '#2962FF',
};

const { width } = Dimensions.get('window');

// ==========================================
// 🧩 COMPONENTES VISUAIS
// ==========================================

const ServiceButton = ({ icon, label, color, onPress, badge }) => (
  <TouchableOpacity
    style={styles.serviceBtn}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View
      style={[styles.serviceIconContainer, { backgroundColor: `${color}15` }]}
    >
      <Icon name={icon} size={28} color={color} />
    </View>
    <Text style={styles.serviceLabel}>{label}</Text>
    {badge && (
      <View style={styles.serviceBadge}>
        <Text style={styles.serviceBadgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const BlocoCard = ({ item, index, onPress }) => {
  // O backend retorna 'resumo_proximidade', mas seu api.js pode estar formatando diferente.
  // Vou proteger com optional chaining (?.)
  const qtdBanheiros = item.resumo_proximidade?.qtd_banheiros || 0;
  const qtdHospitais = item.resumo_proximidade?.qtd_hospitais || 0;

  // O backend retorna 'distancia_usuario_km' se passarmos lat/lon
  const distancia = item.distancia_usuario_km || item.distancia;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={styles.cardContainer}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Header do Card */}
        <View style={styles.cardHeader}>
          <View style={styles.dateTag}>
            {/* Ajuste conforme o campo que vem do seu backend (hora ou hora_inicio) */}
            <Text style={styles.dateTagText}>
              {item.hora_inicio || item.hora}
            </Text>
          </View>

          {/* Tag de Destaque */}
          {qtdHospitais > 0 ? (
            <View style={[styles.popularTag, { backgroundColor: COLORS.blue }]}>
              <Icon name="shield-check" size={14} color="#FFF" />
              <Text style={styles.popularText}>SEGURO</Text>
            </View>
          ) : (
            <View style={styles.popularTag}>
              <Icon name="fire" size={14} color="#FFF" />
              <Text style={styles.popularText}>EM ALTA</Text>
            </View>
          )}
        </View>

        {/* Conteúdo */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.nome}
          </Text>

          <View style={styles.cardRow}>
            <Icon name="map-marker-outline" size={16} color={COLORS.textGray} />
            <Text style={styles.cardLocation} numberOfLines={1}>
              {item.logradouro} • {item.bairro}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Footer */}
          <View style={styles.cardFooter}>
            {qtdBanheiros > 0 ? (
              <View style={styles.footerTag}>
                <Icon name="toilet" size={14} color={COLORS.success} />
                <Text style={[styles.footerText, { color: COLORS.success }]}>
                  {qtdBanheiros} Banheiros
                </Text>
              </View>
            ) : (
              <View style={styles.footerTag}>
                <Text style={[styles.footerText, { color: COLORS.textGray }]}>
                  --
                </Text>
              </View>
            )}

            {distancia && (
              <View style={styles.footerTag}>
                <Icon name="walk" size={14} color={COLORS.textDark} />
                <Text style={styles.footerText}>{distancia} km</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ==========================================
// 📱 TELA HOME
// ==========================================
export default function Home({ navigation }) {
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // 1. Chama a rota de BLOCOS usando seu api.js
      // Passamos 'proximo: true' para ordenar por distância
      const dadosBlocos = await CarnavalApi.getBlocos({
        lat: USER_LAT,
        lon: USER_LNG,
        proximo: true,
        limit: 10, // Pega só os 10 mais perto pra Home
      });

      // O api.js retorna { total, blocos: [] } ou direto o array (dependendo do backend)
      // Vou tratar os dois casos para garantir:
      if (dadosBlocos.blocos) {
        setBlocos(dadosBlocos.blocos);
        setStats({ total: dadosBlocos.total });
      } else if (Array.isArray(dadosBlocos)) {
        setBlocos(dadosBlocos);
        setStats({ total: dadosBlocos.length });
      }
    } catch (error) {
      // O axios já loga o erro no console do api.js
      Alert.alert(
        'Erro de Conexão',
        'Verifique se o servidor (porta 3000) está rodando.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Ações dos Botões de Serviço
  const handleServico = tipo => {
    // Exemplo: Navegar para um mapa filtrado ou chamar a rota getProximoDeMim
    console.log(`Buscando serviço: ${tipo}`);
    // Futuro: navigation.navigate('MapaServicos', { tipo });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Você está em</Text>
            <TouchableOpacity style={styles.locationSelector}>
              <Text style={styles.locationText}>Savassi, BH</Text>
              <Icon name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={carregarDados}>
            <Icon name="refresh" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* HERO SECTION */}
          <View style={styles.heroSection}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>O Carnaval{'\n'}começou! 🎉</Text>
              <Text style={styles.heroSubtitle}>
                {loading
                  ? 'Buscando blocos...'
                  : `${stats.total} blocos encontrados`}
              </Text>
            </View>
            <Icon
              name="party-popper"
              size={50}
              color={`${COLORS.primary}40`}
              style={{ transform: [{ rotate: '-15deg' }] }}
            />
          </View>

          {/* SERVIÇOS RÁPIDOS (Usando suas rotas mentais) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>O que você precisa?</Text>
            <View style={styles.gridContainer}>
              <ServiceButton
                icon="toilet"
                label="Banheiro"
                color={COLORS.success}
                badge="PERTO"
                onPress={() => handleServico('BANHEIRO')}
              />
              <ServiceButton
                icon="map-search"
                label="Mapa"
                color={COLORS.blue}
                onPress={() => handleServico('MAPA')}
              />
              <ServiceButton
                icon="bus-clock"
                label="Transporte"
                color={COLORS.secondary}
                onPress={() => handleServico('TRANSPORTE')}
              />
              <ServiceButton
                icon="alert-octagon-outline"
                label="Ajuda"
                color={COLORS.danger}
                onPress={() => handleServico('SOS')}
              />
            </View>
          </View>

          {/* LISTA DE BLOCOS (Horizontal) */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Perto de Você 🔥</Text>
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={{ marginTop: 20 }}
              />
            ) : (
              <FlatList
                data={blocos}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                keyExtractor={item => (item.id || Math.random()).toString()}
                renderItem={({ item, index }) => (
                  <View style={{ width: width * 0.85, marginRight: 15 }}>
                    <BlocoCard
                      item={item}
                      index={index}
                      onPress={() =>
                        navigation.navigate('Detalhes', { blocoId: item.id })
                      }
                    />
                  </View>
                )}
              />
            )}
          </View>

          {/* BANNER EMERGÊNCIA */}
          <TouchableOpacity
            style={styles.emergencyBanner}
            onPress={() => handleServico('SAUDE')}
          >
            <View style={styles.emergencyIcon}>
              <Icon name="hospital-box-outline" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.emergencyTitle}>Postos Médicos</Text>
              <Text style={styles.emergencySubtitle}>
                Ver lista de hospitais próximos
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ==========================================
// ESTILOS (Mesmos do anterior)
// ==========================================
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLabel: { fontSize: 12, color: COLORS.textGray },
  locationSelector: { flexDirection: 'row', alignItems: 'center' },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginRight: 5,
  },
  profileBtn: { padding: 5, backgroundColor: '#F5F5F5', borderRadius: 20 },
  heroSection: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFF0F5',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD1DC',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 5,
  },
  heroSubtitle: { fontSize: 14, color: COLORS.textGray, fontWeight: '500' },
  sectionContainer: { marginBottom: 25 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  serviceBtn: {
    width: (width - 50) / 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '500',
    textAlign: 'center',
  },
  serviceBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  serviceBadgeText: { fontSize: 8, color: '#FFF', fontWeight: 'bold' },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateTagText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textDark },
  popularTag: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardLocation: {
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 4,
    flex: 1,
  },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerTag: { flexDirection: 'row', alignItems: 'center' },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    color: COLORS.textGray,
  },
  emergencyBanner: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emergencyTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  emergencySubtitle: { fontSize: 12, color: COLORS.textGray },
});

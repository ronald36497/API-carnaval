import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Circle,
  Callout,
} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { FavoriteStorage } from '../../utils/FavoriteStorage';

// Import da API
import { CarnavalApi } from '../../api/api';

const { width, height } = Dimensions.get('window');

const THEME = {
  primary: '#009639',
  bg: '#FFFFFF', // Fundo branco puro para evitar cortes
  card: '#FFFFFF',
  textTitle: '#1F2937',
  textBody: '#6B7280',
  live: '#EF4444',
  action: '#10B981',
};

const BlocoDetails = ({ route, navigation }) => {
  const { bloco } = route.params;
  const mapRef = useRef(null);

  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [showBanheiros, setShowBanheiros] = useState(true);
  const [showHospitais, setShowHospitais] = useState(true);
  const [searchRadius, setSearchRadius] = useState(0.5);
  const [services, setServices] = useState({ banheiros: [], hospitais: [] });

  const displayLat = Number(
    bloco.posicao_atual ? bloco.posicao_atual.latitude : bloco.lat,
  );
  const displayLng = Number(
    bloco.posicao_atual ? bloco.posicao_atual.longitude : bloco.lng,
  );
  const isLive = bloco.status === 'em_andamento';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weatherPromise = fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${displayLat}&longitude=${displayLng}&current_weather=true`,
        ).then(res => res.json());
        const banheirosPromise = CarnavalApi.getBanheiros({
          lat: displayLat,
          lng: displayLng,
          raio: searchRadius,
        });
        const hospitaisPromise = CarnavalApi.getHospitais({
          lat: displayLat,
          lng: displayLng,
          raio: searchRadius,
        });

        const [weatherData, banheirosData, hospitaisData] = await Promise.all([
          weatherPromise,
          banheirosPromise,
          hospitaisPromise,
        ]);

        if (weatherData?.current_weather)
          setWeather(weatherData.current_weather);
        setServices({
          banheiros: banheirosData || [],
          hospitais: hospitaisData || [],
        });
      } catch (error) {
        console.log('Erro dados:', error);
      } finally {
        setLoadingWeather(false);
      }
    };
    if (displayLat && displayLng) fetchData();
  }, [displayLat, displayLng, searchRadius]);

  const handleMapPress = e => {
    if (e.nativeEvent.action !== 'marker-press') {
      setSelectedTarget(null);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      const status = await FavoriteStorage.isFavorite(bloco.id);
      setIsFavorite(status);
    };
    checkStatus();
  }, [bloco.id]);

  const handleToggleFavorite = async () => {
    const status = await FavoriteStorage.toggleFavorite(bloco);
    setIsFavorite(status);
  };

  const handleMarkerPress = (item, type, iconName, displayName) => {
    setSelectedTarget({
      lat: Number(item.latitude || item.lat || displayLat),
      lng: Number(item.longitude || item.lng || displayLng),
      name: displayName,
      type: type,
      icon: iconName,
    });
  };

  // --- LÓGICA DE TRANSPORTE BLINDADA ---
  // --- LÓGICA DE TRANSPORTE CORRIGIDA (DIRETA) ---
  const openTransportApp = async app => {
    const lat = displayLat;
    const lng = displayLng;
    const label = encodeURIComponent(bloco.nome);

    let url = '';
    let storeUrl = '';

    // Configura os links
    if (app === 'Uber') {
      url = `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${label}`;
      storeUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/uber/id368677368'
          : 'https://play.google.com/store/apps/details?id=com.ubercab';
    } else if (app === '99') {
      url = `taxis99://map`;
      storeUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/99-motorista-e-passageiro/id553663691'
          : 'https://play.google.com/store/apps/details?id=com.taxis99';
    } else if (app === 'Waze') {
      url = `waze://?ll=${lat},${lng}&navigate=yes`;
      storeUrl =
        Platform.OS === 'ios'
          ? 'https://apps.apple.com/app/waze/id323229106'
          : 'https://play.google.com/store/apps/details?id=com.waze';
    } else if (app === 'Bus') {
      // Ônibus sempre Maps (Transit mode)
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;
      Linking.openURL(url);
      return;
    }

    // TENTA ABRIR DIRETO SEM CHECAR (canOpenURL é instável no Android)
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Se falhar (não tem o app), aí sim manda para a loja ou versão web
      Linking.openURL(storeUrl).catch(() => {
        // Fallback final se até a loja der erro (raro)
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        );
      });
    }
  };

  const openWalkingRoute = () => {
    if (!selectedTarget) return;
    const { lat, lng } = selectedTarget;
    // Força modo caminhada no Google Maps Universal
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    Linking.openURL(url);
  };

  const getWeatherIcon = code => {
    if (code >= 51) return 'weather-pouring';
    if (code <= 3) return 'weather-sunny';
    return 'weather-cloudy';
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        barStyle="dark-content"
        backgroundColor="transparent"
      />

      <View style={styles.headerAbsolute}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={THEME.textTitle} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.circleBtn,
            isFavorite && { backgroundColor: '#FEF2F2' },
          ]}
          onPress={handleToggleFavorite}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#EF4444' : THEME.textTitle}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* MAPA */}
        <View style={styles.mapHeaderContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: displayLat,
              longitude: displayLng,
              latitudeDelta: 0.012,
              longitudeDelta: 0.012,
            }}
            customMapStyle={MAP_STYLE_CLEAN}
            toolbarEnabled={false}
            showsUserLocation={true}
            onPress={handleMapPress}
          >
            {/* Bloco */}
            <Marker
              coordinate={{ latitude: displayLat, longitude: displayLng }}
              zIndex={20}
              onPress={e => {
                e.stopPropagation();
                handleMarkerPress(
                  bloco,
                  'bloco',
                  isLive ? 'music-note' : 'flag',
                  bloco.nome,
                );
              }}
            >
              <View
                style={[
                  styles.markerBase,
                  isLive ? styles.markerLive : styles.markerStart,
                ]}
              >
                <Icon
                  name={isLive ? 'music-note' : 'flag'}
                  size={20}
                  color="#FFF"
                />
              </View>
              <Callout tooltip>
                <View style={styles.calloutBubble}>
                  <Text style={styles.calloutText}>{bloco.nome}</Text>
                </View>
              </Callout>
            </Marker>

            {/* Banheiros */}
            {showBanheiros &&
              services.banheiros.map((b, i) => (
                <Marker
                  key={`wc-${i}`}
                  coordinate={{
                    latitude: Number(b.latitude),
                    longitude: Number(b.longitude),
                  }}
                  zIndex={10}
                  onPress={e => {
                    e.stopPropagation();
                    handleMarkerPress(
                      b,
                      'banheiro',
                      'toilet',
                      'Banheiro Químico',
                    );
                  }}
                >
                  <View
                    style={[styles.markerSmall, { backgroundColor: '#0EA5E9' }]}
                  >
                    <Icon name="toilet" size={12} color="#FFF" />
                  </View>
                  <Callout tooltip>
                    <View style={styles.calloutBubble}>
                      <Text style={styles.calloutText}>Banheiro</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}

            {/* Hospitais */}
            {showHospitais &&
              services.hospitais.map((h, i) => (
                <Marker
                  key={`hos-${i}`}
                  coordinate={{
                    latitude: Number(h.latitude),
                    longitude: Number(h.longitude),
                  }}
                  zIndex={10}
                  onPress={e => {
                    e.stopPropagation();
                    handleMarkerPress(
                      h,
                      'hospital',
                      'medical-bag',
                      h.nome || 'Posto Médico',
                    );
                  }}
                >
                  <View
                    style={[styles.markerSmall, { backgroundColor: '#EF4444' }]}
                  >
                    <Icon name="medical-bag" size={12} color="#FFF" />
                  </View>
                  <Callout tooltip>
                    <View style={styles.calloutBubble}>
                      <Text style={styles.calloutText}>SOS</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}

            <Circle
              center={{ latitude: displayLat, longitude: displayLng }}
              radius={searchRadius * 1000}
              fillColor={
                isLive ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 150, 57, 0.05)'
              }
              strokeColor="transparent"
            />
          </MapView>

          <View style={styles.mapFilters}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                { width: 'auto', paddingHorizontal: 10 },
              ]}
              onPress={() =>
                setSearchRadius(prev =>
                  prev === 0.5 ? 1.0 : prev === 1.0 ? 2.0 : 0.5,
                )
              }
            >
              <Text style={styles.filterText}>
                {searchRadius < 1 ? '500m' : `${searchRadius}km`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                showBanheiros && { backgroundColor: '#0EA5E9' },
              ]}
              onPress={() => setShowBanheiros(!showBanheiros)}
            >
              <Icon
                name="toilet"
                size={18}
                color={showBanheiros ? '#FFF' : '#64748B'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                showHospitais && { backgroundColor: '#EF4444' },
              ]}
              onPress={() => setShowHospitais(!showHospitais)}
            >
              <Icon
                name="medical-bag"
                size={18}
                color={showHospitais ? '#FFF' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          {isLive && (
            <View style={styles.mapLiveBadge}>
              <View style={styles.pulsingDot} />
              <Text style={styles.mapLiveText}>NO AR</Text>
            </View>
          )}
        </View>

        {/* SHEET (CONTEÚDO) */}
        <View style={styles.sheetContainer}>
          <View style={styles.headerInfo}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{bloco.nome}</Text>
              <View style={styles.locationRow}>
                <Icon name="map-marker" size={16} color={THEME.primary} />
                <Text style={styles.bairroText}>
                  {bloco.bairro} • {bloco.endereco} • {bloco.hora}
                </Text>
              </View>
            </View>
            <View style={styles.weatherBadge}>
              {loadingWeather ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Icon
                    name={getWeatherIcon(weather?.weathercode)}
                    size={20}
                    color="#1E293B"
                  />
                  <Text style={styles.weatherText}>
                    {Math.round(weather?.temperature || 28)}°
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sobre o Bloco</Text>
            <Text style={styles.description}>
              {bloco.descricao
                ? bloco.descricao
                : `O ${bloco.nome} é uma tradição do bairro ${bloco.bairro}. A concentração acontece na ${bloco.endereco}. Prepare a fantasia, chame os amigos e venha curtir com segurança!`}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Transporte</Text>
            <View style={styles.transportRow}>
              <TouchableOpacity
                style={[styles.transBtn, { backgroundColor: '#000' }]}
                onPress={() => openTransportApp('Uber')}
              >
                <Text style={styles.transBtnText}>Uber</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.transBtn, { backgroundColor: '#F59E0B' }]}
                onPress={() => openTransportApp('99')}
              >
                <Text style={styles.transBtnText}>99</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.transBtn, { backgroundColor: '#33CCFF' }]}
                onPress={() => openTransportApp('Waze')}
              >
                <Icon name="waze" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.transBtn, { backgroundColor: '#4285F4' }]}
                onPress={() => openTransportApp('Bus')}
              >
                <Icon name="bus" size={20} color="#FFF" />
                <Text style={[styles.transBtnText, { marginLeft: 5 }]}>
                  Busão
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Serviços ({searchRadius < 1 ? '500m' : searchRadius + 'km'})
            </Text>
            <View style={styles.gridServices}>
              <View style={styles.serviceBox}>
                <Icon
                  name="toilet"
                  size={24}
                  color="#0EA5E9"
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.serviceValue}>
                  {services.banheiros.length}
                </Text>
                <Text style={styles.serviceSub}>Banheiros</Text>
              </View>
              <View style={styles.serviceBox}>
                <Icon
                  name="medical-bag"
                  size={24}
                  color="#EF4444"
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.serviceValue}>
                  {services.hospitais.length}
                </Text>
                <Text style={styles.serviceSub}>Médicos</Text>
              </View>
              <View style={styles.serviceBox}>
                <Icon
                  name="weather-windy"
                  size={24}
                  color="#F59E0B"
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.serviceValue}>
                  {weather ? weather.windspeed : '--'}
                </Text>
                <Text style={styles.serviceSub}>km/h</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB - TRAÇAR ROTA */}
      {selectedTarget && (
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          style={styles.fabWrapper}
        >
          <View style={styles.fabContainerRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.fabButton}
              onPress={openWalkingRoute}
            >
              <View style={styles.fabIconBox}>
                <Icon
                  name={selectedTarget.icon || 'walk'}
                  size={24}
                  color="#FFF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fabTitle}>TRAÇAR ROTA</Text>
                <Text style={styles.fabSubtitle} numberOfLines={1}>
                  Para: {selectedTarget.name}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeFab}
              onPress={() => setSelectedTarget(null)}
            >
              <Icon name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default BlocoDetails;

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  headerAbsolute: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },

  mapHeaderContainer: { height: height * 0.5, width: '100%' },
  map: { flex: 1 },

  mapFilters: { position: 'absolute', top: 100, right: 15, gap: 10 },
  filterChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 3,
  },
  filterText: { fontSize: 10, fontWeight: 'bold', color: THEME.textTitle },

  mapLiveBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: THEME.live,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    elevation: 5,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    marginRight: 6,
  },
  mapLiveText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  markerBase: {
    padding: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  markerStart: { backgroundColor: THEME.primary },
  markerLive: {
    backgroundColor: THEME.live,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 2,
  },

  calloutBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  calloutText: { fontSize: 12, fontWeight: 'bold', color: '#333' },

  sheetContainer: {
    marginTop: -30,
    backgroundColor: '#FFFFFF', // BRANCO PURO
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 5,
    minHeight: 600,
  },

  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.textTitle,
    flex: 1,
    marginRight: 10,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  bairroText: {
    fontSize: 14,
    color: THEME.textBody,
    marginLeft: 4,
    fontWeight: '500',
  },

  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weatherText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.textTitle,
    marginLeft: 4,
  },

  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  section: { marginBottom: 25 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  addressText: { fontSize: 16, fontWeight: '600', color: THEME.textTitle },
  description: { fontSize: 15, color: THEME.textTitle, lineHeight: 24 },

  transportRow: { flexDirection: 'row', gap: 10 },
  transBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 1,
  },
  transBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  gridServices: { flexDirection: 'row', gap: 10 },
  serviceBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
  },
  serviceValue: { fontSize: 18, fontWeight: 'bold', color: THEME.textTitle },
  serviceSub: { fontSize: 11, color: THEME.textBody, marginTop: 2 },

  // FAB Rota Fixed
  fabWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 999,
  },
  fabContainerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fabButton: {
    flex: 1,
    backgroundColor: THEME.action,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: THEME.action,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fabTitle: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  fabSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  closeFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});

const MAP_STYLE_CLEAN = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

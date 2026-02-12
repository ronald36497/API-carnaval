import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
  Switch,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- API REAL ---
import { CarnavalApi } from '../../api/api';

const { width, height } = Dimensions.get('window');

// --- 🎨 TEMA NEON PREMIUM ---
const THEME = {
  primary: '#6D28D9', // Roxo Base
  primaryDark: '#4C1D95',
  primaryLight: '#A78BFA',
  secondary: '#DB2777', // Pink
  accent: '#FBBF24', // Dourado
  info: '#06B6D4', // Ciano
  bg: '#F5F3FF', // Fundo Base
  card: '#FFFFFF',
  textTitle: '#1E1B4B',
  textBody: '#4B5563',
  textLight: '#94A3B8',
  line: '#E2E8F0',
  live: '#EF4444',
  past: '#CBD5E1',
};

// --- COMPONENTE ANIMADO ---
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

// --- DATA HELPER ---
const getCarnavalDates = () => {
  const dates = [];
  const today = new Date();
  const carnavalStart = new Date('2026-02-06T12:00:00');
  let startDate = today < carnavalStart ? carnavalStart : today;
  for (let i = 0; i < 10; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push({
      fullDate: d.toISOString().split('T')[0],
      weekDay: d
        .toLocaleDateString('pt-BR', { weekday: 'short' })
        .replace('.', '')
        .toUpperCase(),
      day: d.getDate(),
    });
  }
  return dates;
};

// --- 1. BACKGROUND ANIMADO (ORBITAL BLOBS) ---
const AnimatedBackground = React.memo(() => {
  const tX1 = useSharedValue(0);
  const tY1 = useSharedValue(0);
  const tX2 = useSharedValue(0);
  const tY2 = useSharedValue(0);
  const tX3 = useSharedValue(0);

  useEffect(() => {
    const config = { duration: 8000, easing: Easing.inOut(Easing.sin) };
    tX1.value = withRepeat(
      withSequence(withTiming(100, config), withTiming(-50, config)),
      -1,
      true,
    );
    tY1.value = withRepeat(
      withSequence(withTiming(-50, config), withTiming(50, config)),
      -1,
      true,
    );
    tX2.value = withRepeat(
      withSequence(
        withTiming(-80, { duration: 9000 }),
        withTiming(40, { duration: 9000 }),
      ),
      -1,
      true,
    );
    tY2.value = withRepeat(
      withSequence(
        withTiming(60, { duration: 7000 }),
        withTiming(-60, { duration: 7000 }),
      ),
      -1,
      true,
    );
    tX3.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 15000, easing: Easing.linear }),
        withTiming(-width, { duration: 0 }),
      ),
      -1,
      false,
    );
  }, []);

  const styleBlob1 = useAnimatedStyle(() => ({
    transform: [{ translateX: tX1.value }, { translateY: tY1.value }],
  }));
  const styleBlob2 = useAnimatedStyle(() => ({
    transform: [{ translateX: tX2.value }, { translateY: tY2.value }],
  }));
  const styleLine = useAnimatedStyle(() => ({
    transform: [{ translateX: tX3.value }, { rotate: '45deg' }],
  }));

  return (
    <View style={styles.bgContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.bgBlob,
          {
            backgroundColor: 'rgba(139, 92, 246, 0.15)',
            top: -100,
            left: -50,
            width: 400,
            height: 400,
          },
          styleBlob1,
        ]}
      />
      <Animated.View
        style={[
          styles.bgBlob,
          {
            backgroundColor: 'rgba(219, 39, 119, 0.1)',
            top: height / 3,
            right: -100,
            width: 300,
            height: 300,
          },
          styleBlob2,
        ]}
      />
      <View
        style={[
          styles.bgBlob,
          {
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            bottom: -50,
            left: -50,
            width: 350,
            height: 350,
          },
        ]}
      />
      <View style={styles.bgGrid} />
      <Animated.View style={[styles.bgLightBeam, styleLine]} />
    </View>
  );
});

// --- 2. PULSING DOT ---
const PulsingDot = React.memo(() => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.8, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return (
    <View style={styles.pulsingContainer}>
      <Animated.View style={[styles.pulsingRing, animatedStyle]} />
      <View style={styles.pulsingCore} />
    </View>
  );
});

const BlocoTimelineCard = React.memo(({ item, onPress, showDateLabel }) => {
  const isLive =
    item.status === 'em_andamento' || item.timeStatus === 'current';
  const isPast = item.timeStatus === 'past';

  const dotColor = isLive ? THEME.live : isPast ? THEME.past : THEME.primary;
  const borderColor = isLive
    ? 'rgba(239, 68, 68, 0.3)'
    : isPast
    ? 'transparent'
    : 'rgba(139, 92, 246, 0.3)';
  const glowColor = isLive ? '#FECACA' : isPast ? '#F1F5F9' : '#EDE9FE';

  // Format Date
  const dateObj = new Date(item.originalDate);
  const day = dateObj.getUTCDate().toString().padStart(2, '0');
  const monthNames = [
    'JAN',
    'FEV',
    'MAR',
    'ABR',
    'MAI',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OUT',
    'NOV',
    'DEZ',
  ];
  const month = monthNames[dateObj.getUTCMonth()];
  const dateLabel = `${day} ${month}`;

  // Animation only for live to save resources
  const glowOpacity = useSharedValue(isLive ? 0.6 : 0.4);
  useEffect(() => {
    if (isLive) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 }),
          withTiming(0.4, { duration: 1500 }),
        ),
        -1,
        true,
      );
    } else {
      glowOpacity.value = 0.5;
    }
  }, [isLive]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: isLive ? 1.2 : 1 }],
  }));

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDotContainer}>
          {isLive ? (
            <PulsingDot />
          ) : (
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: dotColor,
                  borderColor: isPast ? '#E2E8F0' : '#FFF',
                  borderWidth: 2,
                },
              ]}
            />
          )}
        </View>
        <View
          style={[
            styles.timelineLine,
            isLive && { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
            isPast && { backgroundColor: '#F1F5F9' },
          ]}
        />
      </View>

      <View style={{ flex: 1, paddingBottom: 18 }}>
        <TouchableOpacity
          activeOpacity={0.92}
          style={[
            styles.card,
            { borderColor: borderColor },
            isPast && styles.cardPast,
          ]}
          onPress={() => onPress(item)}
        >
          {/* Internal Glow */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View
              style={[
                styles.cardInternalBlob,
                { backgroundColor: glowColor },
                animatedGlowStyle,
              ]}
            />
            {!isPast && <View style={styles.cardInternalPattern} />}
          </View>

          {showDateLabel && (
            <View
              style={[
                styles.internalDateBadge,
                isLive
                  ? styles.internalDateBadgeLive
                  : isPast
                  ? styles.internalDateBadgePast
                  : styles.internalDateBadgeFuture,
              ]}
            >
              <Text
                style={[
                  styles.internalDateText,
                  isLive && { color: '#7F1D1D' },
                  isPast && { color: '#64748B' },
                ]}
              >
                {dateLabel}
              </Text>
            </View>
          )}

          <View
            style={[styles.cardContent, showDateLabel && { paddingRight: 45 }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTagsRow}>
                {isLive && (
                  <View style={styles.liveTag}>
                    <View style={styles.liveIndicator} />
                    <Text style={styles.liveTagText}>AO VIVO</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bairroBadge,
                    isLive && { backgroundColor: 'rgba(255,255,255,0.7)' },
                    isPast && { backgroundColor: '#F1F5F9' },
                  ]}
                >
                  <Text
                    style={[
                      styles.bairroBadgeText,
                      isPast && { color: THEME.textLight },
                    ]}
                  >
                    {item.bairro.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.cardTitle, isPast && { color: THEME.textLight }]}
                numberOfLines={2}
              >
                {item.nome}
              </Text>
            </View>

            <View style={styles.addressRow}>
              <Icon
                name="map-marker-radius-outline"
                size={16}
                color={isPast ? THEME.textLight : THEME.primary}
              />
              <Text
                style={[
                  styles.cardAddress,
                  isPast && { color: THEME.textLight },
                ]}
                numberOfLines={1}
              >
                {item.endereco}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              {item.banheiros > 0 || item.hospitais > 0 ? (
                <View style={styles.infraIcons}>
                  {item.banheiros > 0 && (
                    <View
                      style={[
                        styles.infraTag,
                        isPast && { backgroundColor: '#F8FAFC' },
                      ]}
                    >
                      <Icon
                        name="toilet"
                        size={12}
                        color={isPast ? THEME.textLight : THEME.info}
                      />
                      <Text
                        style={[
                          styles.infraText,
                          { color: isPast ? THEME.textLight : THEME.info },
                        ]}
                      >
                        Banheiros
                      </Text>
                    </View>
                  )}
                  {item.hospitais > 0 && (
                    <View
                      style={[
                        styles.infraTag,
                        {
                          backgroundColor: isPast ? '#F8FAFC' : '#FEF2F2',
                          borderColor: isPast ? 'transparent' : '#FECACA',
                        },
                      ]}
                    >
                      <Icon
                        name="medical-bag"
                        size={12}
                        color={isPast ? THEME.textLight : THEME.live}
                      />
                      <Text
                        style={[
                          styles.infraText,
                          { color: isPast ? THEME.textLight : THEME.live },
                        ]}
                      >
                        SOS
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              {!isPast ? (
                <Icon
                  name={isLive ? 'chevron-right' : 'party-popper'}
                  size={20}
                  color={isLive ? THEME.live : THEME.primaryLight}
                  style={{ opacity: 0.8 }}
                />
              ) : (
                <Icon name="check" size={18} color={THEME.textLight} />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// --- HEADER ---
const Header = React.memo(
  ({
    searchText,
    setSearchText,
    calendar,
    selectedDates,
    toggleDate,
    onOpenSettings,
    scrollY,
  }) => {
    const headerLogoStyle = useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, 50], [1, 0], Extrapolation.CLAMP),
      height: interpolate(scrollY.value, [0, 60], [60, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            0,
            60,
            0,
            -20,
            Extrapolation.CLAMP,
          ),
        },
      ],
      overflow: 'hidden',
    }));

    const headerSearchStyle = useAnimatedStyle(() => {
      const hasText = searchText.length > 0;
      return {
        // Se tiver texto, mantém visível, senão colapsa ao rolar
        height: hasText
          ? 50
          : interpolate(scrollY.value, [60, 110], [50, 0], Extrapolation.CLAMP),
        opacity: hasText
          ? 1
          : interpolate(scrollY.value, [60, 90], [1, 0], Extrapolation.CLAMP),
        marginBottom: hasText
          ? 10
          : interpolate(scrollY.value, [60, 110], [10, 0], Extrapolation.CLAMP),
        overflow: 'hidden',
      };
    });

    return (
      <View style={styles.headerContainer}>
        <View style={StyleSheet.absoluteFill}>
          <View
            style={[
              styles.decorBlob,
              {
                backgroundColor: '#8B5CF6',
                width: 200,
                height: 200,
                top: -50,
                left: -50,
              },
            ]}
          />
          <View
            style={[
              styles.decorBlob,
              {
                backgroundColor: THEME.secondary,
                width: 150,
                height: 150,
                bottom: -20,
                right: -20,
                opacity: 0.4,
              },
            ]}
          />
          <View style={styles.glassOverlay} />
        </View>
        <View style={styles.headerContent}>
          <Animated.View style={headerLogoStyle}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.brandTitle}>
                  Pula
                  <Text style={[styles.brandAccent, styles.logoShadow]}>
                    Zé
                  </Text>
                </Text>
                <Text style={styles.brandSubtitle}>O SEU GUIA DA FOLIA</Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={onOpenSettings}
              >
                <Icon name="cog-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* INPUT DE BUSCA - LOCALIZADO ABAIXO DO TEXTO DO GUIA */}
          <Animated.View style={headerSearchStyle}>
            <View style={styles.searchContainer}>
              <Icon
                name="magnify"
                size={20}
                color={THEME.primary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Busque em todos os dias..."
                placeholderTextColor={THEME.textLight}
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Icon name="close-circle" size={18} color={THEME.textLight} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <View style={{ height: 85 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10, gap: 10 }}
            >
              {calendar.map((item, index) => {
                const isSelected = selectedDates.includes(item.fullDate);
                // Se estiver buscando, as datas ficam visualmente desabilitadas ou com opacidade menor para focar na busca global
                const isSearching = searchText.length > 0;

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => toggleDate(item.fullDate)}
                    style={[
                      styles.dateChip,
                      isSelected
                        ? styles.dateChipActive
                        : styles.dateChipInactive,
                      isSearching && { opacity: 0.5 },
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Icon name="star" size={8} color="#FFF" />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.dateTextWeek,
                        isSelected
                          ? { color: '#FFF' }
                          : { color: 'rgba(255,255,255,0.7)' },
                      ]}
                    >
                      {item.weekDay}
                    </Text>
                    <Text
                      style={[
                        styles.dateTextDay,
                        isSelected
                          ? { color: THEME.accent }
                          : { color: '#FFF' },
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  },
);

// --- MAIN SCREEN ---
export default function Home({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [blocos, setBlocos] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedBairro, setSelectedBairro] = useState(null);
  const [sortBy, setSortBy] = useState('time');
  const [bairroSearch, setBairroSearch] = useState('');
  const calendar = useMemo(() => getCarnavalDates(), []);
  const [selectedDates, setSelectedDates] = useState([calendar[0].fullDate]);

  const toggleDate = useCallback(
    date => {
      // Limpa a busca ao trocar de data para voltar ao contexto de filtro por dia
      if (searchText.length > 0) setSearchText('');

      if (selectedDates.includes(date)) {
        if (selectedDates.length === 1) return;
        setSelectedDates(prev => prev.filter(d => d !== date));
      } else {
        setSelectedDates(prev => [...prev, date]);
      }
    },
    [selectedDates, searchText],
  );

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // --- LÓGICA DE BUSCA GLOBAL OTIMIZADA ---
  useEffect(() => {
    let isActive = true;
    let timer = null;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // --- MUDANÇA PRINCIPAL: LÓGICA DE SELEÇÃO DE DATAS ---
        // Se houver texto na busca (pelo menos 2 chars), busca em TODO o calendário.
        // Se não, busca apenas nas datas selecionadas (selectedDates).
        let datesToFetch = selectedDates;
        const isGlobalSearch = searchText.trim().length >= 2;

        if (isGlobalSearch) {
          // Pega todas as datas do calendário para buscar o bloco em qualquer dia
          datesToFetch = calendar.map(c => c.fullDate);
        }

        const promises = datesToFetch.map(date =>
          CarnavalApi.getBlocos({
            lat: -19.924,
            lon: -43.935,
            data: date,
          }).then(res => res.map(b => ({ ...b, originalDate: date }))),
        );

        const results = await Promise.all(promises);
        const allBlocosRaw = results.flat();

        if (!isActive) return;

        const now = new Date();
        const currentHour = now.getHours();
        const todayString = now.toISOString().split('T')[0];

        const normalized = allBlocosRaw.map((item, index) => {
          const horaBloco = (
            item.hora_inicio ||
            item.hora ||
            '00:00'
          ).substring(0, 5);
          const [hStr] = horaBloco.split(':');
          const h = parseInt(hStr, 10);
          const isToday = item.originalDate === todayString;
          let timeStatus = 'future';
          if (isToday) {
            if (h < currentHour - 2) timeStatus = 'past';
            else if (h >= currentHour - 2 && h <= currentHour)
              timeStatus =
                h === currentHour || h === currentHour - 1 ? 'current' : 'past';
          } else {
            if (item.originalDate < todayString) timeStatus = 'past';
          }
          const mockLive = isToday && h === currentHour && index % 5 === 0;
          const uniqueKey = `${item.id || 'temp'}_${
            item.originalDate
          }_${horaBloco}_${index}`;

          const dateObj = new Date(item.originalDate);
          const weekDay = dateObj
            .toLocaleDateString('pt-BR', { weekday: 'short' })
            .replace('.', '')
            .toUpperCase();

          return {
            ...item,
            uniqueKey,
            id: item.id || uniqueKey,
            nome: item.nome || 'Bloco sem nome',
            hora: horaBloco,
            weekDay,
            endereco: item.logradouro
              ? `${item.logradouro}, ${item.numero || ''}`
              : 'Local a definir',
            bairro: item.bairro || 'Centro',
            banheiros: item.servicos_proximos?.qtd_banheiros || 0,
            hospitais: item.servicos_proximos?.qtd_hospitais || 0,
            status: mockLive ? 'em_andamento' : 'agendado',
            timeStatus: timeStatus,
          };
        });

        const uniqueMap = new Map();
        normalized.forEach(item => {
          const logicKey = `${item.id}_${item.originalDate}`;
          if (!uniqueMap.has(logicKey)) uniqueMap.set(logicKey, item);
        });
        const finalData = Array.from(uniqueMap.values());

        // Ordenação Inicial: Data, depois Hora
        finalData.sort((a, b) => {
          if (a.originalDate !== b.originalDate)
            return a.originalDate.localeCompare(b.originalDate);
          return a.hora.localeCompare(b.hora);
        });
        setBlocos(finalData);
      } catch (error) {
        console.error(error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    // DEBOUNCE: Espera 500ms após o usuário parar de digitar para buscar
    if (searchText.length > 0 && searchText.length < 2) {
      // Se tem 1 caractere, não faz nada ainda para não pesar
      setLoading(false);
    } else {
      timer = setTimeout(() => {
        fetchAllData();
      }, 500);
    }

    return () => {
      isActive = false;
      if (timer) clearTimeout(timer);
    };
  }, [selectedDates, searchText]); // Dependência atualizada para incluir searchText

  const filteredBlocos = useMemo(() => {
    let result = blocos.filter(b => {
      const matchText =
        !searchText ||
        b.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        b.bairro.toLowerCase().includes(searchText.toLowerCase());
      let matchTime = true;
      const h = parseInt(b.hora.split(':')[0], 10);
      if (selectedTime === 'Manhã') matchTime = h < 12;
      if (selectedTime === 'Tarde') matchTime = h >= 12 && h < 18;
      if (selectedTime === 'Noite') matchTime = h >= 18;
      let matchBairro = true;
      if (selectedBairro && selectedBairro !== 'Todos')
        matchBairro = b.bairro === selectedBairro;
      return matchText && matchTime && matchBairro;
    });

    if (sortBy === 'time')
      result.sort((a, b) => {
        if (a.originalDate !== b.originalDate)
          return a.originalDate.localeCompare(b.originalDate);
        return a.hora.localeCompare(b.hora);
      });
    else if (sortBy === 'asc')
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    else if (sortBy === 'desc')
      result.sort((a, b) => b.nome.localeCompare(a.nome));
    return result;
  }, [blocos, searchText, selectedTime, selectedBairro, sortBy]);

  const sections = useMemo(() => {
    const grupos = {};
    // Se estiver buscando (searchText > 0), assume múltiplos dias automaticamente
    const multipleDays = selectedDates.length > 1 || searchText.length > 0;

    filteredBlocos.forEach(bloco => {
      let key;
      if (multipleDays) {
        key = `${bloco.weekDay} • ${bloco.hora}`;
      } else {
        key = bloco.hora;
      }

      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(bloco);
    });

    return Object.keys(grupos).map(titulo => ({
      title: titulo,
      data: grupos[titulo],
    }));
  }, [filteredBlocos, selectedDates.length, searchText]);

  const handleCardPress = useCallback(
    item => navigation.navigate('BlocoDetails', { bloco: item }),
    [navigation],
  );

  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.stickyHeaderContainer}>
        <View style={styles.stickyHeaderBadge}>
          <Text style={styles.stickyHeaderText}>{section.title}</Text>
        </View>
        <View style={styles.stickyHeaderLine} />
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <BlocoTimelineCard
        item={item}
        onPress={handleCardPress}
        // Mostra a data no card se estiver buscando ou se múltiplos dias selecionados
        showDateLabel={selectedDates.length > 1 || searchText.length > 0}
      />
    ),
    [selectedDates.length, searchText, handleCardPress],
  );

  const renderModalOption = (label, isSelected, onPress, iconName) => (
    <TouchableOpacity style={styles.modalOption} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {iconName && (
          <Icon
            name={iconName}
            size={22}
            color={isSelected ? THEME.primary : THEME.textLight}
            style={{ marginRight: 12 }}
          />
        )}
        <Text
          style={[
            styles.modalOptionText,
            isSelected && { color: THEME.primary, fontWeight: 'bold' },
          ]}
        >
          {label}
        </Text>
      </View>
      {isSelected && (
        <Icon name="check-circle" size={22} color={THEME.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <AnimatedBackground />
      <Header
        searchText={searchText}
        setSearchText={setSearchText}
        calendar={calendar}
        selectedDates={selectedDates}
        toggleDate={toggleDate}
        onOpenSettings={() => setActiveModal('settings')}
        scrollY={scrollY}
      />

      <View style={styles.contentContainer}>
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedTime && styles.filterChipActive,
              ]}
              onPress={() => setActiveModal('time')}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedTime && styles.filterTextActive,
                ]}
              >
                {selectedTime || 'Horário'}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color={selectedTime ? '#FFF' : THEME.textBody}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedBairro && styles.filterChipActive,
              ]}
              onPress={() => {
                setBairroSearch('');
                setActiveModal('bairro');
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedBairro && styles.filterTextActive,
                ]}
              >
                {selectedBairro || 'Bairro'}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color={selectedBairro ? '#FFF' : THEME.textBody}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterChip,
                sortBy !== 'time' && styles.filterChipActive,
              ]}
              onPress={() => setActiveModal('sort')}
            >
              <Text
                style={[
                  styles.filterText,
                  sortBy !== 'time' && styles.filterTextActive,
                ]}
              >
                {sortBy === 'time'
                  ? 'Ordenar'
                  : sortBy === 'asc'
                  ? 'A-Z'
                  : 'Z-A'}
              </Text>
              <Icon
                name="chevron-down"
                size={14}
                color={sortBy !== 'time' ? '#FFF' : THEME.textBody}
              />
            </TouchableOpacity>
            {(selectedTime || selectedBairro || sortBy !== 'time') && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedTime(null);
                  setSelectedBairro(null);
                  setSortBy('time');
                }}
                style={styles.clearFilterBtn}
              >
                <Icon name="close" size={16} color={THEME.secondary} />
                <Text style={styles.clearFilterText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>
              {searchText.length > 0
                ? 'Buscando em todos os dias...'
                : 'Buscando a folia...'}
            </Text>
          </View>
        ) : (
          <AnimatedSectionList
            sections={sections}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            keyExtractor={item => item.uniqueKey}
            contentContainerStyle={{
              paddingBottom: 100,
              paddingTop: 5,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
            removeClippedSubviews={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListHeaderComponent={
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  {searchText.length > 0
                    ? 'Resultados da Busca'
                    : 'Agenda da Folia'}
                </Text>
                <Text style={styles.resultsCount}>
                  {filteredBlocos.length} Blocos
                </Text>
              </View>
            }
            renderSectionHeader={renderSectionHeader}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="emoticon-sad-outline"
                  size={48}
                  color={THEME.textLight}
                />
                <Text style={styles.emptyText}>Nenhum bloco encontrado.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modais */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal === 'time'}
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Horário</Text>
                <TouchableOpacity
                  onPress={() => setActiveModal(null)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={20} color={THEME.textBody} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{ maxHeight: height * 0.6 }}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {renderModalOption(
                  'Todos os horários',
                  selectedTime === null,
                  () => {
                    setSelectedTime(null);
                    setActiveModal(null);
                  },
                  'clock-outline',
                )}
                {renderModalOption(
                  'Manhã (05h - 12h)',
                  selectedTime === 'Manhã',
                  () => {
                    setSelectedTime('Manhã');
                    setActiveModal(null);
                  },
                  'weather-sunny',
                )}
                {renderModalOption(
                  'Tarde (12h - 18h)',
                  selectedTime === 'Tarde',
                  () => {
                    setSelectedTime('Tarde');
                    setActiveModal(null);
                  },
                  'weather-sunset',
                )}
                {renderModalOption(
                  'Noite (18h - 05h)',
                  selectedTime === 'Noite',
                  () => {
                    setSelectedTime('Noite');
                    setActiveModal(null);
                  },
                  'weather-night',
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal === 'sort'}
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ordenar</Text>
                <TouchableOpacity
                  onPress={() => setActiveModal(null)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={20} color={THEME.textBody} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{ maxHeight: height * 0.6 }}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {renderModalOption(
                  'Horário (Mais cedo)',
                  sortBy === 'time',
                  () => {
                    setSortBy('time');
                    setActiveModal(null);
                  },
                  'clock-start',
                )}
                {renderModalOption(
                  'Nome (A - Z)',
                  sortBy === 'asc',
                  () => {
                    setSortBy('asc');
                    setActiveModal(null);
                  },
                  'sort-alphabetical-ascending',
                )}
                {renderModalOption(
                  'Nome (Z - A)',
                  sortBy === 'desc',
                  () => {
                    setSortBy('desc');
                    setActiveModal(null);
                  },
                  'sort-alphabetical-descending',
                )}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={activeModal === 'bairro'}
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bairro</Text>
                <TouchableOpacity
                  onPress={() => setActiveModal(null)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={20} color={THEME.textBody} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalSearchContainer}>
                <Icon name="magnify" size={20} color={THEME.primary} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Buscar..."
                  value={bairroSearch}
                  onChangeText={setBairroSearch}
                />
              </View>
              <ScrollView
                style={{ maxHeight: height * 0.6 }}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {renderModalOption(
                  'Todos os bairros',
                  selectedBairro === null,
                  () => {
                    setSelectedBairro(null);
                    setActiveModal(null);
                  },
                  'map',
                )}
                {useMemo(() => {
                  const list = [
                    ...new Set(blocos.map(b => b.bairro).filter(Boolean)),
                  ].sort();
                  const filtered = bairroSearch
                    ? list.filter(b =>
                        b.toLowerCase().includes(bairroSearch.toLowerCase()),
                      )
                    : list;
                  return filtered.map((bairro, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalOption}
                      onPress={() => {
                        setSelectedBairro(bairro);
                        setActiveModal(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          selectedBairro === bairro && {
                            color: THEME.primary,
                            fontWeight: 'bold',
                          },
                        ]}
                      >
                        {bairro}
                      </Text>
                      {selectedBairro === bairro && (
                        <Icon
                          name="check-circle"
                          size={20}
                          color={THEME.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ));
                }, [blocos, bairroSearch, selectedBairro])}
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Switch visible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#F8F7FF',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 1,
    filter: 'blur(60px)',
  },
  bgGrid: {
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    borderWidth: 20,
    borderColor: 'rgba(109, 40, 217, 0.02)',
    transform: [{ rotate: '45deg' }],
  },
  bgLightBeam: {
    position: 'absolute',
    width: 100,
    height: height * 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: -100,
  },
  headerContainer: {
    backgroundColor: THEME.primary,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 100,
    overflow: 'hidden',
  },
  decorBlob: { position: 'absolute', borderRadius: 999, opacity: 0.6 },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 29, 149, 0.4)',
  },
  headerContent: { paddingHorizontal: 20 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
  },
  brandAccent: { color: THEME.accent },
  logoShadow: {
    textShadowColor: 'rgba(251, 191, 36, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginTop: -4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.textTitle,
    fontWeight: '500',
  },
  dateChip: {
    width: 52,
    height: 68,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateChipActive: {
    backgroundColor: THEME.primaryDark,
    borderColor: THEME.accent,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dateChipInactive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: THEME.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    borderWidth: 1.5,
    borderColor: THEME.primary,
  },
  dateTextWeek: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateTextDay: { fontSize: 20, fontWeight: '800' },
  contentContainer: { flex: 1 },
  filterBar: { marginTop: 15, marginBottom: 5 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: THEME.textTitle,
    borderColor: THEME.textTitle,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textBody,
    marginRight: 4,
  },
  filterTextActive: { color: '#FFF' },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
    padding: 5,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.secondary,
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: { marginTop: 10, color: THEME.textLight, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.6 },
  emptyText: {
    marginTop: 10,
    color: THEME.textBody,
    fontSize: 16,
    textAlign: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textTitle,
    letterSpacing: -0.5,
  },
  resultsCount: { fontSize: 13, fontWeight: '600', color: THEME.textLight },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { width: 40, alignItems: 'center', marginTop: 0 },
  timelineDotContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 12,
  },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: -10,
    zIndex: 1,
  },
  pulsingContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
  },
  pulsingCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.live,
  },
  stickyHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 15,
    paddingTop: 5,
  },
  stickyHeaderBadge: {
    backgroundColor: THEME.textTitle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
  },
  stickyHeaderText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  stickyHeaderLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardPast: {
    backgroundColor: '#F8FAFC',
    shadowOpacity: 0.02,
    borderColor: 'transparent',
  },
  cardInternalBlob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.5,
    filter: 'blur(25px)',
  },
  cardInternalPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 4,
    backgroundColor: THEME.primary,
    opacity: 0.1,
  },
  cardContent: { padding: 18, paddingTop: 20 },
  internalDateBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 18,
    zIndex: 10,
  },
  internalDateBadgeLive: { backgroundColor: '#FECACA' },
  internalDateBadgeFuture: { backgroundColor: '#EDE9FE' },
  internalDateBadgePast: { backgroundColor: '#F1F5F9' },
  internalDateText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.primaryDark,
    letterSpacing: 0.5,
  },
  cardHeader: { marginBottom: 8 },
  cardTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.live,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 4,
  },
  liveTagText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  bairroBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bairroBadgeText: { fontSize: 10, fontWeight: '800', color: THEME.primary },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.textTitle,
    lineHeight: 22,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardAddress: {
    fontSize: 13,
    color: THEME.textBody,
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 231, 235, 0.5)',
    paddingTop: 12,
  },
  infraIcons: { flexDirection: 'row', gap: 8 },
  infraTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  infraText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 0,
    maxHeight: '70%',
    width: '100%',
  },
  modalHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: THEME.textTitle },
  closeButton: { padding: 6, backgroundColor: '#F3F4F6', borderRadius: 20 },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: { fontSize: 16, color: THEME.textBody, fontWeight: '500' },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 15,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.textTitle,
    marginLeft: 10,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsLabel: { fontSize: 16, color: THEME.textTitle, fontWeight: '600' },
});

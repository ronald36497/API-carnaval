import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  SectionList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- IMPORTS ---
// Certifique-se que os caminhos estão corretos no seu projeto
import { CarnavalApi } from '../../api/api';
import { THEME, getCarnavalDates, height } from '../../constants/theme';
import AnimatedBackground from '../../components/AnimatedBackground';
import BlocoTimelineCard from '../../components/BlocoTimelineCard';
import HomeHeader from '../../components/HomeHeader';
import SkeletonBlocoCard from '../../components/SkeletonBlocoCard';
import styles from './HomeStyles';

// Altura do header expandido (usado para o padding da lista)
const HEADER_HEIGHT_EXPANDED = Platform.OS === 'android' ? 240 : 250;

// Criação do componente animado
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export default function Home({ navigation }) {
  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [blocos, setBlocos] = useState([]);
  const [searchText, setSearchText] = useState('');

  // Modais e Filtros
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedBairro, setSelectedBairro] = useState(null);
  const [sortBy, setSortBy] = useState('time');
  const [bairroSearch, setBairroSearch] = useState('');

  // Calendário
  const calendar = useMemo(() => getCarnavalDates(), []);
  const [selectedDates, setSelectedDates] = useState([calendar[0].fullDate]);

  // --- ANIMAÇÃO DE SCROLL ---
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // --- HANDLERS ---
  const toggleDate = useCallback(
    date => {
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

  const handleCardPress = useCallback(
    item => navigation.navigate('BlocoDetails', { bloco: item }),
    [navigation],
  );

  // --- DATA FETCHING ---
  useEffect(() => {
    let isActive = true;
    let timer = null;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        let datesToFetch = selectedDates;
        const isGlobalSearch = searchText.trim().length >= 2;

        if (isGlobalSearch) {
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

        // Normalização dos dados
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

        // Remove duplicatas
        const uniqueMap = new Map();
        normalized.forEach(item => {
          const logicKey = `${item.id}_${item.originalDate}`;
          if (!uniqueMap.has(logicKey)) uniqueMap.set(logicKey, item);
        });
        const finalData = Array.from(uniqueMap.values());

        // Ordenação Inicial Padrão
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

    if (searchText.length > 0 && searchText.length < 2) {
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
  }, [selectedDates, searchText]);

  // --- FILTROS & ORDENAÇÃO ---
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

    if (sortBy === 'time') {
      result.sort((a, b) => {
        // CORREÇÃO: Ordena por Hora PRIMEIRO, depois Data
        // Isso permite agrupar blocos de dias diferentes mas mesmo horário
        const timeDiff = a.hora.localeCompare(b.hora);
        if (timeDiff !== 0) return timeDiff;
        return a.originalDate.localeCompare(b.originalDate);
      });
    } else if (sortBy === 'asc') {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortBy === 'desc') {
      result.sort((a, b) => b.nome.localeCompare(a.nome));
    }
    return result;
  }, [blocos, searchText, selectedTime, selectedBairro, sortBy]);

  // --- AGRUPAMENTO (SECTIONS) ---
  const sections = useMemo(() => {
    const grupos = {};

    filteredBlocos.forEach(bloco => {
      // CORREÇÃO: A chave é SEMPRE apenas a hora.
      // Removemos a data/dia da semana do título da seção.
      const key = bloco.hora;

      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(bloco);
    });

    return Object.keys(grupos).map(titulo => ({
      title: titulo,
      data: grupos[titulo],
    }));
  }, [filteredBlocos]);

  // --- RENDERS ---
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <View style={styles.stickyHeaderContainer}>
        <View style={styles.stickyHeaderBadge}>
          {/* Mostra apenas a hora (ex: "14:00") */}
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
        // Sempre mostra o badge de data no card, pois o header só mostra a hora
        showDateLabel={true}
      />
    ),
    [handleCardPress],
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
        barStyle="dark-content"
      />

      {/* BACKGROUND ANIMADO (Camada 0) */}
      <AnimatedBackground />

      {/* HEADER (Camada Superior Fixa) */}
      <HomeHeader
        searchText={searchText}
        setSearchText={setSearchText}
        calendar={calendar}
        selectedDates={selectedDates}
        toggleDate={toggleDate}
        onOpenSettings={() => setActiveModal('settings')}
        scrollY={scrollY}
      />

      <View style={styles.contentContainer}>
        {loading ? (
          <ScrollView
            contentContainerStyle={{
              paddingTop: HEADER_HEIGHT_EXPANDED + 20,
              paddingHorizontal: 20,
              paddingBottom: 50,
            }}
            showsVerticalScrollIndicator={false}
          >
            {[1, 2, 3, 4, 5, 6].map(item => (
              <SkeletonBlocoCard key={item} />
            ))}
          </ScrollView>
        ) : (
          <AnimatedSectionList
            sections={sections}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            keyExtractor={item => item.uniqueKey}
            // CONFIGURAÇÃO CRÍTICA PARA O SCROLL POR TRÁS DO HEADER
            contentContainerStyle={{
              paddingTop: HEADER_HEIGHT_EXPANDED + 20,
              paddingBottom: 100,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={true}
            removeClippedSubviews={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            // HEADER DA LISTA (Rola junto com os cards)
            ListHeaderComponent={
              <View>
                {/* BARRA DE FILTROS */}
                <View style={styles.filterBar}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 5, gap: 8 }}
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

                {/* TÍTULO DOS RESULTADOS */}
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {searchText.length > 0 ? 'Blocos' : 'Blocos'}
                  </Text>
                  <Text style={styles.resultsCount}>
                    {filteredBlocos.length} Blocos
                  </Text>
                </View>
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

      {/* --- MODAIS --- */}

      {/* Modal Horário */}
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

      {/* Modal Ordenação */}
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

      {/* Modal Bairro */}
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
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing, // Import necessário para a nova animação suave
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { THEME } from '../constants/theme';
import PulsingDot from './PulsingDot';

// --- SUB-COMPONENTE: Animação forte para AO VIVO ---
const LiveGlow = React.memo(({ color }) => {
  const glowOpacity = useSharedValue(0.3);
  const glowScale = useSharedValue(1);

  React.useEffect(() => {
    // Animação mais rápida e agressiva
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.2, { duration: 2000 }),
      ),
      -1,
      true,
    );
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000 }),
        withTiming(1, { duration: 2000 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={[
          styles.cardInternalBlob,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
});

// --- SUB-COMPONENTE: Fundo Estático (ou com respiro suave) ---
// MUDANÇA: Agora aceita a prop 'animate' para o efeito "Em Breve"
const StaticBackground = React.memo(
  ({ color, opacity = 0.3, animate = false }) => {
    const pulseOpacity = useSharedValue(opacity);

    React.useEffect(() => {
      if (animate) {
        // Efeito de "respiração" lento e suave
        pulseOpacity.value = withRepeat(
          withSequence(
            // Vai um pouco mais claro
            withTiming(opacity + 0.25, {
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
            }),
            // Volta ao normal
            withTiming(opacity, {
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1, // Infinito
          true, // Reverso
        );
      }
    }, [animate, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: animate ? pulseOpacity.value : opacity,
    }));

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {animate ? (
          // Se tiver animação, usa Animated.View
          <Animated.View
            style={[
              styles.cardInternalBlob,
              { backgroundColor: color },
              animatedStyle,
            ]}
          />
        ) : (
          // Se for estático puro, usa View normal (melhor performance)
          <View
            style={[
              styles.cardInternalBlob,
              { backgroundColor: color, opacity: opacity },
            ]}
          />
        )}
      </View>
    );
  },
);

const BlocoTimelineCard = React.memo(({ item, onPress, showDateLabel }) => {
  const isLive =
    item.status === 'em_andamento' || item.timeStatus === 'current';
  const isPast = item.timeStatus === 'past';

  // --- LÓGICA DE "EM BREVE" ---
  const checkIsSoon = () => {
    if (isLive || isPast) return false;
    const now = new Date();
    const blockDateStr = item.originalDate;
    const todayStr = now.toISOString().split('T')[0];

    if (blockDateStr === todayStr) {
      const [h, m] = item.hora.split(':').map(Number);
      const blockTime = new Date(now);
      blockTime.setHours(h, m, 0, 0);
      const diffMs = blockTime - now;
      const diffMinutes = diffMs / (1000 * 60);
      // Entre 0 e 60 minutos antes
      return diffMinutes > 0 && diffMinutes <= 60;
    }
    return false;
  };

  const isSoon = checkIsSoon();

  // --- DEFINIÇÃO DE CORES ---
  let dotBg = THEME.secondary;
  let borderColor = THEME.primary;
  let glowColor = THEME.primary;
  let badgeBg = THEME.secondary;

  if (isLive) {
    // ESTILO AO VIVO: Vermelho
    dotBg = THEME.live;
    borderColor = THEME.live;
    glowColor = '#FECACA';
    badgeBg = THEME.live;
  } else if (isSoon) {
    // ESTILO EM BREVE: AZUL (Accent)
    dotBg = THEME.accent;
    borderColor = THEME.accent;
    // Azul claro para o brilho interno
    glowColor = '#BAE6FD';
    badgeBg = THEME.accent;
  } else if (isPast) {
    // ESTILO PASSADO: Cinza
    dotBg = THEME.past;
    borderColor = 'transparent';
    glowColor = '#E2E8F0';
    badgeBg = THEME.past;
  } else {
    // ESTILO FUTURO PADRÃO: Amarelo
    borderColor = 'rgba(255, 215, 0, 0.5)';
    badgeBg = THEME.textLight;
  }

  // --- FORMATAÇÃO DE DATA ---
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
  const weekNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const weekDay = weekNames[dateObj.getUTCDay()];
  const dateLabel = `${weekDay} • ${day} ${month}`;

  return (
    <View style={styles.timelineRow}>
      {/* Lado Esquerdo: Timeline */}
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDotContainer}>
          {isLive ? (
            <PulsingDot />
          ) : (
            <View style={[styles.timelineDot, { backgroundColor: dotBg }]} />
          )}
        </View>
        <View
          style={[
            styles.timelineLine,
            isPast && { backgroundColor: '#E2E8F0', borderStyle: 'dashed' },
          ]}
        />
      </View>

      {/* Lado Direito: Card */}
      <View style={{ flex: 1, paddingBottom: 12 }}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.card,
            { borderColor: borderColor },
            isPast && styles.cardPast,
            isSoon && styles.cardSoon,
          ]}
          onPress={() => onPress(item)}
        >
          {isLive ? (
            <LiveGlow color={glowColor} />
          ) : (
            // MUDANÇA: Passamos 'animate={isSoon}' para ativar o respiro suave
            <StaticBackground
              color={glowColor}
              opacity={isSoon ? 0.4 : 0.3} // Base um pouco mais forte se for soon
              animate={isSoon}
            />
          )}

          {showDateLabel && (
            <View
              style={[styles.internalDateBadge, { backgroundColor: badgeBg }]}
            >
              <Text style={[styles.internalDateText, { color: '#FFF' }]}>
                {dateLabel}
              </Text>
            </View>
          )}

          <View style={styles.cardContent}>
            <View style={styles.cardTagsRow}>
              {isLive && (
                <View style={styles.liveTag}>
                  <Text style={styles.liveTagText}>• NO BLOCO</Text>
                </View>
              )}

              {/* TAG "EM BREVE" - AZUL */}
              {isSoon && (
                <View style={styles.soonTag}>
                  <Icon
                    name="clock-fast"
                    size={14}
                    color={THEME.accent}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.soonTagText}>EM 1H</Text>
                </View>
              )}

              <View
                style={[
                  styles.bairroBadge,
                  isPast && { backgroundColor: '#E2E8F0' },
                ]}
              >
                <Text
                  style={[
                    styles.bairroBadgeText,
                    isPast && { color: '#64748B' },
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

            <View style={styles.addressRow}>
              <Icon
                name="map-marker"
                size={14}
                color={isPast ? THEME.past : isSoon ? THEME.accent : THEME.info}
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
              <View style={styles.infraIcons}>
                {item.banheiros > 0 && (
                  <View style={styles.infraTag}>
                    <Icon name="water-outline" size={12} color={THEME.accent} />
                    <Text style={styles.infraText}>Banheiro</Text>
                  </View>
                )}
                {item.hospitais > 0 && (
                  <View
                    style={[styles.infraTag, { backgroundColor: '#FEF2F2' }]}
                  >
                    <Icon name="medical-bag" size={12} color={THEME.live} />
                    <Text style={[styles.infraText, { color: THEME.live }]}>
                      SAÚDE
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isPast ? '#F1F5F9' : THEME.primaryLight,
                  },
                ]}
              >
                <Icon
                  name={isPast ? 'check-all' : 'chevron-right'}
                  size={18}
                  color={isPast ? THEME.past : THEME.textTitle}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  timelineRow: { flexDirection: 'row', paddingHorizontal: 12 },
  timelineLeft: { width: 30, alignItems: 'center' },
  timelineDotContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 15,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginTop: -5,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginLeft: 10,
  },
  cardPast: {
    backgroundColor: '#F8FAFC',
    elevation: 0,
    shadowOpacity: 0,
    borderColor: '#E2E8F0',
  },
  // EM BREVE: Apenas a borda azul, sem fundo colorido
  cardSoon: {
    borderColor: THEME.accent, // AZUL
    // backgroundColor removido para ficar branco limpo
  },
  cardInternalBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    // Opacidade base é controlada via prop agora
  },
  cardContent: { padding: 16 },
  internalDateBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    zIndex: 10,
  },
  internalDateText: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  cardTagsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },

  liveTag: {
    backgroundColor: THEME.live,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveTagText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  // SOON TAG: AZUL (Outline)
  soonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF', // Fundo azul bem claro na tag apenas
    borderWidth: 1,
    borderColor: THEME.accent, // Borda Azul
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  soonTagText: {
    color: THEME.accent, // Texto Azul
    fontSize: 9,
    fontWeight: '900',
  },

  bairroBadge: {
    backgroundColor: THEME.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bairroBadgeText: { fontSize: 10, fontWeight: '800', color: THEME.textTitle },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.textTitle,
    marginBottom: 6,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardAddress: {
    fontSize: 12,
    color: THEME.textBody,
    marginLeft: 4,
    flex: 1,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infraIcons: { flexDirection: 'row', gap: 6 },
  infraTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  infraText: {
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 3,
    color: THEME.info,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BlocoTimelineCard;

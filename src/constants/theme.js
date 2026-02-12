import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

export const THEME = {
  primary: '#FFD700', // Amarelo Ouro (Energia)
  primaryDark: '#F59E0B', // Âmbar
  primaryLight: '#FEF3C7',
  secondary: '#FF4500', // Laranja vibrante (Fogo/Bloco)
  accent: '#00BFFF', // Azul Céu (Contraste)
  info: '#10B981',
  bg: '#FFFBEB', // Off-white quente
  card: '#FFFFFF',
  textTitle: '#451a03', // Marrom quase preto (melhor que roxo/preto puro)
  textBody: '#78350f',
  textLight: '#92400E',
  line: '#FEF3C7',
  live: '#EF4444',
  past: '#D1D5DB',
};

export const getCarnavalDates = () => {
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

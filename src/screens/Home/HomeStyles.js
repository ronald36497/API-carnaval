import { StyleSheet, Dimensions, Platform } from 'react-native';
import { THEME } from '../../constants/theme';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  // 1. O Container principal deve ser transparente
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // 2. O container de conteúdo também
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Barra de Filtros
  filterBar: {
    marginBottom: 10,
    marginTop: 0,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Chips continuam brancos para leitura
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
  filterTextActive: {
    color: '#FFF',
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    marginLeft: 5,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.secondary,
    marginLeft: 2,
  },

  // Loading e Empty States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  loadingText: {
    marginTop: 10,
    color: THEME.textBody,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 10,
    color: THEME.textBody,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Cabeçalho dos Resultados (Dentro da Lista)
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 5,
    // GARANTIR QUE NÃO TEM COR DE FUNDO AQUI
    backgroundColor: 'transparent',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.textTitle,
    letterSpacing: -0.5,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME.textLight,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // Sticky Header (Ex: "14:00") - AQUI ESTAVA O PROBLEMA
  stickyHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // MUDANÇA: Tirei o 'rgba(255, 252, 242, 0.95)' e deixei transparente
    // Assim a bolinha passa por trás e você vê ela
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: -20,
    marginBottom: 10,
  },
  stickyHeaderBadge: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stickyHeaderText: {
    color: THEME.textTitle,
    fontWeight: '800',
    fontSize: 14,
  },
  stickyHeaderLine: {
    flex: 1,
    height: 2,
    // Deixei a linha bem sutil para não parecer que "corta" a animação
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 0,
    maxHeight: '80%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#E2E8F0',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.textTitle,
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionText: {
    fontSize: 16,
    color: THEME.textBody,
    fontWeight: '500',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
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
});

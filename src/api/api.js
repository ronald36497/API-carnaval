import axios from 'axios';
import { Platform } from 'react-native';

// ============================================================
// ⚙️ CONFIGURAÇÃO DO SERVIDOR (LOCALHOST)
// ============================================================
// A porta DEVE ser 3005, conforme está no seu server.js (app.listen(3005))
const BASE_URL = Platform.select({
  android: 'http://localhost:3000/api', // Android Emulator acessa o PC via esse IP
  ios: 'http://localhost:3000/api', // iOS Simulator entende localhost
  default: 'http://localhost:3000/api', // Web ou outros
});

// Cria a instância do Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 segundos para timeout
});

// ============================================================
// 📡 FUNÇÕES DE CONSUMO (MAPEANDO TODAS AS 7 ROTAS)
// ============================================================

export const CarnavalApi = {
  // ----------------------------------------------------------
  // ROTA 1: /api/blocos
  // Busca geral. Aceita filtros: dia, q (busca texto), lat/lon (distância)
  // ----------------------------------------------------------
  getBlocos: async ({
    dia,
    q,
    lat,
    lon,
    page = 1,
    limit = 20,
    proximo = false,
  } = {}) => {
    try {
      const params = { page, limit };
      if (dia) params.dia = dia;
      if (q) params.q = q;
      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
        if (proximo) params.proximo = 'true'; // Ordena por distância
      }

      const response = await api.get('/blocos', { params });
      return response.data; // Retorna { total, blocos: [] }
    } catch (error) {
      console.error('❌ Erro getBlocos:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // ROTA 2: /api/agora
  // Retorna o que está rolando AGORA (baseado no horário do server)
  // ----------------------------------------------------------
  getAgora: async () => {
    try {
      const response = await api.get('/agora');
      return response.data; // Retorna { msg, total, blocos: [] }
    } catch (error) {
      console.error('❌ Erro getAgora:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // ROTA 3: /api/curadoria
  // Retorna destaques (Manhã, Tarde, Noite) de um dia específico
  // ----------------------------------------------------------
  getCuradoria: async dia => {
    try {
      if (!dia) throw new Error('Dia é obrigatório para curadoria');
      const response = await api.get('/curadoria', { params: { dia } });
      return response.data; // Retorna { titulo, manha: [], tarde: [], noite: [] }
    } catch (error) {
      console.error('❌ Erro getCuradoria:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // ROTA 4: /api/servicos
  // Retorna infraestrutura (Hospitais, Delegacias, Banheiros Fixos)
  // Se passar lat/lon, já vem ordenado por distância
  // ----------------------------------------------------------
  getServicos: async (lat = null, lon = null) => {
    try {
      const params = {};
      if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
      }
      const response = await api.get('/servicos', { params });
      return response.data; // Retorna lista []
    } catch (error) {
      console.error('❌ Erro getServicos:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // ROTA 5: /api/proximo-de-mim
  // "Botão de Pânico/Utilidade". Pega os 10 itens mais perto de qualquer tipo.
  // Tipos: 'BANHEIRO', 'SAUDE', 'POLICIA', 'METRO' ou null (todos)
  // ----------------------------------------------------------
  getProximoDeMim: async (lat, lon, tipo = null) => {
    try {
      if (!lat || !lon) throw new Error('Preciso de latitude e longitude');
      const params = { lat, lon };
      if (tipo) params.tipo = tipo;

      const response = await api.get('/proximo-de-mim', { params });
      return response.data; // Retorna lista top 10 []
    } catch (error) {
      console.error('❌ Erro getProximoDeMim:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // ROTA 6: /api/listas
  // Retorna datas disponíveis e bairros para montar filtros no Front
  // ----------------------------------------------------------
  getListas: async () => {
    try {
      const response = await api.get('/listas');
      return response.data; // Retorna { bairros: [], datas: [] }
    } catch (error) {
      console.error('❌ Erro getListas:', error);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // ROTA 7: /api/stats
  // Estatísticas simples para dashboard
  // ----------------------------------------------------------
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data; // Retorna { total_blocos, top_bairros }
    } catch (error) {
      console.error('❌ Erro getStats:', error);
      throw error;
    }
  },
};

export default api;

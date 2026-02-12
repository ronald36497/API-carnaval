import axios from 'axios';

const BASE_URL = 'https://api-carnaval-l.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const CarnavalApi = {
  getBlocos: async ({ lat, lon, bairro, busca, raio, data } = {}) => {
    // ... (seu código do getBlocos que já estava certo)
    try {
      const params = {};
      if (lat && lon) {
        params.lat = lat;
        params.lng = lon;
        params.raio = raio || 10;
      }
      if (bairro) params.bairro = bairro;
      if (busca) params.busca = busca;
      if (data) params.data = data;

      const response = await api.get('/blocos', { params });
      return response.data;
    } catch (error) {
      console.error('Erro getBlocos:', error);
      return [];
    }
  },

  // --- CORREÇÃO AQUI ---
  // Antes estava vazio: async () => { ... }
  // Agora aceita parâmetros e repassa para o axios
  getBanheiros: async ({ lat, lng, raio } = {}) => {
    console.log('🔹 getBanheiros filtrado:', { lat, lng, raio });
    try {
      const params = {};
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng; // Backend espera 'lng'
        params.raio = raio || 2.0; // Padrão 2km se não passar nada
      }

      const response = await api.get('/banheiros', { params });
      return response.data;
    } catch (error) {
      console.error('Erro getBanheiros:', error);
      return [];
    }
  },

  // --- CORREÇÃO AQUI TMB ---
  getHospitais: async ({ lat, lng, raio } = {}) => {
    console.log('🔹 getHospitais filtrado:', { lat, lng, raio });
    try {
      const params = {};
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
        params.raio = raio || 5.0; // Hospitais buscam mais longe
      }

      const response = await api.get('/hospitais', { params });
      return response.data;
    } catch (error) {
      console.error('Erro getHospitais:', error);
      return [];
    }
  },

  getPing: async () => {
    console.log('🔹 getPing chamado');
    try {
      const response = await api.get('/ping');
      console.log('✅ Resposta GET /ping:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro getPing:', error.message);
      console.error('Stack:', error.stack);
      return false;
    }
  },
};

export default api;

import { useState, useEffect } from 'react';
import { CarnavalApi } from '../services/api'; // Importa o arquivo novo

export const useBlocos = ({ dia, lat, lon }) => {
  const [blocos, setBlocos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      // Se tiver lat/lon, a API já calcula a distância e ordena
      const dados = await CarnavalApi.getBlocos({
        dia,
        lat,
        lon,
        proximo: true, // Traz os mais perto
      });
      setBlocos(dados.blocos);
    } catch (error) {
      console.log('Deu ruim:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dia, lat, lon]);

  return { blocos, loading, refresh: carregar };
};

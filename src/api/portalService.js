import api from '../api/axios';

export const portalService = {
  getMiCuenta: async () => {
    const response = await api.get('/portal/mi-cuenta');
    return response.data;
  }
};
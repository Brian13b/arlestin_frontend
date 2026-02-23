import api from '../api/axios';

export const dashboardService = {
  getResumen: async () => {
    const response = await api.get('/dashboard/resumen');
    return response.data;
  }
};
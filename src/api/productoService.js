import api from '../api/axios';

export const productosService = {
  getAll: async () => {
    const response = await api.get('/productos/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/productos/', data);
    return response.data;
  },
  updatePrecio: async (id, precio) => {
    const response = await api.put(`/productos/${id}`, {
      precio_actual: parseFloat(precio)
    });
    return response.data;
  },
  toggleActivo: async (id) => {
    const response = await api.put(`/productos/${id}/toggle`);
    return response.data;
  }
};
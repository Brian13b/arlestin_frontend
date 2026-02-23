import api from './axios';

export const clientesService = {
  // Traer todos
  getAll: async () => {
    const response = await api.get('/clientes/');
    return response.data;
  },
  
  // Traer uno solo
  getById: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },
  
  // Crear
  create: async (data) => {
    const response = await api.post('/clientes/', data);
    return response.data;
  },
  
  // Actualizar
  update: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },
  
  // Eliminar
  delete: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },
  
  // Registrar pago
  registrarPago: async (id, data) => {
    const response = await api.post(`/logistica/movimientos/pago/${id}`, data);
    return response.data;
  }
};
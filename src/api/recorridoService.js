import api from '../api/axios';

export const recorridoService = {
  // Traer todos los recorridos
  getAll: async () => {
    const response = await api.get('/logistica/recorridos/');
    return response.data;
  },
  
  // Traer un recorrido específico
  getById: async (id) => {
    const response = await api.get(`/logistica/recorridos/${id}`);
    return response.data;
  },
  
  // Crear un nuevo recorrido
  create: async (data) => {
    const response = await api.post('/logistica/recorridos/', data);
    return response.data;
  },
  
  // Actualizar recorrido
  update: async (id, data) => {
    const response = await api.put(`/logistica/recorridos/${id}`, data);
    return response.data;
  },
  
  // Registrar una entrega / movimiento
  registrarMovimiento: async (data) => {
    const response = await api.post('/logistica/movimientos/', data);
    return response.data;
  },

  // Historial por dia
  getHistorialPorFecha: async (fecha) => {
    const query = fecha ? `?fecha=${fecha}` : '';
    const response = await api.get(`/logistica/historial/${query}`);
    return response.data;
  },

  // Historial por mes
  getResumenMesActual: async () => {
    const response = await api.get('/logistica/historial/mes-actual');
    return response.data;
  },
};
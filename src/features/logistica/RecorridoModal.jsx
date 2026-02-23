import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { recorridoService } from '../../api/recorridoService';
import { clientesService } from '../../api/clienteService'; 

const DIAS_SEMANA = [
  { id: 0, nombre: 'Lunes' }, { id: 1, nombre: 'Martes' }, { id: 2, nombre: 'Miércoles' },
  { id: 3, nombre: 'Jueves' }, { id: 4, nombre: 'Viernes' }, { id: 5, nombre: 'Sábado' }, { id: 6, nombre: 'Domingo' }
];

export const RecorridoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', dia_semana: 0, clientes_orden: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientesData = await clientesService.getAll();
        setClientesDisponibles(clientesData);
        if (isEditing) {
          const recorridoData = await recorridoService.getById(id);
          setFormData({ nombre: recorridoData.nombre || '', dia_semana: recorridoData.dia_semana || 0, clientes_orden: recorridoData.clientes_orden || [] });
        }
      } catch (error) { toast.error("Error al cargar datos"); }
    };
    fetchData();
  }, [id, isEditing]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleCliente = (clienteId) => {
    setFormData((prev) => {
      const yaEstaSeleccionado = prev.clientes_orden.includes(clienteId);
      if (yaEstaSeleccionado) return { ...prev, clientes_orden: prev.clientes_orden.filter(id => id !== clienteId) };
      else return { ...prev, clientes_orden: [...prev.clientes_orden, clienteId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) await recorridoService.update(id, formData);
      else await recorridoService.create(formData);
      toast.success(isEditing ? 'Ruta actualizada' : 'Ruta creada');
      navigate('/recorridos');
    } catch (err) { toast.error('Error al guardar'); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary">
        <div className="max-w-7xl mx-auto flex items-center">
          <button onClick={() => navigate('/recorridos')} className="hover:bg-white/20 p-2 rounded-full transition-colors mr-3 -ml-2">
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide">{isEditing ? 'Editar Ruta' : 'Configurar Nueva Ruta'}</h1>
        </div>
      </div>

      <div className="p-5 md:p-12 lg:px-20 max-w-7xl mx-auto mt-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-primary-light/20 space-y-6">
                <div>
                  <label className="block text-sm md:text-base font-bold text-primary-dark uppercase tracking-wider mb-2">Nombre del Recorrido *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><MapPin size={20} className="text-primary" /></div>
                    <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="block w-full pl-12 pr-4 py-4 border-2 border-primary-light/30 rounded-2xl focus:ring-0 focus:border-primary bg-slate-50 text-primary-dark text-lg font-medium" placeholder="Ej: Zona Sur Lunes" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm md:text-base font-bold text-primary-dark uppercase tracking-wider mb-2">Día de asignación *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Calendar size={20} className="text-primary" /></div>
                    <select name="dia_semana" value={formData.dia_semana} onChange={handleChange} className="block w-full pl-12 pr-4 py-4 border-2 border-primary-light/30 rounded-2xl focus:ring-0 focus:border-primary bg-slate-50 text-primary-dark text-lg font-bold tracking-wide appearance-none cursor-pointer">
                      {DIAS_SEMANA.map(dia => <option key={dia.id} value={dia.id}>{dia.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              
              <button type="submit" disabled={isLoading} className="hidden lg:block w-full bg-primary hover:bg-primary-dark text-white font-bold py-5 rounded-2xl transition-all shadow-md active:scale-95 text-xl tracking-wider">
                {isLoading ? 'Guardando...' : 'Confirmar y Guardar Ruta'}
              </button>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-primary-light/20 flex flex-col max-h-[70vh]">
              <div className="flex items-center space-x-3 mb-2 text-primary-dark">
                <div className="bg-primary/10 p-2 rounded-xl"><Users size={24} className="text-primary" /></div>
                <h2 className="font-bold text-2xl tracking-wide">Asignar Clientes</h2>
              </div>
              <p className="text-secondary font-medium mb-6">Seleccioná los clientes que vas a visitar en esta ruta.</p>

              <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin">
                {clientesDisponibles.length === 0 ? (
                  <p className="text-center text-secondary italic mt-10 text-lg">No hay clientes registrados aún.</p>
                ) : (
                  clientesDisponibles.map(cliente => (
                    <label key={cliente.id} className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.clientes_orden.includes(cliente.id) ? 'border-primary bg-primary-light/10' : 'border-primary-light/20 hover:border-primary-light bg-slate-50'}`}>
                      <input type="checkbox" className="w-6 h-6 text-primary border-gray-300 rounded focus:ring-primary accent-primary" checked={formData.clientes_orden.includes(cliente.id)} onChange={() => toggleCliente(cliente.id)} />
                      <div className="ml-4 flex flex-col">
                        <span className="font-bold text-primary-dark text-xl tracking-wide leading-none mb-1">{cliente.nombre_negocio}</span>
                        <span className="text-sm text-secondary font-medium">{cliente.direccion}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <button type="submit" disabled={isLoading} className="lg:hidden w-full bg-primary text-white font-bold py-5 rounded-2xl mt-6 shadow-md active:scale-95 text-xl tracking-wider">
            {isLoading ? 'Guardando...' : 'Confirmar y Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
};
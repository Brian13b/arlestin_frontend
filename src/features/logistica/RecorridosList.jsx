import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pencil, Trash2, X, Package, Search, ArrowUp, ArrowDown, Users } from 'lucide-react';
import { clientesService } from '../../api/clienteService';
import { recorridoService } from '../../api/recorridoService';
import toast from 'react-hot-toast';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const RecorridosList = () => {
  const navigate = useNavigate();
  const [recorridos, setRecorridos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [clientesEnVistaPrevia, setClientesEnVistaPrevia] = useState([]);
  const [busquedaExcepcion, setBusquedaExcepcion] = useState('');

  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [rutaEditando, setRutaEditando] = useState({ id: null, nombre: '', dia_semana: 0, clientes_orden: [] });
  const [busquedaCliente, setBusquedaCliente] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recorridosRes, clientesRes] = await Promise.all([
          recorridoService.getAll(),
          clientesService.getAll()
        ]);
        setRecorridos(recorridosRes);
        setClientes(clientesRes);
      } catch (error) {
        console.error("Error al cargar los datos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getNombreCliente = (id) => {
    const cliente = clientes.find(c => c.id === id);
    return cliente ? cliente.nombre_negocio : 'Cliente eliminado';
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro que querés eliminar el recorrido "${nombre}"?`)) {
      try {
        await recorridoService.delete(id);
        setRecorridos(recorridos.filter(r => r.id !== id));
        toast.success("Recorrido eliminado");
      } catch (error) {
        toast.error("No se pudo eliminar el recorrido");
      }
    }
  };

  // --- LÓGICA MODAL PRE-VIAJE ---
  const abrirModalPrevia = (recorrido) => {
    setRutaSeleccionada(recorrido);
    setBusquedaExcepcion('');
    const clientesCompletos = recorrido.clientes_orden.map(id => clientes.find(c => c.id === id)).filter(Boolean); 
    setClientesEnVistaPrevia(clientesCompletos);
  };

  const quitarClienteVistaPrevia = (clienteId) => setClientesEnVistaPrevia(prev => prev.filter(c => c.id !== clienteId));
  
  const agregarExcepcion = (cliente) => {
    if (!clientesEnVistaPrevia.find(c => c.id === cliente.id)) {
      setClientesEnVistaPrevia([...clientesEnVistaPrevia, cliente]);
      toast.success("Agregado al recorrido de hoy");
    }
    setBusquedaExcepcion('');
  };

  // Función para reordenar clientes en la vista previa del día
  const moverClientePrevia = (index, direccion) => {
    const nuevaLista = [...clientesEnVistaPrevia];
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[index + direccion];
    nuevaLista[index + direccion] = temp;
    setClientesEnVistaPrevia(nuevaLista);
  };

  const comenzarRecorrido = () => navigate(`/reparto/${rutaSeleccionada.id}`, { state: { clientesActivos: clientesEnVistaPrevia } });

  // --- LÓGICA MODAL CREAR/EDITAR ---
  const abrirModalConfig = (recorrido = null) => {
    if (recorrido) {
      setRutaEditando({ id: recorrido.id, nombre: recorrido.nombre, dia_semana: recorrido.dia_semana, clientes_orden: [...recorrido.clientes_orden] });
    } else {
      setRutaEditando({ id: null, nombre: '', dia_semana: 0, clientes_orden: [] });
    }
    setBusquedaCliente('');
    setModalConfigOpen(true);
  };

  const moverClienteConfig = (index, direccion) => {
    const nuevaLista = [...rutaEditando.clientes_orden];
    const temp = nuevaLista[index];
    nuevaLista[index] = nuevaLista[index + direccion];
    nuevaLista[index + direccion] = temp;
    setRutaEditando({ ...rutaEditando, clientes_orden: nuevaLista });
  };

  const toggleClienteConfig = (clienteId) => {
    let nuevaLista = [...rutaEditando.clientes_orden];
    if (nuevaLista.includes(clienteId)) nuevaLista = nuevaLista.filter(id => id !== clienteId);
    else nuevaLista.push(clienteId);
    setRutaEditando({ ...rutaEditando, clientes_orden: nuevaLista });
  };

  const guardarRuta = async () => {
    if (!rutaEditando.nombre) return toast.error("El nombre es obligatorio");
    try {
      if (rutaEditando.id) {
        await recorridoService.update(rutaEditando.id, rutaEditando);
        toast.success("Ruta actualizada");
      } else {
        await recorridoService.create(rutaEditando);
        toast.success("Ruta creada");
      }
      setModalConfigOpen(false);
      window.location.reload(); 
    } catch (e) { toast.error("Error al guardar"); }
  };

  const clientesBuscados = busquedaCliente ? clientes.filter(c => c.nombre_negocio.toLowerCase().includes(busquedaCliente.toLowerCase())) : [];
  const excepcionesBuscadas = busquedaExcepcion ? clientes.filter(c => c.nombre_negocio.toLowerCase().includes(busquedaExcepcion.toLowerCase())) : [];

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center">
              <Package size={32} className="mr-3 text-white" />
              Rutas de Reparto
            </h1>
            <p className="text-primary-light text-sm md:text-base font-medium mt-1 tracking-wider">Organiza la logística de entregas</p>
          </div>
          <button onClick={() => abrirModalConfig()} className="bg-white text-primary hover:bg-primary-light transition-colors py-3 px-5 rounded-2xl flex items-center shadow-sm font-bold text-lg">
            <Plus size={22} className="md:mr-2" />
            <span className="hidden md:inline tracking-wider">Nueva Ruta</span>
          </button>
        </div>
      </div>

      {/* LISTA DE RECORRIDOS */}
      <div className="p-5 md:p-12 lg:px-20 max-w-7xl mx-auto mt-2">
        {loading ? (
          <p className="text-center text-secondary mt-10 text-xl tracking-wider">Cargando rutas...</p>
        ) : recorridos.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-secondary mb-4 text-xl">No hay recorridos configurados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {recorridos.map((recorrido) => {
              const clientesEnRuta = recorrido.clientes_orden || [];
              return (
                <div key={recorrido.id} className="bg-white p-6 rounded-3xl shadow-sm border border-primary-light/20 relative flex flex-col hover:shadow-md transition-shadow">
                  <div className="absolute top-6 right-5 flex space-x-2 text-gray-400">
                    <button onClick={() => abrirModalConfig(recorrido)} className="bg-primary-light/20 p-2 rounded-xl text-primary hover:bg-primary-light/40 transition-colors"><Pencil size={18} /></button>
                    <button onClick={() => handleDelete(recorrido.id, recorrido.nombre)} className="bg-danger/10 p-2 rounded-xl text-danger hover:bg-danger/20 transition-colors"><Trash2 size={18} /></button>
                  </div>

                  <h3 className="font-bold text-primary-dark text-2xl mb-3 pr-24 tracking-wide leading-tight">{recorrido.nombre}</h3>
                  
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider">
                      {DIAS_SEMANA[recorrido.dia_semana]}
                    </span>
                    <span className="text-secondary font-medium tracking-wide">
                      {clientesEnRuta.length} paradas
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    {clientesEnRuta.slice(0, 3).map((clienteId, index) => (
                      <div key={clienteId} className="flex items-center text-sm md:text-base text-primary-dark font-medium">
                        <div className="w-6 h-6 rounded-full bg-primary-light/30 text-primary flex items-center justify-center text-xs font-bold mr-3 shrink-0">
                          {index + 1}
                        </div>
                        <span className="truncate">{getNombreCliente(clienteId)}</span>
                      </div>
                    ))}
                    {clientesEnRuta.length > 3 && (
                      <p className="text-sm text-secondary ml-9 italic tracking-wide">+ {clientesEnRuta.length - 3} más...</p>
                    )}
                    {clientesEnRuta.length === 0 && (
                      <p className="text-sm text-danger bg-danger/10 p-3 rounded-xl tracking-wide">Ruta vacía. Asigná clientes.</p>
                    )}
                  </div>

                  <button onClick={() => abrirModalPrevia(recorrido)} disabled={clientesEnRuta.length === 0} className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold tracking-wider text-lg transition-all active:scale-95 ${clientesEnRuta.length > 0 ? 'bg-primary hover:bg-primary-dark text-white shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    <Play size={20} className="mr-2 fill-current" />
                    Iniciar Ruta
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL: VISTA PREVIA E INICIO --- */}
      {rutaSeleccionada && (
        <div className="fixed inset-0 bg-primary-dark/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-primary-light/20 flex justify-between items-start bg-background">
              <div>
                <h2 className="text-2xl font-bold text-primary-dark tracking-wide">Previa: {rutaSeleccionada.nombre}</h2>
                <p className="text-sm text-secondary mt-1 font-medium">Agregá excepciones, ordená o quitá clientes por hoy.</p>
              </div>
              <button onClick={() => setRutaSeleccionada(null)} className="text-secondary hover:text-primary-dark bg-white p-2 rounded-full shadow-sm border border-primary-light/20">
                <X size={24} />
              </button>
            </div>
            
            {/* Buscador de clientes */}
            <div className="p-4 bg-slate-50 border-b border-primary-light/20 relative z-20">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-primary" size={20}/>
                <input type="text" placeholder="Buscar cliente para agregar hoy..." value={busquedaExcepcion} onChange={e=>setBusquedaExcepcion(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-primary-light/30 focus:border-primary font-medium text-primary-dark"/>
              </div>
              {busquedaExcepcion && (
                <div className="absolute top-[60px] left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 max-h-40 overflow-y-auto z-50">
                  {excepcionesBuscadas.map(c => (
                    <button key={c.id} onClick={() => agregarExcepcion(c)} className="w-full text-left p-3 hover:bg-slate-50 border-b flex justify-between items-center text-primary-dark font-bold">
                      {c.nombre_negocio} <Plus className="text-primary"/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-white scrollbar-thin">
              {clientesEnVistaPrevia.map((cliente, index) => (
                <div key={cliente.id} className="flex items-center justify-between bg-background p-3 md:p-4 rounded-2xl border border-primary-light/30 hover:border-primary transition-colors group">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-primary-dark text-base md:text-lg tracking-wide leading-none mb-1 truncate">{cliente.nombre_negocio}</p>
                      <p className="text-xs md:text-sm text-secondary truncate w-32 md:w-56">{cliente.direccion}</p>
                    </div>
                  </div>
                  
                  {/* Botones de Ordenar y Eliminar */}
                  <div className="flex space-x-1 shrink-0 ml-2">
                    <button disabled={index === 0} onClick={() => moverClientePrevia(index, -1)} className="p-2 md:p-2.5 bg-white shadow-sm border border-primary-light/20 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors">
                      <ArrowUp size={20} />
                    </button>
                    <button disabled={index === clientesEnVistaPrevia.length - 1} onClick={() => moverClientePrevia(index, 1)} className="p-2 md:p-2.5 bg-white shadow-sm border border-primary-light/20 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors">
                      <ArrowDown size={20} />
                    </button>
                    <button onClick={() => quitarClienteVistaPrevia(cliente.id)} className="text-danger bg-white shadow-sm border border-danger/20 p-2 md:p-2.5 rounded-xl hover:bg-danger hover:text-white transition-colors ml-1" title="No visitar hoy">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {clientesEnVistaPrevia.length === 0 && (
                <p className="text-center text-secondary py-6">Ruta vacía. Buscá un cliente arriba para agregarlo.</p>
              )}
            </div>
            
            <div className="p-5 bg-background border-t border-primary-light/20">
              <button onClick={comenzarRecorrido} disabled={clientesEnVistaPrevia.length === 0} className="w-full py-4 font-bold text-white bg-primary hover:bg-primary-dark rounded-2xl flex items-center justify-center text-xl tracking-wider shadow-md disabled:opacity-50 transition-colors">
                <Play size={24} className="mr-2 fill-current" /> Confirmar e Iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CONFIGURAR RUTA --- */}
      {modalConfigOpen && (
        <div className="fixed inset-0 bg-primary-dark/90 z-[70] flex items-center justify-center p-2 md:p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col h-[90vh]">
            <div className="p-6 border-b border-primary-light/20 flex justify-between items-center bg-background rounded-t-[2rem]">
              <h2 className="text-2xl font-bold text-primary-dark tracking-wide">{rutaEditando.id ? 'Editar Ruta Fija' : 'Nueva Ruta'}</h2>
              <button onClick={() => setModalConfigOpen(false)} className="p-2 bg-white rounded-full shadow-sm"><X size={24}/></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4 mb-6">
                <input type="text" placeholder="Nombre de la ruta..." value={rutaEditando.nombre} onChange={e => setRutaEditando({...rutaEditando, nombre: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary text-xl font-bold text-primary-dark tracking-wide" />
                <select value={rutaEditando.dia_semana} onChange={e => setRutaEditando({...rutaEditando, dia_semana: Number(e.target.value)})} className="w-full p-4 rounded-2xl border-2 border-primary-light/30 focus:border-primary font-bold text-primary-dark text-lg">
                  {DIAS_SEMANA.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>

              <div className="border-t border-primary-light/20 pt-6">
                <h3 className="font-bold text-primary-dark text-lg mb-3 flex items-center"><Users size={20} className="mr-2 text-primary"/> Orden de Visita Fijo</h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3.5 text-primary" size={20}/>
                  <input type="text" placeholder="Buscar cliente para agregar..." value={busquedaCliente} onChange={e=>setBusquedaCliente(e.target.value)} className="w-full pl-11 py-3.5 rounded-2xl bg-slate-50 border-2 border-primary-light/20 focus:border-primary font-medium text-primary-dark"/>
                  {busquedaCliente && (
                    <div className="absolute top-[60px] left-0 w-full bg-white shadow-2xl border border-primary-light/20 rounded-2xl z-10 max-h-48 overflow-y-auto">
                      {clientesBuscados.map(c => (
                         <button key={c.id} onClick={() => {toggleClienteConfig(c.id); setBusquedaCliente('');}} className="w-full text-left p-4 hover:bg-slate-50 border-b border-primary-light/10 font-bold text-primary-dark flex justify-between">
                           {c.nombre_negocio} <span className="text-secondary font-medium text-sm">{rutaEditando.clientes_orden.includes(c.id) ? '(Ya en ruta)' : '+ Agregar'}</span>
                         </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {rutaEditando.clientes_orden.length === 0 && <p className="text-secondary italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-primary-light/40">Buscá y agregá clientes a esta ruta.</p>}
                  {rutaEditando.clientes_orden.map((clienteId, index) => {
                    const c = clientes.find(x => x.id === clienteId);
                    if(!c) return null;
                    return (
                      <div key={clienteId} className="flex justify-between items-center p-3 border border-primary-light/30 rounded-2xl bg-white shadow-sm group">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <span className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black shrink-0">{index + 1}</span>
                          <span className="font-bold text-primary-dark truncate">{c.nombre_negocio}</span>
                        </div>
                        <div className="flex space-x-1 shrink-0 ml-2">
                          <button disabled={index === 0} onClick={() => moverClienteConfig(index, -1)} className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors"><ArrowUp size={20}/></button>
                          <button disabled={index === rutaEditando.clientes_orden.length - 1} onClick={() => moverClienteConfig(index, 1)} className="p-2 bg-slate-100 hover:bg-primary hover:text-white rounded-xl disabled:opacity-30 transition-colors"><ArrowDown size={20}/></button>
                          <button onClick={() => toggleClienteConfig(clienteId)} className="p-2 ml-1 text-danger hover:bg-danger/10 rounded-xl transition-colors"><X size={20}/></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-primary-light/20 bg-background rounded-b-[2rem]">
              <button onClick={guardarRuta} className="w-full py-4 bg-primary-dark hover:bg-primary text-white font-bold rounded-2xl text-xl shadow-lg active:scale-95 transition-colors tracking-wide">
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
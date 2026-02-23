import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Phone, Package, DollarSign, Pencil, Trash2, KeyRound } from 'lucide-react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clientesService } from '../../api/clienteService';
import { productosService } from '../../api/productoService'; 
import { ClienteModal } from './ClienteModal';
import { CobroModal } from './CobroModal';

export const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);
  
  const [cobroModalAbierto, setCobroModalAbierto] = useState(false);
  const [clienteParaCobrar, setClienteParaCobrar] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, productosData] = await Promise.all([
          clientesService.getAll(),
          productosService.getAll()
        ]);
        setClientes(clientesData);
        setProductos(productosData);
      } catch (error) {
        console.error("Error al cargar datos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Creamos un diccionario rápido para traducir ID -> Nombre (Ej: "1" -> "Bidón 20L")
  const mapaProductos = productos.reduce((acc, prod) => {
    acc[prod.id] = prod.nombre;
    return acc;
  }, {});

  const clientesFiltrados = clientes.filter(c => 
    c.nombre_negocio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro que querés eliminar a "${nombre}"?`)) {
      try {
        await api.delete(`/clientes/${id}`);
        setClientes(clientes.filter(cliente => cliente.id !== id));
        toast.success("Cliente eliminado exitosamente");
      } catch (error) {
        toast.error("No se pudo eliminar el cliente");
      }
    }
  };

  const abrirModalNuevo = () => { setClienteEditandoId(null); setIsModalOpen(true); };
  const abrirModalEditar = (id) => { setClienteEditandoId(id); setIsModalOpen(true); };
  const abrirCobro = (cliente) => { setClienteParaCobrar(cliente); setCobroModalAbierto(true); };

  const handleGuardadoExitoso = (clienteGuardado) => {
    if (clienteEditandoId) {
      setClientes(clientes.map(c => c.id === clienteGuardado.id ? clienteGuardado : c));
    } else {
      setClientes([clienteGuardado, ...clientes]);
    }
  };

  const renderEnvases = (stock) => {
    if (!stock || Object.keys(stock).length === 0) return <span className="text-secondary font-medium">Sin envases</span>;
    
    const items = Object.entries(stock).filter(([_, cant]) => cant > 0);
    if (items.length === 0) return <span className="text-secondary font-medium">Sin envases</span>;

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {items.map(([id, cant]) => (
          <span key={id} className="bg-primary/10 border border-primary/20 text-primary-dark px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
            {cant} {mapaProductos[id] || 'Unidades'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">Clientes</h1>
            <p className="text-primary-light font-medium mt-1 tracking-wider">{clientes.length} registrados</p>
          </div>
          <button onClick={() => abrirModalNuevo()} className="bg-white text-primary hover:bg-primary-light transition-colors py-3 px-5 rounded-2xl flex items-center shadow-sm font-bold text-lg">
            <Plus size={22} className="md:mr-2" />
            <span className="hidden md:inline tracking-wider">Nuevo Cliente</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search size={20} className="text-primary" /></div>
          <input type="text" placeholder="Buscar por nombre o dirección..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 bg-slate-50 text-primary-dark font-bold tracking-wide shadow-sm text-lg" />
        </div>
      </div>

      <div className="p-5 md:p-12 lg:px-20 max-w-7xl mx-auto mt-2">
        {loading ? (
          <p className="text-center text-secondary mt-10 text-xl tracking-wider animate-pulse">Cargando catálogo...</p>
        ) : clientesFiltrados.length === 0 ? (
          <p className="text-center text-secondary mt-10 text-xl tracking-wide">No se encontraron resultados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-primary-light/20 relative hover:shadow-md transition-shadow">
                
                <div className="absolute top-5 right-5 flex space-x-2 text-gray-400">
                  <button onClick={() => abrirCobro(cliente)} className="text-success bg-success/10 p-2 rounded-xl hover:bg-success/20 transition-colors" title="Cobrar saldo"><DollarSign size={20} strokeWidth={3} /></button>
                  <button onClick={() => abrirModalEditar(cliente.id)} className="text-primary bg-primary/10 p-2 rounded-xl hover:bg-primary/20 transition-colors"><Pencil size={20} /></button>
                  <button onClick={() => handleDelete(cliente.id, cliente.nombre_negocio)} className="text-danger bg-danger/10 p-2 rounded-xl hover:bg-danger/20 transition-colors"><Trash2 size={20} /></button>
                </div>

                <h3 className="font-bold text-primary-dark text-xl md:text-2xl mb-4 pr-32 tracking-tight leading-tight">{cliente.nombre_negocio}</h3>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start text-secondary text-sm font-medium">
                    <MapPin size={18} className="mr-3 mt-0.5 shrink-0 text-primary" />
                    <span className="leading-snug">{cliente.direccion}</span>
                  </div>
                  {cliente.telefono && (
                    <div className="flex items-center text-secondary text-sm font-medium">
                      <Phone size={18} className="mr-3 shrink-0 text-primary" />
                      <span>{cliente.telefono}</span>
                    </div>
                  )}
                </div>

                <div className="bg-background rounded-2xl p-4 flex flex-col gap-3 border border-primary-light/30">
                  <div className="flex items-center justify-between font-bold border-b border-primary-light/20 pb-3">
                    <span className="text-secondary flex items-center tracking-wide"><DollarSign size={18} className="mr-2 text-primary"/> SALDO</span>
                    <span className={`text-xl ${cliente.saldo_dinero > 0 ? "text-danger" : cliente.saldo_dinero < 0 ? "text-success" : "text-primary-dark"}`}>
                      ${Math.abs(cliente.saldo_dinero)} <span className="text-xs uppercase ml-1 opacity-70">{cliente.saldo_dinero > 0 ? '(debe)' : cliente.saldo_dinero < 0 ? '(a favor)' : ''}</span>
                    </span>
                  </div>
                  <div className="flex flex-col font-bold">
                    <span className="text-secondary flex items-center tracking-wide mb-1"><Package size={18} className="mr-2 text-primary"/> ENVASES PRESTADOS</span>
                    {renderEnvases(cliente.stock_envases)}
                  </div>
                </div>

                {cliente.observaciones && (
                  <p className="text-sm text-secondary mt-4 italic border-l-2 border-primary-light/50 pl-3">
                    "{cliente.observaciones}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ClienteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clienteId={clienteEditandoId} onSuccess={handleGuardadoExitoso} />
      <CobroModal isOpen={cobroModalAbierto} onClose={() => setCobroModalAbierto(false)} cliente={clienteParaCobrar} onSuccess={() => window.location.reload()} />
    </div>
  );
};
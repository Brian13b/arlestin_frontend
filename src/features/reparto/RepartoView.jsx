import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Check, MapPin, Phone, Minus, Plus, Banknote, CreditCard, BookOpen, X, Search, UserPlus, Package } from 'lucide-react';
import { recorridoService } from '../../api/recorridoService';
import { clientesService } from '../../api/clienteService';
import { productosService } from '../../api/productoService';
import { ClienteModal } from '../clientes/ClienteModal';
import toast from 'react-hot-toast';

export const RepartoView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [clientesRuta, setClientesRuta] = useState(location.state?.clientesActivos || []);
  const [indiceActual, setIndiceActual] = useState(0);
  const clienteActual = clientesRuta[indiceActual];
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recorrido, setRecorrido] = useState(null);
  const [catalogo, setCatalogo] = useState([]);

  const [movimientos, setMovimientos] = useState({});
  const [descuento, setDescuento] = useState('');
  const [montoCobrado, setMontoCobrado] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [resumenViaje, setResumenViaje] = useState({
    efectivo: 0, transferencia: 0, fiado: 0, productos: {}
  });

  // Modales
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [modalFormularioAbierta, setModalFormularioAbierta] = useState(false);  

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const rutaData = await recorridoService.getById(id);
        setRecorrido(rutaData);
        const prods = await productosService.getAll();
        setCatalogo(prods);
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, [id]);

  useEffect(() => {
    if (!clienteActual && !loading) navigate('/recorridos');
    setMovimientos({});
    setMontoCobrado(''); 
    setDescuento('');
    setMetodoPago('efectivo');
  }, [indiceActual, clienteActual, loading, navigate]);

  const updateCantidad = (prodId, tipo, incremento) => {
    setMovimientos(prev => {
      const actual = prev[prodId]?.[tipo] || 0;
      const nuevo = actual + incremento;
      return {
        ...prev,
        [prodId]: {
          ...(prev[prodId] || { entregado: 0, devuelto: 0 }),
          [tipo]: nuevo < 0 ? 0 : nuevo
        }
      };
    });
  };

  const subtotalEnvases = catalogo.reduce((acc, p) => {
    const entregados = movimientos[p.id]?.entregado || 0;
    return acc + (entregados * p.precio_actual);
  }, 0);
  
  const descuentoNum = Number(descuento) || 0;
  const totalEntregaHoy = subtotalEnvases - descuentoNum;
  
  const saldoAnterior = clienteActual?.saldo_dinero || 0;
  const deudaTotal = saldoAnterior + totalEntregaHoy;
  const cobradoNum = Number(montoCobrado) || 0;
  const nuevoSaldoProyectado = deudaTotal - cobradoNum;

  const abrirModalAgregar = async () => {
    try {
      const todos = await clientesService.getAll();
      const idsEnRuta = clientesRuta.map(c => c.id);
      setClientesDisponibles(todos.filter(c => !idsEnRuta.includes(c.id)));
      setModalAgregarAbierto(true);
    } catch (e) { toast.error("Error al buscar"); }
  };

  const agregarClienteAlPaso = (cliente) => {
    const nuevasRutas = [...clientesRuta];
    nuevasRutas.splice(indiceActual + 1, 0, cliente);
    setClientesRuta(nuevasRutas);
    setModalAgregarAbierto(false);
    toast.success(`Agregado como próxima parada`);
  };

  const clientesFiltrados = clientesDisponibles.filter(c => 
    c.nombre_negocio.toLowerCase().includes(busquedaCliente.toLowerCase()) || 
    c.direccion.toLowerCase().includes(busquedaCliente.toLowerCase())
  );

  const handleConfirmar = async () => {
    setIsSubmitting(true);
    
    const cobroFinal = metodoPago === 'cta_corriente' ? 0 : cobradoNum;

    const payload = {
      cliente_id: clienteActual.id,
      recorrido_id: recorrido.id,
      detalles: movimientos, 
      monto_total: totalEntregaHoy,
      monto_cobrado: cobroFinal,
      metodo_pago: metodoPago,
      observacion: descuentoNum > 0 ? `Descuento aplicado: -$${descuentoNum}` : ""
    };

    try {
      await recorridoService.registrarMovimiento(payload);

      const nuevosProductos = { ...resumenViaje.productos };
      catalogo.forEach(p => {
        const mov = movimientos[p.id];
        if (mov && (mov.entregado > 0 || mov.devuelto > 0)) {
          if (!nuevosProductos[p.id]) nuevosProductos[p.id] = { nombre: p.nombre, entregado: 0, devuelto: 0 };
          nuevosProductos[p.id].entregado += mov.entregado || 0;
          nuevosProductos[p.id].devuelto += mov.devuelto || 0;
        }
      });

      const resumenActualizado = {
        efectivo: resumenViaje.efectivo + (metodoPago === 'efectivo' ? cobroFinal : 0),
        transferencia: resumenViaje.transferencia + (metodoPago === 'transferencia' ? cobroFinal : 0),
        fiado: resumenViaje.fiado + (metodoPago === 'cta_corriente' ? totalEntregaHoy : 0),
        productos: nuevosProductos
      };

      setResumenViaje(resumenActualizado);

      toast.success(`Guardado. Nuevo saldo: $${Math.abs(nuevoSaldoProyectado)}`);

      avanzarOSalir(resumenActualizado);
      
    } catch (error) {
      toast.error("Error al guardar la entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avanzarOSalir = (resumenActual = resumenViaje) => {
    if (indiceActual < clientesRuta.length - 1) {
      setIndiceActual(indiceActual + 1);
      window.scrollTo(0, 0);
    } else {
      navigate('/reparto/resumen', { state: { resumen: resumenActual, nombreRuta: recorrido?.nombre } });
    }
  };

  if (loading || !clienteActual) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="bg-primary text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div>
          <p className="text-primary-light text-xs font-semibold uppercase tracking-wider">Recorrido en curso</p>
          <h1 className="text-lg font-bold">Cliente {indiceActual + 1} de {clientesRuta.length}</h1>
        </div>
        <button onClick={() => avanzarOSalir()} className="bg-white text-slate-800 text-sm font-bold py-2 px-4 rounded-full flex items-center">
          <Check size={16} className="mr-1" /> Finalizar
        </button>
      </div>

      <div className="max-w-md mx-auto p-3 space-y-3 mt-2">
        
        {/* INFO CLIENTE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <span className="float-right bg-primary text-white text-xs font-bold px-2 py-1 rounded-md">Pendiente</span>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{clienteActual.nombre_negocio}</h2>
          <p className="flex items-start text-slate-500 text-sm mb-4"><MapPin size={16} className="mr-2 text-primary shrink-0 mt-0.5" /> {clienteActual.direccion}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
               <p className="text-[10px] text-slate-500 uppercase font-bold">Saldo Histórico</p>
               <p className={`text-lg font-bold ${saldoAnterior > 0 ? 'text-danger' : saldoAnterior < 0 ? 'text-success' : 'text-slate-800'}`}>${Math.abs(saldoAnterior)} {saldoAnterior > 0 ? '(Debe)' : ''}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Envases Prestados</p>
              <span>{Object.values(clienteActual.stock_envases || {}).reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
        </div>

        {/* --- CATÁLOGO DINÁMICO --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center"><Package size={18} className="mr-2 text-primary"/> Registro de Envases</h3>
          
          <div className="space-y-4">
            {catalogo.filter(p => p.activo).map(prod => (
              <div key={prod.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">{prod.nombre}</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">${prod.precio_actual}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna Entregado */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Dejás</span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateCantidad(prod.id, 'entregado', -1)} className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600"><Minus size={16}/></button>
                      <span className="w-4 text-center font-bold text-lg">{movimientos[prod.id]?.entregado || 0}</span>
                      <button onClick={() => updateCantidad(prod.id, 'entregado', 1)} className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600"><Plus size={16}/></button>
                    </div>
                  </div>
                  
                  {/* Columna Devuelto */}
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Te Llevás</span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateCantidad(prod.id, 'devuelto', -1)} className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600"><Minus size={16}/></button>
                      <span className="w-4 text-center font-bold text-lg">{movimientos[prod.id]?.devuelto || 0}</span>
                      <button onClick={() => updateCantidad(prod.id, 'devuelto', 1)} className="w-8 h-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600"><Plus size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DESCUENTO */}
        <div className="bg-orange-50 rounded-2xl p-4 flex justify-between items-center">
           <span className="font-bold text-orange-800 text-sm">Descuento Promocional</span>
           <div className="relative w-28">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-700 font-bold">$</span>
             <input type="number" value={descuento} onChange={e => setDescuento(e.target.value)} className="w-full bg-white rounded-xl py-2 pl-7 pr-3 font-bold text-right outline-none" placeholder="0" />
           </div>
        </div>

        {/* PAGO Y CALCULADORA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-bold text-slate-800 mb-3">Método de Pago</h3>
          <div className="flex space-x-2 mb-5">
            <button onClick={() => setMetodoPago('efectivo')} className={`flex-1 py-3 flex flex-col items-center rounded-xl border ${metodoPago === 'efectivo' ? 'border-primary bg-primary/5 text-primary' : 'text-slate-500'}`}><Banknote size={20}/><span className="text-xs font-semibold">Efectivo</span></button>
            <button onClick={() => setMetodoPago('transferencia')} className={`flex-1 py-3 flex flex-col items-center rounded-xl border ${metodoPago === 'transferencia' ? 'border-primary bg-primary/5 text-primary' : 'text-slate-500'}`}><CreditCard size={20}/><span className="text-xs font-semibold">Transf.</span></button>
            <button onClick={() => {setMetodoPago('cta_corriente'); setMontoCobrado('');}} className={`flex-1 py-3 flex flex-col items-center rounded-xl border ${metodoPago === 'cta_corriente' ? 'border-primary bg-primary/5 text-primary' : 'text-slate-500'}`}><BookOpen size={20}/><span className="text-xs font-semibold">Fiado</span></button>
          </div>

          <div className="space-y-2 text-sm text-slate-600 mb-4 px-2">
            <div className="flex justify-between"><p>Venta de hoy:</p> <p className="font-bold text-primary">${totalEntregaHoy}</p></div>
            <div className="flex justify-between"><p>Deuda Anterior:</p> <p>${saldoAnterior}</p></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-800"><p>Total a Pagar:</p> <p>${deudaTotal}</p></div>
          </div>

          {metodoPago !== 'cta_corriente' && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">¿Cuánto abona ahora?</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" value={montoCobrado} onChange={(e) => setMontoCobrado(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-8 pr-4 text-lg font-bold" placeholder="Ej: 5000" />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setMontoCobrado(totalEntregaHoy.toString())} className="text-xs bg-slate-100 px-3 py-1 rounded-full font-semibold">Pagar solo hoy</button>
                <button onClick={() => setMontoCobrado(deudaTotal > 0 ? deudaTotal.toString() : '0')} className="text-xs bg-slate-100 px-3 py-1 rounded-full font-semibold">Saldar todo</button>
              </div>
            </div>
          )}

          <div className={`rounded-xl p-4 flex justify-between items-center ${nuevoSaldoProyectado > 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
            <span className="font-bold text-sm">{nuevoSaldoProyectado > 0 ? 'Queda debiendo:' : 'Saldo a favor:'}</span>
            <span className="text-xl font-black">${Math.abs(nuevoSaldoProyectado)}</span>
          </div>
        </div>

        {/* BOTONES INFERIORES */}
        <div className="flex space-x-3 pt-2">
          <button onClick={() => avanzarOSalir()} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold">Omitir</button>
          <button onClick={handleConfirmar} disabled={isSubmitting} className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold flex justify-center items-center">
            {isSubmitting ? 'Guardando...' : <><Check size={18} className="mr-2"/> Confirmar</>}
          </button>
        </div>

        {/* PAGINADOR Y AGREGAR AL PASO */}
        <div className="flex justify-between items-center px-2 py-4 text-sm font-semibold text-slate-400">
          <button disabled={indiceActual === 0} onClick={() => setIndiceActual(indiceActual - 1)}>&lt; Ant</button>
          <button onClick={abrirModalAgregar} className="flex items-center text-primary bg-primary/10 px-4 py-2 rounded-full"><UserPlus size={16} className="mr-2"/> Agregar al paso</button>
          <button disabled={indiceActual === clientesRuta.length - 1} onClick={() => setIndiceActual(indiceActual + 1)}>Sig &gt;</button>
        </div>
      </div>

      {/* --- MODALES --- */}
      {modalAgregarAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col h-[70vh]">
            <div className="p-4 border-b flex justify-between"><h2 className="font-bold">Agregar al paso</h2><button onClick={() => setModalAgregarAbierto(false)}><X/></button></div>
            <div className="p-4 space-y-3"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input type="text" placeholder="Buscar..." value={busquedaCliente} onChange={e=>setBusquedaCliente(e.target.value)} className="w-full bg-slate-50 rounded-xl py-2 pl-10"/></div><button onClick={() => setModalFormularioAbierta(true)} className="w-full bg-primary/10 text-primary font-bold py-3 rounded-xl flex justify-center"><UserPlus size={18} className="mr-2"/> Crear Nuevo</button></div>
            <div className="overflow-y-auto p-2">{clientesFiltrados.map(c => (<button key={c.id} onClick={() => agregarClienteAlPaso(c)} className="w-full text-left p-3 hover:bg-slate-50 flex justify-between"><div><p className="font-bold">{c.nombre_negocio}</p><p className="text-xs text-slate-500">{c.direccion}</p></div><Plus className="text-primary"/></button>))}</div>
          </div>
        </div>
      )}
      <ClienteModal isOpen={modalFormularioAbierta} onClose={() => setModalFormularioAbierta(false)} onSuccess={(c) => agregarClienteAlPaso(c)} />
    </div>
  );
};
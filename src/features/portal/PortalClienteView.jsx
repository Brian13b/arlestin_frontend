import React, { useState, useEffect, useContext } from 'react';
import { LogOut, Package, DollarSign, MessageCircle, MapPin, AlertCircle, FileText } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { portalService } from '../../api/portalService';

export const PortalClienteView = () => {
  const { logout } = useContext(AuthContext);
  const [cuenta, setCuenta] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const NUMERO_WHATSAPP = "5491100000000"; 

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const dataCuenta = await portalService.getMiCuenta();
        setCuenta(dataCuenta);
        setMovimientos(dataCuenta.ultimos_movimientos || []); 
      } catch (error) {
        console.error("Error cargando portal");
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  const handlePedirPorWhatsApp = () => {
    const mensaje = `Hola! Necesito hacer un pedido para *${cuenta?.nombre_negocio}* (${cuenta?.direccion}).`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center animate-pulse text-primary font-bold text-2xl tracking-widest">Cargando tu cuenta...</div>;

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center pb-10">
      
      <div className="bg-primary-dark w-full pt-12 pb-10 shadow-lg rounded-b-[40px] relative text-center">
        <div className="max-w-2xl mx-auto px-5">
          <button onClick={logout} className="absolute top-6 right-6 text-white/60 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors"><LogOut size={24} /></button>
          <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/20"><MapPin size={32} className="text-primary-light" /></div>
          <h1 className="text-sm font-bold text-primary-light uppercase tracking-widest mb-2">Mi Cuenta Arlestin</h1>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-wide">{cuenta?.nombre_negocio}</h2>
          <p className="text-primary-light text-lg mt-2 font-medium">{cuenta?.direccion}</p>
        </div>
      </div>

      <div className="p-5 w-full max-w-2xl -mt-6 space-y-5">
        {cuenta?.saldo_dinero > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-3xl p-5 flex items-start space-x-4 shadow-sm">
            <AlertCircle size={28} className="shrink-0 mt-0.5 text-orange-500" />
            <div>
              <p className="font-bold text-orange-800 text-lg tracking-wide">Tenés un saldo pendiente</p>
              <p className="text-sm text-orange-700 font-medium mt-1">Por favor, recordá abonar en la próxima visita.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-light/20 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${cuenta?.saldo_dinero > 0 ? 'bg-danger/10 text-danger' : cuenta?.saldo_dinero < 0 ? 'bg-success/10 text-success' : 'bg-background text-secondary'}`}>
              <DollarSign size={32} />
            </div>
            <p className="text-sm font-bold text-secondary uppercase tracking-widest">Mi Saldo</p>
            <p className={`text-4xl font-black mt-2 tracking-wide ${cuenta?.saldo_dinero > 0 ? 'text-danger' : cuenta?.saldo_dinero < 0 ? 'text-success' : 'text-primary-dark'}`}>
              ${Math.abs(cuenta?.saldo_dinero || 0)}
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-primary-light/20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <p className="text-sm font-bold text-secondary uppercase tracking-widest">Mis Envases</p>
            <p className="text-5xl font-black mt-2 text-primary-dark tracking-wide">{cuenta?.total_envases}</p>
          </div>
        </div>

        <button onClick={handlePedirPorWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-5 rounded-3xl flex items-center justify-center shadow-lg shadow-green-200 transition-all active:scale-95 text-xl tracking-wider">
          <MessageCircle size={28} className="mr-3" /> Hacer Pedido por WhatsApp
        </button>

        {/* SECCIÓN DE HISTORIAL DEL CLIENTE */}
        <div className="mt-8 pt-6 border-t border-primary-light/30">
          <h3 className="font-bold text-primary-dark text-xl tracking-wide flex items-center mb-4"><FileText size={22} className="mr-2 text-primary"/> Últimos Movimientos</h3>
          <div className="space-y-3">
            {movimientos.length === 0 ? (
              <p className="text-secondary text-center py-4 bg-white rounded-2xl border border-dashed border-primary-light/40">No hay movimientos recientes.</p>
            ) : (
              movimientos.map((mov, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-primary-light/20 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-primary-dark tracking-wide">{mov.fecha}</p>
                    <p className="text-sm text-secondary font-medium">{mov.resumen_productos || 'Solo Cobro'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-primary-dark">${mov.monto}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400">{mov.tipo}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
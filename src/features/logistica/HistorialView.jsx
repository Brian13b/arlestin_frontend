import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Banknote, FileText, CreditCard, Calendar as CalendarIcon, BookOpen, CalendarDays } from 'lucide-react';
import { recorridoService } from '../../api/recorridoService';

const getFechaLocalHoy = () => {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

export const HistorialView = () => {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState([]);
  const [resumenMes, setResumenMes] = useState({ efectivo: 0, transferencia: 0, fiado: 0 });
  const [loading, setLoading] = useState(true);
  
  const [fechaFiltro, setFechaFiltro] = useState(getFechaLocalHoy());

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [historialDia, datosMes] = await Promise.all([
          recorridoService.getHistorialPorFecha(fechaFiltro),
          recorridoService.getResumenMesActual()
        ]);
        setMovimientos(historialDia);
        setResumenMes(datosMes);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [fechaFiltro]);

  const totalEfectivoDia = movimientos.filter(m => m.metodo_pago === 'efectivo').reduce((acc, m) => acc + m.monto_cobrado, 0);
  const totalTransferenciaDia = movimientos.filter(m => m.metodo_pago === 'transferencia').reduce((acc, m) => acc + m.monto_cobrado, 0);
  const totalFiadoDia = movimientos.filter(m => m.metodo_pago === 'cta_corriente').reduce((acc, m) => acc + m.monto_total, 0); 

  const esHoy = fechaFiltro === getFechaLocalHoy();

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="hover:bg-white/20 p-2 rounded-full transition-colors -ml-2 mr-3"><ArrowLeft size={28} /></button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center">Auditoría de Caja</h1>
              <p className="text-primary-light text-sm md:text-base font-medium mt-1 tracking-wider">Control financiero</p>
            </div>
          </div>
          <div className="relative max-w-5">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CalendarIcon size={20} className="text-primary-dark" /></div>
            <input type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} className="pl-10 pr-4 py-3 bg-white text-primary-dark font-bold tracking-widest text-lg rounded-2xl border-2 border-primary-light/50 focus:outline-none focus:border-primary shadow-sm w-full md:w-auto" />
          </div>
        </div>
      </div>

      <div className="p-5 md:p-12 lg:px-20 max-w-7xl mx-auto mt-2 space-y-8">
        
        {/* RECAUDACIÓN DEL MES */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-1 rounded-3xl shadow-md">
          <div className="bg-white rounded-[22px] p-5">
            <h2 className="text-lg font-bold text-primary-dark uppercase tracking-widest mb-4 flex items-center border-b border-primary-light/30 pb-3">
               <CalendarDays size={22} className="mr-2 text-primary"/> Total Acumulado del Mes
            </h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs md:text-sm font-bold text-secondary uppercase tracking-wider mb-1">Efectivo</p>
                <p className="text-2xl md:text-4xl font-black text-success">${resumenMes.efectivo}</p>
              </div>
              <div className="border-x border-primary-light/30">
                <p className="text-xs md:text-sm font-bold text-secondary uppercase tracking-wider mb-1">Bancos</p>
                <p className="text-2xl md:text-4xl font-black text-primary">${resumenMes.transferencia}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-secondary uppercase tracking-wider mb-1">Fiado</p>
                <p className="text-2xl md:text-4xl font-black text-orange-500">${resumenMes.fiado}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RESUMEN DEL DÍA SELECCIONADO */}
        <div>
          <h2 className="text-lg font-bold text-secondary uppercase tracking-widest mb-3 ml-2">Resumen del {fechaFiltro.split('-').reverse().join('/')}</h2>
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="bg-success text-white p-4 md:p-6 rounded-3xl shadow-sm border border-success/50 flex flex-col items-center text-center"><Banknote size={24} className="mb-2 opacity-80" /><p className="text-xs md:text-sm font-bold opacity-90 tracking-wider">Efectivo</p><p className="text-2xl md:text-4xl font-black mt-1">${totalEfectivoDia}</p></div>
            <div className="bg-primary text-white p-4 md:p-6 rounded-3xl shadow-sm border border-primary-light/50 flex flex-col items-center text-center"><CreditCard size={24} className="mb-2 opacity-80" /><p className="text-xs md:text-sm font-bold opacity-90 tracking-wider">Transf.</p><p className="text-2xl md:text-4xl font-black mt-1">${totalTransferenciaDia}</p></div>
            <div className="bg-white text-slate-700 p-4 md:p-6 rounded-3xl shadow-sm border border-primary-light/30 flex flex-col items-center text-center"><BookOpen size={24} className="mb-2 text-slate-400" /><p className="text-xs md:text-sm font-bold text-slate-500 tracking-wider">A Cuenta</p><p className="text-2xl md:text-4xl font-black mt-1 text-primary-dark">${totalFiadoDia}</p></div>
          </div>
        </div>

        {/* LISTA DE MOVIMIENTOS */}
        <h2 className="text-xl font-bold text-primary-dark tracking-wide flex items-center mb-2 pt-2"><FileText size={24} className="mr-2 text-primary"/> Operaciones Detalladas</h2>
        
        {loading ? <p className="text-center text-secondary mt-10 text-xl tracking-wider animate-pulse">Buscando operaciones...</p> : movimientos.length === 0 ? <div className="bg-white p-10 md:p-16 rounded-3xl border border-dashed border-primary-light/40 text-center"><Clock size={40} className="mx-auto text-primary-light mb-3" /><p className="text-secondary text-xl tracking-wide">No se registraron movimientos.</p></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {movimientos.map(mov => (
              <div key={mov.id} className="bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20 relative overflow-hidden hover:shadow-md transition-all">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${mov.metodo_pago === 'efectivo' ? 'bg-success' : mov.metodo_pago === 'transferencia' ? 'bg-primary' : 'bg-orange-400'}`}></div>
                <div className="flex justify-between items-start mb-3 pl-3">
                  <div>
                    <span className="font-bold text-primary-dark text-xl tracking-wide block leading-tight pr-2">{mov.cliente}</span>
                    <span className="text-sm text-secondary font-medium block mt-1">{mov.hora}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-2xl block ${mov.metodo_pago === 'cta_corriente' ? 'text-orange-500' : 'text-primary-dark'}`}>${mov.metodo_pago === 'cta_corriente' ? mov.monto_total : mov.monto_cobrado}</span>
                    <span className="text-[10px] font-bold uppercase text-secondary bg-slate-100 px-2 py-0.5 rounded-md">{mov.metodo_pago === 'cta_corriente' ? 'Fiado' : mov.metodo_pago}</span>
                  </div>
                </div>
                <div className="pl-3 mt-4">
                  <p className="text-primary-dark font-medium text-sm bg-primary-light/20 border border-primary-light/30 inline-block px-3 py-1.5 rounded-xl">{mov.resumen_productos}</p>
                  {mov.observacion && <p className="text-sm text-secondary italic mt-3 border-l-2 border-primary-light/50 pl-3 py-1 bg-slate-50 rounded-r-lg">"{mov.observacion}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
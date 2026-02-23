import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Store, Clock, Tag, LogOut, ChevronRight, Settings } from 'lucide-react';

export const PerfilEmpresa = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const MenuItem = ({ icon: Icon, title, subtitle, onClick, danger }) => (
    <button onClick={onClick} className="w-full bg-white p-5 rounded-3xl shadow-sm border border-primary-light/20 flex items-center justify-between hover:bg-background hover:border-primary transition-all active:scale-95 group">
      <div className="flex items-center space-x-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${danger ? 'bg-danger/10 text-danger' : 'bg-primary-light/30 text-primary'}`}>
          <Icon size={28} />
        </div>
        <div className="text-left">
          <p className={`font-bold text-xl tracking-wide ${danger ? 'text-danger' : 'text-primary-dark'}`}>{title}</p>
          {subtitle && <p className="text-sm text-secondary font-medium mt-1">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={24} className={`transition-transform group-hover:translate-x-1 ${danger ? 'text-danger/50' : 'text-primary/50'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="bg-primary-dark px-5 pt-16 pb-12 text-center relative mx-auto shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="w-28 h-28 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-xl border-4 border-white/20">
          <Store size={48} className="text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{user?.full_name || 'Mi Distribuidora'}</h1>
        <p className="text-primary-light font-medium text-lg mt-2 tracking-wide">{user?.username || 'admin@arlestin.com'}</p>
        <button className="absolute top-8 right-6 md:right-12 text-white/80 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors">
          <Settings size={28} /> {/* Funcion a futuro: Version 2.0*/}
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-5 md:p-8 space-y-8 mt-2">
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-bold text-secondary uppercase tracking-widest ml-4">Panel de Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MenuItem icon={Clock} title="Cierre Diario" subtitle="Historial de ventas y cobros" onClick={() => navigate('/historial')} />
            <MenuItem icon={Tag} title="Lista de Precios" subtitle="Configurar catálogo y valores" onClick={() => navigate('/precios')} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-primary-light/20">
          <h3 className="text-sm md:text-base font-bold text-secondary uppercase tracking-widest ml-4">Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MenuItem icon={LogOut} title="Cerrar Sesión" subtitle="Salir de la cuenta de empresa" danger onClick={handleLogout} />
          </div>
        </div>

        <div className="text-center pt-10 opacity-60">
          <p className="text-sm font-bold text-primary-dark tracking-widest">Arlestin Logística v1.2.0</p>
          <p className="text-xs text-secondary mt-1 font-medium">Distribuidora de Agua.</p>
        </div>
      </div>
    </div>
  );
};
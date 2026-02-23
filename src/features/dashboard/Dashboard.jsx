import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Package, Users, DollarSign, TrendingUp, ChevronRight, Droplet } from 'lucide-react';
import { dashboardService } from '../../api/dashboardService';

const StatCard = ({ title, value, subtext, icon: Icon, isPrimary = false }) => (
  <div className={`p-6 rounded-3xl shadow-sm border flex flex-col justify-between transition-transform hover:-translate-y-1 ${isPrimary ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-white border-primary-light/20'}`}>
    <div className="flex items-center space-x-3 mb-4 opacity-90">
      <div className={`p-2 rounded-xl ${isPrimary ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
        <Icon size={24} />
      </div>
      <span className="text-sm md:text-base font-bold tracking-wide">{title}</span>
    </div>
    <div>
      <h3 className="text-4xl md:text-5xl font-black tracking-tight">{value}</h3>
      {subtext && <p className={`text-sm mt-2 font-medium ${isPrimary ? 'text-primary-light' : 'text-secondary'}`}>{subtext}</p>}
    </div>
  </div>
);

const ActionButton = ({ label, primary = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full p-5 rounded-2xl flex items-center justify-between shadow-sm transition-all active:scale-95 hover:shadow-md ${
      primary ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/30' : 'bg-white hover:bg-slate-50 text-primary-dark border border-primary-light/20'
    }`}
  >
    <span className="font-bold text-lg">{label}</span>
    <ChevronRight size={24} className={primary ? 'text-white/70' : 'text-primary/50'} />
  </button>
);

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clientes_activos: 0, total_envases: 0, saldos_pendientes: 0, recaudacion_hoy: 0 });

  useEffect(() => {
    dashboardService.getResumen().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      {/* Header */}
      <div className="bg-primary-dark px-5 md:px-12 lg:px-20 pt-12 pb-8 md:pb-12 mb-8 shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center text-primary font-black text-4xl tracking-tight mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3">
              <Droplet size={36}/> 
            </div>
              Arlestin
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Buenos días</h1>
          <p className="text-white font-medium text-md mt-2">Resumen operativo de tu distribuidora</p>
        </div>
      </div>

      <div className="px-5 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Clientes Activos" value={stats.clientes_activos} icon={Users} />
          <StatCard title="Recaudación" value={`$${stats.recaudacion_hoy}`} icon={DollarSign} isPrimary />
          <StatCard title="Envases Calle" value={stats.total_envases} subtext="Total prestados" icon={Package} />
          <StatCard title="Saldos Pend." value={`$${stats.saldos_pendientes}`} icon={TrendingUp} />
        </div>

        <div className="mt-8 pt-4 border-t border-primary-light/20">
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton label="Iniciar Recorrido" primary onClick={() => navigate('/recorridos')} />
            <ActionButton label="Gestionar Clientes" onClick={() => navigate('/clientes')} />
          </div>
        </div>
      </div>
    </div>
  );
};
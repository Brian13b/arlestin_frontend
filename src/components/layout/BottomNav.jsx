import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, MapPin, Tag, UserCircle } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={clsx(
        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
        isActive ? "text-primary-dark font-bold scale-105" : "text-slate-400 hover:text-primary"
      )}
    >
      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="md:w-7 md:h-7" />
      <span className="text-[10px] md:text-xs tracking-wide">{label}</span>
    </Link>
  );
};

export const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 md:h-20 bg-white border-t border-primary-light/30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-safe">
      <div className="flex h-full w-full max-w-7xl mx-auto justify-around sm:justify-center sm:gap-16 items-center px-2">
        <NavItem to="/dashboard" icon={LayoutGrid} label="Inicio" />
        <NavItem to="/clientes" icon={Users} label="Clientes" />
        <NavItem to="/recorridos" icon={MapPin} label="Rutas" />
        <NavItem to="/precios" icon={Tag} label="Precios" />
        <NavItem to="/perfil" icon={UserCircle} label="Portal" />
      </div>
    </div>
  );
};
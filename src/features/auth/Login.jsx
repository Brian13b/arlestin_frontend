import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Droplet, Lock, Phone, MessageCircle } from 'lucide-react';
import { BotonInstalar } from '../../components/ui/BotonInstalar';

export const Login = () => {
  const { login, user } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const NUMERO_WHATSAPP = "5491100000000";

  useEffect(() => {
    if (user) {
      if (user.role?.toUpperCase() === 'CLIENTE') navigate('/mi-portal');
      else navigate('/dashboard'); 
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    const result = await login(username, password);
    if (!result.success) setError(result.error);
    setIsLoading(false);
  };

  const handlePedirPorWhatsApp = () => {
    const mensaje = `Hola! Necesito saber mi PIN.`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Lado Izquierdo */}
      <div className="bg-primary-dark md:w-1/2 md:min-h-screen flex flex-col items-center justify-center text-white pt-12 pb-24 md:py-12 px-4 shadow-2xl rounded-b-[40px] md:rounded-none md:rounded-r-[60px] z-10">
        <div className="bg-white/20 p-5 md:p-8 rounded-full backdrop-blur-sm mb-6 border border-white/30">
          <Droplet size={64} className="text-white fill-white/20" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-2 tracking-tight">Arlestin</h1>
        <p className="text-primary-light font-medium tracking-wide md:text-xl uppercase">Logística & Distribución</p>
      </div>

      {/* Lado Derecho */}
      <div className="flex-1 px-5 -mt-16 mb-8 md:mt-0 z-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-md border border-primary-light/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-dark tracking-tight">Bienvenido</h2>
            <p className="text-secondary mt-2 font-medium">Ingresá tus credenciales de acceso</p>
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-xl text-sm text-center mb-5 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">Usuario / Teléfono</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={20} className="text-primary" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-primary-light/30 rounded-2xl focus:ring-0 focus:border-primary bg-slate-50 text-primary-dark font-medium transition-colors text-lg"
                  placeholder="Ej: 261-1234567"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">Contraseña / PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-primary" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-primary-light/30 rounded-2xl focus:ring-0 focus:border-primary bg-slate-50 text-primary-dark font-black tracking-widest transition-colors text-lg"
                  placeholder="* * * *"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-dark hover:bg-primary text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-70 mt-4 text-xl tracking-wide"
            >
              {isLoading ? 'Verificando...' : 'Ingresar al sistema'}
            </button>
          </form>
          <button onClick={handlePedirPorWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-70 mt-4 text-xl tracking-wide">
            ¿No tenés PIN? Contactanos.
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
            <p className="text-[11px] text-secondary font-bold uppercase tracking-widest mb-3">Mejorá tu experiencia</p>
            <BotonInstalar />
          </div>

        </div>
      </div>
      
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export const BotonInstalar = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(checkStandalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert('Para instalar en iPhone:\n\n1. Tocá el botón de "Compartir" (el cuadradito con la flecha hacia arriba en la barra de abajo).\n2. Elegí la opción "Agregar a inicio".');
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  if (isStandalone || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <button 
      onClick={handleInstallClick} 
      className="bg-primary hover:bg-primary-dark text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center shadow-md transition-colors active:scale-95 w-full md:w-auto"
    >
      <Download size={18} className="mr-2" />
      Instalar App
    </button>
  );
};
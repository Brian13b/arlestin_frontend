import React, { useState } from 'react';
import { DollarSign, X, Banknote, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientesService } from '../../api/clienteService';

export const CobroModal = ({ isOpen, onClose, cliente, onSuccess }) => {
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('transferencia');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !cliente) return null;

  const handleCobrar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await clientesService.registrarPago(cliente.id, {
        monto: parseFloat(monto),
        metodo_pago: metodo,
        observacion: ""
      });
      toast.success("Pago registrado con éxito");
      onSuccess(); 
      onClose();
    } catch (error) {
      toast.error("Error al registrar el pago");
    } finally {
      setLoading(false);
      setMonto('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Registrar Pago</h2>
          <button onClick={onClose} className="text-gray-400 p-2"><X size={20} /></button>
        </div>

        <form onSubmit={handleCobrar} className="p-5 space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500">Cliente</p>
            <p className="font-bold text-slate-800">{cliente.nombre_negocio}</p>
            <div className="mt-2 inline-block bg-slate-100 px-3 py-1 rounded-full text-sm">
              Saldo actual: <span className={cliente.saldo_dinero > 0 ? 'text-danger font-bold' : 'text-success font-bold'}>${cliente.saldo_dinero}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monto a cobrar ($)</label>
            <input required type="number" min="1" value={monto} onChange={e => setMonto(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 bg-slate-50 font-bold text-xl text-center focus:ring-2 focus:ring-primary" placeholder="0" autoFocus />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setMonto(cliente.saldo_dinero > 0 ? cliente.saldo_dinero : '')} className="flex-1 text-xs bg-slate-100 py-1.5 rounded-lg text-slate-600 font-semibold hover:bg-slate-200">Saldar total</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Método</label>
            <div className="flex space-x-2">
              <button type="button" onClick={() => setMetodo('transferencia')} className={`flex-1 py-2 flex items-center justify-center rounded-xl border ${metodo === 'transferencia' ? 'border-primary bg-primary/10 text-primary' : 'text-slate-500'} text-sm font-semibold`}><CreditCard size={16} className="mr-2"/> Transf.</button>
              <button type="button" onClick={() => setMetodo('efectivo')} className={`flex-1 py-2 flex items-center justify-center rounded-xl border ${metodo === 'efectivo' ? 'border-primary bg-primary/10 text-primary' : 'text-slate-500'} text-sm font-semibold`}><Banknote size={16} className="mr-2"/> Efectivo</button>
            </div>
          </div>

          <button type="submit" disabled={loading || !monto} className="w-full bg-success text-white font-bold py-3 rounded-xl mt-4 disabled:opacity-50">
            {loading ? 'Guardando...' : 'Confirmar Cobro'}
          </button>
        </form>
      </div>
    </div>
  );
};
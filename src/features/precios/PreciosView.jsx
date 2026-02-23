import React, { useState, useEffect } from 'react';
import { Tag, Save, Package, Plus, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { productosService } from '../../api/productoService';

export const PreciosView = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', codigo: '', precio_actual: '' });

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      const data = await productosService.getAll();
      setProductos(data);
    } catch (error) { toast.error("Error al cargar lista"); } 
    finally { setLoading(false); }
  };

  const iniciarEdicion = (producto) => { setEditandoId(producto.id); setNuevoPrecio(producto.precio_actual.toString()); };

  const guardarPrecio = async (id) => {
    try {
      await productosService.updatePrecio(id, nuevoPrecio);
      toast.success("Precio actualizado");
      setEditandoId(null);
      cargarProductos();
    } catch (error) { 
      toast.error("Error al actualizar"); 
    }
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    try {
      await productosService.create({
        nombre: nuevoProducto.nombre,
        codigo: nuevoProducto.codigo.toLowerCase().replace(/ /g, '_'),
        precio_actual: parseFloat(nuevoProducto.precio_actual),
        activo: true
      });
      toast.success("Producto creado");
      setMostrandoFormulario(false);
      setNuevoProducto({ nombre: '', codigo: '', precio_actual: '' });
      cargarProductos();
    } catch (error) { toast.error("Error al crear"); }
  };

  const handleToggleActivo = async (id) => {
    try {
      await productosService.toggleActivo(id);
      cargarProductos();
      toast.success("Estado actualizado");
    } catch (error) { toast.error("Error al cambiar estado"); }
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="bg-primary-dark p-5 md:px-12 lg:px-20 pt-8 md:pt-12 sticky top-0 z-10 text-white shadow-md border-b-4 border-primary rounded-b-4xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide flex items-center">
              <Tag size={32} className="mr-3 text-white" />
              Productos
            </h1>
            <p className="text-primary-light text-sm md:text-base font-medium mt-1 tracking-wider">Gestión de catálogo y precios</p>
          </div>
          <button onClick={() => setMostrandoFormulario(!mostrandoFormulario)} className="bg-white text-primary hover:bg-primary-light hover:text-white transition-colors p-3 md:px-6 rounded-2xl flex items-center shadow-sm font-bold text-lg">
            {mostrandoFormulario ? <X size={24} /> : <><Plus size={24} className="md:mr-2" /><span className="hidden md:inline tracking-wider">Nuevo Producto</span></>}
          </button>
        </div>
      </div>

      <div className="p-5 md:p-12 lg:px-20 max-w-7xl mx-auto mt-2">
        
        {/* FORMULARIO */}
        {mostrandoFormulario && (
          <form onSubmit={handleCrearProducto} className="bg-white p-6 md:p-8 rounded-3xl shadow-md border-2 border-primary/20 animate-in slide-in-from-top-4 duration-300 mb-8 max-w-3xl mx-auto">
            <h3 className="font-bold text-primary-dark text-2xl mb-6 tracking-wide border-b border-primary-light/30 pb-4">Agregar al Catálogo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">Nombre / Promo</label>
                <input required type="text" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value, codigo: e.target.value})} className="w-full border-2 border-primary-light/30 rounded-2xl p-4 bg-slate-50 text-lg font-medium focus:ring-0 focus:border-primary" placeholder="Ej: Bidón 12L" />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">Precio de Venta ($)</label>
                <input required type="number" min="0" value={nuevoProducto.precio_actual} onChange={e => setNuevoProducto({...nuevoProducto, precio_actual: e.target.value})} className="w-full border-2 border-primary-light/30 rounded-2xl p-4 bg-slate-50 font-black text-primary text-xl focus:ring-0 focus:border-primary" placeholder="0" />
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto md:float-right bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-2xl mt-6 tracking-widest text-lg shadow-md transition-colors">
              Guardar Producto
            </button>
            <div className="clear-both"></div>
          </form>
        )}

        {/* LISTA GRILLA */}
        {loading ? (
          <p className="text-center text-secondary text-xl tracking-wider mt-10">Cargando catálogo...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {productos.map(prod => (
              <div key={prod.id} className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${!prod.activo ? 'border-dashed border-slate-300 opacity-60 grayscale' : 'border-primary-light/20 hover:border-primary hover:shadow-md'}`}>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${prod.activo ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary-dark text-xl tracking-wide leading-tight">{prod.nombre}</h3>
                      <p className="text-xs text-secondary font-mono mt-1 tracking-widest uppercase">ID: {prod.codigo}</p>
                    </div>
                  </div>
                  <button onClick={() => handleToggleActivo(prod.id)} className={`p-2 rounded-xl transition-colors ${prod.activo ? 'text-primary hover:bg-primary/10' : 'text-slate-400 hover:bg-slate-100'}`} title={prod.activo ? 'Desactivar' : 'Activar'}>
                    {prod.activo ? <Eye size={22} /> : <EyeOff size={22} />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-background p-4 rounded-2xl border border-primary-light/30">
                  {editandoId === prod.id ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-primary font-bold text-xl">$</span>
                      <input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} className="w-24 border-2 border-primary bg-white rounded-xl p-2 font-black text-primary-dark text-xl text-center focus:outline-none" autoFocus />
                      <button onClick={() => guardarPrecio(prod.id)} className="bg-success text-white p-2.5 rounded-xl hover:bg-emerald-600 shadow-sm"><Save size={20} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4 flex-wrap">
                      <span className="font-bold uppercase tracking-wider text-md text-primary-dark">Valor: ${prod.precio_actual}</span>
                      <button onClick={() => iniciarEdicion(prod)} className="text-primary bg-primary/10 hover:bg-primary hover:text-white font-bold px-4 py-2 rounded-xl transition-colors tracking-wide">
                        Modificar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
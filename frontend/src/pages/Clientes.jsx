import { useState, useEffect, useContext } from 'react';
import { obtenerClientes, actualizarCliente, eliminarCliente } from '../services/cliente';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UsersIcon, 
  UserPlusIcon, 
  UserMinusIcon, 
  IdentificationIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Clientes = () => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    correo: '',
    celular: '',
    direccion: '',
    estado: 1
  });

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await obtenerClientes();
      setClientes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      ci: cliente.ci || '',
      correo: cliente.correo,
      celular: cliente.celular || '',
      direccion: cliente.direccion || '',
      estado: cliente.estado
    });
    setMostrarModalEditar(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    
    try {
      await actualizarCliente(clienteSeleccionado.id_cliente, formData);
      toast.success('Cliente actualizado exitosamente');
      cargarClientes();
      setMostrarModalEditar(false);
      setClienteSeleccionado(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar cliente');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarCliente(id);
      toast.success('Cliente eliminado exitosamente');
      cargarClientes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  const handleToggleEstado = async (cliente) => {
    const nuevoEstado = cliente.estado === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Estás seguro de ${accion} este cliente?`)) {
      return;
    }

    try {
      await actualizarCliente(cliente.id_cliente, { ...cliente, estado: nuevoEstado });
      toast.success(`Cliente ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
      cargarClientes();
    } catch (err) {
      toast.error(err.response?.data?.message || `Error al ${accion} cliente`);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const busquedaLower = busqueda.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(busquedaLower) ||
      cliente.apellido.toLowerCase().includes(busquedaLower) ||
      cliente.correo.toLowerCase().includes(busquedaLower) ||
      cliente.ci?.includes(busqueda) ||
      cliente.celular?.includes(busqueda)
    );
  });

  // Estadísticas
  const stats = {
    total: clientes.length,
    activos: clientes.filter(c => c.estado === 1).length,
    inactivos: clientes.filter(c => c.estado === 0).length,
    conCI: clientes.filter(c => c.ci).length
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
            Gestión de Clientes
          </h1>
          <p className="text-gray-500 font-medium">Administra y visualiza todos los clientes registrados en el hostal</p>
        </div>
        <button 
          onClick={cargarClientes}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 font-semibold shadow-sm transition-all"
        >
          <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </motion.div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Clientes', value: stats.total, icon: UsersIcon, color: 'blue' },
          { label: 'Activos', value: stats.activos, icon: UserPlusIcon, color: 'green' },
          { label: 'Inactivos', value: stats.inactivos, icon: UserMinusIcon, color: 'red' },
          { label: 'Con CI Registrado', value: stats.conCI, icon: IdentificationIcon, color: 'purple' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Barra de Búsqueda */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 p-2"
      >
        <div className="relative flex items-center w-full">
          <MagnifyingGlassIcon className="absolute left-4 w-6 h-6 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, CI o celular..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-transparent border-none rounded-xl focus:ring-0 text-gray-800 text-lg placeholder-gray-400"
          />
          <AnimatePresence>
            {busqueda && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setBusqueda('')}
                className="absolute right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Contenido */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Cargando clientes...</p>
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded-2xl p-8 text-center"
        >
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-bold text-lg mb-6">{error}</p>
          <button
            onClick={cargarClientes}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
          >
            Intentar nuevamente
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {clientesFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Documento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registro</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    {(tienePermiso('cliente.editar') || tienePermiso('cliente.eliminar')) && (
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {clientesFiltrados.map((cliente, idx) => (
                      <motion.tr 
                        key={cliente.id_cliente}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${cliente.estado === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {cliente.nombre} {cliente.apellido}
                              </p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <EnvelopeIcon className="w-3 h-3 mr-1" />
                                {cliente.correo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {cliente.ci ? (
                            <div className="flex items-center text-sm font-medium text-gray-700">
                              <IdentificationIcon className="w-4 h-4 mr-2 text-gray-400" />
                              {cliente.ci}
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">Sin CI</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            {cliente.celular && (
                              <div className="flex items-center text-sm text-gray-700">
                                <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                {cliente.celular}
                              </div>
                            )}
                            {cliente.direccion && (
                              <div className="flex items-center text-sm text-gray-500 max-w-[200px]">
                                <MapPinIcon className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                                <span className="truncate">{cliente.direccion}</span>
                              </div>
                            )}
                            {!cliente.celular && !cliente.direccion && (
                              <span className="text-xs text-gray-400 italic">No proporcionado</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {formatearFecha(cliente.fecha_registro)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {tienePermiso('cliente.editar') ? (
                            <button
                              onClick={() => handleToggleEstado(cliente)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                cliente.estado === 1
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                              }`}
                            >
                              {cliente.estado === 1 ? (
                                <><CheckCircleIcon className="w-4 h-4 mr-1.5" /> Activo</>
                              ) : (
                                <><XCircleIcon className="w-4 h-4 mr-1.5" /> Inactivo</>
                              )}
                            </button>
                          ) : (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border ${
                              cliente.estado === 1
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {cliente.estado === 1 ? (
                                <><CheckCircleIcon className="w-4 h-4 mr-1.5" /> Activo</>
                              ) : (
                                <><XCircleIcon className="w-4 h-4 mr-1.5" /> Inactivo</>
                              )}
                            </span>
                          )}
                        </td>
                        {(tienePermiso('cliente.editar') || tienePermiso('cliente.eliminar')) && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {tienePermiso('cliente.editar') && (
                                <button
                                  onClick={() => handleAbrirModalEditar(cliente)}
                                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Editar cliente"
                                >
                                  <PencilSquareIcon className="w-5 h-5" />
                                </button>
                              )}
                              {tienePermiso('cliente.eliminar') && (
                                <button
                                  onClick={() => handleEliminar(cliente.id_cliente)}
                                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Eliminar cliente"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {busqueda 
                  ? `No hay resultados para "${busqueda}". Intenta con otros términos.`
                  : 'Aún no tienes clientes registrados en el sistema.'}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Modal Editar Cliente */}
      <AnimatePresence>
        {mostrarModalEditar && clienteSeleccionado && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMostrarModalEditar(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
              >
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Editar Cliente <span className="text-blue-600">#{clienteSeleccionado.id_cliente}</span>
                  </h3>
                  <button 
                    onClick={() => setMostrarModalEditar(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto">
                  <form id="edit-client-form" onSubmit={handleActualizar} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nombre <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Apellido <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Cédula de Identidad</label>
                        <div className="relative">
                          <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="ci"
                            value={formData.ci}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Ej: 12345678"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Celular</label>
                        <div className="relative">
                          <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            name="celular"
                            value={formData.celular}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="Ej: +591 70123456"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Correo Electrónico <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="correo"
                          value={formData.correo}
                          onChange={handleChange}
                          required
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Dirección</label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <textarea
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          rows="2"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                          placeholder="Ej: Av. Heroínas #123"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Estado de la cuenta</label>
                      <select
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-medium"
                      >
                        <option value={1}>Activo - Puede realizar reservas</option>
                        <option value={0}>Inactivo - Cuenta suspendida</option>
                      </select>
                    </div>
                  </form>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEditar(false)}
                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="edit-client-form"
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Clientes;
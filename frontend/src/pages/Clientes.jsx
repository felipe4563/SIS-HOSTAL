import { useState, useEffect } from 'react';
import { obtenerClientes, actualizarCliente, eliminarCliente } from '../services/cliente';

const Clientes = () => {
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
      alert('Cliente actualizado exitosamente');
      cargarClientes();
      setMostrarModalEditar(false);
      setClienteSeleccionado(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar cliente');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarCliente(id);
      alert('Cliente eliminado exitosamente');
      cargarClientes();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar cliente');
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
      alert(`Cliente ${accion === 'activar' ? 'activado' : 'desactivado'} exitosamente`);
      cargarClientes();
    } catch (err) {
      alert(err.response?.data?.message || `Error al ${accion} cliente`);
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Clientes</h1>
        <p className="text-gray-600">Administra todos los clientes del hostal</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 font-medium">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 font-medium">Activos</p>
          <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600 font-medium">Inactivos</p>
          <p className="text-3xl font-bold text-red-600">{stats.inactivos}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 font-medium">Con CI</p>
          <p className="text-3xl font-bold text-purple-600">{stats.conCI}</p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Buscar Cliente
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre, correo, CI o celular..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="mt-7 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando clientes...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
          <button
            onClick={cargarClientes}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {clientesFiltrados.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        CI
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Registro
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clientesFiltrados.map((cliente) => (
                      <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">#{cliente.id_cliente}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                              {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {cliente.nombre} {cliente.apellido}
                              </p>
                              <p className="text-xs text-gray-500">{cliente.correo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {cliente.ci ? (
                            <span className="text-sm text-gray-900">{cliente.ci}</span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No registrado</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {cliente.celular && (
                              <p className="text-gray-900">📱 {cliente.celular}</p>
                            )}
                            {cliente.direccion && (
                              <p className="text-gray-500 text-xs truncate max-w-xs">
                                📍 {cliente.direccion}
                              </p>
                            )}
                            {!cliente.celular && !cliente.direccion && (
                              <span className="text-xs text-gray-400 italic">Sin datos</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {formatearFecha(cliente.fecha_registro)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleEstado(cliente)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                              cliente.estado === 1
                                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                            }`}
                          >
                            {cliente.estado === 1 ? '✅ Activo' : '❌ Inactivo'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleAbrirModalEditar(cliente)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                              title="Editar cliente"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleEliminar(cliente.id_cliente)}
                              className="text-red-600 hover:text-red-800 font-semibold text-sm"
                              title="Eliminar cliente"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-md">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-gray-600">
                {busqueda
                  ? 'Intenta ajustar los criterios de búsqueda'
                  : 'Aún no hay clientes registrados'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal Editar Cliente */}
      {mostrarModalEditar && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold">Editar Cliente #{clienteSeleccionado.id_cliente}</h3>
            </div>

            <form onSubmit={handleActualizar} className="p-6 space-y-6">
              {/* Nombre y Apellido */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* CI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cédula de Identidad
                </label>
                <input
                  type="text"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 12345678"
                />
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Celular */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Celular
                </label>
                <input
                  type="tel"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: +591 70123456"
                />
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Av. Heroínas #123, Cochabamba"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarModalEditar(false);
                    setClienteSeleccionado(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
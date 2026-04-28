import { useEffect, useMemo, useState } from "react";

const initialState = {
  id_cliente: "",
  id_habitacion: "",
  fecha_entrada: "",
  fecha_salida: "",
  cantidad_adultos: 1,
  cantidad_ninos: 0,
  hora_llegada: "",
  registrarNuevoCliente: false,
  nuevoCliente: {
    nombre: "",
    apellido: "",
    ci: "",
    correo: "",
    celular: "",
    direccion: ""
  }
};

const ReservaForm = ({
  clientes,
  habitaciones,
  reservaEditando,
  loading,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState(initialState);
  const [busquedaCliente, setBusquedaCliente] = useState("");

  useEffect(() => {
    if (reservaEditando) {
      setFormData({
        id_cliente: reservaEditando.id_cliente || "",
        id_habitacion: reservaEditando.id_habitacion || "",
        fecha_entrada: String(reservaEditando.fecha_entrada || "").split("T")[0],
        fecha_salida: String(reservaEditando.fecha_salida || "").split("T")[0],
        cantidad_adultos: reservaEditando.cantidad_adultos || 1,
        cantidad_ninos: reservaEditando.cantidad_ninos || 0,
        hora_llegada: reservaEditando.hora_llegada || "",
        registrarNuevoCliente: false,
        nuevoCliente: initialState.nuevoCliente
      });
      return;
    }

    setFormData(initialState);
  }, [reservaEditando]);

  const habitacionSeleccionada = useMemo(
    () => habitaciones.find((h) => String(h.id_habitacion) === String(formData.id_habitacion)),
    [habitaciones, formData.id_habitacion]
  );

  const clientesFiltrados = useMemo(() => {
    if (!busquedaCliente.trim()) return clientes;
    const q = busquedaCliente.toLowerCase();
    return clientes.filter((c) =>
      `${c.nombre || ""} ${c.apellido || ""}`.toLowerCase().includes(q) ||
      String(c.ci || "").toLowerCase().includes(q) ||
      String(c.correo || "").toLowerCase().includes(q)
    );
  }, [clientes, busquedaCliente]);

  const capacidad = habitacionSeleccionada?.capacidad || 0;
  const totalPersonas = Number(formData.cantidad_adultos) + Number(formData.cantidad_ninos);
  const excedeCapacidad = capacidad > 0 && totalPersonas > capacidad;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["cantidad_adultos", "cantidad_ninos"].includes(name) ? Number(value) : value
    }));
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      nuevoCliente: {
        ...prev.nuevoCliente,
        [name]: value
      }
    }));
  };

  const toggleNuevoCliente = () => {
    setFormData((prev) => ({
      ...prev,
      registrarNuevoCliente: !prev.registrarNuevoCliente,
      id_cliente: !prev.registrarNuevoCliente ? "" : prev.id_cliente
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.registrarNuevoCliente) {
      const { nombre, apellido, ci, correo } = formData.nuevoCliente;
      if (!nombre || !apellido) {
        alert("Para registrar cliente nuevo, nombre y apellido son obligatorios.");
        return;
      }
      if (!ci && !correo) {
        alert("Para registrar cliente nuevo, registra al menos CI o correo.");
        return;
      }
    }

    if (excedeCapacidad) {
      alert(`La habitación seleccionada admite ${capacidad} personas como máximo.`);
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {reservaEditando ? `✏️ Editar Reserva #${reservaEditando.id_reserva}` : "➕ Nueva Reserva"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleNuevoCliente}
            className={`px-4 py-2 rounded-lg font-semibold ${
              formData.registrarNuevoCliente
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {formData.registrarNuevoCliente ? "👤 Registrando cliente nuevo" : "➕ Cliente no registrado"}
          </button>
          {formData.registrarNuevoCliente && (
            <span className="text-sm text-gray-600">Se creará el cliente y luego la reserva.</span>
          )}
        </div>

        {!formData.registrarNuevoCliente ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              placeholder="Buscar cliente por nombre, CI o correo..."
              className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <select
              name="id_cliente"
              value={formData.id_cliente}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Seleccione cliente</option>
              {clientesFiltrados.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre} {c.apellido} - CI {c.ci || "S/N"}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
              <input name="nombre" value={formData.nuevoCliente.nombre} onChange={handleNuevoClienteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
              <input name="apellido" value={formData.nuevoCliente.apellido} onChange={handleNuevoClienteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">CI</label>
              <input name="ci" value={formData.nuevoCliente.ci} onChange={handleNuevoClienteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
              <input type="email" name="correo" value={formData.nuevoCliente.correo} onChange={handleNuevoClienteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Celular</label>
              <input name="celular" value={formData.nuevoCliente.celular} onChange={handleNuevoClienteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
              <input name="direccion" value={formData.nuevoCliente.direccion} onChange={handleNuevoClienteChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Habitación</label>
            <select
              name="id_habitacion"
              value={formData.id_habitacion}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Seleccione habitación</option>
              {habitaciones.map((h) => (
                <option key={h.id_habitacion} value={h.id_habitacion}>
                  Hab. {h.numero} - {h.tipo_habitacion} ({h.capacidad} pers.)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha entrada</label>
            <input
              type="date"
              name="fecha_entrada"
              value={formData.fecha_entrada}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha salida</label>
            <input
              type="date"
              name="fecha_salida"
              min={formData.fecha_entrada || undefined}
              value={formData.fecha_salida}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Adultos</label>
            <input
              type="number"
              name="cantidad_adultos"
              min="1"
              value={formData.cantidad_adultos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Niños</label>
            <input
              type="number"
              name="cantidad_ninos"
              min="0"
              value={formData.cantidad_ninos}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hora llegada</label>
            <input
              type="time"
              name="hora_llegada"
              value={formData.hora_llegada || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        {habitacionSeleccionada && (
          <p className={`text-sm ${excedeCapacidad ? "text-red-600" : "text-gray-600"}`}>
            Capacidad habitación: {capacidad} | Seleccionados: {totalPersonas}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:bg-blue-300"
          >
            {loading ? "Guardando..." : reservaEditando ? "Actualizar reserva" : "Crear reserva"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservaForm;

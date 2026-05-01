import { useEffect, useMemo, useState } from "react";
import CalendarioReserva from "../Home/CalendarioReserva.jsx";

const todayYmd = () => new Date().toISOString().split("T")[0];

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
  const [busquedaHabitacion, setBusquedaHabitacion] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(true);
  const [pisoFiltro, setPisoFiltro] = useState("todos");
  const [usarCalendario, setUsarCalendario] = useState(true);

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
    if (name === "fecha_entrada") {
      setFormData((prev) => ({
        ...prev,
        fecha_entrada: value,
        // Si la salida queda antes o igual, limpiarla
        fecha_salida: prev.fecha_salida && value && prev.fecha_salida <= value ? "" : prev.fecha_salida
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: ["cantidad_adultos", "cantidad_ninos"].includes(name) ? Number(value) : value
    }));
  };

  const handleFechasChange = (entrada, salida) => {
    setFormData((prev) => ({
      ...prev,
      fecha_entrada: entrada || "",
      fecha_salida: salida || ""
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

    if (!formData.id_habitacion) {
      alert("Selecciona una habitación para continuar.");
      return;
    }

    if (excedeCapacidad) {
      alert(`La habitación seleccionada admite ${capacidad} personas como máximo.`);
      return;
    }

    onSubmit(formData);
  };

  const pisosDisponibles = useMemo(() => {
    const pisos = new Set(habitaciones.map((h) => String(h.piso ?? "")));
    return [...pisos].filter(Boolean).sort((a, b) => Number(a) - Number(b));
  }, [habitaciones]);

  const habitacionesFiltradas = useMemo(() => {
    const q = busquedaHabitacion.trim().toLowerCase();
    return habitaciones.filter((h) => {
      if (soloDisponibles && String(h.estado).toLowerCase() !== "disponible") return false;
      if (pisoFiltro !== "todos" && String(h.piso) !== String(pisoFiltro)) return false;
      if (!q) return true;
      const hay = `${h.numero ?? ""} ${h.tipo_habitacion ?? ""} ${h.piso ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [habitaciones, busquedaHabitacion, soloDisponibles, pisoFiltro]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b bg-gradient-to-r from-white to-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              {reservaEditando ? `✏️ Editar Reserva #${reservaEditando.id_reserva}` : "➕ Nueva Reserva"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Completa los datos para registrar la reserva.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleNuevoCliente}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl font-semibold transition ${
              formData.registrarNuevoCliente
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {formData.registrarNuevoCliente ? "👤 Registrando cliente nuevo" : "➕ Cliente no registrado"}
          </button>
        </div>
        {formData.registrarNuevoCliente && (
          <p className="text-sm text-gray-600 mt-2">
            Se creará el cliente y luego la reserva.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-12">
          {/* Columna principal */}
          <div className="lg:col-span-7 space-y-4 lg:space-y-6 min-w-0">
            {/* Cliente */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">Cliente</p>
                  <p className="text-xs text-gray-500">Selecciona un cliente o registra uno nuevo.</p>
                </div>
              </div>

              {!formData.registrarNuevoCliente ? (
                <div>
                  <input
                    type="text"
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    placeholder="Buscar por nombre, CI o correo..."
                    className="w-full mb-2 px-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                  <select
                    name="id_cliente"
                    value={formData.id_cliente}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white"
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
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                    <input
                      name="nombre"
                      value={formData.nuevoCliente.nombre}
                      onChange={handleNuevoClienteChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido *</label>
                    <input
                      name="apellido"
                      value={formData.nuevoCliente.apellido}
                      onChange={handleNuevoClienteChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">CI</label>
                    <input
                      name="ci"
                      value={formData.nuevoCliente.ci}
                      onChange={handleNuevoClienteChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.nuevoCliente.correo}
                      onChange={handleNuevoClienteChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Celular</label>
                    <input
                      name="celular"
                      value={formData.nuevoCliente.celular}
                      onChange={handleNuevoClienteChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                    <input
                      name="direccion"
                      value={formData.nuevoCliente.direccion}
                      onChange={handleNuevoClienteChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Habitación */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 min-w-0">
              <div className="flex items-start sm:items-center justify-between gap-3 mb-3 flex-col sm:flex-row">
                <div>
                  <p className="text-sm font-bold text-gray-800">Habitación</p>
                  <p className="text-xs text-gray-500">
                    Filtra y selecciona con un click.
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-3">
                <input
                  type="text"
                  value={busquedaHabitacion}
                  onChange={(e) => setBusquedaHabitacion(e.target.value)}
                  placeholder="Buscar por número, tipo o piso..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-white"
                />
                <div className="flex gap-2">
                  <select
                    value={pisoFiltro}
                    onChange={(e) => setPisoFiltro(e.target.value)}
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="todos">Todos los pisos</option>
                    {pisosDisponibles.map((p) => (
                      <option key={p} value={p}>Piso {p}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 select-none px-3 py-2.5 border border-gray-300 rounded-xl bg-white">
                    <input
                      type="checkbox"
                      checked={soloDisponibles}
                      onChange={(e) => setSoloDisponibles(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Solo disponibles
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {habitacionesFiltradas.length > 0 ? (
                  habitacionesFiltradas.map((h) => {
                    const selected = String(formData.id_habitacion) === String(h.id_habitacion);
                    const estado = String(h.estado || "").toLowerCase();
                    const badge =
                      estado === "disponible"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : estado === "ocupada"
                        ? "bg-red-100 text-red-800 border-red-300"
                        : "bg-yellow-100 text-yellow-800 border-yellow-300";

                    return (
                      <button
                        type="button"
                        key={h.id_habitacion}
                        onClick={() => setFormData((prev) => ({ ...prev, id_habitacion: h.id_habitacion }))}
                        className={`text-left p-3 rounded-2xl border-2 transition-all hover:shadow-sm w-full ${
                          selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">Hab. {h.numero}</p>
                            <p className="text-xs text-gray-600 truncate">{h.tipo_habitacion} · Piso {h.piso}</p>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${badge}`}>
                            {estado || "N/A"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-700">
                          <span>👥 {h.capacidad} pers.</span>
                          <span className="font-bold">Bs. {Number(h.precio_total || 0).toFixed(2)}</span>
                        </div>
                        {h.imagen_portada && (
                          <div className="mt-2">
                            <img
                              src={h.imagen_portada}
                              alt={`Habitación ${h.numero}`}
                              className="w-full h-24 object-cover rounded-xl border border-gray-100"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full p-6 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                    No hay habitaciones que coincidan con los filtros.
                  </div>
                )}
              </div>

              {!formData.id_habitacion && (
                <p className="mt-3 text-xs text-gray-600">
                  Tip: haz click en una tarjeta para seleccionar la habitación.
                </p>
              )}
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-5 space-y-4 lg:space-y-6 min-w-0">
            {/* Fechas */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">Fechas</p>
                  <p className="text-xs text-gray-500">
                    El calendario bloquea fechas pasadas y ocupadas.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={usarCalendario}
                    onChange={(e) => setUsarCalendario(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Calendario
                </label>
              </div>

              {usarCalendario ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-2 sm:p-3 overflow-hidden">
                  {formData.id_habitacion ? (
                    <CalendarioReserva
                      idHabitacion={formData.id_habitacion}
                      fechaEntrada={formData.fecha_entrada}
                      fechaSalida={formData.fecha_salida}
                      onFechasChange={handleFechasChange}
                    />
                  ) : (
                    <div className="p-6 text-center text-gray-600">
                      Selecciona una habitación para ver su disponibilidad.
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Entrada</label>
                    <input
                      type="date"
                      name="fecha_entrada"
                      value={formData.fecha_entrada}
                      onChange={handleChange}
                      required
                      min={todayYmd()}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Salida</label>
                    <input
                      type="date"
                      name="fecha_salida"
                      min={formData.fecha_entrada || undefined}
                      value={formData.fecha_salida}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Detalles */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
              <p className="text-sm font-bold text-gray-800 mb-3">Detalles</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Adultos</label>
                  <input
                    type="number"
                    name="cantidad_adultos"
                    min="1"
                    value={formData.cantidad_adultos}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hora llegada</label>
                  <input
                    type="time"
                    name="hora_llegada"
                    value={formData.hora_llegada || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {habitacionSeleccionada && (
                <p className={`mt-3 text-sm ${excedeCapacidad ? "text-red-600" : "text-gray-600"}`}>
                  Capacidad habitación: {capacidad} | Seleccionados: {totalPersonas}
                </p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:bg-blue-300"
              >
                {loading ? "Guardando..." : reservaEditando ? "Actualizar reserva" : "Crear reserva"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReservaForm;

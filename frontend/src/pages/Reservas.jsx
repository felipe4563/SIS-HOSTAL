import { useState, useEffect } from "react";
import {
  obtenerTodasReservas,
  actualizarEstadoReserva,
  eliminarReserva,
  crearReserva,
  actualizarReserva,
  checkInReserva,
  checkOutReserva
} from "../services/reserva";
import { obtenerClientes } from "../services/cliente";
import { listarHabitaciones } from "../services/habitacion";
import { crearCliente } from "../services/cliente";
import ReservaForm from "./reservas/ReservaForm";
import ReservasList from "./reservas/ReservasList";

const Reservas = () => {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [reservaEditando, setReservaEditando] = useState(null);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [reservasData, clientesData, habitacionesData] = await Promise.all([
        obtenerTodasReservas(),
        obtenerClientes(),
        listarHabitaciones()
      ]);
      setReservas(reservasData);
      setClientes(clientesData);
      setHabitaciones(habitacionesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    if (!window.confirm(`¿Confirmar cambio de estado a "${nuevoEstado}"?`)) {
      return;
    }

    try {
      await actualizarEstadoReserva(id, nuevoEstado);
      alert('Estado actualizado exitosamente');
      cargarDatos();
      setMostrarModalEstado(false);
      setReservaSeleccionada(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const handleEliminarReserva = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await eliminarReserva(id);
      alert('Reserva eliminada exitosamente');
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar reserva');
    }
  };

  const handleCheckIn = async (reserva) => {
    if (!window.confirm(`¿Realizar check-in de la reserva #${reserva.id_reserva}?`)) return;
    try {
      await checkInReserva(reserva.id_reserva);
      alert("Check-in realizado");
      await cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al hacer check-in");
    }
  };

  const handleCheckOut = async (reserva) => {
    if (!window.confirm(`¿Realizar check-out de la reserva #${reserva.id_reserva}?`)) return;
    try {
      await checkOutReserva(reserva.id_reserva);
      alert("Check-out realizado");
      await cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al hacer check-out");
    }
  };

  const handleGuardarReserva = async (formData) => {
    setLoadingForm(true);
    try {
      let idClienteFinal = formData.id_cliente;

      if (formData.registrarNuevoCliente) {
        const creado = await crearCliente(formData.nuevoCliente);
        idClienteFinal = creado?.cliente?.id_cliente;
      }

      const payloadReserva = {
        id_cliente: idClienteFinal,
        id_habitacion: formData.id_habitacion,
        fecha_entrada: formData.fecha_entrada,
        fecha_salida: formData.fecha_salida,
        cantidad_adultos: formData.cantidad_adultos,
        cantidad_ninos: formData.cantidad_ninos,
        hora_llegada: formData.hora_llegada
      };

      if (reservaEditando) {
        await actualizarReserva(reservaEditando.id_reserva, payloadReserva);
        alert("Reserva actualizada exitosamente");
      } else {
        await crearReserva(payloadReserva);
        alert("Reserva creada exitosamente");
      }

      setMostrarForm(false);
      setReservaEditando(null);
      await cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al guardar la reserva");
    } finally {
      setLoadingForm(false);
    }
  };

  const openCrearForm = () => {
    setReservaEditando(null);
    setMostrarForm(true);
  };

  const openEditarForm = (reserva) => {
    setReservaEditando(reserva);
    setMostrarForm(true);
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmada: "bg-green-100 text-green-800 border-green-300",
      cancelada: "bg-red-100 text-red-800 border-red-300",
      finalizada: "bg-gray-100 text-gray-800 border-gray-300"
    };
    const iconos = { pendiente: "⏳", confirmada: "✅", cancelada: "❌", finalizada: "🏁" };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${badges[estado]}`}>
        <span className="mr-1">{iconos[estado]}</span>{estado.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reservas</h1>
        <p className="text-gray-600">Administra todas las reservas del hostal</p>
        <div className="mt-4">
          <button
            onClick={openCrearForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            ➕ Nueva Reserva
          </button>
        </div>
      </div>

      {mostrarForm && (
        <div className="mb-6">
          <ReservaForm
            clientes={clientes}
            habitaciones={habitaciones}
            reservaEditando={reservaEditando}
            loading={loadingForm}
            onSubmit={handleGuardarReserva}
            onCancel={() => {
              setMostrarForm(false);
              setReservaEditando(null);
            }}
          />
        </div>
      )}

      <ReservasList
        reservas={reservas}
        loading={loading}
        error={error}
        busqueda={busqueda}
        filtroEstado={filtroEstado}
        onBusquedaChange={setBusqueda}
        onFiltroEstadoChange={setFiltroEstado}
        onRetry={cargarDatos}
        onEdit={openEditarForm}
        onDelete={handleEliminarReserva}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        onOpenEstadoModal={(reserva) => {
          setReservaSeleccionada(reserva);
          setMostrarModalEstado(true);
        }}
      />

      {mostrarModalEstado && reservaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cambiar Estado - Reserva #{reservaSeleccionada.id_reserva}
            </h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Cliente:</span> {reservaSeleccionada.nombre_cliente}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Habitación:</span> {reservaSeleccionada.numero_habitacion}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Estado actual:</span> {getEstadoBadge(reservaSeleccionada.estado)}
              </p>
            </div>

            <div className="space-y-3">
              {reservaSeleccionada.estado === 'pendiente' && (
                <button
                  onClick={() => handleCambiarEstado(reservaSeleccionada.id_reserva, 'confirmada')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  ✅ Confirmar Reserva
                </button>
              )}

              {reservaSeleccionada.estado === 'confirmada' && (
                <button
                  onClick={() => handleCambiarEstado(reservaSeleccionada.id_reserva, 'finalizada')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  🏁 Marcar como Finalizada
                </button>
              )}

              {(reservaSeleccionada.estado === 'pendiente' || reservaSeleccionada.estado === 'confirmada') && (
                <button
                  onClick={() => handleCambiarEstado(reservaSeleccionada.id_reserva, 'cancelada')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
                >
                  ❌ Cancelar Reserva
                </button>
              )}

              <button
                onClick={() => {
                  setMostrarModalEstado(false);
                  setReservaSeleccionada(null);
                }}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservas;
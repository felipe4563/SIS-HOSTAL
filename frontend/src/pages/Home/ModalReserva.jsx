import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { verificarDisponibilidad } from '../../services/habitacion';
import { crearReserva } from '../../services/reserva';

const ModalReserva = ({ habitacion, onClose, onSuccess }) => {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [fechaEntrada, setFechaEntrada] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [dias, setDias] = useState(0);
  const [total, setTotal] = useState(0);
  const [disponible, setDisponible] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cantidadAdultos, setCantidadAdultos] = useState(1);
  const [cantidadNinos, setCantidadNinos] = useState(0);
  const [horaLlegada, setHoraLlegada] = useState('');

  useEffect(() => {
    if (fechaEntrada && fechaSalida) {
      const entrada = new Date(fechaEntrada);
      const salida = new Date(fechaSalida);
      const diferencia = Math.ceil((salida - entrada) / (1000 * 60 * 60 * 24));
      
      if (diferencia > 0) {
        setDias(diferencia);
        setTotal(diferencia * habitacion.precio_total);
      } else {
        setDias(0);
        setTotal(0);
      }
    }
  }, [fechaEntrada, fechaSalida, habitacion.precio_total]);

  const handleVerificarDisponibilidad = async () => {
    if (!fechaEntrada || !fechaSalida) return;
    
    setVerificando(true);
    setError('');
    
    try {
      const resultado = await verificarDisponibilidad(
        habitacion.id_habitacion,
        fechaEntrada,
        fechaSalida
      );
      setDisponible(resultado.disponible);
    } catch (err) {
      setError('Error al verificar disponibilidad');
      console.error(err);
    } finally {
      setVerificando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fechaEntrada || !fechaSalida) {
      setError('Por favor selecciona las fechas');
      return;
    }

    if (dias <= 0) {
      setError('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    if (cantidadAdultos < 1) {
      setError('Debe haber al menos 1 adulto');
      return;
    }

    const totalPersonas = cantidadAdultos + cantidadNinos;
    if (totalPersonas > habitacion.tipo.capacidad) {
      setError(`La habitación tiene capacidad para ${habitacion.tipo.capacidad} personas`);
      return;
    }

    if (!usuario) {
      sessionStorage.setItem('reservaPendiente', JSON.stringify({
        id_habitacion: habitacion.id_habitacion,
        numero_habitacion: habitacion.numero,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        total: total,
        cantidad_adultos: cantidadAdultos,
        cantidad_ninos: cantidadNinos,
        hora_llegada: horaLlegada
      }));
      
      alert('Debes iniciar sesión para completar la reserva');
      navigate('/login-cliente');
      return;
    }

    const idCliente = usuario.id_cliente;
    
    if (!idCliente) {
      setError('Error: No se encontró la información del cliente');
      console.error('Usuario sin id_cliente:', usuario);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await crearReserva({
        id_cliente: idCliente,
        id_habitacion: habitacion.id_habitacion,
        fecha_entrada: fechaEntrada,
        fecha_salida: fechaSalida,
        total: total,
        cantidad_adultos: cantidadAdultos,
        cantidad_ninos: cantidadNinos,
        hora_llegada: horaLlegada
      });

      alert('¡Reserva creada exitosamente!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error completo:', err);
      setError(err.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const fechaMinima = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden transform animate-slideUp">
        
        {/* 🎨 Header Premium con degradado */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white p-8 overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="text-sm font-medium">Habitación {habitacion.numero}</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-2 tracking-tight">
                {habitacion.tipo.nombre}
              </h2>
              
              <div className="flex flex-wrap gap-4 text-blue-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">Hasta {habitacion.tipo.capacidad} personas</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xl font-bold">Bs. {habitacion.precio_total}</span>
                  <span className="text-sm ml-1">/noche</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm group"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 📋 Contenido del formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          
          {/* 👤 Info del usuario (si está logueado) */}
          {usuario && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
              </div>
              <div>
                <p className="text-gray-900 font-semibold">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-gray-600 text-sm">{usuario.correo}</p>
              </div>
            </div>
          )}

          {/* 📅 Fechas */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha de entrada
              </label>
              <input
                type="date"
                value={fechaEntrada}
                onChange={(e) => setFechaEntrada(e.target.value)}
                onBlur={handleVerificarDisponibilidad}
                min={fechaMinima}
                required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium"
              />
            </div>

            <div className="group">
              <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Fecha de salida
              </label>
              <input
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                onBlur={handleVerificarDisponibilidad}
                min={fechaEntrada || fechaMinima}
                required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 font-medium"
              />
            </div>
          </div>

          {/* 👥 Huéspedes */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Cantidad de huéspedes
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Adultos
                </label>
                <div className="relative">
                  <select
                    value={cantidadAdultos}
                    onChange={(e) => setCantidadAdultos(Number(e.target.value))}
                    required
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none font-semibold cursor-pointer bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'adulto' : 'adultos'}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Niños
                </label>
                <div className="relative">
                  <select
                    value={cantidadNinos}
                    onChange={(e) => setCantidadNinos(Number(e.target.value))}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none font-semibold cursor-pointer bg-white"
                  >
                    {[0, 1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'niño' : 'niños'}</option>
                    ))}
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ⏰ Hora de llegada */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hora estimada de llegada
              <span className="ml-2 text-xs font-normal text-gray-500">(opcional)</span>
            </label>
            <input
              type="time"
              value={horaLlegada}
              onChange={(e) => setHoraLlegada(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Check-in disponible de 14:00 a 22:00
            </p>
          </div>

          {/* 💰 Resumen de la reserva */}
          {dias > 0 && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Resumen de tu reserva
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Noches de estancia
                  </span>
                  <span className="font-bold text-gray-900 text-lg">{dias}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Huéspedes
                  </span>
                  <span className="font-bold text-gray-900">
                    {cantidadAdultos + cantidadNinos} {cantidadAdultos + cantidadNinos === 1 ? 'persona' : 'personas'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tarifa por noche
                  </span>
                  <span className="font-semibold text-gray-900">Bs. {habitacion.precio_total}</span>
                </div>
                
                <div className="border-t-2 border-blue-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Total a pagar</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Bs. {total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ({dias} {dias === 1 ? 'noche' : 'noches'} × Bs. {habitacion.precio_total})
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Estado de disponibilidad */}
          {verificando && (
            <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-200">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-900 font-semibold">Verificando disponibilidad...</p>
              <p className="text-blue-600 text-sm mt-1">Un momento por favor</p>
            </div>
          )}

          {disponible !== null && !verificando && (
            <div className={`rounded-2xl p-6 border-2 transform transition-all duration-300 ${
              disponible 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-100 shadow-lg' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-red-100 shadow-lg'
            }`}>
              <div className="flex items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  disponible ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {disponible ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg mb-1 ${
                    disponible ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {disponible ? '¡Excelentes noticias!' : 'Lo sentimos'}
                  </h4>
                  <p className={`text-sm ${
                    disponible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {disponible 
                      ? 'La habitación está disponible para las fechas seleccionadas' 
                      : 'Esta habitación no está disponible para las fechas seleccionadas. Por favor, elige otras fechas.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ⚠️ Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start shadow-lg">
              <svg className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-900 font-semibold">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* 🎯 Botones de acción */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || disponible === false || dias <= 0}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 transform ${
                loading || disponible === false || dias <= 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : !usuario ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Iniciar sesión y reservar
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar reserva
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ModalReserva;
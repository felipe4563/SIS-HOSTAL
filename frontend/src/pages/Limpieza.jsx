import { useState, useEffect, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import {
  getLimpiezaPendientes,
  getLimpiezaHistorial,
  getLimpiezaStats,
  iniciarLimpieza,
  completarLimpieza,
  crearTareaLimpieza,
} from '../services/limpieza.js';

/* ─── helpers ─── */
const fmtFecha = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};

const duracion = (inicio, fin) => {
  if (!inicio) return '—';
  const ms = new Date(fin || Date.now()) - new Date(inicio);
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}min`;
};

/* ─── badges ─── */
const BadgeEstado = ({ estado }) => {
  const map = {
    pendiente:  'bg-amber-100 text-amber-700 ring-amber-200',
    en_proceso: 'bg-blue-100 text-blue-700 ring-blue-200',
    completada: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  };
  const label = { pendiente: 'Pendiente', en_proceso: 'En proceso', completada: 'Completada' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${map[estado]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label[estado]}
    </span>
  );
};

/* ─── Tarjeta de tarea pendiente ─── */
const TareaCard = ({ tarea, onIniciar, onCompletar, puedeEditar }) => {
  const [obs, setObs] = useState('');
  const [showObs, setShowObs] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleIniciar = async () => {
    setCargando(true);
    try { await onIniciar(tarea.id_limpieza); }
    finally { setCargando(false); }
  };

  const handleCompletar = async () => {
    setCargando(true);
    try { await onCompletar(tarea.id_limpieza, obs); }
    finally { setCargando(false); }
  };

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
      tarea.estado === 'en_proceso' ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-slate-50 px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg shadow">
            {tarea.numero_habitacion}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">Hab. {tarea.numero_habitacion}</p>
            <p className="text-xs text-slate-500">Piso {tarea.piso} · {tarea.tipo_habitacion}</p>
          </div>
        </div>
        <BadgeEstado estado={tarea.estado} />
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Tipo</p>
            <p className="font-medium capitalize">{tarea.tipo}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Creada</p>
            <p className="font-medium">{fmtFecha(tarea.fecha_creacion)}</p>
          </div>
          {tarea.fecha_inicio && (
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Inicio</p>
              <p className="font-medium">{fmtFecha(tarea.fecha_inicio)}</p>
            </div>
          )}
          {tarea.estado === 'en_proceso' && (
            <div>
              <p className="font-semibold text-slate-400 uppercase tracking-wide mb-0.5">En curso</p>
              <p className="font-medium text-blue-600">{duracion(tarea.fecha_inicio, null)}</p>
            </div>
          )}
        </div>

        {tarea.observaciones && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 border border-slate-200">
            {tarea.observaciones}
          </p>
        )}

        {/* Observaciones al completar */}
        {showObs && (
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Observaciones opcionales..."
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
          />
        )}
      </div>

      {/* Actions */}
      {puedeEditar && (
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
          {tarea.estado === 'pendiente' && (
            <button
              onClick={handleIniciar}
              disabled={cargando}
              className="flex-1 rounded-xl bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {cargando ? 'Iniciando…' : 'Iniciar limpieza'}
            </button>
          )}
          {tarea.estado === 'en_proceso' && (
            <>
              {!showObs && (
                <button
                  onClick={() => setShowObs(true)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  + Obs.
                </button>
              )}
              <button
                onClick={handleCompletar}
                disabled={cargando}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {cargando ? 'Completando…' : 'Marcar completada'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Modal crear tarea manual ─── */
const ModalCrear = ({ onClose, onCreada }) => {
  const [form, setForm] = useState({ id_habitacion: '', tipo: 'mantenimiento', observaciones: '' });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_habitacion) return toast.error('Ingresa el número de habitación');
    setCargando(true);
    try {
      await onCreada(form);
      onClose();
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Nueva tarea de limpieza</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              ID de Habitación
            </label>
            <input
              type="number"
              value={form.id_habitacion}
              onChange={(e) => setForm((f) => ({ ...f, id_habitacion: e.target.value }))}
              placeholder="Ej: 5"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Tipo
            </label>
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="mantenimiento">Mantenimiento</option>
              <option value="checkout">Checkout</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Observaciones
            </label>
            <textarea
              value={form.observaciones}
              onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
              rows={3}
              placeholder="Detalles adicionales..."
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={cargando} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {cargando ? 'Creando…' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Componente principal ─── */
const Limpieza = () => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  const [tab, setTab] = useState('pendientes');
  const [tareas, setTareas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  const cargarStats = useCallback(async () => {
    const s = await getLimpiezaStats();
    setStats(s);
  }, []);

  const cargarPendientes = useCallback(async () => {
    const data = await getLimpiezaPendientes();
    setTareas(data);
  }, []);

  const cargarHistorial = useCallback(async () => {
    const data = await getLimpiezaHistorial(80);
    setHistorial(data);
  }, []);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([cargarStats(), cargarPendientes(), cargarHistorial()]);
    } catch {
      toast.error('Error al cargar datos de limpieza');
    } finally {
      setLoading(false);
    }
  }, [cargarStats, cargarPendientes, cargarHistorial]);

  useEffect(() => { cargarTodo(); }, [cargarTodo]);

  const handleIniciar = async (id) => {
    await toast.promise(iniciarLimpieza(id), {
      loading: 'Iniciando…',
      success: 'Limpieza iniciada',
      error: (e) => e.response?.data?.message || 'Error',
    });
    await Promise.all([cargarPendientes(), cargarStats()]);
  };

  const handleCompletar = async (id, obs) => {
    await toast.promise(completarLimpieza(id, obs), {
      loading: 'Completando…',
      success: 'Habitación disponible',
      error: (e) => e.response?.data?.message || 'Error',
    });
    await Promise.all([cargarPendientes(), cargarHistorial(), cargarStats()]);
  };

  const handleCrear = async (form) => {
    await toast.promise(crearTareaLimpieza(form), {
      loading: 'Creando tarea…',
      success: 'Tarea creada',
      error: (e) => e.response?.data?.message || 'Error',
    });
    await cargarTodo();
  };

  if (loading) return (
    <div className="flex min-h-full items-center justify-center py-24">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="text-slate-500 font-medium">Cargando módulo de limpieza…</p>
      </div>
    </div>
  );

  const enProceso = tareas.filter((t) => t.estado === 'en_proceso');
  const pendientes = tareas.filter((t) => t.estado === 'pendiente');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Limpieza</h1>
            <p className="mt-0.5 text-sm text-slate-500">Control de limpieza de habitaciones</p>
          </div>
          {tienePermiso('limpieza.crear') && (
            <button
              onClick={() => setMostrarModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva tarea
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Pendientes',      value: stats.pendientes,     color: 'from-amber-500 to-amber-600',   icon: '⏳' },
              { label: 'En proceso',      value: stats.en_proceso,     color: 'from-blue-500 to-blue-600',     icon: '🧹' },
              { label: 'Completadas hoy', value: stats.completadas_hoy, color: 'from-emerald-500 to-emerald-600', icon: '✅' },
              { label: 'Este mes',        value: stats.completadas_mes, color: 'from-violet-500 to-violet-600', icon: '📊' },
            ].map((s) => (
              <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-md`}>
                <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
                <p className="relative text-3xl font-black">{s.value}</p>
                <p className="relative mt-1 text-sm font-medium text-white/85">{s.icon} {s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-slate-200 p-1 w-fit">
          {[['pendientes', 'Activas'], ['historial', 'Historial']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                tab === key ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              {key === 'pendientes' && tareas.length > 0 && (
                <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white font-bold">
                  {tareas.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido */}
        {tab === 'pendientes' && (
          <div className="space-y-6">
            {enProceso.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  En proceso ({enProceso.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {enProceso.map((t) => (
                    <TareaCard key={t.id_limpieza} tarea={t} onIniciar={handleIniciar} onCompletar={handleCompletar} puedeEditar={tienePermiso('limpieza.editar')} />
                  ))}
                </div>
              </section>
            )}

            {pendientes.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Pendientes ({pendientes.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pendientes.map((t) => (
                    <TareaCard key={t.id_limpieza} tarea={t} onIniciar={handleIniciar} onCompletar={handleCompletar} puedeEditar={tienePermiso('limpieza.editar')} />
                  ))}
                </div>
              </section>
            )}

            {tareas.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
                <svg className="mb-4 h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p className="text-lg font-bold text-slate-500">Todo limpio</p>
                <p className="mt-1 text-sm text-slate-400">No hay habitaciones pendientes de limpieza</p>
              </div>
            )}
          </div>
        )}

        {tab === 'historial' && (
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {historial.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3">Hab.</th>
                      <th className="px-5 py-3">Tipo</th>
                      <th className="px-5 py-3">Inicio</th>
                      <th className="px-5 py-3">Fin</th>
                      <th className="px-5 py-3">Duración</th>
                      <th className="px-5 py-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {historial.map((h) => (
                      <tr key={h.id_limpieza} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-bold text-slate-800">
                          Hab. {h.numero_habitacion}
                          <span className="ml-1.5 text-xs font-normal text-slate-400">P{h.piso}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="capitalize text-slate-600">{h.tipo}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-xs">{fmtFecha(h.fecha_inicio)}</td>
                        <td className="px-5 py-3 text-slate-600 text-xs">{fmtFecha(h.fecha_fin)}</td>
                        <td className="px-5 py-3">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            {duracion(h.fecha_inicio, h.fecha_fin)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 max-w-xs truncate text-xs">
                          {h.observaciones || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                Sin historial disponible
              </div>
            )}
          </div>
        )}
      </div>

      {mostrarModal && tienePermiso('limpieza.crear') && (
        <ModalCrear onClose={() => setMostrarModal(false)} onCreada={handleCrear} />
      )}
    </div>
  );
};

export default Limpieza;

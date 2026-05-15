import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  getDashboardOverview
} from '../services/dashboard.js';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, gradient }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
    <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/5" />
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner">
          {icon}
        </span>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{sub}</span>
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
    </div>
  </div>
);

const KpiCard = ({ label, value, description, icon }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-0.5 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  </div>
);

const SectionCard = ({ title, children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}>
    <div className="border-b border-slate-100 px-5 py-4">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex h-52 flex-col items-center justify-center gap-2 text-slate-400">
    <svg className="h-10 w-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
    <p className="text-sm font-medium">{text}</p>
  </div>
);

const Dashboard = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [overview, setOverview] = useState(null);
  const [estadisticasGenerales, setEstadisticasGenerales] = useState(null);
  const [reservasPorEstado, setReservasPorEstado] = useState([]);
  const [reservasPorPeriodo, setReservasPorPeriodo] = useState([]);
  const [habitacionesMasReservadas, setHabitacionesMasReservadas] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);
  const [estadoHabitaciones, setEstadoHabitaciones] = useState([]);
  const [ingresosPorPeriodo, setIngresosPorPeriodo] = useState([]);
  const [clientesFrecuentes, setClientesFrecuentes] = useState([]);
  const [proximasEntradas, setProximasEntradas] = useState([]);
  const [proximasSalidas, setProximasSalidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { cargarDatos(); }, [periodo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardOverview(periodo);
      setOverview(data || null);
      setEstadisticasGenerales(data?.estadisticasGenerales || null);
      setReservasPorEstado(data?.reservasPorEstado || []);
      setReservasPorPeriodo(data?.reservasPorPeriodo || []);
      setHabitacionesMasReservadas(data?.habitacionesMasReservadas || []);
      setMetodosPago(data?.metodosPago || []);
      setEstadoHabitaciones(data?.estadoHabitaciones || []);
      setIngresosPorPeriodo(data?.ingresosPorPeriodo || []);
      setClientesFrecuentes(data?.clientesFrecuentes || []);
      setProximasEntradas(data?.proximasEntradas || []);
      setProximasSalidas(data?.proximasSalidas || []);
    } catch {
      setError('No se pudo cargar el dashboard. Verifica el servidor y tu sesión.');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodoLabel = () =>
    ({ semana: 'Última semana', mes: 'Este mes', año: 'Este año' })[periodo] ?? 'Este mes';

  const fmtBs = (n) =>
    `Bs. ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="font-semibold text-slate-600">Cargando dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Panel de control</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Estadísticas y métricas del hostal
              {overview?.rango?.inicio && (
                <span className="ml-2 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                  {new Date(overview.rango.inicio).toLocaleDateString('es-ES')} — {new Date(overview.rango.fin).toLocaleDateString('es-ES')}
                </span>
              )}
            </p>
          </div>

          {/* Filtros */}
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1">
            {[['semana', 'Semana'], ['mes', 'Mes'], ['año', 'Año']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriodo(key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  periodo === key
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-center justify-between">
            <p className="font-semibold text-red-700">{error}</p>
            <button onClick={cargarDatos} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
              Reintentar
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon="📅"
            label="Total Reservas"
            value={estadisticasGenerales?.totalReservas ?? 0}
            sub={getPeriodoLabel()}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
          />
          <StatCard
            icon="💰"
            label="Ingresos"
            value={fmtBs(estadisticasGenerales?.ingresosPeriodo)}
            sub={getPeriodoLabel()}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
          <StatCard
            icon="👥"
            label="Total Clientes"
            value={estadisticasGenerales?.totalClientes ?? 0}
            sub="Activos"
            gradient="bg-gradient-to-br from-violet-500 to-violet-700"
          />
          <StatCard
            icon="🏨"
            label="Tasa de Ocupación"
            value={`${Number(estadisticasGenerales?.tasaOcupacion || 0).toFixed(1)}%`}
            sub={`${estadisticasGenerales?.habitacionesOcupadasRango ?? 0}/${estadisticasGenerales?.totalHabitaciones ?? 0} hab.`}
            gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          />
        </div>

        {/* KPIs */}
        {estadisticasGenerales && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              icon="📊"
              label="ADR"
              value={fmtBs(estadisticasGenerales.adr)}
              description="Precio promedio por noche"
            />
            <KpiCard
              icon="📈"
              label="RevPAR"
              value={fmtBs(estadisticasGenerales.revpar)}
              description="Ingresos por habitación disponible"
            />
            <KpiCard
              icon="🌙"
              label="Noches promedio"
              value={Number(estadisticasGenerales.nochesPromedio || 0).toFixed(2)}
              description="Duración promedio de estancia"
            />
          </div>
        )}

        {/* Pie charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title={`Reservas por estado · ${getPeriodoLabel()}`}>
            {reservasPorEstado.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reservasPorEstado} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {reservasPorEstado.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState text="Sin datos para este periodo" />}
          </SectionCard>

          <SectionCard title="Estado actual de habitaciones">
            {estadoHabitaciones.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={estadoHabitaciones} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {estadoHabitaciones.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState text="Sin datos disponibles" />}
          </SectionCard>
        </div>

        {/* Area chart reservas + ingresos */}
        <SectionCard title={`Reservas e Ingresos · ${getPeriodoLabel()}`}>
          {reservasPorPeriodo.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reservasPorPeriodo}>
                  <defs>
                    <linearGradient id="gReservas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={periodo !== 'año' ? -35 : 0} textAnchor={periodo !== 'año' ? 'end' : 'middle'} height={periodo !== 'año' ? 70 : 40} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10} />
                  <Area yAxisId="left" type="monotone" dataKey="cantidad" stroke="#6366f1" strokeWidth={2} fill="url(#gReservas)" name="Reservas" dot={{ r: 3, fill: '#6366f1' }} />
                  <Area yAxisId="right" type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} fill="url(#gIngresos)" name="Ingresos (Bs.)" dot={{ r: 3, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState text="Sin datos para este periodo" />}
        </SectionCard>

        {/* Bar chart ingresos detallados */}
        <SectionCard title={`Ingresos detallados · ${getPeriodoLabel()}`}>
          {ingresosPorPeriodo.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosPorPeriodo} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={periodo !== 'año' ? -35 : 0} textAnchor={periodo !== 'año' ? 'end' : 'middle'} height={periodo !== 'año' ? 70 : 40} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip formatter={(v) => [fmtBs(v), 'Ingresos']} />
                  <Bar dataKey="total" name="Ingresos (Bs.)" radius={[6, 6, 0, 0]}>
                    {ingresosPorPeriodo.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState text="Sin datos para este periodo" />}
        </SectionCard>

        {/* Habitaciones + métodos de pago */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard title={`Top 10 habitaciones · ${getPeriodoLabel()}`}>
            {habitacionesMasReservadas.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitacionesMasReservadas} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis type="category" dataKey="numero" width={54} tickFormatter={(v) => `Hab. ${v}`} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip formatter={(v) => [v, 'Reservas']} />
                    <Bar dataKey="total_reservas" name="Reservas" radius={[0, 6, 6, 0]}>
                      {habitacionesMasReservadas.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState text="Sin datos para este periodo" />}
          </SectionCard>

          <SectionCard title={`Métodos de pago · ${getPeriodoLabel()}`}>
            {metodosPago.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metodosPago} barGap={4} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="metodo_pago" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip formatter={(v, name) => [name === 'Monto Total (Bs.)' ? fmtBs(v) : v, name]} />
                    <Legend iconType="circle" iconSize={10} />
                    <Bar dataKey="cantidad" fill="#6366f1" name="Cantidad" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="total_monto" fill="#10b981" name="Monto Total (Bs.)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState text="Sin datos para este periodo" />}
          </SectionCard>
        </div>

        {/* Clientes frecuentes + Próximos movimientos */}
        <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
          <SectionCard title={`Clientes frecuentes · ${getPeriodoLabel()}`} className="lg:col-span-2">
            {clientesFrecuentes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pr-4">#</th>
                      <th className="pb-3 pr-4">Cliente</th>
                      <th className="pb-3 pr-4">Correo</th>
                      <th className="pb-3 pr-4 text-center">Reservas</th>
                      <th className="pb-3 text-right">Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clientesFrecuentes.map((c, idx) => (
                      <tr key={c.correo || idx} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-3 pr-4 text-slate-400 font-medium">#{idx + 1}</td>
                        <td className="py-3 pr-4 font-semibold text-slate-800">{c.nombre} {c.apellido}</td>
                        <td className="py-3 pr-4 text-slate-500 text-xs">{c.correo || '—'}</td>
                        <td className="py-3 pr-4 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                            {c.total_reservas}
                          </span>
                        </td>
                        <td className="py-3 text-right font-semibold text-emerald-700">
                          {fmtBs(c.gasto_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState text="Sin clientes frecuentes para este periodo" />}
          </SectionCard>

          <SectionCard title="Próximos 7 días">
            <div className="space-y-5">
              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                  Entradas
                </p>
                {proximasEntradas.length > 0 ? (
                  <ul className="space-y-2">
                    {proximasEntradas.map((r) => (
                      <li key={`in-${r.id_reserva}`} className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{r.cliente}</p>
                          <p className="text-xs text-slate-500">Hab. {r.habitacion} · {r.estado}</p>
                        </div>
                        <div className="ml-3 text-right flex-shrink-0">
                          <p className="text-xs font-bold text-slate-700">{new Date(r.fecha_entrada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-emerald-700 font-semibold">{fmtBs(r.total)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-400 italic">Sin entradas programadas</p>}
              </div>

              <div>
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
                  <span className="flex h-2 w-2 rounded-full bg-rose-500" />
                  Salidas
                </p>
                {proximasSalidas.length > 0 ? (
                  <ul className="space-y-2">
                    {proximasSalidas.map((r) => (
                      <li key={`out-${r.id_reserva}`} className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">{r.cliente}</p>
                          <p className="text-xs text-slate-500">Hab. {r.habitacion} · {r.estado}</p>
                        </div>
                        <div className="ml-3 text-right flex-shrink-0">
                          <p className="text-xs font-bold text-slate-700">{new Date(r.fecha_salida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-rose-600 font-semibold">{fmtBs(r.total)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-slate-400 italic">Sin salidas programadas</p>}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

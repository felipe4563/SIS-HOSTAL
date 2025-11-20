import { useEffect, useState } from "react";
import {
  crearHabitacion,
  actualizarHabitacion,
} from "../../services/habitacion";
import { listarTipos } from "../../services/tipo";

const HabitacionForm = ({ habitacionEdit, onSaved }) => {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({
    numero: "",
    id_tipo: "",
    precio_total: "",
    piso: "",
    estado: "disponible",
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);

  // Cargar tipos
  const cargarTipos = async () => {
    try {
      const data = await listarTipos();
      setTipos(data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  // Si está editando, cargar datos
  useEffect(() => {
    cargarTipos();

    if (habitacionEdit) {
      setForm({
        numero: habitacionEdit.numero,
        id_tipo: habitacionEdit.id_tipo,
        precio_total: habitacionEdit.precio_total,
        piso: habitacionEdit.piso,
        estado: habitacionEdit.estado,
        descripcion: habitacionEdit.descripcion || "",
      });
    } else {
      setForm({
        numero: "",
        id_tipo: "",
        precio_total: "",
        piso: "",
        estado: "disponible",
        descripcion: "",
      });
    }
  }, [habitacionEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (habitacionEdit) {
        await actualizarHabitacion(habitacionEdit.id_habitacion, form);
      } else {
        await crearHabitacion(form);
      }

      onSaved(); // refresca lista y cambia pestaña
    } catch (error) {
      console.error("Error al guardar habitación:", error);
      alert(error?.response?.data?.message || "Error al guardar la habitación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-6 max-w-xl">
      <h3 className="text-xl font-semibold mb-4">
        {habitacionEdit ? "Editar Habitación" : "Registrar Habitación"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Número */}
        <div>
          <label className="block font-medium">Número de Habitación</label>
          <input
            type="text"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded mt-1"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block font-medium">Tipo de Habitación</label>
          <select
            name="id_tipo"
            value={form.id_tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded mt-1"
          >
            <option value="">-- Seleccione --</option>
            {tipos.map((t) => (
              <option key={t.id_tipo} value={t.id_tipo}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block font-medium">Precio Total (Bs.)</label>
          <input
            type="number"
            name="precio_total"
            value={form.precio_total}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded mt-1"
            min="1"
          />
        </div>

        {/* Piso */}
        <div>
          <label className="block font-medium">Piso</label>
          <input
            type="number"
            name="piso"
            value={form.piso}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mt-1"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-medium">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mt-1"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block font-medium">Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded mt-1"
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="limpieza">En Limpieza</option>
          </select>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Guardando..." : habitacionEdit ? "Actualizar" : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default HabitacionForm;

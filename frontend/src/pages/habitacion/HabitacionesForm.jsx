import { useState, useEffect } from "react";
import { crearHabitacion, obtenerHabitacion, actualizarHabitacion } from "../../services/habitacion";
import { listarTipos } from "../../services/tipo";

const HabitacionForm = ({ id, onSuccess }) => {
  const [form, setForm] = useState({
    numero: "",
    id_tipo: "",
    precio_total: "",
    piso: "",
    estado: "disponible",
    descripcion: ""
  });

  const [tipos, setTipos] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [imagenesFiles, setImagenesFiles] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [cargando, setCargando] = useState(false);

  // ==========================
  // CARGAR TIPOS DE HABITACIÓN
  // ==========================
  useEffect(() => {
    listarTipos().then(setTipos).catch(err => console.error("Error al cargar tipos:", err));
  }, []);

  // ==========================
  // CARGAR HABITACIÓN AL EDITAR
  // ==========================
  useEffect(() => {
    if (id) {
      obtenerHabitacion(id)
        .then((data) => {
          setForm({
            numero: data.numero,
            id_tipo: data.id_tipo,
            precio_total: data.precio_total,
            piso: data.piso || "",
            estado: data.estado,
            descripcion: data.descripcion || ""
          });
          setImagenesExistentes(data.imagenes || []);
        })
        .catch((err) => console.error("Error al cargar habitación:", err));
    } else {
      setForm({
        numero: "",
        id_tipo: "",
        precio_total: "",
        piso: "",
        estado: "disponible",
        descripcion: ""
      });
      setImagenesExistentes([]);
      setImagenesFiles([]);
      setImagenesPreview([]);
    }
  }, [id]);

  // ==========================
  // MANEJO DE INPUTS
  // ==========================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==========================
  // MANEJO DE IMÁGENES
  // ==========================
  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    setImagenesFiles(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagenesPreview(previews);
  };

  const handleRemoveExistingImage = (id_imagen) => {
    setImagenesExistentes(imagenesExistentes.filter(img => img.id_imagen !== id_imagen));
  };

  // ==========================
  // SUBMIT
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const fd = new FormData();
      fd.append("numero", form.numero);
      fd.append("id_tipo", form.id_tipo);
      fd.append("precio_total", form.precio_total);
      fd.append("piso", form.piso);
      fd.append("estado", form.estado);
      fd.append("descripcion", form.descripcion);

      // nuevas imágenes
      imagenesFiles.forEach((file) => {
        fd.append("imagenes", file);
      });

      // enviar imágenes existentes (para que el backend no las borre)
      fd.append("imagenesExistentes", JSON.stringify(imagenesExistentes));

      if (!id) {
        await crearHabitacion(fd);
      } else {
        await actualizarHabitacion(id, fd);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar habitación:", error);
      alert(error?.response?.data?.message || "Error al guardar habitación");
    }

    setCargando(false);
  };

  return (
    <div className="p-4 bg-white shadow rounded max-w-2xl">
      <h2 className="text-lg font-bold mb-3">{id ? "Editar Habitación" : "Registrar Habitación"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Número */}
        <div>
          <label className="block font-medium mb-1">Número</label>
          <input
            type="text"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block font-medium mb-1">Tipo</label>
          <select
            name="id_tipo"
            value={form.id_tipo}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Seleccione</option>
            {tipos.map((t) => (
              <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block font-medium mb-1">Precio total</label>
          <input
            type="number"
            name="precio_total"
            value={form.precio_total}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            min="1"
            required
          />
        </div>

        {/* Piso */}
        <div>
          <label className="block font-medium mb-1">Piso</label>
          <input
            type="number"
            name="piso"
            value={form.piso}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block font-medium mb-1">Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="limpieza">Limpieza</option>
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-medium mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Nuevas imágenes */}
        <div>
          <label className="block font-medium mb-1">Agregar imágenes</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagenes}
            className="border p-2 w-full rounded"
          />
          {imagenesPreview.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {imagenesPreview.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="preview"
                  className="w-full h-28 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        // Imágenes existentes
{id && imagenesExistentes.length > 0 && (
  <div>
    <label className="block font-medium mb-1">Imágenes existentes</label>
    <div className="grid grid-cols-3 gap-2 mt-2">
      {imagenesExistentes.map((img) => {
        // Si es un objeto con propiedad 'ruta' (URL completa)
        const src = typeof img === 'object' && img.ruta 
          ? img.ruta 
          : typeof img === 'string' 
            ? img 
            : `${import.meta.env.VITE_BASE_URL || ''}/${img}`;
        
        return (
          <div key={img.id_imagen || img} className="relative">
            <img
              src={src}
              alt="actual"
              className="w-full h-28 object-cover rounded border"
              onError={(e) => {
                console.error("Error cargando imagen:", src);
                e.target.src = "https://via.placeholder.com/150x100?text=Error";
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveExistingImage(img.id_imagen || img)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}

        {/* Botón */}
        <button
          type="submit"
          disabled={cargando}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded w-full mt-4"
        >
          {cargando ? "Guardando..." : id ? "Actualizar" : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default HabitacionForm;

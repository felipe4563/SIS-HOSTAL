import { useState, useEffect } from "react";
import { crearHabitacion, obtenerHabitacion, actualizarHabitacion } from "../../services/habitacion";
import { listarTipos } from "../../services/tipo";

const HabitacionForm = ({ id, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    numero: "",
    id_tipo: "",
    precio_total: "",
    piso: "",
    estado: "disponible",
    descripcion: ""
  });

  const [tipos, setTipos] = useState([]);
  
  // Imágenes normales
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [imagenesFiles, setImagenesFiles] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  
  // Imágenes 360° (solo lectura en este form)
  const [imagenes360Existentes, setImagenes360Existentes] = useState([]);
  
  const [cargando, setCargando] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Cargar tipos
  useEffect(() => {
    listarTipos()
      .then(setTipos)
      .catch(err => console.error("Error al cargar tipos:", err));
  }, []);

  // Cargar habitación si es edición
  useEffect(() => {
    if (id) {
      obtenerHabitacion(id)
        .then((data) => {
          setForm({
            numero: data.numero || "",
            id_tipo: data.id_tipo || "",
            precio_total: data.precio_total || "",
            piso: data.piso || "",
            estado: data.estado || "disponible",
            descripcion: data.descripcion || ""
          });
          setImagenesExistentes(data.imagenes || []);
          setImagenes360Existentes(data.imagenes_360 || []);
        })
        .catch((err) => console.error("Error al cargar habitación:", err));
    } else {
      resetForm();
    }
  }, [id]);

  const resetForm = () => {
    setForm({
      numero: "",
      id_tipo: "",
      precio_total: "",
      piso: "",
      estado: "disponible",
      descripcion: ""
    });
    setImagenesExistentes([]);
    setImagenes360Existentes([]);
    setImagenesFiles([]);
    setImagenesPreview([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Manejo de imágenes nuevas
  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    setImagenesFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagenesPreview(prev => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (index) => {
    setImagenesFiles(prev => prev.filter((_, i) => i !== index));
    setImagenesPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (id_imagen) => {
    setImagenesExistentes(prev => prev.filter(img => img.id_imagen !== id_imagen));
  };

  // Submit
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

      imagenesFiles.forEach((file) => {
        fd.append("imagenes", file);
      });

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
    <div className="bg-white shadow-lg rounded-xl overflow-hidden max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          {id ? "✏️ Editar Habitación" : "🏨 Nueva Habitación"}
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          {id ? "Modifica los datos de la habitación" : "Completa los datos para registrar"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'info'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Información
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('imagenes')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'imagenes'
              ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🖼️ Imágenes ({imagenesExistentes.length + imagenesPreview.length})
        </button>
        {id && (
          <button
            type="button"
            onClick={() => setActiveTab('360')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
              activeTab === '360'
                ? 'border-b-2 border-purple-600 text-purple-600 bg-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔄 Tour 360° ({imagenes360Existentes.length})
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        
        {/* TAB: INFORMACIÓN */}
        {activeTab === 'info' && (
          <div className="space-y-5">
            {/* Número y Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Habitación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="Ej: 101, 102A"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_tipo"
                  value={form.id_tipo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo} value={t.id_tipo}>
                      {t.nombre} (Cap. {t.capacidad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Precio y Piso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Total (Bs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Bs.</span>
                  <input
                    type="number"
                    name="precio_total"
                    value={form.precio_total}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Piso
                </label>
                <input
                  type="number"
                  name="piso"
                  value={form.piso}
                  onChange={handleChange}
                  placeholder="Ej: 1, 2, 3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  min="0"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'disponible', label: 'Disponible', icon: '✅', bg: 'green' },
                  { value: 'ocupada', label: 'Ocupada', icon: '🔒', bg: 'red' },
                  { value: 'limpieza', label: 'Limpieza', icon: '🧹', bg: 'yellow' }
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      form.estado === opt.value
                        ? `border-${opt.bg}-500 bg-${opt.bg}-50`
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="estado"
                      value={opt.value}
                      checked={form.estado === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Describe las características de la habitación..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB: IMÁGENES */}
        {activeTab === 'imagenes' && (
          <div className="space-y-6">
            {/* Subir nuevas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar Imágenes
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagenes}
                  className="hidden"
                  id="input-imagenes"
                />
                <label htmlFor="input-imagenes" className="cursor-pointer">
                  <div className="text-5xl mb-3">📷</div>
                  <p className="text-gray-600 font-medium">Clic para seleccionar imágenes</p>
                  <p className="text-sm text-gray-400 mt-1">JPG, PNG, GIF (máx. 5MB cada una)</p>
                </label>
              </div>
            </div>

            {/* Preview nuevas */}
            {imagenesPreview.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">Nuevas</span>
                  {imagenesPreview.length} imagen(es)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagenesPreview.map((src, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img
                        src={src}
                        alt={`Nueva ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg border shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existentes */}
            {id && imagenesExistentes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">Actuales</span>
                  {imagenesExistentes.length} imagen(es)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagenesExistentes.map((img) => (
                    <div key={img.id_imagen} className="relative group aspect-square">
                      <img
                        src={img.url || img.ruta}
                        alt="Existente"
                        className="w-full h-full object-cover rounded-lg border shadow-sm"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=Error";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id_imagen)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      {img.es_portada === 1 && (
                        <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded shadow">
                          ⭐ Portada
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {imagenesExistentes.length === 0 && imagenesPreview.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <div className="text-5xl mb-3">🖼️</div>
                <p>No hay imágenes agregadas</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: TOUR 360° */}
        {activeTab === '360' && id && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-medium text-purple-800">Tour Virtual 360°</h4>
                  <p className="text-sm text-purple-600 mt-1">
                    Las imágenes 360° se gestionan desde el botón "🔄 Tour 360°" en la lista de habitaciones.
                  </p>
                </div>
              </div>
            </div>

            {imagenes360Existentes.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Imágenes 360° actuales ({imagenes360Existentes.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imagenes360Existentes.map((img, idx) => (
                    <div key={img.id_imagen} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <img
                        src={img.url}
                        alt={img.titulo || `360° ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <p className="font-medium text-gray-800">{img.titulo || `Escena ${idx + 1}`}</p>
                        {img.descripcion && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{img.descripcion}</p>
                        )}
                        <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Orden: {img.orden}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <div className="text-5xl mb-3">🔄</div>
                <p>No hay imágenes 360° para esta habitación</p>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 mt-8 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={cargando}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>{id ? '💾 Actualizar Habitación' : '➕ Registrar Habitación'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitacionForm;
import { useState, useEffect } from "react";
import { crearHabitacion, obtenerHabitacion, actualizarHabitacion } from "../../services/habitacion";
import { listarTipos } from "../../services/tipo";
import {
  XMarkIcon,
  PhotoIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

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
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [imagenesFiles, setImagenesFiles] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Configuración de estados con iconos
  const estadoConfig = {
    disponible: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: CheckCircleIcon,
      label: "Disponible"
    },
    ocupada: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: ExclamationCircleIcon,
      label: "Ocupada"
    },
    limpieza: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: ClockIcon,
      label: "En Limpieza"
    },
  };

  // ==========================
  // CARGAR TIPOS DE HABITACIÓN
  // ==========================
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        setLoadingTipos(true);
        const datosTipos = await listarTipos();
        setTipos(datosTipos);
      } catch (err) {
        console.error("Error al cargar tipos:", err);
        setError("No se pudieron cargar los tipos de habitación");
      } finally {
        setLoadingTipos(false);
      }
    };
    
    cargarTipos();
  }, []);

  // ==========================
  // CARGAR HABITACIÓN AL EDITAR
  // ==========================
  useEffect(() => {
    if (id) {
      const cargarHabitacion = async () => {
        try {
          setCargando(true);
          const data = await obtenerHabitacion(id);
          
          setForm({
            numero: data.numero || "",
            id_tipo: data.id_tipo || "",
            precio_total: data.precio_total || "",
            piso: data.piso || "",
            estado: data.estado || "disponible",
            descripcion: data.descripcion || ""
          });
          
          // Normalizar imágenes existentes
          const imagenesNormalizadas = (data.imagenes || []).map(img => {
            if (typeof img === 'string') {
              return {
                id_imagen: `temp_${Date.now()}_${Math.random()}`,
                ruta: img,
                es_portada: false
              };
            }
            return img;
          });
          
          setImagenesExistentes(imagenesNormalizadas);
          setError(null);
        } catch (err) {
          console.error("Error al cargar habitación:", err);
          setError("No se pudo cargar la habitación. Intente nuevamente.");
        } finally {
          setCargando(false);
        }
      };
      
      cargarHabitacion();
    } else {
      // Resetear formulario para crear nueva
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
      setError(null);
    }
  }, [id]);

  // ==========================
  // MANEJO DE INPUTS
  // ==========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================
  // MANEJO DE IMÁGENES
  // ==========================
  const handleImagenes = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar cantidad máxima (ej: 10 imágenes)
    if (files.length + imagenesFiles.length + imagenesExistentes.length > 10) {
      alert("Máximo 10 imágenes por habitación");
      return;
    }
    
    // Validar tamaño (ej: 5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const archivoGrande = files.find(file => file.size > maxSize);
    if (archivoGrande) {
      alert(`El archivo ${archivoGrande.name} excede el tamaño máximo de 5MB`);
      return;
    }
    
    setImagenesFiles(prev => [...prev, ...files]);
    
    // Crear previews
    const previews = files.map(file => ({
      id: URL.createObjectURL(file),
      file: file,
      name: file.name
    }));
    
    setImagenesPreview(prev => [...prev, ...previews]);
  };

  const handleRemovePreviewImage = (index) => {
    const nuevaPreviews = [...imagenesPreview];
    nuevaPreviews.splice(index, 1);
    setImagenesPreview(nuevaPreviews);
    
    const nuevaFiles = [...imagenesFiles];
    nuevaFiles.splice(index, 1);
    setImagenesFiles(nuevaFiles);
  };

  const handleRemoveExistingImage = (id_imagen) => {
    setImagenesExistentes(prev => prev.filter(img => img.id_imagen !== id_imagen));
  };

  const limpiarFormulario = () => {
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
    setError(null);
  };

  // ==========================
  // SUBMIT
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      const fd = new FormData();
      
      // Campos básicos
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });

      // Nuevas imágenes
      imagenesFiles.forEach((file) => {
        fd.append("imagenes", file);
      });

      // Imágenes existentes (para que el backend no las borre)
      if (imagenesExistentes.length > 0) {
        fd.append("imagenesExistentes", JSON.stringify(imagenesExistentes));
      }

      if (!id) {
        await crearHabitacion(fd);
        limpiarFormulario();
      } else {
        await actualizarHabitacion(id, fd);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al guardar habitación:", error);
      const mensajeError = error?.response?.data?.message || "Error al guardar la habitación";
      setError(mensajeError);
      
      // Scroll al error
      setTimeout(() => {
        document.getElementById('error-message')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setCargando(false);
    }
  };

  // Si está cargando datos para editar
  if (cargando && id) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Cargando datos de la habitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header del formulario */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BuildingOfficeIcon className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">
                {id ? "Editar Habitación" : "Nueva Habitación"}
              </h2>
              <p className="text-blue-100 text-sm">
                {id ? "Actualiza la información de la habitación" : "Registra una nueva habitación en el sistema"}
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido del formulario */}
      <div className="p-6">
        {error && (
          <div 
            id="error-message"
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Información Básica */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-blue-500" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Habitación *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 101"
                    required
                    disabled={cargando}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Habitación *
                </label>
                <div className="relative">
                  <select
                    name="id_tipo"
                    value={form.id_tipo}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    required
                    disabled={cargando || loadingTipos}
                  >
                    <option value="">Seleccione un tipo</option>
                    {loadingTipos ? (
                      <option value="" disabled>Cargando tipos...</option>
                    ) : (
                      tipos.map((t) => (
                        <option key={t.id_tipo} value={t.id_tipo}>
                          {t.nombre} - Capacidad: {t.capacidad} personas
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Noche (Bs.) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="precio_total"
                    value={form.precio_total}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    required
                    disabled={cargando}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Piso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Piso
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="piso"
                    value={form.piso}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 1"
                    min="0"
                    disabled={cargando}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <MapPinIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de la Habitación
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(estadoConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        form.estado === key 
                          ? `${config.color} border-blue-500 ring-2 ring-blue-200` 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="estado"
                        value={key}
                        checked={form.estado === key}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600"
                        disabled={cargando}
                      />
                      <Icon className={`h-5 w-5 ${form.estado === key ? 'opacity-100' : 'opacity-60'}`} />
                      <span className="font-medium">{config.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sección 2: Descripción */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Descripción
            </h3>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe la habitación, incluye características, comodidades, etc."
              rows="4"
              disabled={cargando}
            />
            <p className="text-sm text-gray-500 mt-2">
              {form.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Sección 3: Imágenes */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PhotoIcon className="h-5 w-5 text-blue-500" />
              Imágenes de la Habitación
              <span className="text-sm font-normal text-gray-500">
                (Máximo 10 imágenes)
              </span>
            </h3>

            {/* Subir nuevas imágenes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Agregar nuevas imágenes
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImagenes}
                    className="hidden"
                    disabled={cargando}
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <PlusCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Haz clic o arrastra imágenes aquí</p>
                    <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF hasta 5MB cada una</p>
                  </div>
                </label>
                
                {/* Preview de nuevas imágenes */}
                {imagenesPreview.length > 0 && (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Imágenes nuevas ({imagenesPreview.length})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagenesPreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.id}
                            alt={`Nueva imagen ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePreviewImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {preview.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Imágenes existentes (solo en edición) */}
            {id && imagenesExistentes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Imágenes existentes ({imagenesExistentes.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagenesExistentes.map((img) => {
                    const src = img.ruta || img;
                    return (
                      <div key={img.id_imagen} className="relative group">
                        <img
                          src={src}
                          alt="Habitación"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/200x150?text=Error+Imagen";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(img.id_imagen)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center rounded-b-lg">
                          {img.es_portada ? "Portada" : "Imagen"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Las imágenes marcadas con ✕ se eliminarán al guardar
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  {id ? "Actualizando..." : "Guardando..."}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  {id ? "Actualizar Habitación" : "Crear Habitación"}
                </>
              )}
            </button>
            
            {!id ? (
              <button
                type="button"
                onClick={limpiarFormulario}
                disabled={cargando}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Limpiar Formulario
              </button>
            ) : onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={cargando}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitacionForm;
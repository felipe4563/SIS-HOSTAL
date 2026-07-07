import { useState, useEffect } from "react";
import { ReactPhotoSphereViewer } from "react-photo-sphere-viewer";
import {
  listarImagenes360,
  subirImagen360,
  eliminarImagen360,
  actualizarImagen360
} from "../../services/habitacion";
import CapturaAsistente360 from "./CapturaAsistente360";

const Imagenes360Manager = ({ habitacion, onClose, onUpdate }) => {
  const [imagenes,       setImagenes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [mostrarCaptura, setMostrarCaptura] = useState(false);
  const [viewerUrl,      setViewerUrl]      = useState(null);

  // Form para nueva imagen
  const [newImage, setNewImage] = useState({
    file: null,
    titulo: "",
    descripcion: "",
    preview: null
  });

  // Edición
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({
    titulo: "",
    descripcion: "",
    orden: 0
  });

  const cargarImagenes = async () => {
    try {
      setLoading(true);
      const data = await listarImagenes360(habitacion.id_habitacion);
      setImagenes(data);
    } catch (error) {
      console.error("Error al cargar imágenes 360°:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habitacion?.id_habitacion) {
      cargarImagenes();
    }
  }, [habitacion]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage({
        ...newImage,
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newImage.file) {
      alert("Selecciona una imagen primero");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("imagen360", newImage.file);
      formData.append("titulo", newImage.titulo);
      formData.append("descripcion", newImage.descripcion);

      await subirImagen360(habitacion.id_habitacion, formData);

      setNewImage({ file: null, titulo: "", descripcion: "", preview: null });
      cargarImagenes();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al subir imagen:", error);
      alert(error?.response?.data?.message || "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (idImagen) => {
    if (!confirm("¿Eliminar esta imagen 360°?")) return;

    try {
      await eliminarImagen360(habitacion.id_habitacion, idImagen);
      cargarImagenes();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar imagen");
    }
  };

  const startEdit = (img) => {
    setEditando(img.id_imagen);
    setEditForm({
      titulo: img.titulo || "",
      descripcion: img.descripcion || "",
      orden: img.orden || 0
    });
  };

  const handleSaveEdit = async () => {
    try {
      await actualizarImagen360(habitacion.id_habitacion, editando, editForm);
      setEditando(null);
      cargarImagenes();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar imagen");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🔄 Tour Virtual 360°
            </h2>
            <p className="text-purple-200 text-sm">
              Habitación {habitacion.numero} - {habitacion.tipo_habitacion}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarCaptura(true)}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
              Capturar
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Formulario para subir */}
          <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
              📤 Subir Nueva Imagen 360°
            </h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Selector de archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Panorámica *
                  </label>
                  <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="input-360"
                    />
                    <label htmlFor="input-360" className="cursor-pointer block">
                      {newImage.preview ? (
                        <div className="relative">
                          <img
                            src={newImage.preview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setNewImage({ ...newImage, file: null, preview: null });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">🖼️</div>
                          <p className="text-sm text-gray-600">Clic para seleccionar</p>
                          <p className="text-xs text-gray-400 mt-1">Imagen equirectangular (2:1)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Campos */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={newImage.titulo}
                      onChange={(e) => setNewImage({ ...newImage, titulo: e.target.value })}
                      placeholder="Ej: Vista principal, Baño"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={newImage.descripcion}
                      onChange={(e) => setNewImage({ ...newImage, descripcion: e.target.value })}
                      placeholder="Descripción del punto de vista..."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newImage.file || uploading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Subiendo...
                  </>
                ) : (
                  <>📤 Subir Imagen 360°</>
                )}
              </button>
            </form>
          </div>

          {/* Lista de imágenes */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🖼️ Imágenes 360° ({imagenes.length})
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-3">Cargando imágenes...</p>
              </div>
            ) : imagenes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-3">🔄</div>
                <p className="text-gray-600 font-medium">No hay imágenes 360° aún</p>
                <p className="text-gray-400 text-sm mt-1">Sube la primera imagen para el tour virtual</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imagenes.map((img, index) => (
                  <div
                    key={img.id_imagen}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Imagen */}
                    <div className="relative h-40 bg-gray-100">
                      <img
                        src={img.url}
                        alt={img.titulo || `Escena ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/400x200?text=Error";
                        }}
                      />
                      <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow">
                        #{img.orden}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      {editando === img.id_imagen ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.titulo}
                            onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                            placeholder="Título"
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                          />
                          <textarea
                            value={editForm.descripcion}
                            onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                            placeholder="Descripción"
                            rows={2}
                            className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-purple-500"
                          />
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Orden:</label>
                            <input
                              type="number"
                              value={editForm.orden}
                              onChange={(e) => setEditForm({ ...editForm, orden: parseInt(e.target.value) || 0 })}
                              className="w-20 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500"
                              min="0"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              ✓ Guardar
                            </button>
                            <button
                              onClick={() => setEditando(null)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-semibold text-gray-800">
                            {img.titulo || `Escena ${index + 1}`}
                          </h4>
                          {img.descripcion && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {img.descripcion}
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => setViewerUrl(img.url)}
                              className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              🔄 Ver 360°
                            </button>
                            <button
                              onClick={() => startEdit(img)}
                              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDelete(img.id_imagen)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          {imagenes.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-xl">💡</span>
                <div className="text-sm">
                  <p className="font-medium text-blue-800">Consejo</p>
                  <p className="text-blue-600">
                    El orden determina la secuencia del tour. Usa imágenes equirectangulares 
                    (proporción 2:1) para mejor visualización 360°.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {mostrarCaptura && (
        <CapturaAsistente360
          habitacion={habitacion}
          onClose={() => setMostrarCaptura(false)}
          onSuccess={() => {
            cargarImagenes();
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* Viewer 360° interactivo */}
      {viewerUrl && (
        <div className="fixed inset-0 z-[400] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 shrink-0">
            <span className="text-white font-semibold text-sm">Tour Virtual 360°</span>
            <button
              onClick={() => setViewerUrl(null)}
              className="text-white/70 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ReactPhotoSphereViewer
              src={viewerUrl}
              height="100%"
              width="100%"
              defaultZoomLvl={50}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Imagenes360Manager;
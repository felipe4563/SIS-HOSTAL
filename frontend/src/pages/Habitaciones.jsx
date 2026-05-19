import { useState, useContext } from "react";
import HabitacionesLista from "../pages/habitacion/HabitacionesLista.jsx";
import HabitacionForm from "../pages/habitacion/HabitacionesForm.jsx";
import Imagenes360Manager from "./habitacion/Imagenes360Manager.jsx";
import { AuthContext } from "../context/AuthContext";

const Habitaciones = () => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  const [activeTab, setActiveTab] = useState("habitaciones");
  const [editando, setEditando] = useState(null);
  const [reload, setReload] = useState(false);

  // Estado para el modal de imágenes 360°
  const [show360Modal, setShow360Modal] = useState(false);
  const [habitacion360, setHabitacion360] = useState(null);

  // Cuando se hace click en "Editar"
  const handleEditHabitacion = (habitacion) => {
    setEditando(habitacion);
    setActiveTab("formulario");
  };

  // Cuando se hace click en "Tour 360°"
  const handleTour360 = (habitacion) => {
    setHabitacion360(habitacion);
    setShow360Modal(true);
  };

  // Cerrar modal 360°
  const handleClose360 = () => {
    setShow360Modal(false);
    setHabitacion360(null);
  };

  // Después de guardar la habitación (crear o editar)
  const handleHabitacionSaved = () => {
    setEditando(null);
    setReload(!reload);
    setActiveTab("habitaciones");
  };

  // Cuando se actualiza algo en el modal 360°
  const handleUpdate360 = () => {
    setReload(!reload);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🏨 Gestión de Habitaciones</h2>

      {/* Tabs */}
      <div className="flex flex-wrap border-b mb-4">
        {[
          { id: "habitaciones", label: "🛏️ Habitaciones", visible: true },
          {
            id: "formulario",
            label: "📝 Registrar/Editar",
            visible: tienePermiso("habitacion.crear") || tienePermiso("habitacion.editar"),
          },
        ]
          .filter((tab) => tab.visible)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "formulario") setEditando(null);
              }}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === "habitaciones" && (
        <HabitacionesLista 
          onEdit={handleEditHabitacion} 
          onTour360={handleTour360}  // 👈 Pasamos la función para abrir el modal
          reload={reload} 
        />
      )}

      {activeTab === "formulario" && (tienePermiso("habitacion.crear") || tienePermiso("habitacion.editar")) && (
        <HabitacionForm
          id={editando?.id_habitacion}
          onSuccess={handleHabitacionSaved}
          onCancel={() => setActiveTab("habitaciones")}
        />
      )}


      {/* Modal de Imágenes 360° */}
      {show360Modal && habitacion360 && (
        <Imagenes360Manager
          habitacion={habitacion360}
          onClose={handleClose360}
          onUpdate={handleUpdate360}
        />
      )}
    </div>
  );
};

export default Habitaciones;
import { useState } from "react";
import HabitacionesLista from "../pages/habitacion/HabitacionesLista.jsx";
import HabitacionForm from "../pages/habitacion/HabitacionesForm.jsx";
import TiposHabitacionLista from "../pages/habitacion/TiposHabitacionLista.jsx";

const Habitaciones = () => {
  const [activeTab, setActiveTab] = useState("habitaciones");
  const [editando, setEditando] = useState(null);
  const [reload, setReload] = useState(false);

  const handleEditHabitacion = (habitacion) => {
    setEditando(habitacion);
    setActiveTab("formulario");
  };

  const handleHabitacionSaved = () => {
    setEditando(null);
    setReload(!reload);
    setActiveTab("habitaciones");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">🏨 Gestión de Habitaciones</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {[
          { id: "habitaciones", label: "🛏️ Habitaciones" },
          { id: "formulario", label: "📝 Registrar/Editar Habitación" },
          { id: "tipos", label: "🏷️ Tipos de Habitación" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "formulario") setEditando(null);
            }}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === "habitaciones" && (
        <HabitacionesLista onEdit={handleEditHabitacion} reload={reload} />
      )}

      {activeTab === "formulario" && (
        <HabitacionForm
          habitacionEdit={editando}
          onSaved={handleHabitacionSaved}
        />
      )}

      {activeTab === "tipos" && <TiposHabitacionLista />}
    </div>
  );
};

export default Habitaciones;

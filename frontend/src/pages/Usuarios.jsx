import { useState } from "react";
import UsuarioLista from "../pages/usuarios/usuarioslista.jsx";
import UsuarioForm from "../pages/usuarios/UsuariosForm.jsx";

const Usuarios = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [editando, setEditando] = useState(null);
  const [reload, setReload] = useState(false); // para refrescar lista después de registrar

  const handleEditUser = (usuario) => {
    setEditando(usuario);
    setActiveTab("formulario");
  };

  const handleUserSaved = () => {
    setEditando(null);
    setReload(!reload);
    setActiveTab("usuarios");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">⚙️ Administración del Sistema</h2>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {[
          { id: "usuarios", label: "👥 Usuarios" },
          { id: "formulario", label: "📝 Registrar Usuario" },
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

      {/* Contenido de pestañas */}
      {activeTab === "usuarios" && (
        <UsuarioLista onEdit={handleEditUser} reload={reload} />
      )}
      {activeTab === "formulario" && (
        <UsuarioForm usuarioEdit={editando} onSaved={handleUserSaved} />
      )}
    </div>
  );
};

export default Usuarios;

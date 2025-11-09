import { useState } from "react";
import RolesList from "../roles/RolesList";
import AsignarPermisos from "../roles/AsignarPermisos";

const Roles = () => {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Gestión de Roles y Permisos
      </h2>

      {/* Pestañas */}
      <div className="flex space-x-4 border-b border-gray-300 mb-6">
        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === "roles"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>

        <button
          className={`py-2 px-4 font-semibold ${
            activeTab === "asignar"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("asignar")}
        >
          Asignar Permisos
        </button>
      </div>

      {/* Contenido de pestañas */}
      {activeTab === "roles" && <RolesList />}
      {activeTab === "asignar" && <AsignarPermisos />}
    </div>
  );
};

export default Roles;

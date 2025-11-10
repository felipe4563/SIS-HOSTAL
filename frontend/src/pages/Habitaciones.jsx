import React, { useState } from 'react';
import Lista from 'lista';
import Formulario from 'formulario';
import Tipos from 'tipos';

const HabitacionPage = () => {
  const [activeTab, setActiveTab] = useState('lista');

  const tabs = [
    { id: 'lista', label: '📋 Lista de Habitaciones' },
    { id: 'formulario', label: '➕ Nueva Habitación' },
    { id: 'tipos', label: '🏷️ Tipos de Habitación' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h2>
        <p className="text-gray-600">Administra las habitaciones del hostal</p>
      </div>

      {/* Navegación de pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {activeTab === 'lista' && <Lista />}
        {activeTab === 'formulario' && <Formulario onCancel={() => setActiveTab('lista')} />}
        {activeTab === 'tipos' && <Tipos />}
      </div>
    </div>
  );
};

export default HabitacionPage;
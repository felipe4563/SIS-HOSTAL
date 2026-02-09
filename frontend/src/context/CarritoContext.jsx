import { createContext, useState, useContext } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [habitaciones, setHabitaciones] = useState([]);

  const agregarHabitacion = (habitacion) => {
    // Evitar duplicados
    if (!habitaciones.find(h => h.id_habitacion === habitacion.id_habitacion)) {
      setHabitaciones([...habitaciones, habitacion]);
      return true;
    }
    return false;
  };

  const eliminarHabitacion = (id_habitacion) => {
    setHabitaciones(habitaciones.filter(h => h.id_habitacion !== id_habitacion));
  };

  const limpiarCarrito = () => {
    setHabitaciones([]);
  };

  const totalHabitaciones = habitaciones.length;

  const calcularTotal = (dias) => {
    return habitaciones.reduce((sum, h) => sum + (h.precio_total * dias), 0);
  };

  return (
    <CarritoContext.Provider value={{
      habitaciones,
      agregarHabitacion,
      eliminarHabitacion,
      limpiarCarrito,
      totalHabitaciones,
      calcularTotal
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);
import { useCarrito } from '../../context/CarritoContext';

const BotonCarrito = ({ onClick }) => {
  const { totalHabitaciones } = useCarrito();

  if (totalHabitaciones === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center space-x-3 z-50 animate-bounce"
    >
      <span className="text-2xl">🛒</span>
      <div className="text-left">
        <div className="font-bold text-lg">Ver Carrito</div>
        <div className="text-xs opacity-90">
          {totalHabitaciones} {totalHabitaciones === 1 ? 'habitación' : 'habitaciones'}
        </div>
      </div>
      {totalHabitaciones > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold animate-pulse">
          {totalHabitaciones}
        </span>
      )}
    </button>
  );
};

export default BotonCarrito;
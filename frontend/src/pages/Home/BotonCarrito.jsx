import { useCarrito } from '../../context/CarritoContext';

const BotonCarrito = ({ onClick }) => {
  const { totalHabitaciones } = useCarrito();

  if (totalHabitaciones === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-full shadow-2xl transform sm:hover:scale-110 transition-all duration-300 flex items-center gap-2 sm:gap-3 z-50 animate-bounce"
    >
      <span className="text-xl sm:text-2xl">🛒</span>
      <div className="text-left">
        <div className="font-bold text-sm sm:text-lg">Ver Carrito</div>
        <div className="text-[10px] sm:text-xs opacity-90">
          {totalHabitaciones} {totalHabitaciones === 1 ? 'habitación' : 'habitaciones'}
        </div>
      </div>
      {totalHabitaciones > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold animate-pulse">
          {totalHabitaciones}
        </span>
      )}
    </button>
  );
};

export default BotonCarrito;
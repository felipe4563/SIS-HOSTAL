import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TourVirtual360 from './TourVirtual360';

const TourPage360 = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  // Si alguien llega directamente sin datos → volver a inicio
  useEffect(() => {
    if (!state?.imagenes360?.length) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.imagenes360?.length) return null;

  return (
    <TourVirtual360
      imagenes360={state.imagenes360}
      nombreHabitacion={state.nombreHabitacion ?? 'Habitación'}
      onClose={() => navigate(-1)}
    />
  );
};

export default TourPage360;

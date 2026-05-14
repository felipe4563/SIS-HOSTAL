import { z } from 'zod';

export const crearReservaSchema = z.object({
  body: z.object({
    id_cliente: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de cliente es obligatorio'),
    id_habitacion: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de habitación es obligatorio'),
    fecha_entrada: z.string().min(1, 'La fecha de entrada es obligatoria'),
    fecha_salida: z.string().min(1, 'La fecha de salida es obligatoria'),
    cantidad_adultos: z.number().min(1, 'Debe haber al menos 1 adulto en la reserva'),
    cantidad_ninos: z.number().optional().default(0),
    hora_llegada: z.string().optional().nullable(),
  })
});

export const crearReservaMultipleSchema = z.object({
  body: z.object({
    id_cliente: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de cliente es obligatorio'),
    habitaciones: z.array(
      z.object({ id_habitacion: z.union([z.string(), z.number()]).refine(val => !!val) })
    ).min(1, 'Debe seleccionar al menos una habitación'),
    fecha_entrada: z.string().min(1, 'La fecha de entrada es obligatoria'),
    fecha_salida: z.string().min(1, 'La fecha de salida es obligatoria'),
    cantidad_adultos: z.number().min(1, 'Debe haber al menos 1 adulto en la reserva'),
    cantidad_ninos: z.number().optional().default(0),
    hora_llegada: z.string().optional().nullable(),
  })
});

export const actualizarReservaSchema = z.object({
  body: z.object({
    id_cliente: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de cliente es obligatorio'),
    id_habitacion: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de habitación es obligatorio'),
    fecha_entrada: z.string().min(1, 'La fecha de entrada es obligatoria'),
    fecha_salida: z.string().min(1, 'La fecha de salida es obligatoria'),
    cantidad_adultos: z.number().min(1, 'Debe haber al menos 1 adulto en la reserva').optional(),
    cantidad_ninos: z.number().optional(),
    hora_llegada: z.string().optional().nullable(),
  })
});

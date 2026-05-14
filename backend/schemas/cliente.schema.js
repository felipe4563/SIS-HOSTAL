import { z } from 'zod';

export const crearClienteSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'Nombre es obligatorio'),
    apellido: z.string().min(1, 'Apellido es obligatorio'),
    ci: z.string().optional().or(z.literal('')),
    correo: z.string().email('Correo inválido').optional().or(z.literal('')),
    celular: z.string().optional().or(z.literal('')),
    direccion: z.string().optional().or(z.literal('')),
    estado: z.union([z.number(), z.boolean()]).optional(),
  }).refine(data => data.ci || data.correo, {
    message: 'Debes registrar al menos CI o correo',
    path: ['ci']
  })
});

export const actualizarClienteSchema = z.object({
  body: z.object({
    nombre: z.string().optional(),
    apellido: z.string().optional(),
    ci: z.string().optional().or(z.literal('')),
    correo: z.string().email('Correo inválido').optional().or(z.literal('')),
    celular: z.string().optional().or(z.literal('')),
    direccion: z.string().optional().or(z.literal('')),
    estado: z.union([z.number(), z.boolean()]).optional(),
  })
});

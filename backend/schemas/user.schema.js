import { z } from 'zod';

export const crearUsuarioSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),
    ci: z.string().regex(/^\d{7,8}$/, 'El CI debe tener 7 u 8 dígitos numéricos'),
    correo: z.string().email('Debe ser un correo electrónico válido').endsWith('@hostalsuri.com', 'El correo debe ser @hostalsuri.com'),
    password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
    id_rol: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de rol es obligatorio'),
    estado: z.union([z.number(), z.boolean()]).optional(),
  })
});

export const actualizarUsuarioSchema = z.object({
  body: z.object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    apellido: z.string().min(1, 'El apellido es obligatorio'),
    ci: z.string().regex(/^\d{7,8}$/, 'El CI debe tener 7 u 8 dígitos numéricos'),
    correo: z.string().email('Debe ser un correo electrónico válido').endsWith('@hostalsuri.com', 'El correo debe ser @hostalsuri.com'),
    password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres').optional().or(z.literal('')),
    id_rol: z.union([z.string(), z.number()]).refine(val => !!val, 'El ID de rol es obligatorio'),
  })
});

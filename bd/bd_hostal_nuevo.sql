-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-05-2026 a las 18:58:58
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd_hostal`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `ci` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `nombre`, `apellido`, `ci`, `correo`, `celular`, `direccion`, `fecha_registro`, `estado`) VALUES
(1, 'Felipe', 'Mejia', NULL, 'felipemejia7490@gmail.com', NULL, NULL, '2026-04-26 14:19:50', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consulta_precio`
--

CREATE TABLE `consulta_precio` (
  `id_consulta` int(11) NOT NULL,
  `id_habitacion` int(11) NOT NULL,
  `fecha_consulta` datetime DEFAULT current_timestamp(),
  `fecha_entrada` date NOT NULL,
  `fecha_salida` date NOT NULL,
  `noches` int(11) NOT NULL,
  `precio_calculado` decimal(10,2) NOT NULL,
  `precio_base` decimal(10,2) NOT NULL,
  `ajustes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ajustes`)),
  `ocupacion_porcentaje` decimal(5,2) DEFAULT NULL,
  `convirtio_en_reserva` tinyint(1) DEFAULT 0,
  `id_reserva` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento_especial`
--

CREATE TABLE `evento_especial` (
  `id_evento` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `ajuste_precio` decimal(5,2) DEFAULT 0.00 COMMENT 'Porcentaje (ej: 40.00 = +40%)',
  `categoria` enum('feriado','festival','deportivo','congreso','cultural','otro') DEFAULT 'otro',
  `descripcion` text DEFAULT NULL,
  `fuente` varchar(50) DEFAULT NULL COMMENT 'feriados_api, manual, google_calendar',
  `fuente_id` varchar(100) DEFAULT NULL COMMENT 'ID único del evento',
  `asistencia_estimada` int(11) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT 'Cochabamba, Bolivia',
  `impacto_calculado` enum('bajo','medio','alto','muy_alto') DEFAULT 'medio',
  `url_fuente` text DEFAULT NULL,
  `fecha_sincronizacion` datetime DEFAULT NULL,
  `verificado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1 COMMENT '1=futuro, 0=pasado/historial',
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `habitacion`
--

CREATE TABLE `habitacion` (
  `id_habitacion` int(11) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `id_tipo` int(11) NOT NULL,
  `precio_total` decimal(10,2) DEFAULT NULL,
  `piso` int(11) DEFAULT NULL,
  `estado` enum('disponible','ocupada','limpieza') DEFAULT 'disponible',
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `habitacion_imagen`
--

CREATE TABLE `habitacion_imagen` (
  `id_imagen` int(11) NOT NULL,
  `id_habitacion` int(11) NOT NULL,
  `ruta` varchar(500) DEFAULT NULL,
  `tipo_imagen` enum('normal','360') DEFAULT 'normal',
  `titulo` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `es_portada` tinyint(1) DEFAULT 0,
  `fecha_subida` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `limpieza`
--

CREATE TABLE `limpieza` (
  `id_limpieza` int(11) NOT NULL,
  `id_habitacion` int(11) NOT NULL,
  `id_reserva` int(11) DEFAULT NULL,
  `estado` enum('pendiente','en_proceso','completada') NOT NULL DEFAULT 'pendiente',
  `tipo` enum('checkout','mantenimiento') NOT NULL DEFAULT 'checkout',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `log_sincronizacion`
--

CREATE TABLE `log_sincronizacion` (
  `id_log` int(11) NOT NULL,
  `fuente` varchar(50) DEFAULT NULL,
  `eventos_encontrados` int(11) DEFAULT NULL,
  `eventos_nuevos` int(11) DEFAULT NULL,
  `eventos_actualizados` int(11) DEFAULT NULL,
  `errores` text DEFAULT NULL,
  `fecha_sincronizacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ocupacion`
--

CREATE TABLE `ocupacion` (
  `id_ocupacion` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `fecha_salida` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` int(11) NOT NULL,
  `id_reserva` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` datetime DEFAULT current_timestamp(),
  `metodo_pago` enum('efectivo','tarjeta','transferencia') DEFAULT 'efectivo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id_permiso` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id_permiso`, `nombre`, `descripcion`) VALUES
(1, 'reserva.crear', 'Permite crear reservas'),
(2, 'reserva.ver', 'Permite ver reservas'),
(3, 'reserva.editar', 'Permite editar reservas'),
(4, 'reserva.eliminar', 'Permite eliminar reservas'),
(5, 'habitacion.crear', 'Permite agregar habitaciones'),
(6, 'habitacion.ver', 'Permite ver habitaciones'),
(7, 'habitacion.editar', 'Permite editar habitaciones'),
(8, 'habitacion.eliminar', 'Permite eliminar habitaciones'),
(9, 'usuario.crear', 'Permite crear usuarios'),
(10, 'usuario.ver', 'Permite ver usuarios'),
(11, 'usuario.editar', 'Permite editar usuarios'),
(12, 'usuario.eliminar', 'Permite eliminar usuarios'),
(13, 'rol.crear', 'Crear roles'),
(14, 'rol.ver', 'Ver roles'),
(15, 'rol.editar', 'Editar roles'),
(16, 'rol.eliminar', 'Eliminar roles'),
(17, 'cliente.crear', 'Crear clientes'),
(18, 'cliente.ver', 'Ver clientes'),
(19, 'cliente.editar', 'Editar clientes'),
(20, 'cliente.eliminar', 'Eliminar clientes'),
(21, 'reporte.ver', 'Ver reportes'),
(22, 'reporte.generar', 'Generar reportes'),
(23, 'dashboard.ver', 'Ver dashboard'),
(24, 'tipo.crear', 'Crear tipos de habitación'),
(25, 'tipo.ver', 'Ver tipos de habitación'),
(26, 'tipo.editar', 'Editar tipos de habitación'),
(27, 'tipo.eliminar', 'Eliminar tipos de habitación'),
(28, 'limpieza.ver', 'Ver tareas de limpieza'),
(29, 'limpieza.crear', 'Crear tareas de limpieza manualmente'),
(30, 'limpieza.editar', 'Iniciar y completar tareas de limpieza');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `id_reserva` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_habitacion` int(11) NOT NULL,
  `fecha_entrada` datetime NOT NULL,
  `fecha_salida` datetime NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `cantidad_adultos` int(11) NOT NULL DEFAULT 1,
  `cantidad_ninos` int(11) NOT NULL DEFAULT 0,
  `hora_llegada` time DEFAULT NULL,
  `precio_base` decimal(10,2) DEFAULT NULL,
  `estado` enum('pendiente','confirmada','cancelada','finalizada') DEFAULT 'pendiente',
  `ajuste_temporada` decimal(5,2) DEFAULT 0.00,
  `ajuste_ocupacion` decimal(5,2) DEFAULT 0.00,
  `ajuste_anticipacion` decimal(5,2) DEFAULT 0.00,
  `ajuste_duracion` decimal(5,2) DEFAULT 0.00,
  `ajuste_dia_semana` decimal(5,2) DEFAULT 0.00,
  `ajuste_eventos` decimal(5,2) DEFAULT 0.00,
  `precio_sugerido` decimal(10,2) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'Administrador', 'Rol con todos los permisos del sistema'),
(2, 'Limpieza', 'encargado de la limpieza'),
(3, 'Recepcionista ', 'Encargado de la recepcion de huepedes'),
(4, 'Huesped', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permiso`
--

CREATE TABLE `rol_permiso` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_permiso`
--

INSERT INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(2, 6),
(2, 9),
(2, 10),
(2, 11),
(2, 14),
(2, 17),
(2, 18),
(2, 19),
(2, 20),
(3, 1),
(3, 2),
(3, 3),
(3, 5),
(3, 6),
(3, 7),
(3, 8),
(3, 9),
(3, 10),
(3, 18),
(3, 23),
(3, 25),
(4, 1),
(4, 2),
(4, 3),
(4, 4),
(4, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `temporada`
--

CREATE TABLE `temporada` (
  `id_temporada` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `mes_inicio` int(11) NOT NULL COMMENT '1-12',
  `mes_fin` int(11) NOT NULL COMMENT '1-12',
  `ajuste_precio` decimal(5,2) DEFAULT 0.00,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo`
--

CREATE TABLE `tipo` (
  `id_tipo` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `precio_base` decimal(10,2) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `ci` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int(11) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `estado` tinyint(1) DEFAULT 1,
  `google_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `apellido`, `ci`, `correo`, `password`, `id_rol`, `fecha_registro`, `estado`, `google_id`) VALUES
(1, 'Ruben', 'Felipe', '9391668', 'felipe@hostal.com', '$2b$10$70z/iofFTDMvly2C/C9JXeWJt9LAhn4M8cs9WT7D4cXXE2Yz68pbm', 1, '2025-11-16 14:16:01', 1, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `ci` (`ci`);

--
-- Indices de la tabla `consulta_precio`
--
ALTER TABLE `consulta_precio`
  ADD PRIMARY KEY (`id_consulta`),
  ADD KEY `id_reserva` (`id_reserva`),
  ADD KEY `idx_fecha_entrada` (`fecha_entrada`),
  ADD KEY `idx_habitacion` (`id_habitacion`);

--
-- Indices de la tabla `evento_especial`
--
ALTER TABLE `evento_especial`
  ADD PRIMARY KEY (`id_evento`),
  ADD UNIQUE KEY `idx_fuente_id` (`fuente`,`fuente_id`),
  ADD KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_fuente` (`fuente`);

--
-- Indices de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  ADD PRIMARY KEY (`id_habitacion`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `id_tipo` (`id_tipo`);

--
-- Indices de la tabla `habitacion_imagen`
--
ALTER TABLE `habitacion_imagen`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `id_habitacion` (`id_habitacion`);

--
-- Indices de la tabla `limpieza`
--
ALTER TABLE `limpieza`
  ADD PRIMARY KEY (`id_limpieza`),
  ADD KEY `fk_limpieza_habitacion` (`id_habitacion`),
  ADD KEY `fk_limpieza_reserva` (`id_reserva`);

--
-- Indices de la tabla `log_sincronizacion`
--
ALTER TABLE `log_sincronizacion`
  ADD PRIMARY KEY (`id_log`);

--
-- Indices de la tabla `ocupacion`
--
ALTER TABLE `ocupacion`
  ADD PRIMARY KEY (`id_ocupacion`),
  ADD KEY `id_reserva` (`id_reserva`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD KEY `id_reserva` (`id_reserva`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id_permiso`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_habitacion` (`id_habitacion`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD PRIMARY KEY (`id_rol`,`id_permiso`),
  ADD KEY `id_permiso` (`id_permiso`);

--
-- Indices de la tabla `temporada`
--
ALTER TABLE `temporada`
  ADD PRIMARY KEY (`id_temporada`);

--
-- Indices de la tabla `tipo`
--
ALTER TABLE `tipo`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `ci` (`ci`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `consulta_precio`
--
ALTER TABLE `consulta_precio`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `evento_especial`
--
ALTER TABLE `evento_especial`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  MODIFY `id_habitacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `habitacion_imagen`
--
ALTER TABLE `habitacion_imagen`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `limpieza`
--
ALTER TABLE `limpieza`
  MODIFY `id_limpieza` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `log_sincronizacion`
--
ALTER TABLE `log_sincronizacion`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ocupacion`
--
ALTER TABLE `ocupacion`
  MODIFY `id_ocupacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `temporada`
--
ALTER TABLE `temporada`
  MODIFY `id_temporada` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tipo`
--
ALTER TABLE `tipo`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `consulta_precio`
--
ALTER TABLE `consulta_precio`
  ADD CONSTRAINT `consulta_precio_ibfk_1` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`),
  ADD CONSTRAINT `consulta_precio_ibfk_2` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE SET NULL;

--
-- Filtros para la tabla `habitacion`
--
ALTER TABLE `habitacion`
  ADD CONSTRAINT `habitacion_ibfk_1` FOREIGN KEY (`id_tipo`) REFERENCES `tipo` (`id_tipo`);

--
-- Filtros para la tabla `habitacion_imagen`
--
ALTER TABLE `habitacion_imagen`
  ADD CONSTRAINT `habitacion_imagen_ibfk_1` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`) ON DELETE CASCADE;

--
-- Filtros para la tabla `limpieza`
--
ALTER TABLE `limpieza`
  ADD CONSTRAINT `fk_limpieza_habitacion` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`),
  ADD CONSTRAINT `fk_limpieza_reserva` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`) ON DELETE SET NULL;

--
-- Filtros para la tabla `ocupacion`
--
ALTER TABLE `ocupacion`
  ADD CONSTRAINT `ocupacion_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_reserva`) REFERENCES `reserva` (`id_reserva`);

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  ADD CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`id_habitacion`) REFERENCES `habitacion` (`id_habitacion`);

--
-- Filtros para la tabla `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD CONSTRAINT `rol_permiso_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`),
  ADD CONSTRAINT `rol_permiso_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

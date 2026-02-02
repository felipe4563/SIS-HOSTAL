-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-02-2026 a las 13:08:56
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
(1, 'Felipe', 'Mejia', NULL, 'ruben16felipe@gmail.com', NULL, NULL, '2026-01-29 00:19:14', 1),
(2, 'Felipe', 'Mejia', '9391668', 'felipemejia7490@gmail.com', '74819122', 'Av. Heroinas ', '2026-01-29 00:24:27', 1),
(3, 'RUBEN', 'FELIPE', '9857114', 'ruben16felipe2003@gmail.com', '74819166', 'Av. jitos', '2026-01-29 01:14:41', 1);

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

--
-- Volcado de datos para la tabla `consulta_precio`
--

INSERT INTO `consulta_precio` (`id_consulta`, `id_habitacion`, `fecha_consulta`, `fecha_entrada`, `fecha_salida`, `noches`, `precio_calculado`, `precio_base`, `ajustes`, `ocupacion_porcentaje`, `convirtio_en_reserva`, `id_reserva`) VALUES
(1, 15, '2026-02-02 02:50:59', '2026-03-15', '2026-03-17', 2, 1800.00, 900.00, '{\"temporada\":-5,\"dia_semana\":20,\"anticipacion\":-5,\"ocupacion\":-10,\"duracion\":0,\"eventos\":0}', 0.00, 0, NULL),
(2, 15, '2026-02-02 02:52:42', '2026-12-24', '2026-12-26', 2, 2790.00, 900.00, '{\"temporada\":30,\"dia_semana\":0,\"anticipacion\":-10,\"ocupacion\":-10,\"duracion\":0,\"eventos\":45}', 0.00, 0, NULL),
(3, 17, '2026-02-02 03:01:01', '2026-02-07', '2026-02-08', 1, 135.00, 100.00, '{\"temporada\":15,\"dia_semana\":20,\"anticipacion\":10,\"ocupacion\":-10,\"duracion\":0,\"eventos\":0}', 0.00, 0, NULL);

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

--
-- Volcado de datos para la tabla `evento_especial`
--

INSERT INTO `evento_especial` (`id_evento`, `nombre`, `fecha_inicio`, `fecha_fin`, `ajuste_precio`, `categoria`, `descripcion`, `fuente`, `fuente_id`, `asistencia_estimada`, `ubicacion`, `impacto_calculado`, `url_fuente`, `fecha_sincronizacion`, `verificado`, `activo`, `estado`, `fecha_creacion`) VALUES
(1, 'Fiesta de la Virgen de Candelaria 2026', '2026-02-02', '2026-02-02', 30.00, 'feriado', 'Fiesta de la Virgen de Candelaria - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-02-02', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(2, 'Feriado por Carnaval 2026', '2026-02-16', '2026-02-16', 35.00, 'feriado', 'Feriado por Carnaval - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-02-16', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(3, 'Feriado por Carnaval 2026', '2026-02-17', '2026-02-17', 35.00, 'feriado', 'Feriado por Carnaval - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-02-17', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(4, 'Viernes Santo 2026', '2026-04-03', '2026-04-03', 30.00, 'feriado', 'Viernes Santo - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-04-03', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(5, 'Dia del trabajo 2026', '2026-05-01', '2026-05-01', 30.00, 'feriado', 'Dia del trabajo - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-05-01', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(6, 'Corpus Christi 2026', '2026-06-04', '2026-06-04', 30.00, 'feriado', 'Corpus Christi - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-06-04', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(7, 'Año Nuevo Andino 2026', '2026-06-21', '2026-06-21', 45.00, 'feriado', 'Año Nuevo Andino - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-06-21', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(8, 'Día de la Revolución Agraria 2026', '2026-08-02', '2026-08-02', 30.00, 'feriado', 'Día de la Revolución Agraria - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-08-02', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(9, 'Dia de la Patria 2026', '2026-08-06', '2026-08-06', 30.00, 'feriado', 'Dia de la Patria - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-08-06', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(10, 'Todos Santos 2026', '2026-11-02', '2026-11-02', 30.00, 'feriado', 'Todos Santos - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-11-02', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(11, 'Navidad 2026', '2026-12-25', '2026-12-25', 45.00, 'feriado', 'Navidad - Feriado nacional de 2026', 'feriados_api', 'feriado_2026-12-25', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(12, 'Año Nuevo 2027', '2027-01-01', '2027-01-01', 45.00, 'feriado', 'Año Nuevo - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-01-01', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(13, 'Fiesta de la Virgen de Candelaria 2027', '2027-02-02', '2027-02-02', 30.00, 'feriado', 'Fiesta de la Virgen de Candelaria - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-02-02', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(14, 'Feriado por Carnaval 2027', '2027-02-08', '2027-02-08', 35.00, 'feriado', 'Feriado por Carnaval - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-02-08', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(15, 'Feriado por Carnaval 2027', '2027-02-09', '2027-02-09', 35.00, 'feriado', 'Feriado por Carnaval - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-02-09', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(16, 'Viernes Santo 2027', '2027-03-26', '2027-03-26', 30.00, 'feriado', 'Viernes Santo - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-03-26', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(17, 'Dia del trabajo 2027', '2027-05-01', '2027-05-01', 30.00, 'feriado', 'Dia del trabajo - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-05-01', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(18, 'Corpus Christi 2027', '2027-05-27', '2027-05-27', 30.00, 'feriado', 'Corpus Christi - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-05-27', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(19, 'Año Nuevo Andino 2027', '2027-06-21', '2027-06-21', 45.00, 'feriado', 'Año Nuevo Andino - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-06-21', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(20, 'Día de la Revolución Agraria 2027', '2027-08-02', '2027-08-02', 30.00, 'feriado', 'Día de la Revolución Agraria - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-08-02', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(21, 'Dia de la Patria 2027', '2027-08-06', '2027-08-06', 30.00, 'feriado', 'Dia de la Patria - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-08-06', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(22, 'Todos Santos 2027', '2027-11-02', '2027-11-02', 30.00, 'feriado', 'Todos Santos - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-11-02', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07'),
(23, 'Navidad 2027', '2027-12-25', '2027-12-25', 45.00, 'feriado', 'Navidad - Feriado nacional de 2027', 'feriados_api', 'feriado_2027-12-25', NULL, 'Bolivia (Nacional)', 'alto', NULL, '2026-02-02 03:14:07', 1, 1, 1, '2026-02-02 03:14:07');

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

--
-- Volcado de datos para la tabla `habitacion`
--

INSERT INTO `habitacion` (`id_habitacion`, `numero`, `id_tipo`, `precio_total`, `piso`, `estado`, `descripcion`) VALUES
(14, '2002', 1, 305.00, 2, 'disponible', 'dsjd'),
(15, '2003', 1, 900.00, 2, 'disponible', 'mkih'),
(16, '2005', 2, 3000.00, 2, 'disponible', 'dsds'),
(17, '2009', 1, 100.00, 3, 'disponible', 'ddfsdfsf');

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

--
-- Volcado de datos para la tabla `habitacion_imagen`
--

INSERT INTO `habitacion_imagen` (`id_imagen`, `id_habitacion`, `ruta`, `tipo_imagen`, `titulo`, `descripcion`, `orden`, `es_portada`, `fecha_subida`) VALUES
(17, 14, '1764667503916-54220089.jpg', 'normal', NULL, NULL, 0, 0, '2025-12-02 02:25:03'),
(18, 14, '1764668466813-179191344.jpg', 'normal', NULL, NULL, 0, 0, '2025-12-02 02:41:06'),
(19, 14, '1764668466813-285801486.jpg', 'normal', NULL, NULL, 0, 0, '2025-12-02 02:41:06'),
(20, 15, 'habitacion-1768919962893-192346740.jpg', 'normal', NULL, NULL, 1, 0, '2026-01-20 10:39:22'),
(21, 14, '360-1769038372014-13120791.jpg', '360', 'vista frontal', NULL, 1, 0, '2026-01-21 19:32:52'),
(22, 15, '360-1769038544948-577407138.jpg', '360', NULL, NULL, 1, 0, '2026-01-21 19:35:44'),
(23, 16, 'habitacion-1769039016280-751819648.jpg', 'normal', NULL, NULL, 1, 0, '2026-01-21 19:43:36'),
(24, 16, '360-1769039028898-807440592.jpg', '360', NULL, NULL, 1, 0, '2026-01-21 19:43:48'),
(25, 16, '360-1769652226032-629308961.jpg', '360', 'vista baño', 'dfdfdf', 2, 0, '2026-01-28 22:03:46'),
(26, 17, '360-1770015586880-973401471.jpg', '360', NULL, NULL, 1, 0, '2026-02-02 02:59:46'),
(27, 17, 'habitacion-1770015598077-843021901.jpeg', 'normal', NULL, NULL, 1, 0, '2026-02-02 02:59:58');

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

--
-- Volcado de datos para la tabla `log_sincronizacion`
--

INSERT INTO `log_sincronizacion` (`id_log`, `fuente`, `eventos_encontrados`, `eventos_nuevos`, `eventos_actualizados`, `errores`, `fecha_sincronizacion`) VALUES
(1, 'sincronizacion_semanal', 23, 23, 0, NULL, '2026-02-02 03:11:40'),
(2, 'sincronizacion_semanal', 23, 23, 0, NULL, '2026-02-02 03:14:07');

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
(27, 'tipo.eliminar', 'Eliminar tipos de habitación');

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

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`id_reserva`, `id_cliente`, `id_habitacion`, `fecha_entrada`, `fecha_salida`, `total`, `precio_base`, `estado`, `ajuste_temporada`, `ajuste_ocupacion`, `ajuste_anticipacion`, `ajuste_duracion`, `ajuste_dia_semana`, `ajuste_eventos`, `precio_sugerido`, `fecha_creacion`) VALUES
(1, 1, 16, '2026-01-29 00:00:00', '2026-01-31 00:00:00', 6000.00, NULL, 'pendiente', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-02-02 02:34:13'),
(2, 1, 15, '2026-01-30 00:00:00', '2026-01-31 00:00:00', 900.00, NULL, 'pendiente', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-02-02 02:34:13'),
(3, 2, 15, '2026-02-05 00:00:00', '2026-02-06 00:00:00', 900.00, NULL, 'pendiente', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-02-02 02:34:13'),
(4, 1, 15, '2026-02-26 00:00:00', '2026-02-28 00:00:00', 1800.00, NULL, 'confirmada', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-02-02 02:34:13'),
(5, 2, 15, '2026-02-07 00:00:00', '2026-02-20 00:00:00', 11700.00, NULL, 'cancelada', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-02-02 02:34:13'),
(6, 2, 15, '2026-02-23 00:00:00', '2026-02-25 00:00:00', 1800.00, NULL, 'pendiente', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-02-02 02:34:13');

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

--
-- Volcado de datos para la tabla `temporada`
--

INSERT INTO `temporada` (`id_temporada`, `nombre`, `mes_inicio`, `mes_fin`, `ajuste_precio`, `descripcion`, `activo`) VALUES
(1, 'Alta - Fin de Año', 12, 12, 30.00, 'Diciembre - Vacaciones fin de año', 1),
(2, 'Alta - Invierno', 7, 8, 30.00, 'Julio-Agosto - Vacaciones escolares', 1),
(3, 'Media - Verano', 1, 2, 15.00, 'Enero-Febrero', 1),
(4, 'Media - Primavera', 9, 11, 10.00, 'Septiembre-Noviembre', 1),
(5, 'Baja', 3, 6, -5.00, 'Marzo-Junio - Incentivo reservas', 1);

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

--
-- Volcado de datos para la tabla `tipo`
--

INSERT INTO `tipo` (`id_tipo`, `nombre`, `capacidad`, `precio_base`, `descripcion`) VALUES
(1, 'Matrimonial', 2, 120.00, 'cama de dos plazas 2'),
(2, 'Individual', 9, 900.00, 'Individual ');

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
(1, 'Ruben', 'Felipe', '9391668', 'felipe@hostal.com', '$2b$10$70z/iofFTDMvly2C/C9JXeWJt9LAhn4M8cs9WT7D4cXXE2Yz68pbm', 1, '2025-11-16 14:16:01', 1, NULL),
(2, 'Judith', 'Herrera', '509080', 'judith@hostal.com', '$2b$10$6YOLF9weCwHS7DIsVidojuiUAbxcgSs4e8Ds/DjovxYbImH90zI/i', 2, '2025-11-16 15:12:42', 1, NULL),
(3, 'Luis', 'Zambrana', '9867889', 'luis@hostal.com', '$2b$10$UYmlGuyv66hHVFlfHHjc/.OqRyFX5V3Z/C6D8lOUSYN6nxJ.vE1x6', 3, '2025-11-18 02:06:48', 1, NULL),
(4, 'Lucia', 'Derosa', '9838292', 'lucia@hostal.com', '$2b$10$DW5RB3jGwjNgYrZZulAG6.S2uIRf.swTvMDdqzmyGoIwFCbWfZZei', 1, '2025-11-18 02:32:18', 1, NULL),
(5, 'Felipe', 'Mejia', NULL, 'ruben16felipe@gmail.com', 'GOOGLE_AUTH', 4, '2026-01-25 18:36:16', 1, NULL),
(6, 'Felipe', 'Mejia', NULL, 'felipemejia7490@gmail.com', 'GOOGLE_AUTH', 4, '2026-01-26 07:25:26', 1, NULL),
(7, 'RUBEN', 'FELIPE', NULL, 'ruben16felipe2003@gmail.com', 'GOOGLE_AUTH', 4, '2026-01-26 07:41:17', 1, NULL);

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
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `consulta_precio`
--
ALTER TABLE `consulta_precio`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `evento_especial`
--
ALTER TABLE `evento_especial`
  MODIFY `id_evento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `habitacion`
--
ALTER TABLE `habitacion`
  MODIFY `id_habitacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `habitacion_imagen`
--
ALTER TABLE `habitacion_imagen`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `log_sincronizacion`
--
ALTER TABLE `log_sincronizacion`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `temporada`
--
ALTER TABLE `temporada`
  MODIFY `id_temporada` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipo`
--
ALTER TABLE `tipo`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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

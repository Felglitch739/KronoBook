-- =====================================================================
-- KRONOBOOK - SCRIPT DE LIMPIEZA DE DATOS DE PRUEBA / DESARROLLO
-- =====================================================================
-- Este script limpia los registros de prueba creados durante la fase 
-- de desarrollo para dejar la base de datos lista para producción.
-- 
-- Efecto:
-- 1. Vacía por completo la tabla de `citas` (lo cual reinicia de forma 
--    inmediata todas las gráficas de ingresos y el listado de transacciones
--    a $0 MXN en el Dashboard).
-- 2. Mantiene intactos los registros de la tabla `barberias` (negocios) 
--    y sus correspondientes catálogos de `servicios` base.
-- =====================================================================

-- Eliminar todas las citas de la base de datos
DELETE FROM citas;

-- =====================================================================
-- Instrucciones de ejecución en Supabase:
-- 1. Ve a tu panel de Supabase (https://supabase.com).
-- 2. Selecciona tu proyecto de KronoBook.
-- 3. En la barra lateral izquierda, haz clic en "SQL Editor".
-- 4. Haz clic en "New Query".
-- 5. Pega esta consulta SQL y presiona el botón "Run" (Ejecutar).
-- 6. Recarga la página del Dashboard y verás las finanzas limpias.
-- =====================================================================

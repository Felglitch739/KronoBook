# KRONOBOOK - DOCUMENTO DE ESPECIFICACIÓN TÉCNICA Y ARQUITECTURA
## Propósito del Archivo
Este archivo sirve como el "Contexto Maestro" o "Blueprint" para la Inteligencia Artificial (IA) en el entorno de desarrollo. Define los objetivos, la arquitectura de base de datos, el enrutamiento dinámico y los pasos de refactorización para transformar el MVP actual de un solo negocio a una plataforma SaaS Multi-Tenant (Multi-Negocio) llamada **KronoBook**.

---

## 1. RESUMEN DEL PROYECTO
* **Nombre de la Plataforma:** KronoBook
* **Enfoque de Mercado:** SaaS de agendamiento y finanzas para negocios de servicios independientes (Barberías, Salones de Uñas, Clínicas de Pestañas, Spas, Estéticas).
* **Filosofía de Diseño:** Mobile-First (90% del uso en smartphones/tablets), Estética Oscura Premium (Paleta Industrial/Cozy Everforest), Microinteracciones fluidas y transiciones suaves.
* **Stack Tecnológico:** React (TypeScript), Vite, Tailwind CSS, Supabase (PostgreSQL), `react-router-dom`.

---

## 2. ARQUITECTURA MULTI-TENANT (SaaS)
La plataforma operará bajo un modelo de **Base de Datos Compartida con Esquema Único**. Una sola aplicación frontend de React cambiará dinámicamente su contenido y comportamiento leyendo el identificador único (*slug*) desde la URL.

### Flujo de Navegación del Cliente:
* `kronobook.app/:slug` -> Carga la Landing Page personalizada del negocio que coincide con el `:slug`.
* `kronobook.app/:slug/reservar` -> Carga el flujo de agendamiento en pasos optimizado para celulares.

### Flujo de Administración (Dueño del Negocio):
* `kronobook.app/admin` -> Panel de acceso universal (Login/Registro) gestionado por Supabase Auth.
* `kronobook.app/admin/dashboard` -> Panel de control dinámico. Filtra automáticamente las citas y las estadísticas financieras según el `negocio_id` / `barberia_id` del usuario autenticado.

---

## 3. ESQUEMA DE BASE DE DATOS (SUPABASE / POSTGRESQL)
Las tablas actuales conservan la compatibilidad física en Postgres para agilizar el MVP, pero lógicamente actúan de forma abstracta para albergar cualquier nicho de servicios.

### Tabla: `barberias` (Tabla Maestra de Tenants / Negocios)
* `id` (uuid, PRIMARY KEY, default: gen_random_uuid())
* `nombre` (text) - *Ej: "Barbería Chaga", "Uñas de Bere"*
* `slug` (text, UNIQUE) - *Ej: "barberia-chaga", "unas-bere"*
* `direccion` (text)
* `horario` (text)
* `created_at` (timestamp with time zone)

### Tabla: `servicios` (Catálogo de Servicios por Tenant)
* `id` (uuid, PRIMARY KEY, default: gen_random_uuid())
* `barberia_id` (uuid, FOREIGN KEY references `barberias.id` ON DELETE CASCADE)
* `nombre` (text) - *Ej: "Corte Clásico", "Aplicación de Gelish", "Extensión de Pestañas"*
* `precio` (numeric)
* `duracion_minutos` (integer)
* `descripcion` (text)
* `created_at` (timestamp with time zone)

### Tabla: `citas` (Control de Reservas e Ingresos Financieros)
* `id` (uuid, PRIMARY KEY, default: gen_random_uuid())
* `barberia_id` (uuid, FOREIGN KEY references `barberias.id` ON DELETE CASCADE)
* `servicio_id` (uuid, FOREIGN KEY references `servicios.id` ON DELETE CASCADE)
* `cliente_nombre` (text)
* `cliente_telefono` (text)
* `cliente_email` (text, nullable)
* `fecha` (date) - *Formato estricto YYYY-MM-DD*
* `hora` (time) - *Formato estricto HH:MM:SS*
* `estado` (text, default: 'pendiente') - *Valores admitidos: 'pendiente', 'confirmada', 'completada', 'cancelada'*
* `notas` (text, nullable)
* `created_at` (timestamp with time zone)

---

## 4. INSTRUCCIONES DE REFACTORIZACIÓN PARA LA IA (ROADMAP DE EJECUCIÓN)

### Paso 1: Instalación e Inicialización del Enrutador
1. Instalar la librería de rutas en la terminal: `pnpm add react-router-dom`.
2. Configurar en `src/main.tsx` o `src/App.tsx` el `BrowserRouter`.

### Paso 2: Cambiar Hook `src/hooks/useBookings.ts` a Ruteo Dinámico
1. Eliminar la constante `HARDCODED_BARBERIA_ID`.
2. Utilizar el hook `useParams` de `react-router-dom` para capturar el `:slug` directamente desde la barra de direcciones del navegador.
3. Modificar el `useEffect` inicial para que realice una consulta asíncrona a Supabase:
   * Buscar en la tabla `barberias` la fila donde `slug === urlSlug`.
   * Si no existe el negocio, gestionar un estado de error o redirección a "404 Negocio No Encontrado".
   * Si existe, usar su `id` real para descargar de manera reactiva sus correspondientes `servicios` y `citas`.

### Paso 3: Optimización Mobile-First y Rebranding Estructural
1. Reemplazar todas las menciones explícitas de "Barbendar" en textos, títulos de componentes, footers y código por el nuevo nombre comercial global: **KronoBook**.
2. Garantizar que el componente `Layout.tsx` contenga contenedores fluidos sin anchos fijos en píxeles (`w-full max-w-full overflow-x-hidden`).
3. Para la vista móvil (`md:hidden`), implementar un **Bottom Navigation Bar** fijo en la parte inferior de la pantalla con accesos por pulgar a las vistas clave. El Navbar de escritorio se mantiene superior únicamente en pantallas medianas o grandes.
4. Reparar el desfase de horas y fechas asegurando que las comparaciones en los filtros del calendario se realicen puramente a nivel de cadenas de texto (strings) para mitigar bugs de husos horarios locales de JavaScript.

### Paso 4: Asegurar la Carga de Datos en la UI
1. Implementar bloques protectores con encadenamiento opcional (`?.`) en componentes como `LandingPage.tsx` y `Dashboard.tsx` para evitar excepciones de tipo `TypeError: Cannot read properties of null` durante los milisegundos de latencia que tardan las promesas de Supabase en resolverse.

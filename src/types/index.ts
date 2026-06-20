export interface Barberia {
  id: string;
  nombre: string;
  slug: string;
  direccion: string;
  horario: string;
  /** Color primario de marca (HEX). Ej: "#1d4ed8". Fallback: amber */
  colorPrimario?: string;
  /** Color secundario / acento de marca (HEX). Ej: "#b91c1c". */
  colorSecundario?: string;
  /** Tema visual de la landing page pública */
  tema?: 'dark' | 'light' | 'elegant';
}

export interface Servicio {
  id: string;
  barberiaId: string;
  nombre: string;
  precio: number;
  duracionMinutos: number;
  descripcion?: string;
}

export interface Cita {
  id: string;
  barberiaId: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  servicioId: string;
  fecha: string; // AAAA-MM-DD
  hora: string; // HH:MM
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
  createdAt?: string;
  propina?: number;
  direccionServicio?: string;
}

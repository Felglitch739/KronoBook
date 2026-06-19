import { type Barberia, type Servicio, type Cita } from '../types';

export const mockBarberia: Barberia = {
  id: "barberia-1",
  nombre: "Barbería Chaga",
  slug: "barberia-chaga",
  direccion: "Calle Principal #123, Zona Centro",
  horario: "Lunes a Sábado: 10:00 AM - 8:00 PM",
  tema: "dark"
};

export const mockServicios: Servicio[] = [
  {
    id: "s1",
    barberiaId: "barberia-1",
    nombre: "Corte de Cabello Clásico",
    precio: 150,
    duracionMinutos: 30,
    descripcion: "Corte a tijera o máquina, incluye lavado y peinado con pomada."
  },
  {
    id: "s2",
    barberiaId: "barberia-1",
    nombre: "Arreglo de Barba Pro",
    precio: 100,
    duracionMinutos: 20,
    descripcion: "Delineado con navaja libre, toalla caliente y aceites hidratantes."
  },
  {
    id: "s3",
    barberiaId: "barberia-1",
    nombre: "Combo Imperial",
    precio: 220,
    duracionMinutos: 50,
    descripcion: "Corte de cabello premium + servicio de barba completo."
  }
];

export const mockCitas: Cita[] = [
  {
    id: "c1",
    barberiaId: "barberia-1",
    clienteNombre: "Carlos Gómez",
    clienteTelefono: "8681234567",
    servicioId: "s1",
    fecha: "2026-06-05",
    hora: "11:00",
    estado: "pendiente"
  },
  {
    id: "c2",
    barberiaId: "barberia-1",
    clienteNombre: "Luis Martínez",
    clienteTelefono: "8687654321",
    servicioId: "s3",
    fecha: "2026-06-05",
    hora: "13:30",
    estado: "pendiente"
  }
];

// Datos de ejemplo del catálogo. Inventados: sirven para ver los módulos con contenido parecido al real,
// incluidos los casos incómodos (un nombre larguísimo, un dato que falta, un importe de siete cifras).

const DIA = 86_400_000;
const hace = (dias, horas = 0) => new Date(Date.now() - dias * DIA - horas * 3_600_000).toISOString();

export const CLIENTES = [
  { id: 'c01', nombre: 'Marta Ruiz Gil', empresa: 'Talleres Ruiz', estado: 'activo', facturado: 12840.5, ultima: hace(0, 3), email: 'marta@talleresruiz.es' },
  { id: 'c02', nombre: 'Álvaro Santos', empresa: 'Clínica Dental Santos', estado: 'activo', facturado: 8420, ultima: hace(1), email: 'alvaro@dentalsantos.es' },
  { id: 'c03', nombre: 'Lucía Ferrer Puig', empresa: 'Ferrer Arquitectura', estado: 'pendiente', facturado: 3150.75, ultima: hace(3), email: 'lucia@ferrerarq.com' },
  { id: 'c04', nombre: 'Íñigo Echeverría', empresa: 'Sidrería Echeverría', estado: 'activo', facturado: 21600, ultima: hace(5), email: 'inigo@echeverria.eus' },
  { id: 'c05', nombre: 'María de los Ángeles Fernández-Villaverde y Montenegro', empresa: 'Asesoría Fiscal y Laboral Fernández-Villaverde, Montenegro y Asociados', estado: 'activo', facturado: 1284500.9, ultima: hace(8), email: 'mangeles@fvm-asesores.es' },
  { id: 'c06', nombre: 'Pau Soler', empresa: 'Soler Reformas', estado: 'baja', facturado: 940, ultima: hace(41), email: null },
  { id: 'c07', nombre: 'Noelia Castro', empresa: 'Autoescuela Castro', estado: 'activo', facturado: 5630.2, ultima: hace(2), email: 'noelia@autoescuelacastro.es' },
  { id: 'c08', nombre: 'Óscar Benítez', empresa: 'Benítez Fisioterapia', estado: 'pendiente', facturado: 0, ultima: null, email: 'oscar@benitezfisio.es' },
  { id: 'c09', nombre: 'Carmen Vidal', empresa: 'Floristería Vidal', estado: 'activo', facturado: 2475, ultima: hace(12), email: 'carmen@floresvidal.es' },
  { id: 'c10', nombre: 'Javier Ortega', empresa: 'Ortega Transportes', estado: 'activo', facturado: 34210.4, ultima: hace(6), email: 'javier@ortegatrans.es' },
  { id: 'c11', nombre: 'Elena Marín', empresa: 'Academia Marín', estado: 'baja', facturado: 1890, ultima: hace(97), email: 'elena@academiamarin.es' },
  { id: 'c12', nombre: 'Raúl Giménez', empresa: 'Giménez Climatización', estado: 'activo', facturado: 7320, ultima: hace(4), email: 'raul@gimenezclima.es' },
];

export const ESTADOS = {
  activo: { texto: 'Activo', tono: 'bien' },
  pendiente: { texto: 'Pendiente', tono: 'atencion' },
  baja: { texto: 'Baja', tono: 'neutro' },
};

export const MESES = [
  { etiqueta: 'jun', valor: 18400 }, { etiqueta: 'jul', valor: 21250 }, { etiqueta: 'ago', valor: 9800 },
  { etiqueta: 'sep', valor: 24600 }, { etiqueta: 'oct', valor: 27900 }, { etiqueta: 'nov', valor: 31450, destacado: true },
];

export const TARJETAS = [
  { id: 't1', columna: 'nuevo', titulo: 'Reforma de la cocina', cliente: 'Soler Reformas', importe: 8400 },
  { id: 't2', columna: 'nuevo', titulo: 'Mantenimiento anual', cliente: 'Giménez Climatización', importe: 1250 },
  { id: 't3', columna: 'nuevo', titulo: 'Flota de 6 furgonetas', cliente: 'Ortega Transportes', importe: 22300 },
  { id: 't4', columna: 'presupuesto', titulo: 'Web y reservas', cliente: 'Sidrería Echeverría', importe: 4600 },
  { id: 't5', columna: 'presupuesto', titulo: 'Plan de cierre fiscal', cliente: 'Ferrer Arquitectura', importe: 980 },
  { id: 't6', columna: 'ganado', titulo: 'Ortodoncia invisible, 12 meses', cliente: 'Clínica Dental Santos', importe: 3900 },
];

export const EVENTOS = [
  { id: 'e1', fecha: hace(0, 1), actor: 'Marta Ruiz', texto: 'registró un cobro de 1.250,00 € en la factura F-2026-0142' },
  { id: 'e2', fecha: hace(0, 4), actor: 'Álvaro Santos', texto: 'dejó una nota', detalle: 'Pide que la próxima factura salga a nombre de la sociedad nueva. Falta el CIF.' },
  { id: 'e3', fecha: hace(1, 2), actor: 'Lucía Ferrer', texto: 'cambió el estado de Pendiente a Activo' },
  { id: 'e4', fecha: hace(1, 6), actor: 'Sistema', texto: 'envió el recordatorio de la cita del 16 nov por email' },
  { id: 'e5', fecha: hace(4), actor: 'Noelia Castro', texto: 'creó el cliente' },
];

/** Promesa que tarda `ms`. Con `signal`, se rechaza si se cancela. */
export const esperar = (ms, signal) => new Promise((resuelve, rechaza) => {
  const t = setTimeout(resuelve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); rechaza(new DOMException('Cancelado', 'AbortError')); });
});

// Datos de ejemplo del catálogo. Inventados: solo sirven para enseñar los componentes.

/** Números «al azar» que salen siempre iguales, para que el catálogo no cambie entre recargas. */
export function azar(semilla) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const r1 = azar(7);
export const VENTAS_MES = MESES.map((etiqueta, i) => ({
  etiqueta,
  suscripciones: Math.round(4200 + i * 520 + r1() * 1400),
  servicios: Math.round(1200 + r1() * 1800),
}));

const r2 = azar(21);
export const VISITAS_DIA = Array.from({ length: 30 }, (_, i) => ({
  etiqueta: `${i + 1} nov`,
  visitas: Math.round(900 + Math.sin(i / 3.2) * 260 + i * 22 + r2() * 220),
  altas: Math.round(180 + Math.cos(i / 4) * 60 + i * 6 + r2() * 70),
}));

const r3 = azar(99);
export function actividadDiaria(hasta = new Date(), dias = 190) {
  const datos = {};
  for (let i = 0; i < dias; i += 1) {
    const d = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate() - i, 12);
    const laborable = d.getDay() !== 0 && d.getDay() !== 6;
    const n = Math.floor(r3() * (laborable ? 14 : 3) * (r3() > 0.25 ? 1 : 0));
    datos[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`] = n;
  }
  return datos;
}

export const REPARTO = [
  { nombre: 'Suscripciones', valor: 48200 },
  { nombre: 'Servicios', valor: 21400 },
  { nombre: 'Formación', valor: 9800 },
  { nombre: 'Soporte', valor: 4600 },
];

export const ORIGENES = [
  { nombre: 'Google', valor: 4820 },
  { nombre: 'Directo', valor: 3140 },
  { nombre: 'Instagram', valor: 2260 },
  { nombre: 'Recomendación', valor: 1480 },
  { nombre: 'Boletín', valor: 960 },
  { nombre: 'LinkedIn', valor: 610 },
  { nombre: 'YouTube', valor: 380 },
  { nombre: 'Otros', valor: 120 },
];

export const PERSONAS = [
  { nombre: 'Marta Ruiz', estado: 'activo' },
  { nombre: 'Íker Soto', estado: 'activo' },
  { nombre: 'Laura Gil', estado: 'ausente' },
  { nombre: 'Pablo Mena' },
  { nombre: 'Nuria Vidal' },
  { nombre: 'Óscar Peña' },
  { nombre: 'Elena Cano' },
];

export const ESPACIOS = [
  { id: 'norte', nombre: 'Clínica Norte', detalle: 'Plan Equipo · 12 usuarios' },
  { id: 'centro', nombre: 'Clínica Centro', detalle: 'Plan Equipo · 8 usuarios' },
  { id: 'lab', nombre: 'Laboratorio Dental', detalle: 'Plan Inicial · 3 usuarios' },
];
export const MUCHOS_ESPACIOS = [
  ...ESPACIOS,
  { id: 'sur', nombre: 'Clínica Sur', detalle: 'Plan Equipo' },
  { id: 'costa', nombre: 'Costa Dental', detalle: 'Plan Inicial' },
  { id: 'sierra', nombre: 'Sierra Salud', detalle: 'Plan Empresa' },
  { id: 'rio', nombre: 'Río Fisioterapia', detalle: 'Plan Inicial' },
  { id: 'faro', nombre: 'Óptica Faro', detalle: 'Plan Equipo' },
];

export const ROLES = [
  { id: 'propietario', nombre: 'Propietario' },
  { id: 'gestor', nombre: 'Gestor' },
  { id: 'recepcion', nombre: 'Recepción' },
  { id: 'lectura', nombre: 'Solo lectura' },
];
export const GRUPOS_PERMISOS = [
  { titulo: 'Clientes', permisos: [
    { id: 'clientes.ver', nombre: 'Ver clientes' },
    { id: 'clientes.editar', nombre: 'Crear y editar', detalle: 'Incluye importar desde Excel' },
    { id: 'clientes.eliminar', nombre: 'Eliminar' },
  ] },
  { titulo: 'Facturación', permisos: [
    { id: 'facturas.ver', nombre: 'Ver facturas' },
    { id: 'facturas.emitir', nombre: 'Emitir y anular' },
    { id: 'facturas.cobros', nombre: 'Registrar cobros' },
  ] },
  { titulo: 'Configuración', permisos: [
    { id: 'config.equipo', nombre: 'Invitar y quitar personas' },
    { id: 'config.plan', nombre: 'Cambiar de plan', detalle: 'Y los datos de pago' },
  ] },
];
const TODOS = GRUPOS_PERMISOS.flatMap((g) => g.permisos.map((p) => p.id));
export const PERMISOS_INICIALES = {
  propietario: TODOS,
  gestor: TODOS.filter((p) => !p.startsWith('config.')),
  recepcion: ['clientes.ver', 'clientes.editar', 'facturas.ver', 'facturas.cobros'],
  lectura: ['clientes.ver', 'facturas.ver'],
};

export const PLANES = [
  { id: 'inicial', nombre: 'Inicial', detalle: 'Para empezar con una persona', precio: { mes: 0, ano: 0 },
    incluye: ['1 usuario', '100 clientes', 'Facturas con tu logo', { texto: 'Recordatorios por WhatsApp', incluido: false }, { texto: 'Informes', incluido: false }] },
  { id: 'equipo', nombre: 'Equipo', detalle: 'Para un negocio con varias personas atendiendo', precio: { mes: 49, ano: 490 }, destacado: true, etiqueta: 'Más elegido',
    incluye: ['Hasta 10 usuarios', 'Clientes sin límite', 'Facturas con tu logo', 'Recordatorios por WhatsApp', 'Informes'] },
  { id: 'empresa', nombre: 'Empresa', detalle: 'Varias sedes, permisos por rol y soporte con respuesta en 4 h', precio: { mes: 129, ano: 1290 },
    incluye: ['Usuarios sin límite', 'Varias sedes', 'Permisos por rol', 'Copia diaria exportable', 'Soporte con respuesta en 4 h'] },
];

export const ARBOL = [
  { id: 'clientes', texto: 'Clientes', extra: 128, hijos: [
    { id: 'activos', texto: 'Activos', extra: 96 },
    { id: 'pendientes', texto: 'Pendientes de pago', extra: 14 },
    { id: 'baja', texto: 'De baja', extra: 18 },
  ] },
  { id: 'documentos', texto: 'Documentos', hijos: [
    { id: 'contratos', texto: 'Contratos', hijos: [
      { id: 'c-2026', texto: '2026', extra: 42 },
      { id: 'c-2025', texto: '2025', extra: 67 },
    ] },
    { id: 'facturas', texto: 'Facturas', extra: 342 },
    { id: 'presupuestos', texto: 'Presupuestos', extra: 51 },
  ] },
  { id: 'plantillas', texto: 'Plantillas', extra: 9 },
];

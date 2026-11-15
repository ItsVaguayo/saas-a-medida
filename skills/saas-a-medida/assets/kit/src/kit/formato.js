// 01 · Formato. Importes, números, fechas y tamaños como se escriben en España.
// Todo pasa por Intl con es-ES; lo que falta se pinta con una raya, nunca `null` ni un hueco.

const ES = 'es-ES';
const RAYA = '—';
const DIA = 86_400_000;
const falta = (v) => v === null || v === undefined || v === '' || Number.isNaN(v);

/** 1250 → «1.250,00 €». `useGrouping: 'always'` pone el punto también con cuatro cifras,
    para que una columna de importes se alinee igual en todas las filas. */
export function moneda(n, { decimales = 2, divisa = 'EUR' } = {}) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, {
    style: 'currency', currency: divisa, useGrouping: 'always',
    minimumFractionDigits: decimales, maximumFractionDigits: decimales,
  }).format(n);
}

/** 12840.5 → «12.840,5» */
export function numero(n, { decimales = 0 } = {}) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, { useGrouping: 'always', maximumFractionDigits: decimales }).format(n);
}

/** 0.214 → «21,4 %». Recibe la proporción, no el tanto por ciento. */
export function porcentaje(n, { decimales = 1 } = {}) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, { style: 'percent', maximumFractionDigits: decimales }).format(n);
}

/** 12840 → «12,8 mil». Para cifras de panel donde el detalle no importa. */
export function compacto(n) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

const aFecha = (f) => (f instanceof Date ? f : new Date(typeof f === 'string' && f.length === 10 ? `${f}T12:00:00` : f));
const medianoche = (f) => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

/** «13 nov 2026» */
export function fechaCorta(fecha) {
  if (falta(fecha)) return RAYA;
  return new Intl.DateTimeFormat(ES, { day: 'numeric', month: 'short', year: 'numeric' }).format(aFecha(fecha)).replace('.', '');
}

/** «14:30» */
export function hora(fecha) {
  if (falta(fecha)) return RAYA;
  return new Intl.DateTimeFormat(ES, { hour: '2-digit', minute: '2-digit' }).format(aFecha(fecha));
}

/** Las fechas cercanas, como se dicen: «hoy», «ayer», «mañana», «lun 16». Las demás, «13 nov» o «13 nov 2025». */
export function fechaCercana(fecha, ahora = new Date()) {
  if (falta(fecha)) return RAYA;
  const f = aFecha(fecha);
  const dias = Math.round((medianoche(f) - medianoche(ahora)) / DIA);
  if (dias === 0) return 'hoy';
  if (dias === -1) return 'ayer';
  if (dias === 1) return 'mañana';
  if (Math.abs(dias) < 7) {
    return new Intl.DateTimeFormat(ES, { weekday: 'short', day: 'numeric' }).format(f).replace(/[.,]/g, '');
  }
  const conAno = f.getFullYear() !== ahora.getFullYear();
  return new Intl.DateTimeFormat(ES, { day: 'numeric', month: 'short', ...(conAno && { year: 'numeric' }) }).format(f).replace('.', '');
}

/** «hace 5 minutos», «dentro de 2 horas». Por debajo del minuto, «ahora». */
export function hace(fecha, ahora = new Date()) {
  if (falta(fecha)) return RAYA;
  const segundos = Math.round((aFecha(fecha).getTime() - ahora.getTime()) / 1000);
  if (Math.abs(segundos) < 60) return 'ahora';
  const tramos = [['year', 31_536_000], ['month', 2_592_000], ['day', 86_400], ['hour', 3600], ['minute', 60]];
  const [unidad, tamano] = tramos.find(([, t]) => Math.abs(segundos) >= t);
  return new Intl.RelativeTimeFormat(ES, { numeric: 'auto' }).format(Math.trunc(segundos / tamano), unidad);
}

/** «Marta Ruiz Gil» → «MR». Sin nombre, «?». */
export function iniciales(nombre) {
  const partes = String(nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase();
}

/** 1536000 → «1,5 MB» */
export function tamano(bytes) {
  if (falta(bytes)) return RAYA;
  const unidades = ['B', 'kB', 'MB', 'GB', 'TB'];
  const i = bytes < 1 ? 0 : Math.min(unidades.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const valor = bytes / 1024 ** i;
  return `${new Intl.NumberFormat(ES, { maximumFractionDigits: i === 0 ? 0 : 1 }).format(valor)} ${unidades[i]}`;
}

/** plural(1, 'cliente', 'clientes') → «1 cliente»; con 3 → «3 clientes». */
export const plural = (n, uno, varios) => `${numero(n)} ${n === 1 ? uno : varios}`;

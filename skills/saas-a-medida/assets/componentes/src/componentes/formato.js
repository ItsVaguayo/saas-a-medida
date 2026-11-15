// Números, importes y fechas como se escriben en España. Todo pasa por Intl con es-ES;
// lo que falta se pinta con una raya, nunca `null` ni un hueco.
// Cualquier componente que pinte cifras acepta `formato` para cambiar de idioma o de moneda.

const ES = 'es-ES';
const RAYA = '—';
const DIA = 86_400_000;
const falta = (v) => v === null || v === undefined || v === '' || Number.isNaN(v);

/** 12840.5 → «12.841» */
export function numero(n, { decimales = 0 } = {}) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, { useGrouping: 'always', maximumFractionDigits: decimales }).format(n);
}

/** 1250 → «1.250,00 €» */
export function moneda(n, { decimales = 2, divisa = 'EUR' } = {}) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, {
    style: 'currency', currency: divisa, useGrouping: 'always',
    minimumFractionDigits: decimales, maximumFractionDigits: decimales,
  }).format(n);
}

/** 0.214 → «21,4 %». Recibe la proporción, no el tanto por ciento. */
export function porcentaje(n, { decimales = 1, signo = false } = {}) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, {
    style: 'percent', maximumFractionDigits: decimales, signDisplay: signo ? 'exceptZero' : 'auto',
  }).format(n);
}

/** 12840 → «12,8 mil». Para ejes y cifras de panel donde el detalle no importa. */
export function compacto(n) {
  if (falta(n)) return RAYA;
  return new Intl.NumberFormat(ES, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export const aFecha = (f) => (f instanceof Date ? f : new Date(typeof f === 'string' && f.length === 10 ? `${f}T12:00:00` : f));
const medianoche = (f) => new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime();

/** Fecha local como «2026-11-15», para usarla de clave. */
export function claveDia(fecha) {
  const f = aFecha(fecha);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

/** «14:30» */
export function hora(fecha) {
  if (falta(fecha)) return RAYA;
  return new Intl.DateTimeFormat(ES, { hour: '2-digit', minute: '2-digit' }).format(aFecha(fecha));
}

/** «13 nov» o, si es de otro año, «13 nov 2025» */
export function fechaCorta(fecha, ahora = new Date()) {
  if (falta(fecha)) return RAYA;
  const f = aFecha(fecha);
  const conAno = f.getFullYear() !== ahora.getFullYear();
  return new Intl.DateTimeFormat(ES, { day: 'numeric', month: 'short', ...(conAno && { year: 'numeric' }) }).format(f).replace('.', '');
}

/** «Hoy», «Ayer» o la fecha corta. Para los rótulos de día de una lista de actividad. */
export function diaCercano(fecha, ahora = new Date()) {
  if (falta(fecha)) return RAYA;
  const dias = Math.round((medianoche(aFecha(fecha)) - medianoche(ahora)) / DIA);
  if (dias === 0) return 'Hoy';
  if (dias === -1) return 'Ayer';
  return fechaCorta(fecha, ahora);
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

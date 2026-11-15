// Cálculos que comparten los gráficos: marcas del eje, curvas y colores de serie.

/** Colores de serie por orden. Salen del tema (--serie-1 … --serie-6). */
export const colorSerie = (i) => `var(--serie-${(i % 6) + 1})`;

/** Marcas redondas para un eje que empieza en 0: con máximo 8.340 da 0, 2.500, 5.000, 7.500 y 10.000. */
export function marcasEje(maximo, cuantas = 4) {
  if (!(maximo > 0)) return [0, 1];
  const bruto = maximo / cuantas;
  const magnitud = 10 ** Math.floor(Math.log10(bruto));
  const resto = bruto / magnitud;
  const paso = (resto <= 1 ? 1 : resto <= 2 ? 2 : resto <= 2.5 ? 2.5 : resto <= 5 ? 5 : 10) * magnitud;
  const marcas = [];
  for (let v = 0; v < maximo + paso - paso * 1e-9; v += paso) marcas.push(Number(v.toPrecision(12)));
  return marcas;
}

const f = (n) => Math.round(n * 100) / 100;

/** Curva suave que pasa por todos los puntos sin inventar picos entre ellos (interpolación monótona):
    si los datos no bajan de cero, la línea tampoco. @param puntos [[x, y], …] ordenados por x */
export function trazoSuave(puntos) {
  const n = puntos.length;
  if (n === 0) return '';
  if (n === 1) return `M${f(puntos[0][0])},${f(puntos[0][1])}`;
  const dx = [];
  const pendiente = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx[i] = puntos[i + 1][0] - puntos[i][0];
    pendiente[i] = (puntos[i + 1][1] - puntos[i][1]) / (dx[i] || 1);
  }
  const t = [pendiente[0]];
  for (let i = 1; i < n - 1; i += 1) t[i] = pendiente[i - 1] * pendiente[i] <= 0 ? 0 : (pendiente[i - 1] + pendiente[i]) / 2;
  t[n - 1] = pendiente[n - 2];
  for (let i = 0; i < n - 1; i += 1) {
    if (pendiente[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / pendiente[i];
    const b = t[i + 1] / pendiente[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      t[i] = k * a * pendiente[i];
      t[i + 1] = k * b * pendiente[i];
    }
  }
  let d = `M${f(puntos[0][0])},${f(puntos[0][1])}`;
  for (let i = 0; i < n - 1; i += 1) {
    const h = dx[i] / 3;
    d += `C${f(puntos[i][0] + h)},${f(puntos[i][1] + h * t[i])} ${f(puntos[i + 1][0] - h)},${f(puntos[i + 1][1] - h * t[i + 1])} ${f(puntos[i + 1][0])},${f(puntos[i + 1][1])}`;
  }
  return d;
}

/** Cada cuántas etiquetas del eje X pintar una para que no se pisen. */
export const saltoEtiquetas = (cuantas, ancho, minimo = 56) =>
  Math.max(1, Math.ceil(cuantas / Math.max(1, Math.floor(ancho / minimo))));

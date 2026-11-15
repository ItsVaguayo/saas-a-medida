// 08 · Minigráfico. La tendencia en un vistazo, sin ejes ni cifras: para tarjetas y filas de tabla.
// Referencias: Stripe, Tremor (SparkChart), GitHub.
import { useId, useRef } from 'react';
import { numero } from './formato.js';
import { trazoSuave } from './graficos.js';
import { cx, useAncho, useEnVista } from './interno.js';
import './Minigrafico.css';

/** @param datos    [n, n, …]
    @param tipo     'linea' | 'barras'
    @param relleno  sombrea bajo la línea
    @param fluido   ocupa el ancho de su contenedor; si no, mide `ancho`
    @param etiqueta lo que lee el lector de pantalla; por defecto «De 120 a 180»
    Color: --color (por defecto el acento). */
export function Minigrafico({ datos = [], tipo = 'linea', relleno = true, ancho = 120, alto = 36, fluido, etiqueta, className, style }) {
  const id = useId();
  const caja = useRef(null);
  const medido = useAncho(caja, ancho);
  const visto = useEnVista(caja);
  const w = fluido ? medido : ancho;
  const margen = 3;
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const tramo = max - min || 1;
  const x = (i) => (datos.length < 2 ? w / 2 : margen + (i / (datos.length - 1)) * (w - margen * 2));
  const y = (v) => alto - margen - ((v - min) / tramo) * (alto - margen * 2);
  const puntos = datos.map((v, i) => [x(i), y(v)]);
  const linea = trazoSuave(puntos);
  const fin = puntos[puntos.length - 1];
  const lectura = etiqueta ?? (datos.length ? `De ${numero(datos[0])} a ${numero(datos[datos.length - 1])}` : '');

  return (
    <span
      ref={caja}
      className={cx('c-mini', fluido && 'c-mini--fluido', className)}
      data-visto={visto || undefined}
      data-tipo={tipo}
      style={{ height: alto, ...(fluido ? null : { width: ancho }), ...style }}
    >
      {datos.length > 0 && w > 0 && (
        <svg width={w} height={alto} viewBox={`0 0 ${w} ${alto}`} role="img" aria-label={lectura}>
          {tipo === 'barras' ? (
            datos.map((v, i) => {
              const hueco = 2;
              const bw = Math.max(1, (w - hueco * (datos.length - 1)) / datos.length);
              const bh = Math.max(2, ((v - Math.min(0, min)) / (max - Math.min(0, min) || 1)) * alto);
              return (
                <rect
                  key={i} className="c-mini__barra" data-ultima={i === datos.length - 1 || undefined}
                  x={i * (bw + hueco)} y={alto - bh} width={bw} height={bh} rx={Math.min(2, bw / 2)}
                  style={{ '--i': i }}
                />
              );
            })
          ) : (
            <>
              <defs>
                <linearGradient id={`${id}-relleno`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--color)" stopOpacity="0.28" />
                  <stop offset="1" stopColor="var(--color)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="c-mini__trazo">
                {relleno && datos.length > 1 && <path d={`${linea}L${fin[0]},${alto}L${puntos[0][0]},${alto}Z`} fill={`url(#${id}-relleno)`} />}
                <path d={linea} fill="none" stroke="var(--color)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <circle className="c-mini__fin" cx={fin[0]} cy={fin[1]} r="2.5" />
            </>
          )}
        </svg>
      )}
    </span>
  );
}

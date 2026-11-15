// 13 · Progreso. Barra y anillo. Con valor, avanzan hasta él; sin valor, indican que algo está en marcha
// sin prometer cuánto falta.
import { porcentaje } from './formato.js';
import { cx } from './interno.js';
import './Progreso.css';

const proporcion = (valor, max) => Math.max(0, Math.min(1, valor / max));

/** @param valor    número entre 0 y `max`. Sin valor, la barra es indeterminada
    @param etiqueta nombre para el lector de pantalla y, con `visible`, texto encima de la barra
    @param tono     'acento' | 'bien' | 'atencion' | 'mal' */
export function Barra({ valor, max = 100, etiqueta, visible = false, tono = 'acento', className }) {
  const sinValor = valor === null || valor === undefined;
  const p = sinValor ? 0 : proporcion(valor, max);
  return (
    <div className={cx('k-barra', `k-barra--${tono}`, className)}>
      {visible && (
        <div className="k-barra__cabecera">
          <span>{etiqueta}</span>
          {!sinValor && <span className="k-barra__cifra">{porcentaje(p, { decimales: 0 })}</span>}
        </div>
      )}
      <div
        className="k-barra__pista"
        role="progressbar"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={sinValor ? undefined : valor}
        data-indeterminada={sinValor || undefined}
      >
        <div className="k-barra__relleno" style={sinValor ? undefined : { transform: `scaleX(${p})` }} />
      </div>
    </div>
  );
}

/** Anillo. Dentro va lo que se le pase como hijo (la cifra, un icono). */
export function Anillo({ valor, max = 100, tamano = 48, grosor = 5, etiqueta, tono = 'acento', children }) {
  const radio = (tamano - grosor) / 2;
  const p = proporcion(valor ?? 0, max);
  return (
    <span className={cx('k-anillo', `k-anillo--${tono}`)} style={{ width: tamano, height: tamano }} role="progressbar" aria-label={etiqueta} aria-valuemin={0} aria-valuemax={max} aria-valuenow={valor}>
      <svg viewBox={`0 0 ${tamano} ${tamano}`} aria-hidden="true">
        <circle className="k-anillo__pista" cx={tamano / 2} cy={tamano / 2} r={radio} strokeWidth={grosor} />
        {/* pathLength=1: el trazo se mide de 0 a 1 y el CSS no necesita saber el perímetro */}
        <circle className="k-anillo__trazo" cx={tamano / 2} cy={tamano / 2} r={radio} strokeWidth={grosor} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} />
      </svg>
      {children && <span className="k-anillo__dentro">{children}</span>}
    </span>
  );
}

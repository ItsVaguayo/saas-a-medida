// 36 · Cifras. La cifra que responde a una pregunta del cliente, con su cambio respecto al periodo anterior
// y una gráfica mínima de la tendencia. El cambio lleva flecha y texto: nunca se entiende solo por el color.
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { CifraAnimada } from './CifraAnimada.jsx';
import { numero, porcentaje } from './formato.js';
import { cx } from './interno.js';
import './Cifras.css';

/** Gráfica mínima sin ejes. @param serie lista de números, del más antiguo al más reciente */
export function Minigrafica({ serie, ancho = 96, alto = 32, className }) {
  if (!serie || serie.length < 2) return null;
  const min = Math.min(...serie);
  const rango = Math.max(...serie) - min || 1;
  const puntos = serie.map((v, i) => [(i / (serie.length - 1)) * ancho, alto - 3 - ((v - min) / rango) * (alto - 6)]);
  const linea = puntos.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [ux, uy] = puntos[puntos.length - 1];
  return (
    <svg className={cx('k-mini', className)} viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} aria-hidden="true">
      <path className="k-mini__area" d={`${linea} L${ancho} ${alto} L0 ${alto} Z`} />
      <path className="k-mini__linea" d={linea} pathLength="1" />
      <circle className="k-mini__punto" cx={ux} cy={uy} r="2.5" />
    </svg>
  );
}

/** @param rotulo     qué es: «Cobrado en noviembre»
    @param valor      número
    @param formato    (n) => texto. Por ejemplo `moneda`
    @param cambio     proporción respecto al periodo anterior: 0.12 es +12 %
    @param comparado  con qué se compara: «que en octubre»
    @param menosEsMejor para lo que conviene que baje (impagos, bajas): invierte el tono del cambio
    @param serie      números para la minigráfica */
export function Cifra({ rotulo, valor, formato = numero, cambio, comparado, menosEsMejor = false, serie, icono: Icono, className }) {
  const hayCambio = cambio !== undefined && cambio !== null;
  const sube = cambio > 0;
  const igual = !cambio;
  const Flecha = igual ? Minus : sube ? ArrowUpRight : ArrowDownRight;
  const tono = igual ? 'neutro' : sube !== menosEsMejor ? 'bien' : 'mal';
  return (
    <article className={cx('k-cifra k-tarjeta', className)}>
      <header className="k-cifra__rotulo">
        {Icono && <Icono aria-hidden="true" />}
        <h3>{rotulo}</h3>
      </header>
      <div className="k-cifra__fila">
        <CifraAnimada className="k-cifra__valor" valor={valor} formato={formato} desde={0} />
        <Minigrafica serie={serie} className={`k-mini--${tono}`} />
      </div>
      {hayCambio && (
        <p className="k-cifra__cambio" data-tono={tono}>
          <span className="k-cifra__delta">
            <Flecha aria-hidden="true" />
            {igual ? 'Igual' : `${porcentaje(Math.abs(cambio))} ${sube ? 'más' : 'menos'}`}
          </span>
          {comparado && <span> {comparado}</span>}
        </p>
      )}
    </article>
  );
}

/** Rejilla de cifras: tantas columnas como quepan. */
export const Cifras = ({ children, className }) => <div className={cx('k-cifras', className)}>{children}</div>;

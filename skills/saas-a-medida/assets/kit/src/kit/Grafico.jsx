// 37 · Gráfico. Barras y línea sin librerías, para los dos casos que cubren casi todo en una app de gestión:
// comparar categorías o periodos (barras) y ver una evolución (línea).
// Cada valor se puede leer con el ratón, con el teclado y, para el lector de pantalla, en una tabla oculta.
import { useId, useState } from 'react';
import { numero } from './formato.js';
import { cx } from './interno.js';
import './Grafico.css';

/** Sube `max` al siguiente número redondo, para que el eje acabe en 500 y no en 487. */
export function techoRedondo(max) {
  if (!(max > 0)) return 1;
  const potencia = 10 ** Math.floor(Math.log10(max));
  const paso = [1, 2, 2.5, 5, 10].find((p) => p * potencia >= max);
  return paso * potencia;
}

const MARCAS = [1, 0.75, 0.5, 0.25, 0];

function TablaOculta({ titulo, datos, formato }) {
  return (
    // Una tabla no obedece al ancho ni al recorte: va dentro de una caja que sí
    <div className="oculto-accesible">
      <table>
        <caption>{titulo}</caption>
        <tbody>{datos.map((d) => <tr key={d.etiqueta}><th scope="row">{d.etiqueta}</th><td>{formato(d.valor)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/** @param datos   [{ etiqueta, valor, destacado }]
    @param titulo  qué enseña el gráfico (para el lector de pantalla)
    @param formato (n) => texto de los valores y del eje
    @param alto    altura de la zona de barras en px */
export function GraficoBarras({ datos, titulo, formato = numero, alto = 200, className }) {
  const [activa, setActiva] = useState(null);
  const techo = techoRedondo(Math.max(...datos.map((d) => d.valor), 0));
  return (
    <figure className={cx('k-grafico', className)}>
      <TablaOculta titulo={titulo} datos={datos} formato={formato} />
      <div className="k-grafico__lienzo" style={{ height: alto }} aria-hidden="true">
        <div className="k-grafico__eje">{MARCAS.map((m) => <span key={m}>{formato(techo * m)}</span>)}</div>
        <div className="k-grafico__zona" onPointerLeave={() => setActiva(null)}>
          {MARCAS.map((m) => <span key={m} className="k-grafico__raya" style={{ bottom: `${m * 100}%` }} />)}
          <div className="k-barras" data-activa={activa !== null || undefined}>
            {datos.map((d, i) => (
              <div key={d.etiqueta} className="k-barras__columna" data-activa={activa === i || undefined} onPointerEnter={() => setActiva(i)}>
                <div className="k-barras__barra" data-destacado={d.destacado || undefined} style={{ height: `${Math.max(0.5, (d.valor / techo) * 100)}%`, '--i': i }}>
                  {activa === i && <span className="k-grafico__globo"><strong>{formato(d.valor)}</strong>{d.etiqueta}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="k-grafico__etiquetas" aria-hidden="true">
        {datos.map((d, i) => <span key={d.etiqueta} data-activa={activa === i || undefined}>{d.etiqueta}</span>)}
      </div>
    </figure>
  );
}

/** Evolución en el tiempo. Mismos parámetros que GraficoBarras. */
export function GraficoLinea({ datos, titulo, formato = numero, alto = 200, className }) {
  const id = useId();
  const [activo, setActivo] = useState(null);
  const techo = techoRedondo(Math.max(...datos.map((d) => d.valor), 0));
  const n = datos.length;
  const x = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100);
  const y = (v) => 100 - (v / techo) * 100;
  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(d.valor).toFixed(2)}`).join(' ');

  // El punto más cercano al puntero: no hace falta acertar encima de la línea
  const buscar = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setActivo(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
  };
  const tecla = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setActivo((a) => Math.max(0, Math.min(n - 1, (a ?? (e.key === 'ArrowRight' ? -1 : n)) + (e.key === 'ArrowRight' ? 1 : -1))));
  };
  const punto = activo !== null ? datos[activo] : null;

  return (
    <figure className={cx('k-grafico', className)}>
      <TablaOculta titulo={titulo} datos={datos} formato={formato} />
      <div className="k-grafico__lienzo" style={{ height: alto }}>
        <div className="k-grafico__eje" aria-hidden="true">{MARCAS.map((m) => <span key={m}>{formato(techo * m)}</span>)}</div>
        <div
          className="k-grafico__zona k-linea"
          tabIndex={0}
          role="img"
          aria-label={`${titulo}. Flechas para recorrer los valores`}
          aria-describedby={punto ? `${id}-v` : undefined}
          onPointerMove={buscar}
          onPointerLeave={() => setActivo(null)}
          onKeyDown={tecla}
          onBlur={() => setActivo(null)}
        >
          {MARCAS.map((m) => <span key={m} className="k-grafico__raya" style={{ bottom: `${m * 100}%` }} />)}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--acento)" stopOpacity="0.2" />
                <stop offset="1" stopColor="var(--acento)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="k-linea__area" d={`${linea} L100 100 L0 100 Z`} fill={`url(#${id}-g)`} />
            <path className="k-linea__trazo" d={linea} pathLength="1" />
          </svg>
          {punto && (
            <>
              <span className="k-linea__guia" style={{ left: `${x(activo)}%` }} />
              <span className="k-linea__punto" style={{ left: `${x(activo)}%`, top: `${y(punto.valor)}%` }}>
                <span className="k-grafico__globo" id={`${id}-v`} data-borde={x(activo) < 15 ? 'inicio' : x(activo) > 85 ? 'fin' : undefined}>
                  <strong>{formato(punto.valor)}</strong>{punto.etiqueta}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="k-grafico__etiquetas k-grafico__etiquetas--extremos" aria-hidden="true">
        {datos.map((d, i) => <span key={d.etiqueta} data-activa={activo === i || undefined}>{d.etiqueta}</span>)}
      </div>
    </figure>
  );
}

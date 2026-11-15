// 11 · Anillo. Cómo se reparte un total entre pocas partes (hasta seis; con más, mejor una lista clasificada).
// Al señalar una parte, en la leyenda o en el anillo, el centro enseña su cifra. Referencias: Stripe, Tremor (DonutChart).
import { useRef, useState } from 'react';
import { numero, porcentaje } from './formato.js';
import { colorSerie } from './graficos.js';
import { cx, useEnVista } from './interno.js';
import './Anillo.css';

/** @param datos    [{ nombre, valor, color? }]
    @param formato  (n) => texto
    @param titulo   lo que se lee en el centro bajo el total: «Ingresos»
    @param grosor   ancho del anillo, de 4 a 20 (unidades de un lienzo de 100)
    Tamaño: --anillo-lado (168px). */
export function Anillo({ datos, formato = numero, titulo = 'Total', grosor = 11, className }) {
  const caja = useRef(null);
  const visto = useEnVista(caja);
  const [activo, setActivo] = useState(null);
  const total = datos.reduce((suma, d) => suma + d.valor, 0) || 1;
  const hueco = datos.length > 1 ? 1.2 : 0;
  let recorrido = 0;
  const partes = datos.map((d, i) => {
    const parte = (d.valor / total) * 100;
    const inicio = recorrido;
    recorrido += parte;
    return { ...d, parte, inicio, color: d.color ?? colorSerie(i) };
  });
  const centro = activo === null ? null : partes[activo];

  return (
    <div ref={caja} className={cx('c-anillo', className)} data-visto={visto || undefined} data-con-activo={activo !== null || undefined}>
      <div className="c-anillo__dibujo">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="c-anillo__pista" cx="50" cy="50" r="40" strokeWidth={grosor} />
          {partes.map((p, i) => (
            <circle
              key={p.nombre}
              className="c-anillo__parte"
              data-activo={i === activo || undefined}
              cx="50" cy="50" r="40" pathLength="100"
              stroke={p.color}
              strokeWidth={grosor}
              strokeDasharray={visto ? `${Math.max(0.6, p.parte - hueco)} 100` : '0 100'}
              strokeDashoffset={-p.inicio}
              style={{ '--i': i }}
              onPointerEnter={() => setActivo(i)}
              onPointerLeave={() => setActivo(null)}
            />
          ))}
        </svg>
        <div className="c-anillo__centro" aria-hidden="true">
          <span key={centro?.nombre ?? 'total'} className="c-anillo__cifra">{formato(centro ? centro.valor : datos.reduce((s, d) => s + d.valor, 0))}</span>
          <span className="c-anillo__rotulo">{centro ? centro.nombre : titulo}</span>
          {centro && <span className="c-anillo__rotulo">{porcentaje(centro.parte / 100)}</span>}
        </div>
      </div>
      <ul className="c-anillo__leyenda" aria-label={titulo}>
        {partes.map((p, i) => (
          <li
            key={p.nombre}
            tabIndex={0}
            data-activo={i === activo || undefined}
            onPointerEnter={() => setActivo(i)}
            onPointerLeave={() => setActivo(null)}
            onFocus={() => setActivo(i)}
            onBlur={() => setActivo(null)}
          >
            <span className="c-muestra" style={{ '--color': p.color }} />
            <span className="c-anillo__nombre">{p.nombre}</span>
            <span className="c-anillo__valor">{formato(p.valor)}</span>
            <span className="c-anillo__parte-texto">{porcentaje(p.parte / 100)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

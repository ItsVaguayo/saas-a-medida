// 10 · Gráfico de área. La evolución en el tiempo de una o varias series, con una guía que sigue al puntero
// y enseña el dato de ese día. Referencias: Stripe, Vercel Analytics, Linear Insights.
import { useId, useRef, useState } from 'react';
import { compacto, numero } from './formato.js';
import { Leyenda, TablaOculta } from './GraficoBarras.jsx';
import { colorSerie, marcasEje, saltoEtiquetas, trazoSuave } from './graficos.js';
import { cx, limitar, useAncho, useEnVista } from './interno.js';
import './Graficos.css';

/** @param datos      [{ etiqueta: '1 nov', visitas: 320, altas: 12 }, …]
    @param series     [{ clave, nombre, color? }]
    @param relleno    sombrea bajo cada línea (con muchas series conviene quitarlo)
    @param formato, formatoEje, titulo, alto  igual que en <GraficoBarras> */
export function GraficoArea({ datos, series, relleno = true, formato = numero, formatoEje = compacto, alto = 240, titulo, className }) {
  const lista = series ?? [{ clave: 'valor', nombre: titulo ?? 'Valor' }];
  const id = useId();
  const caja = useRef(null);
  const zona = useRef(null);
  const visto = useEnVista(caja);
  const ancho = useAncho(zona, 480);
  const [activo, setActivo] = useState(null);
  const marcas = marcasEje(Math.max(...datos.flatMap((d) => lista.map((s) => Number(d[s.clave]) || 0)), 0));
  const tope = marcas[marcas.length - 1];
  const ultimo = Math.max(1, datos.length - 1);
  const x = (i) => (i / ultimo) * ancho;
  const y = (v) => alto - ((Number(v) || 0) / tope) * alto;
  const salto = saltoEtiquetas(datos.length, ancho, 64);
  const fila = activo === null ? null : datos[activo];

  const desdePuntero = (e) => {
    const r = zona.current.getBoundingClientRect();
    setActivo(limitar(Math.round(((e.clientX - r.left) / r.width) * ultimo), 0, datos.length - 1));
  };
  const alTeclear = (e) => {
    const destino = { ArrowRight: (activo ?? -1) + 1, ArrowLeft: (activo ?? datos.length) - 1, Home: 0, End: datos.length - 1 }[e.key];
    if (e.key === 'Escape') { setActivo(null); return; }
    if (destino === undefined) return;
    e.preventDefault();
    setActivo(limitar(destino, 0, datos.length - 1));
  };

  return (
    <figure ref={caja} className={cx('c-grafico c-area', className)} data-visto={visto || undefined}>
      {lista.length > 1 && <Leyenda series={lista} />}
      <div className="c-grafico__cuerpo" style={{ '--alto': `${alto}px` }}>
        <div className="c-grafico__eje-y" aria-hidden="true">
          {[...marcas].reverse().map((m) => <span key={m}>{formatoEje(m)}</span>)}
        </div>
        <div
          ref={zona}
          className="c-grafico__zona"
          role="group"
          tabIndex={0}
          aria-label={`${titulo ?? 'Gráfico de evolución'}. Flechas izquierda y derecha para recorrer los datos`}
          onKeyDown={alTeclear}
          onBlur={() => setActivo(null)}
          onPointerMove={desdePuntero}
          onPointerDown={desdePuntero}
          onPointerLeave={() => setActivo(null)}
        >
          <div className="c-grafico__rejilla" aria-hidden="true">{marcas.map((m) => <span key={m} />)}</div>
          <div className="c-area__lienzo" aria-hidden="true">
            <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`}>
              {lista.map((s, j) => {
                const color = s.color ?? colorSerie(j);
                const linea = trazoSuave(datos.map((d, i) => [x(i), y(d[s.clave])]));
                return (
                  <g key={s.clave}>
                    {relleno && datos.length > 1 && (
                      <>
                        <defs>
                          <linearGradient id={`${id}-${j}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={color} stopOpacity={lista.length > 1 ? 0.16 : 0.26} />
                            <stop offset="1" stopColor={color} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path className="c-area__relleno" d={`${linea}L${ancho},${alto}L0,${alto}Z`} fill={`url(#${id}-${j})`} />
                      </>
                    )}
                    <path className="c-area__linea" d={linea} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                );
              })}
            </svg>
          </div>
          {fila && (
            <>
              <span className="c-area__guia" style={{ '--x': `${x(activo)}px` }} aria-hidden="true" />
              {lista.map((s, j) => (
                <span key={s.clave} className="c-area__punto" style={{ '--x': `${x(activo)}px`, '--y': `${y(fila[s.clave])}px`, '--color': s.color ?? colorSerie(j) }} aria-hidden="true" />
              ))}
              <div
                className="c-globo c-grafico__globo"
                data-lado={activo > datos.length / 2 ? 'izquierda' : 'derecha'}
                style={{ '--x': `${x(activo)}px`, '--y': `${Math.min(...lista.map((s) => y(fila[s.clave])))}px` }}
              >
                <div className="c-globo__titulo">{fila.etiqueta}</div>
                {lista.map((s, j) => (
                  <div key={s.clave} className="c-globo__fila">
                    {lista.length > 1 && <span className="c-muestra" style={{ '--color': s.color ?? colorSerie(j) }} />}
                    {lista.length > 1 && s.nombre}
                    <b>{formato(fila[s.clave])}</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="c-grafico__eje-x c-area__eje-x" aria-hidden="true">
          {datos.map((d, i) => (i % salto === 0 ? <span key={d.etiqueta} style={{ '--x': `${(i / ultimo) * 100}%` }} data-borde={i === 0 ? 'inicio' : i === datos.length - 1 ? 'fin' : undefined}>{d.etiqueta}</span> : null))}
        </div>
      </div>
      <span className="oculto-accesible" role="status">
        {fila ? `${fila.etiqueta}: ${lista.map((s) => `${lista.length > 1 ? `${s.nombre} ` : ''}${formato(fila[s.clave])}`).join(', ')}` : ''}
      </span>
      <TablaOculta titulo={titulo} datos={datos} series={lista} formato={formato} />
    </figure>
  );
}

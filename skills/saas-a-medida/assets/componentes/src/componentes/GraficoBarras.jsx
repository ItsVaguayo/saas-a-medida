// 09 · Gráfico de barras. Comparar periodos o categorías, con una serie o varias apiladas.
// Al pasar por una columna (o recorrerlas con las flechas) sale su dato. Referencias: Stripe, Tremor, Plausible.
import { useRef, useState } from 'react';
import { compacto, numero } from './formato.js';
import { colorSerie, marcasEje, saltoEtiquetas } from './graficos.js';
import { cx, limitar, useAncho, useEnVista } from './interno.js';
import './Graficos.css';

/** @param datos      [{ etiqueta: 'Ene', ventas: 1200, devoluciones: 80 }, …]
    @param series     [{ clave: 'ventas', nombre: 'Ventas', color? }]. Con varias, se apilan
    @param formato    (n) => texto del dato en el globo
    @param formatoEje (n) => texto de las marcas del eje
    @param titulo     nombre del gráfico para el lector de pantalla
    Alto: `alto` en px. Colores: --serie-1 … --serie-6 del tema, o `color` en cada serie. */
export function GraficoBarras({ datos, series, formato = numero, formatoEje = compacto, alto = 220, titulo, className }) {
  const lista = series ?? [{ clave: 'valor', nombre: titulo ?? 'Valor' }];
  const caja = useRef(null);
  const zona = useRef(null);
  const visto = useEnVista(caja);
  const ancho = useAncho(zona, 480);
  const [activa, setActiva] = useState(null);
  const total = (fila) => lista.reduce((suma, s) => suma + (Number(fila[s.clave]) || 0), 0);
  const marcas = marcasEje(Math.max(...datos.map(total), 0));
  const tope = marcas[marcas.length - 1];
  const salto = saltoEtiquetas(datos.length, ancho, 48);
  const fila = activa === null ? null : datos[activa];

  const alTeclear = (e) => {
    const destino = { ArrowRight: (activa ?? -1) + 1, ArrowLeft: (activa ?? datos.length) - 1, Home: 0, End: datos.length - 1 }[e.key];
    if (e.key === 'Escape') { setActiva(null); return; }
    if (destino === undefined) return;
    e.preventDefault();
    setActiva(limitar(destino, 0, datos.length - 1));
  };

  return (
    <figure ref={caja} className={cx('c-grafico c-barras', className)} data-visto={visto || undefined}>
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
          aria-label={`${titulo ?? 'Gráfico de barras'}. Flechas izquierda y derecha para recorrer los datos`}
          onKeyDown={alTeclear}
          onBlur={() => setActiva(null)}
          onPointerLeave={() => setActiva(null)}
        >
          <div className="c-grafico__rejilla" aria-hidden="true">{marcas.map((m) => <span key={m} />)}</div>
          <div className="c-barras__columnas" data-con-activa={activa !== null || undefined}>
            {datos.map((d, i) => (
              <div
                key={d.etiqueta}
                className="c-barras__columna"
                data-activa={i === activa || undefined}
                style={{ '--i': Math.min(i, 24) }}
                onPointerEnter={() => setActiva(i)}
                onPointerDown={() => setActiva(i)}
              >
                <div className="c-barras__pila" style={{ height: `${(total(d) / tope) * 100}%` }}>
                  {lista.map((s, j) => (
                    <span key={s.clave} className="c-barras__tramo" style={{ flexGrow: Number(d[s.clave]) || 0, '--color': s.color ?? colorSerie(j) }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {fila && (
            <div
              className="c-globo c-grafico__globo"
              data-lado={activa > datos.length / 2 ? 'izquierda' : 'derecha'}
              style={{ '--x': `${((activa + 0.5) / datos.length) * 100}%`, '--y': `${100 - (total(fila) / tope) * 100}%` }}
            >
              <div className="c-globo__titulo">{fila.etiqueta}</div>
              {lista.map((s, j) => (
                <div key={s.clave} className="c-globo__fila">
                  {lista.length > 1 && <span className="c-muestra" style={{ '--color': s.color ?? colorSerie(j) }} />}
                  {lista.length > 1 && s.nombre}
                  <b>{formato(fila[s.clave])}</b>
                </div>
              ))}
              {lista.length > 1 && <div className="c-globo__fila c-globo__total">Total<b>{formato(total(fila))}</b></div>}
            </div>
          )}
        </div>
        <div className="c-grafico__eje-x" aria-hidden="true">
          {datos.map((d, i) => <span key={d.etiqueta} data-activa={i === activa || undefined}>{i % salto === 0 ? d.etiqueta : ''}</span>)}
        </div>
      </div>
      <span className="oculto-accesible" role="status">
        {fila ? `${fila.etiqueta}: ${lista.map((s) => `${lista.length > 1 ? `${s.nombre} ` : ''}${formato(fila[s.clave])}`).join(', ')}` : ''}
      </span>
      <TablaOculta titulo={titulo} datos={datos} series={lista} formato={formato} />
    </figure>
  );
}

/** Leyenda de series. La comparten los gráficos de barras y de área. */
export function Leyenda({ series }) {
  return (
    <ul className="c-grafico__leyenda">
      {series.map((s, j) => (
        <li key={s.clave}><span className="c-muestra" style={{ '--color': s.color ?? colorSerie(j) }} />{s.nombre}</li>
      ))}
    </ul>
  );
}

/** Los mismos datos en una tabla que solo ve el lector de pantalla. */
export function TablaOculta({ titulo, datos, series, formato }) {
  return (
    <table className="oculto-accesible">
      {titulo && <caption>{titulo}</caption>}
      <thead><tr><th scope="col">Periodo</th>{series.map((s) => <th key={s.clave} scope="col">{s.nombre}</th>)}</tr></thead>
      <tbody>
        {datos.map((d) => (
          <tr key={d.etiqueta}><th scope="row">{d.etiqueta}</th>{series.map((s) => <td key={s.clave}>{formato(d[s.clave])}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

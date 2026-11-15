// 15 · Línea de tiempo. Lo que ha pasado con un cliente, un pedido o una cuenta, de lo último a lo primero
// y agrupado por días. Lo que llega nuevo entra animado. Referencias: Stripe (eventos), Linear (actividad), GitHub.
import { useEffect, useRef } from 'react';
import { Boton } from './base.jsx';
import { aFecha, claveDia, diaCercano, hora } from './formato.js';
import { cx } from './interno.js';
import './LineaTiempo.css';

/** @param eventos    [{ id, titulo, detalle?, fecha, icono?, tono?, autor? }] del más reciente al más antiguo.
                      `titulo` y `detalle` admiten nodos. `tono`: 'neutro' | 'acento' | 'bien' | 'atencion' | 'mal'
    @param agrupar    separa por días con su rótulo («Hoy», «Ayer», «12 nov»)
    @param ahora      fecha de referencia para «Hoy» y «Ayer» (para pruebas)
    @param alCargarMas () => void. Si llega, pinta el botón al final
    @param cargando   el botón enseña la rueda */
export function LineaTiempo({ eventos, agrupar = true, ahora, alCargarMas, cargando, textos, className }) {
  const t = { mas: 'Ver anteriores', ...textos };
  // Al montar entran en cascada; después, solo se anima lo que llega nuevo
  const montada = useRef(false);
  useEffect(() => { montada.current = true; }, []);

  const grupos = [];
  for (const evento of eventos) {
    const clave = agrupar ? claveDia(evento.fecha) : 'todo';
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.clave === clave) ultimo.eventos.push(evento);
    else grupos.push({ clave, fecha: evento.fecha, eventos: [evento] });
  }
  let orden = 0;

  return (
    <div className={cx('c-tiempo', className)}>
      {grupos.map((grupo) => (
        <section key={grupo.clave} className="c-tiempo__grupo">
          {agrupar && <h3 className="c-tiempo__dia">{diaCercano(grupo.fecha, ahora)}</h3>}
          <ol className="c-tiempo__lista">
            {grupo.eventos.map((evento) => {
              const Icono = evento.icono;
              const i = orden;
              orden += 1;
              return (
                <li key={evento.id} className="c-tiempo__evento" data-tono={evento.tono ?? 'neutro'} style={{ '--i': montada.current ? 0 : Math.min(i, 10) }}>
                  <span className="c-tiempo__marca" data-con-icono={Icono ? '' : undefined} aria-hidden="true">{Icono && <Icono />}</span>
                  <div className="c-tiempo__cuerpo">
                    <p className="c-tiempo__titulo">
                      {evento.autor && <b>{evento.autor} </b>}
                      {evento.titulo}
                    </p>
                    {evento.detalle && <div className="c-tiempo__detalle">{evento.detalle}</div>}
                  </div>
                  <time className="c-tiempo__hora" dateTime={aFecha(evento.fecha).toISOString()}>{hora(evento.fecha)}</time>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      {alCargarMas && <Boton className="c-tiempo__mas" variante="discreto" tamano="chico" cargando={cargando} onClick={alCargarMas}>{t.mas}</Boton>}
    </div>
  );
}

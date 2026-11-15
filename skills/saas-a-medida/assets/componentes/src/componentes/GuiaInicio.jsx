// 27 · Guía de inicio. Los primeros pasos de una cuenta nueva: una lista corta que se va tachando sola
// y que se puede ocultar. Cinco pasos como mucho. Referencias: Stripe (activar la cuenta), Linear, Shopify.
import { Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { Boton } from './base.jsx';
import { cx, useControlado, useEnVista } from './interno.js';
import './GuiaInicio.css';

/** @param titulo    «Primeros pasos»
    @param pasos     [{ id, titulo, detalle?, hecho, accion?: { texto, alPulsar }, omitir?: { texto, alPulsar } }]
                     `hecho` lo decide la app (el paso se marca al hacerse, no al pulsar aquí)
    @param abierto   id del paso desplegado, si lo controlas tú. Por defecto, el primero sin hacer
    @param alAbrir   (id | null) => void
    @param alOcultar () => void. Si llega, pinta el aspa para quitar la guía
    @param textos    { de, listo, ocultar } */
export function GuiaInicio({ titulo = 'Primeros pasos', pasos, abierto, alAbrir, alOcultar, textos, className }) {
  const t = { de: 'de', listo: 'Todo listo', ocultar: 'Ocultar', ...textos };
  const id = useId();
  const caja = useRef(null);
  const visto = useEnVista(caja);
  const hechos = pasos.filter((p) => p.hecho).length;
  const pendiente = pasos.find((p) => !p.hecho)?.id ?? null;
  const [desplegado, setDesplegado] = useControlado(abierto, pendiente, alAbrir);
  const completa = hechos === pasos.length;

  // Al completar un paso se abre el siguiente que falte
  const anteriores = useRef(hechos);
  useEffect(() => {
    if (hechos !== anteriores.current) { anteriores.current = hechos; setDesplegado(pendiente); }
  }, [hechos, pendiente, setDesplegado]);

  return (
    <section ref={caja} className={cx('c-guia', className)} data-completa={completa || undefined} aria-labelledby={`${id}-t`}>
      <header className="c-guia__cabecera">
        <svg className="c-guia__anillo" viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="15" />
          <circle cx="18" cy="18" r="15" pathLength="100" strokeDasharray={`${visto ? (hechos / pasos.length) * 100 : 0} 100`} />
          <path d="M12 18.5l4 4 8-9" pathLength="1" />
        </svg>
        <div className="c-guia__titulos">
          <h2 id={`${id}-t`}>{titulo}</h2>
          <p role="status">{completa ? t.listo : `${hechos} ${t.de} ${pasos.length}`}</p>
        </div>
        {alOcultar && (
          <button type="button" className="c-guia__ocultar" aria-label={t.ocultar} title={t.ocultar} onClick={alOcultar}><X aria-hidden="true" /></button>
        )}
      </header>
      <ol className="c-guia__pasos">
        {pasos.map((paso) => {
          const actual = desplegado === paso.id;
          const conPanel = Boolean(paso.detalle || paso.accion || paso.omitir);
          return (
            <li key={paso.id} className="c-guia__paso" data-hecho={paso.hecho || undefined} data-abierto={actual || undefined}>
              <button
                type="button"
                className="c-guia__fila"
                aria-expanded={conPanel ? actual : undefined}
                aria-controls={conPanel ? `${id}-${paso.id}` : undefined}
                onClick={() => conPanel && setDesplegado(actual ? null : paso.id)}
              >
                <span className="c-guia__marca" aria-hidden="true"><Check /></span>
                <span className="c-guia__nombre">{paso.titulo}</span>
                <span className="oculto-accesible">{paso.hecho ? ' (hecho)' : ' (pendiente)'}</span>
                {conPanel && <ChevronDown className="c-guia__flecha" aria-hidden="true" />}
              </button>
              {conPanel && (
                <div id={`${id}-${paso.id}`} className="c-guia__panel" inert={!actual}>
                  <div>
                    {paso.detalle && <p>{paso.detalle}</p>}
                    {(paso.accion || paso.omitir) && !paso.hecho && (
                      <div className="c-guia__acciones">
                        {paso.accion && <Boton variante="principal" tamano="chico" onClick={paso.accion.alPulsar}>{paso.accion.texto}</Boton>}
                        {paso.omitir && <Boton variante="discreto" tamano="chico" onClick={paso.omitir.alPulsar}>{paso.omitir.texto}</Boton>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

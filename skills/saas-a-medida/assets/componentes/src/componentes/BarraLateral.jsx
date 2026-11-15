// 01 · Barra lateral. La navegación principal de la app, con grupos, contadores y plegado.
// Plegada deja solo los iconos; el nombre sale al pasar el ratón. Referencias: Linear, Vercel, Notion.
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useRef } from 'react';
import { cx, useControlado, useEfectoDeMaqueta } from './interno.js';
import './BarraLateral.css';

/** @param grupos    [{ titulo?, elementos: [{ id, texto, icono, contador?, href? }] }]
    @param activo    id del apartado abierto
    @param alElegir  (id, elemento) => void
    @param plegada   controla el plegado desde fuera; sin ella lo lleva el componente (`plegadaInicial`)
    @param alPlegar  (plegada) => void, para guardar la preferencia
    @param cabecera  nodo fijo arriba: el logo o el <SelectorEspacio />
    @param pie       nodo fijo abajo: la persona conectada, el plan…
    Tamaños: --lateral-ancho (248px) y --lateral-plegado (60px). */
export function BarraLateral({
  grupos, activo, alElegir, plegada, plegadaInicial = false, alPlegar, cabecera, pie,
  etiqueta = 'Principal', textos, className, ...resto
}) {
  const t = { plegar: 'Plegar menú', desplegar: 'Desplegar menú', ...textos };
  const [cerrada, setCerrada] = useControlado(plegada, plegadaInicial, alPlegar);
  const nav = useRef(null);

  // Una sola pastilla marca el apartado abierto y se desliza de uno a otro
  useEfectoDeMaqueta(() => {
    const caja = nav.current;
    const actual = caja.querySelector('[aria-current="page"]');
    if (!actual) { caja.removeAttribute('data-con-activo'); return; }
    caja.style.setProperty('--ind-y', `${actual.offsetTop}px`);
    caja.style.setProperty('--ind-h', `${actual.offsetHeight}px`);
    caja.setAttribute('data-con-activo', '');
    // La primera vez se coloca sin animar; después, se desliza
    requestAnimationFrame(() => caja.setAttribute('data-medido', ''));
  }, [activo, grupos]);

  return (
    <aside className={cx('c-lateral', className)} data-plegada={cerrada || undefined} {...resto}>
      {cabecera && <div className="c-lateral__cabecera">{cabecera}</div>}
      <nav ref={nav} className="c-lateral__nav" aria-label={etiqueta}>
        <span className="c-lateral__indicador" aria-hidden="true" />
        {grupos.map((grupo, g) => (
          <div key={grupo.titulo ?? g} className="c-lateral__grupo" role="group" aria-label={grupo.titulo}>
            {grupo.titulo && <div className="c-lateral__titulo" aria-hidden="true"><span>{grupo.titulo}</span></div>}
            {grupo.elementos.map((el) => {
              const Como = el.href ? 'a' : 'button';
              const Icono = el.icono;
              return (
                <Como
                  key={el.id}
                  {...(el.href ? { href: el.href } : { type: 'button' })}
                  className="c-lateral__elemento"
                  aria-current={el.id === activo ? 'page' : undefined}
                  title={cerrada ? el.texto : undefined}
                  onClick={() => alElegir?.(el.id, el)}
                >
                  <span className="c-lateral__icono">
                    {Icono && <Icono aria-hidden="true" />}
                    {el.contador > 0 && <span className="c-lateral__punto" aria-hidden="true" />}
                  </span>
                  <span className="c-lateral__texto">{el.texto}</span>
                  {el.contador > 0 && <span className="c-lateral__contador">{el.contador > 99 ? '99+' : el.contador}</span>}
                </Como>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="c-lateral__pie">
        {pie && <div className="c-lateral__pie-contenido">{pie}</div>}
        <button
          type="button"
          className="c-lateral__plegar"
          aria-expanded={!cerrada}
          aria-label={cerrada ? t.desplegar : t.plegar}
          title={cerrada ? t.desplegar : t.plegar}
          onClick={() => setCerrada(!cerrada)}
        >
          {cerrada ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
        </button>
      </div>
    </aside>
  );
}

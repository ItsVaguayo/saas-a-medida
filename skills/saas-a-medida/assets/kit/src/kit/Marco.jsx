// 35 · Marco. El armazón de la app: lateral con la navegación, cabecera con el título y las acciones, y el contenido.
// El lateral se pliega a una tira de iconos y lo recuerda. Cuando el espacio es estrecho pasa a ser un panel
// que se abre con el botón de menú. Se adapta al ancho de su contenedor, no al de la ventana.
import { Menu as IconoMenu, PanelLeft, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, Boton } from './base.jsx';
import { useAlmacen } from './hooks.js';
import { Pista } from './Pista.jsx';
import { cx } from './interno.js';
import './Marco.css';

const ESTRECHO = 760;

/** @param marca       nodo con el logo y el nombre. Plegado se ve solo su primer hijo (el logo)
    @param navegacion  [{ rotulo, elementos: [{ id, texto, icono, contador, href }] }]
    @param actual      id del elemento abierto
    @param alNavegar   (id) => void
    @param titulo      título de la pantalla
    @param acciones    botones a la derecha de la cabecera. La acción principal, la última
    @param usuario     { nombre, detalle, foto }
    @param clave       nombre con el que se recuerda si el lateral está plegado */
export function Marco({ marca, navegacion, actual, alNavegar, titulo, acciones, usuario, clave = 'kit:lateral-plegado', children, className }) {
  const raiz = useRef(null);
  const [plegado, setPlegado] = useAlmacen(clave, false);
  const [estrecho, setEstrecho] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (typeof ResizeObserver !== 'function') return undefined;
    const observador = new ResizeObserver(([e]) => setEstrecho(e.contentRect.width < ESTRECHO));
    observador.observe(raiz.current);
    return () => observador.disconnect();
  }, []);
  useEffect(() => { if (!estrecho) setAbierto(false); }, [estrecho]);
  useEffect(() => {
    if (!abierto) return undefined;
    const tecla = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [abierto]);

  const tira = plegado && !estrecho;
  const ir = (e, elemento) => {
    if (!elemento.href) e.preventDefault();
    alNavegar?.(elemento.id);
    setAbierto(false);
  };

  return (
    <div className={cx('k-marco', className)} ref={raiz} data-plegado={tira || undefined} data-estrecho={estrecho || undefined} data-abierto={abierto || undefined}>
      <a className="k-marco__saltar" href="#k-contenido">Saltar al contenido</a>
      {estrecho && <div className="k-marco__velo" onClick={() => setAbierto(false)} />}

      <aside className="k-marco__lateral" inert={estrecho && !abierto}>
        <div className="k-marco__marca">
          {marca}
          {estrecho && <Boton variante="discreto" tamano="chico" icono={X} aria-label="Cerrar menú" onClick={() => setAbierto(false)} />}
        </div>
        <nav className="k-marco__nav" aria-label="Principal">
          {navegacion.map((grupo, g) => (
            <div key={grupo.rotulo ?? g} className="k-marco__grupo">
              {grupo.rotulo && <div className="k-marco__rotulo">{grupo.rotulo}</div>}
              {grupo.elementos.map((el) => {
                return (
                  <a
                    key={el.id}
                    href={el.href ?? '#'}
                    className="k-marco__enlace"
                    aria-current={el.id === actual ? 'page' : undefined}
                    aria-label={tira ? el.texto : undefined}
                    title={tira ? el.texto : undefined}
                    onClick={(e) => ir(e, el)}
                  >
                    {el.icono && <el.icono aria-hidden="true" />}
                    <span className="k-marco__texto">{el.texto}</span>
                    {el.contador > 0 && <span className="k-marco__contador">{el.contador > 99 ? '99+' : el.contador}</span>}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
        {usuario && (
          <div className="k-marco__usuario">
            <Avatar nombre={usuario.nombre} foto={usuario.foto} lado={32} />
            <div className="k-marco__texto">
              <strong>{usuario.nombre}</strong>
              {usuario.detalle && <span>{usuario.detalle}</span>}
            </div>
          </div>
        )}
      </aside>

      <div className="k-marco__principal">
        <header className="k-marco__cabecera">
          {estrecho
            ? <Boton variante="discreto" icono={IconoMenu} aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto(true)} />
            : (
              <Pista texto={plegado ? 'Desplegar lateral' : 'Plegar lateral'} lado="abajo">
                <Boton variante="discreto" icono={PanelLeft} aria-label={plegado ? 'Desplegar lateral' : 'Plegar lateral'} aria-pressed={plegado} onClick={() => setPlegado(!plegado)} />
              </Pista>
            )}
          <h1 className="k-marco__titulo">{titulo}</h1>
          {acciones && <div className="k-marco__acciones">{acciones}</div>}
        </header>
        <main className="k-marco__contenido" id="k-contenido" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}

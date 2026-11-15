// 31 · Barra de cristal. Navegación que flota sobre una foto o un degradado: panel translúcido que se
// encoge a una columna de iconos, con buscador, ramas desplegables, interruptores y la persona conectada.
// Siempre lleva texto claro, así que pide un fondo oscuro o con imagen detrás. Referencias: Arc, Raycast, visionOS.
import { ChevronLeft, ChevronUp, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from './base.jsx';
import { cx, normalizar, useControlado } from './interno.js';
import './BarraCristal.css';

/** @param grupos    [{ titulo?, elementos: [{ id, texto, icono, contador?, urgente?, aviso?, href?,
                       hijos?: [{ id, texto, color?, href? }] }] }]
                     `urgente` pinta el contador con el acento; `aviso` deja un punto sin número.
                     Un elemento con `hijos` abre y cierra su rama; no se elige.
    @param activo    id del apartado o del hijo abierto
    @param alElegir  (id, elemento) => void
    @param plegada   controla el plegado desde fuera; sin ella lo lleva el componente (`plegadaInicial`)
    @param alPlegar  (plegada) => void, para guardar la preferencia
    @param logo      nodo dentro del círculo de marca
    @param nombre    nombre del producto, y `detalle` la línea de debajo
    @param buscador  filtra los apartados al escribir; `false` lo quita
    @param atajos    escucha ⌘K (o Ctrl K) para buscar y «[» para plegar; `false` lo apaga
    @param ajustes   interruptores del pie: [{ id, texto, icono, activo, alCambiar }]
    @param usuario   { nombre, detalle, foto?, enLinea?, alPulsar? }
    Tamaños y color: --cristal-ancho (264px), --cristal-plegado (68px), --cristal-acento, --cristal-desenfoque. */
export function BarraCristal({
  grupos, activo, alElegir, plegada, plegadaInicial = false, alPlegar,
  logo, nombre, detalle, buscador = true, atajos = true, ajustes, usuario,
  etiqueta = 'Principal', textos, className, ...resto
}) {
  const t = {
    plegar: 'Plegar menú', desplegar: 'Desplegar menú', buscar: 'Buscar', atajo: '⌘K', vacio: 'Sin resultados', ...textos,
  };
  const [cerrada, setCerrada] = useControlado(plegada, plegadaInicial, alPlegar);
  const [consulta, setConsulta] = useState('');
  const [ramas, setRamas] = useState({});
  const [pista, setPista] = useState(null);
  const raiz = useRef(null);
  const campo = useRef(null);

  const termino = normalizar(consulta);
  const coincide = (texto) => !termino || normalizar(texto).includes(termino);
  const contieneActivo = (el) => el.hijos?.some((h) => h.id === activo);
  const ramaAbierta = (el) => !cerrada && (termino ? true : ramas[el.id] ?? (el.abierta ?? contieneActivo(el)));

  const visibles = grupos
    .map((grupo) => ({
      ...grupo,
      elementos: grupo.elementos
        .map((el) => ({ ...el, hijosVisibles: el.hijos?.filter((h) => coincide(h.texto)) }))
        .filter((el) => coincide(el.texto) || el.hijosVisibles?.length),
    }))
    .filter((grupo) => grupo.elementos.length);

  const plegar = (valor) => {
    setCerrada(valor);
    setPista(null);
    if (valor) setConsulta('');
  };
  const buscar = () => {
    if (cerrada) plegar(false);
    campo.current?.focus();
  };

  // Atajos: ⌘K busca, «[» pliega. El corchete no se roba a quien está escribiendo
  const vivo = useRef({});
  vivo.current = { cerrada, plegar, buscar };
  useEffect(() => {
    if (!atajos) return undefined;
    const tecla = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (!buscador) return;
        e.preventDefault();
        vivo.current.buscar();
      } else if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = e.target;
        if (el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
        vivo.current.plegar(!vivo.current.cerrada);
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [atajos, buscador]);

  // Plegada, el nombre sale en un globo al lado del icono
  const mostrar = (e, texto, extra) => {
    if (!cerrada || !raiz.current) return;
    const caja = raiz.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setPista({ texto, extra, y: r.top - caja.top + r.height / 2 });
  };
  const globo = (texto, extra) => ({
    onPointerEnter: (e) => { if (e.pointerType !== 'touch') mostrar(e, texto, extra); },
    onPointerLeave: () => setPista(null),
    onFocus: (e) => mostrar(e, texto, extra),
    onBlur: () => setPista(null),
  });

  const elegir = (el) => {
    if (el.hijos && !cerrada) {
      setRamas((r) => ({ ...r, [el.id]: !ramaAbierta(el) }));
      return;
    }
    if (el.hijos) setRamas((r) => ({ ...r, [el.id]: true }));
    alElegir?.(el.id, el);
  };

  const teclaBuscador = (e) => {
    if (e.key === 'Escape') {
      setConsulta('');
      e.currentTarget.blur();
    } else if (e.key === 'Enter') {
      const primero = raiz.current?.querySelector('.c-cristal__nav :is(.c-cristal__elemento:not([data-rama]), .c-cristal__hijo)');
      if (primero) { primero.click(); primero.focus(); }
    }
  };

  const contador = (el) => (el.contador > 0 ? (
    <span className="c-cristal__contador" data-urgente={el.urgente || undefined}>{el.contador > 99 ? '99+' : el.contador}</span>
  ) : null);

  return (
    <aside ref={raiz} className={cx('c-cristal', className)} data-plegada={cerrada || undefined} {...resto}>
      <button
        type="button"
        className="c-cristal__plegar"
        aria-expanded={!cerrada}
        aria-label={cerrada ? t.desplegar : t.plegar}
        onClick={() => plegar(!cerrada)}
      >
        <ChevronLeft aria-hidden="true" />
      </button>

      <div className="c-cristal__panel">
        {(logo || nombre) && (
          <div className="c-cristal__marca">
            <span className="c-cristal__logo">{logo}</span>
            <span className="c-cristal__nombre c-cristal__texto">
              <b>{nombre}</b>
              {detalle && <span>{detalle}</span>}
            </span>
          </div>
        )}

        {buscador && (
          <label className="c-cristal__buscador" onClick={buscar} {...globo(t.buscar, <kbd>{t.atajo}</kbd>)}>
            <Search aria-hidden="true" />
            <input
              ref={campo}
              className="c-cristal__texto"
              type="text"
              value={consulta}
              placeholder={t.buscar}
              aria-label={t.buscar}
              autoComplete="off"
              tabIndex={cerrada ? -1 : undefined}
              onChange={(e) => setConsulta(e.target.value)}
              onKeyDown={teclaBuscador}
            />
            <kbd className="c-cristal__texto">{t.atajo}</kbd>
          </label>
        )}

        <nav className="c-cristal__nav" aria-label={etiqueta} onScroll={() => setPista(null)}>
          {visibles.map((grupo, g) => (
            <div key={grupo.titulo ?? g} className="c-cristal__grupo" role="group" aria-label={grupo.titulo}>
              {grupo.titulo && <div className="c-cristal__titulo" aria-hidden="true"><span className="c-cristal__texto">{grupo.titulo}</span></div>}
              {grupo.elementos.map((el) => {
                const Como = el.href && !el.hijos ? 'a' : 'button';
                const Icono = el.icono;
                const abierta = el.hijos ? ramaAbierta(el) : undefined;
                const marcado = el.id === activo || (el.hijos && !abierta && contieneActivo(el));
                return (
                  <div key={el.id} className="c-cristal__fila">
                    <Como
                      {...(Como === 'a' ? { href: el.href } : { type: 'button' })}
                      className="c-cristal__elemento"
                      data-rama={el.hijos ? '' : undefined}
                      data-marcado={marcado || undefined}
                      aria-current={el.id === activo ? 'page' : undefined}
                      aria-expanded={abierta}
                      onClick={() => elegir(el)}
                      {...globo(el.texto, contador(el))}
                    >
                      <span className="c-cristal__icono">
                        {Icono && <Icono aria-hidden="true" />}
                        {(el.contador > 0 || el.aviso) && <span className="c-cristal__punto" aria-hidden="true" />}
                      </span>
                      <span className="c-cristal__rotulo c-cristal__texto">{el.texto}</span>
                      <span className="c-cristal__cola c-cristal__texto">
                        {contador(el)}
                        {el.aviso && !(el.contador > 0) && <span className="c-cristal__aviso" aria-hidden="true" />}
                        {el.hijos && <ChevronUp className="c-cristal__flecha" aria-hidden="true" />}
                      </span>
                    </Como>
                    {el.hijos && (
                      <div className="c-cristal__rama" data-abierta={abierta || undefined} inert={!abierta}>
                        <div>
                          {el.hijosVisibles.map((h) => {
                            const ComoHijo = h.href ? 'a' : 'button';
                            return (
                              <ComoHijo
                                key={h.id}
                                {...(h.href ? { href: h.href } : { type: 'button' })}
                                className="c-cristal__hijo"
                                aria-current={h.id === activo ? 'page' : undefined}
                                onClick={() => alElegir?.(h.id, h)}
                              >
                                <i style={h.color ? { '--color': h.color } : undefined} aria-hidden="true" />
                                {h.texto}
                              </ComoHijo>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {buscador && termino && visibles.length === 0 && <p className="c-cristal__vacio" role="status">{t.vacio}</p>}
        </nav>

        {(ajustes?.length > 0 || usuario) && (
          <div className="c-cristal__pie">
            {ajustes?.map((a) => {
              const Icono = a.icono;
              return (
                <button
                  key={a.id}
                  type="button"
                  role="switch"
                  aria-checked={Boolean(a.activo)}
                  className="c-cristal__elemento"
                  onClick={() => a.alCambiar?.(!a.activo)}
                  {...globo(a.texto)}
                >
                  <span className="c-cristal__icono">{Icono && <Icono aria-hidden="true" />}</span>
                  <span className="c-cristal__rotulo c-cristal__texto">{a.texto}</span>
                  <span className="c-cristal__interruptor c-cristal__texto" aria-hidden="true" />
                </button>
              );
            })}
            {usuario && (
              <button type="button" className="c-cristal__usuario" onClick={usuario.alPulsar} {...globo(usuario.nombre)}>
                <span className="c-cristal__avatar" data-en-linea={usuario.enLinea || undefined}>
                  <Avatar nombre={usuario.nombre} foto={usuario.foto} lado={36} />
                </span>
                <span className="c-cristal__nombre c-cristal__texto">
                  <b>{usuario.nombre}</b>
                  {usuario.detalle && <span>{usuario.detalle}</span>}
                </span>
                <ChevronsUpDown className="c-cristal__flecha c-cristal__texto" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="c-cristal__pista" data-visible={pista ? '' : undefined} style={pista ? { top: pista.y } : undefined} aria-hidden="true">
        {pista && <><span>{pista.texto}</span>{pista.extra}</>}
      </div>
    </aside>
  );
}

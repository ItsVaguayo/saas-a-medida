// 03 · Selector de espacio. Cambiar de empresa, sede o cuenta sin salir de la app.
// Con más de seis espacios aparece un buscador. Referencias: Vercel, Linear, Slack.
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { Avatar } from './base.jsx';
import { cx, moverFoco, normalizar, useEfectoDeMaqueta, useFuera, useSitio } from './interno.js';
import './SelectorEspacio.css';

/** @param espacios  [{ id, nombre, detalle?, foto? }]  `detalle` es el plan, la sede o el rol
    @param valor     id del espacio abierto
    @param alCambiar (id, espacio) => void
    @param alCrear   () => void. Si llega, se añade «Nuevo espacio» al pie
    @param compacto  solo el emblema, para la barra lateral plegada */
export function SelectorEspacio({ espacios, valor, alCambiar, alCrear, compacto, alinear = 'inicio', textos, className }) {
  const t = { etiqueta: 'Cambiar de espacio', buscar: 'Buscar espacio', nuevo: 'Nuevo espacio', sinResultados: 'Ningún espacio coincide', ...textos };
  const id = useId();
  const raiz = useRef(null);
  const panel = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState('');
  const sitio = useSitio(abierto, raiz, panel, alinear);
  const actual = espacios.find((e) => e.id === valor) ?? espacios[0];
  const conBuscador = espacios.length > 6;
  const visibles = useMemo(() => {
    const q = normalizar(consulta);
    return q ? espacios.filter((e) => normalizar(`${e.nombre} ${e.detalle ?? ''}`).includes(q)) : espacios;
  }, [espacios, consulta]);

  const cerrar = (devolverFoco = true) => {
    setAbierto(false);
    setConsulta('');
    if (devolverFoco) raiz.current?.querySelector('.c-espacio__boton')?.focus();
  };
  useFuera(raiz, abierto, (e) => cerrar(e.type === 'keydown'));

  useEfectoDeMaqueta(() => {
    if (!abierto) return;
    (panel.current.querySelector('input') ?? panel.current.querySelector('[aria-selected="true"]') ?? panel.current.querySelector('[role="option"]'))?.focus();
  }, [abierto]);

  const elegir = (espacio) => {
    cerrar();
    if (espacio.id !== valor) alCambiar?.(espacio.id, espacio);
  };

  return (
    <div className={cx('c-espacio', compacto && 'c-espacio--compacto', className)} ref={raiz}>
      <button
        type="button"
        className="c-espacio__boton"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? `${id}-lista` : undefined}
        aria-label={`${t.etiqueta}: ${actual?.nombre ?? ''}`}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !abierto) { e.preventDefault(); setAbierto(true); } }}
      >
        <Avatar nombre={actual?.nombre} foto={actual?.foto} forma="cuadrado" lado={28} />
        <span className="c-espacio__nombre">
          <span>{actual?.nombre}</span>
          {actual?.detalle && <small>{actual.detalle}</small>}
        </span>
        <ChevronsUpDown className="c-espacio__flechas" aria-hidden="true" />
      </button>

      {abierto && (
        <div
          ref={panel}
          className="c-flotante c-espacio__panel"
          data-arriba={sitio.arriba || undefined}
          data-alinear={sitio.alinear}
          onKeyDown={(e) => {
            if (e.key === 'Tab') { cerrar(false); return; }
            // Desde el buscador, la flecha abajo baja a la lista
            if (e.target.tagName === 'INPUT' && e.key !== 'ArrowDown') return;
            moverFoco(e, panel.current, '[role="option"], .c-espacio__nuevo');
          }}
        >
          {conBuscador && (
            <label className="c-espacio__buscador">
              <Search aria-hidden="true" />
              <input
                type="search"
                value={consulta}
                placeholder={t.buscar}
                aria-label={t.buscar}
                onChange={(e) => setConsulta(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && visibles.length) elegir(visibles[0]); }}
              />
            </label>
          )}
          <div id={`${id}-lista`} role="listbox" aria-label={t.etiqueta} className="c-espacio__lista">
            {visibles.map((espacio) => (
              <button
                key={espacio.id}
                type="button"
                role="option"
                aria-selected={espacio.id === valor}
                tabIndex={-1}
                className="c-espacio__opcion"
                onClick={() => elegir(espacio)}
              >
                <Avatar nombre={espacio.nombre} foto={espacio.foto} forma="cuadrado" lado={24} />
                <span className="c-espacio__nombre">
                  <span>{espacio.nombre}</span>
                  {espacio.detalle && <small>{espacio.detalle}</small>}
                </span>
                <Check className="c-espacio__marca" aria-hidden="true" />
              </button>
            ))}
            {visibles.length === 0 && <p className="c-espacio__vacio">{t.sinResultados}</p>}
          </div>
          {alCrear && (
            <button type="button" className="c-espacio__nuevo" tabIndex={-1} onClick={() => { cerrar(); alCrear(); }}>
              <span className="c-espacio__mas"><Plus aria-hidden="true" /></span>
              {t.nuevo}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

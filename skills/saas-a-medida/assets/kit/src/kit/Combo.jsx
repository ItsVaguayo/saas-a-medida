// 21 · Combo. Un desplegable en el que se escribe para encontrar la opción. Para listas largas (clientes,
// municipios, artículos) donde un <select> obliga a recorrerlo entero. Con `multiple`, elige varias.
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { cx, normalizar, useEfectoDeMaqueta, useFuera } from './interno.js';
import './Combo.css';

/** @param opciones  [{ valor, texto, detalle }]
    @param valor     el valor elegido, o una lista de valores con `multiple`
    @param alCambiar (valor) => void
    @param vacio     texto cuando la búsqueda no encuentra nada */
export function Combo({ etiqueta, opciones, valor, alCambiar, multiple = false, marcador = 'Elegir…', error, ayuda, vacio = 'Sin resultados', className }) {
  const id = useId();
  const raiz = useRef(null);
  const campo = useRef(null);
  const lista = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState('');
  const [activo, setActivo] = useState(0);

  const elegidos = multiple ? valor ?? [] : valor === null || valor === undefined || valor === '' ? [] : [valor];
  const elegida = multiple ? null : opciones.find((o) => o.valor === valor);
  const visibles = useMemo(() => {
    const q = normalizar(consulta);
    return q ? opciones.filter((o) => normalizar(`${o.texto} ${o.detalle ?? ''}`).includes(q)) : opciones;
  }, [opciones, consulta]);

  const cerrar = useCallback(() => { setAbierto(false); setConsulta(''); }, []);
  useFuera(raiz, abierto, cerrar);

  const abrir = () => {
    if (abierto) return;
    setAbierto(true);
    setActivo(Math.max(0, opciones.findIndex((o) => elegidos.includes(o.valor))));
  };

  useEfectoDeMaqueta(() => {
    if (abierto) lista.current?.querySelector('[data-activo]')?.scrollIntoView?.({ block: 'nearest' });
  }, [activo, abierto]);

  const elegir = (opcion) => {
    if (!opcion) return;
    if (multiple) {
      alCambiar(elegidos.includes(opcion.valor) ? elegidos.filter((v) => v !== opcion.valor) : [...elegidos, opcion.valor]);
      setConsulta('');
      return;
    }
    alCambiar(opcion.valor);
    cerrar();
  };

  const tecla = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!abierto) { abrir(); return; }
      const n = Math.max(1, visibles.length);
      setActivo((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
    } else if (e.key === 'Enter' && abierto) {
      e.preventDefault();
      elegir(visibles[activo]);
    } else if (e.key === 'Backspace' && multiple && !consulta && elegidos.length) {
      alCambiar(elegidos.slice(0, -1));
    } else if (e.key === 'Tab') {
      cerrar();
    }
  };

  const resumen = multiple
    ? elegidos.length === 0 ? '' : elegidos.length === 1 ? opciones.find((o) => o.valor === elegidos[0])?.texto ?? '' : `${elegidos.length} elegidos`
    : elegida?.texto ?? '';
  const descritoPor = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('k-campo k-combo', className)} ref={raiz}>
      <label className="k-campo__etiqueta" htmlFor={id}>{etiqueta}</label>
      <div className="k-combo__caja">
        <input
          ref={campo}
          id={id}
          className="k-control"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={abierto && visibles[activo] ? `${id}-o-${activo}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritoPor}
          autoComplete="off"
          placeholder={resumen || marcador}
          data-con-valor={resumen ? '' : undefined}
          value={abierto ? consulta : resumen}
          onChange={(e) => { setConsulta(e.target.value); setActivo(0); setAbierto(true); }}
          onClick={abrir}
          onKeyDown={tecla}
        />
        {elegidos.length > 0 && !abierto ? (
          <button type="button" className="k-combo__quitar" aria-label={`Quitar ${etiqueta}`} onClick={() => { alCambiar(multiple ? [] : null); campo.current.focus(); }}>
            <X aria-hidden="true" />
          </button>
        ) : <ChevronsUpDown className="k-combo__flecha" aria-hidden="true" />}
      </div>
      {abierto && (
        <ul className="k-flotante k-combo__lista" data-alinear="inicio" id={`${id}-lista`} role="listbox" aria-label={etiqueta} aria-multiselectable={multiple || undefined} ref={lista}>
          {visibles.length === 0 && <li className="k-combo__vacio" role="presentation">{vacio}</li>}
          {visibles.map((o, i) => {
            const marcada = elegidos.includes(o.valor);
            return (
              <li
                key={o.valor}
                id={`${id}-o-${i}`}
                role="option"
                aria-selected={marcada}
                data-activo={i === activo ? '' : undefined}
                className="k-combo__opcion"
                // Sin esto, el clic le quita el foco al campo antes de elegir
                onPointerDown={(e) => e.preventDefault()}
                onPointerMove={() => i !== activo && setActivo(i)}
                onClick={() => elegir(o)}
              >
                <span className="k-combo__texto">
                  {o.texto}
                  {o.detalle && <small>{o.detalle}</small>}
                </span>
                <Check className="k-combo__marca" aria-hidden="true" />
              </li>
            );
          })}
        </ul>
      )}
      {ayuda && !error && <span id={`${id}-ayuda`} className="k-campo__ayuda">{ayuda}</span>}
      {error && <span id={`${id}-error`} className="k-campo__error">{error}</span>}
    </div>
  );
}

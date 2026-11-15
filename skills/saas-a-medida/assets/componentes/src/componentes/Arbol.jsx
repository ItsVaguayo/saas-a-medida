// 06 · Árbol. Carpetas, categorías o cualquier cosa que cuelgue de otra. Se recorre entero con el teclado:
// arriba y abajo para moverse, derecha para abrir, izquierda para cerrar o subir al padre.
// Referencias: VS Code, Notion, el patrón «tree view» de WAI-ARIA.
import { ChevronRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { cx, useControlado } from './interno.js';
import './Arbol.css';

/** Lista plana de lo que se ve ahora, con su padre: es lo que recorren las flechas. */
function aplanar(nodos, abiertos, padre = null, salida = []) {
  for (const nodo of nodos) {
    salida.push({ nodo, padre });
    if (nodo.hijos?.length && abiertos.includes(nodo.id)) aplanar(nodo.hijos, abiertos, nodo.id, salida);
  }
  return salida;
}

/** @param nodos        [{ id, texto, icono?, extra?, hijos?: [...] }]  `extra` es un nodo a la derecha (un recuento)
    @param seleccionado id elegido, si lo controlas tú; si no, `seleccionadoInicial`
    @param alElegir     (id, nodo) => void
    @param abiertos     ids desplegados, si los controlas tú; si no, `abiertosIniciales`
    @param alAbrir      (ids) => void
    Sangría por nivel: --arbol-sangria (16px). */
export function Arbol({
  nodos, seleccionado, seleccionadoInicial = null, alElegir, abiertos, abiertosIniciales = [], alAbrir,
  etiqueta, className,
}) {
  const [elegido, setElegido] = useControlado(seleccionado, seleccionadoInicial);
  const [desplegados, setDesplegados] = useControlado(abiertos, abiertosIniciales, alAbrir);
  const visibles = useMemo(() => aplanar(nodos, desplegados), [nodos, desplegados]);
  const [foco, setFoco] = useState(null);
  const filas = useRef({});
  // Solo una fila entra en el orden del tabulador: la elegida o, si no hay, la primera
  const conFoco = visibles.some((v) => v.nodo.id === foco) ? foco : (visibles.find((v) => v.nodo.id === elegido) ?? visibles[0])?.nodo.id;

  const alternar = (id) => setDesplegados((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  const irA = (id) => { setFoco(id); filas.current[id]?.focus(); };
  const elegir = (nodo) => {
    setElegido(nodo.id);
    setFoco(nodo.id);
    if (nodo.hijos?.length) alternar(nodo.id);
    alElegir?.(nodo.id, nodo);
  };

  const alTeclear = (e) => {
    const i = visibles.findIndex((v) => v.nodo.id === conFoco);
    if (i === -1) return;
    const { nodo, padre } = visibles[i];
    const conHijos = nodo.hijos?.length > 0;
    const abierto = desplegados.includes(nodo.id);
    const hacer = {
      ArrowDown: () => visibles[i + 1] && irA(visibles[i + 1].nodo.id),
      ArrowUp: () => visibles[i - 1] && irA(visibles[i - 1].nodo.id),
      ArrowRight: () => { if (conHijos && !abierto) alternar(nodo.id); else if (conHijos) irA(nodo.hijos[0].id); },
      ArrowLeft: () => { if (conHijos && abierto) alternar(nodo.id); else if (padre !== null) irA(padre); },
      Home: () => irA(visibles[0].nodo.id),
      End: () => irA(visibles[visibles.length - 1].nodo.id),
      Enter: () => elegir(nodo),
      ' ': () => elegir(nodo),
    }[e.key];
    if (!hacer) return;
    e.preventDefault();
    hacer();
  };

  const pintar = (lista, nivel) => lista.map((nodo) => {
    const conHijos = nodo.hijos?.length > 0;
    const abierto = conHijos && desplegados.includes(nodo.id);
    const Icono = nodo.icono;
    return (
      <li
        key={nodo.id}
        ref={(el) => { filas.current[nodo.id] = el; }}
        role="treeitem"
        aria-level={nivel}
        aria-expanded={conHijos ? abierto : undefined}
        aria-selected={nodo.id === elegido}
        tabIndex={nodo.id === conFoco ? 0 : -1}
        className="c-arbol__nodo"
        onFocus={(e) => { if (e.target === e.currentTarget) setFoco(nodo.id); }}
      >
        <div className="c-arbol__fila" style={{ '--nivel': nivel - 1 }} onClick={() => elegir(nodo)}>
          <ChevronRight className="c-arbol__flecha" data-oculta={!conHijos || undefined} aria-hidden="true" />
          {Icono && <Icono className="c-arbol__icono" aria-hidden="true" />}
          <span className="c-arbol__texto">{nodo.texto}</span>
          {nodo.extra !== undefined && <span className="c-arbol__extra">{nodo.extra}</span>}
        </div>
        {conHijos && (
          <div className="c-arbol__hijos" data-abierto={abierto || undefined}>
            <ul role="group" inert={!abierto}>{pintar(nodo.hijos, nivel + 1)}</ul>
          </div>
        )}
      </li>
    );
  });

  return (
    <ul role="tree" aria-label={etiqueta} className={cx('c-arbol', className)} onKeyDown={alTeclear}>
      {pintar(nodos, 1)}
    </ul>
  );
}

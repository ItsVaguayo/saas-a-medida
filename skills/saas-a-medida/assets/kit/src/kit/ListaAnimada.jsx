// 12 · ListaAnimada. Una lista cuyos elementos se deslizan a su sitio cuando se añaden, se quitan o cambian de orden.
// Así se ve qué ha pasado: la fila que sube al ordenar, el hueco que se cierra al borrar.
//
// Técnica: antes de pintar se compara dónde estaba cada elemento con dónde está ahora, se le coloca con una
// transformación en el sitio viejo y se anima hasta cero (FLIP). Solo se anima `transform` y `opacity`.
import { useRef, useState } from 'react';
import { cx, sinMovimiento, useEfectoDeMaqueta } from './interno.js';

const SALIDA = 180;
const MOVER = { duration: 280, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };

/** @param elementos lista de datos
    @param clave     (elemento) => identificador estable
    @param children  (elemento) => contenido de la fila
    @param como      etiqueta del contenedor ('ul' por defecto); cada fila es un 'li' o un 'div' */
const ENTRADA = [{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }];

/** @param entrada   fotogramas con los que entra un elemento nuevo (por defecto, crece un poco y funde)
    @param sinSalida lo que se quita desaparece al momento, sin desvanecerse (para cuando se está arrastrando) */
export function ListaAnimada({ elementos, clave, children, como: Como = 'ul', entrada = ENTRADA, sinSalida = false, className, ...resto }) {
  const caja = useRef(null);
  const sitios = useRef(new Map());
  const previos = useRef(elementos);
  const montado = useRef(false);
  // Lo que se acaba de quitar sigue pintado un momento para poder desvanecerse
  const [fantasmas, setFantasmas] = useState([]);

  useEfectoDeMaqueta(() => {
    const vivos = new Set(elementos.map(clave));
    const idos = previos.current
      .map((dato, indice) => ({ dato, k: clave(dato), indice }))
      .filter((x) => !vivos.has(x.k));
    previos.current = elementos;
    if (!idos.length || sinSalida || sinMovimiento()) return;
    setFantasmas((f) => [...f.filter((x) => !vivos.has(x.k)), ...idos]);
    setTimeout(() => setFantasmas((f) => f.filter((x) => !idos.includes(x))), SALIDA);
  }, [elementos]);

  useEfectoDeMaqueta(() => {
    const nuevos = new Map();
    const animar = montado.current && !sinMovimiento();
    for (const nodo of caja.current.children) {
      const k = nodo.dataset.k;
      const ahora = nodo.getBoundingClientRect();
      nuevos.set(k, ahora);
      if (!animar || !nodo.animate || nodo.dataset.saliendo !== undefined) continue;
      const antes = sitios.current.get(k);
      if (!antes) {
        nodo.animate(entrada, MOVER);
      } else {
        const dx = antes.left - ahora.left;
        const dy = antes.top - ahora.top;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          nodo.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], MOVER);
        }
      }
    }
    sitios.current = nuevos;
    montado.current = true;
  });

  const filas = elementos.map((dato) => ({ dato, k: clave(dato) }));
  [...fantasmas].sort((a, b) => a.indice - b.indice).forEach((f) => {
    if (!filas.some((x) => x.k === f.k)) filas.splice(Math.min(f.indice, filas.length), 0, { ...f, fuera: true });
  });
  const Fila = Como === 'ul' || Como === 'ol' ? 'li' : 'div';

  return (
    <Como ref={caja} className={cx('k-lista-animada', className)} {...resto}>
      {filas.map(({ dato, k, fuera }) => (
        <Fila
          key={k}
          data-k={k}
          data-saliendo={fuera ? '' : undefined}
          aria-hidden={fuera || undefined}
          style={fuera ? { opacity: 0, transform: 'scale(0.96)', transition: `opacity ${SALIDA}ms, transform ${SALIDA}ms`, pointerEvents: 'none' } : undefined}
        >
          {children(dato)}
        </Fila>
      ))}
    </Como>
  );
}

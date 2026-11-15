// Piezas internas que comparten varios módulos. No forman parte de la API pública.
import { useEffect, useLayoutEffect } from 'react';

/** Une clases, saltándose lo que no sea texto: cx('a', cond && 'b'). */
export const cx = (...clases) => clases.filter(Boolean).join(' ');

/** La persona ha pedido menos movimiento en su sistema. */
export const sinMovimiento = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Minúsculas y sin tildes, para comparar búsquedas: «Gómez» coincide con «gomez». */
export const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/** useLayoutEffect que no protesta al renderizar en el servidor. */
export const useEfectoDeMaqueta = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Cierra algo flotante al pulsar fuera de `ref` o al pulsar Escape. */
export function useFuera(ref, activo, alSalir) {
  useEffect(() => {
    if (!activo) return undefined;
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) alSalir(e); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); alSalir(e); } };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [ref, activo, alSalir]);
}

/** Mide el hijo marcado como activo y deja su posición en --ind-x y --ind-w del contenedor.
    Con eso el CSS mueve una sola raya o pastilla de un sitio a otro (pestañas, segmentado). */
export function useIndicador(ref, dependencia) {
  useEfectoDeMaqueta(() => {
    const caja = ref.current;
    if (!caja) return undefined;
    const medir = () => {
      const activo = caja.querySelector('[aria-selected="true"], [aria-checked="true"]');
      if (!activo) return;
      caja.style.setProperty('--ind-x', `${activo.offsetLeft}px`);
      caja.style.setProperty('--ind-w', `${activo.offsetWidth}px`);
      // La primera medida se coloca sin animar; a partir de ahí, se desliza
      requestAnimationFrame(() => caja.setAttribute('data-medido', ''));
    };
    medir();
    if (typeof ResizeObserver !== 'function') return undefined;
    const observador = new ResizeObserver(medir);
    observador.observe(caja);
    return () => observador.disconnect();
  }, [ref, dependencia]);
}

/** Mueve el foco entre los hijos que cumplen `selector` con las flechas, Inicio y Fin. */
export function moverFoco(evento, contenedor, selector, { horizontal = false } = {}) {
  const [antes, despues] = horizontal ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
  if (![antes, despues, 'Home', 'End'].includes(evento.key)) return false;
  const lista = [...contenedor.querySelectorAll(selector)].filter((el) => !el.disabled);
  if (!lista.length) return false;
  const i = lista.indexOf(document.activeElement);
  const destino = {
    [despues]: lista[(i + 1) % lista.length],
    [antes]: lista[(i - 1 + lista.length) % lista.length],
    Home: lista[0],
    End: lista[lista.length - 1],
  }[evento.key];
  evento.preventDefault();
  destino.focus();
  return true;
}

// Piezas internas que comparten varios componentes. No forman parte de la API pública.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Une clases, saltándose lo que no sea texto: cx('a', cond && 'b'). */
export const cx = (...clases) => clases.filter(Boolean).join(' ');

export const limitar = (n, min, max) => Math.min(max, Math.max(min, n));

/** La persona ha pedido menos movimiento en su sistema. */
export const sinMovimiento = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Minúsculas y sin tildes, para comparar búsquedas: «Gómez» coincide con «gomez». */
export const normalizar = (texto) =>
  String(texto ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

/** useLayoutEffect que no protesta al renderizar en el servidor. */
export const useEfectoDeMaqueta = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Un tono (0-359) fijo para cada texto: la misma persona o espacio sale siempre del mismo color. */
export function tonoDe(texto) {
  let suma = 0;
  for (const letra of String(texto ?? '')) suma = (suma * 31 + letra.codePointAt(0)) % 360;
  return suma;
}

/** Estado que puede llevar el componente o quien lo usa. Si llega `valor`, manda quien lo usa;
    si no, el componente lo guarda y avisa igual con `alCambiar`. */
export function useControlado(valor, inicial, alCambiar) {
  const [propio, setPropio] = useState(inicial);
  const controlado = valor !== undefined;
  const actual = controlado ? valor : propio;
  const ref = useRef(actual);
  ref.current = actual;
  const aviso = useRef(alCambiar);
  aviso.current = alCambiar;
  const fijar = useCallback((nuevo) => {
    const siguiente = typeof nuevo === 'function' ? nuevo(ref.current) : nuevo;
    if (Object.is(siguiente, ref.current)) return;
    ref.current = siguiente;
    if (!controlado) setPropio(siguiente);
    aviso.current?.(siguiente);
  }, [controlado]);
  return [actual, fijar];
}

/** Cierra algo flotante al pulsar fuera de `ref` o al pulsar Escape. */
export function useFuera(ref, activo, alSalir) {
  const fn = useRef(alSalir);
  fn.current = alSalir;
  useEffect(() => {
    if (!activo) return undefined;
    const fuera = (e) => { if (ref.current && !ref.current.contains(e.target)) fn.current(e); };
    const tecla = (e) => { if (e.key === 'Escape') { e.stopPropagation(); fn.current(e); } };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [ref, activo]);
}

/** Dónde abrir un panel flotante: hacia arriba si abajo no cabe, y alineado con el otro borde si se sale. */
export function useSitio(abierto, raiz, panel, alinear = 'inicio') {
  const [sitio, setSitio] = useState({ arriba: false, alinear });
  useEfectoDeMaqueta(() => {
    if (!abierto || !raiz.current || !panel.current) return;
    const p = panel.current.getBoundingClientRect();
    const b = raiz.current.getBoundingClientRect();
    const arriba = b.bottom + p.height + 8 > window.innerHeight && b.top - p.height - 8 > 0;
    let lado = alinear;
    if (alinear === 'fin' && b.right - p.width < 8) lado = 'inicio';
    if (alinear === 'inicio' && b.left + p.width > window.innerWidth - 8) lado = 'fin';
    setSitio({ arriba, alinear: lado });
  }, [abierto, alinear]);
  return sitio;
}

/** Mantiene algo montado mientras dura su animación de salida.
    @returns {{ montado, saliendo }}  `saliendo` se pasa a `data-saliendo` y el CSS hace el resto */
export function usePresencia(visible, ms = 200) {
  const [dentro, setDentro] = useState(visible);
  useEffect(() => {
    if (visible) { setDentro(true); return undefined; }
    if (sinMovimiento()) { setDentro(false); return undefined; }
    const t = setTimeout(() => setDentro(false), ms);
    return () => clearTimeout(t);
  }, [visible, ms]);
  return { montado: visible || dentro, saliendo: !visible && dentro };
}

/** Lleva una cifra hasta `valor` frenando al final. Si `valor` cambia a mitad de camino,
    sigue desde donde iba: no vuelve a empezar ni da saltos. */
export function useCifra(valor, ms = 800) {
  const [pintado, setPintado] = useState(valor);
  const desde = useRef(valor);
  useEffect(() => {
    const inicio = desde.current;
    if (inicio === valor || sinMovimiento() || typeof requestAnimationFrame !== 'function') {
      desde.current = valor;
      setPintado(valor);
      return undefined;
    }
    let cuadro;
    const t0 = performance.now();
    const paso = (t) => {
      const p = limitar((t - t0) / ms, 0, 1);
      const actual = p === 1 ? valor : inicio + (valor - inicio) * (1 - (1 - p) ** 4);
      desde.current = actual;
      setPintado(actual);
      if (p < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, ms]);
  return pintado;
}

/** `true` desde que el elemento asoma en pantalla (una sola vez). Los gráficos lo usan
    para animar su entrada cuando se ven, no cuando se montan fuera de la vista. */
export function useEnVista(ref) {
  const [visto, setVisto] = useState(() => typeof IntersectionObserver !== 'function');
  useEffect(() => {
    if (visto || !ref.current) return undefined;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) { setVisto(true); observador.disconnect(); }
    }, { threshold: 0.2 });
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [ref, visto]);
  return visto;
}

/** Ancho real del elemento, al día cuando cambia. Sin ResizeObserver devuelve `porDefecto`. */
export function useAncho(ref, porDefecto = 0) {
  const [ancho, setAncho] = useState(porDefecto);
  useEfectoDeMaqueta(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver !== 'function') return undefined;
    const medir = () => setAncho(el.clientWidth || porDefecto);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref, porDefecto]);
  return ancho;
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

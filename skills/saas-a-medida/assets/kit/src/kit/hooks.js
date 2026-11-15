// Funciones del kit (02 a 07). Cada una resuelve un problema que se repite en todas las apps de gestión
// y que mal resuelto da fallos difíciles de ver: respuestas viejas que pisan a las nuevas, filtros que se
// pierden al recargar, preferencias que no se guardan, dobles envíos.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

/* ── 02 · useBusqueda ───────────────────────────────────────────────────────── */

/** Devuelve `valor` cuando lleva `ms` sin cambiar. */
export function useRetraso(valor, ms = 300) {
  const [quieto, setQuieto] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setQuieto(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return quieto;
}

/** Búsqueda mientras se escribe. Espera a que la persona pare y descarta las respuestas de búsquedas
    anteriores: sin eso, una respuesta lenta llega tarde y pisa la buena.
    @param buscar (texto, { signal }) => Promise<resultados>
    @returns {{ texto, setTexto, resultados, estado: 'reposo'|'cargando'|'listo'|'error', error, reintentar }} */
export function useBusqueda(buscar, { espera = 300, minimo = 0, inicial = '' } = {}) {
  const [texto, setTexto] = useState(inicial);
  const [intento, setIntento] = useState(0);
  const [salida, setSalida] = useState({ estado: 'reposo', resultados: [], error: null });
  const quieto = useRetraso(texto, espera);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    const consulta = quieto.trim();
    if (consulta.length < minimo) {
      setSalida({ estado: 'reposo', resultados: [], error: null });
      return undefined;
    }
    const corte = new AbortController();
    setSalida((s) => ({ ...s, estado: 'cargando', error: null }));
    Promise.resolve()
      .then(() => buscarRef.current(consulta, { signal: corte.signal }))
      .then((resultados) => { if (!corte.signal.aborted) setSalida({ estado: 'listo', resultados, error: null }); })
      .catch((error) => { if (!corte.signal.aborted) setSalida({ estado: 'error', resultados: [], error }); });
    return () => corte.abort();
  }, [quieto, minimo, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);
  // Mientras la persona sigue escribiendo ya se sabe que lo pintado está viejo
  const estado = texto !== quieto && texto.trim().length >= minimo ? 'cargando' : salida.estado;
  return { texto, setTexto, ...salida, estado, reintentar };
}

/* ── 03 · useEstadoUrl ──────────────────────────────────────────────────────── */

const EVENTO_URL = 'kit:url';
const oirUrl = (avisar) => {
  window.addEventListener('popstate', avisar);
  window.addEventListener(EVENTO_URL, avisar);
  return () => {
    window.removeEventListener('popstate', avisar);
    window.removeEventListener(EVENTO_URL, avisar);
  };
};

/** Estado guardado en la dirección: filtros, página, pestaña o registro abierto. Recargar, el botón atrás
    y mandar el enlace a un compañero enseñan lo mismo. El valor por defecto no ensucia la URL.
    @returns [valor, fijar(nuevo, { historial })]  Con `historial: true` el cambio se puede deshacer con «atrás». */
export function useEstadoUrl(clave, porDefecto = '') {
  const leer = useCallback(() => new URLSearchParams(window.location.search).get(clave) ?? porDefecto, [clave, porDefecto]);
  const valor = useSyncExternalStore(oirUrl, leer, () => porDefecto);
  const fijar = useCallback((nuevo, { historial = false } = {}) => {
    const url = new URL(window.location.href);
    if (nuevo === null || nuevo === undefined || nuevo === '' || String(nuevo) === String(porDefecto)) url.searchParams.delete(clave);
    else url.searchParams.set(clave, String(nuevo));
    window.history[historial ? 'pushState' : 'replaceState'](window.history.state, '', url);
    window.dispatchEvent(new Event(EVENTO_URL));
  }, [clave, porDefecto]);
  return [valor, fijar];
}

/* ── 04 · useAlmacen ────────────────────────────────────────────────────────── */

const EVENTO_ALMACEN = 'kit:almacen';
const oirAlmacen = (avisar) => {
  window.addEventListener('storage', avisar);
  window.addEventListener(EVENTO_ALMACEN, avisar);
  return () => {
    window.removeEventListener('storage', avisar);
    window.removeEventListener(EVENTO_ALMACEN, avisar);
  };
};
const leerAlmacen = (clave) => {
  try { return window.localStorage.getItem(clave); } catch { return null; }
};

/** Preferencia guardada en el navegador (lateral plegado, columnas visibles, tema). Se mantiene igual en
    todas las pestañas abiertas, y si el navegador no deja guardar (modo privado) funciona en memoria.
    @returns [valor, fijar(nuevo | (anterior) => nuevo)] */
export function useAlmacen(clave, inicial) {
  const crudo = useSyncExternalStore(oirAlmacen, () => leerAlmacen(clave), () => null);
  const valor = useMemo(() => {
    if (crudo === null) return inicial;
    try { return JSON.parse(crudo); } catch { return inicial; }
    // `inicial` suele ser un literal nuevo en cada render: no debe recalcular
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crudo]);
  const valorRef = useRef(valor);
  valorRef.current = valor;
  const fijar = useCallback((nuevo) => {
    const siguiente = typeof nuevo === 'function' ? nuevo(valorRef.current) : nuevo;
    try {
      if (siguiente === undefined) window.localStorage.removeItem(clave);
      else window.localStorage.setItem(clave, JSON.stringify(siguiente));
    } catch { /* sin almacenamiento: el cambio no se guarda, pero la app sigue */ }
    window.dispatchEvent(new Event(EVENTO_ALMACEN));
  }, [clave]);
  return [valor, fijar];
}

/* ── 05 · useAtajo ──────────────────────────────────────────────────────────── */

export const esMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const enCampo = (el) => el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/** ¿El evento de teclado es el atajo «mod+k», «shift+?», «escape»…? `mod` es ⌘ en Mac y Ctrl en el resto. */
export function coincideAtajo(evento, atajo, mac = esMac()) {
  const partes = atajo.toLowerCase().split('+');
  const tecla = partes.pop();
  const quiere = (m) => partes.includes(m);
  const mod = mac ? evento.metaKey : evento.ctrlKey;
  return (
    evento.key.toLowerCase() === tecla
    && mod === quiere('mod')
    && evento.altKey === quiere('alt')
    // Con «?» o «/» la mayúscula ya va dentro de la tecla: solo se exige si el atajo la nombra
    && (quiere('shift') ? evento.shiftKey : tecla.length > 1 || /[a-z0-9]/.test(tecla) ? !evento.shiftKey : true)
  );
}

/** Atajo de teclado global. Las teclas sueltas («n», «/») no saltan mientras se escribe en un campo. */
export function useAtajo(atajo, alPulsar, { activo = true, enCampos } = {}) {
  const fn = useRef(alPulsar);
  fn.current = alPulsar;
  useEffect(() => {
    if (!activo) return undefined;
    const conModificador = /mod\+|alt\+/.test(atajo.toLowerCase());
    const oir = (e) => {
      if (!coincideAtajo(e, atajo)) return;
      if (enCampo(e.target) && !(enCampos ?? conModificador)) return;
      e.preventDefault();
      fn.current(e);
    };
    window.addEventListener('keydown', oir);
    return () => window.removeEventListener('keydown', oir);
  }, [atajo, activo, enCampos]);
}

/** «mod+k» → ['⌘', 'K'] en Mac y ['Ctrl', 'K'] en el resto, para pintarlo con <Teclas>. */
export function teclasDe(atajo, mac = esMac()) {
  const nombres = { mod: mac ? '⌘' : 'Ctrl', shift: mac ? '⇧' : 'Mayús', alt: mac ? '⌥' : 'Alt', enter: '↵', escape: 'Esc', arrowup: '↑', arrowdown: '↓' };
  return atajo.toLowerCase().split('+').map((p) => nombres[p] ?? p.toUpperCase());
}

/* ── 06 · useCopiar ─────────────────────────────────────────────────────────── */

/** Copia un texto al portapapeles y lo recuerda un momento para poder decir «Copiado».
    @returns [copiado, copiar(texto) => Promise<boolean>] */
export function useCopiar({ duracion = 1800 } = {}) {
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef();
  useEffect(() => () => clearTimeout(temporizador.current), []);
  const copiar = useCallback(async (texto) => {
    try {
      await navigator.clipboard.writeText(String(texto));
    } catch {
      return false;
    }
    setCopiado(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCopiado(false), duracion);
    return true;
  }, [duracion]);
  return [copiado, copiar];
}

/* ── 07 · useSeleccion ──────────────────────────────────────────────────────── */

/** Selección de filas con casillas. Con Mayús pulsada se marca el tramo entero desde la última fila tocada,
    como en Gmail. Si la lista cambia (otra página, otro filtro), lo que ya no está deja de contar.
    @param ids  los identificadores visibles, en su orden */
export function useSeleccion(ids) {
  const [marcados, setMarcados] = useState(() => new Set());
  const ultimo = useRef(null);
  const seleccion = useMemo(() => new Set(ids.filter((id) => marcados.has(id))), [ids, marcados]);

  const alternar = useCallback((id, evento) => {
    setMarcados((previos) => {
      const siguiente = new Set(previos);
      const marcar = !previos.has(id);
      const desde = ids.indexOf(ultimo.current);
      const hasta = ids.indexOf(id);
      const tramo = evento?.shiftKey && desde !== -1 && hasta !== -1
        ? ids.slice(Math.min(desde, hasta), Math.max(desde, hasta) + 1)
        : [id];
      tramo.forEach((x) => (marcar ? siguiente.add(x) : siguiente.delete(x)));
      ultimo.current = id;
      return siguiente;
    });
  }, [ids]);

  const todos = useCallback(() => setMarcados(new Set(ids)), [ids]);
  const ninguno = useCallback(() => { setMarcados(new Set()); ultimo.current = null; }, []);
  const estado = seleccion.size === 0 ? 'ninguno' : seleccion.size === ids.length ? 'todos' : 'algunos';
  return { seleccion, estado, esta: (id) => seleccion.has(id), alternar, todos, ninguno };
}

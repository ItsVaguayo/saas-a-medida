// 15 · TransicionVista. Cambiar de vista con continuidad: lo viejo funde a lo nuevo y lo que comparte
// nombre entre las dos vistas (una tarjeta que pasa a ser ficha) se desplaza de su sitio viejo al nuevo.
// Usa la API de transiciones de vista del navegador; donde no existe, el cambio ocurre igual, sin animar.
import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { cx, sinMovimiento } from './interno.js';
import './TransicionVista.css';

/** Devuelve `cambiar(fn)`: ejecuta `fn` (un cambio de estado) dentro de una transición de vista.
    @example const cambiar = useTransicionVista(); cambiar(() => setAbierto(cliente.id)); */
export function useTransicionVista() {
  return useCallback((cambio) => {
    if (typeof document === 'undefined' || !document.startViewTransition || sinMovimiento()) {
      cambio();
      return;
    }
    // flushSync: el navegador necesita que la pantalla nueva esté pintada al salir de esta función
    document.startViewTransition(() => flushSync(cambio));
  }, []);
}

/** Marca un elemento para que viaje entre dos vistas. El mismo `nombre` tiene que estar una sola vez en pantalla.
    El nombre solo admite letras, números y guiones. */
export function Viajero({ nombre, como: Como = 'div', style, ...resto }) {
  return <Como style={{ ...style, viewTransitionName: nombre }} {...resto} />;
}

/** Alternativa sin la API: al cambiar `clave`, el contenido nuevo entra con un fundido corto.
    @param sentido 'adelante' | 'atras' | 'nada': de qué lado entra */
export function Fundido({ clave, sentido = 'nada', className, children }) {
  return <div key={clave} className={cx('k-fundido', className)} data-sentido={sentido}>{children}</div>;
}

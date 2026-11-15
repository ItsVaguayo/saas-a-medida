// 08 · Aparecer. El contenido entra con un desplazamiento corto la primera vez que se ve.
// Sirve para lo que llega (una tarjeta recién cargada, una sección al bajar), no para lo que ya estaba.
import { Children, useEffect, useRef, useState } from 'react';
import { cx } from './interno.js';
import './Aparecer.css';

/** @param desde   'abajo' | 'arriba' | 'izquierda' | 'derecha' | 'nada' (solo opacidad)
    @param retraso milisegundos antes de entrar
    @param alVerse true: espera a que entre en pantalla; false: entra al montarse */
export function Aparecer({ desde = 'abajo', retraso = 0, alVerse = true, como: Como = 'div', className, style, children, ...resto }) {
  const ref = useRef(null);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    if (!alVerse || typeof IntersectionObserver !== 'function') {
      // Un fotograma de margen para que el navegador pinte antes el estado de salida
      const f = requestAnimationFrame(() => setVisto(true));
      return () => cancelAnimationFrame(f);
    }
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) { setVisto(true); observador.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [alVerse]);

  return (
    <Como
      ref={ref}
      className={cx('k-aparecer', className)}
      data-desde={desde}
      data-visto={visto || undefined}
      style={{ ...style, '--retraso': `${retraso}ms` }}
      {...resto}
    >
      {children}
    </Como>
  );
}

/** Hace entrar a sus hijos uno detrás de otro. Con más de `tope` hijos, el resto entra a la vez:
    una lista de cuarenta filas no puede tardar dos segundos en terminar de aparecer. */
export function Escalonado({ paso = 45, tope = 8, desde = 'abajo', alVerse = true, children }) {
  return Children.toArray(children).map((hijo, i) => (
    <Aparecer key={hijo.key ?? i} desde={desde} alVerse={alVerse} retraso={Math.min(i, tope) * paso}>
      {hijo}
    </Aparecer>
  ));
}

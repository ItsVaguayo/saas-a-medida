// 05 · Paneles divididos. Dos zonas con una raya que se arrastra: lista y detalle, editor y vista previa.
// La raya también se mueve con las flechas, y con doble clic vuelve a su sitio. Referencias: VS Code, Linear, Figma.
import { useRef, useState } from 'react';
import { cx, limitar, useControlado } from './interno.js';
import './PanelesDivididos.css';

/** @param primero, segundo  los dos contenidos
    @param orientacion  'horizontal' (uno al lado del otro) | 'vertical' (uno encima del otro)
    @param tamano       % que ocupa el primero, si lo controlas tú; si no, `tamanoInicial`
    @param minimo, maximo  topes del primero, en %
    @param alCambiar    (tamano) => void, para guardar la preferencia */
export function PanelesDivididos({
  primero, segundo, orientacion = 'horizontal', tamano, tamanoInicial = 50, minimo = 20, maximo = 80,
  alCambiar, etiqueta = 'Cambiar el tamaño de los paneles', className, style,
}) {
  const [parte, setParte] = useControlado(tamano, tamanoInicial, alCambiar);
  const [arrastrando, setArrastrando] = useState(false);
  const caja = useRef(null);
  const horizontal = orientacion === 'horizontal';
  const fijar = (n) => setParte(limitar(Math.round(n * 10) / 10, minimo, maximo));

  const desdePuntero = (e) => {
    const r = caja.current.getBoundingClientRect();
    fijar(horizontal ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100);
  };

  const alTeclear = (e) => {
    const salto = e.shiftKey ? 10 : 2;
    const [menos, mas] = horizontal ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
    const destino = { [menos]: parte - salto, [mas]: parte + salto, Home: minimo, End: maximo }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    fijar(destino);
  };

  return (
    <div
      ref={caja}
      className={cx('c-paneles', `c-paneles--${orientacion}`, className)}
      data-arrastrando={arrastrando || undefined}
      style={{ '--parte': `${parte}%`, ...style }}
    >
      <div className="c-paneles__panel">{primero}</div>
      <div
        role="separator"
        tabIndex={0}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-valuenow={Math.round(parte)}
        aria-valuemin={minimo}
        aria-valuemax={maximo}
        aria-label={etiqueta}
        className="c-paneles__raya"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.setPointerCapture?.(e.pointerId);
          e.currentTarget.focus();
          setArrastrando(true);
        }}
        onPointerMove={(e) => { if (arrastrando) desdePuntero(e); }}
        onPointerUp={() => setArrastrando(false)}
        onPointerCancel={() => setArrastrando(false)}
        onDoubleClick={() => fijar(tamanoInicial)}
        onKeyDown={alTeclear}
      />
      <div className="c-paneles__panel">{segundo}</div>
    </div>
  );
}

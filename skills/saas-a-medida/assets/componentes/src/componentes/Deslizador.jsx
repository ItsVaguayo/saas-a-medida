// 22 · Deslizador. Elegir una cantidad o un tramo arrastrando: usuarios del plan, rango de precios, umbral
// de una alerta. Con un número mueve un mando; con [desde, hasta], dos. Referencias: Radix Slider, Stripe, Airbnb.
import { useRef, useState } from 'react';
import { numero } from './formato.js';
import { cx, limitar, useControlado } from './interno.js';
import './Deslizador.css';

/** @param valor      número o [desde, hasta], si lo controlas tú; si no, `valorInicial`
    @param alCambiar  (valor) => void, mientras se arrastra
    @param alSoltar   (valor) => void, al terminar: para guardar o pedir datos una sola vez
    @param min, max, paso
    @param formato    (n) => texto del globo y de las marcas: (n) => `${n} €`
    @param marcas     [0, 25, 50, 100], valores con una marca y su rótulo bajo la pista
    @param etiqueta   nombre del control. En un tramo, `etiquetas` nombra cada mando */
export function Deslizador({
  valor, valorInicial, alCambiar, alSoltar, min = 0, max = 100, paso = 1, formato = numero, marcas,
  etiqueta, etiquetas = ['Desde', 'Hasta'], deshabilitado, className,
}) {
  const [actual, setActual] = useControlado(valor, valorInicial ?? min, alCambiar);
  const tramo = Array.isArray(actual);
  const valores = tramo ? actual : [actual];
  const al = useRef(valores);
  al.current = valores;
  const pista = useRef(null);
  const mandos = useRef([]);
  const [arrastrando, setArrastrando] = useState(null);
  const parte = (n) => ((n - min) / (max - min || 1)) * 100;
  const decimales = (String(paso).split('.')[1] ?? '').length;
  const ajustar = (n) => Number(limitar(Math.round((n - min) / paso) * paso + min, min, max).toFixed(decimales));

  const fijar = (i, n) => {
    const v = ajustar(n);
    if (!tramo) { setActual(v); return v; }
    // Un mando no pasa por encima del otro
    const siguiente = i === 0 ? [Math.min(v, al.current[1]), al.current[1]] : [al.current[0], Math.max(v, al.current[0])];
    if (siguiente[0] !== al.current[0] || siguiente[1] !== al.current[1]) setActual(siguiente);
    return siguiente;
  };
  const desdePuntero = (e) => {
    const r = pista.current.getBoundingClientRect();
    return min + limitar((e.clientX - r.left) / r.width, 0, 1) * (max - min);
  };
  const soltar = () => {
    if (arrastrando === null) return;
    setArrastrando(null);
    alSoltar?.(tramo ? al.current : al.current[0]);
  };

  const alTeclear = (e, i) => {
    const grande = Math.max(paso, (max - min) / 10);
    const n = valores[i];
    const destino = {
      ArrowRight: n + paso, ArrowUp: n + paso, ArrowLeft: n - paso, ArrowDown: n - paso,
      PageUp: n + grande, PageDown: n - grande, Home: min, End: max,
    }[e.key];
    if (destino === undefined) return;
    e.preventDefault();
    const nuevo = fijar(i, destino);
    alSoltar?.(nuevo);
  };

  return (
    <div className={cx('c-deslizador', className)} data-deshabilitado={deshabilitado || undefined} data-arrastrando={arrastrando !== null || undefined} data-con-marcas={marcas ? '' : undefined}>
      <div
        ref={pista}
        className="c-deslizador__pista"
        onPointerDown={(e) => {
          if (deshabilitado || e.button !== 0) return;
          e.preventDefault();
          const n = desdePuntero(e);
          // Se mueve el mando que quede más cerca del toque
          const i = tramo && Math.abs(n - valores[1]) < Math.abs(n - valores[0]) ? 1 : tramo && n > valores[1] ? 1 : 0;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setArrastrando(i);
          fijar(i, n);
          mandos.current[i]?.focus();
        }}
        onPointerMove={(e) => { if (arrastrando !== null) fijar(arrastrando, desdePuntero(e)); }}
        onPointerUp={soltar}
        onPointerCancel={soltar}
      >
        <span className="c-deslizador__carril" />
        <span className="c-deslizador__relleno" data-borde={tramo ? undefined : ''} style={{ '--desde': `${tramo ? parte(valores[0]) : 0}%`, '--hasta': `${parte(valores[valores.length - 1])}%` }} />
        {marcas?.map((m) => <span key={m} className="c-deslizador__marca" data-dentro={m >= (tramo ? valores[0] : min) && m <= valores[valores.length - 1] ? '' : undefined} style={{ '--x': `${parte(m)}%` }} />)}
        {valores.map((n, i) => (
          <span
            key={i}
            ref={(el) => { mandos.current[i] = el; }}
            role="slider"
            tabIndex={deshabilitado ? -1 : 0}
            aria-label={tramo ? `${etiqueta ? `${etiqueta}: ` : ''}${etiquetas[i]}` : etiqueta}
            aria-valuemin={tramo && i === 1 ? valores[0] : min}
            aria-valuemax={tramo && i === 0 ? valores[1] : max}
            aria-valuenow={n}
            aria-valuetext={formato(n)}
            aria-disabled={deshabilitado || undefined}
            aria-orientation="horizontal"
            className="c-deslizador__mando"
            data-activo={arrastrando === i || undefined}
            style={{ '--x': `${parte(n)}%` }}
            onKeyDown={(e) => alTeclear(e, i)}
          >
            <output className="c-deslizador__globo">{formato(n)}</output>
          </span>
        ))}
      </div>
      {marcas && (
        <div className="c-deslizador__rotulos" aria-hidden="true">
          {marcas.map((m) => <span key={m} style={{ '--x': `${parte(m)}%` }}>{formato(m)}</span>)}
        </div>
      )}
    </div>
  );
}

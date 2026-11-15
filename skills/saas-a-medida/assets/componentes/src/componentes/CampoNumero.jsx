// 23 · Campo numérico. Cantidades que se ajustan de uno en uno: licencias, unidades, días de aviso.
// Se puede escribir, usar las flechas o mantener pulsado un botón, que acelera. Referencias: Stripe (cantidad
// de licencias), Shopify Polaris, React Aria NumberField.
import { Minus, Plus } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { numero } from './formato.js';
import { cx, limitar, sinMovimiento, useControlado } from './interno.js';
import './CampoNumero.css';

/** @param etiqueta  nombre del campo (visible). Sin ella, pasa `aria-label`
    @param valor     si lo controlas tú; si no, `valorInicial`
    @param alCambiar (n) => void
    @param min, max, paso
    @param sufijo    unidad tras la cifra: «usuarios», «€», «días»
    @param ayuda     una línea bajo el campo */
export function CampoNumero({
  etiqueta, valor, valorInicial = 0, alCambiar, min = -Infinity, max = Infinity, paso = 1, sufijo, ayuda,
  deshabilitado, textos, className, ...resto
}) {
  const t = { menos: 'Restar', mas: 'Sumar', ...textos };
  const id = useId();
  const [n, setN] = useControlado(valor, valorInicial, alCambiar);
  const [borrador, setBorrador] = useState(null);
  const entrada = useRef(null);
  const actual = useRef(n);
  actual.current = n;
  const repeticion = useRef();
  useEffect(() => () => clearTimeout(repeticion.current), []);
  const decimales = (String(paso).split('.')[1] ?? '').length;

  const mover = (delta) => {
    const siguiente = Number(limitar(actual.current + delta, min, max).toFixed(decimales));
    if (siguiente === actual.current) return false;
    actual.current = siguiente;
    setBorrador(null);
    setN(siguiente);
    // La cifra entra desde abajo al sumar y desde arriba al restar
    if (!sinMovimiento()) {
      entrada.current?.animate?.(
        [{ transform: `translateY(${delta > 0 ? 7 : -7}px)`, opacity: 0.2, filter: 'blur(1px)' }, { transform: 'none', opacity: 1, filter: 'none' }],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      );
    }
    return true;
  };

  // Mantener pulsado repite, cada vez más rápido
  const empezar = (delta) => (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    mover(delta);
    let espera = 380;
    const seguir = () => {
      if (!mover(delta)) return;
      espera = Math.max(45, espera * 0.82);
      repeticion.current = setTimeout(seguir, espera);
    };
    repeticion.current = setTimeout(seguir, espera);
  };
  const parar = () => clearTimeout(repeticion.current);

  const confirmar = () => {
    if (borrador === null) return;
    // «1.250,5» → 1250.5. Si lo escrito no es un número, se queda el valor que había
    const limpio = borrador.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const leido = Number(limpio);
    setBorrador(null);
    if (/\d/.test(limpio) && !Number.isNaN(leido)) setN(Number(limitar(leido, min, max).toFixed(decimales)));
  };

  const boton = (delta, Icono, texto, tope) => (
    <button
      type="button"
      className="c-numero__boton"
      aria-label={texto}
      tabIndex={-1}
      disabled={deshabilitado || tope}
      onPointerDown={empezar(delta)}
      onPointerUp={parar}
      onPointerLeave={parar}
      onPointerCancel={parar}
      // Con teclado o lector de pantalla el botón se activa sin puntero
      onClick={(e) => { if (e.detail === 0) mover(delta); }}
    >
      <Icono aria-hidden="true" />
    </button>
  );

  return (
    <div className={cx('c-campo c-numero', className)}>
      {etiqueta && <label className="c-campo__etiqueta" htmlFor={id}>{etiqueta}</label>}
      <div className="c-control c-numero__control" data-deshabilitado={deshabilitado || undefined}>
        {boton(-paso, Minus, t.menos, n <= min)}
        <span className="c-numero__centro">
          <input
            ref={entrada}
            id={id}
            role="spinbutton"
            inputMode={decimales ? 'decimal' : 'numeric'}
            autoComplete="off"
            value={borrador ?? numero(n, { decimales })}
            style={{ '--largo': `${String(borrador ?? numero(n, { decimales })).length || 1}ch` }}
            disabled={deshabilitado}
            aria-valuenow={n}
            aria-valuemin={Number.isFinite(min) ? min : undefined}
            aria-valuemax={Number.isFinite(max) ? max : undefined}
            aria-valuetext={sufijo ? `${numero(n, { decimales })} ${sufijo}` : undefined}
            aria-describedby={ayuda ? `${id}-ayuda` : undefined}
            onChange={(e) => setBorrador(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={confirmar}
            onKeyDown={(e) => {
              const delta = { ArrowUp: paso, ArrowDown: -paso, PageUp: paso * 10, PageDown: -paso * 10 }[e.key];
              if (delta) { e.preventDefault(); mover(e.shiftKey ? delta * 10 : delta); }
              if (e.key === 'Enter') confirmar();
              if (e.key === 'Home' && Number.isFinite(min)) { e.preventDefault(); mover(min - actual.current); }
              if (e.key === 'End' && Number.isFinite(max)) { e.preventDefault(); mover(max - actual.current); }
            }}
            {...resto}
          />
          {sufijo && <span className="c-numero__sufijo" aria-hidden="true">{sufijo}</span>}
        </span>
        {boton(paso, Plus, t.mas, n >= max)}
      </div>
      {ayuda && <span id={`${id}-ayuda`} className="c-campo__ayuda">{ayuda}</span>}
    </div>
  );
}

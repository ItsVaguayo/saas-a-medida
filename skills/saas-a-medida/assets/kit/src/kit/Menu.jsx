// 20 · Menú. Las acciones de una fila o de una pantalla detrás de un botón. Se maneja entero con el teclado:
// flechas para moverse, Intro para elegir, Escape para cerrar y volver al botón.
import { Check, Ellipsis } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { Teclas } from './Paleta.jsx';
import { cx, moverFoco, useEfectoDeMaqueta, useFuera } from './interno.js';
import './Menu.css';

/** @param elementos [{ texto, icono, atajo, peligro, deshabilitado, marcado, alElegir } | { separador: true } | { rotulo: 'Texto' }]
                     Con `marcado` (true o false) el elemento es una opción que se elige entre varias.
    @param etiqueta   nombre del botón. Sin `children` el botón es el de los tres puntos y esto es su aria-label
    @param alinear    'inicio' | 'fin': con qué borde del botón se alinea
    @param disparador (props, abierto) => nodo, para usar otro botón. Hay que pasarle `props` */
export function Menu({ elementos, etiqueta = 'Más acciones', alinear = 'fin', icono = Ellipsis, variante = 'discreto', tamano, disparador, children, className }) {
  const id = useId();
  const raiz = useRef(null);
  const lista = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [sitio, setSitio] = useState({ arriba: false, alinear });

  const cerrar = useCallback((devolverFoco = true) => {
    setAbierto(false);
    if (devolverFoco) raiz.current?.querySelector('[aria-haspopup]')?.focus();
  }, []);
  useFuera(raiz, abierto, useCallback((e) => cerrar(e.type === 'keydown'), [cerrar]));

  // Al abrir: si no cabe hacia abajo se abre hacia arriba, y si se sale por un lado se alinea con el otro
  useEfectoDeMaqueta(() => {
    if (!abierto) return;
    const m = lista.current.getBoundingClientRect();
    const b = raiz.current.getBoundingClientRect();
    const arriba = b.bottom + m.height + 8 > window.innerHeight && b.top - m.height - 8 > 0;
    let lado = alinear;
    if (alinear === 'fin' && b.right - m.width < 8) lado = 'inicio';
    if (alinear === 'inicio' && b.left + m.width > window.innerWidth - 8) lado = 'fin';
    setSitio({ arriba, alinear: lado });
    (lista.current.querySelector('[aria-checked="true"]') ?? lista.current.querySelector('[role^="menuitem"]:not(:disabled)'))?.focus();
  }, [abierto, alinear]);

  const props = {
    'aria-haspopup': 'menu',
    'aria-expanded': abierto,
    'aria-controls': abierto ? `${id}-menu` : undefined,
    onClick: () => setAbierto((a) => !a),
    onKeyDown: (e) => { if (e.key === 'ArrowDown' && !abierto) { e.preventDefault(); setAbierto(true); } },
  };

  return (
    <span className={cx('k-menu', className)} ref={raiz}>
      {disparador ? disparador(props, abierto) : (
        <Boton variante={variante} tamano={tamano} icono={icono} aria-label={children ? undefined : etiqueta} {...props}>{children}</Boton>
      )}
      {abierto && (
        <div
          ref={lista}
          id={`${id}-menu`}
          role="menu"
          aria-label={etiqueta}
          className="k-menu__lista"
          data-arriba={sitio.arriba || undefined}
          data-alinear={sitio.alinear}
          onKeyDown={(e) => {
            if (e.key === 'Tab') { cerrar(false); return; }
            moverFoco(e, lista.current, '[role^="menuitem"]');
          }}
        >
          {elementos.map((el, i) => {
            if (el.separador) return <div key={i} role="separator" className="k-menu__separador" />;
            if (el.rotulo) return <div key={i} className="k-menu__rotulo">{el.rotulo}</div>;
            const opcion = el.marcado !== undefined;
            return (
              <button
                key={i}
                type="button"
                role={opcion ? 'menuitemradio' : 'menuitem'}
                aria-checked={opcion ? el.marcado : undefined}
                className="k-menu__elemento"
                data-peligro={el.peligro || undefined}
                disabled={el.deshabilitado}
                tabIndex={-1}
                onClick={() => { cerrar(); el.alElegir?.(); }}
              >
                {opcion ? <Check className="k-menu__marca" aria-hidden="true" /> : el.icono && <el.icono aria-hidden="true" />}
                <span>{el.texto}</span>
                {el.atajo && <Teclas atajo={el.atajo} />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}

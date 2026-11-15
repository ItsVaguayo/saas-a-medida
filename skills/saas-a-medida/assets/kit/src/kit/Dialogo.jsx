// 17 · Diálogo y confirmación. Sobre el <dialog> del navegador: él retiene el foco dentro, cierra con Escape
// y devuelve el foco al botón que lo abrió. Aquí solo se añade el aspecto, el cierre al pulsar fuera y la animación.
import { X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { cx } from './interno.js';
import './Dialogo.css';

/** Abre y cierra un <dialog> modal según `abierto`. Devuelve las props que hay que ponerle.
    Lo usan también el cajón y la paleta de comandos. */
export function useModal(abierto, alCerrar) {
  const ref = useRef(null);
  const bajoEnElVelo = useRef(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) {
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    } else if (!abierto && d.open) {
      if (d.close) d.close(); else d.removeAttribute('open');
    }
  }, [abierto]);

  return {
    ref,
    onClose: () => alCerrar?.(),
    // Solo cierra si el clic empieza y acaba en el velo: arrastrar una selección de texto hacia fuera no cuenta
    onPointerDown: (e) => { bajoEnElVelo.current = e.target === ref.current; },
    onClick: (e) => { if (e.target === ref.current && bajoEnElVelo.current) alCerrar?.(); },
  };
}

/** @param titulo   obligatorio: da nombre al diálogo
    @param detalle  una frase bajo el título
    @param pie      los botones. El principal, el último
    @param ancho    ancho máximo en px */
export function Dialogo({ abierto, alCerrar, titulo, detalle, pie, ancho = 480, sinCerrar, className, children }) {
  const id = useId();
  const modal = useModal(abierto, alCerrar);
  return (
    <dialog {...modal} className={cx('k-dialogo', className)} style={{ '--ancho': `${ancho}px` }} aria-labelledby={`${id}-titulo`} aria-describedby={detalle ? `${id}-detalle` : undefined}>
      <div className="k-dialogo__caja">
        <header className="k-dialogo__cabecera">
          <div>
            <h2 id={`${id}-titulo`}>{titulo}</h2>
            {detalle && <p id={`${id}-detalle`}>{detalle}</p>}
          </div>
          {!sinCerrar && <Boton variante="discreto" tamano="chico" icono={X} aria-label="Cerrar" onClick={alCerrar} />}
        </header>
        {children && <div className="k-dialogo__cuerpo">{children}</div>}
        {pie && <footer className="k-dialogo__pie">{pie}</footer>}
      </div>
    </dialog>
  );
}

/** Confirmación antes de algo que no se deshace. La pregunta nombra lo que se borra, la consecuencia va a la vista
    y el botón lleva el verbo.
    @returns [pedir, elemento]. `await pedir({ titulo, detalle, accion, salida, peligro })` da true o false;
             `elemento` se pinta en cualquier sitio del componente.
    @example const ok = await pedir({ titulo: '¿Eliminar a Laura Gil?', detalle: 'Se borran sus 3 citas futuras', accion: 'Eliminar cliente', peligro: true }); */
export function useConfirmar() {
  const [peticion, setPeticion] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const resolver = useRef(null);

  const pedir = useCallback((opciones) => new Promise((resuelve) => {
    resolver.current = resuelve;
    setPeticion(opciones);
    setAbierto(true);
  }), []);

  const responder = (respuesta) => {
    resolver.current?.(respuesta);
    resolver.current = null;
    setAbierto(false);
  };

  const elemento = (
    <Dialogo
      abierto={abierto}
      alCerrar={() => responder(false)}
      titulo={peticion?.titulo ?? ''}
      detalle={peticion?.detalle}
      ancho={420}
      sinCerrar
      pie={(
        <>
          <Boton onClick={() => responder(false)}>{peticion?.salida ?? 'Volver'}</Boton>
          <Boton variante={peticion?.peligro ? 'peligro' : 'principal'} onClick={() => responder(true)}>{peticion?.accion ?? 'Continuar'}</Boton>
        </>
      )}
    />
  );
  return [pedir, elemento];
}

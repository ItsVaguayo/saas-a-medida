// 24 · Interruptor. Para opciones que se aplican en el momento, sin botón de guardar.
// Cada opción lleva su estado escrito debajo: «24 h antes, por email».
import { useId } from 'react';
import { cx } from './interno.js';
import './Interruptor.css';

/** @param etiqueta nombre de la opción, impersonal: «Recordatorios de cita»
    @param detalle  su estado actual o lo que hace, en una línea
    @param alCambiar (marcado) => void */
export function Interruptor({ marcado, alCambiar, etiqueta, detalle, deshabilitado, className }) {
  const id = useId();
  return (
    <div className={cx('k-interruptor', className)}>
      <div className="k-interruptor__texto">
        <span id={`${id}-e`} className="k-interruptor__etiqueta">{etiqueta}</span>
        {detalle && <span id={`${id}-d`} className="k-interruptor__detalle">{detalle}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={marcado}
        aria-labelledby={`${id}-e`}
        aria-describedby={detalle ? `${id}-d` : undefined}
        disabled={deshabilitado}
        className="k-interruptor__boton"
        onClick={() => alCambiar(!marcado)}
      >
        <span className="k-interruptor__bola" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Grupo de interruptores con rayas entre ellos, para una sección de configuración. */
export const ListaOpciones = ({ children, className }) => <div className={cx('k-opciones', className)}>{children}</div>;

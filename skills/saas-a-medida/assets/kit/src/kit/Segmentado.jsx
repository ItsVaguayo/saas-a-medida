// 23 · Segmentado. Elegir una entre dos a cinco opciones que caben a la vista (Mes/Trimestre/Año, Lista/Tablero).
// La pastilla del elegido se desliza de uno a otro.
import { useRef } from 'react';
import { cx, moverFoco, useIndicador } from './interno.js';
import './Segmentado.css';

/** @param opciones  [{ valor, texto, icono }]. Con icono y sin texto, `etiqueta` de la opción es obligatoria
    @param etiqueta  nombre del grupo para el lector de pantalla */
export function Segmentado({ opciones, valor, alCambiar, etiqueta, tamano, bloque, className }) {
  const caja = useRef(null);
  useIndicador(caja, `${valor}|${opciones.length}`);
  return (
    <div
      ref={caja}
      className={cx('k-segmentado', tamano && `k-segmentado--${tamano}`, bloque && 'k-segmentado--bloque', className)}
      role="radiogroup"
      aria-label={etiqueta}
      onKeyDown={(e) => {
        if (moverFoco(e, caja.current, '[role="radio"]', { horizontal: true })) alCambiar(opciones[Number(document.activeElement.dataset.i)].valor);
      }}
    >
      <span className="k-segmentado__pastilla" aria-hidden="true" />
      {opciones.map((o, i) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          data-i={i}
          aria-checked={o.valor === valor}
          aria-label={o.texto ? undefined : o.etiqueta}
          tabIndex={o.valor === valor ? 0 : -1}
          className="k-segmentado__opcion"
          onClick={() => alCambiar(o.valor)}
        >
          {o.icono && <o.icono aria-hidden="true" />}
          {o.texto}
        </button>
      ))}
    </div>
  );
}

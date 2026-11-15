// 04 · Barra de acciones en lote. Sale por abajo cuando hay filas marcadas y se va cuando no queda ninguna.
// Referencias: Linear, Gmail, Notion.
import { X } from 'lucide-react';
import { useRef } from 'react';
import { cx, usePresencia } from './interno.js';
import './BarraAcciones.css';

/** @param cantidad   cuántos elementos hay marcados. Con 0 la barra se esconde
    @param acciones   [{ texto, icono?, alPulsar, peligro?, deshabilitada? }]
    @param alLimpiar  () => void, quita la selección
    @param flotante   pegada al pie de la ventana (por defecto) o dentro de su contenedor
    @param textos     { uno: 'seleccionado', varios: 'seleccionados', limpiar, etiqueta } */
export function BarraAcciones({ cantidad, acciones = [], alLimpiar, flotante = true, textos, className }) {
  const t = { uno: 'seleccionado', varios: 'seleccionados', limpiar: 'Quitar selección', etiqueta: 'Acciones de la selección', ...textos };
  const { montado, saliendo } = usePresencia(cantidad > 0, 180);
  // Mientras se va sigue enseñando la última cifra, no un «0 seleccionados»
  const ultima = useRef(cantidad);
  if (cantidad > 0) ultima.current = cantidad;
  if (!montado) return null;
  const n = ultima.current;

  return (
    <div className={cx('c-lote', flotante && 'c-lote--flotante', className)} data-saliendo={saliendo || undefined}>
      <div className="c-lote__barra" role="toolbar" aria-label={t.etiqueta}>
        <span className="c-lote__cuenta" role="status">
          <b key={n} className="c-lote__numero">{n}</b> {n === 1 ? t.uno : t.varios}
        </span>
        <span className="c-lote__raya" aria-hidden="true" />
        {acciones.map((accion) => {
          const Icono = accion.icono;
          return (
            <button
              key={accion.texto}
              type="button"
              className="c-lote__boton"
              data-peligro={accion.peligro || undefined}
              disabled={accion.deshabilitada || saliendo}
              onClick={accion.alPulsar}
            >
              {Icono && <Icono aria-hidden="true" />}
              <span>{accion.texto}</span>
            </button>
          );
        })}
        {alLimpiar && (
          <button type="button" className="c-lote__boton c-lote__limpiar" aria-label={t.limpiar} title={t.limpiar} onClick={alLimpiar}>
            <X aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

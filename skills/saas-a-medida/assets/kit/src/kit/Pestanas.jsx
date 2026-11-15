// 22 · Pestañas. Una sola raya que se desliza de una pestaña a otra: deja ver de dónde vienes.
// Flechas para moverse entre pestañas, como manda el patrón de pestañas de WAI-ARIA.
import { useId, useRef } from 'react';
import { cx, moverFoco, useIndicador } from './interno.js';
import './Pestanas.css';

/** @param pestanas  [{ id, texto, icono, contador }]
    @param activa    id de la pestaña abierta
    @param alCambiar (id) => void
    @param etiqueta  nombre del grupo para el lector de pantalla
    @param children  (id) => contenido del panel. Opcional: sin él, solo pinta la barra */
export function Pestanas({ pestanas, activa, alCambiar, etiqueta, children, className }) {
  const base = useId();
  const barra = useRef(null);
  useIndicador(barra, `${activa}|${pestanas.length}`);

  return (
    <div className={cx('k-pestanas', className)}>
      <div
        ref={barra}
        className="k-pestanas__barra"
        role="tablist"
        aria-label={etiqueta}
        onKeyDown={(e) => {
          // Al moverse con las flechas la pestaña se abre sola: los paneles ya están cargados
          if (moverFoco(e, barra.current, '[role="tab"]', { horizontal: true })) alCambiar(document.activeElement.dataset.id);
        }}
      >
        {pestanas.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`${base}-t-${p.id}`}
            data-id={p.id}
            aria-selected={p.id === activa}
            aria-controls={children ? `${base}-panel` : undefined}
            tabIndex={p.id === activa ? 0 : -1}
            className="k-pestanas__pestana"
            onClick={() => alCambiar(p.id)}
          >
            {p.icono && <p.icono aria-hidden="true" />}
            {p.texto}
            {p.contador !== undefined && <span className="k-pestanas__contador">{p.contador}</span>}
          </button>
        ))}
        <span className="k-pestanas__raya" aria-hidden="true" />
      </div>
      {children && (
        <div className="k-pestanas__panel" role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-t-${activa}`} tabIndex={0}>
          {children(activa)}
        </div>
      )}
    </div>
  );
}

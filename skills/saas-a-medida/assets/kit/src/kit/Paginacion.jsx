// 28 · Paginación. Dice qué tramo se está viendo («26–50 de 128») y deja saltar de página.
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Boton } from './base.jsx';
import { numero } from './formato.js';
import { cx } from './interno.js';
import './Paginacion.css';

/** Las páginas que se enseñan: siempre la primera, la última y las vecinas de la actual.
    tramoPaginas(6, 20) → [1, '…', 5, 6, 7, '…', 20] */
export function tramoPaginas(actual, total, vecinas = 1) {
  if (total <= 5 + vecinas * 2) return Array.from({ length: total }, (_, i) => i + 1);
  const desde = Math.max(2, Math.min(actual - vecinas, total - 2 - vecinas * 2));
  const hasta = Math.min(total - 1, Math.max(actual + vecinas, 3 + vecinas * 2));
  const medio = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);
  return [1, ...(desde > 2 ? ['…'] : []), ...medio, ...(hasta < total - 1 ? ['…'] : []), total];
}

/** @param pagina    la actual, empezando en 1
    @param porPagina filas por página
    @param total     filas en total
    @param tamanos   opciones de filas por página. Con `alCambiarTamano`, enseña el selector */
export function Paginacion({ pagina, porPagina, total, alCambiar, tamanos = [25, 50, 100], alCambiarTamano, className }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const hasta = Math.min(total, pagina * porPagina);
  return (
    <nav className={cx('k-paginacion', className)} aria-label="Paginación">
      <p className="k-paginacion__tramo" aria-live="polite">
        <strong>{numero(desde)}–{numero(hasta)}</strong> de {numero(total)}
      </p>
      {alCambiarTamano && (
        <label className="k-paginacion__tamano">
          <span>Filas</span>
          <select className="k-control" value={porPagina} onChange={(e) => alCambiarTamano(Number(e.target.value))}>
            {tamanos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      )}
      <div className="k-paginacion__botones">
        <Boton variante="discreto" tamano="chico" icono={ChevronLeft} aria-label="Página anterior" disabled={pagina <= 1} onClick={() => alCambiar(pagina - 1)} />
        {tramoPaginas(pagina, paginas).map((p, i) => (p === '…'
          ? <span key={`h${i}`} className="k-paginacion__hueco" aria-hidden="true">…</span>
          : (
            <button key={p} type="button" className="k-paginacion__pagina" aria-label={`Página ${p}`} aria-current={p === pagina ? 'page' : undefined} onClick={() => alCambiar(p)}>
              {p}
            </button>
          )))}
        <Boton variante="discreto" tamano="chico" icono={ChevronRight} aria-label="Página siguiente" disabled={pagina >= paginas} onClick={() => alCambiar(pagina + 1)} />
      </div>
    </nav>
  );
}

// 10 · Esqueleto. La silueta del contenido que va a llegar, con su misma forma, para que al cargar no salte nada.
import { cx } from './interno.js';
import './Esqueleto.css';

/** Un bloque. `ancho` y `alto` aceptan número (px) o cualquier medida CSS. */
export function Esqueleto({ ancho = '100%', alto = 14, redondo, className }) {
  const medida = (v) => (typeof v === 'number' ? `${v}px` : v);
  return <span className={cx('k-esqueleto', redondo && 'k-esqueleto--redondo', className)} style={{ width: medida(ancho), height: medida(alto) }} aria-hidden="true" />;
}

// Anchos distintos por fila: un bloque de rayas iguales parece una rejilla, no un texto
const ANCHOS = ['92%', '78%', '85%', '64%', '88%', '71%'];

/** Párrafo de varias líneas. */
export function EsqueletoTexto({ lineas = 3 }) {
  return (
    <span className="k-esqueleto-texto" aria-hidden="true">
      {Array.from({ length: lineas }, (_, i) => <Esqueleto key={i} ancho={i === lineas - 1 ? '55%' : ANCHOS[i % ANCHOS.length]} />)}
    </span>
  );
}

/** Filas de una tabla que todavía no ha llegado. */
export function EsqueletoTabla({ filas = 5, columnas = 4 }) {
  return (
    <div className="k-esqueleto-tabla" role="status">
      <span className="oculto-accesible">Cargando</span>
      {Array.from({ length: filas }, (_, f) => (
        <div key={f} className="k-esqueleto-tabla__fila" style={{ '--columnas': columnas }}>
          {Array.from({ length: columnas }, (_, c) => <Esqueleto key={c} ancho={ANCHOS[(f + c * 2) % ANCHOS.length]} />)}
        </div>
      ))}
    </div>
  );
}

/** Persona: foto y dos líneas. */
export function EsqueletoPersona() {
  return (
    <span className="k-esqueleto-persona" aria-hidden="true">
      <Esqueleto ancho={36} alto={36} redondo />
      <span><Esqueleto ancho={140} /><Esqueleto ancho={90} alto={10} /></span>
    </span>
  );
}

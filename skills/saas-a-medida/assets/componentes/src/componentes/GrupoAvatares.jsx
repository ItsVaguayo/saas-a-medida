// 18 · Grupo de avatares. Quién está en un proyecto, quién tiene abierta la ficha, a quién se asignó.
// Montados unos sobre otros; los que no caben se resumen en «+3». Referencias: Figma, Linear, Notion.
import { Avatar } from './base.jsx';
import { cx } from './interno.js';
import './GrupoAvatares.css';

/** @param personas [{ nombre, foto?, estado? }]  `estado`: 'activo' | 'ausente' pinta un punto de presencia
    @param maximo   cuántas caras se ven antes del «+N»
    @param lado     tamaño de cada avatar en px
    @param alPulsarResto () => void. Si llega, el «+N» es un botón (abre la lista completa) */
export function GrupoAvatares({ personas, maximo = 4, lado = 32, alPulsarResto, etiqueta, className }) {
  const visibles = personas.slice(0, maximo);
  const resto = personas.slice(maximo);
  const Resto = alPulsarResto ? 'button' : 'span';
  return (
    <div className={cx('c-avatares', className)} role="group" aria-label={etiqueta ?? `${personas.length} personas`} style={{ '--lado': `${lado}px` }}>
      {visibles.map((p, i) => (
        <span key={p.nombre} className="c-avatares__uno" title={p.nombre} style={{ '--i': i }}>
          <Avatar nombre={p.nombre} foto={p.foto} lado={lado} />
          {p.estado && <span className="c-avatares__presencia" data-estado={p.estado} aria-hidden="true" />}
          <span className="oculto-accesible">{p.nombre}{p.estado === 'activo' ? ', en línea' : ''}</span>
        </span>
      ))}
      {resto.length > 0 && (
        <Resto
          {...(alPulsarResto ? { type: 'button', onClick: alPulsarResto } : null)}
          className="c-avatares__uno c-avatares__resto"
          title={resto.map((p) => p.nombre).join(', ')}
          style={{ '--i': visibles.length }}
        >
          <span aria-hidden="true">+{resto.length}</span>
          <span className="oculto-accesible">y {resto.length} más: {resto.map((p) => p.nombre).join(', ')}</span>
        </Resto>
      )}
    </div>
  );
}

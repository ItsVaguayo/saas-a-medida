// 39 · Actividad. El historial de un registro o de la cuenta: quién hizo qué y cuándo, agrupado por días.
// Responde a «¿qué ha pasado con esto?» sin tener que preguntar a nadie.
import { Avatar, Boton } from './base.jsx';
import { fechaCercana, fechaCorta, hora } from './formato.js';
import { cx } from './interno.js';
import './Actividad.css';

const dia = (fecha) => { const d = new Date(fecha); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** @param eventos    [{ id, fecha, actor, texto, detalle, icono, tono: 'bien'|'atencion'|'mal' }], del más reciente al más antiguo.
                      Con `icono` se pinta el icono; sin él, el avatar de `actor`
    @param alCargarMas () => void. Con él aparece «Ver anteriores»
    @param ahora      fecha de referencia (para pruebas) */
export function Actividad({ eventos, alCargarMas, cargando, ahora = new Date(), className }) {
  const grupos = [];
  eventos.forEach((e) => {
    const clave = dia(e.fecha);
    const grupo = grupos.at(-1)?.clave === clave ? grupos.at(-1) : grupos[grupos.push({ clave, fecha: e.fecha, eventos: [] }) - 1];
    grupo.eventos.push(e);
  });

  return (
    <div className={cx('k-actividad', className)}>
      {grupos.map((g) => (
        <section key={g.clave} className="k-actividad__dia">
          <h3>{mayuscula(fechaCercana(g.fecha, ahora))}</h3>
          <ol>
            {g.eventos.map((e) => (
              <li key={e.id} className="k-actividad__evento">
                <span className="k-actividad__marca" data-tono={e.tono}>
                  {e.icono ? <e.icono aria-hidden="true" /> : <Avatar nombre={e.actor} lado={28} />}
                </span>
                <div className="k-actividad__cuerpo">
                  <p>{e.actor && <strong>{e.actor} </strong>}{e.texto}</p>
                  {e.detalle && <blockquote>{e.detalle}</blockquote>}
                </div>
                <time dateTime={new Date(e.fecha).toISOString()} title={`${fechaCorta(e.fecha)}, ${hora(e.fecha)}`}>{hora(e.fecha)}</time>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {alCargarMas && <Boton variante="discreto" tamano="chico" disabled={cargando} onClick={alCargarMas}>{cargando ? 'Cargando' : 'Ver anteriores'}</Boton>}
    </div>
  );
}

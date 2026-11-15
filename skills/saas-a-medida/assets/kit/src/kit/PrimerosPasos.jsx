// 40 · PrimerosPasos. La lista corta de lo que falta por montar al estrenar la app. Los pasos se marcan solos
// cuando se hacen (la app sabe si ya hay un cliente creado) y la lista se puede ocultar.
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Boton } from './base.jsx';
import { Anillo } from './Progreso.jsx';
import { cx } from './interno.js';
import './PrimerosPasos.css';

/** @param pasos     [{ id, titulo, detalle, hecho, accion, alPulsar }]. Cinco como mucho
    @param alOcultar () => void. La app recuerda que se ocultó (useAlmacen) */
export function PrimerosPasos({ pasos, titulo = 'Primeros pasos', alOcultar, className }) {
  const hechos = pasos.filter((p) => p.hecho).length;
  const completo = hechos === pasos.length;
  // Abierto por defecto el primero que falta; se puede abrir otro a mano
  const [elegido, setElegido] = useState(null);
  const abierto = elegido ?? pasos.find((p) => !p.hecho)?.id;

  return (
    <section className={cx('k-primeros k-tarjeta', className)} aria-label={titulo}>
      <header className="k-primeros__cabecera">
        <Anillo valor={hechos} max={pasos.length} tamano={40} grosor={4} etiqueta={`${hechos} de ${pasos.length} pasos hechos`} tono={completo ? 'bien' : 'acento'}>
          {completo ? <Check aria-hidden="true" /> : hechos}
        </Anillo>
        <div>
          <h2>{completo ? 'Todo listo' : titulo}</h2>
          <p>{hechos} de {pasos.length}</p>
        </div>
        {alOcultar && <Boton variante="discreto" tamano="chico" onClick={alOcultar}>Ocultar</Boton>}
      </header>
      <ol className="k-primeros__lista">
        {pasos.map((p) => {
          const esAbierto = p.id === abierto && !p.hecho;
          return (
            <li key={p.id} className="k-primeros__paso" data-hecho={p.hecho || undefined} data-abierto={esAbierto || undefined}>
              <button type="button" className="k-primeros__fila" aria-expanded={p.hecho ? undefined : esAbierto} disabled={p.hecho} onClick={() => setElegido(esAbierto ? '' : p.id)}>
                <span className="k-primeros__marca" aria-hidden="true"><Check /></span>
                <span className="k-primeros__titulo">{p.titulo}</span>
                {p.hecho && <span className="oculto-accesible">, hecho</span>}
              </button>
              <div className="k-primeros__panel" inert={!esAbierto}>
                <div>
                  <div className="k-primeros__dentro">
                    {p.detalle && <p>{p.detalle}</p>}
                    {p.accion && <Boton variante="principal" tamano="chico" onClick={p.alPulsar}>{p.accion}</Boton>}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// 34 · Pasos. Un formulario largo partido en tramos, con un contador que dice por dónde se va.
// No se avanza con el paso mal, se puede volver atrás sin perder nada y el paso nuevo entra del lado hacia el que se va.
import { Check } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { BotonEstado } from './BotonEstado.jsx';
import { Fundido } from './TransicionVista.jsx';
import { cx } from './interno.js';
import './Pasos.css';

/** @param pasos       [{ id, titulo, contenido: nodo, validar: () => true | false | Promise }]
                       `validar` enseña él mismo los errores del paso y devuelve si se puede seguir
    @param alTerminar  () => void | Promise. Se llama al pulsar el último botón, con todo validado
    @param textoFinal  verbo del último botón: «Crear cliente» */
export function Pasos({ pasos, alTerminar, textoFinal = 'Finalizar', className }) {
  const id = useId();
  const [actual, setActual] = useState(0);
  const [sentido, setSentido] = useState('nada');
  const cuerpo = useRef(null);
  const ultimo = actual === pasos.length - 1;

  const ir = (indice) => {
    setSentido(indice > actual ? 'adelante' : 'atras');
    setActual(indice);
    // El foco va al paso nuevo: quien usa lector de pantalla oye dónde está
    requestAnimationFrame(() => cuerpo.current?.focus());
  };

  const seguir = async () => {
    const vale = (await pasos[actual].validar?.()) ?? true;
    if (vale === false) return;
    if (ultimo) await alTerminar?.(); else ir(actual + 1);
  };

  return (
    <div className={cx('k-pasos', className)}>
      <ol className="k-pasos__guia" style={{ '--avance': pasos.length > 1 ? actual / (pasos.length - 1) : 0 }}>
        {pasos.map((p, i) => {
          const estado = i < actual ? 'hecho' : i === actual ? 'actual' : 'pendiente';
          return (
            <li key={p.id} className="k-pasos__paso" data-estado={estado} aria-current={estado === 'actual' ? 'step' : undefined}>
              {/* A los pasos ya hechos se puede volver; a los que faltan no se salta */}
              <button type="button" disabled={estado !== 'hecho'} onClick={() => ir(i)}>
                <span className="k-pasos__numero" aria-hidden="true">{estado === 'hecho' ? <Check /> : i + 1}</span>
                <span className="k-pasos__titulo">{p.titulo}</span>
                {estado === 'hecho' && <span className="oculto-accesible">, hecho. Volver a este paso</span>}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="k-pasos__movil" aria-hidden="true">Paso {actual + 1} de {pasos.length} · <strong>{pasos[actual].titulo}</strong></p>

      <div className="k-pasos__cuerpo" ref={cuerpo} tabIndex={-1} role="group" aria-labelledby={`${id}-titulo`}>
        <span id={`${id}-titulo`} className="oculto-accesible">Paso {actual + 1} de {pasos.length}: {pasos[actual].titulo}</span>
        <Fundido clave={pasos[actual].id} sentido={sentido}>{pasos[actual].contenido}</Fundido>
      </div>

      <div className="k-pasos__pie">
        {actual > 0 && <Boton onClick={() => ir(actual - 1)}>Anterior</Boton>}
        {ultimo
          ? <BotonEstado alPulsar={seguir} cargando="Guardando" hecho="Guardado">{textoFinal}</BotonEstado>
          : <Boton variante="principal" onClick={seguir}>Siguiente</Boton>}
      </div>
    </div>
  );
}

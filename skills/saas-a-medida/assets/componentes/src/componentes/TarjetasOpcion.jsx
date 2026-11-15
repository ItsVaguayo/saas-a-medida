// 24 · Tarjetas de opción. Elegir entre pocas opciones que necesitan explicación: el tipo de cuenta,
// la forma de pago, la plantilla de partida. Por debajo son radios (o casillas): el teclado y el lector
// de pantalla funcionan sin más. Referencias: Stripe (método de pago), Vercel (framework), Linear.
import { Check } from 'lucide-react';
import { useId } from 'react';
import { cx, useControlado } from './interno.js';
import './TarjetasOpcion.css';

/** @param opciones  [{ valor, titulo, detalle?, icono?, extra?, deshabilitada? }]  `extra` es un nodo a la derecha (precio, etiqueta)
    @param valor     el elegido (o la lista de elegidos con `multiple`), si lo controlas tú; si no, `valorInicial`
    @param alCambiar (valor) => void
    @param multiple  se pueden marcar varias
    @param columnas  cuántas por fila; sin ella, las que quepan
    @param etiqueta  la pregunta que responden: «Tipo de cuenta»
    @param etiquetaOculta  la pregunta no se ve pero la oye el lector de pantalla */
export function TarjetasOpcion({ opciones, valor, valorInicial, alCambiar, multiple, columnas, etiqueta, etiquetaOculta, nombre, className }) {
  const id = useId();
  const [elegido, setElegido] = useControlado(valor, valorInicial ?? (multiple ? [] : null), alCambiar);
  const marcada = (v) => (multiple ? elegido.includes(v) : elegido === v);
  const alternar = (v) => {
    if (!multiple) setElegido(v);
    else setElegido(elegido.includes(v) ? elegido.filter((x) => x !== v) : [...elegido, v]);
  };

  return (
    <fieldset className={cx('c-opciones', className)} style={columnas ? { '--columnas': columnas } : undefined} data-columnas={columnas ? '' : undefined}>
      {etiqueta && <legend className={etiquetaOculta ? 'oculto-accesible' : 'c-opciones__etiqueta'}>{etiqueta}</legend>}
      <div className="c-opciones__rejilla">
        {opciones.map((o) => {
          const Icono = o.icono;
          return (
            <label key={o.valor} className="c-opcion" data-deshabilitada={o.deshabilitada || undefined}>
              <input
                className="c-opcion__entrada oculto-accesible"
                type={multiple ? 'checkbox' : 'radio'}
                name={nombre ?? id}
                value={o.valor}
                checked={marcada(o.valor)}
                disabled={o.deshabilitada}
                onChange={() => alternar(o.valor)}
              />
              {Icono && <span className="c-opcion__icono"><Icono aria-hidden="true" /></span>}
              <span className="c-opcion__texto">
                <span className="c-opcion__titulo">{o.titulo}</span>
                {o.detalle && <span className="c-opcion__detalle">{o.detalle}</span>}
              </span>
              {o.extra && <span className="c-opcion__extra">{o.extra}</span>}
              <span className="c-opcion__marca" data-forma={multiple ? 'casilla' : 'radio'} aria-hidden="true"><Check /></span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// 27 · Filtros. Una fila de pastillas: las que no están puestas ofrecen añadirse, las puestas dicen su valor
// y se quitan con un toque. Siempre se ve qué está filtrando la lista y cómo dejar de hacerlo.
import { Plus, X } from 'lucide-react';
import { Menu } from './Menu.jsx';
import { cx } from './interno.js';
import './Filtros.css';

/** @param filtros   [{ clave, texto, opciones: [{ valor, texto }] }]
    @param valor     { [clave]: valor } con solo los filtros puestos
    @param alCambiar (valor nuevo) => void. Lo normal es guardarlo en la URL con useEstadoUrl */
export function Filtros({ filtros, valor, alCambiar, className }) {
  const poner = (clave, v) => alCambiar({ ...valor, [clave]: v });
  const quitar = (clave) => {
    const { [clave]: _fuera, ...resto } = valor;
    alCambiar(resto);
  };
  const puestos = filtros.filter((f) => valor[f.clave] !== undefined);

  return (
    <div className={cx('k-filtros', className)} role="group" aria-label="Filtros">
      {filtros.map((f) => {
        const actual = f.opciones.find((o) => o.valor === valor[f.clave]);
        const elementos = f.opciones.map((o) => ({ texto: o.texto, marcado: o.valor === actual?.valor, alElegir: () => poner(f.clave, o.valor) }));
        return (
          <span key={f.clave} className="k-filtro" data-puesto={actual ? '' : undefined}>
            <Menu
              elementos={elementos}
              etiqueta={f.texto}
              alinear="inicio"
              disparador={(props) => (
                <button type="button" className="k-filtro__boton" {...props}>
                  {!actual && <Plus aria-hidden="true" />}
                  <span className="k-filtro__nombre">{f.texto}</span>
                  {actual && <span className="k-filtro__valor">{actual.texto}</span>}
                </button>
              )}
            />
            {actual && (
              <button type="button" className="k-filtro__quitar" aria-label={`Quitar filtro ${f.texto}`} onClick={() => quitar(f.clave)}>
                <X aria-hidden="true" />
              </button>
            )}
          </span>
        );
      })}
      {puestos.length > 1 && <button type="button" className="k-filtros__borrar" onClick={() => alCambiar({})}>Borrar filtros</button>}
    </div>
  );
}

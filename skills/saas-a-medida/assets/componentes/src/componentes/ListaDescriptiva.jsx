// 16 · Lista descriptiva. La ficha de un registro: cada dato con su nombre, y un botón para copiar
// los que se copian a menudo (identificadores, IBAN, email). Referencias: Stripe (detalle de pago), Linear, GitHub.
import { BotonCopiar } from './base.jsx';
import { cx } from './interno.js';
import './ListaDescriptiva.css';

/** @param elementos  [{ termino, valor, copiar?, mono?, ancho? }]
                      `valor` admite nodos. `copiar`: true copia el valor si es texto, o pasa el texto exacto.
                      `mono`: letra de ancho fijo para códigos. `ancho: 'completo'` ocupa toda la fila
    @param columnas   en cuántas columnas se reparten los datos (1 a 4); en móvil siempre una
    @param disposicion 'fila' (nombre a la izquierda) | 'pila' (nombre encima) */
export function ListaDescriptiva({ elementos, columnas = 1, disposicion = 'fila', vacio = '—', className }) {
  return (
    <dl className={cx('c-descriptiva', `c-descriptiva--${disposicion}`, className)} style={{ '--columnas': columnas }}>
      {elementos.map((el) => {
        const falta = el.valor === null || el.valor === undefined || el.valor === '';
        const texto = typeof el.copiar === 'string' ? el.copiar : typeof el.valor === 'string' || typeof el.valor === 'number' ? String(el.valor) : null;
        return (
          <div key={el.termino} className="c-descriptiva__par" data-ancho={el.ancho}>
            <dt>{el.termino}</dt>
            <dd data-mono={el.mono || undefined} data-falta={falta || undefined}>
              <span className="c-descriptiva__valor">{falta ? vacio : el.valor}</span>
              {el.copiar && texto && !falta && <BotonCopiar texto={texto} etiqueta={`Copiar ${el.termino}`} />}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

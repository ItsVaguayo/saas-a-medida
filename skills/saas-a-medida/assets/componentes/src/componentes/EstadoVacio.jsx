// 17 · Estado vacío. Lo que se ve cuando una lista no tiene nada: el motivo y la salida.
// Nunca «No hay datos». Referencias: Linear, Stripe, Shopify Polaris (EmptyState).
import { Inbox } from 'lucide-react';
import { cx } from './interno.js';
import './EstadoVacio.css';

/** @param titulo   el motivo en pocas palabras: «Aún no hay clientes», «Ningún cliente coincide con "Gil"»
    @param detalle  una frase más, solo si aporta
    @param accion   nodo con el botón de salida: «Añadir cliente», «Quitar filtros»
    @param accionSecundaria  nodo con una segunda salida, discreta
    @param variante 'plano' | 'tarjeta' (con borde de puntos, para zonas grandes) | 'compacto' (dentro de un panel)
    @param nivel    nivel del encabezado */
export function EstadoVacio({ icono: Icono = Inbox, titulo, detalle, accion, accionSecundaria, variante = 'plano', nivel = 3, className }) {
  const Titulo = `h${nivel}`;
  return (
    <div className={cx('c-vacio', `c-vacio--${variante}`, className)}>
      <div className="c-vacio__dibujo" aria-hidden="true">
        <span className="c-vacio__anillo" />
        <span className="c-vacio__anillo" />
        <span className="c-vacio__icono"><Icono /></span>
      </div>
      <Titulo className="c-vacio__titulo">{titulo}</Titulo>
      {detalle && <p className="c-vacio__detalle">{detalle}</p>}
      {(accion || accionSecundaria) && <div className="c-vacio__acciones">{accion}{accionSecundaria}</div>}
    </div>
  );
}

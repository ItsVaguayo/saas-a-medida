// 30 · Zona de peligro. Lo que no tiene vuelta atrás: eliminar la cuenta, borrar un espacio, revocar un acceso.
// Antes de hacerlo hay que escribir el nombre de lo que se borra. Referencias: GitHub (Danger Zone), Vercel, Stripe.
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { cx } from './interno.js';
import './ZonaPeligro.css';

/** @param titulo      qué hace la acción: «Eliminar el espacio»
    @param detalle     la consecuencia, en una línea
    @param accion      texto del botón: «Eliminar espacio»
    @param pregunta    título del diálogo: «¿Eliminar Clínica Norte?»
    @param consecuencia  qué se pierde, con cifras: «Se borran 128 clientes y 342 facturas»
    @param frase       lo que hay que escribir para confirmar, normalmente el nombre de lo que se borra
    @param alConfirmar () => void | Promise. Mientras la promesa no acaba, el botón espera; si falla, se enseña su mensaje
    @param textos      { escribe: (frase) => nodo, volver } */
export function ZonaPeligro({ titulo, detalle, accion = 'Eliminar', pregunta, consecuencia, frase, alConfirmar, textos, className }) {
  const t = { escribe: (f) => <>Escribe <b>{f}</b> para confirmar</>, volver: 'Volver', error: 'No se ha podido completar. Inténtalo de nuevo.', ...textos };
  const id = useId();
  const dialogo = useRef(null);
  const [escrito, setEscrito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const coincide = !frase || escrito.trim() === frase;

  const abrir = () => {
    setEscrito('');
    setError(null);
    const d = dialogo.current;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  };
  const cerrar = () => {
    const d = dialogo.current;
    if (d.close) d.close(); else d.removeAttribute('open');
  };
  const confirmar = async (e) => {
    e.preventDefault();
    if (!coincide || enviando) return;
    setEnviando(true);
    setError(null);
    try {
      await alConfirmar?.();
      cerrar();
    } catch (fallo) {
      setError(fallo?.message || t.error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={cx('c-peligro', className)}>
      <div className="c-peligro__texto">
        <p className="c-peligro__titulo">{titulo}</p>
        {detalle && <p className="c-peligro__detalle">{detalle}</p>}
      </div>
      <Boton variante="peligro-suave" onClick={abrir}>{accion}</Boton>

      <dialog
        ref={dialogo}
        className="c-peligro__dialogo"
        aria-labelledby={`${id}-t`}
        aria-describedby={consecuencia ? `${id}-c` : undefined}
        // Un toque en el velo (fuera de la caja) cierra
        onClick={(e) => { if (e.target === e.currentTarget && !enviando) cerrar(); }}
        onCancel={(e) => { if (enviando) e.preventDefault(); }}
      >
        <form onSubmit={confirmar}>
          <span className="c-peligro__icono" aria-hidden="true"><TriangleAlert /></span>
          <h2 id={`${id}-t`}>{pregunta ?? `¿${accion}?`}</h2>
          {consecuencia && <p id={`${id}-c`} className="c-peligro__consecuencia">{consecuencia}</p>}
          {frase && (
            <div className="c-campo">
              <label className="c-campo__etiqueta c-peligro__pide" htmlFor={`${id}-f`}>{t.escribe(frase)}</label>
              <input
                id={`${id}-f`}
                className="c-control"
                value={escrito}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                data-coincide={(escrito && coincide) || undefined}
                onChange={(e) => setEscrito(e.target.value)}
              />
            </div>
          )}
          {error && <p className="c-campo__error" role="alert"><CircleAlert aria-hidden="true" />{error}</p>}
          <div className="c-peligro__botones">
            <Boton variante="secundario" onClick={cerrar} disabled={enviando}>{t.volver}</Boton>
            <Boton variante="peligro" type="submit" disabled={!coincide} cargando={enviando}>{accion}</Boton>
          </div>
        </form>
      </dialog>
    </div>
  );
}

/** Varias acciones de peligro en una tarjeta con borde rojo, como al final de una página de configuración. */
export const ZonasPeligro = ({ titulo = 'Zona de peligro', children, className }) => (
  <section className={cx('c-peligros', className)} aria-label={titulo}>
    <h2>{titulo}</h2>
    <div>{children}</div>
  </section>
);

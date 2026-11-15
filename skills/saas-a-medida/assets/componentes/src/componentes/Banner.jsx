// 19 · Banner. Un aviso que se queda en la página hasta que se resuelve o se cierra: la prueba que caduca,
// el pago que ha fallado, el mantenimiento del sábado. Lo que dura un momento va en un aviso breve (toast), no aquí.
// Referencias: Stripe, GitHub (flash), Shopify Polaris (Banner).
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { cx, useControlado, usePresencia } from './interno.js';
import './Banner.css';

const ICONOS = { info: Info, bien: CircleCheck, atencion: TriangleAlert, mal: CircleAlert };

/** @param tono     'info' | 'bien' | 'atencion' | 'mal'
    @param titulo   qué pasa, en una línea
    @param children el detalle y cómo se arregla (opcional)
    @param accion   nodo con el botón o enlace que lo resuelve
    @param alCerrar () => void. Si llega, pinta el aspa; el banner se cierra solo salvo que controles `visible`
    @param visible  para enseñarlo y esconderlo desde fuera */
export function Banner({ tono = 'info', titulo, children, accion, alCerrar, visible, icono, textoCerrar = 'Cerrar aviso', className }) {
  const [abierto, setAbierto] = useControlado(visible, true);
  const { montado, saliendo } = usePresencia(abierto, 280);
  if (!montado) return null;
  const Icono = icono ?? ICONOS[tono];

  return (
    <div className="c-banner-hueco" data-saliendo={saliendo || undefined}>
      <div className={cx('c-banner', className)} data-tono={tono} role={tono === 'mal' ? 'alert' : 'status'}>
        <Icono className="c-banner__icono" aria-hidden="true" />
        <div className="c-banner__texto">
          {titulo && <p className="c-banner__titulo">{titulo}</p>}
          {children && <div className="c-banner__detalle">{children}</div>}
        </div>
        {accion && <div className="c-banner__accion">{accion}</div>}
        {alCerrar && (
          <button type="button" className="c-banner__cerrar" aria-label={textoCerrar} onClick={() => { setAbierto(false); alCerrar(); }}>
            <X aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

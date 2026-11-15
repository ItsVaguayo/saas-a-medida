// 25 · Campo secreto. Claves de API, tokens y contraseñas de integración: tapadas por defecto, con botón
// para verlas, copiarlas y regenerarlas. Se vuelve a tapar sola al rato. Referencias: Stripe (claves de API),
// Vercel (variables de entorno), GitHub (tokens).
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { BotonCopiar } from './base.jsx';
import { cx } from './interno.js';
import './CampoSecreto.css';

/** @param etiqueta     nombre de la clave: «Clave secreta»
    @param valor        el secreto completo
    @param visibles     cuántos caracteres del final se dejan ver con el resto tapado (0 para ninguno)
    @param ocultarTras  milisegundos hasta que se tapa sola; 0 para que no lo haga
    @param alRegenerar  () => void | Promise. Si llega, pinta el botón; mientras la promesa no acaba, gira
    @param alCopiar     (valor) => void, para registrar la copia
    @param detalle      una línea bajo el campo: «Creada el 3 nov · Último uso hace 2 horas» */
export function CampoSecreto({ etiqueta, valor = '', visibles = 4, ocultarTras = 20000, alRegenerar, alCopiar, detalle, textos, className }) {
  const t = { mostrar: 'Mostrar', ocultar: 'Ocultar', copiar: 'Copiar', regenerar: 'Regenerar', ...textos };
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [girando, setGirando] = useState(false);

  useEffect(() => {
    if (!visible || !ocultarTras) return undefined;
    const temporizador = setTimeout(() => setVisible(false), ocultarTras);
    return () => clearTimeout(temporizador);
  }, [visible, ocultarTras]);
  // Una clave nueva llega siempre tapada
  useEffect(() => setVisible(false), [valor]);

  const cola = visibles > 0 ? valor.slice(-visibles) : '';
  const tapado = '•'.repeat(Math.min(12, Math.max(8, valor.length - cola.length)));
  const regenerar = async () => {
    setGirando(true);
    try { await alRegenerar(); } finally { setGirando(false); }
  };

  return (
    <div className={cx('c-campo c-secreto', className)}>
      {etiqueta && <span id={`${id}-e`} className="c-campo__etiqueta">{etiqueta}</span>}
      <div className="c-control c-secreto__control" role="group" aria-labelledby={etiqueta ? `${id}-e` : undefined}>
        <code key={visible ? 'visto' : 'tapado'} className="c-secreto__valor" data-visible={visible || undefined}>
          {visible ? valor : <><span aria-hidden="true">{tapado}</span>{cola}<span className="oculto-accesible"> (tapada)</span></>}
        </code>
        <button type="button" className="c-secreto__boton" aria-pressed={visible} aria-label={`${visible ? t.ocultar : t.mostrar} ${etiqueta ?? ''}`.trim()} title={visible ? t.ocultar : t.mostrar} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
        <BotonCopiar texto={valor} etiqueta={`${t.copiar} ${etiqueta ?? ''}`.trim()} alCopiar={alCopiar} />
        {alRegenerar && (
          <button type="button" className="c-secreto__boton" data-girando={girando || undefined} disabled={girando} aria-label={`${t.regenerar} ${etiqueta ?? ''}`.trim()} title={t.regenerar} onClick={regenerar}>
            <RefreshCw aria-hidden="true" />
          </button>
        )}
      </div>
      {detalle && <span className="c-campo__ayuda">{detalle}</span>}
    </div>
  );
}

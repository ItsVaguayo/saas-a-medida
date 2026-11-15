// Botón de copiar (parte de 06 · useCopiar). El icono cambia a una marca durante un momento: confirma sin tapar nada.
import { Check, Copy } from 'lucide-react';
import { useCopiar } from './hooks.js';
import { cx } from './interno.js';
import './Copiar.css';

/** @param texto    lo que se copia
    @param etiqueta qué es, para el lector de pantalla: «Copiar IBAN»
    @param children texto visible opcional junto al icono */
export function BotonCopiar({ texto, etiqueta = 'Copiar', children, className }) {
  const [copiado, copiar] = useCopiar();
  return (
    <button type="button" className={cx('k-copiar', children && 'k-copiar--texto', className)} data-copiado={copiado || undefined} aria-label={children ? undefined : etiqueta} onClick={() => copiar(texto)}>
      <span className="k-copiar__iconos" aria-hidden="true"><Copy /><Check /></span>
      {children && <span>{copiado ? 'Copiado' : children}</span>}
      <span className="oculto-accesible" role="status">{copiado ? 'Copiado' : ''}</span>
    </button>
  );
}

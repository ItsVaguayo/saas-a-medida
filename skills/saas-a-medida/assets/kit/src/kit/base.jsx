// Piezas base: botón, campo, etiqueta, avatar y tarjeta. Sus estilos están en src/base.css.
import { CircleAlert } from 'lucide-react';
import { useId } from 'react';
import { iniciales } from './formato.js';
import { cx } from './interno.js';

/** Botón. Sin texto y con `icono` queda cuadrado: entonces `aria-label` es obligatorio.
    @param variante 'principal' | 'secundario' | 'discreto' | 'peligro'
    @param tamano   'chico' o nada */
export function Boton({ variante = 'secundario', tamano, icono: Icono, bloque, children, className, ...resto }) {
  return (
    <button
      type="button"
      className={cx('k-boton', `k-boton--${variante}`, tamano && `k-boton--${tamano}`, bloque && 'k-boton--bloque', !children && 'k-boton--icono', className)}
      {...resto}
    >
      {Icono && <Icono aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Campo con su etiqueta visible. El error y la ayuda quedan unidos al control para el lector de pantalla. */
export function Campo({ etiqueta, error, ayuda, opcional, multilinea, className, ...resto }) {
  const id = useId();
  const Control = multilinea ? 'textarea' : 'input';
  const descritoPor = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('k-campo', className)}>
      <label className="k-campo__etiqueta" htmlFor={id}>
        {etiqueta}{opcional && <span className="k-campo__opcional"> (opcional)</span>}
      </label>
      <Control id={id} className="k-control" aria-invalid={error ? true : undefined} aria-describedby={descritoPor} {...resto} />
      {ayuda && !error && <span id={`${id}-ayuda`} className="k-campo__ayuda">{ayuda}</span>}
      {error && <span id={`${id}-error`} className="k-campo__error"><CircleAlert aria-hidden="true" />{error}</span>}
    </div>
  );
}

/** Etiqueta de estado. @param tono 'neutro' | 'acento' | 'bien' | 'atencion' | 'mal' */
export function Etiqueta({ tono = 'neutro', icono: Icono, punto, children }) {
  return (
    <span className={cx('k-etiqueta', `k-etiqueta--${tono}`, punto && 'k-etiqueta--punto')}>
      {Icono && <Icono aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Foto de la persona o, si no hay, sus iniciales. */
export function Avatar({ nombre, foto, lado = 32 }) {
  const estilo = { '--lado': `${lado}px` };
  if (foto) return <img className="k-avatar" style={estilo} src={foto} alt="" />;
  return <span className="k-avatar" style={estilo} aria-hidden="true">{iniciales(nombre)}</span>;
}

export const Tarjeta = ({ como: Como = 'div', className, ...resto }) => <Como className={cx('k-tarjeta', className)} {...resto} />;

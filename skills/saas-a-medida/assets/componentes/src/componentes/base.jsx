// Piezas base que usan los demás componentes: botón, avatar, etiqueta y botón de copiar.
// Sus estilos están en src/base.css.
import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { iniciales } from './formato.js';
import { cx, tonoDe } from './interno.js';
import './base-piezas.css';

/** Botón. Sin texto y con `icono` queda cuadrado: entonces `aria-label` es obligatorio.
    @param variante 'principal' | 'secundario' | 'discreto' | 'peligro' | 'peligro-suave'
    @param tamano   'chico' o nada
    @param cargando enseña la rueda y no deja pulsar dos veces */
export function Boton({ variante = 'secundario', tamano, icono: Icono, bloque, cargando, children, className, disabled, ...resto }) {
  return (
    <button
      type="button"
      className={cx('c-boton', `c-boton--${variante}`, tamano && `c-boton--${tamano}`, bloque && 'c-boton--bloque', !children && 'c-boton--icono', className)}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...resto}
    >
      {cargando ? <span className="c-espera" aria-hidden="true" /> : Icono && <Icono aria-hidden="true" />}
      {children}
    </button>
  );
}

/** Foto de la persona o, si no hay, sus iniciales sobre un color que sale de su nombre.
    @param forma 'redondo' | 'cuadrado' (espacios de trabajo, empresas) */
export function Avatar({ nombre, foto, lado = 32, forma = 'redondo', className }) {
  const estilo = { '--lado': `${lado}px`, '--h': tonoDe(nombre) };
  const clase = cx('c-avatar', forma === 'cuadrado' && 'c-avatar--cuadrado', className);
  if (foto) return <img className={clase} style={estilo} src={foto} alt="" />;
  return <span className={clase} style={estilo} aria-hidden="true">{iniciales(nombre)}</span>;
}

/** Etiqueta de estado. @param tono 'neutro' | 'acento' | 'bien' | 'atencion' | 'mal' */
export function Etiqueta({ tono = 'neutro', icono: Icono, children, className }) {
  return (
    <span className={cx('c-etiqueta', `c-etiqueta--${tono}`, className)}>
      {Icono && <Icono aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Copia un texto y lo recuerda un momento para poder decir «Copiado».
    @returns [copiado, copiar(texto) => Promise<boolean>] */
export function useCopiar(duracion = 1800) {
  const [copiado, setCopiado] = useState(false);
  const temporizador = useRef();
  useEffect(() => () => clearTimeout(temporizador.current), []);
  const copiar = useCallback(async (texto) => {
    try {
      await navigator.clipboard.writeText(String(texto));
    } catch {
      return false;
    }
    setCopiado(true);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCopiado(false), duracion);
    return true;
  }, [duracion]);
  return [copiado, copiar];
}

/** Botón de copiar: el icono se convierte en una marca de hecho y vuelve solo. */
export function BotonCopiar({ texto, etiqueta = 'Copiar', etiquetaHecho = 'Copiado', alCopiar, className }) {
  const [copiado, copiar] = useCopiar();
  return (
    <button
      type="button"
      className={cx('c-copiar', className)}
      data-copiado={copiado || undefined}
      aria-label={etiqueta}
      title={copiado ? etiquetaHecho : etiqueta}
      onClick={async () => { if (await copiar(texto)) alCopiar?.(texto); }}
    >
      <Copy className="c-copiar__icono" aria-hidden="true" />
      <Check className="c-copiar__hecho" aria-hidden="true" />
      <span className="oculto-accesible" role="status">{copiado ? etiquetaHecho : ''}</span>
    </button>
  );
}

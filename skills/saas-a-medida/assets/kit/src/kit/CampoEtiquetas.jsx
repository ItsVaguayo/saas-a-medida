// 33 · CampoEtiquetas. Escribir varias cosas cortas en un solo campo (etiquetas de un cliente, correos de invitados).
// Intro o coma añade; Retroceso con el campo vacío quita la última; pegar una lista separada por comas las añade todas.
import { X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { cx, normalizar } from './interno.js';
import './CampoEtiquetas.css';

/** @param valor       lista de textos
    @param alCambiar   (lista) => void
    @param sugerencias textos que se ofrecen al escribir
    @param validar     (texto) => mensaje de error o nada (por ejemplo, que sea un email)
    @param maximo      cuántas caben */
export function CampoEtiquetas({ etiqueta, valor, alCambiar, sugerencias = [], validar, maximo, marcador = 'Escribir y pulsar Intro', ayuda, className }) {
  const id = useId();
  const campo = useRef(null);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState(null);
  const [repetida, setRepetida] = useState(null);
  const [anuncio, setAnuncio] = useState('');
  const lleno = maximo !== undefined && valor.length >= maximo;

  const anadir = (crudo) => {
    const piezas = crudo.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean);
    if (!piezas.length) return;
    const nuevas = [];
    for (const pieza of piezas) {
      const ya = [...valor, ...nuevas].find((v) => normalizar(v) === normalizar(pieza));
      if (ya) {
        // La que ya estaba parpadea: se entiende por qué no se ha añadido otra vez
        setRepetida(ya);
        setTimeout(() => setRepetida(null), 600);
        continue;
      }
      const fallo = validar?.(pieza);
      if (fallo) { setError(fallo); setTexto(pieza); if (nuevas.length) alCambiar([...valor, ...nuevas]); return; }
      if (maximo !== undefined && valor.length + nuevas.length >= maximo) break;
      nuevas.push(pieza);
    }
    if (nuevas.length) { alCambiar([...valor, ...nuevas]); setAnuncio(`${nuevas.join(', ')} añadida`); }
    setTexto('');
    setError(null);
  };

  const quitar = (v) => {
    alCambiar(valor.filter((x) => x !== v));
    setAnuncio(`${v} quitada`);
    campo.current?.focus();
  };

  const tecla = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      if (texto.trim()) { e.preventDefault(); anadir(texto); } else if (e.key === ',') e.preventDefault();
    } else if (e.key === 'Backspace' && !texto && valor.length) {
      quitar(valor[valor.length - 1]);
    }
  };

  const libres = sugerencias.filter((s) => !valor.some((v) => normalizar(v) === normalizar(s)));
  const descritoPor = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cx('k-campo k-etiquetas', className)}>
      <label className="k-campo__etiqueta" htmlFor={id}>{etiqueta}</label>
      {/* Pulsar en cualquier parte de la caja lleva al campo */}
      <div className="k-control k-etiquetas__caja" data-error={error ? '' : undefined} onPointerDown={(e) => { if (e.target === e.currentTarget) { e.preventDefault(); campo.current?.focus(); } }}>
        {valor.map((v) => (
          <span key={v} className="k-etiquetas__ficha" data-repetida={repetida === v ? '' : undefined}>
            {v}
            <button type="button" aria-label={`Quitar ${v}`} onClick={() => quitar(v)}><X aria-hidden="true" /></button>
          </span>
        ))}
        <input
          ref={campo}
          id={id}
          list={libres.length ? `${id}-lista` : undefined}
          value={texto}
          placeholder={valor.length ? '' : marcador}
          disabled={lleno}
          aria-invalid={error ? true : undefined}
          aria-describedby={descritoPor}
          autoComplete="off"
          onChange={(e) => {
            const v = e.target.value;
            setError(null);
            // Elegir una sugerencia o pegar una lista la añade sin esperar a Intro
            if (/[,;\n]/.test(v) || libres.includes(v)) anadir(v); else setTexto(v);
          }}
          onKeyDown={tecla}
          onBlur={() => texto.trim() && anadir(texto)}
        />
      </div>
      {libres.length > 0 && <datalist id={`${id}-lista`}>{libres.map((s) => <option key={s} value={s} />)}</datalist>}
      {ayuda && !error && <span id={`${id}-ayuda`} className="k-campo__ayuda">{ayuda}{maximo !== undefined && ` · ${valor.length} de ${maximo}`}</span>}
      {error && <span id={`${id}-error`} className="k-campo__error">{error}</span>}
      <span className="oculto-accesible" role="status">{anuncio}</span>
    </div>
  );
}

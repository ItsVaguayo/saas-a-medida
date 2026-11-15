// 20 · Código de verificación. El código de seis cifras del SMS o del correo. Por debajo es un solo campo:
// por eso funcionan pegar, el autorrelleno del móvil («Del mensaje: 482 913») y el borrado normal.
// Referencias: Stripe, Linear, la librería input-otp.
import { CircleAlert } from 'lucide-react';
import { Fragment, useId, useState } from 'react';
import { cx, useControlado } from './interno.js';
import './CodigoVerificacion.css';

/** @param largo       cuántos caracteres
    @param valor       si lo controlas tú; si no, `valorInicial`
    @param alCambiar   (codigo) => void
    @param alCompletar (codigo) => void, al escribir el último carácter: ahí se envía sin pedir botón
    @param grupo       cada cuántas casillas va una separación (3 → «482 913»); 0 para ninguna
    @param tipo        'numerico' | 'alfanumerico'
    @param error       texto del error. Las casillas se sacuden y se ponen en rojo
    Tamaño de casilla: --codigo-ancho (44px) y --codigo-alto (52px). */
export function CodigoVerificacion({
  largo = 6, valor, valorInicial = '', alCambiar, alCompletar, grupo = 3, tipo = 'numerico',
  error, deshabilitado, etiqueta = 'Código de verificación', autoFocus, className,
}) {
  const id = useId();
  const [codigo, setCodigo] = useControlado(valor, valorInicial, alCambiar);
  const [enfocado, setEnfocado] = useState(false);
  const limpiar = (texto) => (tipo === 'numerico' ? texto.replace(/\D/g, '') : texto.replace(/[^a-z0-9]/gi, '').toUpperCase()).slice(0, largo);
  const activa = Math.min(codigo.length, largo - 1);
  // El cursor siempre al final: no se edita por el medio
  const alFinal = (e) => { const n = e.target.value.length; e.target.setSelectionRange?.(n, n); };

  return (
    <div className={cx('c-codigo', className)} data-error={error ? '' : undefined} data-deshabilitado={deshabilitado || undefined}>
      {/* La clave cambia con cada error para que la sacudida se repita */}
      <div key={String(error)} className="c-codigo__casillas">
        {Array.from({ length: largo }, (_, i) => (
          <Fragment key={i}>
            {grupo > 0 && i > 0 && i % grupo === 0 && <span className="c-codigo__separador" aria-hidden="true" />}
            <span className="c-codigo__casilla" data-activa={(enfocado && i === activa) || undefined} data-llena={codigo[i] ? '' : undefined} aria-hidden="true">
              {codigo[i]
                ? <span key={codigo[i]} className="c-codigo__cifra">{codigo[i]}</span>
                : enfocado && i === activa && <span className="c-codigo__cursor" />}
            </span>
          </Fragment>
        ))}
        <input
          className="c-codigo__entrada"
          value={codigo}
          inputMode={tipo === 'numerico' ? 'numeric' : 'text'}
          pattern={tipo === 'numerico' ? '[0-9]*' : undefined}
          autoComplete="one-time-code"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={largo}
          disabled={deshabilitado}
          autoFocus={autoFocus}
          aria-label={etiqueta}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            const nuevo = limpiar(e.target.value);
            setCodigo(nuevo);
            if (nuevo.length === largo && nuevo !== codigo) alCompletar?.(nuevo);
          }}
          onFocus={(e) => { setEnfocado(true); alFinal(e); }}
          onBlur={() => setEnfocado(false)}
          onSelect={alFinal}
        />
      </div>
      {error && typeof error === 'string' && <p id={`${id}-error`} className="c-campo__error" role="alert"><CircleAlert aria-hidden="true" />{error}</p>}
    </div>
  );
}

// 21 · Campo de contraseña. Con botón para verla, aviso de Bloq Mayús y un medidor que dice qué falta
// mientras se escribe, no después de enviar. Referencias: Stripe, 1Password, GitHub.
import { Check, CircleAlert, Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cx, useControlado } from './interno.js';
import './CampoClave.css';

/** Reglas por defecto. Cada una: { id, texto, prueba: (valor) => boolean } */
export const REGLAS_CLAVE = [
  { id: 'largo', texto: '8 caracteres o más', prueba: (v) => v.length >= 8 },
  { id: 'cajas', texto: 'Mayúsculas y minúsculas', prueba: (v) => /[a-zà-ÿ]/.test(v) && /[A-ZÀ-Ý]/.test(v) },
  { id: 'numero', texto: 'Un número', prueba: (v) => /\d/.test(v) },
  { id: 'simbolo', texto: 'Un símbolo', prueba: (v) => /[^A-Za-zÀ-ÿ0-9\s]/.test(v) },
];

/** Cuántas reglas cumple una contraseña y cuáles le faltan. */
export function fuerzaClave(valor, reglas = REGLAS_CLAVE) {
  const cumplidas = reglas.filter((r) => r.prueba(valor)).map((r) => r.id);
  return { cumplidas, nivel: cumplidas.length, total: reglas.length, valida: cumplidas.length === reglas.length };
}

/** @param etiqueta   nombre del campo
    @param valor, alCambiar  controlado; sin `valor`, el campo lleva su propio estado
    @param reglas     lista de reglas; `false` quita el medidor (para el campo de «iniciar sesión»)
    @param niveles    nombres del nivel según cuántas reglas se cumplen
    @param error      texto de error del servidor
    El resto de props van al <input> (name, autoComplete="new-password", required…). */
export function CampoClave({
  etiqueta = 'Contraseña', valor, alCambiar, reglas = REGLAS_CLAVE, niveles = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'],
  error, textos, className, ...resto
}) {
  const t = { mostrar: 'Mostrar contraseña', ocultar: 'Ocultar contraseña', mayusculas: 'Bloq Mayús activado', seguridad: 'Seguridad', ...textos };
  const id = useId();
  const [clave, setClave] = useControlado(valor, '', alCambiar);
  const [visible, setVisible] = useState(false);
  const [mayus, setMayus] = useState(false);
  const fuerza = reglas ? fuerzaClave(clave, reglas) : null;
  const tramo = fuerza ? Math.round((fuerza.nivel / fuerza.total) * 4) : 0;
  const describe = [error && `${id}-error`, fuerza && `${id}-reglas`].filter(Boolean).join(' ') || undefined;
  const alTecla = (e) => setMayus(Boolean(e.getModifierState?.('CapsLock')));

  return (
    <div className={cx('c-campo c-clave', className)}>
      <label className="c-campo__etiqueta" htmlFor={id}>{etiqueta}</label>
      <div className="c-control c-clave__control" data-error={error ? '' : undefined}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={clave}
          autoComplete="new-password"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describe}
          onChange={(e) => setClave(e.target.value)}
          onKeyUp={alTecla}
          onKeyDown={alTecla}
          onBlur={() => setMayus(false)}
          {...resto}
        />
        {mayus && <span className="c-clave__mayus">{t.mayusculas}</span>}
        <button type="button" className="c-clave__ver" aria-pressed={visible} aria-label={visible ? t.ocultar : t.mostrar} title={visible ? t.ocultar : t.mostrar} onClick={() => setVisible(!visible)}>
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
      {error && <span id={`${id}-error`} className="c-campo__error"><CircleAlert aria-hidden="true" />{error}</span>}

      {fuerza && (
        <div id={`${id}-reglas`} className="c-clave__fuerza" data-tramo={clave ? tramo : undefined}>
          <div className="c-clave__medidor" aria-hidden="true">
            {[1, 2, 3, 4].map((n) => <span key={n} data-lleno={clave && n <= Math.max(1, tramo) ? '' : undefined} style={{ '--i': n - 1 }} />)}
          </div>
          {clave && <span className="c-clave__nivel">{t.seguridad}: <b>{niveles[tramo]}</b></span>}
          <ul className="c-clave__reglas">
            {reglas.map((r) => {
              const cumple = fuerza.cumplidas.includes(r.id);
              return (
                <li key={r.id} data-cumple={cumple || undefined}>
                  <span className="c-clave__marca" aria-hidden="true"><Check /></span>
                  {r.texto}
                  <span className="oculto-accesible">{cumple ? ' (cumplido)' : ' (falta)'}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

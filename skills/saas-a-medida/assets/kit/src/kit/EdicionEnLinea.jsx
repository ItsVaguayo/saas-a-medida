// 32 · EdicionEnLinea. Cambiar un dato donde se lee, sin abrir un formulario: se pulsa, se escribe,
// Intro guarda y Escape lo deja como estaba. Si el servidor falla, lo escrito no se pierde.
import { Check, LoaderCircle, Pencil } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { cx } from './interno.js';
import './EdicionEnLinea.css';

/** @param valor     el texto actual
    @param alGuardar (nuevo) => void | Promise. Si se rechaza, se enseña el mensaje del error y se sigue editando
    @param etiqueta  nombre del dato para el lector de pantalla: «Teléfono»
    @param validar   (nuevo) => mensaje de error o nada
    @param vacio     qué se lee cuando no hay dato: «Sin teléfono» */
export function EdicionEnLinea({ valor, alGuardar, etiqueta, validar, vacio = 'Añadir', type = 'text', className, ...resto }) {
  const id = useId();
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState(valor ?? '');
  const [estado, setEstado] = useState('reposo'); // reposo | guardando | hecho
  const [error, setError] = useState(null);
  const campo = useRef(null);
  const boton = useRef(null);
  const volverAlBoton = useRef(false);

  useEffect(() => {
    if (editando) campo.current?.select();
    else if (volverAlBoton.current) { volverAlBoton.current = false; boton.current?.focus(); }
  }, [editando]);
  useEffect(() => {
    if (estado !== 'hecho') return undefined;
    const t = setTimeout(() => setEstado('reposo'), 1400);
    return () => clearTimeout(t);
  }, [estado]);

  const abrir = () => { setBorrador(valor ?? ''); setError(null); setEditando(true); };
  const salir = (conFoco) => { volverAlBoton.current = conFoco; setEditando(false); setError(null); };

  const guardar = async (conFoco) => {
    if (estado === 'guardando') return;
    const nuevo = borrador.trim();
    if (nuevo === (valor ?? '')) { salir(conFoco); return; }
    const fallo = validar?.(nuevo);
    if (fallo) { setError(fallo); campo.current?.focus(); return; }
    setEstado('guardando');
    try {
      await alGuardar(nuevo);
      setEstado('hecho');
      salir(conFoco);
    } catch (e) {
      setEstado('reposo');
      setError(e?.message || 'No se ha guardado');
      campo.current?.focus();
    }
  };

  if (!editando) {
    return (
      <button ref={boton} type="button" className={cx('k-enlinea', className)} data-vacio={valor ? undefined : ''} data-estado={estado} aria-label={`${etiqueta}: ${valor || vacio}. Editar`} onClick={abrir}>
        <span className="k-enlinea__valor">{valor || vacio}</span>
        {estado === 'hecho' ? <Check className="k-enlinea__hecho" aria-hidden="true" /> : <Pencil className="k-enlinea__lapiz" aria-hidden="true" />}
      </button>
    );
  }

  return (
    <span className={cx('k-enlinea k-enlinea--editando', className)}>
      <input
        ref={campo}
        type={type}
        className="k-control"
        aria-label={etiqueta}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-busy={estado === 'guardando' || undefined}
        readOnly={estado === 'guardando'}
        value={borrador}
        onChange={(e) => { setBorrador(e.target.value); setError(null); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); guardar(true); }
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); salir(true); }
        }}
        // Salir del campo guarda, como en una hoja de cálculo. Con un error a la vista no se insiste
        onBlur={() => { if (!error) guardar(false); }}
        {...resto}
      />
      {estado === 'guardando' && <LoaderCircle className="k-enlinea__guardando" aria-hidden="true" />}
      {error && <span id={`${id}-error`} className="k-enlinea__error" role="alert">{error}</span>}
    </span>
  );
}

// 14 · BotonEstado. Un botón que cuenta lo que pasa con su acción: guarda, ha guardado o ha fallado.
// Mientras guarda no admite un segundo clic, así que no hay envíos dobles.
import { Check, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cx } from './interno.js';
import './BotonEstado.css';

/** @param alPulsar   función que devuelve una promesa. Si se rechaza, el botón enseña `textoError`
    @param cargando   texto mientras dura: «Guardando»
    @param hecho      texto al terminar bien: «Guardado»
    @param textoError texto al fallar: «No se ha guardado»
    @param variante   la misma que Boton */
export function BotonEstado({ alPulsar, children, cargando = 'Guardando', hecho = 'Guardado', textoError = 'No se ha guardado', variante = 'principal', icono: Icono, className, disabled, ...resto }) {
  const [estado, setEstado] = useState('reposo');
  const vuelta = useRef();
  const vivo = useRef(true);
  useEffect(() => { vivo.current = true; return () => { vivo.current = false; clearTimeout(vuelta.current); }; }, []);

  const pulsar = async (evento) => {
    if (estado === 'cargando') return;
    clearTimeout(vuelta.current);
    setEstado('cargando');
    let resultado = 'hecho';
    try { await alPulsar?.(evento); } catch { resultado = 'error'; }
    if (!vivo.current) return;
    setEstado(resultado);
    vuelta.current = setTimeout(() => setEstado('reposo'), resultado === 'hecho' ? 1600 : 2600);
  };

  const caras = [
    ['reposo', Icono, children],
    ['cargando', LoaderCircle, cargando],
    ['hecho', Check, hecho],
    ['error', TriangleAlert, textoError],
  ];

  return (
    <button
      type="button"
      className={cx('k-boton', `k-boton--${variante}`, 'k-boton-estado', className)}
      data-estado={estado}
      aria-disabled={estado === 'cargando' || undefined}
      disabled={disabled}
      onClick={pulsar}
      {...resto}
    >
      {/* Las cuatro caras ocupan la misma celda: el botón mide siempre lo que la más ancha y no baila */}
      {caras.map(([nombre, Ico, texto]) => (
        <span key={nombre} className="k-boton-estado__cara" data-cara={nombre} aria-hidden={estado !== nombre}>
          {Ico && <Ico aria-hidden="true" />}
          {texto}
        </span>
      ))}
      <span className="oculto-accesible" role="status">{estado === 'hecho' ? hecho : estado === 'error' ? textoError : ''}</span>
    </button>
  );
}

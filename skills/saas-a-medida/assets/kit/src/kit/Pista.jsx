// 25 · Pista. El nombre de un botón de icono, y su atajo, al pasar el ratón o al llegar con el teclado.
// La primera tarda un momento en salir; si se sigue recorriendo la barra, las siguientes salen al instante.
import { useEffect, useId, useRef, useState } from 'react';
import { Teclas } from './Paleta.jsx';
import './Pista.css';

const ESPERA = 450;
const CALIENTE = 500;
let ultimaVez = 0;

/** Envuelve un botón de icono. No lleva información imprescindible ni repite una etiqueta que ya se lee.
    @param texto una o dos palabras: «Editar»
    @param atajo «e», «mod+k»
    @param lado  'arriba' | 'abajo' */
export function Pista({ texto, atajo, lado = 'arriba', children }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [alInstante, setAlInstante] = useState(false);
  const espera = useRef();

  const mostrar = (ya) => {
    clearTimeout(espera.current);
    const caliente = Date.now() - ultimaVez < CALIENTE;
    setAlInstante(caliente);
    if (ya || caliente) setVisible(true);
    else espera.current = setTimeout(() => setVisible(true), ESPERA);
  };
  const ocultar = () => {
    clearTimeout(espera.current);
    setVisible((estaba) => { if (estaba) ultimaVez = Date.now(); return false; });
  };

  useEffect(() => () => clearTimeout(espera.current), []);
  useEffect(() => {
    if (!visible) return undefined;
    const tecla = (e) => { if (e.key === 'Escape') ocultar(); };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [visible]);

  return (
    <span
      className="k-pista"
      // Con el dedo no hay «pasar por encima»: en táctil la pista no sale y no estorba al tocar
      onPointerEnter={(e) => e.pointerType === 'mouse' && mostrar(false)}
      onPointerLeave={ocultar}
      onPointerDown={ocultar}
      onFocus={(e) => e.target.matches?.(':focus-visible') && mostrar(true)}
      onBlur={ocultar}
    >
      {children}
      {visible && (
        <span className="k-pista__globo" id={id} role="tooltip" data-lado={lado} data-al-instante={alInstante || undefined}>
          {texto}
          {atajo && <Teclas atajo={atajo} />}
        </span>
      )}
    </span>
  );
}

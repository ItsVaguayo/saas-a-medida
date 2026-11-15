// 09 · CifraAnimada. Un número que cuenta desde el valor anterior hasta el nuevo.
// Deja ver que el dato ha cambiado (un total que se recalcula al filtrar), no es decoración de portada.
import { useEffect, useRef } from 'react';
import { numero } from './formato.js';
import { sinMovimiento } from './interno.js';

const frenar = (t) => 1 - (1 - t) ** 4;

/** @param valor    número final
    @param formato  (n) => texto. Por defecto, miles con punto
    @param duracion milisegundos
    @param desde    valor del que parte la primera vez (por defecto, el propio valor: no anima al montarse) */
export function CifraAnimada({ valor, formato = numero, duracion = 700, desde, className }) {
  const ref = useRef(null);
  const actual = useRef(desde ?? valor);

  useEffect(() => {
    const origen = actual.current;
    const nodo = ref.current;
    if (origen === valor || sinMovimiento() || typeof requestAnimationFrame !== 'function') {
      actual.current = valor;
      nodo.textContent = formato(valor);
      return undefined;
    }
    let cuadro;
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion);
      // Se guarda por dónde va: si el valor cambia a mitad, la siguiente cuenta sale desde aquí y no da un salto
      actual.current = origen + (valor - origen) * frenar(t);
      nodo.textContent = formato(t === 1 ? valor : actual.current);
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, formato, duracion]);

  // El lector de pantalla oye solo el valor final, no los intermedios
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span ref={ref} aria-hidden="true">{formato(actual.current)}</span>
      <span className="oculto-accesible">{formato(valor)}</span>
    </span>
  );
}

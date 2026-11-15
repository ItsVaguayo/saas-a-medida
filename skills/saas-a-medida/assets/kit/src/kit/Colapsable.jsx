// 11 · Colapsable y Acordeón. Contenido que se abre y se cierra animando su altura real,
// sin medir nada con JavaScript: una rejilla que pasa de 0fr a 1fr.
import { ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { cx } from './interno.js';
import './Colapsable.css';

/** Funciona solo (guarda su estado) o controlado con `abierto` y `alCambiar`.
    @param titulo  texto o nodo del botón
    @param detalle texto corto a la derecha del título (un contador, un estado) */
export function Colapsable({ titulo, detalle, abierto, abiertoInicial = false, alCambiar, children, className }) {
  const id = useId();
  const [propio, setPropio] = useState(abiertoInicial);
  const esta = abierto ?? propio;
  const alternar = () => {
    setPropio(!esta);
    alCambiar?.(!esta);
  };
  return (
    <div className={cx('k-colapsable', className)} data-abierto={esta || undefined}>
      <button type="button" className="k-colapsable__boton" aria-expanded={esta} aria-controls={`${id}-panel`} id={`${id}-boton`} onClick={alternar}>
        <span className="k-colapsable__titulo">{titulo}</span>
        {detalle && <span className="k-colapsable__detalle">{detalle}</span>}
        <ChevronDown className="k-colapsable__flecha" aria-hidden="true" />
      </button>
      {/* `inert` saca lo plegado del teclado y del lector sin desmontarlo: lo escrito dentro no se pierde */}
      <div className="k-colapsable__panel" id={`${id}-panel`} role="region" aria-labelledby={`${id}-boton`} inert={!esta}>
        <div className="k-colapsable__dentro">
          <div className="k-colapsable__contenido">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Varios colapsables juntos. Con `unico`, abrir uno cierra el anterior.
    @param elementos [{ id, titulo, detalle, contenido }] */
export function Acordeon({ elementos, unico = false, abiertos: iniciales = [] }) {
  const [abiertos, setAbiertos] = useState(iniciales);
  const cambiar = (id, abrir) => setAbiertos((previos) => {
    if (!abrir) return previos.filter((x) => x !== id);
    return unico ? [id] : [...previos, id];
  });
  return (
    <div className="k-acordeon">
      {elementos.map((e) => (
        <Colapsable key={e.id} titulo={e.titulo} detalle={e.detalle} abierto={abiertos.includes(e.id)} alCambiar={(abrir) => cambiar(e.id, abrir)}>
          {e.contenido}
        </Colapsable>
      ))}
    </div>
  );
}

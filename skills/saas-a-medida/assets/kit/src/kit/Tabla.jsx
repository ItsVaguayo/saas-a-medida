// 26 · Tabla. Para comparar filas: ordena, selecciona varias (con Mayús, el tramo entero) y enseña sus acciones.
// Trae resueltos los estados que se olvidan: cargando, vacía, con error, y los datos que faltan o no caben.
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { EsqueletoTabla } from './Esqueleto.jsx';
import { plural } from './formato.js';
import { useSeleccion } from './hooks.js';
import { cx } from './interno.js';
import './Tabla.css';

const comparador = new Intl.Collator('es-ES', { numeric: true, sensitivity: 'base' });
const valorDe = (columna, fila) => (columna.valor ? columna.valor(fila) : fila[columna.clave]);
const falta = (v) => v === null || v === undefined || v === '';

/** Ordena sin tocar la lista original. Los textos, como en un diccionario español («Álvarez» junto a «Alonso»);
    lo que falta, siempre al final, se ordene hacia donde se ordene. */
export function ordenarFilas(filas, columnas, orden) {
  const columna = columnas.find((c) => c.clave === orden?.clave);
  if (!columna) return filas;
  const signo = orden.sentido === 'desc' ? -1 : 1;
  return [...filas].sort((a, b) => {
    const va = valorDe(columna, a);
    const vb = valorDe(columna, b);
    if (falta(va) || falta(vb)) return falta(va) - falta(vb);
    return signo * (typeof va === 'number' && typeof vb === 'number' ? va - vb : comparador.compare(String(va), String(vb)));
  });
}

function CasillaTodas({ estado, alCambiar }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.indeterminate = estado === 'algunos'; }, [estado]);
  return <input ref={ref} type="checkbox" className="k-casilla" aria-label="Seleccionar todas" checked={estado === 'todos'} onChange={alCambiar} />;
}

/** @param columnas  [{ clave, titulo, alinear: 'derecha', ordenable, ancho, valor: (fila) => dato para ordenar, pintar: (fila) => nodo }]
    @param filas     lista de objetos
    @param claveFila (fila) => id. Por defecto, fila.id
    @param estado    'listo' | 'cargando' | 'error'
    @param vacio     nodo cuando no hay filas (un <Vacio />)
    @param error     nodo cuando falla la carga (un <ErrorCarga />)
    @param seleccionable añade las casillas. `acciones` es (ids, limpiar) => botones para lo seleccionado
    @param orden / alOrdenar  para ordenar en el servidor. Sin ellos, la tabla ordena lo que tiene
    @param alAbrir   (fila) => void: la fila entera se puede pulsar
    @param menuFila  (fila) => nodo en la última columna (un <Menu />)
    @param titulo    nombre de la tabla para el lector de pantalla */
export function Tabla({
  columnas, filas, claveFila = (f) => f.id, estado = 'listo', vacio, error, titulo,
  seleccionable, acciones, orden: ordenDeFuera, alOrdenar, alAbrir, menuFila, className,
}) {
  const [ordenPropio, setOrdenPropio] = useState(null);
  const orden = ordenDeFuera ?? ordenPropio;
  const visibles = useMemo(() => (alOrdenar ? filas : ordenarFilas(filas, columnas, orden)), [filas, columnas, orden, alOrdenar]);
  const ids = useMemo(() => visibles.map(claveFila), [visibles, claveFila]);
  const sel = useSeleccion(ids);

  const ordenarPor = (clave) => {
    // Tres pulsaciones: ascendente, descendente y sin orden
    const siguiente = orden?.clave !== clave ? { clave, sentido: 'asc' } : orden.sentido === 'asc' ? { clave, sentido: 'desc' } : null;
    if (alOrdenar) alOrdenar(siguiente); else setOrdenPropio(siguiente);
  };

  const abrir = (fila, e) => {
    if (!alAbrir || e.target.closest('button, a, input, label, [role="menu"]')) return;
    if (window.getSelection?.().toString()) return; // estaba seleccionando texto, no pulsando
    alAbrir(fila);
  };

  if (estado === 'cargando') return <div className={cx('k-tabla', className)}><EsqueletoTabla columnas={Math.min(columnas.length, 5)} /></div>;
  if (estado === 'error') return <div className={cx('k-tabla', className)}>{error}</div>;
  if (!filas.length) return <div className={cx('k-tabla', className)}>{vacio}</div>;

  return (
    <div className={cx('k-tabla', className)}>
      <div className="k-tabla__desplaza">
        <table>
          {titulo && <caption className="oculto-accesible">{titulo}</caption>}
          <thead>
            <tr>
              {seleccionable && (
                <th className="k-tabla__casilla">
                  <CasillaTodas estado={sel.estado} alCambiar={() => (sel.estado === 'todos' ? sel.ninguno() : sel.todos())} />
                </th>
              )}
              {columnas.map((c) => {
                const mio = orden?.clave === c.clave;
                const Flecha = !mio ? ChevronsUpDown : orden.sentido === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th key={c.clave} scope="col" data-alinear={c.alinear} style={{ width: c.ancho }} aria-sort={mio ? (orden.sentido === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.ordenable ? (
                      <button type="button" className="k-tabla__ordenar" data-activo={mio || undefined} onClick={() => ordenarPor(c.clave)}>
                        {c.titulo}<Flecha aria-hidden="true" />
                      </button>
                    ) : c.titulo}
                  </th>
                );
              })}
              {menuFila && <th className="k-tabla__menu"><span className="oculto-accesible">Acciones</span></th>}
            </tr>
          </thead>
          <tbody>
            {visibles.map((fila) => {
              const id = claveFila(fila);
              const marcada = sel.esta(id);
              return (
                <tr
                  key={id}
                  data-marcada={marcada || undefined}
                  data-pulsable={alAbrir ? '' : undefined}
                  tabIndex={alAbrir ? 0 : undefined}
                  onClick={(e) => abrir(fila, e)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) alAbrir?.(fila); }}
                >
                  {seleccionable && (
                    <td className="k-tabla__casilla">
                      <input type="checkbox" className="k-casilla" aria-label="Seleccionar fila" checked={marcada} onChange={() => {}} onClick={(e) => sel.alternar(id, e)} />
                    </td>
                  )}
                  {columnas.map((c) => {
                    const dato = c.pintar ? c.pintar(fila) : fila[c.clave];
                    return (
                      <td key={c.clave} data-alinear={c.alinear}>
                        {/* Lo que falta se pinta con una raya; lo que no cabe se corta con puntos suspensivos */}
                        {falta(dato) ? <span className="k-tabla__falta">—</span> : <span className="k-tabla__dato" title={typeof dato === 'string' ? dato : undefined}>{dato}</span>}
                      </td>
                    );
                  })}
                  {menuFila && <td className="k-tabla__menu">{menuFila(fila)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {seleccionable && sel.seleccion.size > 0 && (
        <div className="k-tabla__barra" role="toolbar" aria-label="Acciones para lo seleccionado">
          <span className="k-tabla__cuenta" aria-live="polite">{plural(sel.seleccion.size, 'seleccionada', 'seleccionadas')}</span>
          {acciones?.([...sel.seleccion], sel.ninguno)}
          <Boton variante="discreto" tamano="chico" icono={X} aria-label="Quitar selección" onClick={sel.ninguno} />
        </div>
      )}
    </div>
  );
}

// 14 · Lista clasificada. Los que más: páginas más vistas, clientes que más facturan, orígenes de las altas.
// Cada fila lleva detrás una barra con su peso. Referencias: Plausible, Vercel Analytics, Tremor (BarList).
import { ChevronDown } from 'lucide-react';
import { useRef, useState } from 'react';
import { numero } from './formato.js';
import { cx, useEnVista } from './interno.js';
import './ListaClasificada.css';

/** @param datos    [{ nombre, valor, href?, icono?, alPulsar? }]
    @param formato  (n) => texto
    @param maximo   cuántas filas se ven antes de «Ver todos»
    @param ordenar  de mayor a menor (true por defecto); con false respeta el orden que llega
    @param columnas ['Origen', 'Visitas'], rótulos opcionales sobre la lista */
export function ListaClasificada({ datos, formato = numero, maximo = 5, ordenar = true, columnas, textos, className }) {
  const t = { verTodos: (n) => `Ver los ${n}`, verMenos: 'Ver menos', ...textos };
  const caja = useRef(null);
  const visto = useEnVista(caja);
  const [entera, setEntera] = useState(false);
  const filas = ordenar ? [...datos].sort((a, b) => b.valor - a.valor) : datos;
  const tope = Math.max(...filas.map((f) => f.valor), 0) || 1;
  const sobran = filas.length > maximo;

  const pintar = (fila, i) => {
    const Icono = fila.icono;
    const Como = fila.href ? 'a' : fila.alPulsar ? 'button' : 'span';
    return (
      <li key={fila.nombre} className="c-clasificada__fila" style={{ '--parte': visto ? fila.valor / tope : 0, '--i': Math.min(i, 12) }}>
        <span className="c-clasificada__barra" aria-hidden="true" />
        <Como
          className="c-clasificada__nombre"
          {...(fila.href ? { href: fila.href } : fila.alPulsar ? { type: 'button', onClick: fila.alPulsar } : null)}
        >
          {Icono && <Icono aria-hidden="true" />}
          <span>{fila.nombre}</span>
        </Como>
        <span className="c-clasificada__valor">{formato(fila.valor)}</span>
      </li>
    );
  };

  return (
    <div ref={caja} className={cx('c-clasificada', className)}>
      {columnas && <div className="c-clasificada__columnas" aria-hidden="true"><span>{columnas[0]}</span><span>{columnas[1]}</span></div>}
      <ol className="c-clasificada__lista">{filas.slice(0, maximo).map(pintar)}</ol>
      {sobran && (
        <>
          <div className="c-clasificada__resto" data-abierto={entera || undefined}>
            <ol className="c-clasificada__lista" inert={!entera}>{filas.slice(maximo).map((f, i) => pintar(f, i))}</ol>
          </div>
          <button type="button" className="c-clasificada__mas" aria-expanded={entera} onClick={() => setEntera(!entera)}>
            {entera ? t.verMenos : t.verTodos(filas.length)}
            <ChevronDown aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}

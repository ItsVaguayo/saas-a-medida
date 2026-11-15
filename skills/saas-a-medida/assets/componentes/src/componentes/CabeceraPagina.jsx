// 02 · Cabecera de página. Dónde estás (ruta), qué es (título con su recuento y estado) y qué se puede
// hacer (acciones). Referencias: Stripe, Shopify Polaris, GitHub.
import { ChevronRight, Ellipsis } from 'lucide-react';
import { Fragment, useState } from 'react';
import { cx } from './interno.js';
import './CabeceraPagina.css';

/** Ruta de migas. Si es larga, guarda las del medio detrás de «…» y las enseña al pulsarlo.
    @param elementos [{ texto, href?, alPulsar? }]  El último es la página actual y no es enlace
    @param maximo    cuántas caben antes de plegar las del medio */
export function Migas({ elementos, maximo = 4, etiqueta = 'Ruta', textoPlegadas = 'Ver la ruta completa', className }) {
  const [entera, setEntera] = useState(false);
  const plegar = !entera && elementos.length > maximo;
  const visibles = plegar ? [elementos[0], null, ...elementos.slice(-(maximo - 2))] : elementos;
  return (
    <nav className={cx('c-migas', className)} aria-label={etiqueta}>
      <ol>
        {visibles.map((miga, i) => {
          const ultima = i === visibles.length - 1;
          return (
            <Fragment key={miga ? `${miga.texto}-${i}` : 'plegadas'}>
              <li className="c-migas__miga" data-nueva={entera || undefined}>
                {miga === null && (
                  <button type="button" className="c-migas__enlace c-migas__mas" aria-label={textoPlegadas} onClick={() => setEntera(true)}>
                    <Ellipsis aria-hidden="true" />
                  </button>
                )}
                {miga && ultima && <span className="c-migas__actual" aria-current="page">{miga.texto}</span>}
                {miga && !ultima && (miga.href
                  ? <a className="c-migas__enlace" href={miga.href} onClick={miga.alPulsar}>{miga.texto}</a>
                  : <button type="button" className="c-migas__enlace" onClick={miga.alPulsar}>{miga.texto}</button>)}
              </li>
              {!ultima && <li className="c-migas__separador" aria-hidden="true"><ChevronRight /></li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/** @param titulo    el nombre de lo que se ve: «Clientes», «Factura F-2026-0142»
    @param recuento  cifra junto al título: «128»
    @param estado    nodo junto al título, normalmente una <Etiqueta>
    @param migas     elementos para <Migas>
    @param acciones  nodo con los botones; el principal va el último
    @param fija      se queda pegada arriba al hacer scroll
    @param nivel     nivel del encabezado (1 por defecto)
    @param children  lo que va debajo: pestañas, filtros, un resumen */
export function CabeceraPagina({ titulo, recuento, estado, migas, acciones, fija, nivel = 1, children, className }) {
  const Titulo = `h${nivel}`;
  return (
    <header className={cx('c-cabecera', fija && 'c-cabecera--fija', className)}>
      {migas?.length > 0 && <Migas elementos={migas} />}
      <div className="c-cabecera__fila">
        <div className="c-cabecera__titulo">
          <Titulo>{titulo}</Titulo>
          {recuento !== undefined && recuento !== null && <span className="c-cabecera__recuento">{recuento}</span>}
          {estado}
        </div>
        {acciones && <div className="c-cabecera__acciones">{acciones}</div>}
      </div>
      {children && <div className="c-cabecera__bajo">{children}</div>}
    </header>
  );
}

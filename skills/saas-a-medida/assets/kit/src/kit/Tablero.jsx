// 31 · Tablero. Columnas por estado y tarjetas que se arrastran de una a otra (oportunidades, pedidos, tareas).
// Con ratón se arrastra la tarjeta entera; con el dedo, desde su asa, para no pelearse con el desplazamiento.
// Con teclado: Alt y las flechas mueven la tarjeta que tiene el foco, y el cambio se anuncia.
import { GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ListaAnimada } from './ListaAnimada.jsx';
import { cx } from './interno.js';
import './Tablero.css';

const HUECO = '__hueco__';

/** Devuelve la lista con la tarjeta `id` colocada en `columna`, en la posición `indice` de esa columna.
    El orden de la lista es el orden dentro de cada columna. */
export function moverTarjeta(tarjetas, id, columna, indice) {
  const tarjeta = tarjetas.find((t) => t.id === id);
  if (!tarjeta) return tarjetas;
  const resto = tarjetas.filter((t) => t.id !== id);
  const deLaColumna = resto.filter((t) => t.columna === columna);
  const antesDe = deLaColumna[indice];
  const posicion = antesDe ? resto.indexOf(antesDe) : resto.length;
  return [...resto.slice(0, posicion), { ...tarjeta, columna }, ...resto.slice(posicion)];
}

/** @param columnas [{ id, titulo }]
    @param tarjetas [{ id, columna, titulo, ... }]. `titulo` se usa para anunciar los movimientos
    @param alMover  (id, columna, indice) => void. Lo normal: setTarjetas((t) => moverTarjeta(t, id, columna, indice))
    @param children (tarjeta) => contenido de la tarjeta
    @param pie      (columna, tarjetas de la columna) => nodo bajo cada columna (un total, «Añadir») */
export function Tablero({ columnas, tarjetas, alMover, children, pie, className }) {
  const raiz = useRef(null);
  const [arrastre, setArrastre] = useState(null); // { id, x, y, dx, dy, ancho, alto, columna, indice }
  const [anuncio, setAnuncio] = useState('');
  const inicio = useRef(null);
  const estado = useRef(null);
  estado.current = arrastre;
  const deColumna = (id) => tarjetas.filter((t) => t.columna === id);

  useEffect(() => {
    const destinoEn = (x, y) => {
      const columna = document.elementsFromPoint(x, y).find((el) => el.dataset?.columna && raiz.current.contains(el));
      if (!columna) return null;
      const hermanas = [...columna.querySelectorAll('[data-tarjeta]')];
      const indice = hermanas.filter((el) => { const r = el.getBoundingClientRect(); return y > r.top + r.height / 2; }).length;
      return { columna: columna.dataset.columna, indice };
    };

    const mover = (e) => {
      const i = inicio.current;
      if (!i) return;
      if (!estado.current) {
        if (Math.hypot(e.clientX - i.x, e.clientY - i.y) < 5) return; // un clic con el pulso flojo no es arrastrar
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }
      const destino = destinoEn(e.clientX, e.clientY) ?? { columna: estado.current?.columna ?? i.columna, indice: estado.current?.indice ?? i.indice };
      setArrastre({ id: i.id, x: e.clientX, y: e.clientY, dx: i.dx, dy: i.dy, ancho: i.ancho, alto: i.alto, ...destino });
    };
    const soltar = () => {
      const a = estado.current;
      inicio.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      if (!a) return;
      setArrastre(null);
      alMover(a.id, a.columna, a.indice);
    };
    const tecla = (e) => { if (e.key === 'Escape' && estado.current) { inicio.current = null; setArrastre(null); document.body.style.userSelect = ''; document.body.style.cursor = ''; } };

    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
    window.addEventListener('keydown', tecla);
    return () => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      window.removeEventListener('keydown', tecla);
    };
  }, [alMover]);

  const agarrar = (e, tarjeta) => {
    if (e.button !== 0 || e.target.closest('button:not(.k-tablero__asa), a, input')) return;
    if (e.pointerType !== 'mouse' && !e.target.closest('.k-tablero__asa')) return;
    const r = e.currentTarget.getBoundingClientRect();
    inicio.current = {
      id: tarjeta.id, x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, ancho: r.width, alto: r.height,
      columna: tarjeta.columna, indice: deColumna(tarjeta.columna).indexOf(tarjeta),
    };
  };

  const conTeclado = (e, tarjeta) => {
    if (!e.altKey || !e.key.startsWith('Arrow')) return;
    e.preventDefault();
    const c = columnas.findIndex((x) => x.id === tarjeta.columna);
    const indice = deColumna(tarjeta.columna).indexOf(tarjeta);
    let destino = { columna: tarjeta.columna, indice };
    if (e.key === 'ArrowLeft' && c > 0) destino = { columna: columnas[c - 1].id, indice: 0 };
    if (e.key === 'ArrowRight' && c < columnas.length - 1) destino = { columna: columnas[c + 1].id, indice: 0 };
    if (e.key === 'ArrowUp') destino.indice = Math.max(0, indice - 1);
    if (e.key === 'ArrowDown') destino.indice = Math.min(deColumna(tarjeta.columna).length - 1, indice + 1);
    if (destino.columna === tarjeta.columna && destino.indice === indice) return;
    alMover(tarjeta.id, destino.columna, destino.indice);
    const nombre = columnas.find((x) => x.id === destino.columna).titulo;
    setAnuncio(`${tarjeta.titulo ?? 'Tarjeta'}: ${nombre}, posición ${destino.indice + 1}`);
    // El foco sigue a la tarjeta, que se ha vuelto a pintar en otro sitio
    requestAnimationFrame(() => raiz.current?.querySelector(`[data-tarjeta="${tarjeta.id}"]`)?.focus());
  };

  const enVuelo = arrastre && tarjetas.find((t) => t.id === arrastre.id);

  return (
    <div className={cx('k-tablero', className)} ref={raiz} data-arrastrando={arrastre ? '' : undefined}>
      {columnas.map((col) => {
        const propias = deColumna(col.id);
        const visibles = propias.filter((t) => t.id !== arrastre?.id);
        if (arrastre?.columna === col.id) visibles.splice(Math.min(arrastre.indice, visibles.length), 0, { id: HUECO });
        return (
          <section key={col.id} className="k-tablero__columna" data-columna={col.id} data-destino={arrastre?.columna === col.id || undefined} aria-label={col.titulo}>
            <header className="k-tablero__cabecera">
              <h3>{col.titulo}</h3>
              <span className="k-tablero__cuenta">{propias.length}</span>
            </header>
            <ListaAnimada elementos={visibles} clave={(t) => String(t.id)} como="div" sinSalida className="k-tablero__lista">
              {(t) => (t.id === HUECO
                ? <div className="k-tablero__hueco" style={{ height: arrastre.alto }} />
                : (
                  <article
                    className="k-tablero__tarjeta"
                    data-tarjeta={t.id}
                    tabIndex={0}
                    aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight Alt+ArrowUp Alt+ArrowDown"
                    onPointerDown={(e) => agarrar(e, t)}
                    onKeyDown={(e) => conTeclado(e, t)}
                  >
                    <button type="button" className="k-tablero__asa" tabIndex={-1} aria-hidden="true"><GripVertical /></button>
                    <div className="k-tablero__contenido">{children(t)}</div>
                  </article>
                ))}
            </ListaAnimada>
            {pie && <footer className="k-tablero__pie">{pie(col, propias)}</footer>}
          </section>
        );
      })}
      {/* La tarjeta en el aire se pinta en el body: dentro del tablero la recortaría su desplazamiento */}
      {enVuelo && createPortal(
        <div className="k-tablero__vuelo" style={{ width: arrastre.ancho, transform: `translate(${arrastre.x - arrastre.dx}px, ${arrastre.y - arrastre.dy}px)` }} aria-hidden="true">
          <article className="k-tablero__tarjeta">
            <span className="k-tablero__asa"><GripVertical /></span>
            <div className="k-tablero__contenido">{children(enVuelo)}</div>
          </article>
        </div>,
        document.body,
      )}
      <span className="oculto-accesible" role="status">{anuncio}</span>
    </div>
  );
}

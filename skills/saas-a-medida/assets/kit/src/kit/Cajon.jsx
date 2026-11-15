// 18 · Cajón. Un panel que entra por el lado para ver o editar un registro sin perder la lista de detrás.
// En pantallas estrechas sube desde abajo, donde llega el pulgar.
import { X } from 'lucide-react';
import { useId } from 'react';
import { Boton } from './base.jsx';
import { useModal } from './Dialogo.jsx';
import { cx } from './interno.js';
import './Cajon.css';

/** @param titulo  nombre del registro o de la acción
    @param detalle línea corta bajo el título
    @param pie     botones fijos abajo. Siguen a la vista con el teclado del móvil abierto
    @param ancho   ancho en px en escritorio */
export function Cajon({ abierto, alCerrar, titulo, detalle, pie, ancho = 440, className, children }) {
  const id = useId();
  const modal = useModal(abierto, alCerrar);
  return (
    <dialog {...modal} className={cx('k-cajon', className)} style={{ '--ancho': `${ancho}px` }} aria-labelledby={`${id}-titulo`}>
      <div className="k-cajon__caja">
        <header className="k-cajon__cabecera">
          <div>
            <h2 id={`${id}-titulo`}>{titulo}</h2>
            {detalle && <p>{detalle}</p>}
          </div>
          <Boton variante="discreto" tamano="chico" icono={X} aria-label="Cerrar" onClick={alCerrar} />
        </header>
        <div className="k-cajon__cuerpo">{children}</div>
        {pie && <footer className="k-cajon__pie">{pie}</footer>}
      </div>
    </dialog>
  );
}

// 12 · Medidor de uso. Cuánto se lleva gastado de lo que incluye el plan: usuarios, almacenamiento, envíos.
// Avisa al acercarse al límite con color, icono y texto, nunca solo con color. Referencias: Vercel, GitHub, Supabase.
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { useRef } from 'react';
import { numero, porcentaje } from './formato.js';
import { cx, limitar, useEnVista } from './interno.js';
import './MedidorUso.css';

/** @param titulo   qué se mide: «Usuarios», «Almacenamiento»
    @param usado, limite  en la misma unidad
    @param formato  (n) => texto. Para GB: (n) => `${n} GB`
    @param aviso    proporción a partir de la cual avisa (0.8 = al 80 %)
    @param accion   nodo a la derecha del aviso: el botón «Ampliar plan»
    @param textos   { de, queda: (proporción) => texto, lleno } */
export function MedidorUso({ titulo, usado, limite, formato = numero, aviso = 0.8, icono: Icono, accion, textos, className }) {
  const t = { de: 'de', queda: (p) => `Queda el ${porcentaje(p, { decimales: 0 })}`, lleno: 'Límite alcanzado', ...textos };
  const caja = useRef(null);
  const visto = useEnVista(caja);
  const parte = limite > 0 ? usado / limite : 0;
  const estado = parte >= 1 ? 'lleno' : parte >= aviso ? 'aviso' : 'normal';
  const Aviso = estado === 'lleno' ? CircleAlert : TriangleAlert;

  return (
    <div ref={caja} className={cx('c-uso', className)} data-estado={estado}>
      <div className="c-uso__cabecera">
        <span className="c-uso__titulo">{Icono && <Icono aria-hidden="true" />}{titulo}</span>
        <span className="c-uso__cifras"><b>{formato(usado)}</b> {t.de} {formato(limite)}</span>
      </div>
      <div
        className="c-uso__pista"
        role="meter"
        aria-label={titulo}
        aria-valuemin={0}
        aria-valuemax={limite}
        aria-valuenow={usado}
        aria-valuetext={`${formato(usado)} ${t.de} ${formato(limite)}`}
      >
        <span className="c-uso__barra" style={{ '--parte': visto ? limitar(parte, 0, 1) : 0 }} />
        <span className="c-uso__umbral" style={{ '--umbral': aviso }} aria-hidden="true" />
      </div>
      {(estado !== 'normal' || accion) && (
        <div className="c-uso__pie">
          {estado !== 'normal' && (
            <span className="c-uso__aviso"><Aviso aria-hidden="true" />{estado === 'lleno' ? t.lleno : t.queda(1 - parte)}</span>
          )}
          {accion && <span className="c-uso__accion">{accion}</span>}
        </div>
      )}
    </div>
  );
}

/** Varios medidores en una tarjeta, con rayas entre ellos. */
export const Medidores = ({ children, className }) => <div className={cx('c-usos', className)}>{children}</div>;

// 38 · Estados. Lo que se ve cuando no hay datos: la lista vacía la primera vez, la búsqueda sin resultados,
// el error al cargar, la falta de permiso y la falta de conexión. Cada uno dice qué pasa y da una salida.
import { Inbox, Lock, SearchX, TriangleAlert, WifiOff } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { Boton } from './base.jsx';
import { BotonEstado } from './BotonEstado.jsx';
import { cx } from './interno.js';
import './Estados.css';

/** Molde común. @param tono 'neutro' | 'mal' */
export function Estado({ icono: Icono, titulo, detalle, tono = 'neutro', compacto, children, className, ...resto }) {
  return (
    <div className={cx('k-estado', compacto && 'k-estado--compacto', className)} data-tono={tono} {...resto}>
      {Icono && <span className="k-estado__icono" aria-hidden="true"><Icono /></span>}
      <h3>{titulo}</h3>
      {detalle && <p>{detalle}</p>}
      {children && <div className="k-estado__acciones">{children}</div>}
    </div>
  );
}

/** Lista vacía la primera vez: qué va aquí y el botón para crear el primero.
    @example <Vacio titulo="Aún no hay clientes" accion="Añadir cliente" alPulsar={nuevo} /> */
export function Vacio({ icono = Inbox, titulo, detalle, accion, alPulsar, ...resto }) {
  return (
    <Estado icono={icono} titulo={titulo} detalle={detalle} {...resto}>
      {accion && <Boton variante="principal" onClick={alPulsar}>{accion}</Boton>}
    </Estado>
  );
}

/** Vacío por un filtro o una búsqueda. Es distinto del anterior: aquí la salida es quitar el filtro. */
export function SinResultados({ que = 'resultado', consulta, alQuitar, ...resto }) {
  return (
    <Estado icono={SearchX} titulo={consulta ? `Ningún ${que} coincide con «${consulta}»` : `Ningún ${que} con estos filtros`} {...resto}>
      {alQuitar && <Boton onClick={alQuitar}>Quitar filtros</Boton>}
    </Estado>
  );
}

/** Error al cargar: qué ha pasado en una frase y un botón para reintentar. */
export function ErrorCarga({ titulo = 'No se ha podido cargar', detalle = 'Comprueba la conexión y vuelve a intentarlo', alReintentar, ...resto }) {
  return (
    <Estado icono={TriangleAlert} tono="mal" titulo={titulo} detalle={detalle} role="alert" {...resto}>
      {alReintentar && <BotonEstado variante="secundario" alPulsar={alReintentar} cargando="Cargando" hecho="Cargado" textoError="Sigue sin cargar">Reintentar</BotonEstado>}
    </Estado>
  );
}

/** Para quien llega por enlace a algo que su rol no puede ver. */
export function SinPermiso({ titulo = 'Sin acceso a esta página', detalle = 'Pide acceso a quien administra la cuenta', children, ...resto }) {
  return <Estado icono={Lock} titulo={titulo} detalle={detalle} {...resto}>{children}</Estado>;
}

const oirRed = (avisar) => {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => { window.removeEventListener('online', avisar); window.removeEventListener('offline', avisar); };
};
/** true mientras el navegador tiene red. */
export const useConexion = () => useSyncExternalStore(oirRed, () => navigator.onLine, () => true);

/** Franja que aparece sola al perder la conexión y se va al recuperarla. Se monta una vez, arriba de la app. */
export function SinConexion({ forzar = false }) {
  const conectado = useConexion();
  if (conectado && !forzar) return null;
  return (
    <div className="k-sin-conexion" role="status">
      <WifiOff aria-hidden="true" />
      <span><strong>Sin conexión</strong> · Los cambios se guardarán al volver</span>
    </div>
  );
}

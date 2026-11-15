// 07 · Tarjeta de métrica. Una cifra, cuánto ha cambiado y hacia dónde va.
// La cifra sube contando al aparecer y vuelve a contar cuando cambia. Referencias: Stripe, Tremor, Vercel Analytics.
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { useRef } from 'react';
import { numero, porcentaje } from './formato.js';
import { cx, useCifra, useEnVista } from './interno.js';
import { Minigrafico } from './Minigrafico.jsx';
import './TarjetaMetrica.css';

/** @param titulo     qué se mide: «Ingresos», «Clientes activos»
    @param valor      la cifra, en número
    @param formato    (n) => texto. Por defecto, número con puntos de millar; pasa `moneda` para importes
    @param variacion  cambio frente al periodo anterior, en proporción: 0.124 es +12,4 %
    @param invertida  cuando bajar es bueno (bajas, coste, tiempo de respuesta)
    @param periodo    con qué se compara: «frente a octubre»
    @param serie      [n, …] para el minigráfico
    @param cargando   enseña el hueco mientras llegan los datos
    @param alPulsar   si llega, la tarjeta entera es un botón (lleva al detalle) */
export function TarjetaMetrica({
  titulo, valor, formato = numero, variacion, invertida, periodo, serie, icono: Icono, cargando, alPulsar, className, ...resto
}) {
  const caja = useRef(null);
  const visto = useEnVista(caja);
  const pintado = useCifra(visto && !cargando ? valor : 0, 900);
  const conVariacion = typeof variacion === 'number' && !cargando;
  const sentido = !conVariacion || variacion === 0 ? 'igual' : variacion > 0 ? 'sube' : 'baja';
  const tono = sentido === 'igual' ? 'neutro' : (sentido === 'sube') !== Boolean(invertida) ? 'bien' : 'mal';
  const Flecha = { sube: ArrowUpRight, baja: ArrowDownRight, igual: Minus }[sentido];
  const Como = alPulsar ? 'button' : 'div';

  return (
    <Como
      ref={caja}
      {...(alPulsar ? { type: 'button', onClick: alPulsar } : null)}
      className={cx('c-metrica', alPulsar && 'c-metrica--pulsable', className)}
      data-tono={tono}
      aria-busy={cargando || undefined}
      {...resto}
    >
      <span className="c-metrica__titulo">
        {Icono && <Icono aria-hidden="true" />}
        {titulo}
      </span>
      {cargando ? (
        <span className="c-metrica__hueco" aria-hidden="true" />
      ) : (
        <span className="c-metrica__valor">
          {/* El lector de pantalla oye la cifra final, no el conteo */}
          <span aria-hidden="true">{formato(pintado)}</span>
          <span className="oculto-accesible">{formato(valor)}</span>
        </span>
      )}
      {(conVariacion || periodo) && (
        <span className="c-metrica__pie">
          {conVariacion && (
            <span className="c-metrica__variacion">
              <Flecha aria-hidden="true" />
              {porcentaje(variacion, { signo: true })}
            </span>
          )}
          {periodo && <span className="c-metrica__periodo">{periodo}</span>}
        </span>
      )}
      {serie?.length > 1 && !cargando && <Minigrafico className="c-metrica__serie" datos={serie} fluido alto={40} etiqueta={`Evolución de ${titulo}`} />}
    </Como>
  );
}

/** Rejilla que reparte las tarjetas: tantas columnas como quepan con `minimo` de ancho. */
export const Metricas = ({ minimo = 220, children, className }) => (
  <div className={cx('c-metricas', className)} style={{ '--minimo': `${minimo}px` }}>{children}</div>
);

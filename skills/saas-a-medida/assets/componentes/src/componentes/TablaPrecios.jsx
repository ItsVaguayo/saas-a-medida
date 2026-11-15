// 29 · Tabla de precios. Los planes lado a lado, con el cambio entre pago mensual y anual: el precio
// cuenta hasta la cifra nueva en vez de saltar. Sirve para la web y para «Cambiar de plan» dentro de la app.
// Referencias: Linear, Vercel, Notion, Stripe (pricing table).
import { Check, Minus } from 'lucide-react';
import { useId } from 'react';
import { Boton } from './base.jsx';
import { numero } from './formato.js';
import { cx, useCifra, useControlado } from './interno.js';
import './TablaPrecios.css';

function Precio({ importe, simbolo }) {
  const pintado = useCifra(importe, 500);
  return (
    <>
      <span aria-hidden="true">{numero(Math.round(pintado))} {simbolo}</span>
      <span className="oculto-accesible">{numero(importe)} {simbolo}</span>
    </>
  );
}

/** @param planes   [{ id, nombre, detalle?, precio: { mes, ano } | null, destacado?, etiqueta?, incluye, accion? }]
                    `precio.ano` es lo que se paga al año entero; `null` es «A medida».
                    `incluye`: ['Texto', { texto: 'Texto', incluido: false }]. `etiqueta`: «Más elegido».
                    `accion`: texto del botón (por defecto «Elegir {nombre}»)
    @param periodo  'mes' | 'ano', si lo controlas tú; si no, `periodoInicial`
    @param ahorro   texto junto a «Anual»: «2 meses gratis»
    @param actual   id del plan contratado: su botón pasa a «Plan actual»
    @param alElegir (id, periodo) => void
    @param simbolo, textos */
export function TablaPrecios({ planes, periodo, periodoInicial = 'mes', alCambiarPeriodo, ahorro, actual, alElegir, simbolo = '€', textos, className }) {
  const t = {
    mensual: 'Mensual', anual: 'Anual', porMes: 'al mes', facturadoAno: (n) => `${n} al año`, aMedida: 'A medida',
    elegir: (nombre) => `Elegir ${nombre}`, actual: 'Plan actual', periodo: 'Periodo de pago', ...textos,
  };
  const id = useId();
  const [cada, setCada] = useControlado(periodo, periodoInicial, alCambiarPeriodo);
  const anual = cada === 'ano';

  return (
    <div className={cx('c-precios', className)}>
      <div className="c-precios__periodo" role="radiogroup" aria-label={t.periodo} data-lado={anual ? 'fin' : 'inicio'}>
        <button type="button" role="radio" aria-checked={!anual} tabIndex={anual ? -1 : 0} onClick={() => setCada('mes')} onKeyDown={(e) => { if (e.key === 'ArrowRight') { setCada('ano'); e.currentTarget.nextElementSibling.focus(); } }}>{t.mensual}</button>
        <button type="button" role="radio" aria-checked={anual} tabIndex={anual ? 0 : -1} onClick={() => setCada('ano')} onKeyDown={(e) => { if (e.key === 'ArrowLeft') { setCada('mes'); e.currentTarget.previousElementSibling.focus(); } }}>
          {t.anual}{ahorro && <span className="c-precios__ahorro">{ahorro}</span>}
        </button>
      </div>

      <div className="c-precios__planes" style={{ '--planes': planes.length }}>
        {planes.map((plan) => {
          const esActual = plan.id === actual;
          const importe = plan.precio ? (anual ? plan.precio.ano / 12 : plan.precio.mes) : null;
          return (
            <article key={plan.id} className="c-plan" data-destacado={plan.destacado || undefined} aria-labelledby={`${id}-${plan.id}`}>
              {plan.etiqueta && <span className="c-plan__etiqueta">{plan.etiqueta}</span>}
              <h3 id={`${id}-${plan.id}`}>{plan.nombre}</h3>
              {plan.detalle && <p className="c-plan__detalle">{plan.detalle}</p>}
              <p className="c-plan__precio">
                {importe === null ? <span className="c-plan__cifra">{t.aMedida}</span> : (
                  <>
                    <span className="c-plan__cifra"><Precio importe={importe} simbolo={simbolo} /></span>
                    <span className="c-plan__cada">{t.porMes}</span>
                  </>
                )}
              </p>
              <p className="c-plan__nota" data-visible={(anual && importe !== null && importe > 0) || undefined}>
                {plan.precio ? t.facturadoAno(`${numero(plan.precio.ano)} ${simbolo}`) : ' '}
              </p>
              <Boton
                variante={plan.destacado && !esActual ? 'principal' : 'secundario'}
                bloque
                disabled={esActual}
                onClick={() => alElegir?.(plan.id, cada)}
              >
                {esActual ? t.actual : plan.accion ?? t.elegir(plan.nombre)}
              </Boton>
              <ul className="c-plan__incluye">
                {plan.incluye.map((linea) => {
                  const texto = typeof linea === 'string' ? linea : linea.texto;
                  const incluido = typeof linea === 'string' || linea.incluido !== false;
                  return (
                    <li key={texto} data-incluido={incluido || undefined}>
                      {incluido ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
                      <span>{texto}{!incluido && <span className="oculto-accesible"> (no incluido)</span>}</span>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </div>
  );
}

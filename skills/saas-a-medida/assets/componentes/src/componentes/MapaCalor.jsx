// 13 · Mapa de calor. La actividad de cada día de los últimos meses: qué semanas aprietan y cuáles no.
// Se recorre con las flechas, día a día y semana a semana. Referencias: GitHub (contribuciones), Cal.com, Plausible.
import { useMemo, useRef, useState } from 'react';
import { aFecha, claveDia, fechaCorta, numero } from './formato.js';
import { cx, useEnVista } from './interno.js';
import './MapaCalor.css';

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MES = new Intl.DateTimeFormat('es-ES', { month: 'short' });

/** @param datos    { '2026-11-15': 7, … }  cifra de cada día
    @param semanas  cuántas columnas (26 = medio año)
    @param hasta    último día pintado (hoy por defecto)
    @param unidad   ['pedido', 'pedidos'], para el texto de cada día
    @param alElegir (clave, cifra) => void, al pulsar un día
    Tamaño de celda: --calor-celda (13px). Color: --calor-color (el acento). */
export function MapaCalor({ datos = {}, semanas = 26, hasta = new Date(), unidad = ['actividad', 'actividades'], alElegir, titulo, textos, className }) {
  const t = { menos: 'Menos', mas: 'Más', sin: 'Sin', ...textos };
  const caja = useRef(null);
  const celdas = useRef({});
  const visto = useEnVista(caja);
  const [activa, setActiva] = useState(null);

  const { columnas, maximo, meses } = useMemo(() => {
    const fin = aFecha(hasta);
    const finDia = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate(), 12);
    // La última columna es la semana de `hasta`; cada columna va de lunes a domingo
    const lunes = new Date(finDia);
    lunes.setDate(finDia.getDate() - ((finDia.getDay() + 6) % 7) - (semanas - 1) * 7);
    const cols = [];
    let tope = 0;
    for (let c = 0; c < semanas; c += 1) {
      const dias = [];
      for (let f = 0; f < 7; f += 1) {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + c * 7 + f);
        if (dia > finDia) { dias.push(null); continue; }
        const clave = claveDia(dia);
        const n = Number(datos[clave]) || 0;
        tope = Math.max(tope, n);
        dias.push({ clave, n, dia, col: c, fila: f });
      }
      cols.push(dias);
    }
    // Un rótulo donde empieza cada mes, si le quedan al menos tres columnas para caber
    const rotulos = [];
    cols.forEach((dias, c) => {
      const mes = dias[0].dia.getMonth();
      const anterior = c === 0 ? null : cols[c - 1][0].dia.getMonth();
      if (mes !== anterior && c <= semanas - 3 && (rotulos.length === 0 || c - rotulos[rotulos.length - 1].col >= 3)) {
        rotulos.push({ col: c, texto: MES.format(dias[0].dia).replace('.', '') });
      }
    });
    return { columnas: cols, maximo: tope, meses: rotulos };
  }, [datos, semanas, hasta]);

  const nivel = (n) => (n <= 0 || maximo === 0 ? 0 : Math.max(1, Math.ceil((n / maximo) * 4)));
  const lectura = (c) => `${c.n > 0 ? `${numero(c.n)} ${c.n === 1 ? unidad[0] : unidad[1]}` : `${t.sin} ${unidad[1]}`} · ${DIAS[c.fila]} ${fechaCorta(c.dia)}`;
  const planas = columnas.flat().filter(Boolean);
  const conFoco = activa?.clave ?? planas[planas.length - 1]?.clave;
  const total = planas.reduce((suma, c) => suma + c.n, 0);

  const alTeclear = (e, c) => {
    const salto = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
    if (!salto) return;
    e.preventDefault();
    const destino = columnas[c.col + salto[0]]?.[c.fila + salto[1]];
    if (destino) celdas.current[destino.clave]?.focus();
  };

  return (
    <div ref={caja} className={cx('c-calor', className)} data-visto={visto || undefined} style={{ '--semanas': semanas }}>
      <div className="c-calor__desplaza">
        <div className="c-calor__lienzo">
          <div className="c-calor__meses" aria-hidden="true">
            {meses.map((m) => <span key={m.col} style={{ gridColumnStart: m.col + 1 }}>{m.texto}</span>)}
          </div>
          <div className="c-calor__dias" aria-hidden="true"><span>L</span><span>X</span><span>V</span></div>
          <div className="c-calor__rejilla" role="grid" aria-label={titulo ?? `${numero(total)} ${unidad[1]} en ${semanas} semanas`}>
            {DIAS.map((nombre, f) => (
              <div key={nombre} role="row" className="c-calor__fila">
                {columnas.map((dias, c) => {
                  const celda = dias[f];
                  if (!celda) return <span key={c} role="gridcell" className="c-calor__hueco" />;
                  return (
                    <button
                      key={celda.clave}
                      ref={(el) => { celdas.current[celda.clave] = el; }}
                      type="button"
                      role="gridcell"
                      tabIndex={celda.clave === conFoco ? 0 : -1}
                      className="c-calor__celda"
                      data-nivel={nivel(celda.n)}
                      aria-label={lectura(celda)}
                      style={{ '--col': c }}
                      onPointerEnter={() => setActiva(celda)}
                      onPointerLeave={() => setActiva(null)}
                      onFocus={() => setActiva(celda)}
                      onBlur={() => setActiva(null)}
                      onKeyDown={(e) => alTeclear(e, celda)}
                      onClick={() => alElegir?.(celda.clave, celda.n)}
                    />
                  );
                })}
              </div>
            ))}
            {activa && (
              <div className="c-globo c-calor__globo" data-lado={activa.col > semanas / 2 ? 'izquierda' : 'derecha'} style={{ '--col': activa.col, '--fila': activa.fila }} aria-hidden="true">
                {lectura(activa)}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="c-calor__pie">
        <span className="c-calor__total"><b>{numero(total)}</b> {total === 1 ? unidad[0] : unidad[1]}</span>
        <span className="c-calor__escala" aria-hidden="true">
          {t.menos}
          {[0, 1, 2, 3, 4].map((n) => <i key={n} className="c-calor__celda" data-nivel={n} />)}
          {t.mas}
        </span>
      </div>
    </div>
  );
}

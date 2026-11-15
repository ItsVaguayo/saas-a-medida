// 30 · Calendario y SelectorFecha. Semana de lunes a domingo, meses en español y manejo completo con el teclado:
// flechas para los días, Re Pág y Av Pág para los meses, Inicio y Fin para la semana.
// Las fechas entran y salen como texto «AAAA-MM-DD», sin horas ni husos que las muevan de día.
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { fechaCorta } from './formato.js';
import { Fundido } from './TransicionVista.jsx';
import { cx, useFuera } from './interno.js';
import './SelectorFecha.css';

const DIA = 86_400_000;
const dos = (n) => String(n).padStart(2, '0');
const aTexto = (d) => d.toISOString().slice(0, 10);
const deTexto = (t) => new Date(`${t}T00:00:00Z`);

export const hoyTexto = () => { const d = new Date(); return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`; };
export const sumarDias = (texto, dias) => aTexto(new Date(deTexto(texto).getTime() + dias * DIA));
export function sumarMeses(texto, meses) {
  const d = deTexto(texto);
  const dia = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + meses);
  // 31 de enero más un mes es 28 de febrero, no 3 de marzo
  const ultimo = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(dia, ultimo));
  return aTexto(d);
}
/** Las seis semanas (42 días) que pinta el mes de `texto`, empezando en lunes. */
export function diasDelMes(texto) {
  const primero = `${texto.slice(0, 7)}-01`;
  const lunes = sumarDias(primero, -((deTexto(primero).getUTCDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => sumarDias(lunes, i));
}

const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SEMANA_LARGA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const nombreMes = (texto) => new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(deTexto(texto));
const nombreDia = (texto) => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(deTexto(texto));

/** @param valor 'AAAA-MM-DD' o nada
    @param min, max límites, incluidos
    @param deshabilitado (texto) => true para los días que no se pueden elegir (festivos, días sin hueco) */
export function Calendario({ valor, alCambiar, min, max, deshabilitado, className }) {
  const hoy = hoyTexto();
  const fuera = (d) => Boolean((min && d < min) || (max && d > max) || deshabilitado?.(d));
  // El foco arranca en la fecha elegida o, si no hay, en el primer día que se puede elegir desde hoy
  const [foco, setFoco] = useState(() => {
    if (valor) return valor;
    let d = min && hoy < min ? min : hoy;
    for (let i = 0; i < 366 && fuera(d); i += 1) d = sumarDias(d, 1);
    return d;
  });
  const [sentido, setSentido] = useState('nada');
  const rejilla = useRef(null);
  const llevarFoco = useRef(false);
  useEffect(() => { if (valor) setFoco(valor); }, [valor]);

  const ir = (destino, conFoco = true) => {
    const acotado = min && destino < min ? min : max && destino > max ? max : destino;
    setSentido(acotado.slice(0, 7) === foco.slice(0, 7) ? 'nada' : acotado > foco ? 'adelante' : 'atras');
    llevarFoco.current = conFoco;
    setFoco(acotado);
  };

  useEffect(() => {
    if (!llevarFoco.current) return;
    llevarFoco.current = false;
    rejilla.current?.querySelector('[tabindex="0"]')?.focus();
  }, [foco]);

  const tecla = (e) => {
    const diaSemana = (deTexto(foco).getUTCDay() + 6) % 7;
    const destino = {
      ArrowLeft: sumarDias(foco, -1), ArrowRight: sumarDias(foco, 1),
      ArrowUp: sumarDias(foco, -7), ArrowDown: sumarDias(foco, 7),
      Home: sumarDias(foco, -diaSemana), End: sumarDias(foco, 6 - diaSemana),
      PageUp: sumarMeses(foco, e.shiftKey ? -12 : -1), PageDown: sumarMeses(foco, e.shiftKey ? 12 : 1),
    }[e.key];
    if (!destino) return;
    e.preventDefault();
    ir(destino);
  };

  const mes = foco.slice(0, 7);
  return (
    <div className={cx('k-calendario', className)}>
      <div className="k-calendario__cabecera">
        <span className="k-calendario__mes" aria-live="polite">{nombreMes(foco)}</span>
        <Boton variante="discreto" tamano="chico" icono={ChevronLeft} aria-label="Mes anterior" onClick={() => ir(sumarMeses(foco, -1), false)} />
        <Boton variante="discreto" tamano="chico" icono={ChevronRight} aria-label="Mes siguiente" onClick={() => ir(sumarMeses(foco, 1), false)} />
      </div>
      <div className="k-calendario__semana" aria-hidden="true">{SEMANA.map((d) => <span key={d}>{d}</span>)}</div>
      <Fundido clave={mes} sentido={sentido}>
        <div className="k-calendario__rejilla" role="grid" aria-label={nombreMes(foco)} ref={rejilla} onKeyDown={tecla}>
          {Array.from({ length: 6 }, (_, s) => (
            <div key={s} role="row" className="k-calendario__fila">
              {diasDelMes(foco).slice(s * 7, s * 7 + 7).map((d, i) => (
                <button
                  key={d}
                  type="button"
                  role="gridcell"
                  className="k-calendario__dia"
                  aria-label={`${nombreDia(d)}${d === hoy ? ', hoy' : ''}`}
                  aria-selected={d === valor}
                  aria-current={d === hoy ? 'date' : undefined}
                  data-otro-mes={d.slice(0, 7) !== mes || undefined}
                  data-finde={i > 4 || undefined}
                  title={SEMANA_LARGA[i]}
                  // aria-disabled y no disabled: el día sigue recibiendo el foco al recorrer el mes con las flechas
                  aria-disabled={fuera(d) || undefined}
                  tabIndex={d === foco ? 0 : -1}
                  onClick={() => { setFoco(d); if (!fuera(d)) alCambiar(d); }}
                >
                  {Number(d.slice(8))}
                </button>
              ))}
            </div>
          ))}
        </div>
      </Fundido>
    </div>
  );
}

/** Campo de fecha que abre el calendario. Mismos parámetros que Calendario, más los de un campo. */
export function SelectorFecha({ etiqueta, valor, alCambiar, marcador = 'Elegir fecha', error, ayuda, min, max, deshabilitado, className }) {
  const id = useId();
  const raiz = useRef(null);
  const boton = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const cerrar = useCallback(() => { setAbierto(false); boton.current?.focus(); }, []);
  useFuera(raiz, abierto, useCallback((e) => (e.type === 'keydown' ? cerrar() : setAbierto(false)), [cerrar]));

  useEffect(() => {
    if (abierto) raiz.current.querySelector('.k-calendario__dia[tabindex="0"]')?.focus();
  }, [abierto]);

  const hoy = hoyTexto();
  const hoyVale = !(min && hoy < min) && !(max && hoy > max) && !deshabilitado?.(hoy);

  return (
    <div className={cx('k-campo k-fecha', className)} ref={raiz}>
      <span className="k-campo__etiqueta" id={`${id}-e`}>{etiqueta}</span>
      <button
        ref={boton}
        type="button"
        className="k-control k-fecha__boton"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-labelledby={`${id}-e ${id}-v`}
        aria-invalid={error ? true : undefined}
        data-vacio={valor ? undefined : ''}
        onClick={() => setAbierto((a) => !a)}
      >
        <CalendarDays aria-hidden="true" />
        <span id={`${id}-v`}>{valor ? fechaCorta(valor) : marcador}</span>
      </button>
      {abierto && (
        <div className="k-flotante k-fecha__panel" data-alinear="inicio" role="dialog" aria-label={`Elegir ${etiqueta}`}>
          <Calendario valor={valor} min={min} max={max} deshabilitado={deshabilitado} alCambiar={(d) => { alCambiar(d); cerrar(); }} />
          <div className="k-fecha__pie">
            {hoyVale && <Boton variante="discreto" tamano="chico" onClick={() => { alCambiar(hoy); cerrar(); }}>Hoy</Boton>}
            {valor && <Boton variante="discreto" tamano="chico" onClick={() => { alCambiar(null); cerrar(); }}>Quitar fecha</Boton>}
          </div>
        </div>
      )}
      {ayuda && !error && <span className="k-campo__ayuda">{ayuda}</span>}
      {error && <span className="k-campo__error">{error}</span>}
    </div>
  );
}

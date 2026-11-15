// Demos de los apartados (35–40).
import { CalendarClock, ChartColumn, CreditCard, FileCheck, House, Layers, MessageSquare, Monitor, Moon, Plus, Receipt, Settings, Smartphone, Sun, Users, Wallet, Zap } from 'lucide-react';
import { useState } from 'react';
import {
  Actividad, BarraCristal, Boton, Cifra, Cifras, ErrorCarga, GraficoBarras, GraficoLinea, Marco, PrimerosPasos, Segmentado, SinConexion, SinPermiso, SinResultados, Tabla, Vacio,
  moneda, numero, porcentaje,
} from '../kit/index.js';
import { CLIENTES, EVENTOS, MESES, esperar } from './datos.js';

const NAVEGACION = [
  { elementos: [{ id: 'inicio', texto: 'Inicio', icono: House }, { id: 'clientes', texto: 'Clientes', icono: Users, contador: 128 }, { id: 'facturas', texto: 'Facturas', icono: Receipt, contador: 3 }, { id: 'cobros', texto: 'Cobros', icono: CreditCard }] },
  { rotulo: 'Análisis', elementos: [{ id: 'informes', texto: 'Informes', icono: ChartColumn }] },
  { rotulo: 'Cuenta', elementos: [{ id: 'config', texto: 'Configuración', icono: Settings }] },
];
const TITULOS = { inicio: 'Inicio', clientes: 'Clientes · 128 activos', facturas: 'Facturas', cobros: 'Cobros de noviembre', informes: 'Informes', config: 'Configuración' };

export function DemoMarco() {
  const [actual, setActual] = useState('clientes');
  const [ancho, setAncho] = useState('escritorio');
  return (
    <div className="demo-columna">
      <Segmentado tamano="chico" etiqueta="Ancho" valor={ancho} alCambiar={setAncho} opciones={[{ valor: 'escritorio', texto: 'Escritorio', icono: Monitor }, { valor: 'movil', texto: 'Móvil', icono: Smartphone }]} />
      <div className="demo-marco" data-ancho={ancho}>
        <Marco
          clave="demo:lateral"
          marca={<span className="demo-marca"><span className="demo-logo">A</span><strong>Acme Gestión</strong></span>}
          navegacion={NAVEGACION}
          actual={actual}
          alNavegar={setActual}
          titulo={TITULOS[actual]}
          usuario={{ nombre: 'Marta Ruiz', detalle: 'Administración' }}
          acciones={<Boton variante="principal" icono={Plus} aria-label="Nuevo cliente">{ancho === 'movil' ? null : 'Nuevo cliente'}</Boton>}
        >
          <Tabla
            titulo="Clientes"
            columnas={[{ clave: 'nombre', titulo: 'Cliente', ordenable: true }, { clave: 'estado', titulo: 'Estado' }, { clave: 'facturado', titulo: 'Facturado', alinear: 'derecha', ordenable: true, pintar: (c) => moneda(c.facturado) }]}
            filas={CLIENTES.slice(0, 7)}
          />
        </Marco>
      </div>
    </div>
  );
}

const CRISTAL = [
  { rotulo: 'Principal', elementos: [
    { id: 'panel', texto: 'Panel', icono: House },
    { id: 'actividad', texto: 'Actividad', icono: Zap, contador: 12 },
    { id: 'cartera', texto: 'Cartera', icono: Wallet },
    { id: 'agenda', texto: 'Agenda', icono: CalendarClock, aviso: true },
  ] },
  { rotulo: 'Espacio', elementos: [
    { id: 'mensajes', texto: 'Mensajes', icono: MessageSquare, contador: 3, urgente: true },
    { id: 'proyectos', texto: 'Proyectos', icono: Layers, hijos: [
      { id: 'web', texto: 'Rediseño de la web', color: 'oklch(0.72 0.13 175)' },
      { id: 'app', texto: 'App móvil', color: 'oklch(0.76 0.14 55)' },
      { id: 'marca', texto: 'Manual de marca', color: 'oklch(0.68 0.17 295)' },
    ] },
    { id: 'informes', texto: 'Informes', icono: ChartColumn },
    { id: 'ajustes', texto: 'Ajustes', icono: Settings },
  ] },
];

export function DemoBarraCristal() {
  const [actual, setActual] = useState('panel');
  const [plegado, setPlegado] = useState(false);
  const [noche, setNoche] = useState(false);
  return (
    <div className="demo-cristal" data-noche={noche || undefined}>
      <BarraCristal
        navegacion={CRISTAL}
        actual={actual}
        alNavegar={setActual}
        plegado={plegado}
        alPlegar={setPlegado}
        logo={<Receipt aria-hidden="true" />}
        nombre="Vertix"
        detalle="Espacio de finanzas"
        ajustes={[{ id: 'noche', texto: 'Modo noche', icono: noche ? Moon : Sun, activo: noche, alCambiar: setNoche }]}
        usuario={{ nombre: 'Álex Morgan', detalle: 'alex@vertix.io', enLinea: true }}
      />
      <p className="demo-nota demo-cristal__nota"><kbd>⌘K</kbd> busca · <kbd>[</kbd> pliega</p>
    </div>
  );
}

export function DemoCifras() {
  const [vez, setVez] = useState(0);
  return (
    <div className="demo-columna">
      <Cifras key={vez}>
        <Cifra rotulo="Cobrado en noviembre" icono={CreditCard} valor={31450} formato={moneda} cambio={0.127} comparado="que en octubre" serie={[18, 21, 10, 25, 28, 31]} />
        <Cifra rotulo="Pendiente de cobro" icono={Receipt} valor={4820.5} formato={moneda} cambio={0.31} menosEsMejor comparado="que en octubre" serie={[2, 3, 2.5, 3.1, 3.6, 4.8]} />
        <Cifra rotulo="Clientes activos" icono={Users} valor={128} cambio={0} comparado="que el mes pasado" serie={[120, 124, 126, 127, 128, 128]} />
        <Cifra rotulo="Citas cumplidas" icono={CalendarClock} valor={0.94} formato={(n) => porcentaje(n, { decimales: 0 })} cambio={-0.02} comparado="que en octubre" serie={[96, 97, 95, 96, 96, 94]} />
      </Cifras>
      <Boton onClick={() => setVez((v) => v + 1)} style={{ justifySelf: 'start' }}>Repetir entrada</Boton>
    </div>
  );
}

const DIARIO = Array.from({ length: 30 }, (_, i) => ({ etiqueta: `${i + 1} nov`, valor: Math.round(600 + Math.sin(i / 3) * 280 + i * 22 + ((i * 37) % 140)) }));
export function DemoGrafico() {
  const [tipo, setTipo] = useState('barras');
  return (
    <div className="demo-columna">
      <Segmentado tamano="chico" etiqueta="Tipo de gráfico" valor={tipo} alCambiar={setTipo} opciones={[{ valor: 'barras', texto: 'Barras' }, { valor: 'linea', texto: 'Línea' }]} />
      <div className="k-tarjeta" style={{ padding: '20px 20px 16px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 24 }}>{tipo === 'barras' ? 'Facturación por mes' : 'Cobros de noviembre, día a día'}</h3>
        {tipo === 'barras'
          ? <GraficoBarras key="b" titulo="Facturación por mes" datos={MESES} formato={(n) => moneda(n, { decimales: 0 })} />
          : <GraficoLinea key="l" titulo="Cobros de noviembre, día a día" datos={DIARIO} formato={(n) => `${numero(n)} €`} />}
      </div>
      <p className="demo-tenue">Pasa el ratón por encima. En la línea, también con el foco y las flechas ← →.</p>
    </div>
  );
}

export function DemoEstados() {
  const [cual, setCual] = useState('vacio');
  return (
    <div className="demo-columna">
      <Segmentado tamano="chico" etiqueta="Estado" valor={cual} alCambiar={setCual} opciones={[{ valor: 'vacio', texto: 'Vacío' }, { valor: 'filtro', texto: 'Sin resultados' }, { valor: 'error', texto: 'Error' }, { valor: 'permiso', texto: 'Sin permiso' }, { valor: 'red', texto: 'Sin conexión' }]} />
      <div className="k-tarjeta" style={{ overflow: 'hidden' }}>
        {cual === 'red' && <SinConexion forzar />}
        {cual === 'vacio' && <Vacio icono={FileCheck} titulo="Aún no hay facturas" detalle="Aparecen aquí al crearlas o al importarlas de otro programa" accion="Nueva factura" />}
        {cual === 'filtro' && <SinResultados que="cliente" consulta="Gil" alQuitar={() => setCual('vacio')} />}
        {cual === 'error' && <ErrorCarga alReintentar={async () => { await esperar(1200); throw new Error('sigue caído'); }} />}
        {cual === 'permiso' && <SinPermiso><Boton>Volver al inicio</Boton></SinPermiso>}
        {cual === 'red' && <Vacio icono={FileCheck} titulo="Aún no hay facturas" accion="Nueva factura" compacto />}
      </div>
    </div>
  );
}

export function DemoActividad() {
  const [extra, setExtra] = useState(false);
  const eventos = extra ? [...EVENTOS, { id: 'e6', fecha: new Date(Date.now() - 9 * 86_400_000).toISOString(), icono: FileCheck, tono: 'bien', texto: 'Presupuesto P-2026-0031 aceptado por el cliente' }] : EVENTOS;
  return <div className="demo-ancho"><Actividad eventos={eventos} alCargarMas={extra ? undefined : () => setExtra(true)} /></div>;
}

export function DemoPrimerosPasos() {
  const [hechos, setHechos] = useState(['cuenta']);
  const [oculto, setOculto] = useState(false);
  const hacer = (id) => () => setHechos((h) => [...h, id]);
  if (oculto) return <Boton onClick={() => { setOculto(false); setHechos(['cuenta']); }}>Volver a enseñar</Boton>;
  return (
    <PrimerosPasos
      className="demo-ancho"
      alOcultar={() => setOculto(true)}
      pasos={[
        { id: 'cuenta', titulo: 'Crear la cuenta', hecho: hechos.includes('cuenta') },
        { id: 'empresa', titulo: 'Datos fiscales', detalle: 'Salen en la cabecera de cada factura', accion: 'Completar datos', alPulsar: hacer('empresa'), hecho: hechos.includes('empresa') },
        { id: 'cliente', titulo: 'Primer cliente', detalle: 'A mano o importando un Excel', accion: 'Añadir cliente', alPulsar: hacer('cliente'), hecho: hechos.includes('cliente') },
        { id: 'factura', titulo: 'Primera factura', detalle: 'Se numera sola a partir de la serie elegida', accion: 'Nueva factura', alPulsar: hacer('factura'), hecho: hechos.includes('factura') },
      ]}
    />
  );
}

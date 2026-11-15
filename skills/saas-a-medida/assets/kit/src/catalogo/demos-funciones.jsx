// Demos de las funciones (01–07).
import { useState } from 'react';
import {
  Avatar, Boton, BotonCopiar, Campo, EsqueletoPersona, Interruptor, Segmentado, SinResultados, Teclas,
  compacto, fechaCercana, fechaCorta, hace, iniciales, moneda, numero, plural, porcentaje, tamano,
  useAlmacen, useAtajo, useBusqueda, useEstadoUrl, useSeleccion,
} from '../kit/index.js';
import { normalizar } from '../kit/interno.js';
import { CLIENTES, esperar } from './datos.js';

const DIA = 86_400_000;

export function DemoFormato() {
  const [n, setN] = useState('12840.5');
  const valor = Number(n) || 0;
  const ahora = Date.now();
  const filas = [
    [`moneda(${n})`, moneda(valor)],
    [`numero(${n})`, numero(valor)],
    [`compacto(${n})`, compacto(valor)],
    ['porcentaje(0.214)', porcentaje(0.214)],
    ['tamano(1536000)', tamano(1_536_000)],
    ['fechaCorta(hoy)', fechaCorta(new Date())],
    ['fechaCercana(ayer)', fechaCercana(new Date(ahora - DIA))],
    ['fechaCercana(en 3 días)', fechaCercana(new Date(ahora + 3 * DIA))],
    ['hace(hace 5 min)', hace(new Date(ahora - 5 * 60_000))],
    ["iniciales('Marta Ruiz Gil')", iniciales('Marta Ruiz Gil')],
    ["plural(3, 'cliente', 'clientes')", plural(3, 'cliente', 'clientes')],
    ['moneda(null)', moneda(null)],
  ];
  return (
    <div className="demo-columna">
      <Campo etiqueta="Número de prueba" inputMode="decimal" value={n} onChange={(e) => setN(e.target.value)} style={{ maxWidth: 220 }} />
      <dl className="demo-pares">
        {filas.map(([codigo, salida]) => (
          <div key={codigo}><dt><code>{codigo}</code></dt><dd>{salida}</dd></div>
        ))}
      </dl>
    </div>
  );
}

export function DemoBusqueda() {
  const [fallar, setFallar] = useState(false);
  // La latencia es aleatoria a propósito: las respuestas llegan desordenadas y aun así nunca se pinta una vieja
  const buscar = async (texto, { signal }) => {
    await esperar(250 + Math.random() * 900, signal);
    if (fallar) throw new Error('Sin respuesta');
    return CLIENTES.filter((c) => normalizar(`${c.nombre} ${c.empresa}`).includes(normalizar(texto)));
  };
  const b = useBusqueda(buscar, { minimo: 1 });
  return (
    <div className="demo-columna" style={{ maxWidth: 420 }}>
      <Campo etiqueta="Buscar cliente" type="search" value={b.texto} onChange={(e) => b.setTexto(e.target.value)} ayuda="Prueba «san», «gim» o «zzz»" />
      <Interruptor etiqueta="Simular fallo del servidor" marcado={fallar} alCambiar={setFallar} />
      <div className="demo-caja" style={{ minHeight: 132 }} aria-live="polite">
        {b.estado === 'reposo' && <p className="demo-tenue">Escribe para buscar</p>}
        {b.estado === 'cargando' && <div className="demo-columna"><EsqueletoPersona /><EsqueletoPersona /></div>}
        {b.estado === 'error' && <div className="demo-fila"><span>No se ha podido buscar</span><Boton tamano="chico" onClick={b.reintentar}>Reintentar</Boton></div>}
        {b.estado === 'listo' && b.resultados.length === 0 && <SinResultados que="cliente" consulta={b.texto} compacto />}
        {b.estado === 'listo' && b.resultados.slice(0, 4).map((c) => (
          <div key={c.id} className="demo-persona"><Avatar nombre={c.nombre} /><div><strong>{c.nombre}</strong><span>{c.empresa}</span></div></div>
        ))}
      </div>
    </div>
  );
}

export function DemoEstadoUrl() {
  const [vista, setVista] = useEstadoUrl('vista', 'lista');
  const [pagina, setPagina] = useEstadoUrl('pagina', '1');
  return (
    <div className="demo-columna">
      <div className="demo-fila">
        <Segmentado etiqueta="Vista" valor={vista} alCambiar={setVista} opciones={[{ valor: 'lista', texto: 'Lista' }, { valor: 'tablero', texto: 'Tablero' }, { valor: 'calendario', texto: 'Calendario' }]} />
        <Boton onClick={() => setPagina(Number(pagina) + 1, { historial: true })}>Página {pagina} · Siguiente</Boton>
      </div>
      <p className="demo-tenue">La dirección ahora: <code>{window.location.search || '(sin parámetros)'}</code></p>
      <p className="demo-tenue">Recarga la página o usa el botón atrás del navegador: se queda donde estaba.</p>
    </div>
  );
}

export function DemoAlmacen() {
  const [denso, setDenso] = useAlmacen('demo:tabla-densa', false);
  const [visitas, setVisitas] = useAlmacen('demo:contador', 0);
  return (
    <div className="demo-columna" style={{ maxWidth: 420 }}>
      <Interruptor etiqueta="Tabla compacta" detalle={denso ? 'Filas juntas' : 'Filas con aire'} marcado={denso} alCambiar={setDenso} />
      <div className="demo-fila">
        <Boton onClick={() => setVisitas((n) => n + 1)}>Sumar</Boton>
        <Boton variante="discreto" onClick={() => setVisitas(undefined)}>Borrar</Boton>
        <span>Guardado: <strong>{visitas}</strong></span>
      </div>
      <p className="demo-tenue">Abre el catálogo en otra pestaña: los dos valores cambian a la vez en las dos.</p>
    </div>
  );
}

export function DemoAtajo() {
  const [nuevos, setNuevos] = useState(0);
  const [ayuda, setAyuda] = useState(false);
  useAtajo('n', () => setNuevos((n) => n + 1));
  useAtajo('mod+j', () => setAyuda((a) => !a));
  return (
    <div className="demo-columna" style={{ maxWidth: 420 }}>
      <div className="demo-fila"><Teclas atajo="n" /><span>Nuevo cliente · pulsado <strong>{nuevos}</strong> veces</span></div>
      <div className="demo-fila"><Teclas atajo="mod+j" /><span>Panel de ayuda: <strong>{ayuda ? 'abierto' : 'cerrado'}</strong></span></div>
      <Campo etiqueta="Campo de texto" ayuda="Aquí la «n» escribe una n; el atajo con modificador sigue funcionando" />
    </div>
  );
}

export function DemoCopiar() {
  const iban = 'ES91 2100 0418 4502 0005 1332';
  return (
    <div className="demo-columna">
      <div className="demo-fila"><code>{iban}</code><BotonCopiar texto={iban} etiqueta="Copiar IBAN" /></div>
      <div className="demo-fila"><BotonCopiar texto="https://app.ejemplo.es/facturas/F-2026-0142">Copiar enlace</BotonCopiar></div>
    </div>
  );
}

export function DemoSeleccion() {
  const filas = CLIENTES.slice(0, 7);
  const sel = useSeleccion(filas.map((c) => c.id));
  return (
    <div className="demo-columna" style={{ maxWidth: 420 }}>
      <div className="demo-fila">
        <Boton tamano="chico" onClick={sel.todos}>Todas</Boton>
        <Boton tamano="chico" onClick={sel.ninguno}>Ninguna</Boton>
        <span>{plural(sel.seleccion.size, 'marcada', 'marcadas')} · estado «{sel.estado}»</span>
      </div>
      <div className="demo-caja demo-lista">
        {filas.map((c) => (
          <label key={c.id} className="demo-casilla">
            <input type="checkbox" className="k-casilla" checked={sel.esta(c.id)} onChange={() => {}} onClick={(e) => sel.alternar(c.id, e)} />
            {c.nombre}
          </label>
        ))}
      </div>
      <p className="demo-tenue">Marca una, mantén <Teclas atajo="shift" /> y marca otra más abajo.</p>
    </div>
  );
}

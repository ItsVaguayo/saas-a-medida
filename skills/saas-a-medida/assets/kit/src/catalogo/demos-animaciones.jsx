// Demos de las animaciones (08–15).
import { ArrowLeft, ArrowUpDown, Plus, RotateCw, Shuffle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Acordeon, Anillo, Avatar, Barra, Boton, BotonEstado, CifraAnimada, Escalonado, Esqueleto, EsqueletoPersona, EsqueletoTabla, EsqueletoTexto,
  Etiqueta, Fundido, Interruptor, ListaAnimada, Segmentado, Viajero, moneda, useTransicionVista,
} from '../kit/index.js';
import { CLIENTES, ESTADOS, esperar } from './datos.js';

export function DemoAparecer() {
  const [vez, setVez] = useState(0);
  return (
    <div className="demo-columna">
      <Boton icono={RotateCw} onClick={() => setVez((v) => v + 1)} style={{ justifySelf: 'start' }}>Repetir</Boton>
      <div className="demo-rejilla" key={vez}>
        <Escalonado alVerse={false}>
          {CLIENTES.slice(0, 6).map((c) => (
            <div key={c.id} className="k-tarjeta demo-persona" style={{ padding: 12 }}>
              <Avatar nombre={c.nombre} /><div><strong>{c.nombre}</strong><span>{c.empresa}</span></div>
            </div>
          ))}
        </Escalonado>
      </div>
    </div>
  );
}

const PERIODOS = { mes: 31450, trimestre: 83950, ano: 286400 };
export function DemoCifraAnimada() {
  const [periodo, setPeriodo] = useState('mes');
  return (
    <div className="demo-columna">
      <Segmentado etiqueta="Periodo" valor={periodo} alCambiar={setPeriodo} opciones={[{ valor: 'mes', texto: 'Mes' }, { valor: 'trimestre', texto: 'Trimestre' }, { valor: 'ano', texto: 'Año' }]} />
      <div>
        <p className="demo-tenue">Facturado</p>
        <CifraAnimada className="demo-cifra" valor={PERIODOS[periodo]} formato={moneda} />
      </div>
    </div>
  );
}

export function DemoEsqueleto() {
  const [cargando, setCargando] = useState(true);
  return (
    <div className="demo-columna">
      <Interruptor etiqueta="Cargando" marcado={cargando} alCambiar={setCargando} className="demo-estrecho" />
      <div className="demo-dos">
        <div className="k-tarjeta" style={{ padding: 16, display: 'grid', gap: 16 }}>
          {cargando ? <><EsqueletoPersona /><EsqueletoTexto lineas={3} /></> : (
            <>
              <div className="demo-persona"><Avatar nombre="Marta Ruiz" lado={36} /><div><strong>Marta Ruiz Gil</strong><span>Talleres Ruiz</span></div></div>
              <p className="demo-tenue">Cliente desde marzo de 2024. Paga por domiciliación el día 5 de cada mes y prefiere que se le llame por la tarde.</p>
            </>
          )}
        </div>
        <div className="k-tarjeta" style={{ overflow: 'hidden' }}>
          {cargando ? <EsqueletoTabla filas={4} columnas={3} /> : CLIENTES.slice(0, 4).map((c) => (
            <div key={c.id} className="demo-fila-tabla"><span>{c.empresa}</span><Etiqueta tono={ESTADOS[c.estado].tono} punto>{ESTADOS[c.estado].texto}</Etiqueta><span>{moneda(c.facturado)}</span></div>
          ))}
        </div>
      </div>
      <div className="demo-fila"><Esqueleto ancho={120} alto={32} /><Esqueleto ancho={32} alto={32} redondo /><Esqueleto ancho={200} /></div>
    </div>
  );
}

export function DemoColapsable() {
  const [unico, setUnico] = useState(true);
  return (
    <div className="demo-columna" style={{ maxWidth: 520 }}>
      <Interruptor etiqueta="Solo uno abierto a la vez" marcado={unico} alCambiar={setUnico} />
      <Acordeon
        key={String(unico)}
        unico={unico}
        abiertos={['cobros']}
        elementos={[
          { id: 'cobros', titulo: 'Cobros', detalle: '3 métodos', contenido: 'Domiciliación SEPA el día 5, tarjeta y transferencia. Los recibos devueltos se reintentan a los 3 días y avisan por email.' },
          { id: 'recordatorios', titulo: 'Recordatorios de cita', detalle: '24 h antes', contenido: 'Se envían por email y por WhatsApp. Si el cliente responde «cancelar», la cita queda libre y se avisa a recepción.' },
          { id: 'facturas', titulo: 'Numeración de facturas', detalle: 'F-2026-0142', contenido: 'Serie F, año en curso y cuatro cifras. Las rectificativas van en la serie R y enlazan con la factura que corrigen.' },
        ]}
      />
    </div>
  );
}

let siguiente = 20;
export function DemoListaAnimada() {
  const [lista, setLista] = useState(CLIENTES.slice(0, 5));
  const libre = CLIENTES.find((c) => !lista.some((l) => l.id === c.id));
  return (
    <div className="demo-columna" style={{ maxWidth: 440 }}>
      <div className="demo-fila">
        <Boton icono={Plus} disabled={!libre} onClick={() => setLista((l) => [{ ...libre, clave: siguiente++ }, ...l])}>Añadir</Boton>
        <Boton icono={Shuffle} onClick={() => setLista((l) => [...l].sort(() => Math.random() - 0.5))}>Barajar</Boton>
        <Boton icono={ArrowUpDown} onClick={() => setLista((l) => [...l].sort((a, b) => b.facturado - a.facturado))}>Por importe</Boton>
      </div>
      <ListaAnimada elementos={lista} clave={(c) => c.id} className="demo-lista-animada">
        {(c) => (
          <div className="k-tarjeta demo-persona" style={{ padding: '8px 8px 8px 12px' }}>
            <Avatar nombre={c.nombre} />
            <div><strong>{c.nombre}</strong><span>{moneda(c.facturado)}</span></div>
            <Boton variante="discreto" tamano="chico" icono={X} aria-label={`Quitar a ${c.nombre}`} onClick={() => setLista((l) => l.filter((x) => x.id !== c.id))} />
          </div>
        )}
      </ListaAnimada>
    </div>
  );
}

export function DemoProgreso() {
  const [valor, setValor] = useState(35);
  return (
    <div className="demo-columna" style={{ maxWidth: 440 }}>
      <label className="demo-fila">Valor <input type="range" min="0" max="100" value={valor} onChange={(e) => setValor(Number(e.target.value))} style={{ flex: 1 }} /></label>
      <Barra valor={valor} etiqueta="Importando clientes" visible />
      <Barra valor={valor} etiqueta="Cuota del plan" visible tono={valor > 85 ? 'mal' : valor > 60 ? 'atencion' : 'bien'} />
      <Barra etiqueta="Generando el informe" visible />
      <div className="demo-fila">
        <Anillo valor={valor} etiqueta="Progreso">{valor}</Anillo>
        <Anillo valor={valor} tamano={72} grosor={7} tono="bien" etiqueta="Objetivo del mes"><strong style={{ fontSize: 15 }}>{valor} %</strong></Anillo>
        <Anillo valor={valor} tamano={28} grosor={4} etiqueta="Progreso" />
      </div>
    </div>
  );
}

export function DemoBotonEstado() {
  return (
    <div className="demo-columna">
      <div className="demo-fila">
        <BotonEstado alPulsar={() => esperar(1400)}>Guardar cambios</BotonEstado>
        <BotonEstado alPulsar={async () => { await esperar(1200); throw new Error('500'); }}>Guardar (falla)</BotonEstado>
        <BotonEstado variante="secundario" cargando="Enviando" hecho="Enviada" alPulsar={() => esperar(900)}>Enviar factura</BotonEstado>
      </div>
      <p className="demo-tenue">Pulsa varias veces seguidas: mientras guarda, el botón no lanza otro envío.</p>
    </div>
  );
}

export function DemoTransicionVista() {
  const [abierto, setAbierto] = useState(null);
  const cambiar = useTransicionVista();
  const cliente = CLIENTES.find((c) => c.id === abierto);
  const [soporte, setSoporte] = useState(true);
  useEffect(() => setSoporte(Boolean(document.startViewTransition)), []);

  return (
    <div className="demo-columna">
      {!soporte && <p className="demo-tenue">Este navegador no tiene transiciones de vista: el cambio ocurre igual, con un fundido.</p>}
      {cliente ? (
        <Fundido clave="ficha">
          <Viajero nombre={`cliente-${cliente.id}`} className="k-tarjeta" style={{ padding: 20, display: 'grid', gap: 16, maxWidth: 520 }}>
            <Boton variante="discreto" tamano="chico" icono={ArrowLeft} onClick={() => cambiar(() => setAbierto(null))} style={{ justifySelf: 'start' }}>Clientes</Boton>
            <div className="demo-persona"><Avatar nombre={cliente.nombre} lado={48} /><div><strong style={{ fontSize: 18 }}>{cliente.nombre}</strong><span>{cliente.empresa}</span></div></div>
            <dl className="demo-pares"><div><dt>Facturado</dt><dd>{moneda(cliente.facturado)}</dd></div><div><dt>Email</dt><dd>{cliente.email ?? 'Sin email'}</dd></div><div><dt>Estado</dt><dd>{ESTADOS[cliente.estado].texto}</dd></div></dl>
          </Viajero>
        </Fundido>
      ) : (
        <div className="demo-rejilla">
          {CLIENTES.slice(0, 6).map((c) => (
            <Viajero key={c.id} nombre={`cliente-${c.id}`} como="button" type="button" className="k-tarjeta demo-persona demo-pulsable" style={{ padding: 12 }} onClick={() => cambiar(() => setAbierto(c.id))}>
              <Avatar nombre={c.nombre} /><div><strong>{c.nombre}</strong><span>{c.empresa}</span></div>
            </Viajero>
          ))}
        </div>
      )}
    </div>
  );
}

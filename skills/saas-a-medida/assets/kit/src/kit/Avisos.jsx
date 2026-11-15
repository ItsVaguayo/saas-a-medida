// 16 · Avisos. Confirmaciones cortas que no tapan nada: «Factura guardada · Deshacer».
// Se lanzan desde cualquier sitio con `avisar()`; la app monta una sola <ZonaAvisos /> en su raíz.
// Los errores no se van solos: se quedan hasta que la persona los cierra.
import { Check, CircleAlert, Info, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ListaAnimada } from './ListaAnimada.jsx';
import './Avisos.css';

let avisos = [];
let siguiente = 1;
const oyentes = new Set();
const publicar = () => oyentes.forEach((f) => f());
const oir = (f) => { oyentes.add(f); return () => oyentes.delete(f); };

/** Lanza un aviso y devuelve su id.
    @param texto    tres palabras: sustantivo y participio («Cliente archivado»)
    @param opciones { tono: 'neutro'|'bien'|'mal', detalle, duracion (ms), accion: { texto, alPulsar } } */
export function avisar(texto, opciones = {}) {
  const tono = opciones.tono ?? 'neutro';
  const aviso = { id: siguiente++, texto, tono, duracion: tono === 'mal' ? Infinity : 5000, ...opciones };
  avisos = [...avisos, aviso];
  publicar();
  return aviso.id;
}

export function quitarAviso(id) {
  avisos = avisos.filter((a) => a.id !== id);
  publicar();
}

const ICONOS = { neutro: Info, bien: Check, mal: CircleAlert };
const ENTRADA = [{ opacity: 0, transform: 'translateY(16px) scale(0.96)' }, { opacity: 1, transform: 'none' }];

function Aviso({ aviso }) {
  const [pausa, setPausa] = useState(false);
  const queda = useRef(aviso.duracion);
  const Icono = ICONOS[aviso.tono];

  // El tiempo se para mientras el ratón o el foco están encima: nadie pierde el «Deshacer» por leer despacio
  useEffect(() => {
    if (pausa || !Number.isFinite(queda.current)) return undefined;
    const inicio = Date.now();
    const t = setTimeout(() => quitarAviso(aviso.id), queda.current);
    return () => { clearTimeout(t); queda.current -= Date.now() - inicio; };
  }, [pausa, aviso.id]);

  return (
    <div
      className="k-aviso"
      data-tono={aviso.tono}
      role={aviso.tono === 'mal' ? 'alert' : 'status'}
      onPointerEnter={() => setPausa(true)}
      onPointerLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={() => setPausa(false)}
    >
      <Icono className="k-aviso__icono" aria-hidden="true" />
      <div className="k-aviso__texto">
        <strong>{aviso.texto}</strong>
        {aviso.detalle && <span>{aviso.detalle}</span>}
      </div>
      {aviso.accion && (
        <button type="button" className="k-aviso__accion" onClick={() => { aviso.accion.alPulsar?.(); quitarAviso(aviso.id); }}>
          {aviso.accion.texto}
        </button>
      )}
      <button type="button" className="k-aviso__cerrar" aria-label="Cerrar aviso" onClick={() => quitarAviso(aviso.id)}>
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

/** Se monta una vez, en la raíz de la app. @param maximo cuántos se ven a la vez */
export function ZonaAvisos({ maximo = 3 }) {
  const lista = useSyncExternalStore(oir, () => avisos, () => avisos);
  const zona = useRef(null);
  const visibles = lista.slice(-maximo);

  // La zona vive en la capa superior del navegador (popover) y se vuelve a subir con cada aviso:
  // así queda por encima de un diálogo abierto, que si no la taparía.
  useEffect(() => {
    const z = zona.current;
    if (!z?.showPopover) return;
    try {
      if (z.matches(':popover-open')) z.hidePopover();
      if (lista.length) z.showPopover();
    } catch { /* navegador sin popover: la zona se queda como capa fija normal */ }
  }, [lista.length]);

  return (
    <div ref={zona} className="k-avisos" popover="manual" aria-label="Avisos" role="region">
      <ListaAnimada elementos={visibles} clave={(a) => String(a.id)} como="div" entrada={ENTRADA} className="k-avisos__pila">
        {(aviso) => <Aviso aviso={aviso} />}
      </ListaAnimada>
    </div>
  );
}

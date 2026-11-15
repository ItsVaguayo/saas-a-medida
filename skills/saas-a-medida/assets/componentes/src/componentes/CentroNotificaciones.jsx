// 28 · Centro de notificaciones. La campana de la cabecera con su contador y, al abrirla, lo que ha pasado
// mientras no mirabas, con lo no leído separado. Referencias: GitHub, Linear (Inbox), Vercel.
import { Bell, CheckCheck } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Avatar } from './base.jsx';
import { EstadoVacio } from './EstadoVacio.jsx';
import { hace } from './formato.js';
import { cx, moverFoco, useEfectoDeMaqueta, useFuera, useSitio } from './interno.js';
import './CentroNotificaciones.css';

/** @param notificaciones [{ id, titulo, detalle?, fecha, leida, icono?, autor?, foto? }] de la más reciente a la más antigua.
                          Con `autor` pinta su avatar; si no, `icono`
    @param alAbrir     (notificacion) => void, al pulsar una: ir a lo que cuenta. Además se marca como leída
    @param alLeer      (id) => void
    @param alLeerTodas () => void
    @param pie         nodo al final del panel: el enlace a «Preferencias de aviso»
    @param ahora       fecha de referencia para «hace 5 minutos» (para pruebas) */
export function CentroNotificaciones({ notificaciones, alAbrir, alLeer, alLeerTodas, pie, ahora, alinear = 'fin', textos, className }) {
  const t = {
    titulo: 'Notificaciones', sinLeer: 'sin leer', todas: 'Todas', noLeidas: 'No leídas', leerTodas: 'Marcar todo como leído',
    vacio: 'Sin notificaciones', vacioNoLeidas: 'Todo leído', ...textos,
  };
  const id = useId();
  const raiz = useRef(null);
  const panel = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const sitio = useSitio(abierto, raiz, panel, alinear);
  const pendientes = notificaciones.filter((n) => !n.leida).length;
  const visibles = soloNoLeidas ? notificaciones.filter((n) => !n.leida) : notificaciones;

  const cerrar = (devolverFoco = true) => {
    setAbierto(false);
    if (devolverFoco) raiz.current?.querySelector('.c-avisos__campana')?.focus();
  };
  useFuera(raiz, abierto, (e) => cerrar(e.type === 'keydown'));
  useEfectoDeMaqueta(() => { if (abierto) panel.current?.focus(); }, [abierto]);

  return (
    <div className={cx('c-avisos', className)} ref={raiz}>
      <button
        type="button"
        className="c-avisos__campana"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={abierto ? `${id}-panel` : undefined}
        aria-label={pendientes ? `${t.titulo}: ${pendientes} ${t.sinLeer}` : t.titulo}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <Bell aria-hidden="true" />
        {pendientes > 0 && <span key={pendientes} className="c-avisos__contador" aria-hidden="true">{pendientes > 9 ? '9+' : pendientes}</span>}
      </button>

      {abierto && (
        <div
          ref={panel}
          id={`${id}-panel`}
          role="dialog"
          aria-label={t.titulo}
          tabIndex={-1}
          className="c-flotante c-avisos__panel"
          data-arriba={sitio.arriba || undefined}
          data-alinear={sitio.alinear}
          onKeyDown={(e) => moverFoco(e, panel.current, '.c-avisos__aviso')}
        >
          <header className="c-avisos__cabecera">
            <h2>{t.titulo}</h2>
            {alLeerTodas && (
              <button type="button" className="c-avisos__todo" disabled={pendientes === 0} onClick={alLeerTodas}>
                <CheckCheck aria-hidden="true" />{t.leerTodas}
              </button>
            )}
          </header>
          <div className="c-avisos__filtro" role="group" aria-label={t.titulo} data-lado={soloNoLeidas ? 'fin' : 'inicio'}>
            <button type="button" aria-pressed={!soloNoLeidas} onClick={() => setSoloNoLeidas(false)}>{t.todas}</button>
            <button type="button" aria-pressed={soloNoLeidas} onClick={() => setSoloNoLeidas(true)}>
              {t.noLeidas}{pendientes > 0 && <span className="c-avisos__cuenta">{pendientes}</span>}
            </button>
          </div>
          {visibles.length === 0 ? (
            <EstadoVacio variante="compacto" icono={soloNoLeidas ? CheckCheck : Bell} titulo={soloNoLeidas ? t.vacioNoLeidas : t.vacio} />
          ) : (
            <ul className="c-avisos__lista">
              {visibles.map((n) => {
                const Icono = n.icono;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="c-avisos__aviso"
                      data-leida={n.leida || undefined}
                      onClick={() => { if (!n.leida) alLeer?.(n.id); alAbrir?.(n); }}
                    >
                      {n.autor
                        ? <Avatar nombre={n.autor} foto={n.foto} lado={32} />
                        : <span className="c-avisos__icono" aria-hidden="true">{Icono ? <Icono /> : <Bell />}</span>}
                      <span className="c-avisos__texto">
                        <span className="c-avisos__titulo">{n.autor && <b>{n.autor} </b>}{n.titulo}</span>
                        {n.detalle && <span className="c-avisos__detalle">{n.detalle}</span>}
                        <time className="c-avisos__fecha">{hace(n.fecha, ahora)}</time>
                      </span>
                      {!n.leida && <span className="c-avisos__punto"><span className="oculto-accesible">{t.sinLeer}</span></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {pie && <footer className="c-avisos__pie">{pie}</footer>}
        </div>
      )}
    </div>
  );
}

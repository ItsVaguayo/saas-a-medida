// Catálogo del kit. Cada módulo con su demo, su uso y los mandos del tema para comprobar que todo
// sigue los tokens. Está hecho con el propio kit: paleta, cajón, segmentado, pista, avisos y estado en la URL.
import { Menu as IconoMenu, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Boton, BotonCopiar, Cajon, Fundido, Paleta, Pista, Segmentado, Teclas, ZonaAvisos, useAlmacen, useAtajo, useEstadoUrl,
} from '../kit/index.js';
import { normalizar } from '../kit/interno.js';
import { GRUPOS, MODULOS } from './modulos.js';
import './catalogo.css';

const TONOS = [{ valor: 256, nombre: 'Azul' }, { valor: 290, nombre: 'Violeta' }, { valor: 20, nombre: 'Rojo' }, { valor: 150, nombre: 'Verde' }, { valor: 60, nombre: 'Ámbar' }, { valor: 200, nombre: 'Turquesa' }];

function Indice({ actual, alElegir }) {
  const [texto, setTexto] = useState('');
  const visibles = MODULOS.filter((m) => normalizar(`${m.nombre} ${m.resumen}`).includes(normalizar(texto)));
  return (
    <>
      <label className="cat-buscar">
        <Search aria-hidden="true" />
        <input type="search" placeholder="Filtrar módulos" aria-label="Filtrar módulos" value={texto} onChange={(e) => setTexto(e.target.value)} />
      </label>
      <nav className="cat-indice" aria-label="Módulos">
        {visibles.length === 0 && <p className="demo-tenue" style={{ padding: 12 }}>Ningún módulo coincide con «{texto}»</p>}
        {GRUPOS.map((grupo) => {
          const suyos = visibles.filter((m) => m.grupo === grupo);
          if (!suyos.length) return null;
          return (
            <div key={grupo} className="cat-grupo">
              <h2>{grupo} <span>{suyos.length}</span></h2>
              {suyos.map((m) => (
                <a key={m.id} href={`?m=${m.id}`} aria-current={m.id === actual ? 'page' : undefined} onClick={(e) => { e.preventDefault(); alElegir(m.id); }}>
                  <span className="cat-n">{m.n}</span>{m.nombre}
                </a>
              ))}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export function Catalogo() {
  const [id, setId] = useEstadoUrl('m', MODULOS[0].id);
  const [tema, setTema] = useAlmacen('kit:tema', window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro');
  const [tono, setTono] = useAlmacen('kit:tono', 256);
  const [radio, setRadio] = useAlmacen('kit:radio', 8);
  const [densidad, setDensidad] = useAlmacen('kit:densidad', 'comoda');
  const [paleta, setPaleta] = useState(false);
  const [menu, setMenu] = useState(false);

  const indice = Math.max(0, MODULOS.findIndex((m) => m.id === id));
  const modulo = MODULOS[indice];
  const ir = (nuevo) => { setId(nuevo, { historial: true }); setMenu(false); window.scrollTo?.(0, 0); };

  // Los mandos del tema escriben los mismos tokens que tocaría un proyecto en su tema.css
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tema = tema;
    raiz.dataset.densidad = densidad === 'compacta' ? 'compacta' : '';
    raiz.style.setProperty('--tono', tono);
    raiz.style.setProperty('--radio', `${radio}px`);
  }, [tema, tono, radio, densidad]);

  // En la página de la paleta el atajo es de su demo
  useAtajo('mod+k', () => setPaleta((a) => !a), { activo: modulo.id !== 'paleta' });
  useAtajo('j', () => ir(MODULOS[Math.min(MODULOS.length - 1, indice + 1)].id));
  useAtajo('k', () => ir(MODULOS[Math.max(0, indice - 1)].id));
  const comandos = useMemo(() => MODULOS.map((m) => ({ id: m.id, titulo: m.nombre, grupo: m.grupo, claves: m.resumen, alElegir: () => ir(m.id) })), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="cat">
      <aside className="cat-lateral">
        <div className="cat-marca"><span className="cat-logo" aria-hidden="true">K</span><div><strong>Kit SaaS</strong><span>40 módulos</span></div></div>
        <Indice actual={modulo.id} alElegir={ir} />
      </aside>

      <div className="cat-principal">
        <header className="cat-barra">
          <Boton className="cat-solo-movil" variante="discreto" icono={IconoMenu} aria-label="Abrir índice" onClick={() => setMenu(true)} />
          <button type="button" className="cat-ir" onClick={() => setPaleta(true)}>
            <Search aria-hidden="true" /><span>Ir a un módulo</span><Teclas atajo="mod+k" />
          </button>
          <div className="cat-tema">
            <div className="cat-tonos" role="radiogroup" aria-label="Color de acento">
              {TONOS.map((t) => (
                <Pista key={t.valor} texto={t.nombre} lado="abajo">
                  <button type="button" role="radio" aria-checked={tono === t.valor} aria-label={t.nombre} style={{ '--muestra': `oklch(0.6 0.17 ${t.valor})` }} onClick={() => setTono(t.valor)} />
                </Pista>
              ))}
            </div>
            <label className="cat-mando cat-no-movil">Radio<input type="range" min="0" max="16" step="2" value={radio} onChange={(e) => setRadio(Number(e.target.value))} /></label>
            <Segmentado className="cat-no-movil" tamano="chico" etiqueta="Densidad" valor={densidad} alCambiar={setDensidad} opciones={[{ valor: 'comoda', texto: 'Cómoda' }, { valor: 'compacta', texto: 'Compacta' }]} />
            <Segmentado tamano="chico" etiqueta="Tema" valor={tema} alCambiar={setTema} opciones={[{ valor: 'claro', icono: Sun, etiqueta: 'Claro' }, { valor: 'oscuro', icono: Moon, etiqueta: 'Oscuro' }]} />
          </div>
        </header>

        <main className="cat-contenido">
          <Fundido clave={modulo.id}>
            <header className="cat-cabecera">
              <p className="cat-miga">{modulo.n} · {modulo.grupo}</p>
              <h1>{modulo.nombre}</h1>
              <p className="cat-resumen">{modulo.resumen}</p>
            </header>

            <section className="cat-escena" aria-label="Demo"><modulo.Demo /></section>

            <section className="cat-uso" aria-label="Uso">
              <header><h2>Uso</h2><code>src/kit/{modulo.fichero}</code><BotonCopiar texto={modulo.uso} etiqueta="Copiar el ejemplo" /></header>
              <pre><code>{modulo.uso}</code></pre>
            </section>

            <footer className="cat-pie">
              {indice > 0 ? <Boton variante="discreto" onClick={() => ir(MODULOS[indice - 1].id)}>← {MODULOS[indice - 1].nombre}</Boton> : <span />}
              {indice < MODULOS.length - 1 && <Boton variante="discreto" onClick={() => ir(MODULOS[indice + 1].id)}>{MODULOS[indice + 1].nombre} →</Boton>}
            </footer>
          </Fundido>
        </main>
      </div>

      <Cajon abierto={menu} alCerrar={() => setMenu(false)} titulo="Módulos" ancho={320}>
        <Indice actual={modulo.id} alElegir={ir} />
      </Cajon>
      <Paleta abierto={paleta} alCerrar={() => setPaleta(false)} comandos={comandos} marcador="Ir a un módulo…" />
      <ZonaAvisos />
    </div>
  );
}

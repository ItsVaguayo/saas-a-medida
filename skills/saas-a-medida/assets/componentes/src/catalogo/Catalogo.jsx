// Catálogo: los 31 componentes funcionando, con su código de uso y un panel para probar la personalización
// (tono, forma, densidad y tema) sobre todos a la vez. Es documentación, no una pantalla de producto.
import { Box, ChartColumn, Code, FormInput, LayoutPanelLeft, Moon, Package, Rows3, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarraLateral, Boton, BotonCopiar, Deslizador } from '../componentes/index.js';
import { BLOQUES } from './demos.jsx';
import './catalogo.css';

const ICONOS = { Estructura: LayoutPanelLeft, Datos: ChartColumn, Contenido: Box, Formularios: FormInput, Producto: Package };
const GRUPOS = BLOQUES.map((b) => ({
  titulo: b.titulo,
  elementos: b.demos.map((d) => ({ id: d.n, texto: `${d.n} · ${d.nombre}`, icono: ICONOS[b.titulo] })),
}));
const guardado = (clave, porDefecto) => {
  try { return JSON.parse(localStorage.getItem(`catalogo:${clave}`)) ?? porDefecto; } catch { return porDefecto; }
};

function Ficha({ demo }) {
  const [conCodigo, setConCodigo] = useState(false);
  const { Demo } = demo;
  return (
    <article id={demo.n} className="cat-ficha">
      <header>
        <span className="cat-ficha__n">{demo.n}</span>
        <div>
          <h3>{demo.nombre}</h3>
          <p>{demo.uso}</p>
        </div>
        <Boton tamano="chico" variante="discreto" icono={Code} aria-expanded={conCodigo} onClick={() => setConCodigo(!conCodigo)}>Código</Boton>
      </header>
      <div className="cat-ficha__codigo" data-abierto={conCodigo || undefined}>
        <div inert={!conCodigo}>
          <pre><code>{`import { ${demo.nombre} } from './componentes';\n\n${demo.codigo}`}</code></pre>
          <BotonCopiar texto={demo.codigo} />
        </div>
      </div>
      <div className="cat-ficha__escena"><Demo /></div>
    </article>
  );
}

export function Catalogo() {
  const [activo, setActivo] = useState('01');
  const [tono, setTono] = useState(() => guardado('tono', 256));
  const [radio, setRadio] = useState(() => guardado('radio', 8));
  const [oscuro, setOscuro] = useState(() => guardado('oscuro', false));
  const [compacta, setCompacta] = useState(() => guardado('compacta', false));

  // La personalización es esto: cuatro valores en la raíz y cambia todo
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.setProperty('--tono', tono);
    raiz.style.setProperty('--radio', `${radio}px`);
    if (oscuro) raiz.dataset.tema = 'oscuro'; else delete raiz.dataset.tema;
    if (compacta) raiz.dataset.densidad = 'compacta'; else delete raiz.dataset.densidad;
    try {
      Object.entries({ tono, radio, oscuro, compacta }).forEach(([k, v]) => localStorage.setItem(`catalogo:${k}`, JSON.stringify(v)));
    } catch { /* sin almacenamiento, la preferencia dura lo que la pestaña */ }
  }, [tono, radio, oscuro, compacta]);

  // El lateral marca la ficha que se está viendo
  useEffect(() => {
    const observador = new IntersectionObserver((entradas) => {
      const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActivo(visible.target.id);
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('.cat-ficha').forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, []);

  const ir = (id) => {
    setActivo(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="cat">
      <BarraLateral
        className="cat__lateral"
        etiqueta="Componentes"
        grupos={GRUPOS}
        activo={activo}
        alElegir={ir}
        cabecera={<div className="cat__marca"><span>31</span><b>Componentes SaaS</b></div>}
      />
      <main className="cat__principal">
        <header className="cat__cabecera">
          <div>
            <h1>Componentes SaaS</h1>
            <p>31 piezas de interfaz para apps de gestión. Todas salen de un solo fichero de tema: prueba a cambiarlo.</p>
          </div>
          <div className="cat__ajustes" aria-label="Personalizar el tema">
            <label>
              <span>Tono <i style={{ background: 'var(--acento)' }} /></span>
              <Deslizador etiqueta="Tono del acento" valor={tono} alCambiar={setTono} min={0} max={359} formato={(n) => `${n}°`} />
            </label>
            <label>
              <span>Radio</span>
              <Deslizador etiqueta="Radio de las esquinas" valor={radio} alCambiar={setRadio} min={0} max={16} formato={(n) => `${n} px`} />
            </label>
            <div className="cat__botones">
              <Boton tamano="chico" icono={oscuro ? Sun : Moon} aria-pressed={oscuro} onClick={() => setOscuro(!oscuro)}>{oscuro ? 'Claro' : 'Oscuro'}</Boton>
              <Boton tamano="chico" icono={Rows3} aria-pressed={compacta} onClick={() => setCompacta(!compacta)}>{compacta ? 'Normal' : 'Compacta'}</Boton>
            </div>
          </div>
        </header>
        {BLOQUES.map((bloque) => (
          <section key={bloque.titulo} className="cat__bloque">
            <h2>{bloque.titulo}</h2>
            {bloque.demos.map((demo) => <Ficha key={demo.n} demo={demo} />)}
          </section>
        ))}
      </main>
    </div>
  );
}

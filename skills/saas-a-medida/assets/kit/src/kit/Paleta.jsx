// 19 · Paleta de comandos. Un buscador que llega a cualquier pantalla y a cualquier acción desde el teclado.
// Quien usa la app ocho horas al día acaba haciéndolo todo desde aquí.
import { CornerDownLeft, Search } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { useModal } from './Dialogo.jsx';
import { teclasDe } from './hooks.js';
import { normalizar, useEfectoDeMaqueta } from './interno.js';
import './Paleta.css';

/** Coincidencia tolerante: todas las palabras escritas tienen que estar, en cualquier orden y sin tildes. */
export function filtrarComandos(comandos, consulta) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!palabras.length) return comandos;
  return comandos
    .map((c) => {
      const titulo = normalizar(c.titulo);
      const pajar = `${titulo} ${normalizar(c.grupo)} ${normalizar(c.claves)}`;
      if (!palabras.every((p) => pajar.includes(p))) return null;
      // Arriba lo que empieza por lo escrito; después lo que lo lleva en el título; al final el resto
      const puntos = titulo.startsWith(palabras[0]) ? 0 : titulo.includes(palabras[0]) ? 1 : 2;
      return { c, puntos };
    })
    .filter(Boolean)
    .sort((a, b) => a.puntos - b.puntos)
    .map((x) => x.c);
}

export const Teclas = ({ atajo }) => (
  <span className="k-teclas">{teclasDe(atajo).map((t, i) => <kbd key={i} className="k-tecla">{t}</kbd>)}</span>
);

/** @param comandos [{ id, titulo, grupo, icono, atajo, claves (sinónimos para buscar), alElegir }]
    @param marcador texto del campo cuando está vacío */
export function Paleta({ abierto, alCerrar, comandos, marcador = 'Buscar o ir a…' }) {
  const id = useId();
  const modal = useModal(abierto, alCerrar);
  const lista = useRef(null);
  const [consulta, setConsulta] = useState('');
  const [activo, setActivo] = useState(0);
  const encontrados = useMemo(() => filtrarComandos(comandos, consulta), [comandos, consulta]);

  // Cada vez que se abre, empieza limpia
  useEfectoDeMaqueta(() => { if (abierto) { setConsulta(''); setActivo(0); } }, [abierto]);
  useEfectoDeMaqueta(() => {
    lista.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [activo, encontrados]);

  const elegir = (comando) => {
    alCerrar?.();
    comando?.alElegir?.();
  };

  const tecla = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActivo((i) => (i + 1) % Math.max(1, encontrados.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActivo((i) => (i - 1 + encontrados.length) % Math.max(1, encontrados.length)); }
    else if (e.key === 'Home') { e.preventDefault(); setActivo(0); }
    else if (e.key === 'End') { e.preventDefault(); setActivo(Math.max(0, encontrados.length - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); elegir(encontrados[activo]); }
  };

  // Con algo escrito manda la relevancia; sin nada, los comandos se enseñan por grupos
  const grupos = [];
  encontrados.forEach((c, indice) => {
    const nombre = consulta ? '' : c.grupo ?? '';
    const grupo = grupos.find((g) => g.nombre === nombre) ?? grupos[grupos.push({ nombre, comandos: [] }) - 1];
    grupo.comandos.push({ c, indice });
  });

  return (
    <dialog {...modal} className="k-paleta" aria-label="Comandos">
      <div className="k-paleta__caja">
        <div className="k-paleta__buscador">
          <Search aria-hidden="true" />
          <input
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-lista`}
            aria-activedescendant={encontrados[activo] ? `${id}-${encontrados[activo].id}` : undefined}
            aria-autocomplete="list"
            aria-label={marcador}
            placeholder={marcador}
            autoComplete="off"
            spellCheck="false"
            value={consulta}
            onChange={(e) => { setConsulta(e.target.value); setActivo(0); }}
            onKeyDown={tecla}
          />
          <kbd className="k-tecla">Esc</kbd>
        </div>
        <div className="k-paleta__lista" id={`${id}-lista`} role="listbox" aria-label="Resultados" ref={lista}>
          {encontrados.length === 0 && <p className="k-paleta__vacio">Ningún resultado para «{consulta}»</p>}
          {grupos.map((g) => (
            <div key={g.nombre} role="group" aria-label={g.nombre || undefined}>
              {g.nombre && <div className="k-paleta__grupo" aria-hidden="true">{g.nombre}</div>}
              {g.comandos.map(({ c, indice }) => (
                <div
                  key={c.id}
                  id={`${id}-${c.id}`}
                  role="option"
                  aria-selected={indice === activo}
                  className="k-paleta__opcion"
                  onPointerMove={() => indice !== activo && setActivo(indice)}
                  onClick={() => elegir(c)}
                >
                  {c.icono && <c.icono aria-hidden="true" />}
                  <span>{c.titulo}</span>
                  {c.atajo && <Teclas atajo={c.atajo} />}
                </div>
              ))}
            </div>
          ))}
        </div>
        <footer className="k-paleta__pie" aria-hidden="true">
          <span><kbd className="k-tecla">↑</kbd><kbd className="k-tecla">↓</kbd> moverse</span>
          <span><kbd className="k-tecla"><CornerDownLeft /></kbd> abrir</span>
        </footer>
      </div>
    </dialog>
  );
}

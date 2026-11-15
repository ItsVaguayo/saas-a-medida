// 29 · SubirArchivos. Soltar archivos o elegirlos, ver cómo sube cada uno y reintentar el que falle.
// Lo que no vale (pesa demasiado, tipo equivocado) se dice antes de subirlo y dice por qué.
import { CircleAlert, FileText, RotateCw, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Boton } from './base.jsx';
import { tamano } from './formato.js';
import { Barra } from './Progreso.jsx';
import { cx } from './interno.js';
import './SubirArchivos.css';

/** ¿El archivo encaja en un `accept` de <input>? («.pdf,image/*») */
export function tipoValido(archivo, aceptar) {
  if (!aceptar) return true;
  const nombre = archivo.name.toLowerCase();
  return aceptar.split(',').map((t) => t.trim().toLowerCase()).some((t) => (
    t.startsWith('.') ? nombre.endsWith(t) : t.endsWith('/*') ? archivo.type.startsWith(t.slice(0, -1)) : archivo.type === t
  ));
}

let siguiente = 1;

/** @param subir      (archivo, alProgreso(0..1), { signal }) => Promise. Si se rechaza, la fila ofrece reintentar
    @param aceptar    como el `accept` de <input>: '.pdf,image/*'
    @param maximo     bytes por archivo
    @param textoTipos cómo se dicen los tipos admitidos: «PDF o imagen»
    @param alTerminar (archivo, resultado) => void */
export function SubirArchivos({ subir, aceptar, maximo, multiple = true, textoTipos, alTerminar, etiqueta = 'Archivos', className }) {
  const [filas, setFilas] = useState([]);
  const [encima, setEncima] = useState(false);
  const profundidad = useRef(0);
  const cortes = useRef(new Map());
  useEffect(() => () => cortes.current.forEach((c) => c.abort()), []);

  const cambiar = (id, cambios) => setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, ...cambios } : f)));

  const lanzar = (fila) => {
    const corte = new AbortController();
    cortes.current.set(fila.id, corte);
    cambiar(fila.id, { estado: 'subiendo', progreso: 0, error: null });
    Promise.resolve()
      .then(() => subir(fila.archivo, (p) => cambiar(fila.id, { progreso: p }), { signal: corte.signal }))
      .then((resultado) => {
        if (corte.signal.aborted) return;
        cambiar(fila.id, { estado: 'hecho', progreso: 1 });
        alTerminar?.(fila.archivo, resultado);
      })
      .catch((e) => { if (!corte.signal.aborted) cambiar(fila.id, { estado: 'error', error: e?.message || 'No se ha podido subir' }); });
  };

  const anadir = (lista) => {
    const nuevas = [...lista].slice(0, multiple ? undefined : 1).map((archivo) => {
      const fila = { id: siguiente++, archivo, estado: 'subiendo', progreso: 0, error: null };
      if (!tipoValido(archivo, aceptar)) return { ...fila, estado: 'rechazado', error: `Tipo no admitido${textoTipos ? `: solo ${textoTipos}` : ''}` };
      if (maximo && archivo.size > maximo) return { ...fila, estado: 'rechazado', error: `Pesa ${tamano(archivo.size)}; el máximo son ${tamano(maximo)}` };
      return fila;
    });
    setFilas((fs) => (multiple ? [...fs, ...nuevas] : nuevas));
    nuevas.filter((f) => f.estado === 'subiendo').forEach(lanzar);
  };

  const quitar = (id) => {
    cortes.current.get(id)?.abort();
    cortes.current.delete(id);
    setFilas((fs) => fs.filter((f) => f.id !== id));
  };

  const limites = [textoTipos, maximo && `hasta ${tamano(maximo)}`].filter(Boolean).join(', ');

  return (
    <div className={cx('k-subir', className)}>
      <label
        className="k-subir__zona"
        data-encima={encima || undefined}
        // Se cuentan entradas y salidas: al pasar por encima de un hijo el navegador avisa de una salida que no lo es
        onDragEnter={(e) => { e.preventDefault(); profundidad.current += 1; setEncima(true); }}
        onDragLeave={() => { profundidad.current -= 1; if (profundidad.current <= 0) setEncima(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); profundidad.current = 0; setEncima(false); anadir(e.dataTransfer.files); }}
      >
        <input type="file" className="oculto-accesible" accept={aceptar} multiple={multiple} aria-label={etiqueta} onChange={(e) => { anadir(e.target.files); e.target.value = ''; }} />
        <span className="k-subir__icono" aria-hidden="true"><Upload /></span>
        <span className="k-subir__texto">
          <strong>{encima ? 'Suelta para subir' : 'Arrastra archivos o elige del equipo'}</strong>
          {limites && <span>{limites.charAt(0).toUpperCase() + limites.slice(1)}</span>}
        </span>
      </label>

      {filas.length > 0 && (
        <ul className="k-subir__lista">
          {filas.map((f) => {
            const mal = f.estado === 'error' || f.estado === 'rechazado';
            return (
              <li key={f.id} className="k-subir__fila" data-estado={f.estado}>
                <span className="k-subir__tipo" aria-hidden="true">{mal ? <CircleAlert /> : <FileText />}</span>
                <div className="k-subir__datos">
                  <div className="k-subir__nombre">
                    <span title={f.archivo.name}>{f.archivo.name}</span>
                    <small>{f.estado === 'subiendo' ? `${Math.round(f.progreso * 100)} %` : tamano(f.archivo.size)}</small>
                  </div>
                  {f.estado === 'subiendo' && <Barra valor={f.progreso} max={1} etiqueta={`Subiendo ${f.archivo.name}`} />}
                  {mal && <p className="k-subir__error" role="alert">{f.error}</p>}
                </div>
                {f.estado === 'error' && <Boton variante="discreto" tamano="chico" icono={RotateCw} aria-label={`Reintentar ${f.archivo.name}`} onClick={() => lanzar(f)} />}
                <Boton variante="discreto" tamano="chico" icono={X} aria-label={`${f.estado === 'subiendo' ? 'Cancelar' : 'Quitar'} ${f.archivo.name}`} onClick={() => quitar(f.id)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

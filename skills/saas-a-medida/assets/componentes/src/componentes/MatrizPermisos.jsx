// 26 · Matriz de permisos. Qué puede hacer cada rol, permiso a permiso. Cada grupo tiene una casilla por rol
// que marca o desmarca el grupo entero. Referencias: GitHub (roles de la organización), Notion, Holded.
import { ChevronDown, Lock } from 'lucide-react';
import { Fragment, useState } from 'react';
import { cx } from './interno.js';
import './MatrizPermisos.css';

/** @param roles      [{ id, nombre, detalle? }]
    @param grupos     [{ titulo, permisos: [{ id, nombre, detalle? }] }]
    @param valor      { [rolId]: ['permiso.id', …] }
    @param alCambiar  (valor, { rol, permisos, concedido }) => void
    @param bloqueados { [rolId]: true | ['permiso.id'] }  lo que no se puede tocar (el propietario lo tiene todo)
    @param soloLectura  enseña la matriz sin dejar cambiarla */
export function MatrizPermisos({ roles, grupos, valor, alCambiar, bloqueados = {}, soloLectura, etiqueta = 'Permisos por rol', textos, className }) {
  const t = { permiso: 'Permiso', de: 'de', todoElGrupo: 'Todo', bloqueado: 'No se puede cambiar', ...textos };
  const [plegados, setPlegados] = useState([]);
  const tiene = (rol, permiso) => Boolean(valor[rol]?.includes(permiso));
  const fijo = (rol, permiso) => soloLectura || bloqueados[rol] === true || Boolean(bloqueados[rol]?.includes?.(permiso));
  const totalPermisos = grupos.reduce((n, g) => n + g.permisos.length, 0);

  const cambiar = (rol, permisos, concedido) => {
    const libres = permisos.filter((p) => !fijo(rol, p));
    if (!libres.length) return;
    const actuales = new Set(valor[rol] ?? []);
    libres.forEach((p) => (concedido ? actuales.add(p) : actuales.delete(p)));
    alCambiar?.({ ...valor, [rol]: [...actuales] }, { rol, permisos: libres, concedido });
  };

  return (
    <div className={cx('c-permisos', className)}>
      <table aria-label={etiqueta}>
        <thead>
          <tr>
            <th scope="col" className="c-permisos__esquina">{t.permiso}</th>
            {roles.map((rol) => (
              <th key={rol.id} scope="col" className="c-permisos__rol">
                <span>{rol.nombre}</span>
                <small>{valor[rol.id]?.length ?? 0} {t.de} {totalPermisos}</small>
              </th>
            ))}
          </tr>
        </thead>
        {grupos.map((grupo) => {
          const ids = grupo.permisos.map((p) => p.id);
          const plegado = plegados.includes(grupo.titulo);
          return (
            <tbody key={grupo.titulo} data-plegado={plegado || undefined}>
              <tr className="c-permisos__grupo">
                <th scope="rowgroup">
                  <button
                    type="button"
                    aria-expanded={!plegado}
                    onClick={() => setPlegados(plegado ? plegados.filter((x) => x !== grupo.titulo) : [...plegados, grupo.titulo])}
                  >
                    <ChevronDown aria-hidden="true" />
                    {grupo.titulo}
                  </button>
                </th>
                {roles.map((rol) => {
                  const marcados = ids.filter((p) => tiene(rol.id, p)).length;
                  const todoFijo = ids.every((p) => fijo(rol.id, p));
                  return (
                    <td key={rol.id}>
                      <input
                        type="checkbox"
                        className="c-casilla"
                        checked={marcados === ids.length}
                        ref={(el) => { if (el) el.indeterminate = marcados > 0 && marcados < ids.length; }}
                        disabled={todoFijo}
                        aria-label={`${t.todoElGrupo} ${grupo.titulo}: ${rol.nombre}`}
                        onChange={() => cambiar(rol.id, ids, marcados !== ids.length)}
                      />
                    </td>
                  );
                })}
              </tr>
              {!plegado && grupo.permisos.map((permiso, i) => (
                <tr key={permiso.id} className="c-permisos__fila" style={{ '--i': i }}>
                  <th scope="row">
                    <span>{permiso.nombre}</span>
                    {permiso.detalle && <small>{permiso.detalle}</small>}
                  </th>
                  {roles.map((rol) => {
                    const bloqueado = fijo(rol.id, permiso.id);
                    const marcado = tiene(rol.id, permiso.id);
                    return (
                      <td key={rol.id}>
                        {bloqueado && !soloLectura && marcado ? (
                          <Fragment>
                            <Lock className="c-permisos__candado" aria-hidden="true" />
                            <span className="oculto-accesible">{permiso.nombre}: {rol.nombre}, concedido. {t.bloqueado}</span>
                          </Fragment>
                        ) : (
                          <input
                            type="checkbox"
                            className="c-casilla"
                            checked={marcado}
                            disabled={bloqueado}
                            aria-label={`${permiso.nombre}: ${rol.nombre}`}
                            onChange={() => cambiar(rol.id, [permiso.id], !marcado)}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

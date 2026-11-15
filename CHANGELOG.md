# Cambios

## 1.2.1

- Otros 31 componentes de React en `assets/componentes/`, que complementan al kit: estructura, cifras y gráficos, formularios y bloques de producto. Mismos tokens (`--tono`, `--acento`, `--tinta`, `--linea`, `--e-N`, `--radio`), prefijo `c-`, catálogo propio (puerto 5191) y 61 pruebas. Guía nueva, `references/componentes-complementarios.md`.
- Módulo 41 del kit, `BarraCristal`: navegación translúcida que flota sobre una foto o un fondo oscuro, con buscador, ramas, interruptores y plegado a iconos.

## 1.2.0

- Kit de 40 módulos de interfaz en `assets/kit/` (7 funciones, 8 animaciones, 19 interactivos y 6 apartados), con catálogo y 69 pruebas. Guía nueva, `references/kit-componentes.md`; el catálogo de la fase 5 y los componentes de la fase 7 salen de ahí.

## 1.1.0

Desarrollo
- Dos guías nuevas, `desarrollo-backend.md` y `desarrollo-frontend.md`: el procedimiento y la comprobación de cada paso, escritas para que las siga cualquier modelo o agente.
- Las revisiones van en dos niveles: en cada PR, `/simplify`, `/code-review`, `break-ui` y seguridad si toca; antes de la demo, una pasada completa de diseño, móvil y accesibilidad sobre `develop`. `/simplify` pasa a ir antes que `/code-review`.
- Plantilla de CI (`assets/github/ci.yml`) y `scripts/proteger-ramas.sh`. El nivel de protección de `develop` y `main` (ninguna, pr, revision o estricta) se elige con el menú en la fase 0 y se guarda en `proteccion`.
- La seguridad de sesión, contraseñas y cabeceras se exige al montar lo común (fase 6) y se vuelve a comprobar en producción.
- La migración de los datos reales es un módulo de la especificación, con ensayo en la fase 8.

Documentos del proyecto
- El avance va en un fichero por módulo (`docs/avance/`) y lo calcula `scripts/avance.py`. Desaparece `docs/avance.md`.
- El estado de las fases pasa de una tabla en `CLAUDE.md` al campo `fases` de `.claude/saas-a-medida.json`.
- Los documentos comunes se cambian en ramas `docs/<tema>`, no desde la rama de un módulo.
- La especificación manda también sobre el código; la excepción de los nombres queda escrita igual en la skill y en la plantilla de `CLAUDE.md`.
- `docs/lecciones.md` y `references/lecciones.md`: qué se apunta al cerrar para mejorar la skill.

Fases
- Fase 0: entrada para un proyecto ya empezado. `scripts/detectar-fase.py` mira los ficheros y el historial y propone en qué fase está, para seguir desde ahí en vez de empezar por la primera.
- Fase 1: de quién es el código, quién paga el servidor y quién decide por parte del cliente.
- Fase 8: la conformidad del cliente queda por escrito.

Despliegue
- `desplegar.sh` se niega a arrancar sin `SALUD` o `SALUD_CMD` (antes desplegaba, daba la salud por caída y restauraba los datos encima).
- Con `PRODUCCION=1` solo despliega desde `main` y si coincide con `origin`.
- `--atras --con-datos` restaura la copia de antes de la versión que se retira.
- `PRUEBAS_LOCALES=""` y `COMPILAR=""` ya desactivan ese paso.
- `copia-nocturna.sh`: copia de cada noche con envío fuera del servidor y restauración de prueba.

Aviso de PR
- Un PR ya revisado vuelve a avisar cuando recibe commits nuevos.
- Al abrir la sesión dice qué fases están en curso, también trabajando solo.

Para proyectos empezados con la 1.0.0: pasar la tabla «Estado» del `CLAUDE.md` a `fases` del JSON, partir `docs/avance.md` en un fichero por módulo y copiar el `desplegar.sh` nuevo a `deploy/`.

## 1.0.0

Primera versión.

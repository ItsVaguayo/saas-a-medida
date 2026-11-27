# Cambios

## 1.2.4

- Regla nueva: una vez desplegada, la app no depende de un programador para el día a día. Todo dato que se ve en pantalla se crea, edita y da de baja desde la app, y las listas que el cliente querrá cambiar (categorías, tarifas, tipos de cita, plantillas de aviso) se editan en Configuración. La especificación lleva por módulo una tabla «Datos que maneja» (quién crea, edita y da de baja cada dato y desde qué pantalla) y lo que se queda fijo en el código, con su motivo. Un módulo no está hecho hasta que alguien lo usa entero con la base vacía; va como criterio en el plan técnico, como paso en la prueba de pantallas, en la revisión de un PR y en la plantilla de PR.
- Revisar el PR de un compañero ya no repite `/code-review`, que pasa el autor antes de abrirlo: quien revisa lo contrasta con la especificación y lo prueba. Los agentes de `pr-review-toolkit` quedan para PR grandes (más de unas 400 líneas sin tests) o que tocan sesión, permisos, pagos o datos sensibles.
- Grupo opcional `seguridad-extra`: `security-audit` de Cloudflare (MIT), como segunda opinión en la fase 9, una sola vez y preguntándolo antes, porque lanza muchos subagentes.

## 1.2.3

- Al empezar, se comprueba la rama antes de tocar nada.
- Nada entra en `develop` sin PR revisado. Lo integrado sin revisión se revisa después como un PR más.
- Un PR, un tema. Si es muy grande, se parte antes de pedir revisión.
- Antes de abrir un PR se comprueba el diff. Si alguna revisión no se ha pasado, se dice en la descripción.
- Los cambios en ficheros de otra persona van en un commit aparte, con esa persona como revisora. Nuevo apartado en la plantilla de PR.
- Los PR grandes se revisan por zonas, y lo grave se reproduce antes de contarlo.
- El QA va en `docs/qa/` con la plantilla nueva `assets/docs/qa-campana.md`. Hay también un procedimiento para arreglar lo que encuentra.
- Un test que daba por bueno un fallo se cambia junto con el arreglo. Los tests no escriben en los datos de la persona.

## 1.2.2

Seguridad
- `copia-nocturna.sh` cifra con `age` (o `gpg`) lo que sale del servidor, con una clave pública; la privada no va al servidor. Se niega si no puede cifrar o si el fichero de destinatarios trae una clave privada. `CIFRADO=ninguno` existe, pero deja un aviso cada noche. La cabecera del script explica cómo crear las claves y cómo restaurar.
- CI: `gitleaks` sobre todo el historial y `npm audit --omit=dev --audit-level=high`, dentro del trabajo «comprobar» para que bloqueen. Plantilla nueva `assets/github/dependabot.yml`, que se copia en la fase 0.
- Lo común (fase 6, plantilla del plan técnico y comprobación de la fase 9): segundo factor obligatorio para administradores, recuperación de contraseña con enlace de un solo uso, aislamiento con RLS si hay Postgres, CSRF, CORS cerrado y registro de auditoría.
- `desarrollo-backend.md`: política RLS en la misma migración, rastro de auditoría en la transacción, test de CSRF por módulo y CORS solo por especificación. `desarrollo-frontend.md`: `autocomplete` de contraseñas y código de un solo uso.
- Fase 10: el mantenimiento mensual restaura una copia externa descifrándola, revisa los PR de Dependabot y el registro de auditoría.

Tokens y contextos largos
- Graphify pasa a ser obligatorio (grupo `obligatorias` de `comprobar-skills.sh`, que se instala siempre con `--instalar`). En la fase 0, `graphify claude install`, `graphify hook install` y `graphify update .`; `graphify-out/` va al `.gitignore`. El aviso de inicio de sesión dice si falta graphify, su hook o el mapa.
- `ahorro-tokens.md`: cuándo usar `/compact` y `/clear`, nota de relevo entre sesiones (sección «Relevo» del avance de cada módulo y `docs/relevo/<usuario>.md`, plantilla nueva), qué partes cargar de `impeccable`, LSP para Python y PHP y registro del gasto por fase (`docs/gasto.md`, plantilla nueva).

Para proyectos empezados con versiones anteriores: copiar `ci.yml` y `dependabot.yml` nuevos a `.github/`, el `copia-nocturna.sh` nuevo al servidor con `CIFRADO` y `CIFRAR_PARA` en su `copia.env`, instalar graphify con su hook y añadir a la especificación lo que falte de la tabla de lo común.

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

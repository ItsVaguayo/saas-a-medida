# Fase 0. Equipo y proyecto

Deja el proyecto listo para que cualquiera que abra Claude en él sepa quién trabaja, dónde está cada cosa y en qué fase va.

## Si el proyecto ya está empezado

Hay código o documentos, pero no `.claude/saas-a-medida.json` (o le falta el campo `fases`). No se rehace nada ni se empieza por la fase 1: se pone la skill encima de lo que hay y se sigue desde donde esté.

1. Ejecuta `python3 "${CLAUDE_SKILL_DIR}/scripts/detectar-fase.py"` en la raíz del proyecto. Mira los ficheros y el historial de git y propone el estado de cada fase con el rastro en el que se basa: `hecha`, `en curso`, `pendiente` o `hueco` (no hay rastro de esa fase, pero sí trabajo de fases posteriores).
2. El script solo ve lo que hay en la carpeta. Completa su propuesta con lo que no puede ver: abre los documentos que encontró para comprobar que dicen lo que su nombre promete, y pregunta a la persona por lo que vive fuera del repo (un alcance enviado por correo, una demo ya enseñada, si está en producción). Para dar una fase por hecha tiene que existir lo que sale de ella (columna «Qué sale» de la tabla de fases), con el nombre que sea: si el alcance está en un PDF enviado, la fase 3 está hecha; si la especificación son notas sueltas, la fase 6 no lo está.
3. Enseña la tabla (fase, estado, en qué te basas) y confírmala con el menú: una pregunta para la fase en la que se sigue trabajando, con la que propone el script como primera opción, y otra para qué hacer con los huecos. Cada hueco se puede rellenar ahora, apuntar como tarea para más adelante o dar por no necesario; no se rehace una fase entera por sistema. Lo mínimo para poder seguir en la fase 7 es una especificación de los módulos que quedan y la tabla de roles y permisos.
4. Haz los pasos 1 a 6 de abajo igual, escribiendo en `fases` lo confirmado. En el paso 3 no crees ramas que ya existan ni pises un `CLAUDE.md` o una plantilla de PR que ya estén: añade lo que falte y pregunta con el menú si algo choca.
5. Si la app ya está en producción, comprueba hoy tres cosas de la fase 9 antes de tocar nada más: que hay copias y salen del servidor, que el despliegue va por script y que se puede volver atrás.

## 1. Quién trabaja

Pregunta con el menú (ver `decisiones.md`):

- **Modo de trabajo**: solo, en pareja o en grupo (tres o más). Explica que en pareja o grupo la skill reparte módulos para que cada uno trabaje sin esperar al otro, y avisa de los PR que cada uno tiene que revisar.

Después pide en el chat, como datos:

- El nombre de cada persona y su usuario de GitHub. Los usuarios de GitHub hacen falta para los avisos de PR y para pedir revisiones. El tuyo lo sacas con `gh api user -q .login`; si `gh` no está identificado, dile a la persona que ejecute `gh auth login`.
- El nombre del cliente y el del proyecto.

En pareja o grupo, pregunta con el menú quién lleva el contacto con el cliente (las opciones son los nombres). Explica qué implica: habla con el cliente, recibe sus respuestas y es quien decide con quien vende el alcance y lo que se le envía.

## 2. Dónde van los documentos del cliente

Pregunta con el menú dónde se guardan los PDF y documentos para el cliente (alcance, guías, contratos):

- **Fuera del repo** (recomendado): una carpeta de documentos del proyecto, por ejemplo `~/Documentos/<cliente>/`. Los documentos con datos del cliente no deben acabar en GitHub.
- **Dentro del repo**, en `docs/cliente/`: más cómodo, pero se sube con el código. Si se elige, añade la carpeta a `.gitignore`.

## 3. Crear o preparar el repo

- Si ya hay repo (por ejemplo, el de la demo que vio el cliente), trabaja en él.
- Si no, crea la carpeta del proyecto con `git init`, una rama `main` y una `develop`. El código llegará en la fase 2.

Copia desde `${CLAUDE_SKILL_DIR}/assets/`:

| Plantilla | Destino |
|---|---|
| `proyecto.json` | `.claude/saas-a-medida.json`, rellenado con lo de los pasos 1 y 2 |
| `CLAUDE.md` | raíz del repo, rellenado |
| `settings.json` | `.claude/settings.json` (si ya existe, mezcla las claves sin borrar nada) |
| `pull_request_template.md` | `.github/pull_request_template.md` |
| `github/ci.yml` | `.github/workflows/ci.yml`, con los comandos del stack cuando se conozca (fase 2). Ya busca secretos en el historial y dependencias con fallos graves |
| `github/dependabot.yml` | `.github/dependabot.yml`, con el ecosistema del stack: propone cada semana las actualizaciones de dependencias como PR a `develop` |
| `docs/informacion-cliente.md`, `docs/dudas.md`, `docs/decisiones.md`, `docs/gasto.md` | `docs/` |
| `docs/relevo.md` | `docs/relevo/<usuario de GitHub>.md`, uno por persona del equipo |

Añade `graphify-out/` al `.gitignore` del repo (paso 5).

El resto de plantillas de `assets/docs/` se copian en la fase que las usa.

`.claude/settings.json` declara el marketplace de esta skill y la activa para el proyecto. Así, quien abra el repo sin tenerla ve en `/plugin` que falta y el comando para instalarla. El `CLAUDE.md` del proyecto también lo explica.

## 4. Protección de las ramas

Pregunta con el menú cuánto se protege `develop` y `main` en GitHub. Explica antes, en una frase, qué es: GitHub puede impedir que se suba código directo a esas ramas y obligar a que todo pase por un PR con los tests en verde.

| Opción | Qué pasa | Para quién |
|---|---|---|
| `pr` | Todo entra por PR y con el CI en verde. Nadie tiene que aprobar | recomendada trabajando solo |
| `revision` | Lo anterior y, además, otra persona tiene que aprobar cada PR | recomendada en pareja o grupo |
| `estricta` | Lo anterior y ni siquiera quien administra el repo puede saltárselo | cuando hay datos delicados o gente nueva en el equipo; una urgencia también pasa por PR |
| `ninguna` | Se puede subir directo. El CI avisa en rojo pero no impide integrar | prototipos y repos privados sin plan de pago de GitHub, donde la protección no existe |

Pon primero la recomendada según el modo de trabajo. Guarda la respuesta en `proteccion` de `.claude/saas-a-medida.json` y en `docs/decisiones.md`. Se aplica al cerrar la fase, cuando el repo ya está en GitHub, y se puede cambiar más adelante volviendo a preguntar y a pasar el script.

## 5. Skills y herramientas

1. Ejecuta `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh"`. Lista las skills recomendadas que faltan, las obligatorias y las opcionales.
2. **Graphify es obligatorio**, no se pregunta: instálalo con `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh" --instalar obligatorias` y, desde la raíz del repo, `graphify claude install`, `graphify hook install` y `graphify update .` (sin `--strict`). Si falta `uv`, di el comando para instalarlo y sigue con lo demás; la fase no se cierra sin graphify. Qué hace y por qué: `ahorro-tokens.md`.
3. Pregunta con el menú (`multiSelect: true`) qué grupos opcionales instalar, explicando qué aporta cada uno y cuánto pesa en tokens (los servidores MCP cargan sus herramientas en cada mensaje). En el grupo `tokens`, ofrece el LSP del lenguaje del proyecto.
4. Instala lo elegido con `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh" --instalar <grupos>`.
5. Comprueba que hay Google Chrome o Chromium para generar los PDF y `gh` identificado para los avisos de PR. Si falta algo, dilo con el comando para instalarlo.

## 6. Cerrar la fase

- En `fases` de `.claude/saas-a-medida.json`: fase 0 hecha, fase 1 en curso.
- Con el repo ya en GitHub, aplica la protección elegida en el paso 4: `bash "${CLAUDE_SKILL_DIR}/scripts/proteger-ramas.sh"` (lee el nivel del fichero de proyecto; `--simular` enseña lo que haría). En un repo privado sin plan de pago GitHub no lo permite: el script lo dice, y entonces díselo a la persona y deja `proteccion` en `ninguna`.
- Apunta en `docs/decisiones.md` el modo de trabajo, quién lleva el contacto, dónde van los documentos y el nivel de protección de las ramas.
- Si es en pareja o grupo, propón a la persona hacer el primer commit en `develop` y subirlo, para que los demás clonen el repo con todo esto. Haz el commit y el push solo si te lo confirma. Recuérdale que cada compañero, al clonar, instala graphify y pasa `graphify hook install` (está en los comandos del `CLAUDE.md`).

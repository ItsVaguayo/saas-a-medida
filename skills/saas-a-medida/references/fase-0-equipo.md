# Fase 0. Equipo y proyecto

Deja el proyecto listo para que cualquiera que abra Claude en él sepa quién trabaja, dónde está cada cosa y en qué fase va.

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
| `docs/informacion-cliente.md`, `docs/dudas.md`, `docs/decisiones.md` | `docs/` |

El resto de plantillas de `assets/docs/` se copian en la fase que las usa.

`.claude/settings.json` declara el marketplace de esta skill y la activa para el proyecto. Así, quien abra el repo sin tenerla ve en `/plugin` que falta y el comando para instalarla. El `CLAUDE.md` del proyecto también lo explica.

## 4. Skills y herramientas

1. Ejecuta `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh"`. Lista las skills recomendadas que faltan y las opcionales.
2. Pregunta con el menú (`multiSelect: true`) qué grupos opcionales instalar, explicando qué aporta cada uno y cuánto pesa en tokens (los servidores MCP cargan sus herramientas en cada mensaje).
3. Instala lo elegido con `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh" --instalar <grupos>`.
4. Comprueba que hay Google Chrome o Chromium para generar los PDF y `gh` identificado para los avisos de PR. Si falta algo, dilo con el comando para instalarlo.

## 5. Cerrar la fase

- Rellena la tabla «Estado» del `CLAUDE.md`: fase 0 hecha, fase 1 en curso.
- Apunta en `docs/decisiones.md` el modo de trabajo, quién lleva el contacto y dónde van los documentos.
- Si es en pareja o grupo, propón a la persona hacer el primer commit en `develop` y subirlo, para que los demás clonen el repo con todo esto. Haz el commit y el push solo si te lo confirma.

# Ahorrar tokens y llevar contextos largos

Un proyecto así dura semanas y pasa por muchas sesiones. Lo que más gasta no es escribir código: es leer de más, volcar salidas enteras y arrastrar contexto que ya no sirve.

## Hábitos

- **Mapa antes que ficheros.** Para saber dónde está algo, primero `graphify query "<pregunta>"` o `graphify path "A" "B"` (ver «Graphify», abajo). Después busca con `grep` o `rg` y lee solo las líneas que necesitas. No vuelvas a leer un fichero que no ha cambiado.
- **Barridos grandes, en un subagente.** Si hay que recorrer muchos ficheros para responder algo («¿dónde se calculan los avisos?»), lánzalo en un subagente y quédate con la conclusión, no con el volcado.
- **Salidas cortas.** Tests con reporte breve y solo los fallos (`vitest run --reporter=dot`, `npm test 2>&1 | tail -40`); `gh` con `--json` y `--jq` para traer solo los campos que hacen falta; logs con `tail` o `grep`, nunca enteros.
- **Capturas pequeñas.** Para revisar una pantalla basta media resolución; a tamaño completo solo cuando hay que leer texto pequeño.
- **Una sesión por tarea.** Al cambiar de módulo o de fase, empieza sesión nueva, después de dejar la nota de relevo (abajo).
- **`CLAUDE.md` corto.** Se carga en cada mensaje. Lo largo va a `docs/` y el `CLAUDE.md` solo apunta ahí.
- **Pocos servidores MCP activos.** Cada uno añade herramientas al contexto. Activa los de la fase en curso (Figma en mockups, Playwright en revisiones) y desactiva los demás con `/mcp`.
- **Skills grandes, por partes.** Algunas skills incluidas traen guías de 40 a 60 KB. Se carga solo el subcomando que toca (ver «Skills que pesan»).

## Graphify (obligatorio)

Graphify hace un mapa del código (qué función llama a cuál, qué fichero depende de cuál) y Claude lo consulta antes de abrir ficheros. El código se analiza en local, sin enviarlo a ningún servicio y sin gastar tokens. Es obligatorio en todos los proyectos de esta skill.

Una vez por máquina (fase 0, paso 5): `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh" --instalar obligatorias`, que hace `uv tool install graphifyy && graphify install`. Necesita `uv` y Python 3.11 o más. El paquete se llama `graphifyy`, con dos «y».

Una vez por repo, desde su raíz:

```bash
graphify claude install    # añade su sección al CLAUDE.md y un aviso antes de buscar o leer ficheros
graphify hook install      # rehace el mapa solo en cada commit y al cambiar de rama
graphify update .          # primer mapa
```

- **Cada persona del equipo** hace `graphify hook install` después de clonar: los hooks de git no viajan con el repo. El aviso de inicio de sesión de esta skill avisa si falta graphify o su hook.
- **`graphify-out/` va en `.gitignore`.** Se rehace solo en cada máquina; si se sube, los PR chocan por el mapa.
- **Sin modo estricto.** No uses `--strict`: bloquea la primera lectura de ficheros de cada sesión. Si alguien lo activó, `GRAPHIFY_HOOK_STRICT=0` lo apaga.
- **Solo código.** Si se le pasan documentos, PDF o imágenes, los analiza con el modelo y eso sí gasta. No hace falta: los documentos del proyecto ya se leen directamente.
- **Después de actualizar graphify**, `graphify hook install` otra vez: el hook guarda la ruta del programa.
- Si el mapa contradice al código (una función que ya no existe), manda el código. Rehazlo con `graphify update .` y sigue.

## Contextos largos: compactar, limpiar y relevo

La conversación de una sesión se carga entera en cada mensaje. Cuanto más larga, más cuesta cada respuesta y peor recuerda Claude lo del principio.

- **`/compact` en los cortes naturales**, nunca a mitad de un paso: al terminar un módulo, después de una revisión o tras cerrar un PR. Dile qué conservar: `/compact conserva el módulo, la rama, lo que falta y los fallos abiertos`.
- **`/clear` al cambiar de tarea** dentro de la misma sesión, después de dejar la nota de relevo. Lo importante tiene que estar en `docs/`, no en la conversación.
- **Si la conversación va por más de la mitad** del contexto y la tarea no ha acabado, deja primero la nota de relevo y después compacta. Si espera a llenarse, Claude compacta solo y elige él qué olvidar.
- **Lo que no se compacta**: decisiones, dudas y cambios de la especificación. Esos van antes a sus documentos (`docs/decisiones.md`, el panel de dudas, `docs/especificacion.md`).

### La nota de relevo

Al cerrar una sesión con trabajo a medias, o antes de un `/clear`, Claude deja una nota corta para quien siga, que puede ser otra sesión suya o un compañero.

- **Si es un módulo**: en la sección «Relevo» del fichero del módulo en `docs/avance/`, que solo toca quien lo hace.
- **Si es otra fase**: en `docs/relevo/<usuario de GitHub>.md`, uno por persona, para que dos personas no choquen. Plantilla: `assets/docs/relevo.md`.

Lleva cuatro cosas: en qué se quedó (rama, fichero, paso de la guía), lo que falta en orden, lo que se intentó y no funcionó, y lo que espera respuesta. Se reescribe cada vez, no se acumula. Al empezar, si hay nota, se lee lo primero.

## Herramientas

Se instalan con el grupo `tokens` de `comprobar-skills.sh`. Ninguna cambia cómo responde Claude ni saca código de la máquina.

| Herramienta | Qué hace | Pegas |
|---|---|---|
| LSP del lenguaje del proyecto (plugin oficial) | Claude salta a la definición o a los usos de una función sin buscar con grep ni abrir ficheros enteros. Lo recomienda la guía oficial de costes de Claude Code. `typescript-lsp` para JavaScript y TypeScript, `pyright-lsp` para Python, `php-lsp` para PHP; para otro lenguaje, busca en `/plugin` | cada uno necesita su servidor de lenguaje instalado (`typescript-language-server`, `pyright`, `intelephense`). Comprueba en `/plugin` que el nombre del plugin sigue siendo ese |
| ccusage | no ahorra: mide cuánto gasta cada sesión (`npx ccusage@latest`), para comprobar si lo demás sirve | ninguna |

## Skills que pesan

| Skill | Qué cargar | Qué no |
|---|---|---|
| `impeccable` | en la pasada de antes de la demo, `impeccable audit` y después `impeccable polish` (unos 18 KB entre las dos guías) | `new-work`, `critique` y `live` (40 a 65 KB cada una), salvo que la persona pida rehacer el diseño de una pantalla |
| `emil-design-eng` | solo para el pulido final, sobre las pantallas que se van a enseñar | no en cada módulo |
| `vercel-react-best-practices` | la regla concreta que toque, no la carpeta entera | — |

## Cuánto gasta cada fase

No hay una cifra que valga para todos los proyectos, así que se mide en los propios.

1. Al cerrar cada fase y cada módulo, apunta en `docs/gasto.md` una línea: fase o módulo, número de sesiones y gasto total (`npx ccusage@latest session`, sumando las de esa tarea).
2. Con dos o tres proyectos apuntados, ya hay referencia propia de cuánto cuesta un módulo pequeño, mediano o grande.
3. Señales de que algo se dispara: una sesión que gasta más del doble que las demás del mismo módulo, o un módulo que gasta el doble que otro de su mismo tamaño. Lo normal es que esté leyendo de más, que una salida se vuelque entera o que esté atascado probando sin leer el error. Si se repite, va a `docs/lecciones.md`.

## Descartadas

A noviembre de 2026, para no volver a mirarlas:

- **rtk**: una prueba independiente con 1.740 intentos le salió un 1 % más cara por tarea en Claude Code.
- **caveman**: respuestas telegráficas; la única medición externa dio un 8,5 % de ahorro y las respuestas cuestan de entender a quien no es técnico. Quien la quiera, que la instale aparte.
- **claude-context** y **Headroom**: sacan el código o todo el tráfico fuera de la máquina.
- **Serena**: se solapa con el LSP y Claude tiende a ignorarla.
- **context-mode**: promete mucho sin ninguna medición externa y desvía la lectura de ficheros por sus hooks; solo como prueba piloto midiendo con ccusage.
- **Graphify Cloud** (su servidor MCP en la nube): manda el código fuera. El Graphify local, el de arriba, no.

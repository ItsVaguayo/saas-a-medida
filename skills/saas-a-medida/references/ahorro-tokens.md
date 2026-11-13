# Ahorrar tokens

Un proyecto así dura semanas y pasa por muchas sesiones. Lo que más gasta no es escribir código: es leer de más, volcar salidas enteras y arrastrar contexto que ya no sirve.

## Hábitos

- **Lee lo justo.** Busca primero (`grep`, `rg`, el mapa del proyecto si existe) y lee solo las líneas que necesitas. No vuelvas a leer un fichero que no ha cambiado.
- **Barridos grandes, en un subagente.** Si hay que recorrer muchos ficheros para responder algo («¿dónde se calculan los avisos?»), lánzalo en un subagente y quédate con la conclusión, no con el volcado.
- **Salidas cortas.** Tests con reporte breve y solo los fallos (`vitest run --reporter=dot`, `npm test 2>&1 | tail -40`); `gh` con `--json` y `--jq` para traer solo los campos que hacen falta; logs con `tail` o `grep`, nunca enteros.
- **Capturas pequeñas.** Para revisar una pantalla basta media resolución; a tamaño completo solo cuando hay que leer texto pequeño.
- **Una sesión por tarea.** Al cambiar de módulo o de fase, empieza sesión nueva. Todo lo que importa ya está en los documentos del proyecto (`CLAUDE.md`, `docs/`), que es justo para lo que están.
- **`CLAUDE.md` corto.** Se carga en cada mensaje. Lo largo va a `docs/` y el `CLAUDE.md` solo apunta ahí.
- **Pocos servidores MCP activos.** Cada uno añade herramientas al contexto. Activa los de la fase en curso (Figma en mockups, Playwright en revisiones) y desactiva los demás con `/mcp`.
- **Mira el gasto.** `/cost` en la sesión, y `ccusage` en la terminal si está instalado, para ver qué sesiones se disparan.

## Herramientas

Se instalan con el grupo `tokens` de `comprobar-skills.sh`. Ninguna cambia cómo responde Claude ni saca código de la máquina.

| Herramienta | Qué hace | Pegas |
|---|---|---|
| LSP de TypeScript (`typescript-lsp`, plugin oficial) | Claude salta a la definición o a los usos de una función sin buscar con grep ni abrir ficheros enteros. Lo recomienda la guía oficial de costes de Claude Code | necesita `typescript-language-server` instalado con npm |
| graphify | mapa del proyecto que Claude consulta antes de leer ficheros (`graphify query`, `graphify path`) | hay que mantenerlo al día: `graphify update .` o su hook; no lo actives en modo estricto, que bloquea leer ficheros hasta consultar el mapa |
| ccusage | no ahorra: mide cuánto gasta cada sesión (`npx ccusage@latest`), para comprobar si lo demás sirve | ninguna |

Descartadas a noviembre de 2026, para no volver a mirarlas:

- **rtk**: una prueba independiente con 1.740 intentos le salió un 1 % más cara por tarea en Claude Code.
- **caveman**: respuestas telegráficas; la única medición externa dio un 8,5 % de ahorro y las respuestas cuestan de entender a quien no es técnico. Quien la quiera, que la instale aparte.
- **claude-context** y **Headroom**: sacan el código o todo el tráfico fuera de la máquina.
- **Serena**: se solapa con el LSP y Claude tiende a ignorarla.
- **context-mode**: promete mucho sin ninguna medición externa y desvía la lectura de ficheros por sus hooks; solo como prueba piloto midiendo con ccusage.

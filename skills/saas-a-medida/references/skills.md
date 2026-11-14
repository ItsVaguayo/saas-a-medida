# Skills y plugins en cada momento

Hay cuatro tipos:

- **Vienen con Claude Code**: `/code-review`, `/simplify`, `/security-review`.
- **Vienen dentro de este plugin**, copiadas de sus autores con su licencia (ver `THIRD_PARTY_NOTICES.md` en la raíz del plugin): `impeccable`, `web-design-guidelines`, `emil-design-eng`, `mobile-native`, `fixing-accessibility`, `break-ui` y `vercel-react-best-practices`. Aparecen con el prefijo del plugin: `saas-a-medida:impeccable`.
- **Se instalan solas con el plugin**, como dependencias del marketplace oficial de Anthropic: `feature-dev`, `frontend-design`, `pr-review-toolkit` y `claude-security`.
- **Opcionales, por grupos**: las comprueba e instala `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh"`, con el OK de la persona (fase 0). El catálogo está en `scripts/skills-recomendadas.tsv`.

Usa el nombre que aparezca en la lista de skills de la sesión. Si una no está, sigue sin ella, dilo y ofrece instalar su grupo.

## Por fase

| Fase | Qué usar |
|---|---|
| 1. Información | `doc-coauthoring` (grupo `documentos`) para redactar; triajes de `legal.md` |
| 3. Alcance | la plantilla del PDF y `estilo-documentos.md` |
| 5. Mockups | `frontend-design` para cada dirección; `impeccable` para pulir; plugin `figma` (grupo `mockups`) para que el cliente comente |
| 6. Plan técnico | `compound-engineering:ce-plan` (grupo `plan`) si está; si no, la plantilla de la fase 6 |
| 7. Cada módulo | `feature-dev` con `desarrollo-backend.md` y `desarrollo-frontend.md`; antes del PR, `/simplify` y después `/code-review`; con pantallas, `break-ui` |
| 7 y 8. Todas las pantallas, una vez sobre `develop` antes de la demo | `impeccable` (auditoría), `web-design-guidelines`, `mobile-native`, `fixing-accessibility`; `emil-design-eng` para el pulido final |
| 7. React | `vercel-react-best-practices` cuando haya problemas de rendimiento o al revisar componentes con muchos datos |
| 7. Pruebas en navegador | `playwright-cli` (grupo `pruebas`); accesibilidad automática con `@axe-core/playwright` en los e2e del proyecto |
| 7. Revisar un PR | `/code-review <número>` y los agentes de `pr-review-toolkit` |
| 9. Producción | `/security-review` del repo entero y `claude-security` para la auditoría a fondo; `legal.md` |
| 9. Rendimiento | `chrome-devtools-mcp` (grupo `rendimiento`) si la app va lenta |
| 9. Despliegue | el script de `assets/despliegue/`; plugin `hostinger` si el servidor está allí |

## Grupos opcionales

Al ofrecerlos con el menú (`multiSelect`), explica qué aporta cada grupo y su coste: los servidores MCP (`figma`, `context7`, `chrome-devtools-mcp`) añaden herramientas a la sesión; `security-guidance` revisa con IA en cada turno y gasta tokens; los plugins legales piden su propia entrevista de configuración antes de usarse.

| Grupo | Qué trae |
|---|---|
| `tokens` | LSP de TypeScript, graphify y ccusage (ver `ahorro-tokens.md`) |
| `pruebas` | Playwright CLI con sus skills |
| `mockups` | plugin de Figma |
| `documentos` | `doc-coauthoring` |
| `plan` | `compound-engineering` |
| `documentacion` | `context7`: documentación al día de las librerías |
| `rendimiento` | `chrome-devtools-mcp` |
| `seguridad-continua` | `security-guidance` |
| `legal` | plugins de `claude-para-abogados` |
| `despliegue` | plugin de Hostinger |

## Actualizar las skills incluidas

Cada carpeta copiada tiene un `ORIGEN.md` con su repositorio y su commit. Para actualizar una, se vuelve a copiar la carpeta desde el original, se cambia el commit en `ORIGEN.md` y se sube una versión nueva del plugin.

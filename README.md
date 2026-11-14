# saas-a-medida

Plugin de Claude Code para hacer un SaaS a medida para un cliente, desde la primera información que da hasta que la app está en producción y con soporte. Sirve para una persona sola, una pareja o un equipo.

Claude sigue once fases: equipo y proyecto, información del cliente, maqueta, documento de alcance en PDF, plan de la plataforma, mockups, plan técnico, desarrollo por módulos, demo, producción y soporte. En cada una sabe qué tiene que salir, cuándo se da por cerrada y qué skill usar.

## Qué trae

- **Decisiones con menú.** Cuando tienes que elegir algo (alcance, diseño, reparto, ramas), Claude te lo pregunta con un menú de opciones explicadas, nunca escondido en un texto largo.
- **Documento de alcance en PDF** para el cliente: qué se hace, qué se conecta, qué no y qué necesitamos de él, con un estilo sobrio de documento técnico.
- **Plan técnico con reparto** por módulos enteros, para que en equipo nadie espere a nadie, con las ramas explicadas paso a paso.
- **Guías de desarrollo para cualquier IA**: cómo se construye y se comprueba el backend y las pantallas de un módulo, paso a paso, para que otro modelo u otro agente llegue al mismo resultado.
- **CI y ramas protegidas**: una plantilla de GitHub Actions y, al empezar, eliges con el menú cuánto se protegen `develop` y `main` (nada, PR obligatorio, PR con revisión o estricta).
- **Se engancha a proyectos ya empezados**: detecta en qué fase está el proyecto por sus ficheros y su historial y sigue desde ahí.
- **Aviso de PR**: al abrir Claude en el proyecto, te dice en qué fase está, qué PR de tus compañeros esperan tu revisión (también los que ya revisaste y han cambiado) y cuáles tuyos tienen cambios pedidos.
- **Panel de dudas para el cliente**: una página con cada pregunta explicada fácil, una pestaña técnica para el equipo y las respuestas guardadas. Si el cliente lo abre con un enlace de solo lectura, no ve la parte técnica.
- **Revisiones en dos niveles**: en cada PR, simplificación, código, datos extremos y seguridad si toca; antes de la demo, una pasada completa de diseño, móvil y accesibilidad sobre toda la app.
- **Textos de la app sin tono de IA**, y un bloque marcado para el texto que explica cosas en las demos, con un comprobador que impide que llegue a producción.
- **Producción con lista**: seguridad, documentos legales para España y la UE, un script de despliegue con copia previa, comprobación de salud y vuelta atrás automática, y otro de copia nocturna que saca la copia del servidor.
- **Skills de diseño, móvil y accesibilidad incluidas**: `impeccable`, `web-design-guidelines`, `emil-design-eng`, `mobile-native`, `fixing-accessibility`, `break-ui` y `vercel-react-best-practices`, copiadas de sus autores con su licencia (ver `THIRD_PARTY_NOTICES.md`).
- **Migración de datos como módulo**, con ensayo antes de producción, y **lecciones** al cerrar cada proyecto para mejorar la skill.
- **Ahorro de tokens**: hábitos de trabajo y, si quieres, el LSP de TypeScript, graphify y ccusage.

## Instalación

```bash
claude plugin marketplace add ItsVaguayo/saas-a-medida
claude plugin install saas-a-medida@saas-a-medida
```

Al instalarlo se instalan solos los plugins de los que depende, del marketplace oficial de Anthropic: `feature-dev`, `frontend-design`, `pr-review-toolkit` y `claude-security`. Al activarlo te pide el nombre y la web que saldrán en los PDF para clientes; puedes dejarlos vacíos.

En el primer proyecto, Claude te ofrece por grupos lo opcional (Figma, Playwright, ahorro de tokens, plugins legales…) y solo instala lo que elijas.

Si prefieres tenerlo solo en un proyecto y no en todas tus sesiones, instálalo con `--scope project` desde la carpeta de ese proyecto.

Para que tus compañeros lo tengan, la fase 0 deja en el repo un `.claude/settings.json` que declara el plugin y un `CLAUDE.md` con estos dos comandos.

## Cómo se usa

Abre Claude Code en la carpeta del proyecto (o en una vacía si aún no existe) y di lo que tengas: «empezamos un SaaS para una autoescuela, te paso el cuestionario», «¿por dónde seguimos?», «revisa el PR de Lucía». La skill se carga sola. También se llama a mano con `/saas-a-medida:saas-a-medida`.

## Requisitos

- Claude Code reciente.
- `gh` identificado (`gh auth login`) para los avisos y las revisiones de PR.
- `python3` para el aviso de PR.
- Google Chrome, Chromium o Playwright para generar los PDF. `pdftoppm` (paquete `poppler-utils`) para revisar sus páginas.
- El panel de dudas usa los artifacts de claude.ai. Sin ellos, las dudas van a `docs/dudas-cliente.md`.

## Estructura

```text
.claude-plugin/       manifiesto del plugin y del marketplace
hooks/hooks.json      fase en curso al abrir la sesión y aviso de PR cada 15 minutos
skills/saas-a-medida/
  SKILL.md            el flujo, las reglas y la tabla de fases
  references/         una guía por fase y las transversales
  assets/             plantillas de documentos, PDF, panel de dudas, texto de demo y despliegue
  scripts/            PDF, aviso de PR, avance, protección de ramas, comprobación de texto de demo y de skills
skills/<otras>/       skills de terceros incluidas, cada una con su LICENSE y su ORIGEN.md
```

## Licencia

MIT para todo lo propio del plugin. Las skills de terceros incluidas conservan su licencia: ver `THIRD_PARTY_NOTICES.md`.

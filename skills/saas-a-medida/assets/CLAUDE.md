# {{PROYECTO}}

SaaS a medida para {{CLIENTE}}.

## Cómo se trabaja aquí

Este proyecto sigue el plugin `saas-a-medida`. Si no lo tienes instalado:

```bash
claude plugin marketplace add ItsVaguayo/saas-a-medida
claude plugin install saas-a-medida@saas-a-medida
```

Antes de cualquier tarea, mira en qué fase está el proyecto (campo `fases` de `.claude/saas-a-medida.json`: pendiente, en curso o hecha; puede haber más de una en curso) y usa la skill `saas-a-medida`: dice qué hacer en cada fase y qué skill cargar.

Si trabajas con otra IA o sin el plugin, las dos guías que tienes que seguir al programar son `references/desarrollo-backend.md` y `references/desarrollo-frontend.md` del plugin (https://github.com/ItsVaguayo/saas-a-medida/tree/main/skills/saas-a-medida/references).

## Equipo

Modo: {{MODO}}. Contacto con el cliente: {{CONTACTO}}.

| Persona | GitHub | Módulos | Revisa los PR de |
|---|---|---|---|
| {{NOMBRE}} | {{GITHUB}} | | |

## Documentos

- `docs/informacion-cliente.md`: lo que contó el cliente y las propuestas extra.
- `docs/viabilidad.md`: integraciones comprobadas.
- `docs/plan-plataforma.md`: roles, módulos, pantallas y recorridos.
- `docs/especificacion.md`: lo que se construye. Manda sobre cualquier conversación.
- `docs/plan-tecnico.md`: reparto, ramas y revisiones.
- `docs/avance/`: un fichero por módulo. El total lo calcula `scripts/avance.py` del plugin.
- `docs/lecciones.md`: lo que falló en este proyecto y habría que cambiar en la forma de trabajar.
- `docs/dudas.md`: dudas del equipo. Las del cliente están en el panel de dudas: {{PANEL_DUDAS}}.
- `docs/decisiones.md`: lo decidido y por qué.
- Documentos para el cliente (PDF): {{DOCS_CLIENTE}}.

## Reglas

- Cada decisión de la persona se pregunta con el menú de selección, con contexto.
- Antes de diseñar o construir un módulo se miran productos reales parecidos.
- Los textos de la app se escriben como en las apps reales. Lo que explica cómo funciona algo en la demo va en un bloque de texto de demo y se quita antes de producción.
- Una rama por módulo (`modulo/<nombre>`) desde `develop`, PR revisado por otra persona, CI en verde y «Squash and merge».
- Desde la rama de un módulo solo se toca lo de ese módulo. Los documentos comunes (decisiones, dudas, estado de las fases) van en una rama `docs/<tema>`.
- La especificación manda. Si el código hace otra cosa, se arregla el código; si cambia la regla, se cambia primero la especificación. Solo en los nombres (campos, rutas, estados) se deja el del código y se corrige la especificación.
- Las migraciones de la base solo añaden. Renombrar o borrar una columna va en dos entregas.
- Nada sale al cliente sin que lo revise quien lleva el contacto.

## Comandos

- {{COMANDOS}}

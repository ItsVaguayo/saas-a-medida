---
name: saas-a-medida
description: Acompaña el desarrollo completo de un SaaS o aplicación de gestión a medida para un cliente, solo o en equipo. Cubre información del cliente, maqueta, documento de alcance en PDF, plan de la plataforma, mockups, plan técnico con reparto y ramas, desarrollo por módulos con revisiones, dudas para el cliente, demo, despliegue, seguridad, legal y soporte. Úsala siempre que se empiece un proyecto así, llegue información o respuestas de un cliente, haya que decidir alcance, diseño o reparto, construir o revisar un módulo o un PR, preparar una demo o pasar a producción, aunque no se nombre. También cuando alguien pregunte «¿por dónde seguimos?» en un repo con .claude/saas-a-medida.json.
---

# SaaS a medida

Esta skill lleva un SaaS a medida desde la primera información del cliente hasta que está en producción y con soporte. Sirve para una persona sola, una pareja o un grupo.

## Al empezar cada sesión

1. Busca `.claude/saas-a-medida.json` en la raíz del repo. Si no existe, el proyecto no ha empezado: ve a la fase 0.
2. Lee la tabla «Estado» del `CLAUDE.md` del proyecto. Puede haber varias fases abiertas a la vez (por ejemplo, desarrollo con dudas del cliente pendientes de la fase 1). Trabaja en la que pida la persona.
3. Si un aviso de inicio de sesión dice que hay PR de compañeros esperando revisión o cambios pedidos en los suyos, díselo a la persona en tu primera respuesta y ofrécele revisarlos (fase 7, «Revisar el PR de un compañero»).
4. Lee solo la referencia de la fase en la que estás. No cargues todas.

Las rutas de esta skill: los scripts están en `${CLAUDE_SKILL_DIR}/scripts/`, las plantillas en `${CLAUDE_SKILL_DIR}/assets/` y las guías en `${CLAUDE_SKILL_DIR}/references/`.

## Reglas para todas las fases

- **Cada decisión de la persona va en el menú de selección** (AskUserQuestion), con contexto suficiente para decidir sin leer nada más. Nunca la dejes dentro de un texto largo. Cómo hacerlo bien: `references/decisiones.md`.
- **No inventes.** Antes de diseñar una pantalla o modelar un módulo, mira dos o tres productos reales que lo resuelvan: `references/referencias-reales.md`.
- **Los textos de la interfaz se escriben como en las apps reales**, sin explicar de más ni anunciar funcionalidades: `references/textos-interfaz.md`. El texto que explica cómo funciona algo en una demo se permite, pero marcado como texto de demo y fuera antes de producción: `references/texto-demo.md`.
- **Nada sale al cliente sin que lo revise la persona**: documentos, mensajes, demos, respuestas. Tú lo preparas y ella lo envía.
- **Los planes no llevan fechas ni semanas.** El orden lo dan las dependencias. Si la persona da una fecha, se apunta como dato, no se reparte el trabajo por semanas.
- **La especificación manda** sobre cualquier conversación. Si el código y la especificación no coinciden en un nombre, gana el código y se corrige la especificación.
- **Las dudas no se quedan en el chat.** Las del cliente van al panel de dudas (`references/dudas-cliente.md`); las del equipo, a `docs/dudas.md`; las decisiones tomadas, a `docs/decisiones.md`.
- **Pregunta antes de construir** algo que cambie permisos o envíe datos a terceros (familias, clientes finales, otras empresas).
- **Ningún dato personal real del cliente** en la semilla, en los tests ni en el repo, aunque nos pase el Excel.
- **Ahorra tokens**: lectura dirigida, subagentes para los barridos grandes, no releer lo que no ha cambiado. Ver `references/ahorro-tokens.md`.

## Si quien te habla no lleva el contacto con el cliente

En pareja o en grupo, una persona habla con el cliente (campo `contacto_cliente` del fichero de proyecto). Si quien te habla es otra, no decidas alcance, permisos ni lo que ve el cliente: apúntalo en `docs/dudas.md` para quien lleva el contacto y sigue con lo demás.

## Fases

| Fase | Qué sale | Se cierra cuando | Guía |
|---|---|---|---|
| 0. Equipo y proyecto | `.claude/saas-a-medida.json`, `CLAUDE.md`, `docs/`, skills instaladas | la persona confirma equipo y carpetas | `references/fase-0-equipo.md` |
| 1. Información del cliente | `docs/informacion-cliente.md` | lo que decide el alcance tiene respuesta o está en el panel de dudas | `references/fase-1-informacion.md` |
| 2. Maqueta base | demo importada o referencia elegida, stack decidido, inventario | la persona confirma la base | `references/fase-2-maqueta.md` |
| 3. Documento de alcance | `docs/viabilidad.md` y el PDF de alcance para el cliente | la persona lo revisa y lo envía ella | `references/fase-3-alcance.md` |
| 4. Plan de la plataforma | `docs/plan-plataforma.md` | la persona lo aprueba | `references/fase-4-plan-plataforma.md` |
| 5. Mockups y estilo | dos o tres direcciones, estilo fijado en variables | la persona elige una dirección | `references/fase-5-mockups.md` |
| 6. Plan técnico | `docs/especificacion.md`, `docs/plan-tecnico.md`, `docs/avance.md` | la persona lo da por bueno | `references/fase-6-plan-tecnico.md` |
| 7. Desarrollo por módulos | un PR por módulo, revisado e integrado | todos los módulos están en `develop` | `references/fase-7-desarrollo.md` |
| 8. Demo al cliente | guion, datos de demo, correcciones en la especificación | el cliente da su conformidad | `references/fase-8-demo.md` |
| 9. Producción | app desplegada con seguridad y legal hechos | la app funciona en producción con copias | `references/fase-9-produccion.md` |
| 10. Soporte | registro de cambios e incidencias | no se cierra | `references/fase-10-soporte.md` |

Al cerrar una fase, actualiza su fila en la tabla «Estado» del `CLAUDE.md` del proyecto, para que el siguiente que abra Claude sepa dónde está.

## Qué skill usar en cada momento

El detalle, con nombres exactos y alternativas, está en `references/skills.md`. Las de diseño, móvil y accesibilidad vienen dentro de este plugin y aparecen como `saas-a-medida:<nombre>`. Resumen:

| Momento | Skills |
|---|---|
| Redactar documentos e información del cliente | `doc-coauthoring` |
| Datos sensibles o IA dentro de la app | triaje de privacidad y de IA (`references/legal.md`) |
| Mockups y diseño | `frontend-design`, `impeccable` |
| Plan técnico | `compound-engineering:ce-plan` si está instalada; si no, la plantilla de la fase 6 |
| Cada módulo | `feature-dev` |
| Antes de cada PR | `/code-review` y `/simplify` |
| Antes de un PR con pantallas | revisión de diseño, móvil y accesibilidad, y `break-ui` |
| Revisar el PR de un compañero | `/code-review <número>` y `pr-review-toolkit` |
| Producción | `/security-review`, `claude-security`, `references/legal.md`, script de `assets/despliegue/` |

Si una skill no está instalada, sigue sin ella, dilo y ofrece instalarla con `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-skills.sh"`.

## Guías que valen en varias fases

- `references/decisiones.md`: cómo preguntar una decisión con el menú.
- `references/dudas-cliente.md`: el panel de dudas para el cliente.
- `references/estilo-documentos.md`: el estilo de los PDF para el cliente.
- `references/referencias-reales.md`: buscar productos reales antes de diseñar o modelar.
- `references/legal.md`: triaje de privacidad y de IA, y los documentos legales de producción.
- `references/textos-interfaz.md` y `references/texto-demo.md`: textos de la app.
- `references/skills.md` y `references/ahorro-tokens.md`.

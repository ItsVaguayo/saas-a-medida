# {{PROYECTO}}

SaaS a medida para {{CLIENTE}}.

## Cómo se trabaja aquí

Este proyecto sigue el plugin `saas-a-medida`. Si no lo tienes instalado:

```bash
claude plugin marketplace add ItsVaguayo/saas-a-medida
claude plugin install saas-a-medida@saas-a-medida
```

Antes de cualquier tarea, mira la tabla «Estado» y usa la skill `saas-a-medida`: dice qué hacer en cada fase y qué skill cargar.

## Equipo

Modo: {{MODO}}. Contacto con el cliente: {{CONTACTO}}.

| Persona | GitHub | Módulos | Revisa los PR de |
|---|---|---|---|
| {{NOMBRE}} | {{GITHUB}} | | |

## Estado

| Fase | Estado | Nota |
|---|---|---|
| 0. Equipo y proyecto | hecha | |
| 1. Información del cliente | en curso | |
| 2. Maqueta base | pendiente | |
| 3. Documento de alcance | pendiente | |
| 4. Plan de la plataforma | pendiente | |
| 5. Mockups y estilo | pendiente | |
| 6. Plan técnico | pendiente | |
| 7. Desarrollo por módulos | pendiente | |
| 8. Demo al cliente | pendiente | |
| 9. Producción | pendiente | |
| 10. Soporte | pendiente | |

Estados: pendiente, en curso, hecha. Puede haber más de una fase en curso.

## Documentos

- `docs/informacion-cliente.md`: lo que contó el cliente y las propuestas extra.
- `docs/viabilidad.md`: integraciones comprobadas.
- `docs/plan-plataforma.md`: roles, módulos, pantallas y recorridos.
- `docs/especificacion.md`: lo que se construye. Manda sobre cualquier conversación.
- `docs/plan-tecnico.md`: reparto, ramas y revisiones.
- `docs/avance.md`: cuánto falta.
- `docs/dudas.md`: dudas del equipo. Las del cliente están en el panel de dudas: {{PANEL_DUDAS}}.
- `docs/decisiones.md`: lo decidido y por qué.
- Documentos para el cliente (PDF): {{DOCS_CLIENTE}}.

## Reglas

- Cada decisión de la persona se pregunta con el menú de selección, con contexto.
- Antes de diseñar o construir un módulo se miran productos reales parecidos.
- Los textos de la app se escriben como en las apps reales. Lo que explica cómo funciona algo en la demo va en un bloque de texto de demo y se quita antes de producción.
- Una rama por módulo (`modulo/<nombre>`) desde `develop`, PR revisado por otra persona y «Squash and merge».
- Si la especificación y el código no coinciden, manda el código y se corrige la especificación.
- Nada sale al cliente sin que lo revise quien lleva el contacto.

## Comandos

- {{COMANDOS}}

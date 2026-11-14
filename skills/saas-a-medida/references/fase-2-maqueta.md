# Fase 2. Maqueta base

Decide sobre qué se construye. Casi siempre ya existe una demo de esta misma plataforma: la que se preparó para vender y que el cliente ya vio. Si existe, es la maqueta y la base del código.

## 1. Preguntar con el menú

«¿Hay una demo de esta plataforma?», con estas opciones:

- **Sí, la demo que vio el cliente** (recomendada si existe): se parte de ella. El cliente ya la conoce y el diseño ya le gustó.
- **No, pero hay un SaaS o una web de referencia**: el cliente o la persona tienen un producto que quieren parecerse.
- **No, se empieza de cero.**

## 2. Si hay demo

1. Pide dónde está: repo, zip o carpeta. Si es un zip, descomprímelo dentro del repo del proyecto y guarda el zip original en la carpeta de documentos del cliente, fuera de git.
2. Léete su README y su guion de demo si lo tiene. Arráncala siguiendo su README y comprueba que funciona.
3. Haz el inventario en `docs/plan-plataforma.md`, sección «Lo que ya hace la demo» (plantilla en `assets/docs/`): pantallas, módulos, roles, datos de ejemplo y, sobre todo, qué es real y qué está simulado. El código de una demo se hace para enseñar: un botón que funciona en la demo puede no guardar nada.
4. **El stack es el de la demo.** No lo cambies sin un motivo escrito en `docs/decisiones.md` y sin preguntarlo con el menú, explicando qué se pierde. Mantener varios stacks es la deuda más cara para quien da soporte después.
5. Apunta en el `CLAUDE.md` del proyecto los comandos para arrancarla, probarla y reiniciar sus datos, y pon esos mismos comandos en `.github/workflows/ci.yml`.

## 3. Si hay un SaaS o una web de referencia

1. Pide cuál (nombre o enlace) y qué le gusta al cliente de él.
2. Estúdialo con el navegador: pantallas, recorridos, campos, estados y vocabulario. Haz capturas de lo que sea público. Si hace falta cuenta, pide a la persona que entre ella; no crees cuentas.
3. Apunta en `docs/referencias.md` qué se toma (estructura, campos, flujos) y qué no (marca, logos, textos exactos, ilustraciones).
4. Elige el stack con el menú. Recomienda el que el equipo ya domina y mantiene en otros proyectos; si no hay ninguno, una opción simple de un solo servidor.

## 4. Si se empieza de cero

Igualmente, nada se inventa:

1. Busca dos o tres productos reales de la misma categoría (ver `referencias-reales.md`) y proponlos con el menú (`multiSelect: true`) para que la persona elija cuáles sirven de referencia.
2. Apúntalos en `docs/referencias.md`.
3. Elige el stack con el menú, igual que en el punto 3.

## Se cierra cuando

La persona confirma la base y el stack, y el CI pasa en verde sobre esa base. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json` y anota la decisión en `docs/decisiones.md`.

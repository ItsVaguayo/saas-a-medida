# Fase 5. Mockups y estilo

Se preparan dos o tres direcciones visuales sobre las pantallas principales, la persona elige una y queda fijada para todo el proyecto. Solo cambia si lo pide el cliente.

## Lo que hace falta antes

- Las pantallas para mockups de `docs/plan-plataforma.md` (entre cinco y ocho).
- **Los colores del cliente, medidos**, no inventados: abre su web con el navegador y lee los colores reales de la cabecera, los botones y los enlaces (`getComputedStyle`), o sácalos de su logo. Apunta los valores en hexadecimal.
- Dos o tres referencias reales por pantalla (ver `referencias-reales.md`).
- Si hay demo, sus pantallas y su modo de datos simulados.

## Qué es una dirección

Un juego coherente de decisiones, no tres colores al azar:

- Paleta: el acento sale del color del cliente; los neutros llevan un poco de ese tono.
- Tipografía: una pareja (títulos y texto), elegida para este cliente.
- Densidad: compacta para una app que se usa ocho horas al día, más aireada para una que usa su cliente final de vez en cuando.
- Radios, sombras, iconos y el patrón de navegación (barra lateral o superior).

Cada dirección responde a una lectura distinta del cliente («sobria y densa, como el programa que ya usan», «cercana, porque también la usarán los alumnos desde el móvil») y dice en qué referencia real se apoya. Se pasa la skill `frontend-design` para cada una y se evitan las señales de diseño inventado de `referencias-reales.md`.

## Dónde se hacen: en código

Por defecto, las direcciones se hacen sobre la demo o la base, no en una herramienta aparte. Así no hay que traducir nada a código después: la dirección elegida ya está en el repo.

1. Cada dirección es un fichero de variables (`src/temas/a.css`, `b.css`, `c.css`) con colores, tipografía, espaciado, radios y sombras. Mientras se elige, se cambia con `?tema=a|b|c` en la URL, solo en desarrollo.
2. Los datos son creíbles para este cliente: nombres, importes y fechas de su mundo, del modo simulado o de la semilla.
3. Capturas de cada pantalla en cada dirección, en ordenador (1280 px) y en móvil (390 px). Con Chrome sin ventana o Playwright.
4. Enséñaselas a la persona juntas, por pantalla, y pregunta con el menú qué dirección se queda. Cada opción del menú resume en una frase qué la distingue.

### Si el cliente tiene que comentarlas

Con el plugin oficial de Figma (`figma@claude-plugins-official`, servidor remoto), la herramienta `generate_figma_design` captura la app en marcha como capas editables en un fichero de Figma. Funciona en el plan gratuito. La persona comparte el fichero con el cliente con permiso de ver; comentar no cuesta nada. Los comentarios se leen desde Figma (o con su API REST y un token que ponga la persona). Ojo: las capas son una foto, si el código cambia hay que volver a capturar.

### Otras opciones, si la persona las prefiere

| Opción | Cuándo | Pegas |
|---|---|---|
| Figma con `use_figma` | el equipo diseña en Figma con componentes | plan Professional con asiento Full; de pago por uso al salir de beta; dos fuentes de verdad |
| Penpot (MCP oficial) | no depender de Figma, código abierto | hay que tener la pestaña de Penpot abierta; Claude redibuja en vez de capturar |
| Google Stitch (MCP) | sacar variantes muy rápido para inspirarse | su estilo por defecto es el genérico que queremos evitar; nunca como resultado final |

## Galerías de pantallas reales

Para las referencias de cada pantalla, además de los productos que se miran con el navegador, hay galerías de pantallas de SaaS publicados con servidor MCP. A noviembre de 2026 (comprueba precios antes de recomendar pagar):

| Galería | MCP | Precio aproximado |
|---|---|---|
| SaaSFrame | también en el plan gratuito (20 consultas al día) | 180 $/año el plan completo |
| Mobbin | desde el plan Pro | 120 $/año |
| Refero | desde el plan Pro | variable |
| Nicelydone | solo en el plan de equipo | 600 $/año |
| Page Flows | no tiene | 99 $/año, para mirar a mano |

Que la persona decida con el menú si conecta alguna. Antes de pagar, prueba SaaSFrame gratis: haz la misma pantalla con y sin referencias y comparadlas.

## Fijar el estilo

Con la dirección elegida:

1. Sus variables pasan a ser los estilos base. Se borran las otras direcciones y el cambio por URL.
2. Todo texto cumple contraste 4,5:1 sobre su fondo.
3. Un catálogo de componentes base en una ruta de desarrollo (`/catalogo`): botones, campos, tablas, tarjetas, etiquetas de estado, listas vacías, diálogos y avisos, cada uno en sus estados.
4. Apunta en `docs/decisiones.md` la dirección elegida, por qué y en qué referencias se apoya.

Los colores y la tipografía quedan fijados aquí, antes de que nadie construya en paralelo: si cada uno elige los suyos por el camino, al juntar los módulos no encajan.

## Se cierra cuando

La persona elige una dirección con el menú y el estilo queda fijado en variables. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json`.

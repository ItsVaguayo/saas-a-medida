# Kit SaaS

40 módulos de interfaz para los SaaS a medida: 7 funciones, 8 animaciones, 19 componentes interactivos y 7 apartados. React 19, Vite y CSS plano con variables, sin más dependencias que `lucide-react` para los iconos. Nombres en español, tokens `--tinta`, `--linea`, `--e-N`, tema oscuro con `data-tema='oscuro'`.

## Verlo

```bash
npm install
npm run dev      # catálogo en http://localhost:5190
npm test         # 69 pruebas
```

El catálogo enseña cada módulo con su demo y su ejemplo de uso. Arriba están los mandos del tema (acento, radio, densidad, claro u oscuro): al moverlos cambian los 40 a la vez, que es la prueba de que ninguno lleva un color o una medida suelta. `Ctrl K` salta a cualquier módulo; `j` y `k` pasan al siguiente y al anterior.

## Los 40

| N.º | Módulo | Fichero | Para qué |
|---|---|---|---|
| | **Funciones** | | |
| 01 | Formato | `formato.js` | Importes, fechas y tamaños en es-ES; lo que falta sale con una raya |
| 02 | useBusqueda | `hooks.js` | Buscar mientras se escribe, descartando respuestas viejas |
| 03 | useEstadoUrl | `hooks.js` | Filtros, página y pestaña guardados en la dirección |
| 04 | useAlmacen | `hooks.js` | Preferencias en el navegador, sincronizadas entre pestañas |
| 05 | useAtajo | `hooks.js` | Atajos de teclado (`mod` es ⌘ o Ctrl según el sistema) |
| 06 | useCopiar | `hooks.js`, `Copiar.jsx` | Copiar con confirmación en el propio botón |
| 07 | useSeleccion | `hooks.js` | Casillas con selección de tramo con Mayús |
| | **Animaciones** | | |
| 08 | Aparecer | `Aparecer.jsx` | Entrada al verse, sola o escalonada |
| 09 | CifraAnimada | `CifraAnimada.jsx` | Número que cuenta hasta su valor nuevo |
| 10 | Esqueleto | `Esqueleto.jsx` | Silueta de lo que va a llegar |
| 11 | Colapsable | `Colapsable.jsx` | Abrir y cerrar animando la altura real; acordeón |
| 12 | ListaAnimada | `ListaAnimada.jsx` | Añadir, quitar y reordenar con desplazamiento (FLIP) |
| 13 | Progreso | `Progreso.jsx` | Barra y anillo, con valor o indeterminados |
| 14 | BotonEstado | `BotonEstado.jsx` | Guarda, guardado o fallo en el botón, sin envíos dobles |
| 15 | TransicionVista | `TransicionVista.jsx` | La tarjeta de la lista se convierte en la ficha |
| | **Interactivos** | | |
| 16 | Avisos | `Avisos.jsx` | Confirmaciones cortas con «Deshacer» |
| 17 | Diálogo | `Dialogo.jsx` | Modal y confirmación de lo que no se deshace |
| 18 | Cajón | `Cajon.jsx` | Panel lateral; en móvil sube desde abajo |
| 19 | Paleta de comandos | `Paleta.jsx` | Buscador de pantallas y acciones |
| 20 | Menú | `Menu.jsx` | Acciones detrás de un botón, con teclado |
| 21 | Combo | `Combo.jsx` | Desplegable con búsqueda, simple o múltiple |
| 22 | Pestañas | `Pestanas.jsx` | Raya que se desliza entre pestañas |
| 23 | Segmentado | `Segmentado.jsx` | Una entre pocas opciones a la vista |
| 24 | Interruptor | `Interruptor.jsx` | Opciones que se aplican en el momento |
| 25 | Pista | `Pista.jsx` | Nombre y atajo de un botón de icono |
| 26 | Tabla | `Tabla.jsx` | Orden, selección, acciones y estados |
| 27 | Filtros | `Filtros.jsx` | Pastillas de filtro que se ponen y se quitan |
| 28 | Paginación | `Paginacion.jsx` | Tramo visible y salto de página |
| 29 | Subir archivos | `SubirArchivos.jsx` | Soltar, progreso por archivo y reintento |
| 30 | Selector de fecha | `SelectorFecha.jsx` | Calendario en español, con teclado |
| 31 | Tablero | `Tablero.jsx` | Columnas con tarjetas que se arrastran |
| 32 | Edición en línea | `EdicionEnLinea.jsx` | Cambiar un dato donde se lee |
| 33 | Campo de etiquetas | `CampoEtiquetas.jsx` | Varias entradas cortas en un campo |
| 34 | Pasos | `Pasos.jsx` | Formulario largo partido en tramos |
| | **Apartados** | | |
| 35 | Marco | `Marco.jsx` | Lateral plegable, cabecera y contenido |
| 36 | Cifras | `Cifras.jsx` | Cifra con su cambio y su tendencia |
| 37 | Gráfico | `Grafico.jsx` | Barras y línea sin librerías |
| 38 | Estados | `Estados.jsx` | Vacío, sin resultados, error, sin permiso, sin conexión |
| 39 | Actividad | `Actividad.jsx` | Historial agrupado por días |
| 40 | Primeros pasos | `PrimerosPasos.jsx` | Lista de puesta en marcha |
| 41 | Barra de cristal | `BarraCristal.jsx` | Navegación translúcida sobre una foto o un fondo oscuro, con buscador, ramas y plegado a iconos |

Todo se importa desde `src/kit/index.js`. Los parámetros de cada módulo están documentados encima de su función.

## Adaptarlo a un cliente

Solo se toca `src/tema.css`:

- `--tono` gira el acento y el tinte de los grises (0 rojo, 150 verde, 256 azul, 290 violeta).
- Si la marca trae un color exacto, se pisan `--acento`, `--acento-fuerte`, `--acento-suave` y `--sobre-acento`. Hay que volver a medir el contraste del texto sobre el acento (4,5:1).
- `--radio` y `--alto-control` cambian la forma y la densidad de todo.
- `--letra` cambia la tipografía. Geist se carga en `main.jsx` con fontsource.
- Los tiempos y las curvas de las animaciones son `--dur-1…3`, `--curva` y `--curva-mover`.

## Llevar un módulo a un proyecto

1. Copia su `.jsx` y su `.css` de `src/kit/`.
2. Copia también `interno.js`, y `base.jsx` con `src/base.css` si el módulo usa `Boton`, `Campo`, `Etiqueta` o `Avatar` (o apunta sus imports a los componentes básicos del proyecto).
3. Mira sus imports: algunos se apoyan en otros módulos del kit. Tabla usa `Esqueleto` y `hooks.js`; Avisos y Tablero usan `ListaAnimada`; Cajón y Paleta usan `Dialogo`; Filtros usa `Menu`.
4. Si el proyecto llama de otra forma a sus tokens, haz el puente en su tema: `--acento: var(--azul);`.

Las clases llevan el prefijo `k-` para no chocar con las del proyecto.

## Cómo está hecho

- **Movimiento.** Solo `transform` y `opacity`, entre 120 y 320 ms. Lo que entra frena (`--curva`), lo que se desplaza arranca y frena (`--curva-mover`), y las salidas son más rápidas que las entradas. Lo flotante crece desde el botón que lo abre. Lo que se usa cien veces al día (la paleta, el resalte de una opción) va casi sin animar. Con `prefers-reduced-motion` no hay desplazamientos; los indicadores de carga siguen.
- **Teclado y lector de pantalla.** Elementos nativos (`button`, `dialog`, `table`, `label`), foco siempre visible, patrones WAI-ARIA en menú, combo, pestañas y calendario, avisos con `aria-live`, y ningún estado que dependa solo del color.
- **Estados.** Cargando, vacío, sin resultados, error, guardando y dato que falta están resueltos en los módulos que los necesitan.
- **Móvil.** Zonas táctiles de 44 px, campos a 16 px, el cajón sube desde abajo, la tabla fija su primera columna. Marco y Pasos se adaptan al ancho de su contenedor.
- **Textos.** Siguen `textos-interfaz.md` de la skill `saas-a-medida`: botones en infinitivo, avisos de tres palabras, errores que dicen cómo arreglarlo.

## Qué está comprobado y qué no

Comprobado: 69 pruebas con vitest (las funciones, el montaje limpio de las 40 demos y los comportamientos delicados), compilación de producción, las 40 demos abiertas en Chrome a 1280 y 375 px sin errores de consola ni desplazamiento lateral, y 23 comprobaciones de interacción en Chrome con ratón, teclado y táctil (foco de los diálogos, menú con flechas, arrastre del tablero, selección por tramo, validación de los pasos).

Sin comprobar:

- **Safari y Firefox.** La salida animada de diálogos y cajón usa `@starting-style` y `allow-discrete`, y TransicionVista usa la API de transiciones de vista. Donde falten, el cambio ocurre sin animar; no se ha abierto en esos navegadores para verlo.
- **Lector de pantalla real.** Los roles y los nombres están puestos y probados con consultas por rol, pero nadie lo ha recorrido con NVDA o VoiceOver.
- **Arrastre con el dedo en un móvil de verdad.** El tablero se ha probado con ratón y teclado; el táctil, solo emulado.

Los patrones salen de lo que hacen productos conocidos (paleta de Linear y Raycast, avisos de Sonner, tablas de Stripe y Gmail, calendario del patrón de fechas de WAI-ARIA), tomados de memoria: en esta tanda no se han abierto sus páginas para contrastarlos. Los datos de las demos son inventados.

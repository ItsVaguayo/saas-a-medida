# El kit de componentes

En `${CLAUDE_SKILL_DIR}/assets/kit/` hay 40 módulos de interfaz ya hechos y probados: tabla, diálogo, avisos, paleta de comandos, selector de fecha, tablero con arrastre, esqueletos de carga, gráficos y los demás de la lista de abajo. Antes de escribir un componente desde cero, mira si está aquí.

Sirve tal cual si el proyecto usa React. Con otro stack no se copia el código, pero vale como referencia de comportamiento: qué estados tiene cada pieza, cómo responde al teclado y cuánto dura cada animación.

## Cuándo se usa

- **Fase 5, al fijar el estilo.** El catálogo de componentes del proyecto (`/catalogo`) sale de aquí: se copian los módulos que el proyecto va a necesitar y se les pone el tema de la dirección elegida.
- **Fase 7, en cada módulo.** Si una pantalla necesita una pieza que el catálogo del proyecto no tiene, se busca primero en el kit y se añade al catálogo.

El kit no decide el aspecto. Los colores, la tipografía, el radio y la densidad salen de la dirección que eligió la persona en la fase 5 y se ponen en las variables.

## Verlo

Se copia a una carpeta de trabajo, porque la del plugin no se toca:

```bash
cp -r "${CLAUDE_SKILL_DIR}/assets/kit" /tmp/kit && cd /tmp/kit
npm install
npm run dev      # catálogo en http://localhost:5190
npm test         # 69 pruebas
```

El catálogo enseña cada módulo con su demo y su ejemplo de uso. Los mandos de arriba cambian acento, radio, densidad y tema en los 40 a la vez. Enséñaselo a la persona cuando haya que elegir qué piezas entran en el proyecto.

## Qué hay

Todo está en `assets/kit/src/kit/` y se exporta desde `index.js`. Los parámetros de cada módulo están documentados encima de su función.

| Grupo | Módulos | Ficheros |
|---|---|---|
| Funciones | formato es-ES de importes, fechas y tamaños; búsqueda que descarta respuestas viejas; estado en la URL; preferencias guardadas; atajos de teclado; copiar; selección por tramo con Mayús | `formato.js`, `hooks.js`, `Copiar.jsx` |
| Animaciones | aparecer escalonado, cifra que cuenta, esqueletos, colapsable y acordeón, lista que se reordena, barra y anillo de progreso, botón con estado de guardado, transición de tarjeta a ficha | `Aparecer`, `CifraAnimada`, `Esqueleto`, `Colapsable`, `ListaAnimada`, `Progreso`, `BotonEstado`, `TransicionVista` |
| Interactivos | avisos con «Deshacer», diálogo y confirmación, cajón, paleta de comandos, menú, combo con búsqueda, pestañas, segmentado, interruptor, pista, tabla, filtros, paginación, subida de archivos, selector de fecha, tablero, edición en línea, campo de etiquetas, pasos | `Avisos`, `Dialogo`, `Cajon`, `Paleta`, `Menu`, `Combo`, `Pestanas`, `Segmentado`, `Interruptor`, `Pista`, `Tabla`, `Filtros`, `Paginacion`, `SubirArchivos`, `SelectorFecha`, `Tablero`, `EdicionEnLinea`, `CampoEtiquetas`, `Pasos` |
| Apartados | armazón con lateral plegable, cifras con tendencia, gráficos de barras y línea, estados (vacío, sin resultados, error, sin permiso, sin conexión), historial de actividad, primeros pasos | `Marco`, `Cifras`, `Grafico`, `Estados`, `Actividad`, `PrimerosPasos` |

Cubren casi toda la tabla de estados de `desarrollo-frontend.md`: cargando (`Esqueleto`), vacío y sin resultados (`Estados`), guardando y guardado (`BotonEstado`, `Avisos`), dato que falta (`formato.js` devuelve una raya), sin conexión (`useConexion`).

## Llevar un módulo al proyecto

1. Copia su `.jsx` y su `.css` de `src/kit/` a la carpeta de componentes del proyecto.
2. Copia también `interno.js`. Si el módulo usa `Boton`, `Campo`, `Etiqueta` o `Avatar`, copia `base.jsx` y `src/base.css`, o apunta esos imports a los componentes básicos que ya tenga el proyecto.
3. Mira sus imports, porque algunos se apoyan en otros: Tabla usa `Esqueleto` y `hooks.js`; Avisos y Tablero usan `ListaAnimada`; Cajón y Paleta usan `Dialogo`; Filtros usa `Menu`.
4. Une las variables. El kit lee `--acento`, `--tinta`, `--linea`, `--superficie`, `--e-N`, `--radio`, `--alto-control`, `--dur-1…3` y `--curva` (la lista entera está en `src/tema.css`). Si el proyecto ya tiene las suyas con otro nombre, haz el puente en su tema (`--acento: var(--color-principal);`). Si aún no tiene, parte de `tema.css` y cambia los valores por los de la dirección elegida.
5. Añade el módulo al `/catalogo` del proyecto con sus estados. Las demos de `src/catalogo/` sirven de punto de partida.
6. Copia sus pruebas de `test/` si el proyecto usa vitest con Testing Library.
7. Comprueba la pantalla en el navegador como dice `desarrollo-frontend.md`. Que el módulo estuviera probado en el kit no prueba que encaje en el proyecto.

Las clases llevan el prefijo `k-` para no chocar con las del proyecto. Los textos de los módulos ya siguen `textos-interfaz.md`; los datos de las demos son inventados y no se llevan.

## Cuando un módulo se mejora

Si al usarlo en un proyecto se le arregla un fallo o se le añade un estado, apúntalo en `docs/lecciones.md` para llevar el cambio de vuelta al kit. Si no, el siguiente proyecto parte del fallo.

## Qué está comprobado y qué no

Comprobado: las 69 pruebas, la compilación de producción, las 40 demos en Chrome a 1280 y 375 px sin errores de consola ni desplazamiento lateral, y el uso con ratón y teclado de las piezas delicadas (foco de los diálogos, menú con flechas, arrastre del tablero, selección por tramo, validación de los pasos).

Sin comprobar, y hay que decírselo a la persona si el proyecto depende de ello:

- **Safari y Firefox.** La salida animada de diálogos y cajón y la transición de vista usan APIs recientes. Donde falten, el cambio debería ocurrir sin animar.
- **Lector de pantalla real.** Los roles y los nombres están puestos, pero nadie lo ha recorrido con NVDA o VoiceOver.
- **Arrastre con el dedo en un móvil físico.** El tablero solo se ha probado con táctil emulado.

# Cómo se construyen las pantallas de un módulo

Esta guía describe el procedimiento paso a paso, con la comprobación de cada paso. Está escrita para que la siga cualquier modelo o agente, y también una persona. El método general (leer antes, copiar la forma de lo que hay, pasos pequeños, contar lo que pasó de verdad) está al principio de `desarrollo-backend.md` y vale igual aquí: léelo primero.

Una pantalla no está hecha cuando el código compila. Está hecha cuando alguien la ha abierto en un navegador, en ordenador y en móvil, y ha mirado el resultado.

## 0. Antes de escribir

1. Lee la sección del módulo en la especificación y sus recorridos en `docs/plan-plataforma.md`.
2. Abre el catálogo de componentes del proyecto (la ruta `/catalogo` de la fase 5) y el fichero de variables de estilo. Todo lo que necesites sale de ahí.
3. Abre una pantalla ya integrada del mismo tipo (otra lista, otra ficha, otro formulario) y cópiale la forma.
4. Mira las referencias reales del módulo en `docs/referencias.md`. Si no hay, búscalas ahora (`referencias-reales.md`).
5. Escribe en tu respuesta, por cada pantalla: qué pregunta de la persona responde, cuál es su acción principal (una sola) y qué datos enseña en qué orden. Si no sabes decir la pregunta, la pantalla sobra o está mal planteada.

## 1. El orden de trabajo en cada pantalla

1. **Estructura** con HTML que diga lo que es (`main`, `nav`, `table`, `form`, `button`, encabezados en orden) y los datos de ejemplo del contrato.
2. **Todos los estados** de la tabla de abajo.
3. **Interacción**: guardar, filtrar, ordenar, abrir, borrar.
4. **Móvil.**
5. **Conexión con la API real**, quitando el ejemplo.
6. **Pulido**, lo último y solo si lo anterior está bien.

## 2. Los estados

El caso con datos normales es uno entre muchos. Antes de dar la pantalla por hecha, cada fila de esta tabla tiene que existir o tener un motivo escrito para no existir.

| Estado | Qué se ve |
|---|---|
| Cargando | La silueta del contenido que va a llegar, con su misma forma. Una rueda sola en mitad de la pantalla, no |
| Vacío, la primera vez | Qué va aquí y el botón para crear el primero |
| Vacío por un filtro o una búsqueda | «Sin resultados» y cómo quitar el filtro. Es distinto del anterior |
| Error al cargar | Qué ha pasado en una frase y un botón para reintentar |
| Error al guardar | El mensaje junto al campo o encima del formulario, con todo lo escrito intacto |
| Guardando | El botón desactivado y diciendo que guarda. Un segundo clic no envía otra vez |
| Guardado | Una confirmación corta que no tapa nada, o volver a la lista con el registro visible |
| Sin permiso | El botón no aparece. Si llega por enlace, una página que lo dice |
| Muchos datos | Paginación o carga por tramos; la pantalla sigue yendo fluida con mil filas |
| Datos extremos | Un nombre de ochenta letras, un importe de siete cifras, un texto sin espacios: se corta con puntos suspensivos y no rompe la fila |
| Dato que falta | Un guion o «Sin teléfono», nunca `null`, `undefined` ni un hueco |
| Sin conexión o red lenta | No se queda cargando para siempre: avisa y deja reintentar |

## 3. Jerarquía y aspecto

- **Una acción principal por pantalla**, con el estilo de botón principal. Las demás, secundarias.
- **Lo que borra o no se puede deshacer** va separado de lo demás y pide confirmación nombrando lo que se borra («Borrar a Marta Ruiz»).
- **Tablas para comparar filas**, no tarjetas. Los números, a la derecha y con cifras del mismo ancho (`font-variant-numeric: tabular-nums`).
- **Importes y fechas con el formato del cliente**: `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })` y `Intl.DateTimeFormat`. Las fechas cercanas, como se dicen («hoy», «ayer», «lun 16»).
- **Solo las variables de estilo del proyecto.** Ningún color en hexadecimal, tamaño de letra ni espaciado suelto dentro de un componente. Si te falta un valor, es que falta una variable: dilo, no lo inventes.
- **Si necesitas un componente que no está en el catálogo**, añádelo al catálogo con sus estados. No lo dejes escondido dentro de una pantalla.
- **Densidad según el uso**, la que se decidió en la fase 5. Una app de gestión enseña mucha información junta y bien alineada.
- Repasa la lista «Señales de diseño inventado» de `referencias-reales.md`.

## 4. Formularios

- **Cada campo con su etiqueta visible.** El texto de ejemplo de dentro desaparece al escribir y no hace de etiqueta.
- **El tipo de campo correcto**: `type="email"`, `type="tel"`, `inputmode="decimal"` para importes, `autocomplete` con su valor. En el móvil cambia el teclado.
- **Se valida al salir del campo y al enviar.** No mientras se escribe la primera letra.
- **El error va junto a su campo y dice cómo arreglarlo**: «El IBAN tiene 24 caracteres; faltan 2», no «Campo no válido». Al enviar con errores, el foco va al primero.
- **Los errores que devuelve el servidor se enseñan en su campo**, usando la clave `campos` de la respuesta.
- **Nunca se pierde lo escrito**: ni al fallar el envío, ni al fallar la red. Si la persona sale con cambios sin guardar, se le avisa.
- **Valores por defecto** donde haya uno razonable (la fecha de hoy, la sede del usuario). Lo opcional se marca como opcional.
- **El botón dice lo que hace**: «Guardar alumno», «Cobrar 120,00 €». La tecla Intro envía.

## 5. Datos y estado

- **La dirección de la página guarda lo que se está viendo**: filtros, página, pestaña y registro abierto van en la URL. Así recargar, el botón atrás y mandar el enlace a un compañero funcionan.
- **Después de guardar, se actualiza todo lo que enseñaba ese dato** (la lista, el contador del menú, la ficha).
- **No guardes en el estado lo que se puede calcular** a partir de otro dato: acaban sin coincidir.
- **En una búsqueda mientras se escribe**, espera a que la persona pare (unos 300 ms) y descarta las respuestas de las búsquedas anteriores. Si no, llega tarde una respuesta vieja y pisa la buena.
- **Enseñar el cambio antes de que el servidor conteste** solo en acciones pequeñas y que se pueden deshacer (marcar una asistencia). Nunca en un cobro. Si el servidor falla, se deshace y se dice.

## 6. Móvil

Se prueba a 375 px de ancho, no reduciendo la ventana a ojo.

- La página no se desplaza de lado. Si una tabla no cabe, pasa a lista con lo esencial de cada fila, o se desplaza solo la tabla con la primera columna fija.
- Lo que se toca mide al menos 44 px de alto y ancho.
- Nada depende de pasar el ratón por encima.
- Los campos de texto tienen la letra a 16 px o más. Por debajo, el iPhone amplía la página al tocarlos.
- Con el teclado abierto, el botón de guardar sigue al alcance.

## 7. Accesibilidad mínima

- **Elementos nativos**: `button` para lo que hace algo, `a` para lo que lleva a otro sitio, `label` unido a su campo, `dialog` para los diálogos. Un `div` con un clic no se puede usar con teclado.
- **Todo se puede hacer con el teclado** y siempre se ve dónde está el foco.
- **Los diálogos** retienen el foco dentro, se cierran con Escape y devuelven el foco al botón que los abrió.
- **Contraste** de 4,5:1 en el texto. Un estado nunca se distingue solo por el color: lleva texto o icono.
- **Los avisos que aparecen solos** («Guardado», un error) se anuncian con `aria-live`.
- **Las animaciones se apagan** con `prefers-reduced-motion`.

## 8. Movimiento

Solo cuando explica un cambio: algo que aparece, se mueve o se va. Entre 150 y 250 ms, animando `transform` y `opacity`. Lo que se usa cien veces al día (abrir un menú, cambiar de pestaña) va sin animación o casi.

## 9. Textos

Siguen `textos-interfaz.md`. La pantalla no se explica a sí misma: si necesita un párrafo para entenderse, hay que cambiar la pantalla. Lo que se quiera explicar en la demo va en el bloque de `texto-demo.md`.

## 10. Comprobación en el navegador

Obligatoria. Arranca la app en una instancia propia, con la semilla, y haz esto en orden:

1. Captura de cada pantalla a 1280 px y a 375 px. **Abre cada captura y mírala.** Busca: texto cortado o montado, columnas descuadradas, huecos raros, algo que no se parezca a las pantallas ya hechas.
2. La consola del navegador, sin errores ni avisos nuevos. La pestaña de red, sin peticiones fallidas ni repetidas.
3. El recorrido entero del módulo solo con el teclado.
4. Provoca cada estado de la tabla del punto 2: base vacía, filtro sin resultados, el servidor parado, red lenta.
5. Doble clic en guardar. Recargar a mitad de un formulario. Botón atrás después de guardar.
6. Entra con cada rol y comprueba que ve lo que dice la especificación y nada más.

Si no tienes navegador o no puedes ver imágenes, no declares la pantalla revisada: di exactamente qué has comprobado y qué no, y pídele a la persona que la abra. Los pasos de arriba se los das como lista.

## 11. Antes de darla por hecha

- Tests, lint y tipos en verde, con la salida leída.
- El diff leído entero: sin colores ni tamaños sueltos, sin componentes duplicados del catálogo, sin trazas de depuración, sin ficheros de otro módulo.
- Las capturas de ordenador y móvil, guardadas para el PR.
- En tu respuesta: qué pantallas, qué estados has visto con tus ojos y cuáles no, y qué queda.

## Señales de que vas mal

- No has abierto el navegador y vas por la tercera pantalla.
- Has creado un botón, una tarjeta o una tabla que ya estaban en el catálogo.
- Hay un color en hexadecimal o un tamaño en píxeles dentro de un componente.
- La pantalla tiene un texto que explica para qué sirve.
- Has añadido cifras, gráficas o un saludo que nadie pidió.
- Solo existe el estado con datos.
- Has arreglado el móvil escondiendo cosas con `display: none` sin preguntarte si en el móvil hacen falta.

# Cómo se construye el backend de un módulo

Esta guía describe el procedimiento paso a paso, con la comprobación de cada paso. Está escrita para que la siga cualquier modelo o agente, y también una persona. Si eres un modelo: no te saltes pasos porque el módulo parezca fácil, y no des un paso por hecho sin haber ejecutado su comprobación y leído el resultado.

Los ejemplos usan Node y SQL porque es lo más habitual en estos proyectos. Si el proyecto usa otra cosa, la regla es la misma y cambia la sintaxis.

## Método, para todo el desarrollo

Estas siete reglas valen igual para el backend y para las pantallas.

1. **Lee antes de escribir.** La sección del módulo en `docs/especificacion.md` entera, la tabla de roles y permisos y las entidades que toca. Nada más de la especificación.
2. **Copia la forma de lo que ya hay.** Abre un módulo ya integrado del mismo proyecto y fíjate en sus carpetas, sus nombres, cómo valida, cómo devuelve errores y cómo son sus tests. El tuyo tiene que parecer escrito por la misma mano. Si el proyecto ya resolvió algo (fechas, permisos, errores), usa eso y no traigas otra manera.
3. **Escribe el plan antes del código.** En tu respuesta, antes de tocar ficheros: las rutas, las tablas y campos, las reglas, los casos límite y lo que no sabes. Lo que no sepas es una duda (`docs/dudas.md` o el panel del cliente), nunca una regla que decides tú.
4. **Pasos pequeños.** Un paso, su comprobación, el siguiente. Si escribes quinientas líneas y luego pruebas, no sabrás cuál falla.
5. **Solo lo que pide la especificación.** Ni opciones «por si acaso», ni refactorizar lo de al lado, ni dependencias nuevas sin preguntarlo con el menú. Si ves algo roto fuera de tu módulo, apúntalo y díselo a la persona.
6. **Una prueba vale si la has visto fallar.** Un test que sale en verde a la primera puede no estar probando nada: rompe la regla a propósito, mira que el test falla y deshaz el cambio.
7. **Cuenta lo que pasó de verdad.** Al terminar dices qué hiciste, qué comprobaste y con qué resultado, qué no has podido comprobar y qué queda. «Debería funcionar» no es un resultado. Si un test falla, lo dices con su salida.

## 1. Datos

- **La migración solo añade.** Columnas nuevas con valor por defecto o que admiten vacío, tablas nuevas, índices nuevos. Renombrar o borrar una columna se hace en dos entregas: primero el código deja de usarla, después se borra. Así la versión anterior de la app sigue funcionando con el esquema nuevo y se puede volver atrás sin restaurar datos.
- **Las reglas que se pueden poner en la base, van en la base**: obligatorio (`NOT NULL`), único (`UNIQUE`), relación (`FOREIGN KEY`), valores permitidos (`CHECK`). El código también valida, pero la base es la que no se puede saltar.
- **Dinero en céntimos enteros**, nunca con decimales. Fechas guardadas en UTC y mostradas en la zona del cliente.
- **Cada fila sabe de quién es.** Si la app tiene varias empresas, sedes o usuarios con datos propios, la tabla lleva esa columna desde el primer día.
- **Un índice por cada filtro y cada orden** que use una lista, y por cada clave ajena.
- **Decide el borrado** y apúntalo en la especificación: borrar de verdad, o marcar como borrado y esconder. Lo que tiene historia (cobros, asistencias, facturas) casi nunca se borra.
- La migración se nombra con fecha y hora o con el número del módulo, como diga el plan técnico.

Comprobación: aplica la migración sobre una base vacía y sobre una con la semilla. Reinicia la semilla y pasa sus tests de invariantes.

## 2. El contrato de cada ruta

- **Valida la entrada en la puerta**, con un esquema (la librería que ya use el proyecto): tipos, longitud máxima de cada texto, valores permitidos, y rechaza los campos que no esperas.
- **Nunca te fíes de lo que mande el navegador para saber quién es o qué puede**: el usuario, su rol y su empresa salen de la sesión; el precio, el estado y el dueño de un registro salen de la base.
- **Un solo formato de error en toda la app**, el que ya use el proyecto. Si no hay ninguno: `{ "error": { "codigo": "plazo_ya_cobrado", "mensaje": "…", "campos": { "importe": "…" } } }`.
- **Códigos**: 400 entrada no válida, 401 sin sesión, 403 su rol no puede hacer eso, 404 no existe o no es suyo, 409 choca con el estado actual o ya existe.
- **Las listas siempre van paginadas**, con un máximo por página y un orden estable (el campo de orden y, para desempatar, el id).
- **Devuelve solo los campos que la pantalla necesita.** Nunca el registro entero tal como sale de la base: ahí van el hash de la contraseña, notas internas y datos de otros.

Comprobación: con la app arrancada, llama a cada ruta con `curl` cuatro veces: bien, sin sesión, con un campo mal y con un campo de más. Lee las cuatro respuestas.

## 3. Permisos

En cada ruta, en este orden: ¿hay sesión?, ¿su rol puede hacer esta acción?, ¿este registro es suyo?, ¿la regla de negocio lo permite ahora?

- **El filtro por dueño va dentro de la consulta** (`WHERE empresa_id = ?` con el valor de la sesión), no después, recorriendo los resultados.
- **Lo que existe pero no es suyo responde 404**, igual que si no existiera. Un 403 le confirma a un curioso que ese id existe.
- **Los ids que salen en enlaces para gente de fuera** (familias, clientes finales) no pueden adivinarse sumando uno.
- **Un test por cada «solo lo suyo» de la especificación**, con dos usuarios: A crea el registro y B intenta verlo, cambiarlo, borrarlo y encontrarlo en su lista. Las cuatro cosas.

Comprobación: los tests de permisos fallan si quitas el filtro de la consulta. Pruébalo una vez.

## 4. Reglas y estados

- **Las transiciones de estado viven en un solo sitio**: una función que recibe estado actual, estado nuevo y rol, y dice si se puede, calcada de la tabla de la especificación. Ninguna ruta cambia un estado por su cuenta.
- **Lo que toca varias tablas va en una transacción.** O se guarda todo o nada.
- **Repetir no duplica.** Un doble clic, un reintento de la red o un aviso repetido de la pasarela de pago no pueden crear dos cobros ni mandar dos correos. Se consigue con una restricción única o con una clave que identifica la operación.
- **Dos personas a la vez.** Para editar el mismo registro: el `UPDATE` comprueba la versión o la fecha de última modificación y, si ha cambiado, responde 409. Para reservar el último hueco: restricción única o bloqueo en la base. «Leo si hay hueco y luego escribo» falla con dos peticiones simultáneas.
- **La hora llega desde fuera.** Las reglas reciben la hora como parámetro o usan el reloj del proyecto, para que los tests la fijen.
- **Lo que sale de la app (correo, WhatsApp, cobros) va detrás de una interfaz**, se llama después de confirmar la transacción y tiene una versión de demo que guarda el envío en una bandeja interna en vez de mandarlo.
- **Las llamadas a sistemas de fuera llevan tiempo máximo** y deciden qué pasa si el otro no responde: reintentar más tarde, avisar o dejarlo pendiente. Nunca dejan la petición del usuario colgada.

## 5. Errores y registro

- Un `catch` solo existe si hace algo con el error: lo traduce a una respuesta, lo reintenta o lo registra. Un `catch` vacío esconde el fallo hasta la demo.
- Al usuario le llega un mensaje que entiende. La traza y el detalle técnico van al registro del servidor.
- En el registro, la ruta, el id del usuario y un id de petición. Sin contraseñas, tokens ni datos personales.

## 6. Seguridad, en cada módulo

- Consultas siempre con parámetros, nunca pegando texto del usuario en el SQL.
- Subidas de ficheros: tipo comprobado por el contenido, tamaño máximo, nombre generado por la app y servidas como descarga.
- Claves y contraseñas por variables de entorno. Ninguna en el código, en los tests ni en la semilla.
- Las rutas públicas (entrar, recuperar contraseña, formularios abiertos) tienen límite de intentos.

## 7. Tests, en este orden

1. Uno por cada caso límite de la especificación.
2. Los de permisos del punto 3.
3. Entrada mala: campo que falta, texto larguísimo, número negativo, fecha imposible.
4. Transiciones que no se permiten.
5. El recorrido normal.

Van contra una base de datos de prueba de verdad, no contra una imitación de la base: los fallos de este tipo de app están en las consultas y en las restricciones. Ningún test depende de la hora real ni del orden en que se ejecuten.

**Nunca cambies un test para que pase.** Si falla, o el código está mal o la especificación ha cambiado; en el segundo caso se corrige primero la especificación.

## 8. Antes de darlo por hecho

Ejecuta y lee la salida de cada uno:

```bash
npm test              # o el comando del proyecto; todos, no solo los del módulo
npm run lint
npm run typecheck     # si el proyecto tiene tipos
git diff develop...HEAD --stat
```

Después lee el diff completo, línea a línea, buscando:

- ficheros de fuera de la carpeta del módulo (¿hacía falta tocarlos?, ¿tienen dueño en el plan técnico?);
- trazas de depuración, comentarios de «pendiente», código comentado o que nadie llama;
- nombres que no coinciden con los de la especificación;
- algo que no esté en la especificación.

## Si el módulo es la migración de los datos reales

Los datos que el cliente ya tiene (su Excel, su programa anterior) entran con un script propio, que es un módulo más de la especificación.

1. **El script se escribe contra la forma de los datos, no contra los datos.** Los ficheros reales viven fuera del repo, en la carpeta de documentos del cliente. En el repo solo hay un ejemplo inventado con las mismas columnas y los mismos defectos.
2. **Primero mide**: cuántas filas, columnas vacías, duplicados, formatos de fecha y de teléfono, valores que no encajan con los estados de la app. Ese informe va al panel de dudas como preguntas concretas («hay 43 alumnos sin DNI: ¿se importan?»).
3. **`--simular` por defecto.** Sin esa opción quitada, el script no escribe: dice cuántas filas entrarían, cuáles rechaza y por qué, fila a fila, en un fichero.
4. **Se puede repetir.** Pasarlo dos veces no duplica nada: cada fila se reconoce por una clave del origen.
5. **Todo o nada**, en una transacción, y con copia de la base hecha antes.
6. **Se cuadra con el cliente**: totales del origen contra totales importados (número de registros, suma de importes pendientes) y diez fichas elegidas al azar que revisa él.
7. **Se ensaya antes de producción**, sobre una copia y con los datos reales, antes o durante la fase 8. El día de pasar a producción no es el primer día que se ejecuta.

## Señales de que vas mal

Para y revisa si te ves haciendo algo de esto:

- Tocar ficheros de otro módulo o un fichero común que no es tuyo.
- Decidir una regla de negocio que no está en la especificación ni viene de una referencia.
- Cambiar un test, o saltártelo, para que la suite pase.
- Un `catch` que no hace nada, o un valor por defecto que tapa un dato que falta.
- Añadir una librería para algo que el proyecto ya hace.
- Decir que funciona sin haber llamado a la ruta.
- Llevar tres intentos arreglando el mismo fallo a base de probar: vuelve a leer el error entero y la especificación, y si sigue sin salir, díselo a la persona con lo que has probado.

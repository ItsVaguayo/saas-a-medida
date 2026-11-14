# Lecciones: lo que cada proyecto le enseña a la skill

Cada proyecto encuentra algo que la skill no avisó. Si no se apunta, el siguiente proyecto tropieza en lo mismo.

## Cuándo

- Al cerrar la fase 8, con las correcciones del cliente delante.
- Al cerrar la fase 9.
- En soporte, cuando un error llegó a producción por algo que el proceso debería haber parado.

## Qué se apunta

En `docs/lecciones.md` del proyecto (plantilla en `assets/docs/`), una fila por lección:

| Campo | Contenido |
|---|---|
| Qué pasó | El hecho, con su dato: «el cliente pidió en la demo exportar a Excel en cuatro pantallas» |
| Dónde se pudo haber visto | La fase y el paso: «fase 1, parte B: no se preguntó por informes» |
| Qué cambiar en la skill | El fichero y la frase: «`fase-1-informacion.md`, parte A: preguntar qué sacan hoy a Excel» |

Solo entra lo que cambiaría la forma de trabajar en el siguiente proyecto. Un fallo puntual de un módulo va a `docs/qa/`, no aquí.

Pregunta a la persona qué le sobró y qué echó en falta: lo que ella vio pesa más que lo que deduzcas tú del historial. Dos o tres preguntas con el menú bastan.

## Qué se hace con ellas

Enséñale la lista a la persona y pregunta con el menú cuáles quiere proponer para la skill. Con las elegidas, prepara un texto de incidencia para el repositorio del plugin (`gh issue create -R ItsVaguayo/saas-a-medida`), sin el nombre del cliente ni datos suyos. La persona lo lee y decide si se publica: una incidencia en GitHub la ve más gente que el equipo.

Quien mantiene la skill aplica el cambio, sube la versión del plugin y lo anota en `CHANGELOG.md`.

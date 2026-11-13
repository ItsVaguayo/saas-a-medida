# Fase 3. Documento de alcance

Un PDF para el cliente que dice, a partir de lo que pidió, qué se va a hacer, qué se puede conectar, qué no y qué necesitamos de él. Es el documento que evita discusiones en la demo, así que no promete nada que no se haya comprobado.

## 1. Comprobar cada integración antes de escribir

Para cada sistema externo que salió en la fase 1:

1. Lee la documentación oficial de su API o de su exportación.
2. Si hay credenciales (reales o de prueba), escribe un script pequeño que haga la llamada que de verdad necesitamos y apunta qué respondió. Las credenciales las introduce la persona; no las escribas en el repo.
3. Concluye: **se puede**, **se puede con condición o coste**, **no se puede** o **por comprobar** (con lo que falta para comprobarlo). Que el cliente no tenga acceso técnico también es una conclusión, y cambia el alcance.

Apúntalo en `docs/viabilidad.md` (plantilla en `assets/docs/`). Lo que quede «por comprobar» va también al panel de dudas.

## 2. Qué lleva el documento

| Sección | Contenido |
|---|---|
| Portada | Título con las últimas palabras en el color de acento, subtítulo, chips (para quién, mes y año, páginas) y la barra resumen: cuántas cosas se hacen, con condición, por comprobar y fuera |
| 01 Lo que nos habéis pedido | El problema y lo que quieren conseguir, en sus palabras, con dos o tres citas suyas |
| 02 Lo que vamos a hacer | Los módulos, uno o dos párrafos cada uno, con captura de la demo si existe |
| 03 Lo que se conecta | Tabla de integraciones con su estado y la condición o el coste |
| 04 Lo que no se puede hacer o queda fuera | Cada punto con el motivo y, si la hay, la alternativa |
| 05 Lo que necesitamos de vosotros | Accesos, datos, ejemplos y las dudas abiertas que bloquean algo |
| 06 Cómo seguimos | Los siguientes pasos en orden: mockups, plan, desarrollo, demo. Sin fechas salvo que la persona las dé |

El precio solo aparece si la persona lo da. Nunca lo inventes ni lo estimes en el documento. Si ya había un precio cerrado, la sección 02 dice qué entra por ese precio y la 04, lo que quedaría para después.

## 3. Cómo se escribe

- Para el cliente, no para el equipo: sin jerga técnica. «Se conecta con Holded para que la factura no se teclee dos veces», no «integración vía API REST».
- Frases cortas, en primera persona del plural («hemos visto», «vamos a»). Cada afirmación, concreta y comprobable.
- Sin palabras de folleto: nada de «solución integral», «potenciar», «revolucionar» ni promesas de resultados.
- Si un punto depende del cliente, dilo así: «Depende de que nos deis acceso a…».

## 4. Generarlo

1. Copia `${CLAUDE_SKILL_DIR}/assets/documento/plantilla.html` a una carpeta de trabajo y rellénala siguiendo `estilo-documentos.md`. La plantilla ya trae todos los bloques (portada, secciones, tablas, chips, notas, figuras). La marca del documento sale del campo `agencia` del fichero de proyecto; si está vacío, de la configuración del plugin: nombre «${user_config.agencia}», web «${user_config.web}», color «${user_config.color}». Si no hay nombre en ninguno de los dos sitios, pregúntalo y guárdalo en el fichero de proyecto.
2. Genera el PDF: `bash "${CLAUDE_SKILL_DIR}/scripts/generar-pdf.sh" alcance.html "<carpeta de documentos del cliente>/Alcance-<proyecto>.pdf" --previas`.
3. Mira **todas** las previas que genera el script (una imagen por página) antes de enseñar nada: cortes de tabla, páginas medio vacías, textos que no caben. Corrige y vuelve a generar.
4. Enseña el PDF a la persona. Ella lo revisa y lo envía. Si pide cambios, vuelve al paso 1 de esta sección.

## Se cierra cuando

La persona da el documento por bueno con el menú. Actualiza la tabla «Estado» y anota en `docs/decisiones.md` la versión enviada.

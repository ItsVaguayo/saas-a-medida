# Fase 8. Demo al cliente

Se le enseña al cliente lo construido para que dé su conformidad o pida correcciones.

## Preparar

Antes de nada, con todos los módulos ya en `develop`, la pasada completa de diseño, móvil y accesibilidad sobre todas las pantallas (fase 7, «Revisiones antes del PR»). Lo que encuentre se arregla antes de enseñar nada.

1. **Guion** en `GUION-DEMO.md`: un recorrido en el orden en que trabaja el cliente, no en el orden en que se construyó. Cada bloque dice qué pregunta o necesidad suya responde, con su referencia de la fase 1 ([P.6]).
2. **Datos de demo creíbles**: nombres, importes y fechas que podrían ser suyos, sembrados alrededor de la fecha de hoy. Ningún dato personal real, aunque nos haya pasado su Excel. Un botón o comando de «reiniciar la demo» que vuelva a sembrarlos.
3. **Textos de demo**: donde una pantalla necesite explicación, el bloque marcado de `texto-demo.md`, con el aviso de «modo demo» visible. Es el único sitio donde se explica cómo funciona algo.
4. **La verdad sobre lo simulado**: lo que todavía no está conectado sale como «por conectar» o «simulado», y la pantalla o el guion lo dicen. Una demo que hace creer que algo funciona cuando no es así cuenta como fallo grave.
5. **Instancia aparte**: la demo corre en su propia instancia y su propia base, desplegada con `deploy/desplegar.sh` y su `deploy/demo.env`. Las pruebas y la revisión van contra otra.
6. **Nada sale de verdad**: en modo demo no se envía ningún correo, SMS ni WhatsApp a nadie y no se cobra nada. Los envíos se quedan en una bandeja interna que se puede enseñar, y los pagos usan el modo de pruebas de la pasarela.
7. Pasa el guion entero una vez antes, en el móvil y en el ordenador, y arregla lo que falle.
8. **Ensayo de la migración**, si hay datos que entran: pasa el script con los datos reales sobre una copia, en una máquina del equipo y nunca en la instancia de demo, y lleva a la reunión el informe (cuántos registros entran, cuáles se rechazan y por qué, totales que cuadran). Las filas dudosas son preguntas para el cliente.

El guion y cualquier mensaje para el cliente los revisa la persona antes de usarlos.

## Después

1. Recoge las correcciones del cliente en una lista.
2. Cada corrección se pasa **primero a la especificación**, como cambio en su módulo o como módulo nuevo, y después al código. Así el documento sigue diciendo la verdad.
3. Lo que el cliente pida y no estaba en el alcance se marca aparte y se decide con el menú: entra, entra con coste (eso lo decide quien vende) o queda para después.
4. Si la reunión deja muchos puntos, haz un plan de esos puntos (`docs/plan-reunion-<fecha>.md`) marcado como propuesta: no es especificación hasta que se apruebe.

## Se cierra cuando

El cliente da su conformidad por escrito (un correo o un mensaje de la persona que decide, fase 1, pregunta 12), diciendo qué da por bueno y qué correcciones quedan. Una conformidad de palabra en la reunión se confirma después con un mensaje que la persona revisa y envía. Apúntalo en `docs/decisiones.md` con la fecha, quién la dio y dónde está el mensaje, y marca la fase como hecha en `fases` de `.claude/saas-a-medida.json`.

Antes de pasar a la fase 9, apunta las lecciones de la demo (`lecciones.md`).

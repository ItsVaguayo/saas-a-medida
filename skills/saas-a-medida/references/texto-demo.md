# Texto de demo

En una demo, explicar cómo funciona una pantalla ayuda: el cliente entiende una regla o un flujo sin que nadie se lo cuente. Pero ese texto no es parte del producto. En la app final sobra, y si se cuela en producción es justo el tono de «app hecha por IA» que hay que evitar.

Por eso el texto explicativo existe, pero **solo dentro del bloque de texto de demo**, que se ve claramente como algo provisional y se quita antes de producción.

## Cuándo usarlo

- Una regla que no se ve en la pantalla: «Al pasar lista, la práctica pasa a realizada y se descuenta del bono».
- Algo que todavía está simulado o por conectar: «Cuando conectemos Holded, este contacto se creará solo allí».
- Un recorrido entre pantallas: «Desde aquí la oficina reserva la práctica; el instructor la verá en su móvil».

No lo uses para repetir lo que la pantalla ya dice, para dar la bienvenida ni para anunciar funcionalidades.

## Cómo se pone

Copia los ficheros de `${CLAUDE_SKILL_DIR}/assets/texto-demo/` al proyecto:

- React: `TextoDemo.jsx` y `texto-demo.css`. `<TextoDemo titulo="Cómo se cuenta la asistencia">…</TextoDemo>` donde haga falta y `<AvisoModoDemo />` una sola vez en el layout principal.
- Sin React: el bloque de `texto-demo.html` y la misma hoja de estilos.

El bloque va en ámbar con borde discontinuo y una etiqueta «Texto de demo», y el aviso fijo dice que esos recuadros no estarán en la versión final. Para hacer capturas sin ellos, arranca con `VITE_OCULTAR_TEXTO_DEMO=true`.

## Cómo se escribe

- Corto: una o dos frases.
- Concreto: la regla o el dato tal como funciona en este cliente, con sus nombres.
- En presente y sin adornos: «La práctica pasa a realizada», no «¡Ahora puedes marcar las prácticas fácilmente!».

## Cómo lo hacen las apps reales

El distintivo copia lo que ya funciona en productos conocidos: Stripe separa el modo de pruebas del modo real y lo avisa en todas las pantallas; GOV.UK pone una etiqueta «Beta» con una frase en la cabecera mientras el servicio no está terminado; Pipedrive pone «[Muestra]» delante de cada dato de ejemplo y deja quitarlos todos de una vez.

Si la app de producción trae datos de ejemplo para que el cliente vea cómo funciona, sigue el modelo de Pipedrive: «[Ejemplo]» delante del nombre de cada uno, para que se note también en los PDF y las exportaciones, y una acción «Quitar datos de ejemplo» que enseña la lista de lo que va a borrar antes de hacerlo.

## Antes de producción

`bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-texto-demo.sh" <carpeta del código>` lista cada uso con su fichero y línea, y falla si queda alguno o si la compilación todavía lo lleva. Con `--estricto` también falla si siguen los ficheros del componente. Tiene que salir limpio antes de desplegar (fase 9). Si un texto de demo resulta útil para el cliente, no se deja tal cual: se convierte en ayuda real de la app, escrita según `textos-interfaz.md`, y lo decide la persona con el menú.

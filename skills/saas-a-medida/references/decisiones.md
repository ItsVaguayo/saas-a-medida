# Cómo se pregunta una decisión

Toda decisión que tenga que tomar la persona se pregunta con el menú de selección (la herramienta AskUserQuestion). Una decisión metida en un texto largo se pierde, y la persona acaba decidiendo sin el contexto o sin darse cuenta de que tenía que decidir.

## Qué cuenta como decisión

Alcance, qué entra y qué no, stack, dirección de diseño, reparto, modelo de ramas, herramientas, qué se envía al cliente, qué se instala, si se aprueba un documento o un plan, qué se hace con una duda abierta. Si al terminar tu mensaje la persona tendría que elegir algo, es una decisión.

Los datos no son decisiones: nombres, correos, usuarios de GitHub, la URL de la web del cliente. Pídelos con una pregunta corta en el chat, o con el menú si las respuestas probables caben en cuatro opciones.

## Cómo se escribe

- **Hasta cuatro preguntas por llamada** y de dos a cuatro opciones por pregunta. La opción «Otra» aparece sola para que la persona escriba. Si hay más de cuatro decisiones, haz varias llamadas seguidas, agrupadas por tema.
- **La cabecera** (`header`) tiene como máximo 12 caracteres: «Ramas», «Diseño», «Alcance».
- **Cada pregunta se entiende sola.** La persona puede ver solo el diálogo, sin tu mensaje anterior. Dentro de la pregunta va el contexto: qué se decide, por qué importa ahora y lo que has encontrado que lo afecta.
- **Lenguaje fácil.** Si necesitas un término técnico, explícalo en la misma frase («un hook, que es un pequeño script que Claude Code ejecuta solo al abrir la sesión»).
- **Cada opción dice qué pasa si se elige**, en su descripción: qué se gana, qué se pierde, qué cuesta.
- **Tu recomendación va primero**, con «(Recomendado)» al final de la etiqueta, y su descripción dice por qué.
- **Varias respuestas a la vez** (`multiSelect: true`) solo cuando las opciones no se excluyen, por ejemplo qué grupos de skills instalar.

## Ejemplo

```json
{
  "question": "El cliente pide conectar la app con Holded para no teclear dos veces las facturas. Holded tiene API, pero el cliente aún no nos ha dado acceso, así que no hemos podido probarla. Si lo prometemos en el documento de alcance y luego la API no permite crear borradores de factura, habrá que cambiar el alcance delante del cliente. ¿Cómo lo ponemos en el documento?",
  "header": "Holded",
  "multiSelect": false,
  "options": [
    { "label": "«Por comprobar» (Recomendado)", "description": "Sale en el documento como pendiente de probar con su acceso. No prometemos nada que no hayamos visto funcionar." },
    { "label": "«Se conecta»", "description": "Más atractivo para el cliente, pero si la API falla habrá que retirarlo después." },
    { "label": "Fuera del alcance", "description": "Seguro, pero el cliente lo pidió y puede verlo como un no." }
  ]
}
```

## Después de la respuesta

1. Aplica lo decidido.
2. Apúntalo en `docs/decisiones.md`: qué se decidió, la opción elegida, por qué y quién lo decidió.
3. Si la decisión cambia un documento (alcance, plan, especificación), cámbialo en el mismo paso.

## Si no tienes el menú

En un subagente o en otra herramienta sin AskUserQuestion, escribe las opciones numeradas con tu recomendación primero, para y espera la respuesta. No sigas como si la persona hubiera elegido.

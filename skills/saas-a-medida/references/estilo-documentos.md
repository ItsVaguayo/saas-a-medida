# Estilo de los documentos para el cliente

Todos los PDF que salen hacia el cliente (alcance, guías de uso por rol, informes de entrega) siguen este estilo. Es sobrio y técnico, con mucho blanco, un solo color de acento y tablas limpias. La plantilla `assets/documento/plantilla.html` y su hoja `documento.css` ya lo implementan: rellena la plantilla en lugar de diseñar desde cero.

## Formato

- A4 vertical. Márgenes interiores de unos 18 mm a los lados.
- Fondo blanco. Sin fotos de stock, sin ilustraciones, sin emojis ni iconos de colores.
- Un solo color de acento. Por defecto, azul `#2563eb`; se puede cambiar por el de la agencia en la variable `--acento`.

## Tipografía

Montserrat en todo el documento.

| Elemento | Peso | Tamaño | Notas |
|---|---|---|---|
| Título de portada | 800 | 40-44 pt | interlineado 1,05; las dos o tres últimas palabras en el acento |
| Título de sección | 700 | 19 pt | precedido de su número en el acento: «01», «02» |
| Subtítulo | 700 | 12 pt | en tinta |
| Cuerpo | 400 | 9,5-10 pt | interlineado 1,55 |
| Etiquetas | 600 | 7 pt | mayúsculas con espaciado ancho (0,18 em) |
| Celdas de tabla | 400 | 8,5-9 pt | primera columna en 700 |

## Colores

| Uso | Valor |
|---|---|
| Tinta (títulos, primera columna) | `#0c0e12` |
| Texto | `#3a4252` |
| Secundario (etiquetas, pies) | `#5d6471` |
| Líneas | `#e3e8f0` |
| Fondo suave de tablas y bloques | `#f3f6fc` |
| Fondo de nota destacada | `#eef4ff` |
| Acento | `#2563eb`, con `#3b82f6` y `#c9dafc` como tonos medio y claro |
| Estado «se hace» | el acento |
| Estado «con condición» | ámbar `#f2c66b` |
| Estado «no se hace» | rojo `#ef4444` |
| Estado «por comprobar» | gris `#5d6471` |

## Portada

De arriba abajo:

1. Arriba a la izquierda, la marca: un símbolo pequeño en el acento y el nombre en mayúsculas espaciadas, 9 pt y 800. Arriba a la derecha, una píldora blanca con borde fino y sombra muy suave con el nombre del cliente o del proyecto.
2. Un degradado azul muy suave que nace de la esquina superior derecha y se funde en blanco.
3. En el tercio central: la etiqueta del tipo de documento («DOCUMENTO DE ALCANCE») con una raya corta delante; el título grande; un subtítulo de dos o tres líneas en gris que dice de qué va el documento; una fila de chips grises pequeños: «Para <cliente>», «<mes> <año>», «<n> páginas».
4. Abajo, un elemento gráfico que resume el documento entero. En el alcance, una barra horizontal partida en tramos con cuántas cosas se hacen, cuántas con condición, cuántas por comprobar y cuántas quedan fuera, con su leyenda.
5. Pie: la marca a la izquierda y la web a la derecha.

## Páginas interiores

- Cabecera fina: marca pequeña a la izquierda; «<Título del documento> · <Proyecto>» a la derecha, 7,5 pt en gris.
- Pie: la web a la izquierda y «2 / 9» a la derecha.
- Cada sección empieza con su número en el acento y el título. Párrafos cortos, de tres o cuatro líneas, una idea por párrafo.

## Bloques

- **Tabla.** Contenedor con borde de 1 px `#e3e8f0` y esquinas redondeadas de 10 px. Cabecera con etiquetas en mayúsculas espaciadas. Filas separadas por una línea fina. Una tabla no se parte entre páginas si cabe entera en la siguiente.
- **Chip de estado.** Píldora con fondo claro del color del estado y texto oscuro del mismo tono, 7,5 pt y 700.
- **Tarjetas de cifras.** Una fila de tarjetas con esquinas redondeadas: la principal con fondo degradado del acento y texto blanco; las demás con el acento claro de fondo y el acento de texto. Cifra grande arriba (18-20 pt, 800) y etiqueta pequeña debajo.
- **Nota destacada.** Bloque con fondo `#eef4ff`, esquinas de 10 px, título en negrita y texto normal. Para lo que el lector no se puede saltar.
- **Figura.** Captura de la app con borde fino, esquinas de 8 px y sombra suave. Debajo, «FIG. 1 · Descripción» en etiqueta gris.

## Tono

Frases cortas en primera persona del plural. Concreto: cifras, nombres de pantallas, ejemplos del propio cliente. Sin palabras de folleto ni promesas. El documento informa; la venta ya está hecha o la hace la persona.

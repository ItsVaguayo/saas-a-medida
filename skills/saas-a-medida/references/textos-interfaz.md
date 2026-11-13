# Textos de la interfaz

Los textos que escribe Claude en las pantallas suelen delatarse: explican lo que la pantalla ya enseña, anuncian funcionalidades («Ahora puedes…») y ponen un subtítulo amable debajo de cada título. Las apps de gestión reales hacen lo contrario: nombran las cosas, dicen qué pasa y se callan.

Estas reglas salen de las guías de estilo de Microsoft (español de España), GOV.UK, Atlassian, Shopify Polaris, Mailchimp y Google, y de cómo escriben Holded, Factorial, Sesame, Stripe, Notion, Gmail y Revolut en español. Todas tutean.

## Reglas

**1. Tú, sin repetir «tu, tus».** Mejor la forma impersonal o el nombre de la cosa. Si la app se dirige a varias personas, «vosotros». Lo que la app envía a los clientes de tu cliente sigue el registro de ese negocio (puede ser usted).
Mal: «Aquí puedes ver tus clientes y gestionar tus facturas». Bien: «Clientes».

**2. Botones en infinitivo**, con el objeto si hay duda, y el mismo verbo en todo el flujo. Nunca «Haz clic aquí».
Mal: «¡Vamos!», «Enviar ahora». Bien: «Enviar factura», «Registrar cobro».

**3. Títulos que nombran, sin subtítulo.** Si una pantalla necesita una explicación para entenderse, el problema es la pantalla.
Mal: «Gestión de clientes» y debajo «Aquí podrás gestionar tus clientes de forma sencilla». Bien: «Clientes · 128 activos».

**4. No anunciar funcionalidades.** En una app a medida todo es nuevo el primer día. Lo que se puede hacer se ve en un botón.
Mal: «¡Novedad! Ahora puedes exportar tus informes». Bien: un botón «Exportar a Excel».

**5. Sin marketing dentro de la app.** Nada de prometer, celebrar lo rutinario ni adjetivos de folleto. Pedir mejor que solicitar, dar mejor que proporcionar, poder mejor que «tener la oportunidad de».
Mal: «Lleva tu gestión al siguiente nivel». Bien: «Cobros de noviembre».

**6. Listas vacías con salida.** El motivo y el siguiente paso, en una o dos frases, y un botón de una o dos palabras. Nunca «No hay datos».
Mal: «¡Vaya! Aún no hay nada por aquí. ¡Crea tu primer cliente y descubre todo su potencial!». Bien: «Aún no hay clientes» + «Añadir cliente». Con filtro: «Ningún cliente coincide con "Gil"» + «Quitar filtros».

**7. Errores: qué pasa y cómo se arregla.** Un mensaje para cada caso, con las palabras de la etiqueta del campo, junto al campo. Sin «por favor», «lo sentimos», «inválido» ni exclamaciones.
Mal: «¡Ups! Algo ha ido mal. Por favor, introduce un valor válido». Bien: «Escribe el email del cliente». «La fecha de fin tiene que ser posterior a la de inicio».

**8. Diálogos que borran o anulan.** Una pregunta concreta, la consecuencia a la vista y el verbo en el botón. Donde «Cancelar» se confunda con cancelar el objeto (una cita, un pedido), el botón de salida es «Volver».
Mal: «¿Estás seguro? Esta acción no se puede deshacer» [Cancelar] [Aceptar]. Bien: «¿Eliminar a Laura Gil? Se borran sus 3 citas futuras» [Volver] [Eliminar cliente].

**9. Avisos breves (toast): sustantivo y participio**, tres palabras como mucho, y «Deshacer» si se puede. Los errores no van en un aviso que desaparece: van junto al campo o en la pantalla.
Mal: «¡Genial! La factura se ha guardado correctamente». Bien: «Factura guardada · Deshacer».

**10. Tooltips solo en iconos y atajos**, sin información imprescindible, sin enlaces y sin repetir la etiqueta.
Mal: sobre «Guardar», «Haz clic para guardar los cambios». Bien: «Editar» sobre el icono del lápiz.

**11. Formularios.** Etiqueta corta y sin dos puntos. Texto de ayuda de una frase, sin punto final, y solo si aporta algo. El placeholder desaparece al escribir: no sirve de etiqueta ni de ejemplo imprescindible.
Mal: «Introduce aquí el correo de tu cliente:» con el placeholder «ejemplo@correo.com». Bien: «Email» y debajo «Se usa para enviar las facturas».

**12. Primeros pasos.** Una lista de cinco pasos como mucho, que se marquen solos al hacerse y se pueda ocultar. Un recorrido guiado, de tres pasos como mucho, con contador, «Siguiente» y «Listo».
Mal: siete pantallas de «¡Bienvenido a tu nuevo CRM!». Bien: «Primeros pasos · 2 de 4» y «Ocultar».

**13. Configuración: cada opción con su estado debajo.** Título impersonal, sin «gestionar» ni «configurar».
Mal: «Gestionar recordatorios» y «Configura aquí cuándo quieres enviarlos». Bien: «Recordatorios de cita» y debajo «24 h antes, por email».

**14. Correos y notificaciones.** El asunto se corta: lo concreto va delante. La primera frase dice qué hay que hacer y para cuándo. Un tema por mensaje.
Mal: «Novedades importantes sobre tu cuenta». Bien: «Factura F-2026-0142 vencida: 1.250,00 €».

**15. Números, fechas y moneda en es-ES.** El símbolo va detrás con un espacio de no separación: «1.250,00 €», «21 %». Meses y días en minúscula. Horas de 0 a 24: «14:30». Usa `Intl` con `es-ES`, pero ojo: con cuatro cifras no pone el punto («1234,50 €»); en columnas de importes pasa `useGrouping: "always"` para que todas las cifras se alineen igual.
Mal: «€1,250.00», «Noviembre 13», «2:30 PM». Bien: «1.250,00 €», «13 nov 2026», «14:30».

**16. Mayúscula solo en la primera palabra** de botones, menús y títulos, y sin punto final.
Mal: «Nueva Factura Recurrente.». Bien: «Nueva factura recurrente».

**17. Longitud.** Aviso breve, tres palabras. Botón, una o dos. Error, un título de tres o cuatro palabras y una o dos frases. No abrevies para que quepa: cambia el diseño.
Mal: «Generar y descargar el informe completo en PDF». Bien: «Descargar PDF».

## Glosario

| Usar | Evitar | Lo usan |
|---|---|---|
| Guardar; «Guardar cambios» al pie de una página larga de configuración; «Guardar como borrador» | Confirmar, Aceptar | Holded, Factorial, Notion, Stripe, Gmail |
| Cancelar; «Volver» cuando también se cancela el objeto | | Stripe, Microsoft |
| Eliminar; «Eliminar permanentemente» | Remover; «Borrar» salvo para vaciar algo («Borrar filtros») | Notion, Holded, Stripe, Gmail |
| Configuración; «Preferencias» para subsecciones | «Ajustes» como nombre del menú | Holded, Factorial, Sesame, Notion, Google |
| Añadir | Agregar (es de la versión latinoamericana) | Holded, Sesame, Factorial, Gmail, Stripe |
| Nueva factura, Nuevo cliente | Crear nuevo elemento | Holded, Revolut, Factorial |
| Inicio o Panel | Dashboard | Notion, Sesame |
| Informe, coste, vídeo, email | Reporte, costo, video | Microsoft; «email» en Holded, Sesame y Factorial |
| Archivar, Deshacer, Papelera | | Gmail, Factorial, Notion |

## Antes de dar una pantalla por buena

Lee en voz alta cada texto de la pantalla y pregúntate si una persona que trabaja con esa app ocho horas al día lo echaría de menos si lo quitas. Si no, quítalo. Si es una explicación que solo sirve para la demo, va en un bloque de texto de demo (`texto-demo.md`).

## Fuentes

- Microsoft, guía de estilo de español de España: https://aka.ms/spanish-spain-styleguide
- GOV.UK, escribir para interfaces: https://www.gov.uk/service-manual/design/writing-for-user-interfaces
- GOV.UK, mensajes de error: https://design-system.service.gov.uk/components/error-message/
- Atlassian, estados vacíos y descubrimiento de funcionalidades: https://atlassian.design/foundations/content/designing-messages/empty-state
- Shopify Polaris, voz y tono, avisos y primeros pasos: https://shopify.dev/docs/apps/design/content/voice-and-tone
- Mailchimp, voz y tono: https://styleguide.mailchimp.com/voice-and-tone/
- RAE, símbolos y fechas: https://www.rae.es/dpd/s%C3%ADmbolo

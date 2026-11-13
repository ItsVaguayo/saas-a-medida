# Referencias reales antes de diseñar o construir

Lo que se inventa sin mirar nada sale con el aspecto de siempre: tarjetas con degradado, cuatro cifras que no significan nada para el cliente y textos que suenan a folleto. Antes de diseñar una pantalla o modelar un módulo, mira cómo lo resuelven dos o tres productos reales que hagan lo mismo para un usuario parecido.

## Dónde buscar

1. **Lo que el cliente usa hoy.** Su programa actual, su Excel, su web. Es la referencia que mejor entiende y la que menos le cuesta dejar.
2. **Los productos líderes de su sector**, en el idioma del cliente cuando existan. Por ejemplo: facturación y contabilidad (Holded, Quipu), recursos humanos (Factorial, Sesame), citas (Doctolib, Calendly), CRM (Pipedrive, HubSpot), reservas (Booksy, Fresha), formación (Moodle, Teachable), tickets (Zendesk, Freshdesk).
3. **SaaS de código abierto de la misma categoría.** Sirven para el modelo de datos, los estados y las reglas, porque se puede leer su esquema: Cal.com (agendas y reservas), Twenty (CRM), Invoice Ninja (facturas y cobros), Odoo (casi todo), Chatwoot (bandeja de mensajes), Plane (tareas y proyectos), Moodle (formación).
4. **Galerías de pantallas reales** de productos publicados (ver `fase-5-mockups.md`).

Con el navegador, mira las páginas públicas, las capturas de sus centros de ayuda y sus vídeos de producto. Si algo exige cuenta, pide a la persona que entre ella; no crees cuentas.

## Qué se toma y qué no

Se toma: la estructura de la pantalla, qué campos aparecen y en qué orden, los estados por los que pasa cada cosa, cómo se ve una lista vacía, cuántos pasos tiene un recorrido, los valores por defecto y el vocabulario del sector.

No se toma: su marca, logos, ilustraciones, textos copiados literalmente ni nada que se reconozca como suyo.

## Dónde se apunta

En `docs/referencias.md` (plantilla en `assets/docs/`): producto, pantalla o módulo, enlace o captura y qué se toma. En la especificación, cada módulo lleva una línea «Referencias» que apunta ahí.

## Señales de diseño inventado

Si una pantalla tiene alguna de estas cosas sin que una referencia real lo justifique, revísala:

- Tarjetas de cifras arriba que no responden a ninguna pregunta del cliente.
- Degradados morados o azules en tarjetas y botones, efecto cristal, sombras grandes por todas partes.
- Saludos del tipo «Bienvenido de nuevo, Ana 👋» y emojis como iconos.
- Todo centrado y con mucho aire en una app de gestión que se usa ocho horas al día.
- Gráficas decorativas con datos que nadie va a mirar.
- Funcionalidades que nadie pidió y que no salen en la especificación.

## También en el backend

Las reglas de negocio salen del cliente (fase 1) o de cómo lo resuelve un producto real, y se apunta de dónde. Si no hay ninguna de las dos, es una duda para el cliente, no una regla que decides tú.

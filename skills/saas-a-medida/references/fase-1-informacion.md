# Fase 1. Información del cliente

Reúne todo lo que se sabe del cliente y saca pronto lo que cambia el alcance, el precio o la arquitectura. Lo demás (campos concretos, textos, orden de pantallas) se resuelve en la especificación.

## 1. Juntar lo que hay

Pide a la persona todo lo que exista: el cuestionario que rellenó el cliente, notas de llamadas, transcripciones, correos, el guion de la demo si la hubo, la web del cliente y ejemplos reales (un Excel, una captura del programa que usan, una factura, un parte). Un ejemplo real resuelve diez preguntas.

- Los originales van a la carpeta de documentos del cliente (campo `docs_cliente` del fichero de proyecto), no al repo.
- El resumen va a `docs/informacion-cliente.md` (plantilla en `assets/docs/`).
- Si hay grabaciones, transcríbelas en local si la persona tiene cómo; no las subas a servicios externos sin preguntar.

## 2. El negocio en sus palabras

Qué hacen, cómo trabajan hoy, qué les duele y qué quieren conseguir. Copia sus frases cuando digan algo importante, con la referencia de dónde salen (por ejemplo [P.4] para la pregunta 4 del cuestionario). Esas citas sirven después para el documento de alcance y para la demo.

## 3. Parte A: lo que cambia el alcance o el precio

Estas preguntas van primero. Cada una lleva el motivo, para saber qué hacer con una respuesta a medias.

1. **Integraciones.** ¿Con qué sistemas tiene que hablar la app (pasarelas de pago, ERP, programa de facturación, web, proveedores, Google, WhatsApp, correo)? ¿El cliente tiene acceso técnico (API, exportación, FTP) o solo entra por la web? Sin acceso técnico la integración no existe y el proceso sigue a mano. Es lo que más veces cambia un presupuesto.
2. **Datos que ya existen.** ¿De dónde salen hoy (Excel, otro programa, papel)? ¿Cuántos registros, en qué formato y con qué calidad? Migrar datos sucios cuesta más que construir la pantalla.
3. **Usuarios y roles.** ¿Qué tipos de persona entran y qué ve cada una? ¿Entra gente de fuera de la empresa (clientes finales, familias, proveedores)? Cada rol externo multiplica permisos, avisos y casos límite.
4. **Dinero.** ¿La app cobra, factura, gestiona suscripciones o solo apunta pagos hechos fuera? Cobrar online implica pasarela y conciliación. La facturación legal (en España, VeriFactu) queda fuera salvo que se pacte.
5. **Datos sensibles.** ¿Hay menores, salud, datos biométricos, ubicación o seguimiento de personas? Si sí, haz el triaje de privacidad de `legal.md`: puede hacer falta una evaluación de impacto antes de construir. Apunta el resultado en `docs/privacidad.md`.
6. **Avisos.** ¿Por qué canal se avisa a cada persona (correo, WhatsApp, SMS, notificación del móvil)? WhatsApp necesita plantillas aprobadas por Meta y cuesta por mensaje.
7. **Ficheros y vídeo.** ¿Se suben fotos, documentos o vídeos? ¿Cuántos y de qué tamaño? El almacenamiento y el vídeo tienen coste mensual.
8. **Móvil.** ¿Basta con una web que se use bien en el móvil o hace falta instalarla? ¿Tiene que funcionar sin conexión? Sin conexión es otro proyecto.
9. **IA dentro de la app.** ¿Alguna función decide, clasifica o genera con IA? Si sí, haz el triaje de IA de `legal.md` y presupuesta el coste por uso.
10. **Volumen.** ¿Cuántas personas a la vez en el momento de más carga? ¿Hay horas en las que una caída sale cara?

Pregunta también, con el menú, si ya hay un precio cerrado con el cliente. A menudo el precio se fija al vender, antes de esta fase. Si lo hay, el documento de alcance de la fase 3 dirá qué entra por ese precio; si no, servirá para fijarlo.

## 4. Parte B: detalle de construcción

Campos de cada ficha, estados por los que pasa cada cosa, informes que quieren ver, textos, quién puede borrar qué. Se pregunta, pero no bloquea el alcance.

## 5. Lo que falta

Cada pregunta sin respuesta va al panel de dudas para el cliente (`dudas-cliente.md`). Créalo con la primera duda. Si la respuesta es «no lo sé», trata ese punto como riesgo en la fase 3.

## 6. Segunda lectura: lo que no pidió

Cuando el cliente conteste, léelo otra vez fijándote en lo que cuenta de su negocio y no en la lista de funciones que marcó. De ahí salen las mejores propuestas:

- **Sus miedos.** Si teme perder clientes al principio, propón avisos tempranos de abandono.
- **Lo que vende.** Si vende resultados, propón la forma de medirlos y enseñarlos.
- **Lo que hoy hace a mano.** Cada Excel que menciona es una pantalla o un informe posible.
- **Sus quejas del sistema actual.** Dicen qué no debe pasar en el nuevo.

Déjalas como lista aparte en `docs/informacion-cliente.md`, cada una con qué resuelve y si es pequeña, mediana o grande. No entran en el alcance sin que lo decida la persona con el menú.

## Se cierra cuando

Todas las preguntas de la parte A tienen respuesta o están en el panel de dudas como riesgo. Actualiza la tabla «Estado».

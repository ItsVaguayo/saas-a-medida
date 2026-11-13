# Privacidad, IA y documentos legales (España y UE)

Lo que se prepara aquí son borradores y comprobaciones para que el proyecto no se construya mal. No es asesoramiento legal: los contratos y las políticas los revisa un abogado antes de firmarse o publicarse, y así se le dice a la persona.

## Quién es quién

- **El cliente es el responsable del tratamiento**: decide para qué y cómo se usan los datos de sus clientes, alumnos o empleados.
- **Quien desarrolla y mantiene la app es encargado del tratamiento** (art. 28 RGPD) en cuanto accede a datos reales: alojamiento, copias de seguridad, soporte, importaciones.
- **Los proveedores que usa la app** (servidor, correo transaccional, almacenamiento, servicios de IA) son subencargados: el cliente tiene que autorizarlos y van en una lista del contrato. Si alguno está fuera del Espacio Económico Europeo, hay transferencia internacional y hay que decir con qué garantía.

## Triaje de privacidad (fase 1)

Pregunta y apunta en `docs/privacidad.md`:

1. Qué datos personales y de quién: empleados, clientes finales, menores, pacientes.
2. Si hay categorías especiales (art. 9: salud, biométricos para identificar, origen, religión, vida sexual, afiliación sindical, genéticos) o datos penales (art. 10).
3. Si se puntúa, perfila o decide algo de forma automática sobre las personas.
4. Si se observa o vigila de forma sistemática: ubicación, actividad, cámaras.
5. Si es a gran escala.
6. Si hay personas vulnerables: menores, pacientes, empleados respecto a su empresa.
7. Si se combinan datos de fuentes distintas.
8. Si se usa tecnología nueva sobre las personas (IA, biometría).
9. Si algún proveedor está fuera del EEE.

Cómo se decide:

- **Evaluación de impacto (EIPD) obligatoria** en los tres casos del art. 35.3 RGPD: evaluación sistemática y exhaustiva de personas con decisiones automatizadas que les afectan de forma importante; categorías especiales o datos penales a gran escala; observación sistemática a gran escala de una zona de acceso público.
- **Lista de la AEPD (art. 35.4)**: si el tratamiento cumple dos o más de sus criterios, lo normal es que necesite EIPD.
- Si no se da nada de lo anterior, basta con dejar escrito el triaje y aplicar las medidas de diseño.

La EIPD la hace el cliente como responsable; nosotros aportamos la parte técnica. Lo que el triaje cambie en el diseño (guardar menos datos, cifrar, limitar quién ve qué, registrar accesos, borrar pasado un plazo) va a la especificación como reglas.

## Triaje de IA (Reglamento UE 2024/1689)

Si alguna función de la app decide, clasifica, puntúa o genera con IA, clasifícala y apúntalo en `docs/ia.md`:

| Nivel | Ejemplos | Qué implica |
|---|---|---|
| Prohibido (art. 5) | puntuación social, manipulación, reconocer emociones en el trabajo o en clase, categorizar personas por rasgos sensibles con biometría | no se construye |
| Alto riesgo (anexo III) | educación (admisión, evaluar el aprendizaje, asignar nivel, vigilar exámenes), empleo (seleccionar, evaluar, decidir ascensos o despidos), acceso a servicios esenciales (solvencia, seguros de vida o salud), biometría | obligaciones pesadas (gestión de riesgos, registros, supervisión humana, documentación técnica): se para y se decide con la persona y un abogado antes de seguir |
| Riesgo limitado (art. 50) | chatbots, textos o imágenes generados que se publican | avisar a la persona de que habla con una IA y marcar el contenido generado |
| Mínimo | sugerencias, clasificar correos, resúmenes internos | buenas prácticas y supervisión humana |

Las fechas en que cada obligación empieza a aplicarse han cambiado más de una vez: compruébalas en la fuente oficial antes de afirmar nada al cliente. El coste por uso de la IA va en el presupuesto.

## Documentos de producción (fase 9)

**Contrato de encargado del tratamiento (art. 28.3 RGPD).** Tiene que recoger: objeto, duración, naturaleza y finalidad; tipo de datos y categorías de interesados; que solo se trata con instrucciones documentadas del cliente; confidencialidad de quien accede; medidas de seguridad (art. 32); subencargados solo con autorización y la lista de los actuales; ayuda al cliente con los derechos de los interesados, las brechas y las EIPD; qué pasa con los datos al terminar (devolución o borrado); y la información y auditorías que demuestren que se cumple.

**Política de privacidad (arts. 13 y 14 RGPD).** Quién es el responsable y cómo contactarle; delegado de protección de datos si lo hay; finalidades y base jurídica de cada una; destinatarios (también los encargados, por categorías); transferencias fuera del EEE; plazos de conservación; los derechos (acceso, rectificación, supresión, oposición, limitación, portabilidad), cómo ejercerlos y el derecho a reclamar ante la AEPD; y si hay decisiones automatizadas. La AEPD recomienda darla por capas: un resumen breve y el texto completo enlazado.

**Aviso legal (art. 10 LSSI)**, si la app tiene parte pública: nombre o razón social, NIF, domicilio, correo y datos registrales del titular.

**Cookies (art. 22.2 LSSI).** Las técnicas y de sesión no necesitan consentimiento. Las demás (analítica, publicidad) sí, y rechazarlas tiene que ser tan fácil como aceptarlas (guía de cookies de la AEPD). Si la app solo usa la cookie de sesión, no hace falta banner: basta con decirlo en la política.

**Registro de actividades (art. 30).** Lo lleva el cliente; quien desarrolla, como encargado, lleva el suyo de los tratamientos que hace por cuenta de clientes.

**Brechas de seguridad (art. 33).** El responsable notifica a la AEPD en 72 horas; el encargado avisa al cliente sin dilación. Deja escrito en `docs/soporte.md` cómo se avisa.

**Condiciones de uso**, si entran usuarios de fuera de la empresa del cliente.

## Herramientas más completas, opcionales

- Los plugins `privacidad`, `proteccion-datos` y `gobernanza-ia` de `betobetico/claude-para-abogados` (Apache-2.0) hacen triajes, EIPD, revisión de encargos y registros con más detalle. Antes de usarlos piden su propia entrevista de configuración, y su autor avisa de que no están probados con casos reales. Se instalan con el grupo `legal` de `comprobar-skills.sh`.
- `legalcode-privacy-policy-drafter` (legalcode-md/skills) redacta políticas de privacidad. Su licencia no permite incluirla en otro producto, así que no viene en este plugin: si se quiere, la instala cada persona desde su repositorio.

## Fuentes

- RGPD: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- AEPD, lista de tratamientos que requieren EIPD (art. 35.4): https://www.aepd.es/documento/listas-dpia-es-35-4.pdf
- AEPD, guía para cumplir el deber de informar: https://www.aepd.es/guias/guia-modelo-clausula-informativa.pdf
- AEPD, guía sobre el uso de las cookies: https://www.aepd.es/guias/guia-cookies.pdf
- LSSI: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758
- Reglamento de IA: https://eur-lex.europa.eu/eli/reg/2024/1689/oj

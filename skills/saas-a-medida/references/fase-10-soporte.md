# Fase 10. Soporte

La app está en producción. A partir de aquí llegan errores, peticiones de cambio y mantenimiento.

## Lo que pida el cliente

Clasifica cada petición y pregunta con el menú qué hacer cuando no sea un error claro:

| Tipo | Qué es | Cómo se trabaja |
|---|---|---|
| Error | Algo que la especificación dice y no hace | Rama `arreglo/<tema>` desde `main`, PR a `main` con test que lo reproduzca, y después se lleva a `develop` |
| Cambio pequeño | Un ajuste dentro de un módulo que ya existe | Primero en la especificación, después rama desde `develop` como un módulo |
| Funcionalidad nueva | Algo que no estaba en el alcance | Primero se decide si entra y si se cobra (eso lo decide quien vende); después pasa por las fases 4 a 7 en pequeño |

Todo se apunta en `docs/soporte.md` (plantilla en `assets/docs/`): fecha, qué pasó o qué se pidió, qué se hizo y en qué versión salió.

Si un error llegó a producción por algo que el proceso debería haber parado (un caso límite que no estaba en la especificación, una revisión que no lo vio, un paso de la lista que se saltó), apúntalo también en `docs/lecciones.md` (`lecciones.md`).

## Mantenimiento

Una vez al mes, o cuando la persona lo pida:

- Dependencias: `npm outdated` y `npm audit --omit=dev`. Las actualizaciones grandes van en su propia rama con los tests en verde.
- Copias de seguridad: comprueba que la de anoche existe en el servidor y en el destino externo, y restaura una en otra instancia para ver que sirve.
- Registros de errores del servidor: lo que se repite se convierte en un error a arreglar.
- Que el certificado HTTPS se renueva solo.

## Qué cubre el soporte

Lo que cubre está escrito en el contrato o, si no, lo deja escrito la persona en `docs/soporte.md`. Si una petición queda fuera, se dice antes de hacerla, no después.

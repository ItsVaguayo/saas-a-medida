# Componentes SaaS

31 componentes de React para apps de gestión a medida. Complementan a `~/ECS/kit-saas` (tabla, diálogo,
menú, pestañas, avisos…). Los dos usan los mismos nombres de tokens, así que un solo `tema.css` viste a ambos.

Seis temas se tocan con los «apartados» del kit (`Marco`, `Cifras`, `Grafico`, `Actividad`, `Estados`,
`PrimerosPasos`), que se escribieron a la vez en otra sesión. Aquí van más desarrollados (barra plegable,
gráficos de barras, área y anillo con teclado, guía con pasos desplegables); en un proyecto se elige uno de los dos.

```bash
npm install
npm install
npm run dev      # catálogo en http://localhost:5191
npm test         # 61 pruebas
npm run build
```

## Los 31

| | Componente | Para qué |
|---|---|---|
| **Estructura** | | |
| 01 | `BarraLateral` | Navegación con grupos, contadores y plegado |
| 02 | `CabeceraPagina` · `Migas` | Ruta, título con estado y acciones |
| 03 | `SelectorEspacio` | Cambiar de empresa, sede o cuenta |
| 04 | `BarraAcciones` | Acciones sobre varias filas marcadas |
| 05 | `PanelesDivididos` | Lista y detalle con raya arrastrable |
| 06 | `Arbol` | Carpetas y categorías anidadas |
| 31 | `BarraCristal` | Navegación translúcida sobre una foto o un fondo oscuro, con buscador y ramas |
| **Datos** | | |
| 07 | `TarjetaMetrica` · `Metricas` | Cifra, variación y tendencia |
| 08 | `Minigrafico` | Tendencia sin ejes |
| 09 | `GraficoBarras` | Comparar periodos, con series apiladas |
| 10 | `GraficoArea` | Evolución en el tiempo |
| 11 | `Anillo` | Reparto de un total |
| 12 | `MedidorUso` · `Medidores` | Consumo frente al límite del plan |
| 13 | `MapaCalor` | Actividad día a día |
| 14 | `ListaClasificada` | Los que más, con su peso |
| 15 | `LineaTiempo` | Historial de un registro |
| **Contenido** | | |
| 16 | `ListaDescriptiva` | Ficha de un registro, con copiar |
| 17 | `EstadoVacio` | Lista sin nada: motivo y salida |
| 18 | `GrupoAvatares` | Quién participa |
| 19 | `Banner` | Aviso que se queda en la página |
| **Formularios** | | |
| 20 | `CodigoVerificacion` | Código de SMS o correo |
| 21 | `CampoClave` | Contraseña con medidor |
| 22 | `Deslizador` | Una cantidad o un tramo |
| 23 | `CampoNumero` | Cantidades de uno en uno |
| 24 | `TarjetasOpcion` | Elegir entre opciones con explicación |
| 25 | `CampoSecreto` | Claves de API: ver, copiar, regenerar |
| 26 | `MatrizPermisos` | Permisos por rol |
| **Producto** | | |
| 27 | `GuiaInicio` | Primeros pasos de una cuenta |
| 28 | `CentroNotificaciones` | Campana y lista de lo no leído |
| 29 | `TablaPrecios` | Planes con pago mensual o anual |
| 30 | `ZonaPeligro` · `ZonasPeligro` | Acciones sin vuelta atrás |

Cada fichero de `src/componentes/` abre con un comentario que dice para qué sirve, en qué productos
se basa y qué recibe cada propiedad. El catálogo enseña el código de uso de cada uno.

## Llevarlo a un proyecto

Copia `src/tema.css`, `src/base.css` y de `src/componentes/` lo que haga falta (cada componente trae su
`.jsx` y su `.css`; todos dependen de `interno.js`, `formato.js` y `base.jsx`, y los gráficos de
`graficos.js`). Dependencias: `react` 19 y `lucide-react`.

```jsx
import './tema.css';
import './base.css';
import { TarjetaMetrica, moneda } from './componentes';

<TarjetaMetrica titulo="Ingresos" valor={42800} formato={moneda} variacion={0.124} periodo="frente a octubre" />
```

## Personalizar

Hay cuatro niveles, del más general al más concreto.

**1. El tema** (`src/tema.css`). Ningún componente escribe un color ni una medida suelta.

```css
:root {
  --tono: 150;          /* gira el acento, los grises y los colores de los gráficos */
  --radio: 12px;        /* forma de todo */
  --alto-control: 40px; /* densidad de botones y campos */
}
```

Para una marca con color exacto se pisan `--acento`, `--acento-fuerte` y `--acento-suave`.
`data-tema="oscuro"` y `data-densidad="compacta"` en `<html>` cambian tema y densidad.
Los gráficos usan `--serie-1` a `--serie-6`.

**2. Variables de cada componente**, declaradas al principio de su CSS: `--lateral-ancho`,
`--anillo-lado`, `--calor-celda`, `--codigo-ancho`, `--arbol-sangria`, `--permisos-rol`…

```css
.mi-panel .c-lateral { --lateral-ancho: 280px; }
```

**3. Propiedades.** Todos aceptan `className`. Los que pintan cifras aceptan `formato` (otra moneda,
otro idioma). Los que traen textos propios aceptan `textos` para cambiarlos o traducirlos:

```jsx
<MedidorUso titulo="Seats" usado={7} limite={10} textos={{ de: 'of', lleno: 'Limit reached' }} />
```

Los que guardan estado funcionan solos (`valorInicial`) o controlados (`valor` + `alCambiar`).

**4. El CSS.** Clases con prefijo `c-` y nombres legibles (`.c-metrica__valor`), sin estilos en línea
salvo las variables que mueven las animaciones.

## Criterios

- **Movimiento**: dos curvas y tres duraciones del tema. Las animaciones son transiciones que se pueden
  interrumpir a mitad; las cifras siguen desde donde iban. Con `prefers-reduced-motion` todo ocurre de golpe.
- **Teclado y lector de pantalla**: flechas en árbol, deslizador, gráficos, mapa de calor y paneles;
  los gráficos llevan sus datos en una tabla oculta; el estado nunca se dice solo con color.
- **Móvil**: zonas táctiles de 44 px, campos a 16 px para que iOS no amplíe, sin desbordes a 390 px.
- **Textos**: los de la skill `saas-a-medida` (`references/textos-interfaz.md`).

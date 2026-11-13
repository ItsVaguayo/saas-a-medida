// Texto de demo: explica cómo funciona algo mientras se enseña la app al cliente.
// No forma parte del producto. Antes de producción, scripts/comprobar-texto-demo.sh tiene que salir limpio.
// Importa también texto-demo.css una vez en la app.
// Para ocultarlos sin quitarlos (por ejemplo, para hacer capturas), arranca con VITE_OCULTAR_TEXTO_DEMO=true.

const ocultos = typeof import.meta !== 'undefined' && import.meta.env?.VITE_OCULTAR_TEXTO_DEMO === 'true';

export function TextoDemo({ titulo, children }) {
  if (ocultos) return null;
  return (
    <aside className="texto-demo" data-texto-demo role="note" aria-label="Texto de demo">
      <span className="texto-demo__etiqueta">Texto de demo</span>
      {titulo ? <strong className="texto-demo__titulo">{titulo}</strong> : null}
      <div className="texto-demo__cuerpo">{children}</div>
    </aside>
  );
}

// Aviso fijo en una esquina mientras haya textos de demo. Va una sola vez, en el layout principal.
export function AvisoModoDemo() {
  if (ocultos) return null;
  return (
    <div className="aviso-modo-demo" data-texto-demo role="status">
      Demo · los recuadros discontinuos explican cómo funciona y no estarán en la versión final
    </div>
  );
}

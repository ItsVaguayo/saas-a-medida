// Una demo por componente. Los textos de «uso» son texto de demo: explican el componente a quien
// lo va a montar y no deben acabar en ninguna pantalla de producción.
import {
  Archive, Banknote, BarChart3, Building2, Calendar, ChevronDown, CreditCard, FileText, Folder, HardDrive, Layers,
  LayoutDashboard, Mail, MessageSquare, Moon, Send, Settings, Sun, Tag, Trash2, User, UserPlus, Users, Wallet, Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Anillo, Arbol, Banner, BarraAcciones, BarraCristal, BarraLateral, Boton, CabeceraPagina, CampoClave, CampoNumero, CampoSecreto,
  CentroNotificaciones, CodigoVerificacion, Deslizador, EstadoVacio, Etiqueta, GraficoArea, GraficoBarras, GrupoAvatares,
  GuiaInicio, LineaTiempo, ListaClasificada, ListaDescriptiva, MapaCalor, MatrizPermisos, MedidorUso, Medidores, Metricas,
  Minigrafico, PanelesDivididos, SelectorEspacio, TablaPrecios, TarjetaMetrica, TarjetasOpcion, ZonaPeligro, ZonasPeligro,
  moneda, numero,
} from '../componentes/index.js';
import {
  ARBOL, ESPACIOS, GRUPOS_PERMISOS, MUCHOS_ESPACIOS, ORIGENES, PERMISOS_INICIALES, PERSONAS, PLANES, REPARTO, ROLES,
  VENTAS_MES, VISITAS_DIA, actividadDiaria, azar,
} from './datos.js';

const euros = (n) => moneda(n, { decimales: 0 });
const espera = (ms) => new Promise((hecho) => { setTimeout(hecho, ms); });
const hace = (minutos) => new Date(Date.now() - minutos * 60_000);

/* ── Estructura ─────────────────────────────────────── */

const NAVEGACION = [
  { elementos: [
    { id: 'inicio', texto: 'Inicio', icono: LayoutDashboard },
    { id: 'clientes', texto: 'Clientes', icono: Users },
    { id: 'agenda', texto: 'Agenda', icono: Calendar, contador: 3 },
  ] },
  { titulo: 'Facturación', elementos: [
    { id: 'facturas', texto: 'Facturas', icono: FileText, contador: 12 },
    { id: 'cobros', texto: 'Cobros', icono: CreditCard },
  ] },
  { titulo: 'Cuenta', elementos: [{ id: 'config', texto: 'Configuración', icono: Settings }] },
];

function DemoLateral() {
  const [activo, setActivo] = useState('clientes');
  const [plegada, setPlegada] = useState(false);
  const [espacio, setEspacio] = useState('norte');
  const nombre = NAVEGACION.flatMap((g) => g.elementos).find((e) => e.id === activo).texto;
  return (
    <div className="demo-marco" style={{ height: 480 }}>
      <BarraLateral
        grupos={NAVEGACION}
        activo={activo}
        alElegir={setActivo}
        plegada={plegada}
        alPlegar={setPlegada}
        cabecera={<SelectorEspacio espacios={ESPACIOS} valor={espacio} alCambiar={setEspacio} compacto={plegada} />}
      />
      <div className="demo-marco__contenido"><CabeceraPagina titulo={nombre} nivel={3} /></div>
    </div>
  );
}

const CRISTAL = [
  { titulo: 'Principal', elementos: [
    { id: 'panel', texto: 'Panel', icono: LayoutDashboard },
    { id: 'actividad', texto: 'Actividad', icono: Zap, contador: 12 },
    { id: 'cartera', texto: 'Cartera', icono: Wallet },
    { id: 'agenda', texto: 'Agenda', icono: Calendar, aviso: true },
  ] },
  { titulo: 'Espacio', elementos: [
    { id: 'mensajes', texto: 'Mensajes', icono: MessageSquare, contador: 3, urgente: true },
    { id: 'proyectos', texto: 'Proyectos', icono: Layers, hijos: [
      { id: 'web', texto: 'Rediseño de la web', color: 'oklch(0.72 0.13 175)' },
      { id: 'app', texto: 'App móvil', color: 'oklch(0.76 0.14 55)' },
      { id: 'marca', texto: 'Manual de marca', color: 'oklch(0.68 0.17 295)' },
    ] },
    { id: 'informes', texto: 'Informes', icono: BarChart3 },
    { id: 'ajustes', texto: 'Ajustes', icono: Settings },
  ] },
];

function DemoCristal() {
  const [activo, setActivo] = useState('panel');
  const [plegada, setPlegada] = useState(false);
  const [noche, setNoche] = useState(false);
  return (
    <div className="demo-cristal" data-noche={noche || undefined}>
      <BarraCristal
        grupos={CRISTAL}
        activo={activo}
        alElegir={setActivo}
        plegada={plegada}
        alPlegar={setPlegada}
        logo={<ChevronDown aria-hidden="true" />}
        nombre="Vertix"
        detalle="Espacio de finanzas"
        ajustes={[{ id: 'noche', texto: 'Modo noche', icono: noche ? Moon : Sun, activo: noche, alCambiar: setNoche }]}
        usuario={{ nombre: 'Álex Morgan', detalle: 'alex@vertix.io', enLinea: true }}
      />
      <p className="demo-nota demo-cristal__nota"><kbd>⌘K</kbd> busca · <kbd>[</kbd> pliega · fotos de demo</p>
    </div>
  );
}

function DemoCabecera() {
  return (
    <CabeceraPagina
      nivel={3}
      migas={[{ texto: 'Inicio' }, { texto: 'Facturación' }, { texto: 'Facturas' }, { texto: '2026' }, { texto: 'F-2026-0142' }]}
      titulo="Factura F-2026-0142"
      estado={<Etiqueta tono="atencion">Pendiente de cobro</Etiqueta>}
      acciones={<><Boton icono={Mail}>Enviar</Boton><Boton variante="principal" icono={Banknote}>Registrar cobro</Boton></>}
    />
  );
}

function DemoEspacio() {
  const [a, setA] = useState('norte');
  const [b, setB] = useState('sierra');
  return (
    <div className="demo-fila">
      <div style={{ width: 260 }}><SelectorEspacio espacios={ESPACIOS} valor={a} alCambiar={setA} alCrear={() => {}} /></div>
      <div style={{ width: 260 }}><SelectorEspacio espacios={MUCHOS_ESPACIOS} valor={b} alCambiar={setB} /></div>
    </div>
  );
}

const FILAS = ['Laura Gil', 'Pablo Mena', 'Nuria Vidal', 'Óscar Peña', 'Elena Cano'];
function DemoLote() {
  const [marcadas, setMarcadas] = useState(['Laura Gil', 'Nuria Vidal']);
  const alternar = (f) => setMarcadas((m) => (m.includes(f) ? m.filter((x) => x !== f) : [...m, f]));
  return (
    <div className="demo-lote">
      <ul className="demo-lista">
        {FILAS.map((f) => (
          <li key={f}><label><input type="checkbox" className="c-casilla" checked={marcadas.includes(f)} onChange={() => alternar(f)} />{f}</label></li>
        ))}
      </ul>
      <BarraAcciones
        flotante={false}
        cantidad={marcadas.length}
        alLimpiar={() => setMarcadas([])}
        acciones={[
          { texto: 'Etiquetar', icono: Tag, alPulsar: () => {} },
          { texto: 'Archivar', icono: Archive, alPulsar: () => setMarcadas([]) },
          { texto: 'Eliminar', icono: Trash2, peligro: true, alPulsar: () => setMarcadas([]) },
        ]}
      />
    </div>
  );
}

function DemoPaneles() {
  const [elegida, setElegida] = useState(FILAS[0]);
  return (
    <div className="demo-marco" style={{ height: 280 }}>
      <PanelesDivididos
        tamanoInicial={36}
        minimo={24}
        maximo={60}
        primero={(
          <ul className="demo-lista demo-lista--pulsable">
            {FILAS.map((f) => <li key={f}><button type="button" aria-pressed={f === elegida} onClick={() => setElegida(f)}>{f}</button></li>)}
          </ul>
        )}
        segundo={(
          <div className="demo-marco__contenido">
            <ListaDescriptiva elementos={[{ termino: 'Cliente', valor: elegida }, { termino: 'Alta', valor: '3 mar 2025' }, { termino: 'Última cita', valor: '12 nov 2026' }]} />
          </div>
        )}
      />
    </div>
  );
}

function DemoArbol() {
  const conIconos = (nodos) => nodos.map((n) => ({ ...n, icono: n.hijos ? Folder : FileText, hijos: n.hijos && conIconos(n.hijos) }));
  const nodos = useMemo(() => conIconos(ARBOL), []);
  return <div style={{ maxWidth: 320 }}><Arbol etiqueta="Carpetas" nodos={nodos} abiertosIniciales={['clientes', 'documentos']} seleccionadoInicial="activos" /></div>;
}

/* ── Datos ──────────────────────────────────────────── */

function DemoMetricas() {
  const [vuelta, setVuelta] = useState(0);
  const cifras = useMemo(() => {
    const r = azar(40 + vuelta);
    const serie = (base) => Array.from({ length: 14 }, (_, i) => base + i * base * 0.03 + r() * base * 0.25);
    return [
      { titulo: 'Ingresos', valor: 38000 + r() * 12000, formato: euros, variacion: 0.05 + r() * 0.15, periodo: 'frente a octubre', serie: serie(900), icono: Banknote },
      { titulo: 'Clientes activos', valor: 1100 + r() * 300, variacion: 0.02 + r() * 0.05, periodo: 'frente a octubre', serie: serie(40), icono: Users },
      { titulo: 'Bajas', valor: 10 + r() * 25, variacion: -(0.05 + r() * 0.2), invertida: true, periodo: 'frente a octubre', serie: serie(6).reverse(), icono: UserPlus },
      { titulo: 'Facturas vencidas', valor: 4 + r() * 12, variacion: 0.1 + r() * 0.3, invertida: true, periodo: 'frente a octubre', serie: serie(3), icono: FileText },
    ];
  }, [vuelta]);
  return (
    <div className="demo-pila">
      <Metricas>{cifras.map((c) => <TarjetaMetrica key={c.titulo} {...c} />)}</Metricas>
      <div><Boton tamano="chico" onClick={() => setVuelta(vuelta + 1)}>Cambiar cifras</Boton></div>
    </div>
  );
}

function DemoMini() {
  const r = azar(5);
  const sube = Array.from({ length: 16 }, (_, i) => 20 + i * 2 + r() * 14);
  const baja = [...sube].reverse();
  return (
    <div className="demo-fila demo-fila--centrada">
      <Minigrafico datos={sube} />
      <Minigrafico datos={baja} relleno={false} style={{ '--color': 'var(--mal)' }} />
      <Minigrafico datos={sube.slice(0, 12)} tipo="barras" ancho={96} />
      <Minigrafico datos={baja} ancho={200} alto={48} style={{ '--color': 'var(--bien)' }} />
    </div>
  );
}

const SERIES_VENTAS = [{ clave: 'suscripciones', nombre: 'Suscripciones' }, { clave: 'servicios', nombre: 'Servicios' }];
const SERIES_VISITAS = [{ clave: 'visitas', nombre: 'Visitas' }, { clave: 'altas', nombre: 'Altas' }];

function DemoAnillo() {
  return <Anillo datos={REPARTO} formato={euros} titulo="Ingresos" />;
}

function DemoUso() {
  return (
    <Medidores>
      <MedidorUso titulo="Usuarios" icono={Users} usado={7} limite={10} />
      <MedidorUso titulo="Almacenamiento" icono={HardDrive} usado={43} limite={50} formato={(n) => `${numero(n)} GB`} accion={<Boton tamano="chico">Ampliar</Boton>} />
      <MedidorUso titulo="Envíos de WhatsApp" icono={Send} usado={2000} limite={2000} accion={<Boton tamano="chico" variante="principal">Cambiar de plan</Boton>} />
    </Medidores>
  );
}

function DemoCalor() {
  const datos = useMemo(() => actividadDiaria(), []);
  return <MapaCalor datos={datos} semanas={26} unidad={['cita', 'citas']} />;
}

function DemoTiempo() {
  const [eventos, setEventos] = useState([
    { id: 4, autor: 'Marta Ruiz', titulo: 'registró un cobro de 1.250,00 €', fecha: hace(12), icono: Banknote, tono: 'bien' },
    { id: 3, autor: 'Íker Soto', titulo: 'envió la factura F-2026-0142', fecha: hace(95), icono: Mail, tono: 'acento' },
    { id: 2, autor: 'Laura Gil', titulo: 'dejó una nota', detalle: 'Prefiere que la llamen por la tarde. Tiene pendiente traer el justificante.', fecha: hace(60 * 26), icono: MessageSquare },
    { id: 1, titulo: 'Cliente dado de alta', fecha: hace(60 * 29) },
  ]);
  const anadir = () => setEventos((e) => [{ id: Date.now(), autor: 'Pablo Mena', titulo: 'reprogramó la cita al jueves', fecha: new Date(), icono: Calendar, tono: 'atencion' }, ...e]);
  return (
    <div className="demo-pila" style={{ maxWidth: 520 }}>
      <div><Boton tamano="chico" onClick={anadir}>Añadir un evento</Boton></div>
      <LineaTiempo eventos={eventos} alCargarMas={() => {}} />
    </div>
  );
}

/* ── Contenido ──────────────────────────────────────── */

function DemoDescriptiva() {
  return (
    <ListaDescriptiva
      columnas={2}
      elementos={[
        { termino: 'Cliente', valor: 'Clínica Norte, S.L.' },
        { termino: 'NIF', valor: 'B12345678', copiar: true, mono: true },
        { termino: 'Email', valor: 'administracion@clinicanorte.example', copiar: true },
        { termino: 'IBAN', valor: 'ES91 2100 0418 4502 0005 1332', copiar: 'ES9121000418450200051332', mono: true },
        { termino: 'Importe', valor: '1.250,00 €' },
        { termino: 'Vencimiento', valor: '30 nov 2026' },
        { termino: 'Estado', valor: <Etiqueta tono="atencion">Pendiente de cobro</Etiqueta> },
        { termino: 'Pedido', valor: null },
      ]}
    />
  );
}

function DemoVacio() {
  return (
    <div className="demo-rejilla-2">
      <EstadoVacio variante="tarjeta" icono={Users} titulo="Aún no hay clientes" detalle="Añade el primero o importa la lista desde Excel" accion={<Boton variante="principal">Añadir cliente</Boton>} accionSecundaria={<Boton variante="discreto">Importar</Boton>} />
      <EstadoVacio variante="tarjeta" titulo={'Ningún cliente coincide con "Gil"'} accion={<Boton>Quitar filtros</Boton>} />
    </div>
  );
}

function DemoAvatares() {
  return (
    <div className="demo-fila demo-fila--centrada">
      <GrupoAvatares personas={PERSONAS} />
      <GrupoAvatares personas={PERSONAS.slice(0, 3)} lado={24} />
      <GrupoAvatares personas={PERSONAS} maximo={5} lado={40} alPulsarResto={() => {}} />
    </div>
  );
}

function DemoBanner() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="demo-pila">
      <Banner tono="info" titulo="La prueba termina en 5 días" accion={<Boton tamano="chico" variante="principal">Elegir plan</Boton>} visible={visible} alCerrar={() => setVisible(false)}>
        Después la cuenta pasa al plan Inicial y se conservan todos los datos
      </Banner>
      <Banner tono="atencion" titulo="Mantenimiento el sábado de 6:00 a 7:00">La app no estará disponible durante esa hora</Banner>
      <Banner tono="mal" titulo="El último pago ha fallado" accion={<Boton tamano="chico">Actualizar tarjeta</Boton>}>La tarjeta terminada en 4242 fue rechazada el 12 nov</Banner>
      <Banner tono="bien" titulo="Dominio verificado" />
      {!visible && <div><Boton tamano="chico" variante="discreto" onClick={() => setVisible(true)}>Volver a mostrar el primero</Boton></div>}
    </div>
  );
}

/* ── Formularios ────────────────────────────────────── */

function DemoCodigo() {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState(null);
  return (
    <div className="demo-pila">
      <CodigoVerificacion
        valor={codigo}
        alCambiar={(c) => { setCodigo(c); setEstado(null); }}
        alCompletar={(c) => setEstado(c === '482913' ? 'bien' : 'mal')}
        error={estado === 'mal' ? 'El código no coincide. Revisa el último mensaje' : undefined}
      />
      {estado === 'bien' && <Etiqueta tono="bien">Código correcto</Etiqueta>}
      <p className="demo-nota">Texto de demo: el código válido es 482913. Prueba a pegarlo.</p>
    </div>
  );
}

function DemoClave() {
  return <div style={{ maxWidth: 420 }}><CampoClave etiqueta="Contraseña nueva" /></div>;
}

function DemoDeslizador() {
  const [usuarios, setUsuarios] = useState(25);
  const [precio, setPrecio] = useState([200, 650]);
  return (
    <div className="demo-pila" style={{ maxWidth: 460, gap: 28 }}>
      <div className="demo-pila">
        <span className="demo-etiqueta">Usuarios · <b>{usuarios}</b></span>
        <Deslizador etiqueta="Usuarios" valor={usuarios} alCambiar={setUsuarios} min={0} max={100} paso={5} marcas={[0, 25, 50, 75, 100]} />
      </div>
      <div className="demo-pila">
        <span className="demo-etiqueta">Importe · <b>{euros(precio[0])} a {euros(precio[1])}</b></span>
        <Deslizador etiqueta="Importe" valor={precio} alCambiar={setPrecio} min={0} max={1000} paso={10} formato={euros} />
      </div>
    </div>
  );
}

function DemoNumero() {
  const [licencias, setLicencias] = useState(5);
  return (
    <div className="demo-fila demo-fila--final">
      <CampoNumero etiqueta="Licencias" valor={licencias} alCambiar={setLicencias} min={1} max={50} sufijo={licencias === 1 ? 'usuario' : 'usuarios'} ayuda={`${euros(licencias * 12)} al mes`} />
      <CampoNumero etiqueta="Aviso previo" valorInicial={24} min={0} max={72} paso={12} sufijo="h" />
      <CampoNumero etiqueta="Descuento" valorInicial={7.5} min={0} max={100} paso={0.5} sufijo="%" />
    </div>
  );
}

function DemoOpciones() {
  return (
    <div className="demo-pila" style={{ gap: 24 }}>
      <TarjetasOpcion
        etiqueta="Tipo de cuenta"
        valorInicial="empresa"
        opciones={[
          { valor: 'autonomo', titulo: 'Autónomo', detalle: 'Una persona, un NIF', icono: User },
          { valor: 'empresa', titulo: 'Empresa', detalle: 'Varias personas y permisos por rol', icono: Building2 },
          { valor: 'gestoria', titulo: 'Gestoría', detalle: 'Varias empresas desde una cuenta', icono: Folder, deshabilitada: true },
        ]}
      />
      <TarjetasOpcion
        etiqueta="Avisos al cliente"
        multiple
        columnas={2}
        valorInicial={['email']}
        opciones={[
          { valor: 'email', titulo: 'Email', detalle: '24 h antes de la cita', extra: 'Incluido' },
          { valor: 'whatsapp', titulo: 'WhatsApp', detalle: '2 h antes de la cita', extra: '0,04 € por envío' },
        ]}
      />
    </div>
  );
}

function DemoSecreto() {
  const clave = () => `sk_demo_${Array.from({ length: 28 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('')}`;
  const [valor, setValor] = useState('sk_demo_h7k2m9qx4rw8tn3vz6pc5jd2ybf4');
  return (
    <div style={{ maxWidth: 480 }}>
      <CampoSecreto etiqueta="Clave secreta" valor={valor} detalle="Creada el 3 nov · Último uso hace 2 horas" alRegenerar={async () => { await espera(900); setValor(clave()); }} />
    </div>
  );
}

function DemoPermisos() {
  const [valor, setValor] = useState(PERMISOS_INICIALES);
  return <MatrizPermisos roles={ROLES} grupos={GRUPOS_PERMISOS} valor={valor} alCambiar={setValor} bloqueados={{ propietario: true }} />;
}

/* ── Producto ───────────────────────────────────────── */

function DemoGuia() {
  const [hechos, setHechos] = useState(['datos']);
  const [oculta, setOculta] = useState(false);
  const hacer = (id) => () => setHechos((h) => [...h, id]);
  if (oculta) return <Boton tamano="chico" onClick={() => { setOculta(false); setHechos(['datos']); }}>Volver a mostrar la guía</Boton>;
  const pasos = [
    { id: 'datos', titulo: 'Completar los datos del negocio', detalle: 'Nombre, NIF y dirección: salen en las facturas' },
    { id: 'cliente', titulo: 'Añadir el primer cliente', detalle: 'Uno a uno o importando la lista desde Excel', accion: { texto: 'Añadir cliente', alPulsar: hacer('cliente') } },
    { id: 'factura', titulo: 'Emitir una factura', detalle: 'Con el logo y la numeración que ya uses', accion: { texto: 'Nueva factura', alPulsar: hacer('factura') } },
    { id: 'equipo', titulo: 'Invitar al equipo', detalle: 'Cada persona entra con su email y su rol', accion: { texto: 'Invitar', alPulsar: hacer('equipo') }, omitir: { texto: 'Trabajo sin equipo', alPulsar: hacer('equipo') } },
  ].map((p) => ({ ...p, hecho: hechos.includes(p.id) }));
  return <div style={{ maxWidth: 520 }}><GuiaInicio pasos={pasos} alOcultar={() => setOculta(true)} /></div>;
}

function DemoNotificaciones() {
  const [lista, setLista] = useState([
    { id: 1, autor: 'Marta Ruiz', titulo: 'te asignó la factura F-2026-0142', fecha: hace(4), leida: false },
    { id: 2, titulo: 'Cobro recibido: 1.250,00 €', detalle: 'Clínica Norte, S.L. · transferencia', fecha: hace(52), leida: false, icono: Banknote },
    { id: 3, autor: 'Íker Soto', titulo: 'comentó en Laura Gil', detalle: 'Prefiere que la llamen por la tarde. Tiene pendiente traer el justificante de la mutua.', fecha: hace(60 * 5), leida: false },
    { id: 4, titulo: 'Copia diaria completada', fecha: hace(60 * 20), leida: true, icono: HardDrive },
    { id: 5, autor: 'Nuria Vidal', titulo: 'aceptó la invitación', fecha: hace(60 * 50), leida: true },
  ]);
  const leer = (id) => setLista((l) => l.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  const nueva = () => setLista((l) => [{ id: Date.now(), autor: 'Pablo Mena', titulo: 'reprogramó una cita', fecha: new Date(), leida: false }, ...l]);
  return (
    <div className="demo-fila demo-fila--centrada" style={{ minHeight: 60 }}>
      <CentroNotificaciones notificaciones={lista} alLeer={leer} alLeerTodas={() => setLista((l) => l.map((n) => ({ ...n, leida: true })))} alinear="inicio" pie={<a href="#28">Preferencias de aviso</a>} />
      <Boton tamano="chico" onClick={nueva}>Simular una nueva</Boton>
    </div>
  );
}

function DemoPrecios() {
  const [actual, setActual] = useState('inicial');
  return <TablaPrecios planes={PLANES} ahorro="2 meses gratis" actual={actual} alElegir={setActual} />;
}

function DemoPeligro() {
  const [archivado, setArchivado] = useState(false);
  return (
    <ZonasPeligro>
      <ZonaPeligro
        titulo={archivado ? 'Espacio archivado' : 'Archivar el espacio'}
        detalle="Deja de aparecer en el selector. Se puede recuperar durante 30 días"
        accion="Archivar espacio"
        pregunta="¿Archivar Clínica Norte?"
        consecuencia="Las 12 personas del equipo dejan de tener acceso hoy."
        alConfirmar={async () => { await espera(700); setArchivado(true); }}
      />
      <ZonaPeligro
        titulo="Eliminar el espacio"
        detalle="Se borran los clientes, las facturas y los documentos. No se puede deshacer"
        accion="Eliminar espacio"
        pregunta="¿Eliminar Clínica Norte?"
        consecuencia="Se borran 128 clientes, 342 facturas y 1,2 GB de documentos."
        frase="Clínica Norte"
        alConfirmar={async () => { await espera(900); throw new Error('Texto de demo: aquí la app borraría el espacio.'); }}
      />
    </ZonasPeligro>
  );
}

/* ── Índice ─────────────────────────────────────────── */

export const BLOQUES = [
  { titulo: 'Estructura', demos: [
    { n: '01', nombre: 'BarraLateral', uso: 'Navegación principal con grupos, contadores y plegado.', Demo: DemoLateral,
      codigo: `<BarraLateral grupos={grupos} activo={ruta} alElegir={ir}\n  plegada={plegada} alPlegar={guardarPreferencia}\n  cabecera={<SelectorEspacio … />} />` },
    { n: '02', nombre: 'CabeceraPagina', uso: 'Ruta, título con su estado y acciones de la pantalla.', Demo: DemoCabecera,
      codigo: `<CabeceraPagina titulo="Clientes" recuento={128}\n  migas={[{ texto: 'Inicio', href: '/' }, { texto: 'Clientes' }]}\n  acciones={<Boton variante="principal">Nuevo cliente</Boton>} />` },
    { n: '03', nombre: 'SelectorEspacio', uso: 'Cambiar de empresa, sede o cuenta. Con más de seis, trae buscador.', Demo: DemoEspacio,
      codigo: `<SelectorEspacio espacios={espacios} valor={actual}\n  alCambiar={cambiarEspacio} alCrear={abrirAlta} />` },
    { n: '04', nombre: 'BarraAcciones', uso: 'Acciones sobre varias filas marcadas a la vez.', Demo: DemoLote,
      codigo: `<BarraAcciones cantidad={seleccion.size} alLimpiar={ninguno}\n  acciones={[{ texto: 'Archivar', icono: Archive, alPulsar: archivar }]} />` },
    { n: '05', nombre: 'PanelesDivididos', uso: 'Lista y detalle con una raya que se arrastra o se mueve con las flechas.', Demo: DemoPaneles,
      codigo: `<PanelesDivididos primero={<Lista />} segundo={<Detalle />}\n  tamanoInicial={36} minimo={24} maximo={60} alCambiar={guardar} />` },
    { n: '06', nombre: 'Arbol', uso: 'Carpetas y categorías anidadas, con teclado completo.', Demo: DemoArbol,
      codigo: `<Arbol nodos={carpetas} seleccionado={id} alElegir={abrir}\n  abiertosIniciales={['clientes']} />` },
  ] },
  { titulo: 'Datos', demos: [
    { n: '07', nombre: 'TarjetaMetrica', uso: 'Una cifra, su cambio frente al periodo anterior y su tendencia.', Demo: DemoMetricas,
      codigo: `<Metricas>\n  <TarjetaMetrica titulo="Ingresos" valor={42800} formato={moneda}\n    variacion={0.124} periodo="frente a octubre" serie={ultimos14dias} />\n</Metricas>` },
    { n: '08', nombre: 'Minigrafico', uso: 'La tendencia sin ejes, para tarjetas y filas de tabla.', Demo: DemoMini,
      codigo: `<Minigrafico datos={[12, 18, 14, 22, 30]} />\n<Minigrafico datos={serie} tipo="barras" style={{ '--color': 'var(--bien)' }} />` },
    { n: '09', nombre: 'GraficoBarras', uso: 'Comparar periodos o categorías, con series apiladas.', Demo: () => <GraficoBarras titulo="Ingresos por mes" datos={VENTAS_MES} series={SERIES_VENTAS} formato={euros} />,
      codigo: `<GraficoBarras titulo="Ingresos por mes" datos={meses} formato={moneda}\n  series={[{ clave: 'suscripciones', nombre: 'Suscripciones' }, { clave: 'servicios', nombre: 'Servicios' }]} />` },
    { n: '10', nombre: 'GraficoArea', uso: 'Evolución en el tiempo, con una guía que sigue al puntero.', Demo: () => <GraficoArea titulo="Visitas y altas de noviembre" datos={VISITAS_DIA} series={SERIES_VISITAS} />,
      codigo: `<GraficoArea titulo="Visitas de noviembre" datos={dias}\n  series={[{ clave: 'visitas', nombre: 'Visitas' }, { clave: 'altas', nombre: 'Altas' }]} />` },
    { n: '11', nombre: 'Anillo', uso: 'Cómo se reparte un total entre pocas partes.', Demo: DemoAnillo,
      codigo: `<Anillo titulo="Ingresos" formato={moneda}\n  datos={[{ nombre: 'Suscripciones', valor: 48200 }, { nombre: 'Servicios', valor: 21400 }]} />` },
    { n: '12', nombre: 'MedidorUso', uso: 'Lo gastado de lo que incluye el plan, con aviso al acercarse al límite.', Demo: DemoUso,
      codigo: `<MedidorUso titulo="Usuarios" usado={7} limite={10}\n  accion={<Boton tamano="chico">Ampliar</Boton>} />` },
    { n: '13', nombre: 'MapaCalor', uso: 'La actividad de cada día de los últimos meses.', Demo: DemoCalor,
      codigo: `<MapaCalor datos={{ '2026-11-15': 7, '2026-11-14': 3 }} semanas={26}\n  unidad={['cita', 'citas']} alElegir={verDia} />` },
    { n: '14', nombre: 'ListaClasificada', uso: 'Los que más, con una barra que da el peso de cada uno.', Demo: () => <div style={{ maxWidth: 480 }}><ListaClasificada datos={ORIGENES} columnas={['Origen', 'Visitas']} /></div>,
      codigo: `<ListaClasificada datos={[{ nombre: 'Google', valor: 4820 }, …]}\n  columnas={['Origen', 'Visitas']} maximo={5} />` },
    { n: '15', nombre: 'LineaTiempo', uso: 'El historial de un registro, agrupado por días.', Demo: DemoTiempo,
      codigo: `<LineaTiempo eventos={[{ id, autor: 'Marta Ruiz', titulo: 'registró un cobro',\n  fecha, icono: Banknote, tono: 'bien' }]} alCargarMas={pedirMas} />` },
  ] },
  { titulo: 'Contenido', demos: [
    { n: '16', nombre: 'ListaDescriptiva', uso: 'La ficha de un registro, con botón de copiar en los datos que se copian.', Demo: DemoDescriptiva,
      codigo: `<ListaDescriptiva columnas={2} elementos={[\n  { termino: 'NIF', valor: 'B12345678', copiar: true, mono: true },\n  { termino: 'Vencimiento', valor: '30 nov 2026' } ]} />` },
    { n: '17', nombre: 'EstadoVacio', uso: 'Una lista sin nada: el motivo y la salida.', Demo: DemoVacio,
      codigo: `<EstadoVacio icono={Users} titulo="Aún no hay clientes"\n  accion={<Boton variante="principal">Añadir cliente</Boton>} />` },
    { n: '18', nombre: 'GrupoAvatares', uso: 'Quién participa, con presencia y resumen de los que no caben.', Demo: DemoAvatares,
      codigo: `<GrupoAvatares personas={equipo} maximo={4} alPulsarResto={verTodos} />` },
    { n: '19', nombre: 'Banner', uso: 'Un aviso que se queda en la página hasta que se resuelve o se cierra.', Demo: DemoBanner,
      codigo: `<Banner tono="mal" titulo="El último pago ha fallado"\n  accion={<Boton tamano="chico">Actualizar tarjeta</Boton>} alCerrar={recordarCierre} />` },
  ] },
  { titulo: 'Formularios', demos: [
    { n: '20', nombre: 'CodigoVerificacion', uso: 'El código del SMS o del correo. Admite pegar y el autorrelleno del móvil.', Demo: DemoCodigo,
      codigo: `<CodigoVerificacion largo={6} alCompletar={verificar}\n  error={fallo && 'El código no coincide'} />` },
    { n: '21', nombre: 'CampoClave', uso: 'Contraseña con medidor que dice qué falta mientras se escribe.', Demo: DemoClave,
      codigo: `<CampoClave etiqueta="Contraseña nueva" valor={clave} alCambiar={setClave} />\n// fuerzaClave(clave).valida para activar el botón` },
    { n: '22', nombre: 'Deslizador', uso: 'Una cantidad o un tramo, arrastrando o con el teclado.', Demo: DemoDeslizador,
      codigo: `<Deslizador etiqueta="Importe" valor={[200, 650]} alCambiar={setTramo}\n  min={0} max={1000} paso={10} formato={moneda} alSoltar={buscar} />` },
    { n: '23', nombre: 'CampoNumero', uso: 'Cantidades de uno en uno. Mantener pulsado acelera.', Demo: DemoNumero,
      codigo: `<CampoNumero etiqueta="Licencias" valor={n} alCambiar={setN}\n  min={1} max={50} sufijo="usuarios" />` },
    { n: '24', nombre: 'TarjetasOpcion', uso: 'Elegir entre pocas opciones que necesitan explicación.', Demo: DemoOpciones,
      codigo: `<TarjetasOpcion etiqueta="Tipo de cuenta" valor={tipo} alCambiar={setTipo}\n  opciones={[{ valor: 'empresa', titulo: 'Empresa', detalle: '…', icono: Building2 }]} />` },
    { n: '25', nombre: 'CampoSecreto', uso: 'Claves de API y tokens: tapados, con ver, copiar y regenerar.', Demo: DemoSecreto,
      codigo: `<CampoSecreto etiqueta="Clave secreta" valor={clave}\n  alRegenerar={regenerar} alCopiar={registrarCopia} />` },
    { n: '26', nombre: 'MatrizPermisos', uso: 'Qué puede hacer cada rol, permiso a permiso o por grupos.', Demo: DemoPermisos,
      codigo: `<MatrizPermisos roles={roles} grupos={grupos} valor={permisos}\n  alCambiar={setPermisos} bloqueados={{ propietario: true }} />` },
  ] },
  { titulo: 'Producto', demos: [
    { n: '27', nombre: 'GuiaInicio', uso: 'Los primeros pasos de una cuenta nueva, que se tachan solos.', Demo: DemoGuia,
      codigo: `<GuiaInicio pasos={[{ id: 'cliente', titulo: 'Añadir el primer cliente',\n  hecho: clientes > 0, accion: { texto: 'Añadir cliente', alPulsar: abrirAlta } }]} alOcultar={ocultar} />` },
    { n: '28', nombre: 'CentroNotificaciones', uso: 'La campana con su contador y la lista de lo no leído.', Demo: DemoNotificaciones,
      codigo: `<CentroNotificaciones notificaciones={lista} alAbrir={irA}\n  alLeer={marcarLeida} alLeerTodas={marcarTodas} />` },
    { n: '29', nombre: 'TablaPrecios', uso: 'Planes lado a lado con cambio entre pago mensual y anual.', Demo: DemoPrecios,
      codigo: `<TablaPrecios planes={planes} actual={planContratado}\n  ahorro="2 meses gratis" alElegir={(id, periodo) => contratar(id, periodo)} />` },
    { n: '30', nombre: 'ZonaPeligro', uso: 'Acciones sin vuelta atrás, que piden escribir el nombre para confirmar.', Demo: DemoPeligro,
      codigo: `<ZonaPeligro titulo="Eliminar el espacio" accion="Eliminar espacio"\n  pregunta="¿Eliminar Clínica Norte?" frase="Clínica Norte" alConfirmar={eliminar} />` },
    { n: '31', nombre: 'BarraCristal', uso: 'Navegación translúcida que flota sobre una foto, con buscador, ramas y plegado a iconos.', Demo: DemoCristal,
      codigo: `<BarraCristal grupos={grupos} activo={ruta} alElegir={ir}\n  logo={<Logo />} nombre="Vertix" detalle="Espacio de finanzas"\n  ajustes={[{ id: 'noche', texto: 'Modo noche', icono: Moon, activo: noche, alCambiar: setNoche }]}\n  usuario={{ nombre: 'Álex Morgan', detalle: 'alex@vertix.io', enLinea: true }} />` },
  ] },
];

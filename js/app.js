// EDV Tech & Code — interfaz, precios, cotizador, reservas, seguimiento y panel
import { loadLogo } from './logos.js?v=20261127144516';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clp = (n) => '$' + Math.round(n).toLocaleString('es-CL');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WHATSAPP = '56975512376';
// Cada reserva llega por correo a EDV Tech & Code (FormSubmit, gratis y sin servidor propio).
// Tras activar el correo, FormSubmit entrega un alias aleatorio: reemplazar la dirección por ese alias.
const MAIL_ENDPOINT = 'https://formsubmit.co/ajax/eduardovicencioez@gmail.com';

// Versión clara (beige y negro) / oscura: se guarda en el navegador y avisa al 3D
function applyTheme(t) {
  const light = t === 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#efe8da' : '#000000');
  const b = document.getElementById('themeBtn');
  if (b) b.setAttribute('aria-label', light ? 'Cambiar a versión oscura' : 'Cambiar a versión clara');
  window.dispatchEvent(new CustomEvent('edv-theme', { detail: light ? 'light' : 'dark' }));
}
applyTheme(document.documentElement.dataset.theme);
document.getElementById('themeBtn')?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('edv-theme', next); } catch { /* sin almacenamiento */ }
  applyTheme(next);
});
const STORE = 'edv_reservas';

/* ================================================================== */
/* Datos                                                               */
/* ================================================================== */
const SERVICES = [
  { t: 'Diagnóstico de hardware', d: 'Banco de pruebas con fuente, RAM y tarjeta de video conocidas. Te decimos qué pieza falla y cuánto cuesta cambiarla.', li: ['Informe con fotos', 'Se descuenta si cambias la pieza'], from: 12000 },
  { t: 'Diagnóstico de rendimiento', d: 'Equipo lento, que se calienta o se pega. Revisamos temperaturas, discos, RAM, drivers y programas.', li: ['Salud de discos (SMART)', 'Pruebas de estrés y memtest'], from: 15000 },
  { t: 'Cambio de piezas', d: 'RAM, SSD, fuente, tarjeta de video, placa madre o procesador. Pieza nueva, instalada y probada.', li: ['Compatibilidad verificada', 'Prueba de estabilidad incluida'], from: 10000 },
  { t: 'Piezas de notebook', d: 'Cambio de pantalla, teclado, batería, cargador o disco por repuestos nuevos.', li: ['Lenovo, HP, Dell, ASUS, Acer, MSI', 'Repuesto con garantía'], from: 20000 },
  { t: 'Mantención', d: 'Limpieza a fondo, pasta térmica nueva y revisión de temperaturas antes y después.', li: ['Arctic MX-6 o Noctua NT-H2', 'Pads en GPU y VRM'], from: 25000 },
  { t: 'Armado de PC', d: 'Con tus piezas o te ayudamos a cotizar. Cables ordenados, BIOS al día y EXPO/XMP activado.', li: ['Revisión de compatibilidad', 'Prueba de estrés de 1 h'], from: 40000 },
  { t: 'Upgrades y clonado', d: 'Más RAM, SSD NVMe u otra tarjeta. Clonamos el disco para que no reinstales nada.', li: ['Clonado sin perder archivos', 'Actualización de BIOS'], from: 10000 },
  { t: 'Revisión de PC usado', d: 'Antes de comprar uno usado lo probamos: piezas reales, temperaturas, horas de uso del disco.', li: ['Informe para negociar', 'En 2 horas'], from: 18000 },
  { t: 'Windows y programas', d: 'Formateo e instalación limpia con drivers, Office y tus programas.', li: ['Respaldo previo incluido', 'Con tu licencia'], from: 20000 },
  { t: 'Redes y Wi-Fi', d: 'Routers, mesh, cableado y puntos de red para la casa o la oficina.', li: ['TP-Link Deco, ASUS ZenWiFi', 'Cable Cat6'], from: 25000 },
  { t: 'Empresas', d: 'Mantención programada de los equipos de tu oficina o local, cambio de piezas y soporte remoto.', li: ['Visitas mensuales', 'Factura'], from: 45000 },
  { t: 'Asesoría de compra', d: 'Te armamos la cotización según presupuesto y comparamos precios entre tiendas chilenas.', li: ['Gamer, edición u oficina', 'Por llamada'], from: 0 },
];

// Software a medida
const SOFTWARE = [
  { t: 'Páginas web', d: 'Sitios informativos, catálogos y tiendas en línea. Rápidos, con tu dominio y correo, y que se ven bien en el celular.', li: ['Dominio .cl y correo', 'Formulario, WhatsApp y mapa', 'Tienda con pagos (Webpay, Mercado Pago)'], from: 290000 },
  { t: 'Sistemas informativos', d: 'Intranets, portales para tus clientes y paneles con la información de tu negocio en un solo lugar.', li: ['Usuarios y permisos', 'Documentos y avisos', 'Reportes en pantalla y PDF'], from: 650000 },
  { t: 'CRM a medida', d: 'Tus clientes, cotizaciones y ventas ordenados como trabaja tu equipo, no como dice un software genérico.', li: ['Ficha de cliente e historial', 'Seguimiento y recordatorios', 'Cotizaciones en PDF y WhatsApp'], from: 950000 },
  { t: 'Inventario a medida', d: 'Stock por local y bodega, entradas, salidas y ventas, con lector de código de barras.', li: ['Varios locales y bodegas', 'Alertas de stock mínimo', 'Compras, proveedores y reportes'], from: 750000 },
  { t: 'Integraciones', d: 'Conectamos lo que ya usas: planillas Excel, boleta electrónica de tu proveedor, WhatsApp, correo y pagos.', li: ['Importar tu Excel actual', 'Avisos automáticos', 'Respaldos diarios'], from: 150000 },
  { t: 'Hosting y soporte', d: 'Tu sistema en línea, con respaldos, actualizaciones y cambios menores cada mes.', li: ['Respaldos diarios', 'Atención por WhatsApp', 'Mejoras a pedido'], from: 35000, mes: true },
];
const SW_STEPS = [
  ['Levantamiento', 'Vamos a tu local u oficina (o por videollamada) y vemos cómo trabajan hoy. Sin costo.'],
  ['Propuesta', 'En 3 a 5 días hábiles: qué se hace, en cuánto tiempo y a qué precio, cerrado.'],
  ['Desarrollo', 'Avances cada semana para que lo pruebes con datos reales.'],
  ['Puesta en marcha', 'Cargamos tus datos, capacitamos al equipo y queda funcionando.'],
  ['Soporte', '3 meses de corrección de errores incluidos. Después, plan mensual opcional.'],
];
const RUBROS = ['Ferreterías', 'Minimarkets', 'Gimnasios', 'Clínicas y consultas', 'Talleres mecánicos', 'Distribuidoras', 'Restaurantes', 'Oficinas contables', 'Tiendas de ropa', 'Constructoras', 'Colegios', 'Corredoras'];

// [archivo en img/logos (null = solo texto), nombre, líneas de producto]
const GPU_BRANDS = [
  ['nvidia', 'NVIDIA', 'Founders Edition'], ['republicofgamers', 'ASUS ROG', 'Strix · Astral'], ['asus', 'ASUS', 'TUF · Prime · Dual'], ['msi', 'MSI', 'Suprim · Gaming Trio · Ventus'],
  ['gigabyte', 'Gigabyte', 'Gaming OC · Windforce · Eagle'], ['aorus', 'AORUS', 'Master · Elite'], ['zotac', 'ZOTAC', 'AMP · Trinity · Twin Edge'], ['pny', 'PNY', 'XLR8 · Verto'],
  ['palit', 'Palit', 'GameRock · GamingPro'], [null, 'Gainward', 'Phantom · Phoenix'], [null, 'INNO3D', 'iChill · X3'], [null, 'GALAX', 'HOF · EX Gamer'],
  ['sapphire', 'Sapphire', 'NITRO+ · PULSE'], ['powercolor', 'PowerColor', 'Red Devil · Hellhound'], ['xfx', 'XFX', 'MERC · QICK · SWIFT'], ['asrock', 'ASRock', 'Taichi · Steel Legend'],
  ['acer', 'Acer', 'Predator BiFrost · Nitro'], ['sparkle', 'Sparkle', 'Titan · ROC (Arc)'], [null, 'Colorful', 'iGame Vulcan'], ['biostar', 'Biostar', 'Radeon Gaming'],
  ['evga', 'EVGA', 'FTW3 · XC3 (ya no fabrica)'], [null, 'Gunnir', 'Photon (Arc)'], [null, 'Yeston', 'Sakura'], [null, 'Manli', 'Gallardo'],
];
const MOBO_BRANDS = [
  ['asus', 'ASUS', 'Prime · TUF · ProArt'], ['republicofgamers', 'ASUS ROG', 'Crosshair · Strix'], ['msi', 'MSI', 'MEG · MPG · MAG · PRO'], ['gigabyte', 'Gigabyte', 'Gaming X · Eagle · UD'],
  ['aorus', 'AORUS', 'Master · Elite · Pro'], ['asrock', 'ASRock', 'Taichi · Phantom Gaming · Pro RS'], ['biostar', 'Biostar', 'Valkyrie · Racing'], ['nzxt', 'NZXT', 'N7 · N5'],
  ['supermicro', 'Supermicro', 'Workstation y servidor'], ['evga', 'EVGA', 'Dark · Classified'], [null, 'Colorful', 'iGame · Battle-Ax'], [null, 'Maxsun', 'Terminator · Challenger'],
];
const OTHER_BRANDS = [
  ['intel', 'Intel', 'CPU'], ['amd', 'AMD', 'CPU'], ['corsair', 'Corsair', 'RAM · fuentes'], ['kingston', 'Kingston', 'RAM · SSD'], ['crucial', 'Crucial', 'RAM · SSD'], ['samsung', 'Samsung', 'SSD'],
  ['westerndigital', 'WD', 'SSD · HDD'], ['seagate', 'Seagate', 'HDD'], ['lexar', 'Lexar', 'SSD'], ['noctua', 'Noctua', 'Refrigeración'], ['bequiet', 'be quiet!', 'Fuentes · refrigeración'], ['coolermaster', 'Cooler Master', 'Fuentes · gabinetes'],
  ['thermaltake', 'Thermaltake', 'Fuentes · gabinetes'], ['deepcool', 'DeepCool', 'Refrigeración'], ['lianli', 'Lian Li', 'Gabinetes'], ['fractal', 'Fractal Design', 'Gabinetes'], ['nzxt', 'NZXT', 'Gabinetes · AIO'], ['hyperx', 'HyperX', 'Periféricos'],
  ['lenovo', 'Lenovo', 'Notebooks'], ['hp', 'HP', 'Notebooks'], ['dell', 'Dell', 'Notebooks'], ['acer', 'Acer', 'Notebooks'], ['apple', 'Apple', 'MacBook · iMac'], ['msi', 'MSI', 'Notebooks'],
  ['playstation', 'PlayStation', 'Consolas'], ['xbox', 'Xbox', 'Consolas'], ['nintendo', 'Nintendo', 'Consolas'], ['tplink', 'TP-Link', 'Redes'], ['logitech', 'Logitech', 'Periféricos'], ['razer', 'Razer', 'Periféricos'],
  ['redragon', 'Redragon', 'Periféricos'], ['windows', 'Windows', 'Sistema'],
];
const CHIPMAKERS = [['nvidia', 'GeForce RTX 50 · RTX 40 · RTX 30 · GTX 16'], ['amd', 'Radeon RX 9000 · RX 7000 · RX 6000'], ['intel', 'Arc B-Series · Arc A-Series']];
const CHIPSETS = [
  ['AMD AM5', 'X870E · X870', 'Ryzen 9000 / 8000 / 7000, PCIe 5.0, USB4'], ['AMD AM5', 'B850 · B840 · B650 · A620', 'Gama media y de entrada, DDR5'],
  ['AMD AM5', 'X670E · X670', 'Primera generación AM5'], ['AMD AM4', 'X570 · B550 · A520 · B450', 'Ryzen 1000 a 5000, DDR4'],
  ['Intel LGA1851', 'Z890 · B860 · H810', 'Core Ultra 200S (Arrow Lake)'], ['Intel LGA1700', 'Z790 · B760 · H610', 'Core 12.ª, 13.ª y 14.ª gen'],
  ['Intel LGA1700', 'Z690 · B660 · H670', 'Core 12.ª gen, DDR4 o DDR5'], ['Intel LGA1200', 'Z590 · B560 · H510 · Z490', 'Core 10.ª y 11.ª gen'],
];

// [servicio, detalle, categoría, tiempo, promedio mercado, EDV]
const PRICES = [
  ['Diagnóstico de hardware', 'Banco de pruebas · se descuenta si cambias la pieza', 'Diagnóstico', '24 h', 20000, 12000],
  ['Diagnóstico de rendimiento', 'Temperaturas, discos, RAM y software', 'Diagnóstico', '3 h', 20000, 15000],
  ['Revisión de PC usado', 'Informe antes de comprar', 'Diagnóstico', '2 h', 25000, 18000],
  ['Cambio de RAM, SSD o fuente', 'Instalación y prueba · pieza aparte', 'Cambio de piezas', '1 h', 15000, 10000],
  ['Cambio de tarjeta de video', 'Instalación, drivers y estrés · pieza aparte', 'Cambio de piezas', '1 h', 20000, 15000],
  ['Cambio de placa madre o CPU', 'Desarme, montaje, BIOS y pruebas', 'Cambio de piezas', '1 día', 50000, 35000],
  ['Cambio de pantalla de notebook', 'Instalación · pantalla aparte', 'Cambio de piezas', '1–2 días', 35000, 25000],
  ['Cambio de teclado o batería', 'Notebook · pieza aparte', 'Cambio de piezas', '1 día', 30000, 20000],
  ['Mantención PC de escritorio', 'Limpieza + pasta térmica', 'Mantención', '3 h', 35000, 25000],
  ['Mantención PC gamer', 'Limpieza profunda + pasta + cables', 'Mantención', '4 h', 50000, 35000],
  ['Mantención notebook', 'Limpieza + pasta + pads', 'Mantención', '1 día', 40000, 30000],
  ['Pasta y pads de GPU', 'NVIDIA / AMD / Intel Arc', 'Mantención', '1 día', 45000, 32000],
  ['Armado de PC', 'Con tus piezas', 'Armado', '1 día', 60000, 40000],
  ['Armado PRO', 'Cables ordenados + BIOS/EXPO + estrés 1 h', 'Armado', '1 día', 80000, 55000],
  ['SSD + clonado de disco', 'Migración sin reinstalar', 'Armado', '3 h', 30000, 20000],
  ['Formateo + Windows 11', 'Drivers + respaldo hasta 100 GB', 'Windows y redes', '1 día', 30000, 20000],
  ['Configuración Wi-Fi / mesh', 'Casa u oficina', 'Windows y redes', '2 h', 35000, 25000],
  ['Asesoría de compra (30 min)', 'Los primeros 15 min sin costo', 'Windows y redes', '30 min', 15000, 10000],
  ['Página web informativa', 'Desde · hasta 5 secciones, dominio y correo', 'Software a medida', '2–3 sem.', 450000, 290000],
  ['Tienda en línea', 'Desde · catálogo, carro y pagos', 'Software a medida', '4–6 sem.', 900000, 650000],
  ['Sistema de inventario', 'Desde · stock por local, código de barras, reportes', 'Software a medida', '4–8 sem.', 1200000, 750000],
  ['CRM a medida', 'Desde · clientes, ventas, seguimiento, cotizaciones', 'Software a medida', '6–10 sem.', 1500000, 950000],
  ['Sistema informativo / intranet', 'Desde · portal interno o de clientes', 'Software a medida', '4–8 sem.', 1000000, 650000],
  ['Hosting + soporte', 'Mensual · respaldos, actualizaciones y cambios menores', 'Software a medida', 'mensual', 60000, 35000],
];

// [código, nombre, detalle, diagnóstico base, tipo]
const DEVICES = [
  ['D1', 'PC de escritorio', 'Oficina o casa', 12000, 'hw'], ['D2', 'PC gamer', 'Armado o de marca', 15000, 'hw'], ['D3', 'Notebook', 'Cualquier marca', 12000, 'hw'],
  ['D4', 'All-in-One', 'iMac, HP, Lenovo', 15000, 'hw'], ['D5', 'Mac / MacBook', 'Intel o Apple Silicon', 18000, 'hw'], ['D6', 'Red / Wi-Fi', 'Router, mesh, cables', 15000, 'hw'],
  ['D7', 'PC por armar', 'Piezas nuevas', 0, 'hw'], ['D8', 'Equipos de oficina', 'Varios puestos', 45000, 'hw'],
  ['W1', 'Página web', 'Informativa o tienda', 0, 'sw'], ['W2', 'Sistema a medida', 'CRM, inventario, intranet', 0, 'sw'],
];
const PROBLEMS = ['No enciende', 'Se apaga solo', 'Pantallazo azul', 'Muy lento', 'Se calienta', 'Ventiladores ruidosos', 'Sin imagen', 'Quiero cambiar una pieza', 'Más RAM o SSD', 'Pantalla de notebook rota', 'Batería no dura', 'Teclado no responde', 'Wi-Fi o internet', 'Armar PC nuevo', 'FPS bajos', 'Mantención preventiva', 'Revisar PC usado', 'Otro'];
const SW_NEEDS = ['Página web informativa', 'Tienda en línea', 'Sistema de inventario', 'CRM / clientes', 'Agenda y reservas', 'Intranet o portal', 'Reportes y paneles', 'Varios locales', 'Lector de código de barras', 'Conectar con Excel', 'Avisos por WhatsApp', 'Otro'];

const MODES = [
  ['taller', 'A', 'En taller', 'Traes tu equipo', 0],
  ['domicilio', 'B', 'A domicilio', 'Vamos a tu casa', 12000],
  ['terreno', 'C', 'En terreno', 'Empresas y oficinas', 45000],
  ['local', 'C', 'En tu local u oficina', 'Reunión de levantamiento', 0],
  ['video', 'D', 'Videollamada', 'Meet, Zoom o WhatsApp', 0],
  ['llamada', 'D', 'Por llamada', 'Asesoría o AnyDesk', 0],
];

const URGENCY = { normal: 0, alta: 8000, express: 15000 };

const COMUNAS = ['Viña del Mar', 'Concón', 'Reñaca', 'Valparaíso', 'Quilpué', 'Villa Alemana', 'Quintero', 'Puchuncaví', 'Limache', 'Olmué', 'Casablanca', 'Otra (consultar recargo)'];

const STATUSES = [
  ['recibida', 'Recibido'], ['diagnostico', 'Diagnóstico'], ['atencion', 'En trabajo'], ['pruebas', 'Pruebas'], ['entregada', 'Entregado'],
];

// Trabajos recientes del taller: [equipo, síntoma, causa, solución, tiempo]
const CASES = [
  ['Lenovo IdeaPad 3 15ALC6', 'Pantallazo azul al prender', 'Módulo de RAM con errores en memtest', 'Cambio del módulo de RAM', '1 día'],
  ['PC Ryzen 5 5600 + RTX 3060', 'Se apaga jugando', 'Fuente genérica sin protecciones', 'Cambio a fuente MSI MAG A650BN', '3 h'],
  ['ASUS TUF F15 (2021)', '98 °C y baja de FPS', 'Pasta seca y polvo en los ventiladores', 'Mantención con pasta y pads: 79 °C en carga', '1 día'],
  ['HP 240 G8 de oficina', 'Demora 4 minutos en prender', 'Disco mecánico con sectores dañados', 'SSD Kingston + clonado: prende en 15 s', '3 h'],
  ['Ferretería, 2 locales en Quilpué', 'Stock en cuadernos y Excel', 'Nadie sabía qué había en cada bodega', 'Sistema de inventario con código de barras y stock por local', '6 sem.'],
  ['Gimnasio en Viña del Mar', 'Socios y pagos en planillas', 'Cobros atrasados y clases sobrevendidas', 'Página web + panel de socios, clases y control de acceso', '8 sem.'],
];

const FAQS = [
  ['¿Reparan placas, notebooks o consolas?', 'No hacemos reparación electrónica (microsoldadura, reballing ni arreglo de placas). Diagnosticamos qué falla y, si conviene, cambiamos la pieza por una nueva con garantía. Si no tiene reemplazo o no vale la pena, te lo decimos antes de cobrar.'],
  ['¿Cuánto cuesta el diagnóstico?', 'En el taller cuesta $12.000 y se descuenta si cambias la pieza con nosotros. Si al agendar nos mandas fotos, muchas veces podemos orientarte sin costo.'],
  ['¿Quién compra la pieza?', 'Puedes comprarla tú, o te la cotizamos en tiendas chilenas y te mostramos la boleta. No le ponemos recargo a la pieza.'],
  ['¿Cuánto se demora un sistema a medida?', 'Una página web informativa, 2 a 3 semanas. Un inventario o un CRM, entre 4 y 10 semanas según los módulos. El plazo queda escrito en la propuesta.'],
  ['¿El sistema queda a mi nombre?', 'Sí. El dominio, el código y los datos son tuyos. Si algún día quieres cambiarte de proveedor, te entregamos todo.'],
  ['¿Funciona en el celular?', 'Sí. Todo lo que hacemos es web y se adapta a celular, tablet y computador. El inventario funciona con lector de código de barras o con la cámara del celular.'],
  ['¿Tienen garantía?', '90 días en instalación y mano de obra; las piezas, con la garantía de la tienda o del fabricante. En software, 3 meses de corrección de errores incluidos.'],
];

/* ================================================================== */
/* Render de secciones                                                 */
/* ================================================================== */
// Equipos: cada servicio es un desplegable; adentro, el detalle, el precio y el botón para pedirlo por WhatsApp
const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>';
$('#serviceCards').innerHTML = SERVICES.map((s, i) => {
  const price = s.from ? `desde <b>${clp(s.from)}</b>` : '<b>15 min sin costo</b>';
  const msg = `Hola EDV Tech & Code, quiero pedir: ${s.t}${s.from ? ` (desde ${clp(s.from)})` : ''}. ¿Me pueden ayudar?`;
  return `
  <details class="svc svc-acc">
    <summary>
      <span class="code">S-${String(i + 1).padStart(2, '0')}</span>
      <span class="svc-head"><h3>${s.t}</h3><span class="tog" aria-hidden="true"></span></span>
    </summary>
    <div class="svc-body">
      <p>${s.d}</p>
      <ul>${s.li.map((l) => `<li>${l}</li>`).join('')}</ul>
      <div class="svc-buy">
        <div class="from">${price}</div>
        <a class="btn btn-wa" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${WA_ICON}Pedir por WhatsApp</a>
      </div>
    </div>
  </details>`;
}).join('');

$('#softwareCards').innerHTML = SOFTWARE.map((s, i) => `
  <article class="svc">
    <span class="code">W-${String(i + 1).padStart(2, '0')}</span>
    <h3>${s.t}</h3><p>${s.d}</p>
    <ul>${s.li.map((l) => `<li>${l}</li>`).join('')}</ul>
    <div class="from">desde <b>${clp(s.from)}</b>${s.mes ? ' al mes' : ''}</div>
  </article>`).join('');
$('#swSteps').innerHTML = SW_STEPS.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join('');
$('#rubros').innerHTML = RUBROS.map((r) => `<span>${r}</span>`).join('');

// Grillas de logos: primero el nombre en texto; cuando carga el SVG real se reemplaza por el logo
function fillLogos(el, list) {
  el.innerHTML = list.map(([, n, s]) => `<div class="lg" title="${esc(n)}"><span class="nm">${esc(n)}</span><small>${esc(s)}</small></div>`).join('');
  [...el.children].forEach(async (cell, i) => {
    const f = list[i][0]; if (!f) return;
    const logo = await loadLogo(f, 640); if (!logo) return;
    const img = new Image(); img.alt = list[i][1]; img.src = logo.toDataURL();
    cell.querySelector('.nm').replaceWith(img);
  });
}
fillLogos($('#gpuBrands'), GPU_BRANDS);
fillLogos($('#moboBrands'), MOBO_BRANDS);
fillLogos($('#otherBrands'), OTHER_BRANDS);
$('#chipmakers').innerHTML = CHIPMAKERS.map(([f, s]) => `<div class="chipmaker" data-f="${f}"><span class="nm lg-fallback">${f.toUpperCase()}</span><span>${s}</span></div>`).join('');
CHIPMAKERS.forEach(async ([f]) => {
  const logo = await loadLogo(f, 800); if (!logo) return;
  const img = new Image(); img.alt = f.toUpperCase(); img.src = logo.toDataURL();
  $(`.chipmaker[data-f="${f}"] .nm`).replaceWith(img);
});
$('#chipsets').innerHTML = CHIPSETS.map(([p, c, d]) => `<div class="chipset"><span class="mono">${p}</span><b>${c}</b><span>${d}</span></div>`).join('');
$('#casesBody').innerHTML = CASES.map((c) => `<tr>${c.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('');
$('#faqList').innerHTML = FAQS.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');

/* ---------- Tabla de precios ---------- */
const cats = ['Todos', ...new Set(PRICES.map((p) => p[2]))];
$('#priceFilters').innerHTML = cats.map((c, i) => `<button class="${i ? '' : 'on'}" data-c="${c}">${c}</button>`).join('');
const renderPrices = (cat) => {
  $('#priceBody').innerHTML = PRICES.filter((p) => cat === 'Todos' || p[2] === cat).map(([n, d, , t, mk, ours]) => `
    <tr><td><b>${n}</b><small>${d}</small></td><td class="t">${t}</td><td class="mk">${clp(mk)}</td>
    <td class="our">${clp(ours)}</td><td class="df">−${clp(mk - ours)}</td></tr>`).join('');
};
renderPrices('Todos');
$('#priceFilters').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#priceFilters button').forEach((x) => x.classList.toggle('on', x === b));
  renderPrices(b.dataset.c);
});

/* ---------- Cotizador ---------- */
const QUOTER_ITEMS = [...PRICES.filter((p) => p[2] !== 'Software a medida').slice(0, 15).map((p, i) => ({ i, n: p[0], mk: p[4], o: p[5] })), { i: 'dom', n: 'Visita a domicilio', mk: 18000, o: 12000 }];
$('#quoterList').innerHTML = QUOTER_ITEMS.map((q) => `<label class="qi"><input type="checkbox" value="${q.i}" /> ${q.n}<em>${clp(q.o)}</em></label>`).join('');
let quoterSel = [];
const updateQuoter = () => {
  quoterSel = QUOTER_ITEMS.filter((q) => $(`#quoterList input[value="${q.i}"]`).checked);
  const our = quoterSel.reduce((a, q) => a + q.o, 0), mk = quoterSel.reduce((a, q) => a + q.mk, 0);
  animateNumber($('#quoterTotal'), our);
  $('#quoterMarket').textContent = clp(mk);
  $('#quoterSave').textContent = `Diferencia −${clp(mk - our)}`;
  $$('#quoterList .qi').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked));
};
$('#quoterList').addEventListener('change', updateQuoter);
$('#quoterBook').addEventListener('click', () => {
  if (!quoterSel.length) return;
  const ta = $('textarea[name=descripcion]');
  const txt = 'Servicios cotizados: ' + quoterSel.map((q) => q.n).join(', ') + '. ';
  if (!ta.value.includes('Servicios cotizados')) ta.value = txt + ta.value;
  if (quoterSel.some((q) => q.i === 'dom')) state.mode = 'domicilio';
  if (state.device == null) pickDevice(0);
  toast('Listo: lo agregamos a la descripción de tu reserva');
});

function animateNumber(el, to) {
  const from = +(el.dataset.v || 0); el.dataset.v = to;
  const t0 = performance.now();
  const step = (t) => { const k = Math.min(1, (t - t0) / 500); el.textContent = clp(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ================================================================== */
/* Wizard de reserva                                                   */
/* ================================================================== */
const state = { step: 1, device: null, problems: new Set(), photos: [], mode: null, date: null, slot: null };
const form = $('#bookingForm');
const val = (n) => form.elements[n]?.type === 'checkbox' ? form.elements[n].checked : (form.elements[n]?.value || '').trim();

$('#deviceOpts').innerHTML = DEVICES.map(([i, n, s, , kind], k) => `<button type="button" class="opt ${kind === 'sw' ? 'sw' : ''}" data-k="${k}"><span class="oc">${i}</span><b>${n}</b><small>${s}</small></button>`).join('');
const isSW = () => state.device != null && DEVICES[state.device][4] === 'sw';
function pickDevice(k) {
  const wasSW = isSW();
  state.device = k;
  $$('#deviceOpts .opt').forEach((x) => x.classList.toggle('on', +x.dataset.k === k));
  if (wasSW !== isSW() || !$('#problemChips').children.length) {
    state.problems = new Set();
    $('#problemChips').innerHTML = (isSW() ? SW_NEEDS : PROBLEMS).map((p) => `<button type="button" class="chip">${p}</button>`).join('');
    if (state.mode && !modesFor().some((m) => m[0] === state.mode)) state.mode = null;
  }
  document.body.classList.toggle('mode-sw', isSW());
  $('#step2Title').textContent = isSW() ? 'Cuéntanos de tu negocio' : '¿Qué le pasa?';
  $('#step3Title').textContent = isSW() ? '¿Dónde nos juntamos?' : '¿Dónde lo vemos?';
  $('#descLabel').textContent = isSW() ? 'Qué necesitas que haga el sistema y cómo trabajan hoy' : 'Cuéntalo con tus palabras';
  $('#dzLabel').textContent = isSW() ? 'Capturas de tu Excel actual, fotos del local o ejemplos que te gusten. Hasta 6.' : 'Arrastra aquí o haz clic. Hasta 6 imágenes.';
  renderModes();
}
$('#deviceOpts').addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (b) pickDevice(+b.dataset.k); });

$('#problemChips').innerHTML = PROBLEMS.map((p) => `<button type="button" class="chip">${p}</button>`).join('');
$('#problemChips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip'); if (!b) return;
  const p = b.textContent; state.problems.has(p) ? state.problems.delete(p) : state.problems.add(p);
  b.classList.toggle('on');
});

const modesFor = () => MODES.filter((m) => (isSW() ? ['local', 'video'] : ['taller', 'domicilio', 'terreno', 'llamada']).includes(m[0]));
function renderModes() {
  $('#modeOpts').innerHTML = modesFor().map(([k, i, n, s, p]) => `<button type="button" class="opt" data-m="${k}"><span class="oc">${i}</span><b>${n}</b><small>${s} · ${p ? '+ ' + clp(p) : 'sin costo'}</small></button>`).join('');
  if (state.mode) $$('#modeOpts .opt').forEach((x) => x.classList.toggle('on', x.dataset.m === state.mode));
}
renderModes();
const setMode = (m) => {
  state.mode = m;
  $$('#modeOpts .opt').forEach((x) => x.classList.toggle('on', x.dataset.m === m));
  $('#addrBlock').classList.toggle('show', m === 'domicilio' || m === 'terreno' || m === 'local');
  $('#callBlock').classList.toggle('show', m === 'llamada' || m === 'video');
  if (m === 'video' && form.elements.plataforma.value === 'Llamada telefónica') form.elements.plataforma.value = 'Google Meet';
  renderSlots();
};
$('#modeOpts').addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (b) setMode(b.dataset.m); });
$('#comunaSel').innerHTML = '<option value="">—</option>' + COMUNAS.map((c) => `<option>${c}</option>`).join('');

/* ---------- Fotos ---------- */
const dz = $('#dropzone'), photoInput = $('#photoInput');
dz.addEventListener('click', () => photoInput.click());
['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('over'); }));
['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('over'); }));
dz.addEventListener('drop', (e) => addPhotos(e.dataTransfer.files));
photoInput.addEventListener('change', () => { addPhotos(photoInput.files); photoInput.value = ''; });

function compress(file, max = 900, q = 0.72) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/jpeg', q));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
async function addPhotos(files) {
  for (const f of [...files]) {
    if (!f.type.startsWith('image/')) continue;
    if (state.photos.length >= 6) { toast('Máximo 6 fotos'); break; }
    try { state.photos.push({ name: f.name, data: await compress(f) }); } catch { toast('No se pudo leer ' + f.name); }
  }
  renderThumbs();
}
function renderThumbs() {
  $('#thumbs').innerHTML = state.photos.map((p, i) => `<div class="thumb"><img src="${p.data}" alt="" /><button type="button" data-i="${i}">✕</button><small>${esc(p.name.slice(0, 18))}</small></div>`).join('');
}
$('#thumbs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { state.photos.splice(+b.dataset.i, 1); renderThumbs(); } });

/* ---------- Calendario ---------- */
const today = new Date(); today.setHours(0, 0, 0, 0);
let calMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 45);

function renderCal() {
  $('#calTitle').textContent = calMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const first = (calMonth.getDay() + 6) % 7;
  const days = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  let html = '<span></span>'.repeat(first);
  for (let d = 1; d <= days; d++) {
    const dt = new Date(calMonth.getFullYear(), calMonth.getMonth(), d);
    const off = dt < today || dt > maxDate || dt.getDay() === 0;
    html += `<button type="button" ${off ? 'disabled' : ''} data-d="${ymd(dt)}" class="${ymd(dt) === ymd(today) ? 'today' : ''} ${state.date === ymd(dt) ? 'on' : ''}">${d}</button>`;
  }
  $('#calDays').innerHTML = html;
  $('#calPrev').disabled = calMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
}
$('#calPrev').addEventListener('click', () => { calMonth.setMonth(calMonth.getMonth() - 1); renderCal(); });
$('#calNext').addEventListener('click', () => { if (calMonth < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) { calMonth.setMonth(calMonth.getMonth() + 1); renderCal(); } });
$('#calDays').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  state.date = b.dataset.d; state.slot = null; renderCal(); renderSlots();
});

function slotsFor(dateStr) {
  const d = new Date(dateStr + 'T00:00');
  const sat = d.getDay() === 6;
  if (state.mode === 'llamada' || state.mode === 'video') {
    const out = []; for (let h = 10; h < (sat ? 14 : 19); h++) { out.push(`${h}:00`, `${h}:30`); } return out;
  }
  return sat ? ['10:00', '11:30', '13:00'] : ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];
}
function isBusy(dateStr, slot) {
  const taken = loadAll().some((r) => r.date === dateStr && r.slot === slot && r.mode === state.mode);
  if (taken) return true;
  let h = 0; for (const c of dateStr + slot + (state.mode || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  if (h % 100 < 28) return true;
  if (dateStr === ymd(today)) { const [hh, mm] = slot.split(':').map(Number); const now = new Date(); return hh * 60 + mm < now.getHours() * 60 + now.getMinutes() + 90; }
  return false;
}
function renderSlots() {
  if (!state.date) { $('#slots').innerHTML = ''; $('#slotsTitle').textContent = 'Selecciona un día'; return; }
  const d = new Date(state.date + 'T00:00');
  $('#slotsTitle').textContent = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase();
  $('#slots').innerHTML = slotsFor(state.date).map((s) => `<button type="button" class="slot ${state.slot === s ? 'on' : ''}" ${isBusy(state.date, s) ? 'disabled' : ''}>${s}</button>`).join('');
}
$('#slots').addEventListener('click', (e) => { const b = e.target.closest('.slot'); if (!b || b.disabled) return; state.slot = b.textContent; renderSlots(); });

/* ---------- Estimado ---------- */
function estimate() {
  if (isSW()) return { diag: 0, modeFee: 0, urg: 0, total: 0, sw: true };
  const base = state.device != null ? DEVICES[state.device][3] : 12000;
  const mode = MODES.find((m) => m[0] === state.mode);
  const modeFee = mode ? mode[4] : 0;
  const urg = URGENCY[val('urgencia')] || 0;
  const callFree = state.mode === 'llamada';
  const diag = callFree ? 0 : base;
  return { diag, modeFee, urg, total: diag + modeFee + urg };
}

function renderSummary() {
  const e = estimate();
  const mode = MODES.find((m) => m[0] === state.mode);
  const dateTxt = state.date ? new Date(state.date + 'T00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
  const where = (state.mode === 'llamada' || state.mode === 'video') ? val('plataforma') : (state.mode === 'taller' ? 'Taller EDV Tech & Code' : `${esc(val('direccion'))}, ${esc(val('comuna'))}`);
  $('#summary').innerHTML = `
    <h4>RESUMEN DE TU RESERVA</h4>
    <div class="sum-row"><span>${e.sw ? 'Proyecto' : 'Equipo'}</span><span>${state.device != null ? DEVICES[state.device][1] : '—'}${val('modelo') ? ' · ' + esc(val('modelo')) : ''}</span></div>
    ${e.sw && val('negocio') ? `<div class="sum-row"><span>Negocio</span><span>${esc(val('negocio'))}${val('locales') ? ' · ' + esc(val('locales')) : ''}</span></div>` : ''}
    <div class="sum-row"><span>${e.sw ? 'Necesita' : 'Problema'}</span><span>${[...state.problems].join(', ') || '—'}</span></div>
    <div class="sum-row"><span>Modalidad</span><span>${mode ? mode[2] : '—'}</span></div>
    <div class="sum-row"><span>Lugar</span><span>${where}</span></div>
    <div class="sum-row"><span>Fecha</span><span>${dateTxt} · ${state.slot || '—'}</span></div>
    ${e.sw ? `<div class="sum-row"><span>Reunión de levantamiento</span><span>Sin costo</span></div>${val('presupuesto') ? `<div class="sum-row"><span>Presupuesto</span><span>${esc(val('presupuesto'))}</span></div>` : ''}`
      : `<div class="sum-row"><span>${state.mode === 'llamada' ? 'Asesoría' : 'Diagnóstico'}</span><span>${e.diag ? clp(e.diag) : state.mode === 'llamada' ? '15 min gratis' : 'Sin costo'}</span></div>`}
    ${e.modeFee ? `<div class="sum-row"><span>${mode[2]}</span><span>${clp(e.modeFee)}</span></div>` : ''}
    ${e.urg ? `<div class="sum-row"><span>Urgencia</span><span>${clp(e.urg)}</span></div>` : ''}
    ${state.photos.length ? `<div class="sum-photos">${state.photos.map((p) => `<img src="${p.data}" alt="" />`).join('')}</div>` : ''}
    ${e.sw ? `<div class="sum-total"><span>Propuesta</span><b>3–5 días</b></div>
    <div class="sum-note">Después de la reunión te mandamos alcance, plazos y precio cerrado. Sin compromiso.</div>`
      : `<div class="sum-total"><span>Estimado inicial</span><b>${clp(e.total)}</b></div>
    <div class="sum-note">El diagnóstico se descuenta si cambias la pieza con nosotros. Las piezas se cotizan aparte, sin recargo.</div>`}`;
}

/* ---------- Navegación del wizard ---------- */
function validate(step) {
  $$('.field.err').forEach((f) => f.classList.remove('err'));
  const fail = (msg, name) => { if (name) form.elements[name]?.closest('.field')?.classList.add('err'); $('#wizErr').textContent = msg; return false; };
  if (step === 1 && state.device == null) return fail('Elige un equipo o un proyecto.');
  if (step === 2) {
    if (!state.problems.size && val('descripcion').length < 10) return fail(isSW() ? 'Marca lo que necesitas o descríbelo (mín. 10 caracteres).' : 'Selecciona un problema o descríbelo (mín. 10 caracteres).', 'descripcion');
    if (isSW() && val('negocio').length < 2) return fail('Cuéntanos el nombre o rubro del negocio.', 'negocio');
  }
  if (step === 3) {
    if (!state.mode) return fail('Elige una modalidad de atención.');
    if (['domicilio', 'terreno', 'local'].includes(state.mode)) {
      if (!val('comuna')) return fail('Indica tu comuna.', 'comuna');
      if (val('direccion').length < 5) return fail('Indica la dirección.', 'direccion');
    }
  }
  if (step === 4 && (!state.date || !state.slot)) return fail('Elige día y horario.');
  if (step === 5) {
    if (val('nombre').length < 3) return fail('Ingresa tu nombre.', 'nombre');
    if (val('telefono').replace(/\D/g, '').length < 8) return fail('Ingresa un teléfono válido.', 'telefono');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('email'))) return fail('Ingresa un correo válido.', 'email');
    if (val('rut') && !validRut(val('rut'))) return fail('El RUT no es válido.', 'rut');
    if (!isSW() && !val('acepto')) return fail('Debes aceptar las condiciones del diagnóstico.');
  }
  $('#wizErr').textContent = '';
  return true;
}

function validRut(rut) {
  const clean = rut.replace(/[.\-\s]/g, '').toUpperCase();
  if (!/^\d{7,8}[\dK]$/.test(clean)) return false;
  const body = clean.slice(0, -1), dv = clean.slice(-1);
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) { sum += +body[i] * mul; mul = mul === 7 ? 2 : mul + 1; }
  const res = 11 - (sum % 11);
  return dv === (res === 11 ? '0' : res === 10 ? 'K' : String(res));
}

function goStep(n, scroll = true) {
  state.step = n;
  $$('.wstep').forEach((s) => s.classList.toggle('active', +s.dataset.step === n));
  $$('.wp-step').forEach((s) => { const k = +s.dataset.s; s.classList.toggle('active', k === n); s.classList.toggle('done', k < n); });
  $('#prevBtn').style.visibility = n === 1 ? 'hidden' : 'visible';
  $('#nextBtn').textContent = n === 5 ? 'Confirmar reserva' : 'Siguiente →';
  if (n === 3 && state.mode) setMode(state.mode);
  if (n === 4) { renderCal(); renderSlots(); }
  if (n === 5) renderSummary();
  if (scroll) $('#wizard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#nextBtn').addEventListener('click', () => {
  if (!validate(state.step)) return;
  if (state.step < 5) goStep(state.step + 1); else submit();
});
$('#prevBtn').addEventListener('click', () => { $('#wizErr').textContent = ''; goStep(Math.max(1, state.step - 1)); });
form.addEventListener('input', () => { if (state.step === 5) renderSummary(); });
goStep(1, false);

/* ---------- Guardado ---------- */
function loadAll() { try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch { return []; } }
function saveAll(list) {
  try { localStorage.setItem(STORE, JSON.stringify(list)); return true; }
  catch {
    // si se llena el almacenamiento, guardamos sin las fotos más antiguas
    list.forEach((r, i) => { if (i < list.length - 1) r.photos = []; });
    try { localStorage.setItem(STORE, JSON.stringify(list)); return true; } catch { return false; }
  }
}
function newCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c; do { c = 'EDV-' + Array.from({ length: 5 }, () => A[Math.floor(Math.random() * A.length)]).join(''); } while (loadAll().some((r) => r.code === c));
  return c;
}

function submit() {
  const e = estimate();
  const r = {
    code: newCode(), created: new Date().toISOString(), status: 'recibida',
    device: DEVICES[state.device][1], modelo: val('modelo'), antiguedad: val('antiguedad'), garantia: val('garantia'),
    problems: [...state.problems], descripcion: val('descripcion'), desde: val('desde'), urgencia: val('urgencia'),
    photos: state.photos, mode: state.mode, comuna: val('comuna'), direccion: val('direccion'), referencia: val('referencia'),
    plataforma: val('plataforma'), asesoria: val('asesoria'), date: state.date, slot: state.slot,
    nombre: val('nombre'), telefono: val('telefono'), email: val('email'), rut: val('rut'), respaldo: val('respaldo'),
    estimado: e.total, tipo: isSW() ? 'software' : 'equipo',
    negocio: val('negocio'), locales: val('locales'), usuarios: val('usuarios'), hoyUsan: val('hoyUsan'), presupuesto: val('presupuesto'),
  };
  const list = loadAll(); list.push(r);
  if (!saveAll(list)) toast('No se pudieron guardar las fotos en este navegador; la reserva quedó sin imágenes.');

  const mode = MODES.find((m) => m[0] === r.mode)[2];
  const fecha = new Date(r.date + 'T00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#confirmCode').textContent = r.code;
  $('#confirmText').textContent = r.tipo === 'software'
    ? `${mode} · ${fecha} a las ${r.slot}. Reunión de levantamiento sin costo. Te confirmamos por WhatsApp.`
    : `${mode} · ${fecha} a las ${r.slot}. Estimado inicial ${clp(r.estimado)}. Te contactaremos por WhatsApp para confirmar.`;
  const msg = r.tipo === 'software'
    ? `Hola EDV Tech & Code, agendé una reunión (${r.code})\n• Proyecto: ${r.device}\n• Negocio: ${r.negocio}${r.locales ? ' · ' + r.locales : ''}\n• Necesito: ${r.problems.join(', ')}\n• ${r.descripcion}\n• ${mode}: ${fecha} ${r.slot}`
    : `Hola EDV Tech & Code, agendé el servicio ${r.code}\n• Equipo: ${r.device} ${r.modelo}\n• Problema: ${r.problems.join(', ')}\n• ${r.descripcion}\n• Modalidad: ${mode}\n• Fecha: ${fecha} ${r.slot}\n${r.photos.length ? `• Tengo ${r.photos.length} foto(s) para enviarles` : ''}`;
  $('#waLink').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  $('#confirmModal').classList.add('show');
  sendMail(r, mode, fecha);

  // reinicio
  form.reset(); Object.assign(state, { device: null, problems: new Set(), photos: [], mode: null, date: null, slot: null });
  document.body.classList.remove('mode-sw'); $('#problemChips').innerHTML = PROBLEMS.map((p) => `<button type="button" class="chip">${p}</button>`).join(''); renderModes();
  $$('.opt.on, .chip.on').forEach((x) => x.classList.remove('on')); renderThumbs();
  $('#addrBlock').classList.remove('show'); $('#callBlock').classList.remove('show');
  goStep(1, false);
  $('#trackCode').value = r.code;
}

// Envía la reserva al correo de EDV Tech & Code. Las fotos no van adjuntas (el plan gratis no las manda bien):
// el correo dice cuántas subió el cliente y se le pide mandarlas por WhatsApp.
async function sendMail(r, mode, fecha) {
  const sw = r.tipo === 'software';
  const lugar = (r.mode === 'llamada' || r.mode === 'video') ? r.plataforma : (r.mode === 'taller' ? 'Taller EDV Tech & Code' : `${r.direccion}, ${r.comuna}${r.referencia ? ' (' + r.referencia + ')' : ''}`);
  const data = {
    _subject: `Nueva reserva ${r.code} · ${sw ? 'Software' : 'Equipo'} · ${r.nombre}`,
    _template: 'table', _captcha: 'false', _replyto: r.email,
    'Código': r.code, 'Tipo': sw ? 'Software a medida' : 'Servicio técnico',
    'Nombre': r.nombre, 'Teléfono': r.telefono, 'Correo': r.email, 'RUT': r.rut || '—',
    [sw ? 'Proyecto' : 'Equipo']: `${r.device}${r.modelo ? ' · ' + r.modelo : ''}`,
    [sw ? 'Necesita' : 'Problema']: r.problems.join(', ') || '—',
    'Descripción': r.descripcion || '—',
    'Modalidad': mode, 'Lugar': lugar || '—', 'Fecha': `${fecha} · ${r.slot}`,
    'Fotos': r.photos.length ? `${r.photos.length} foto(s) en la reserva: pedirlas por WhatsApp` : 'Sin fotos',
  };
  if (sw) Object.assign(data, { 'Negocio': r.negocio || '—', 'Locales': r.locales || '—', 'Usuarios': r.usuarios || '—', 'Hoy usan': r.hoyUsan || '—', 'Presupuesto': r.presupuesto || '—' });
  else Object.assign(data, { 'Antigüedad': r.antiguedad || '—', 'Garantía': r.garantia || '—', 'Desde cuándo': r.desde || '—', 'Urgencia': r.urgencia || '—', 'Respaldo': r.respaldo || '—', 'Estimado inicial': clp(r.estimado) });
  try {
    const res = await fetch(MAIL_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || String(out.success) !== 'true') throw new Error(out.message || res.status);
  } catch (err) {
    console.warn('No se pudo enviar el correo de la reserva', err);
    toast('Tu reserva quedó guardada, pero no pudimos avisarnos por correo. Escríbenos por WhatsApp con el botón de abajo.');
  }
}

/* ================================================================== */
/* Seguimiento                                                         */
/* ================================================================== */
$('#trackForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const code = $('#trackCode').value.trim().toUpperCase();
  const r = loadAll().find((x) => x.code === code);
  const tl = $('#trackResult');
  if (!r) { tl.classList.remove('show'); toast('No encontramos ese código. Revísalo en el WhatsApp que te mandamos.'); return; }
  const idx = STATUSES.findIndex((s) => s[0] === r.status);
  const mode = MODES.find((m) => m[0] === r.mode)[2];
  const cls = (i) => (i < idx ? 'done' : i === idx ? 'now' : '');
  tl.innerHTML = `
    <div class="track-head"><b>${r.code}</b><span>${esc(r.nombre)} · ${esc(r.device)} · ${mode} · ${r.date} ${r.slot}</span></div>
    <p class="track-now">Estado: <b>${STATUSES[idx][1]}</b></p>
    <div class="track-bar">${STATUSES.map((_, i) => `<i class="${cls(i)}"></i>`).join('')}</div>
    <div class="track-labels">${STATUSES.map(([, n], i) => `<span class="${cls(i)}">${n}</span>`).join('')}</div>`;
  tl.classList.add('show');
});

/* ================================================================== */
/* Panel de reservas (#admin)                                          */
/* ================================================================== */
function renderAdmin() {
  const list = loadAll().sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot));
  const byMode = (m) => list.filter((r) => r.mode === m).length;
  $('#adminKpis').innerHTML = `
    <div><b>${list.length}</b><span>Reservas</span></div>
    <div><b>${list.filter((r) => r.date >= ymd(today) && r.status !== 'entregada').length}</b><span>Próximas</span></div>
    <div><b>${list.filter((r) => r.tipo === 'software').length}</b><span>Proyectos de software</span></div>
    <div><b>${clp(list.reduce((a, r) => a + (r.estimado || 0), 0))}</b><span>Estimado total</span></div>`;
  $('#adminList').innerHTML = list.length ? list.map((r) => `
    <div class="ad-item">
      <div><span class="code-s">${r.code}</span> · <b>${esc(r.nombre)}</b> · ${esc(r.telefono)} · ${esc(r.email)}<br>
      ${esc(r.device)} ${esc(r.modelo)} · <b>${MODES.find((m) => m[0] === r.mode)[2]}</b> · ${r.date} ${r.slot}${r.comuna ? ' · ' + esc(r.comuna) : ''} · ${clp(r.estimado)}</div>
      <div><select data-code="${r.code}">${STATUSES.map(([k, n]) => `<option value="${k}" ${k === r.status ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <p>${r.tipo === 'software' ? `<b>Software · ${esc(r.negocio)}</b> ${esc([r.locales, r.usuarios, r.hoyUsan, r.presupuesto].filter(Boolean).join(' · '))}<br>` : ''}<b>${esc(r.problems.join(', '))}</b> ${esc(r.descripcion)}${r.respaldo ? ' · <b>Requiere respaldo</b>' : ''}</p>
      ${r.photos?.length ? `<div class="ph">${r.photos.map((p) => `<a href="${p.data}" target="_blank"><img src="${p.data}" alt="" /></a>`).join('')}</div>` : ''}
    </div>`).join('') : '<p class="muted">Aún no hay reservas en este navegador.</p>';
}
$('#adminList').addEventListener('change', (e) => {
  const s = e.target.closest('select'); if (!s) return;
  const list = loadAll(); const r = list.find((x) => x.code === s.dataset.code); r.status = s.value; saveAll(list);
  toast(`${r.code} → ${s.selectedOptions[0].text}`); renderAdmin();
});
$('#exportCsv').addEventListener('click', () => {
  const cols = ['code', 'created', 'status', 'nombre', 'telefono', 'email', 'rut', 'device', 'modelo', 'problems', 'descripcion', 'mode', 'comuna', 'direccion', 'date', 'slot', 'urgencia', 'estimado'];
  const rows = loadAll().map((r) => cols.map((c) => `"${String(Array.isArray(r[c]) ? r[c].join(' / ') : r[c] ?? '').replace(/"/g, '""')}"`).join(';'));
  const blob = new Blob(['﻿' + cols.join(';') + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `reservas-edvtech-${ymd(new Date())}.csv`; a.click();
});
const checkHash = () => { if (location.hash === '#admin') { renderAdmin(); $('#adminModal').classList.add('show'); } };
window.addEventListener('hashchange', checkHash); checkHash();

$$('.modal').forEach((m) => m.addEventListener('click', (e) => {
  if (e.target === m || e.target.matches('[data-close]')) { m.classList.remove('show'); if (location.hash === '#admin') history.replaceState(null, '', ' '); }
}));

/* ================================================================== */
/* Efectos                                                             */
/* ================================================================== */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }

// nav
addEventListener('scroll', () => $('#nav').classList.toggle('scrolled', scrollY > 30), { passive: true });
$('#burger').addEventListener('click', () => $('#navLinks').classList.toggle('open'));
$$('#navLinks a').forEach((a) => a.addEventListener('click', () => $('#navLinks').classList.remove('open')));


// "Agendar reunión" desde la sección de software: deja elegido el proyecto a medida
document.querySelectorAll('[data-sw-book]').forEach((a) => a.addEventListener('click', () => {
  pickDevice(DEVICES.findIndex((d) => d[0] === 'W2'));
  if (state.step !== 1) goStep(1, false);
}));

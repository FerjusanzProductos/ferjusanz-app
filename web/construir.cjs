// Construye la web de Ferjusanz (web/public/) a partir de:
//   paginas.json    textos de la web antigua (mismas direcciones, para no perder Google) + artículos nuevos
//   novedades.json  fotos y avisos del almacén (los añade la tarea automática cada 2 días)
// Uso: node web/construir.cjs
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const OUT = path.join(DIR, 'public');
const DOMINIO = 'https://www.ferjusanz-frutas-verduras.es';
// Artículos repetidos juntados en uno: no se generan y sus enlaces apuntan al nuevo (el Worker redirige con 301).
const REDIRECCIONES = require('./redirecciones.json');
const paginas = require('./paginas.json').filter(p => !REDIRECCIONES[p.path])
  .map(p => p.html ? { ...p, html: p.html.replace(/\/blog\/[^"'#?\s]+\//g, r => REDIRECCIONES[r] || r) } : p);
const novedades = fs.existsSync(path.join(DIR, 'novedades.json')) ? require('./novedades.json') : [];

// ───────── Datos de la empresa ─────────
const EMPRESA = 'FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.';
const NIF = 'B87446670';
const TEL = '91 763 21 86';
const EMAIL = 'ferjusanz@hotmail.com';
const DIRECCION = 'C/ Carare, 2 · 28033 Madrid';
const HORARIO = 'Lunes a viernes, de 8:00 a 18:00';
const WHATSAPP = [ // los dos móviles de la familia
  { num: '34609100690', ver: '609 100 690' },
  { num: '34609567354', ver: '609 567 354', nombre: 'Fernando' },
];
const ANIOS = 'más de 40 años';

const MENU = [
  ['/productos/', 'Productos'],
  ['/proveedor-de-frutas-y-verduras-para-hosteleria-madrid/', 'Hostelería'],
  ['/mayorista-de-frutas-y-verduras-para-colectividades-madrid/', 'Colectividades'],
  ['/empresa-de-venta-y-distribucion-de-fruta-y-verdura/', 'Quiénes somos'],
  ['/blog/', 'Blog'],
  ['/contacto/', 'Contacto'],
];

const F = '/wp-content/uploads/';
// Familias del catálogo (sacadas de los productos activos de la app, sin precios).
const FAMILIAS = [
  { id: 'frutas', nombre: 'Frutas', ruta: '/productos/frutas-2/', foto: '/fotos/granada-mollar-de-elche.jpg',
    lema: 'De temporada y tropicales, todo el año.',
    lista: ['Manzana', 'Pera', 'Naranja de mesa y de zumo', 'Mandarina y clementina', 'Limón y lima', 'Plátano y banana', 'Kiwi', 'Uva', 'Melón y sandía', 'Piña', 'Mango', 'Aguacate', 'Papaya', 'Maracuyá', 'Granada', 'Caqui', 'Chirimoya', 'Higos y brevas', 'Cereza y picota', 'Melocotón y nectarina', 'Albaricoque', 'Ciruela', 'Fresón', 'Frambuesa, arándano y mora', 'Frutos del bosque', 'Pomelo'] },
  { id: 'verduras', nombre: 'Verduras y hortalizas', ruta: '/productos/verduras-y-hortalizas/', foto: '/fotos/tomate-la-campechana.jpg',
    lema: 'De la huerta a tu cocina en el día.',
    lista: ['Tomate (varias clases)', 'Lechuga y cogollos', 'Escarola y endivias', 'Canónigos, rúcula y kale', 'Espinaca y acelga', 'Brócoli y coliflor', 'Repollo, lombarda y berza', 'Calabacín y calabaza', 'Berenjena', 'Pimiento', 'Pepino', 'Judía verde', 'Alcachofa', 'Espárrago', 'Puerro y apio', 'Zanahoria', 'Remolacha, nabo y chirivía', 'Rabanitos', 'Cardo, borraja y grelos', 'Maíz', 'Brotes y germinados'] },
  { id: 'patatas', nombre: 'Patatas', ruta: '/productos/patatas-2/', foto: F + '2020/09/distribuidor-patatas-beneficios.jpg',
    lema: 'Nuestra especialidad desde el primer día.',
    lista: ['Patata Agria', 'Patata Monalisa', 'Patata nueva para freír', 'Patata roja', 'Patata violeta', 'Patata baby', 'Patata para bravas', 'Patata de tornear', 'Patata cocida', 'Patata prefrita', 'Patata pelada en bastón', 'Patata pelada en dados', 'Patata panadera', 'Patata para ensaladilla', 'Patata pelada envasada al vacío', 'Batata', 'Yuca'] },
  { id: 'cebollas', nombre: 'Cebollas y ajos', ruta: '/distribucion-y-venta-de-cebollas-madrid/', foto: F + '2019/10/distribucion-de-cebollas-en-madrid.jpg',
    lema: 'Con lo que empezó la familia.',
    lista: ['Cebolla en varios calibres', 'Cebolla dulce', 'Cebolla morada', 'Cebolleta', 'Chalota', 'Calçot', 'Ajo', 'Ajetes', 'Cebolla pelada', 'Ajo pelado'] },
  { id: 'huevos', nombre: 'Huevos', ruta: '/productos/huevos/', foto: null,
    lema: 'Frescos, en el mismo reparto que la fruta.',
    lista: ['Huevos de gallina', 'Huevos de codorniz'] },
  { id: 'cuarta', nombre: 'Cuarta gama', ruta: '/distribucion-y-venta-de-productos-de-cuarta-gama-madrid/', foto: F + '2021/05/Conservacion_Frutas_Verdruas.jpg',
    lema: 'Pelado, cortado y listo para la cocina.',
    lista: ['Patata pelada y cortada', 'Patata cocida', 'Cebolla pelada', 'Ajo pelado', 'Ensaladas preparadas', 'Micromezclum y brotes'] },
  { id: 'setas', nombre: 'Setas y champiñones', ruta: '/productos/setas-y-champinones-2/', foto: '/fotos/champinon-y-portobello.jpg',
    lema: 'Champiñón, portobello, setas y shiitake.',
    lista: ['Champiñón', 'Champiñón laminado', 'Champiñón portobello', 'Setas', 'Shiitake'] },
  { id: 'legumbres', nombre: 'Legumbres', ruta: '/distribucion-y-venta-de-legumbres-madrid/', foto: F + '2019/10/venta-de-legumbres-en-madrid.jpg',
    lema: 'Para los guisos de toda la semana.',
    lista: ['Garbanzos', 'Lentejas', 'Judión', 'Arroz', 'Nueces'] },
  { id: 'hierbas', nombre: 'Hierbas y picantes', ruta: null, foto: F + '2020/09/verduras-residencias-ancianos.jpg',
    lema: 'El toque final del plato.',
    lista: ['Perejil', 'Cilantro', 'Albahaca', 'Hierbabuena y menta', 'Eneldo', 'Romero y tomillo', 'Laurel', 'Cebollino', 'Jengibre', 'Guindilla y habanero', 'Ñora', 'Piparras'] },
];

const SECTORES = [
  { nombre: 'Hostelería', ruta: '/proveedor-de-frutas-y-verduras-para-hosteleria-madrid/', foto: F + '2023/03/Tipos-de-guarniciones-de-verduras.jpg',
    texto: 'Restaurantes, bares, hoteles y catering. Género del día y patata, cebolla y ajo ya pelados.' },
  { nombre: 'Colectividades', ruta: '/mayorista-de-frutas-y-verduras-para-colectividades-madrid/', foto: F + '2020/09/frutas-verduras-comedor-colegio.jpg',
    texto: 'Colegios, residencias y comedores de empresa. Cantidades grandes, calidad igual todos los días.' },
  { nombre: 'Fruterías y tiendas', ruta: '/mayorista-de-frutas-y-verduras-madrid/', foto: '/fotos/tomate-rosa.jpg',
    texto: 'Género de primera para el mostrador, con la variedad de Mercamadrid y precio de mayorista.' },
];

const SERVICIOS = [
  ['/mayorista-de-frutas-y-verduras-madrid/', 'Mayorista de frutas y verduras en Madrid'],
  ['/proveedor-de-frutas-y-verduras-para-hosteleria-madrid/', 'Proveedor para hostelería'],
  ['/mayorista-de-frutas-y-verduras-para-colectividades-madrid/', 'Mayorista para colectividades'],
  ['/distribucion-y-venta-de-frutas-madrid/', 'Distribución de frutas'],
  ['/distribucion-y-venta-de-verduras-madrid/', 'Distribución de verduras'],
  ['/distribucion-y-venta-de-hortalizas-madrid/', 'Distribución de hortalizas'],
  ['/distribucion-y-venta-de-patatas-en-madrid/', 'Distribución de patatas'],
  ['/distribucion-y-venta-de-cebollas-madrid/', 'Distribución de cebollas'],
  ['/distribucion-y-venta-de-legumbres-madrid/', 'Distribución de legumbres'],
  ['/distribucion-y-venta-de-productos-de-cuarta-gama-madrid/', 'Productos de cuarta gama'],
  ['/reparto-y-venta-de-patatas-madrid/', 'Reparto de patatas'],
  ['/reparto-y-venta-de-cebollas-madrid/', 'Reparto de cebollas'],
  ['/reparto-y-venta-de-verduras-madrid/', 'Reparto de verduras'],
  ['/reparto-y-venta-de-hortalizas-madrid/', 'Reparto de hortalizas'],
  ['/servicios-de-distribucion-y-exportacion/', 'Distribución y exportación'],
];

const PREGUNTAS = [
  ['¿Cómo os pido precio?', 'Escríbenos por WhatsApp al 609 100 690 o al 609 567 354, o llama al 91 763 21 86. Los precios de la fruta y la verdura cambian cada día según el mercado, por eso te pasamos el del día.'],
  ['¿Repartís en Madrid?', 'Sí. Repartimos con nuestros propios camiones y furgonetas refrigeradas a restaurantes, colegios, residencias, fruterías y colectividades.'],
  ['¿Vendéis también huevos?', 'Sí, huevos de gallina y de codorniz, que te llevamos en el mismo reparto que la fruta y la verdura.'],
  ['¿Tenéis patata pelada y producto cortado?', 'Sí: patata pelada en bastón, en dados, panadera, para ensaladilla o envasada al vacío, y cebolla y ajo pelados.'],
  ['¿De dónde viene el género?', 'Parte es de cosecha propia y de agricultores que conocemos desde hace años; el resto lo elegimos cada mañana en Mercamadrid.'],
  ['¿Cuál es vuestro horario?', HORARIO + '.'],
];

// ───────── Utilidades ─────────
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fecha = iso => iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const tituloCorto = t => String(t).replace(/\s*-\s*Ferjusanz\s*$/i, '');
const anios = s => String(s ?? '').replace(/(m[aá]s de |hace )50 años/gi, (m, a) => (/hace/i.test(a) ? 'hace más de 40 años' : 'más de 40 años'));
const wa = (num, texto) => `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;

// Arreglos al texto antiguo: textos sueltos en <p>, nombre de la empresa y años.
function limpiar(html) {
  return anios(html)
    .split('\n').map(l => (l.trim() && !l.trim().startsWith('<') ? `<p>${l.trim()}</p>` : l)).join('\n')
    .replace(/Ferjusanz C\.\s?B\.,?/g, 'Ferjusanz')
    .replace(/<p>\s*<\/p>/g, '');
}
// Separa el primer <h1> del resto (el h1 va en la cabecera de la página).
function partirH1(html) {
  const m = html.match(/<h1>([\s\S]*?)<\/h1>/);
  if (!m) return { h1: '', resto: html };
  const antes = html.slice(0, m.index).replace(/<[^>]+>/g, '').trim();
  return { h1: m[1].replace(/<[^>]+>/g, '').trim(), resto: html.slice(m.index + m[0].length), antes };
}
const primeraFoto = html => (html.match(/<img src="([^"]+)"/) || [])[1];

// ───────── Iconos (dibujo propio, de línea) ─────────
const I = {
  wa: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.5-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.4Z"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>',
  camion: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4h14v12H1zM15 9h4l3 3v4h-7z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></g></svg>',
  hoja: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-6 6-10 16-10 0 10-4 17-9 17Z"/><path d="M4 21c3-6 7-9 12-11"/></g></svg>',
  familia: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.4 1-4.3 3-5 2 .7 3 2.6 3 5"/></g></svg>',
  reloj: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g></svg>',
  flecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>',
  huevo: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 6c-10 0-20 17-20 31a20 20 0 0 0 40 0C52 23 42 6 32 6Z"/></svg>',
};

// ───────── Piezas ─────────
const botonesWA = (texto, clase = '') => `<div class="acciones ${clase}">${WHATSAPP.map((w, i) =>
  `<a class="btn ${i ? 'btn-claro' : 'btn-wa'}" href="${wa(w.num, texto)}" rel="nofollow">${I.wa}<span>WhatsApp ${w.ver}${w.nombre ? ` <small>(${w.nombre})</small>` : ''}</span></a>`).join('')}</div>`;

const tarjetaFamilia = f => {
  const foto = f.foto ? `<img src="${f.foto}" alt="${esc(f.nombre)} al por mayor en Madrid" loading="lazy" width="600" height="450">`
    : `<span class="sin-foto">${I.huevo}${I.huevo}${I.huevo}</span>`;
  const destino = f.ruta || wa(WHATSAPP[0].num, `Hola, quería precio de ${f.nombre.toLowerCase()}.`);
  return `<a class="producto" href="${destino}"${f.ruta ? '' : ' rel="nofollow"'}>
  <span class="producto-foto">${foto}</span>
  <span class="producto-info"><strong>${f.nombre}</strong><span>${f.lema}</span><em>Pedir precio ${I.flecha}</em></span>
</a>`;
};

const tarjetaArticulo = a => `<a class="articulo" href="${a.path}">
  <span class="articulo-foto">${a.ogImage ? `<img src="${a.ogImage}" alt="" loading="lazy" width="600" height="375">` : ''}</span>
  <span class="articulo-info"><time datetime="${(a.date || '').slice(0, 10)}">${fecha(a.date)}</time><strong>${esc(tituloCorto(a.h1 || a.title))}</strong></span>
</a>`;

const tarjetaNovedad = n => `<figure class="novedad">
  <img src="${n.foto}" alt="${esc(n.alt || n.titulo)}" loading="lazy" width="600" height="600">
  <figcaption><time datetime="${n.fecha}">${fecha(n.fecha)}</time><strong>${esc(n.titulo)}</strong>${n.texto ? `<span>${esc(n.texto)}</span>` : ''}</figcaption>
</figure>`;

const miga = (ruta, nombre, padre) => {
  const items = [['/', 'Inicio']];
  if (padre) items.push(padre);
  items.push([ruta, nombre]);
  return {
    html: `<nav class="miga" aria-label="Estás en">${items.map(([h, t], i) => i < items.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`).join('<span aria-hidden="true">/</span>')}</nav>`,
    datos: { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([h, t], i) => ({ '@type': 'ListItem', position: i + 1, name: t, item: DOMINIO + h })) },
  };
};

const NEGOCIO = {
  '@context': 'https://schema.org', '@type': 'WholesaleStore', '@id': DOMINIO + '/#empresa',
  name: 'Ferjusanz', legalName: EMPRESA, taxID: NIF, url: DOMINIO + '/',
  description: `Mayorista de fruta, verdura, patatas y huevos en Madrid para hostelería, colectividades y fruterías. Tercera generación, ${ANIOS} en el sector.`,
  telephone: '+34917632186', email: EMAIL, logo: DOMINIO + F + '2019/10/logotipo.png', image: DOMINIO + F + '2019/10/proveedores-distribucion_crs2.jpg',
  address: { '@type': 'PostalAddress', streetAddress: 'C/ Carare, 2', postalCode: '28033', addressLocality: 'Madrid', addressRegion: 'Madrid', addressCountry: 'ES' },
  areaServed: 'Comunidad de Madrid',
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' }],
  contactPoint: WHATSAPP.map(w => ({ '@type': 'ContactPoint', telephone: '+' + w.num, contactType: 'sales', availableLanguage: 'es' })),
};

// Fotos propias del puesto (web/public/fotos/, 13/11/2026) y en qué páginas salen.
const FOTO = {
  'tomate-asurcado': 'Tomate asurcado', 'tomate-la-campechana': 'Tomate de La Campechana', 'tomate-de-temporada': 'Tomate de temporada en caja de madera',
  'tomate-rosa': 'Tomate rosa', 'niscalos': 'Níscalos de temporada', 'setas-de-ostra': 'Setas de ostra (Cuenca)',
  'champinon-y-portobello': 'Champiñón blanco y portobello', 'pitahaya-amarilla': 'Pitahaya amarilla', 'mango-y-papaya': 'Mango listo para comer, papaya y naranja',
  'granada-mollar-de-elche': 'Granada Mollar de Elche D.O.P.', 'grosellas-rojas': 'Grosellas rojas',
  'verduras-gourmet-hosteleria': 'Tomates, pepino mini, tirabeque, tamarillo, pimiento snack, cherry y arándanos para hostelería',
};
const GALERIAS = {
  '/productos/': ['mango-y-papaya', 'verduras-gourmet-hosteleria', 'niscalos', 'tomate-asurcado'],
  '/productos/frutas-2/': ['mango-y-papaya', 'pitahaya-amarilla', 'granada-mollar-de-elche', 'grosellas-rojas'],
  '/productos/verduras-y-hortalizas/': ['verduras-gourmet-hosteleria', 'tomate-asurcado', 'tomate-rosa', 'tomate-la-campechana'],
  '/productos/setas-y-champinones-2/': ['niscalos', 'setas-de-ostra', 'champinon-y-portobello'],
  '/mayorista-de-frutas-y-verduras-madrid/': ['verduras-gourmet-hosteleria', 'niscalos', 'tomate-rosa', 'mango-y-papaya'],
  '/proveedor-de-frutas-y-verduras-para-hosteleria-madrid/': ['verduras-gourmet-hosteleria', 'setas-de-ostra', 'tomate-asurcado', 'grosellas-rojas'],
  '/distribucion-y-venta-de-frutas-madrid/': ['granada-mollar-de-elche', 'mango-y-papaya', 'pitahaya-amarilla', 'grosellas-rojas'],
  '/distribucion-y-venta-de-verduras-madrid/': ['tomate-rosa', 'champinon-y-portobello', 'tomate-de-temporada'],
  '/distribucion-y-venta-de-hortalizas-madrid/': ['tomate-de-temporada', 'verduras-gourmet-hosteleria', 'tomate-asurcado'],
  '/empresa-de-venta-y-distribucion-de-fruta-y-verdura/': ['tomate-la-campechana', 'niscalos', 'granada-mollar-de-elche', 'champinon-y-portobello'],
  '/blog/tipos-de-tomates/': ['tomate-asurcado', 'tomate-la-campechana', 'tomate-de-temporada', 'tomate-rosa'],
  '/blog/setas-y-champinones-beneficios-salud/': ['niscalos', 'setas-de-ostra', 'champinon-y-portobello'],
  '/blog/frutas-exoticas-como-conservarlas/': ['pitahaya-amarilla', 'mango-y-papaya'],
  '/blog/frutas-tropicales-propiedades-y-beneficios-para-la-salud/': ['mango-y-papaya', 'pitahaya-amarilla'],
  '/blog/todo-sobre-los-frutos-rojos/': ['grosellas-rojas', 'verduras-gourmet-hosteleria'],
  '/blog/frutas-de-temporada-otono/': ['granada-mollar-de-elche', 'niscalos'],
};
const galeria = ruta => GALERIAS[ruta] ? `<section class="bloque bloque-crema"><div class="envoltura">
  <div class="bloque-cabeza"><div><p class="antetitulo">Fotos reales</p><h2>Hoy en nuestro puesto de Mercamadrid</h2></div><a class="enlace" href="/novedades/">Más fotos ${I.flecha}</a></div>
  <div class="novedades">${GALERIAS[ruta].map(n => `<figure class="novedad"><img src="/fotos/${n}.jpg" alt="${esc(FOTO[n])} en el puesto de Ferjusanz en Mercamadrid" loading="lazy" width="600" height="600"><figcaption><strong>${esc(FOTO[n])}</strong></figcaption></figure>`).join('')}</div>
</div></section>` : '';

// ───────── Plantilla ─────────
function plantilla({ ruta, titulo, descripcion, imagen, cuerpo, datos = [], tipo = 'website' }) {
  const nav = MENU.map(([h, t]) => `<a href="${h}"${ruta === h || (h !== '/' && ruta.startsWith(h)) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const og = imagen || F + '2019/10/proveedores-distribucion_crs2.jpg';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(anios(titulo))}</title>
<meta name="description" content="${esc(anios(descripcion))}">
<link rel="canonical" href="${DOMINIO}${ruta}">
<meta property="og:type" content="${tipo}">
<meta property="og:site_name" content="Ferjusanz">
<meta property="og:title" content="${esc(anios(titulo))}">
<meta property="og:description" content="${esc(anios(descripcion))}">
<meta property="og:url" content="${DOMINIO}${ruta}">
<meta property="og:locale" content="es_ES">
<meta property="og:image" content="${DOMINIO}${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${F}2019/10/cropped-logo-144px-32x32.jpg" sizes="32x32">
<link rel="apple-touch-icon" href="${F}2019/10/cropped-logo-144px-180x180.jpg">
<meta name="theme-color" content="#5a0d10">
<link rel="preload" href="/fuentes/fraunces-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fuentes/figtree-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/estilo.css">
${datos.map(d => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join('\n')}
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="aviso"><span>Género fresco cada día</span><span>Reparto en Madrid</span><span class="solo-ancho">${HORARIO}</span><a href="tel:+34917632186">${TEL}</a></div>
<header class="cabecera">
  <div class="cabecera-in">
    <a href="/" class="logo" aria-label="Ferjusanz, inicio"><img src="${F}2019/10/logotipo.png" alt="Ferjusanz" width="185" height="32"></a>
    <nav class="menu-ancho" aria-label="Principal">${nav}</nav>
    <a class="btn btn-wa btn-cab" href="#pedir-precio">${I.wa}<span>Pedir precio</span></a>
    <details class="menu"><summary aria-label="Abrir menú"><span></span><span></span><span></span></summary><nav aria-label="Menú">${nav}<a href="#pedir-precio" class="btn btn-wa">${I.wa}<span>Pedir precio por WhatsApp</span></a></nav></details>
  </div>
</header>
<main id="contenido">
${cuerpo}
</main>
<section class="pedir" id="pedir-precio">
  <div class="envoltura pedir-in">
    <div>
      <p class="antetitulo">Precio del día</p>
      <h2>¿Quieres precios? Escríbenos por WhatsApp.</h2>
      <p>Dinos qué necesitas y para qué negocio. Te pasamos el precio del mercado de hoy, sin compromiso.</p>
    </div>
    <div class="pedir-botones">
      ${botonesWA('Hola, quería información de precios para mi negocio.')}
      <a class="btn btn-borde" href="tel:+34917632186">${I.tel}<span>Llamar al ${TEL}</span></a>
    </div>
  </div>
</section>
<footer class="pie">
  <div class="envoltura pie-col">
    <div>
      <img src="${F}2019/10/logotipo.png" alt="Ferjusanz" width="185" height="32" loading="lazy">
      <p>Tercera generación de mayoristas de fruta, verdura, patatas y huevos. ${ANIOS[0].toUpperCase() + ANIOS.slice(1)} alegrando la mesa de Madrid.</p>
      <p><a href="tel:+34917632186">${TEL}</a> · <a href="mailto:${EMAIL}">${EMAIL}</a><br>WhatsApp ${WHATSAPP.map(w => `<a href="${wa(w.num, 'Hola')}" rel="nofollow">${w.ver}</a>`).join(' · ')}<br>${DIRECCION}<br>${HORARIO}</p>
    </div>
    <div>
      <h2>Productos</h2>
      <ul>${FAMILIAS.filter(f => f.ruta).map(f => `<li><a href="${f.ruta}">${f.nombre}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Servicios</h2>
      <ul>${SERVICIOS.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h2>Ferjusanz</h2>
      <ul><li><a href="/empresa-de-venta-y-distribucion-de-fruta-y-verdura/">Quiénes somos</a></li><li><a href="/novedades/">Novedades del almacén</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contacto/">Contacto</a></li><li><a href="/aviso-legal/">Aviso legal</a></li><li><a href="/politica-de-privacidad/">Privacidad</a></li><li><a href="/politica-de-cookies/">Cookies</a></li></ul>
    </div>
  </div>
  <p class="envoltura pie-legal">© ${new Date().getFullYear()} ${EMPRESA} · NIF ${NIF}</p>
</footer>
<div class="barra-movil">
  <details class="wa-flotante">
    <summary>${I.wa}<span>WhatsApp</span></summary>
    <div class="wa-opciones"><p>¿Con quién quieres hablar?</p>${WHATSAPP.map(w => `<a href="${wa(w.num, 'Hola, quería información.')}" rel="nofollow">${I.wa}<span>${w.ver}${w.nombre ? ` · ${w.nombre}` : ''}</span></a>`).join('')}</div>
  </details>
  <a class="llamar" href="tel:+34917632186">${I.tel}<span>Llamar</span></a>
</div>
</body>
</html>
`;
}

function escribir(ruta, html) {
  const f = path.join(OUT, ruta, 'index.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}

// Cabecera de página interior: miga, h1, entradilla y (si hay) foto.
const cabeceraPagina = (m, h1, entradilla, foto) => `<section class="titular${foto ? ' con-foto' : ''}">
  <div class="envoltura titular-in">
    <div>${m.html}<h1>${esc(h1)}</h1>${entradilla ? `<p class="entradilla">${entradilla}</p>` : ''}${botonesWA(`Hola, quería información sobre: ${h1}.`)}</div>
    ${foto ? `<div class="titular-foto"><img src="${foto}" alt="${esc(h1)}" width="800" height="560"></div>` : ''}
  </div>
</section>`;

// ───────── Páginas ─────────
const articulos = paginas.filter(p => p.isPost).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const ultimasNovedades = [...novedades].sort((a, b) => b.fecha.localeCompare(a.fecha));
const familiaDeRuta = r => FAMILIAS.find(f => f.ruta === r);
const sitemap = [];

function inicio(p) {
  const textoWA = 'Hola, quería el precio de hoy para mi negocio.';
  const mosaico = ['verduras-gourmet-hosteleria', 'niscalos', 'granada-mollar-de-elche', 'tomate-asurcado', 'mango-y-papaya', 'champinon-y-portobello', 'tomate-la-campechana'];
  const cuerpo = `
<section class="heroe" style="--foto:url(/fotos/tomate-la-campechana.jpg)">
  <div class="envoltura heroe-in">
    <p class="antetitulo">Mayoristas en Mercamadrid · 3.ª generación</p>
    <h1>Tu proveedor de fruta, verdura, patatas y huevos en Madrid</h1>
    <p class="entradilla">Para restaurantes, bares, colegios, residencias y fruterías. Elegido cada mañana por la misma familia desde hace ${ANIOS}.</p>
    <div class="heroe-acciones">
      <a class="btn btn-wa btn-grande" href="${wa(WHATSAPP[0].num, textoWA)}" rel="nofollow">${I.wa}<span>Pide el precio de hoy</span></a>
      <a class="btn btn-transparente" href="#catalogo"><span>Ver productos</span>${I.flecha}</a>
    </div>
    <p class="heroe-nota">Por WhatsApp · Sin compromiso</p>
  </div>
</section>

<section class="cifras" aria-label="Ferjusanz en cifras">
  <div class="envoltura cifras-in">
    <div><strong>+40</strong><span>años en el sector</span></div>
    <div><strong>3.ª</strong><span>generación de la familia</span></div>
    <div><strong>+200</strong><span>productos frescos</span></div>
    <div><strong>1</strong><span>solo pedido para todo</span></div>
  </div>
</section>

<section class="bloque">
  <div class="envoltura">
    <div class="bloque-cabeza centrada"><div><p class="antetitulo">¿Te suena?</p><h2>Comprar género no debería darte dolores de cabeza</h2></div></div>
    <div class="dolores">
      <div class="dolor"><p class="dolor-mal">El género llega flojo y lo pagas como bueno.</p><p class="dolor-bien">${I.hoja}<span><strong>Elegido caja a caja</strong> a primera hora en Mercamadrid, y parte de cosecha propia.</span></p></div>
      <div class="dolor"><p class="dolor-mal">Cinco proveedores, cinco repartos y cinco albaranes.</p><p class="dolor-bien">${I.camion}<span><strong>Todo en un pedido</strong>: fruta, verdura, patata pelada, huevos y setas.</span></p></div>
      <div class="dolor"><p class="dolor-mal">Llamas y nadie te coge el teléfono.</p><p class="dolor-bien">${I.familia}<span><strong>Hablas con la familia</strong>, directamente por WhatsApp.</span></p></div>
    </div>
  </div>
</section>

<section class="bloque bloque-crema" id="catalogo">
  <div class="envoltura">
    <div class="bloque-cabeza"><div><p class="antetitulo">Catálogo</p><h2>Lo que te llevamos a la cocina</h2></div><a class="enlace" href="/productos/">Ver catálogo completo ${I.flecha}</a></div>
    <div class="productos">${FAMILIAS.slice(0, 8).map(tarjetaFamilia).join('\n')}</div>
  </div>
</section>

<section class="bloque">
  <div class="envoltura">
    <div class="bloque-cabeza"><div><p class="antetitulo">Fotos reales, sin retoques</p><h2>Así está hoy nuestro puesto en Mercamadrid</h2></div><a class="enlace" href="/novedades/">Ver más fotos ${I.flecha}</a></div>
    <div class="mosaico">${mosaico.map((n, i) => `<a href="/novedades/" class="mosaico-${i}"><img src="/fotos/${n}.jpg" alt="${esc(FOTO[n])} en el puesto de Ferjusanz" loading="lazy" width="600" height="600"></a>`).join('')}</div>
  </div>
</section>

<section class="bloque bloque-crema">
  <div class="envoltura">
    <div class="bloque-cabeza"><div><p class="antetitulo">Para tu negocio</p><h2>Trabajamos para quien cocina y vende cada día</h2></div></div>
    <div class="sectores">${SECTORES.map(s => `<a class="sector" href="${s.ruta}"><span class="sector-foto"><img src="${s.foto}" alt="" loading="lazy" width="600" height="400"></span><strong>${s.nombre}</strong><span>${s.texto}</span><em>Ver cómo trabajamos ${I.flecha}</em></a>`).join('')}</div>
  </div>
</section>

<section class="bloque historia">
  <div class="envoltura historia-in">
    <div class="historia-fotos">
      <img src="${F}2019/10/proveedores-distribucion_crs2.jpg" alt="Camión de reparto de Ferjusanz" loading="lazy" width="621" height="465">
      <img src="/fotos/tomate-de-temporada.jpg" alt="Caja de tomate de temporada en el puesto de Ferjusanz" loading="lazy" width="619" height="1100">
    </div>
    <div>
      <p class="antetitulo">Nuestra historia</p>
      <h2>Tres generaciones alegrando la mesa de Madrid</h2>
      <p>Empezamos con las patatas y las cebollas hace ${ANIOS}. El abuelo, luego el padre y hoy el hijo: la misma familia, el mismo trato y la misma manera de elegir el género.</p>
      <p>Lo que no cultivamos nosotros lo escogemos a primera hora en Mercamadrid, y sale en nuestros camiones refrigerados hacia tu cocina.</p>
      <blockquote class="firma">«Si no lo pondríamos en nuestra mesa, no lo llevamos a la tuya.»</blockquote>
      <a class="enlace" href="/empresa-de-venta-y-distribucion-de-fruta-y-verdura/">Conoce a la familia ${I.flecha}</a>
    </div>
  </div>
</section>

<section class="bloque bloque-granate">
  <div class="envoltura">
    <div class="bloque-cabeza centrada"><div><p class="antetitulo">Así de fácil</p><h2>Tu primer pedido, en tres pasos</h2></div></div>
    <ol class="pasos">
      <li><span>1</span><strong>Nos escribes</strong><p>Por WhatsApp: qué necesitas, cuánto y para cuándo.</p></li>
      <li><span>2</span><strong>Te pasamos el precio de hoy</strong><p>El del mercado de esa mañana. Sin compromiso.</p></li>
      <li><span>3</span><strong>Lo llevamos a tu puerta</strong><p>En camión o furgoneta refrigerados.</p></li>
    </ol>
    <div class="centro"><a class="btn btn-wa btn-grande" href="${wa(WHATSAPP[0].num, textoWA)}" rel="nofollow">${I.wa}<span>Empezar por WhatsApp</span></a></div>
  </div>
</section>

<section class="bloque">
  <div class="envoltura preguntas-in">
    <div><p class="antetitulo">Preguntas frecuentes</p><h2>Lo que nos preguntan antes del primer pedido</h2><p class="entradilla">¿Otra duda? Escríbenos y te contestamos nosotros, no un robot.</p></div>
    <div class="preguntas">${PREGUNTAS.map(([q, r]) => `<details><summary>${q}</summary><p>${r}</p></details>`).join('')}</div>
  </div>
</section>

<section class="bloque bloque-crema">
  <div class="envoltura">
    <div class="bloque-cabeza"><div><p class="antetitulo">Blog</p><h2>Temporadas, consejos y recetas</h2></div><a class="enlace" href="/blog/">Ver todos ${I.flecha}</a></div>
    <div class="articulos">${articulos.slice(0, 3).map(tarjetaArticulo).join('')}</div>
  </div>
</section>`;
  return plantilla({
    ruta: '/',
    titulo: 'Ferjusanz | Mayorista de fruta, verdura, patatas y huevos en Madrid',
    descripcion: `Proveedor de fruta, verdura, patatas y huevos para hostelería, colectividades y fruterías en Madrid. Tercera generación, ${ANIOS}, cosecha propia y reparto diario. Pide precio por WhatsApp.`,
    cuerpo,
    datos: [NEGOCIO, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Ferjusanz', url: DOMINIO + '/' },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: PREGUNTAS.map(([q, r]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: r } })) }],
  });
}

function catalogo(p) {
  const m = miga('/productos/', 'Productos');
  const cuerpo = `${cabeceraPagina(m, 'Catálogo de fruta, verdura, patatas y huevos al por mayor', 'Más de 200 productos frescos cada día. No publicamos precios porque cambian con el mercado: pídenos el de hoy por WhatsApp.')}
<section class="bloque"><div class="envoltura">
  <div class="productos">${FAMILIAS.map(tarjetaFamilia).join('\n')}</div>
  <div class="familias">${FAMILIAS.map(f => `<div class="familia"><h2>${f.nombre}</h2><ul class="chips">${f.lista.map(x => `<li>${x}</li>`).join('')}</ul>${f.ruta ? `<a class="enlace" href="${f.ruta}">Ver ${f.nombre.toLowerCase()} ${I.flecha}</a>` : ''}</div>`).join('')}</div>
</div></section>
${galeria('/productos/')}`;
  return plantilla({ ruta: '/productos/', titulo: p.title, descripcion: p.description, cuerpo,
    datos: [m.datos, { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: FAMILIAS.filter(f => f.ruta).map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.nombre, url: DOMINIO + f.ruta })) }] });
}

// Página de una familia de productos: foto + variedades + pedir precio, y debajo el texto de siempre.
function paginaFamilia(p, f, textoHtml) {
  const m = miga(p.path, f.nombre, ['/productos/', 'Productos']);
  const { h1, resto } = partirH1(limpiar(textoHtml));
  const cuerpo = `<section class="ficha"><div class="envoltura ficha-in">
  <div class="ficha-foto">${f.foto ? `<img src="${f.foto}" alt="${esc(f.nombre)} al por mayor en Madrid" width="800" height="600" fetchpriority="high">` : `<span class="sin-foto grande">${I.huevo}${I.huevo}${I.huevo}</span>`}</div>
  <div class="ficha-info">
    ${m.html}
    <h1>${esc(h1 || f.nombre)}</h1>
    <p class="entradilla">${f.lema} Precio según el mercado de cada día.</p>
    <h2 class="pequeno">Lo que solemos tener</h2>
    <ul class="chips">${f.lista.map(x => `<li>${x}</li>`).join('')}</ul>
    ${botonesWA(`Hola, quería precio de ${f.nombre.toLowerCase()} para mi negocio.`, 'apiladas')}
    <ul class="garantias"><li>${I.camion} Reparto en camión refrigerado</li><li>${I.hoja} Cosecha propia y Mercamadrid</li><li>${I.reloj} ${HORARIO}</li></ul>
  </div>
</div></section>
<section class="bloque"><div class="envoltura"><article class="texto">${resto}</article></div></section>
${galeria(p.path)}
${relacionados(p.path)}`;
  return plantilla({ ruta: p.path, titulo: p.title, descripcion: p.description, imagen: f.foto, cuerpo, datos: [m.datos] });
}

function relacionados(ruta) {
  const otras = FAMILIAS.filter(f => f.ruta && f.ruta !== ruta).slice(0, 4);
  return `<section class="bloque bloque-crema"><div class="envoltura">
  <div class="bloque-cabeza"><div><h2>También te llevamos</h2></div><a class="enlace" href="/productos/">Todo el catálogo ${I.flecha}</a></div>
  <div class="productos">${otras.map(tarjetaFamilia).join('')}</div>
</div></section>`;
}

// Páginas de servicio y de sector (textos de siempre con el diseño nuevo).
function paginaTexto(p, opciones = {}) {
  const { h1, resto } = partirH1(limpiar(p.html));
  const foto = opciones.foto || p.foto || primeraFoto(resto);
  const sinFotoRepetida = foto ? resto.replace(new RegExp(`<p>\\s*<img src="${foto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>\\s*</p>|<img src="${foto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`), '') : resto;
  const titulo = h1 || tituloCorto(p.title);
  const m = miga(p.path, opciones.miga || titulo, opciones.padre);
  const cuerpo = `${cabeceraPagina(m, titulo, opciones.entradilla || '', foto)}
<section class="bloque"><div class="envoltura columnas-texto">
  <article class="texto">${opciones.antes || ''}${sinFotoRepetida}</article>
  <aside class="lateral">
    <div class="lateral-caja">
      <p class="antetitulo">Precio del día</p>
      <strong>Pídenos precio por WhatsApp</strong>
      ${botonesWA(`Hola, quería información: ${titulo}.`, 'apiladas')}
      <ul class="garantias"><li>${I.familia} 3.ª generación, ${ANIOS}</li><li>${I.camion} Reparto diario en Madrid</li><li>${I.reloj} ${HORARIO}</li></ul>
    </div>
  </aside>
</div></section>
${galeria(p.path)}
${opciones.despues || ''}
${relacionados('')}`;
  return plantilla({ ruta: p.path, titulo: p.title, descripcion: p.description, imagen: foto, cuerpo, datos: [m.datos, ...(opciones.datos || [])] });
}

function blog(p) {
  const m = miga('/blog/', 'Blog');
  const cuerpo = `${cabeceraPagina(m, 'Blog de fruta y verdura', 'Temporadas, consejos de cocina y conservación, y lo que llega cada semana al almacén.')}
<section class="bloque"><div class="envoltura"><div class="articulos">${articulos.map(tarjetaArticulo).join('\n')}</div></div></section>`;
  return plantilla({ ruta: '/blog/', titulo: 'Blog de fruta y verdura | Ferjusanz', descripcion: 'Consejos, temporadas y recetas con fruta, verdura y patatas, de una familia de mayoristas de Madrid con más de 40 años en el sector.', cuerpo, datos: [m.datos] });
}

function articulo(p) {
  const titulo = tituloCorto(p.h1 || p.title);
  const m = miga(p.path, titulo, ['/blog/', 'Blog']);
  const otros = articulos.filter(a => a.path !== p.path).slice(0, 3);
  const cuerpo = `<article class="bloque"><div class="envoltura lectura">
  ${m.html}
  <h1>${esc(titulo)}</h1>
  <p class="meta"><time datetime="${(p.date || '').slice(0, 10)}">${fecha(p.date)}</time> · Ferjusanz</p>
  ${p.ogImage ? `<img class="destacada" src="${p.ogImage}" alt="${esc(titulo)}" width="1200" height="750" fetchpriority="high">` : ''}
  <div class="texto">${limpiar(p.html)}</div>
  <aside class="nota"><strong>¿Tienes un restaurante, un colegio o una frutería?</strong><p>Te llevamos la fruta, la verdura, las patatas y los huevos cada día. Pídenos precio.</p>${botonesWA('Hola, he leído vuestro blog y quería información de precios.')}</aside>
</div></article>
${galeria(p.path)}
<section class="bloque"><div class="envoltura"><div class="bloque-cabeza"><div><h2>Más artículos</h2></div><a class="enlace" href="/blog/">Ver el blog ${I.flecha}</a></div><div class="articulos">${otros.map(tarjetaArticulo).join('')}</div></div></section>`;
  return plantilla({ ruta: p.path, titulo: p.title, descripcion: p.description, imagen: p.ogImage, tipo: 'article', cuerpo, datos: [m.datos, {
    '@context': 'https://schema.org', '@type': 'BlogPosting', headline: titulo, datePublished: p.date, dateModified: p.modified || p.date,
    image: p.ogImage ? DOMINIO + p.ogImage : undefined, mainEntityOfPage: DOMINIO + p.path, description: p.description,
    author: { '@type': 'Organization', name: 'Ferjusanz' }, publisher: { '@id': DOMINIO + '/#empresa' } }] });
}

function contacto(p) {
  const m = miga('/contacto/', 'Contacto');
  const cuerpo = `${cabeceraPagina(m, 'Contacto: pide precio de fruta, verdura, patatas y huevos', 'La forma más rápida es WhatsApp: te pasamos el precio del mercado de ese día.')}
<section class="bloque"><div class="envoltura contacto-in">
  <div class="contacto-caja"><h2>WhatsApp</h2>${botonesWA('Hola, quería información de precios para mi negocio.', 'apiladas')}</div>
  <div class="contacto-caja"><h2>Teléfono y correo</h2><p><a class="grande" href="tel:+34917632186">${TEL}</a></p><p><a href="mailto:${EMAIL}">${EMAIL}</a></p></div>
  <div class="contacto-caja"><h2>Dónde estamos</h2><p>${DIRECCION}</p><p>${HORARIO}</p><p><a class="enlace" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Calle Carare 2, 28033 Madrid')}" rel="nofollow">Cómo llegar ${I.flecha}</a></p></div>
</div></section>`;
  return plantilla({ ruta: '/contacto/', titulo: p.title, descripcion: p.description, cuerpo, datos: [m.datos, NEGOCIO] });
}

function empresa(p) {
  const antes = `<p class="entradilla">Somos ${EMPRESA}: una empresa familiar que va ya por la tercera generación, con ${ANIOS} vendiendo y repartiendo fruta, verdura, patatas y huevos en Madrid.</p>
<h2>De padres a hijos</h2>
<p>Lo que empezó con patatas y cebollas es hoy un catálogo de más de 200 productos frescos. Ha cambiado el tamaño, pero no la forma de trabajar: elegir el género uno mismo, cumplir con la hora de entrega y coger el teléfono cuando un cliente llama.</p>
<h2>Cosecha propia</h2>
<p>Buena parte de lo que vendemos lo cultivamos o lo supervisamos en el campo, con agricultores con los que trabajamos desde hace años. Así lo recogemos en su punto y sabemos de dónde viene cada caja.</p>`;
  return paginaTexto(p, { antes, entradilla: 'Tercera generación de mayoristas. Más de 40 años alegrando la mesa de Madrid.', miga: 'Quiénes somos', foto: F + '2019/10/proveedores-distribucion_crs2.jpg' });
}

function paginaNovedades() {
  const m = miga('/novedades/', 'Novedades');
  const cuerpo = `${cabeceraPagina(m, 'Novedades del almacén', 'Lo que entra de temporada, cómo viene el género y lo que preparamos para nuestros clientes.')}
<section class="bloque"><div class="envoltura"><div class="novedades">${ultimasNovedades.map(tarjetaNovedad).join('\n')}</div></div></section>`;
  return plantilla({ ruta: '/novedades/', titulo: 'Novedades del almacén | Ferjusanz', descripcion: 'Fotos y novedades de fruta, verdura y patatas de temporada desde el almacén de Ferjusanz en Madrid.', cuerpo, datos: [m.datos] });
}

function paginaLegal(ruta, titulo, html) {
  const m = miga(ruta, titulo);
  const cuerpo = `<section class="bloque"><div class="envoltura lectura">${m.html}<h1>${titulo}</h1><div class="texto">${html}</div></div></section>`;
  return plantilla({ ruta, titulo: `${titulo} | Ferjusanz`, descripcion: `${titulo} de la web de ${EMPRESA}.`, cuerpo, datos: [m.datos] });
}

// ───────── Páginas nuevas (no estaban en la web antigua) ─────────
const NUEVAS = [
  { path: '/productos/huevos/', familia: 'huevos', title: 'Huevos al por mayor para hostelería en Madrid | Ferjusanz',
    description: 'Huevos de gallina y de codorniz al por mayor para restaurantes, colegios, residencias y fruterías de Madrid, en el mismo reparto que la fruta y la verdura.',
    html: `<h1>Huevos al por mayor en Madrid</h1>
<p>Además de fruta, verdura y patatas, llevamos <strong>huevos frescos</strong> a restaurantes, bares, colegios, residencias y fruterías de Madrid. Así recibes todo en un solo pedido y un solo reparto.</p>
<h2>Huevos de gallina y de codorniz</h2>
<p>Trabajamos huevo de gallina para cocina diaria (tortillas, rebozados, repostería, desayunos) y huevo de codorniz para tapas, ensaladas y presentaciones.</p>
<h2>Por qué pedir los huevos con la fruta</h2>
<ul><li><strong>Un solo proveedor</strong>: menos llamadas, menos albaranes y una sola entrega.</li><li><strong>Reparto refrigerado</strong> en nuestros camiones y furgonetas.</li><li><strong>Precio de mayorista</strong>, según cantidad y frecuencia.</li></ul>
<p>Dinos cuántas docenas necesitas a la semana y te pasamos precio.</p>` },
  { path: '/proveedor-de-frutas-y-verduras-para-hosteleria-madrid/', foto: F + '2023/03/Tipos-de-guarniciones-de-verduras.jpg', title: 'Proveedor de frutas y verduras para hostelería en Madrid | Ferjusanz',
    description: 'Proveedor de fruta, verdura, patatas peladas y huevos para restaurantes, bares, hoteles y catering en Madrid. Tercera generación, reparto diario y precio del mercado.',
    html: `<h1>Proveedor de frutas y verduras para hostelería en Madrid</h1>
<p>Un restaurante vive de su género. Por eso llevamos ${ANIOS} sirviendo a <strong>restaurantes, bares, hoteles y empresas de catering</strong> de Madrid con fruta, verdura, patatas y huevos elegidos cada mañana.</p>
<h2>Lo que necesita una cocina, en un solo pedido</h2>
<ul><li><strong>Verdura y hortaliza</strong> de temporada para guarniciones, ensaladas y menús del día.</li><li><strong>Patata</strong> para freír, cocer o asar, y <strong>patata pelada</strong> en bastón, dados o panadera, lista para la freidora.</li><li><strong>Cebolla y ajo pelados</strong>, para ahorrar horas de cocina.</li><li><strong>Fruta</strong> para postres, zumos y desayunos, también tropical.</li><li><strong>Hierbas frescas</strong> y <strong>huevos</strong> de gallina y de codorniz.</li></ul>
<h2>Cómo trabajamos con la hostelería</h2>
<p>Nos mandas el pedido por WhatsApp, te confirmamos el precio del día y te lo llevamos en nuestros camiones y furgonetas refrigerados.</p>
<h2>Por qué Ferjusanz</h2>
<p>Somos la tercera generación de una familia de mayoristas, con cosecha propia y puesto en Mercamadrid. Conocemos el producto y conocemos las prisas de una cocina.</p>` },
];
// Páginas legales: datos reales de la empresa; sin datos del Registro Mercantil (pendiente de que Fernando los dé).
const LEGALES = [
  ['/aviso-legal/', 'Aviso legal', `<p>En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), estos son los datos del titular de esta web:</p>
<ul><li><strong>Titular</strong>: ${EMPRESA}</li><li><strong>NIF</strong>: ${NIF}</li><li><strong>Domicilio</strong>: ${DIRECCION}</li><li><strong>Teléfono</strong>: ${TEL}</li><li><strong>Correo</strong>: <a href="mailto:${EMAIL}">${EMAIL}</a></li></ul>
<h2>Uso de la web</h2><p>Esta web informa sobre los productos y servicios de ${EMPRESA}. Los precios no se publican porque dependen del mercado de cada día; cualquier precio que te demos por teléfono o WhatsApp es orientativo hasta que se confirma el pedido.</p>
<h2>Propiedad intelectual</h2><p>Los textos, el logotipo y el diseño de esta web pertenecen a ${EMPRESA} o se usan con permiso. No se pueden copiar con fines comerciales sin autorización.</p>
<h2>Responsabilidad</h2><p>Procuramos que la información sea correcta y esté al día, pero no respondemos de errores puntuales ni del contenido de webs de terceros enlazadas desde aquí.</p>
<h2>Legislación</h2><p>Esta web se rige por la legislación española.</p>`],
  ['/politica-de-privacidad/', 'Política de privacidad', `<p><strong>Responsable</strong>: ${EMPRESA}, NIF ${NIF}, ${DIRECCION}. Correo: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Qué datos tratamos y para qué</h2><p>Esta web no tiene formularios ni pide datos. Si nos escribes por WhatsApp, nos llamas o nos mandas un correo, usamos tu nombre, tu teléfono o correo y lo que nos cuentes para contestarte, darte precios y, si llegas a ser cliente, gestionar tus pedidos, albaranes y facturas.</p>
<h2>Base legal</h2><p>Tu consentimiento al escribirnos y, si eres cliente, la relación comercial y las obligaciones legales (facturación y contabilidad).</p>
<h2>Cuánto tiempo</h2><p>Mientras dure la conversación o la relación comercial y, después, el tiempo que obliguen las leyes fiscales y mercantiles.</p>
<h2>A quién se comunican</h2><p>A nadie, salvo obligación legal (por ejemplo, a Hacienda) y a quienes nos prestan servicios con las debidas garantías (gestoría, alojamiento de la web). WhatsApp es un servicio de Meta, con su propia política de privacidad.</p>
<h2>Tus derechos</h2><p>Puedes pedir acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <a href="mailto:${EMAIL}">${EMAIL}</a>. Si no te atendemos bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>`],
  ['/politica-de-cookies/', 'Política de cookies', `<p>Esta web <strong>no usa cookies</strong> propias ni de terceros para analizar tu visita ni para publicidad, por eso no te pedimos que las aceptes.</p>
<p>Si en el futuro añadimos alguna herramienta de medición, lo indicaremos aquí y te pediremos permiso antes de usarla.</p>
<p>Los enlaces a WhatsApp y a Google Maps te llevan a servicios de terceros, que tienen sus propias políticas de cookies.</p>`],
];

// ───────── Construcción ─────────
// Borra las páginas generadas antes (no las fotos ni las letras) para no dejar páginas viejas.
for (const n of fs.readdirSync(OUT)) {
  if (['wp-content', 'fotos', 'fuentes', 'estilo.css', 'robots.txt'].includes(n)) continue;
  fs.rmSync(path.join(OUT, n), { recursive: true, force: true });
}

for (const p of [...paginas, ...NUEVAS]) {
  let html;
  const fam = p.familia ? FAMILIAS.find(f => f.id === p.familia) : familiaDeRuta(p.path);
  if (p.path === '/') html = inicio(p);
  else if (p.path === '/productos/') html = catalogo(p);
  else if (p.path === '/blog/') html = blog(p);
  else if (p.isPost) html = articulo(p);
  else if (p.path === '/contacto/') html = contacto(p);
  else if (p.path === '/empresa-de-venta-y-distribucion-de-fruta-y-verdura/') html = empresa(p);
  else if (fam && p.path.startsWith('/productos/')) html = paginaFamilia(p, fam, p.html);
  else html = paginaTexto(p, fam ? { foto: fam.foto, padre: ['/productos/', 'Productos'] } : { foto: p.foto });
  escribir(p.path, html);
  sitemap.push([p.path, (p.modified || p.date || '').slice(0, 10)]);
}
escribir('/novedades/', paginaNovedades());
sitemap.push(['/novedades/', (ultimasNovedades[0]?.fecha || '').slice(0, 10)]);
for (const [ruta, titulo, html] of LEGALES) { escribir(ruta, paginaLegal(ruta, titulo, html)); sitemap.push([ruta, '']); }

fs.writeFileSync(path.join(OUT, '404.html'), plantilla({ ruta: '/404', titulo: 'Página no encontrada | Ferjusanz', descripcion: 'Esta página no existe.', cuerpo:
  `<section class="bloque"><div class="envoltura lectura"><h1>Esta página no existe</h1><p class="entradilla">Puede que la hayamos movido. Mira el catálogo o escríbenos.</p><p><a class="btn btn-borde" href="/productos/"><span>Ver productos</span>${I.flecha}</a></p></div></section>` }));

// Mapa del sitio para Google, con la fecha de cada página.
const hoy = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(([r, d]) => `<url><loc>${DOMINIO}${r}</loc><lastmod>${r === '/' ? hoy : d || hoy}</lastmod></url>`).join('\n')}
</urlset>
`);

// Lista de archivos que el Worker lleva dentro (Cloudflare no deja subir «assets» por el proxy del entorno).
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const archivos = [];
(function recorrer(d) {
  for (const n of fs.readdirSync(d)) {
    const f = path.join(d, n);
    if (fs.statSync(f).isDirectory()) recorrer(f);
    else if (TIPOS[path.extname(n).toLowerCase()]) archivos.push(path.relative(OUT, f));
  }
})(OUT);
fs.writeFileSync(path.join(DIR, 'archivos.generado.js'),
  '// Generado por construir.cjs: no editar a mano.\n' +
  archivos.map((a, i) => `import f${i} from "./public/${a}";`).join('\n') +
  '\nexport default {\n' +
  archivos.map((a, i) => {
    const ruta = '/' + a.replace(/\\/g, '/').replace(/index\.html$/, '');
    return `  ${JSON.stringify(ruta)}: [f${i}, ${JSON.stringify(TIPOS[path.extname(a).toLowerCase()])}],`;
  }).join('\n') + '\n};\n');
console.log('Web construida:', sitemap.length, 'páginas,', archivos.length, 'archivos.');

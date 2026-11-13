// Construye la web nueva (web/public/) a partir de los textos copiados de la web antigua (web/paginas.json).
// Uso: node web/construir.cjs   ·   Mismas direcciones de página que la web antigua, para no perder Google.
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const OUT = path.join(DIR, 'public');
const DOMINIO = 'https://www.ferjusanz-frutas-verduras.es';
const paginas = require('./paginas.json');

const TEL = '91 763 21 86', MOVIL = '609 100 690', EMAIL = 'ferjusanz@hotmail.com', WA = '34609100690';
const DIRECCION = 'C/ Carare nº 2, 28033 Madrid';
const EMPRESA = 'FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.';

const MENU = [
  ['/', 'Inicio'],
  ['/empresa-de-venta-y-distribucion-de-fruta-y-verdura/', 'Empresa'],
  ['/productos/', 'Productos'],
  ['/servicios-de-distribucion-y-exportacion/', 'Distribución'],
  ['/blog/', 'Blog'],
  ['/contacto/', 'Contacto'],
];
const PRODUCTOS = [
  ['/productos/frutas-2/', 'Frutas', '/fotos/mango-y-papaya.jpg'],
  ['/productos/verduras-y-hortalizas/', 'Verduras y hortalizas', '/fotos/verduras-gourmet-hosteleria.jpg'],
  ['/productos/patatas-2/', 'Patatas', '/wp-content/uploads/2019/10/distribuidor-de-patatas.jpg'],
  ['/productos/setas-y-champinones-2/', 'Setas y champiñones', '/fotos/champinon-y-portobello.jpg'],
];

// Fotos propias del puesto en Mercamadrid (web/public/fotos/) y en qué páginas salen.
const FOTO = {
  'tomate-asurcado': 'Tomate asurcado',
  'tomate-la-campechana': 'Tomate de La Campechana',
  'tomate-de-temporada': 'Tomate de temporada en caja de madera',
  'tomate-rosa': 'Tomate rosa',
  'niscalos': 'Níscalos de temporada',
  'setas-de-ostra': 'Setas de ostra (Cuenca)',
  'champinon-y-portobello': 'Champiñón blanco y champiñón portobello',
  'pitahaya-amarilla': 'Pitahaya amarilla',
  'mango-y-papaya': 'Mango listo para comer, papaya y naranja',
  'granada-mollar-de-elche': 'Granada Mollar de Elche D.O.P.',
  'grosellas-rojas': 'Grosellas rojas',
  'verduras-gourmet-hosteleria': 'Tomates, pepino mini, tirabeque, tamarillo, pimiento snack, cherry y arándanos para hostelería',
};
const GALERIAS = {
  '/': ['verduras-gourmet-hosteleria', 'niscalos', 'tomate-la-campechana', 'pitahaya-amarilla', 'granada-mollar-de-elche', 'champinon-y-portobello', 'tomate-rosa', 'grosellas-rojas'],
  '/productos/': ['mango-y-papaya', 'verduras-gourmet-hosteleria', 'niscalos', 'tomate-asurcado'],
  '/productos/frutas-2/': ['mango-y-papaya', 'pitahaya-amarilla', 'granada-mollar-de-elche', 'grosellas-rojas'],
  '/productos/verduras-y-hortalizas/': ['verduras-gourmet-hosteleria', 'tomate-asurcado', 'tomate-rosa', 'tomate-la-campechana'],
  '/productos/setas-y-champinones-2/': ['niscalos', 'setas-de-ostra', 'champinon-y-portobello'],
  '/mayorista-de-frutas-y-verduras-madrid/': ['verduras-gourmet-hosteleria', 'niscalos'],
  '/distribucion-y-venta-de-frutas-madrid/': ['granada-mollar-de-elche', 'mango-y-papaya'],
  '/distribucion-y-venta-de-verduras-madrid/': ['tomate-rosa', 'champinon-y-portobello'],
  '/distribucion-y-venta-de-hortalizas-madrid/': ['tomate-de-temporada', 'verduras-gourmet-hosteleria'],
  '/blog/tipos-de-tomates/': ['tomate-asurcado', 'tomate-la-campechana', 'tomate-de-temporada', 'tomate-rosa'],
  '/blog/setas-y-champinones-beneficios-salud/': ['niscalos', 'setas-de-ostra', 'champinon-y-portobello'],
  '/blog/frutas-exoticas-como-conservarlas/': ['pitahaya-amarilla', 'mango-y-papaya'],
  '/blog/frutas-tropicales-propiedades-y-beneficios-para-la-salud/': ['mango-y-papaya', 'pitahaya-amarilla'],
  '/blog/todo-sobre-los-frutos-rojos/': ['grosellas-rojas', 'verduras-gourmet-hosteleria'],
  '/blog/frutas-de-temporada-otono/': ['granada-mollar-de-elche', 'niscalos'],
};
const galeria = ruta => GALERIAS[ruta] ? `<section class="texto"><h2>Hoy en nuestro puesto de Mercamadrid</h2><div class="galeria">${GALERIAS[ruta].map(n =>
  `<figure><img src="/fotos/${n}.jpg" alt="${esc(FOTO[n])} en el puesto de Ferjusanz en Mercamadrid" loading="lazy"><figcaption>${esc(FOTO[n])}</figcaption></figure>`).join('')}</div></section>` : '';
const SERVICIOS = [
  ['/mayorista-de-frutas-y-verduras-madrid/', 'Mayorista de frutas y verduras en Madrid'],
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
  ['/servicios-de-distribucion-y-exportacion/exportacion-de-frutas-y-verduras/', 'Exportación'],
];

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fecha = iso => iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const tituloCorto = t => t.replace(/\s*-\s*Ferjusanz\s*$/i, '');

// Arreglos de contenido: textos sueltos en <p> y el nombre de la empresa actualizado.
function limpiar(html) {
  return html
    .split('\n').map(l => (l.trim() && !l.trim().startsWith('<') ? `<p>${l.trim()}</p>` : l)).join('\n')
    .replace(/Ferjusanz C\.\s?B\.,?/g, 'Ferjusanz')
    .replace(/<p>\s*<\/p>/g, '');
}

const WA_ICONO = '<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.5-1.5l-.4-.2-3.9 1 1-3.8-.2-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.2-.3-.3-.6-.4Z"/></svg>';

function plantilla({ ruta, titulo, descripcion, imagen, cuerpo, portada = false }) {
  const nav = MENU.map(([h, t]) => `<a href="${h}"${h === ruta || (h !== '/' && ruta.startsWith(h)) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const datosEmpresa = portada ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'WholesaleStore', name: 'Ferjusanz', legalName: EMPRESA,
    url: DOMINIO + '/', telephone: '+34917632186', email: EMAIL, image: DOMINIO + '/wp-content/uploads/2019/10/logotipo.png',
    address: { '@type': 'PostalAddress', streetAddress: 'C/ Carare 2', postalCode: '28033', addressLocality: 'Madrid', addressCountry: 'ES' },
    openingHours: 'Mo-Fr 08:00-18:00',
  })}</script>` : '';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${DOMINIO}${ruta}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:locale" content="es_ES">
${imagen ? `<meta property="og:image" content="${DOMINIO}${imagen}">\n` : ''}<link rel="icon" href="/wp-content/uploads/2019/10/cropped-logo-144px-32x32.jpg" sizes="32x32">
<link rel="apple-touch-icon" href="/wp-content/uploads/2019/10/cropped-logo-144px-180x180.jpg">
<meta name="theme-color" content="#5c0a0a">
<link rel="stylesheet" href="/estilo.css">
${datosEmpresa}
</head>
<body>
<div class="barra"><a href="tel:+34917632186">📞 ${TEL}</a><a href="tel:+34609100690">📱 ${MOVIL}</a><a href="mailto:${EMAIL}" class="solo-ancho">✉️ ${EMAIL}</a></div>
<header class="cabecera">
  <a href="/" class="logo"><img src="/wp-content/uploads/2019/10/logotipo.png" alt="Ferjusanz" width="185" height="32"></a>
  <details class="menu"><summary aria-label="Menú">☰</summary><nav>${nav}</nav></details>
  <nav class="menu-ancho">${nav}</nav>
</header>
<main>
${cuerpo}
</main>
<section class="llamada">
  <h2>¿Restaurante, colegio, residencia o frutería?</h2>
  <p>Pídanos precio sin compromiso. Le contestamos el mismo día.</p>
  <div class="botones">
    <a class="boton wa" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola, quería información de precios.')}">${WA_ICONO} WhatsApp</a>
    <a class="boton" href="tel:+34917632186">📞 Llamar</a>
    <a class="boton claro" href="mailto:${EMAIL}">✉️ Correo</a>
  </div>
</section>
<footer class="pie">
  <div class="columnas">
    <div>
      <h3>Ferjusanz</h3>
      <p>Mayoristas de fruta, verdura, patatas y hortalizas en Madrid desde hace más de 50 años.</p>
      <p>📞 <a href="tel:+34917632186">${TEL}</a> · 📱 <a href="tel:+34609100690">${MOVIL}</a><br>✉️ <a href="mailto:${EMAIL}">${EMAIL}</a><br>📍 ${DIRECCION}<br>🕗 Lunes a viernes, de 8:00 a 18:00</p>
    </div>
    <div>
      <h3>Productos</h3>
      <ul>${PRODUCTOS.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h3>Servicios</h3>
      <ul>${SERVICIOS.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul>
    </div>
  </div>
  <p class="legal">© ${new Date().getFullYear()} ${EMPRESA}</p>
</footer>
<a class="wa-flotante" href="https://wa.me/${WA}?text=Hola" aria-label="Escribir por WhatsApp">${WA_ICONO}</a>
</body>
</html>
`;
}

function escribir(ruta, html) {
  const f = path.join(OUT, ruta, 'index.html');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}

const articulos = paginas.filter(p => p.isPost).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const tarjeta = a => `<a class="tarjeta" href="${a.path}">${a.ogImage ? `<img src="${a.ogImage}" alt="" loading="lazy">` : ''}<span class="fecha">${fecha(a.date)}</span><strong>${esc(tituloCorto(a.h1 || a.title))}</strong></a>`;

for (const p of paginas) {
  let cuerpo;
  if (p.path === '/') {
    cuerpo = `<section class="portada" style="background-image:linear-gradient(rgba(40,5,5,.55),rgba(40,5,5,.55)),url(/wp-content/uploads/2019/10/slide01.jpg)">
  <h1>Distribuidores de frutas y verduras</h1>
  <p>Fruta, verdura, patatas, cebollas y hortalizas al por mayor desde Mercamadrid, para restaurantes, colegios, residencias y fruterías.</p>
  <div class="botones"><a class="boton wa" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola, quería información de precios.')}">${WA_ICONO} Pedir precio</a><a class="boton claro" href="/productos/">Ver productos</a></div>
</section>
<section class="cuadricula">
${PRODUCTOS.map(([h, t, img]) => `<a class="tarjeta" href="${h}">${img ? `<img src="${img}" alt="" loading="lazy">` : ''}<strong>${t}</strong></a>`).join('\n')}
</section>
<article class="texto">${limpiar(p.html).replace(/^[\s\S]*?<\/p>\s*/, '')}</article>
${galeria('/')}
<section class="texto"><h2>Del blog</h2><div class="cuadricula">${articulos.slice(0, 4).map(tarjeta).join('')}</div><p><a href="/blog/">Ver todos los artículos →</a></p></section>`;
  } else if (p.path === '/blog/') {
    cuerpo = `<article class="texto"><h1>Blog</h1><p>Consejos, temporadas y recetas con fruta y verdura.</p></article>
<section class="cuadricula ancha">${articulos.map(tarjeta).join('\n')}</section>`;
  } else if (p.isPost) {
    const otros = articulos.filter(a => a.path !== p.path).slice(0, 3);
    cuerpo = `<article class="texto">
<p class="miga"><a href="/blog/">Blog</a></p>
<h1>${esc(tituloCorto(p.h1 || p.title))}</h1>
<p class="fecha">${fecha(p.date)}</p>
${p.ogImage ? `<img class="destacada" src="${p.ogImage}" alt="">` : ''}
${limpiar(p.html)}
</article>
${galeria(p.path)}
<section class="texto"><h2>Más artículos</h2><div class="cuadricula">${otros.map(tarjeta).join('')}</div></section>`;
  } else {
    cuerpo = `<article class="texto">${limpiar(p.html)}</article>${galeria(p.path)}`;
  }
  escribir(p.path, plantilla({ ruta: p.path, titulo: p.title, descripcion: p.description, imagen: p.ogImage, cuerpo, portada: p.path === '/' }));
}

fs.writeFileSync(path.join(OUT, '404.html'), plantilla({ ruta: '/404', titulo: 'Página no encontrada - Ferjusanz', descripcion: '', cuerpo:
  '<article class="texto"><h1>Esta página no existe</h1><p><a href="/">Volver al inicio</a> · <a href="/productos/">Ver productos</a></p></article>' }));

// Mapa del sitio para Google (se usará cuando la web esté en el dominio).
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paginas.map(p => `<url><loc>${DOMINIO}${p.path}</loc></url>`).join('\n')}
</urlset>
`);
// Lista de archivos que el Worker lleva dentro (Cloudflare no deja subir «assets» por el proxy del entorno).
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
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
console.log('Web construida:', paginas.length, 'páginas,', archivos.length, 'archivos, en', OUT);

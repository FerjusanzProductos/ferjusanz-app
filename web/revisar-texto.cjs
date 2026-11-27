// Revisa que un artículo no suene a texto hecho en serie (Tito, 27/11/2026).
// Lo llama solo `anadir.cjs articulo` y no deja publicar si hay fallos.
// A mano: node web/revisar-texto.cjs <articulo.json>   ·   node web/revisar-texto.cjs --todas (las guías nuevas ya publicadas)
const fs = require('fs');
const path = require('path');

// Coletillas típicas de texto de relleno (en minúsculas, sin tildes).
const PROHIBIDAS = ['en el mundo de', 'descubre', 'no cabe duda', 'sin lugar a dudas', 'es fundamental', 'es crucial',
  'en definitiva', 'en resumen', 'en conclusion', 'en este articulo', 'te lo explicamos', 'te contamos todo',
  'sumergete', 'adentrate', 'cabe destacar', 'vale la pena destacar', 'juega un papel', 'un papel crucial',
  'un aliado', 'tu mejor aliado', 'clave para el exito', 'sin duda alguna', 'imprescindible', 'potenciar', 'optimizar',
  'experiencia gastronomica', 'elevar tu', 'llevar tu negocio', 'al siguiente nivel', 'ademas de ello',
  'en la actualidad', 'hoy en dia', 'en un mundo', 'panorama', 'abanico de', 'amplia gama', 'garantizar la satisfaccion'];

// Datos que la empresa NO puede decir (auditoría de la web, 27/11/2026; ver web/LEEME.md). En minúsculas y sin tildes.
const DATOS_FALSOS = [['a domicilio', 'vendemos a negocios, no «a domicilio»'], ['particulares', 'no vendemos a particulares'],
  ['24/48', 'el plazo es «pedidos hasta la tarde anterior»'], ['24-48', 'el plazo es «pedidos hasta la tarde anterior»'],
  ['se lo cambiamos', 'no se prometen cambios ni devoluciones'], ['se cambia', 'no se prometen cambios ni devoluciones'],
  ['cosecha propia', 'no hay cosecha propia: «agricultores de confianza»'], ['nuestros campos', 'no hay campos propios'],
  ['bajo nuestra supervision', 'no hay cultivo propio'], ['anos en mercamadrid', '«más de 60 años de experiencia» y «décadas en Mercamadrid»'],
  ['50 anos', 'son más de 60 años'], ['40 anos', 'son más de 60 años'], ['precios estan en la web', 'no se publican precios'],
  ['pedido online', 'no hay pedidos por la web'], ['envio gratuito', 'no se prometen portes gratis'], ['empresa lider', 'sin superlativos que no se pueden probar'],
  ['nivel nacional', 'repartimos en Madrid y Segovia'], ['distribuidores nacionales', 'repartimos en Madrid y Segovia']];

const plano = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function revisar(html) {
  const fallos = [];
  const texto = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const t = plano(texto);
  for (const f of PROHIBIDAS) if (t.includes(f)) fallos.push(`coletilla «${f}»`);
  // Se permite negándolo («No tenemos cosecha propia», «¿Venden a particulares? No»).
  for (const [f, por] of DATOS_FALSOS) {
    let i = t.indexOf(f);
    while (i >= 0) {
      const antes = t.slice(Math.max(0, i - 30), i);
      if (!/\bno\b|¿|ni /.test(antes)) { fallos.push(`dato que no se puede decir «${f}»: ${por}`); break; }
      i = t.indexOf(f, i + 1);
    }
  }
  if (/—/.test(texto)) fallos.push('raya larga «—» (en España se escribe con comas o paréntesis)');
  if (/\bno (es|son|se trata de) [^.;]{1,40}, (es|son|sino)\b/.test(t)) fallos.push('contraste «no es X, es Y»');
  if ((texto.match(/¡/g) || []).length > 1) fallos.push('exclamaciones de anuncio');
  if ((texto.match(/¿/g) || []).length > 6 && !/<h3>¿/.test(html)) fallos.push('demasiadas preguntas retóricas');
  const parrafos = (html.match(/<p[ >]/g) || []).length, items = (html.match(/<li[ >]/g) || []).length;
  if (items > parrafos) fallos.push(`más puntos de lista (${items}) que párrafos (${parrafos})`);
  const negritas = (html.match(/<(strong|b)>/g) || []).length;
  if (negritas > Math.max(3, parrafos)) fallos.push(`demasiada negrita (${negritas})`);
  // Frases todas del mismo largo = ritmo de máquina.
  const largos = texto.split(/[.!?]+\s/).map(f => f.split(' ').length).filter(n => n > 2);
  if (largos.length >= 8) {
    const media = largos.reduce((a, b) => a + b, 0) / largos.length;
    const desv = Math.sqrt(largos.reduce((a, b) => a + (b - media) ** 2, 0) / largos.length);
    if (desv / media < 0.35) fallos.push('todas las frases miden casi lo mismo (mezclar cortas y largas)');
  }
  return fallos;
}
module.exports = { revisar };

if (require.main === module) {
  // Prueba rápida: un texto de relleno debe fallar y uno normal no.
  console.assert(revisar('<p>En el mundo de la hostelería, no es solo fruta, es calidad. ¡Descubre más!</p>').length >= 3);
  console.assert(revisar('<p>La patata nueva aguanta poco en cámara. Pídela para dos o tres días.</p>').length === 0);
  const arg = process.argv[2];
  if (!arg) { console.log('Uso: node web/revisar-texto.cjs <articulo.json> | --todas'); process.exit(1); }
  // .json = artículo; cualquier otro archivo (.txt, .html, .md) = texto suelto (post, correo, nota de prensa…).
  const lista = arg === '--todas'
    ? JSON.parse(fs.readFileSync(path.join(__dirname, 'paginas.json'), 'utf8')).filter(p => p.isPost)
    : arg.endsWith('.json') ? [JSON.parse(fs.readFileSync(arg, 'utf8'))]
    : [{ slug: arg, html: fs.readFileSync(arg, 'utf8').split(/\n\s*\n/).map(b => `<p>${b}</p>`).join('') }];
  let mal = 0;
  for (const a of lista) {
    const f = revisar(a.html || '');
    if (f.length) { mal++; console.log(`✗ ${a.path || a.slug}\n   - ${f.join('\n   - ')}`); }
  }
  console.log(mal ? `${mal} de ${lista.length} con cosas que arreglar.` : `Todo bien (${lista.length}).`);
  process.exit(mal && arg !== '--todas' ? 1 : 0);
}

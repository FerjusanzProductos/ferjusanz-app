// Añade contenido nuevo a la web (lo usa la tarea automática cada 2 días).
//   node web/anadir.cjs novedad <foto.jpg> "<título>" "<texto corto>" [driveId]
//   node web/anadir.cjs articulo <articulo.json>
//      articulo.json = { "slug": "...", "titulo": "...", "descripcion": "...", "html": "<p>…</p>", "foto": "/wp-content/… (foto ya publicada) o ruta local .jpg/.png (foto nueva)" }
// Después: node web/construir.cjs y publicar (ver web/LEEME.md).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const DIR = __dirname;
const hoy = new Date().toISOString().slice(0, 10);

// Foto nueva: tamaño web (máx. 1400 px, JPG calidad 74, sin datos GPS), copia en web/fotos/ (respaldo en GitLab)
// y subida al almacén KV de Cloudflare «ferjusanz-web-fotos», que el Worker sirve en /fotos/… (no engorda el Worker).
const KV = 'https://api.cloudflare.com/client/v4/accounts/9a4f085c6f3a0c2671fa344c288b3e46/storage/kv/namespaces/30a0903df04e4ea694b8b28f85f0781e/values/';
function guardarFoto(origen, nombre) {
  if (origen.startsWith('/wp-content/') || origen.startsWith('/fotos/')) return origen;
  const [a, m] = hoy.split('-');
  const clave = `fotos/${a}/${m}/${nombre}.jpg`;
  const destino = path.join(DIR, clave);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  execFileSync('convert', [origen, '-auto-orient', '-resize', '1400x1400>', '-strip', '-quality', '74', '-interlace', 'Plane', destino]);
  const r = execFileSync('curl', ['-sS', '-X', 'PUT', KV + encodeURIComponent(clave), '-H', 'Authorization: Bearer proxy-injected',
    '-H', 'Content-Type: application/octet-stream', '--data-binary', '@' + destino]).toString();
  if (!JSON.parse(r).success) throw new Error('No se pudo subir la foto a Cloudflare: ' + r);
  return '/' + clave;
}
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const [, , tipo, ...args] = process.argv;
if (tipo === 'novedad') {
  const [foto, titulo, texto = '', driveId = ''] = args;
  if (!foto || !titulo) throw new Error('Falta la foto o el título');
  const lista = JSON.parse(fs.readFileSync(path.join(DIR, 'novedades.json'), 'utf8'));
  if (driveId && lista.some(n => n.driveId === driveId)) { console.log('Esa foto ya estaba publicada:', driveId); process.exit(0); }
  const rel = guardarFoto(foto, `novedad-${hoy}-${slug(titulo).slice(0, 40)}`);
  lista.push({ fecha: hoy, foto: rel, titulo, texto, alt: titulo, ...(driveId ? { driveId } : {}) });
  fs.writeFileSync(path.join(DIR, 'novedades.json'), JSON.stringify(lista, null, 1) + '\n');
  console.log('Novedad añadida:', titulo, rel);
} else if (tipo === 'articulo') {
  const a = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  for (const k of ['slug', 'titulo', 'descripcion', 'html', 'foto']) if (!a[k]) throw new Error('Falta ' + k);
  const paginas = JSON.parse(fs.readFileSync(path.join(DIR, 'paginas.json'), 'utf8'));
  const ruta = `/blog/${slug(a.slug)}/`;
  if (paginas.some(p => p.path === ruta)) throw new Error('Ya existe un artículo con esa dirección: ' + ruta);
  if (a.descripcion.length > 160) throw new Error('La descripción pasa de 160 letras');
  const foto = guardarFoto(a.foto, slug(a.slug));
  paginas.push({ path: ruta, isPost: true, title: `${a.titulo} - Ferjusanz`, description: a.descripcion,
    ogImage: foto, date: new Date().toISOString(), h1: a.titulo, html: a.html, imgs: [], bgs: [], nuevo: true });
  fs.writeFileSync(path.join(DIR, 'paginas.json'), JSON.stringify(paginas, null, 1));
  console.log('Artículo añadido:', ruta);
} else {
  console.log('Uso: node web/anadir.cjs novedad <foto> "<título>" "<texto>" [driveId] | articulo <archivo.json>');
  process.exit(1);
}

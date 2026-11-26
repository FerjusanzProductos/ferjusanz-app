import fs from 'fs';
const lista = JSON.parse(fs.readFileSync(process.argv[2]));
// web − 0,20 de las ofertas 22-30/11 (tabla `recomendaciones`), por nombre de la lista de colegios
const web = { 'Tomate ensalada': 1.40, 'Tomate pera': 1.45, 'Lechuga (2 unidades)': 1.95, 'Lechuga iceberg': 1.00, 'Limones': 1.50,
  'Naranja de zumo': 1.00, 'Clementina': 1.45, 'Pimiento de padrón': 3.00, 'Cebolla gorda calibre 2-3': 0.70, 'Huevos': 2.35 };
const fuera = ['Ajo pelado 1ª', 'Limón extra', 'Naranja zumo']; // duplicados
const r2 = n => Math.round(n * 100) / 100;
const filas = lista.filter(i => !fuera.includes(i.nombre)).map(i => {
  let p = i.p;
  if (web[i.nombre] != null) { p = Math.min(p, r2(web[i.nombre] - 0.20)); if (i.c != null) p = Math.max(p, r2(i.c + 0.10)); }
  return { nombre: i.nombre, unidad: i.unidad, precio: r2(p), oferta: web[i.nombre] != null };
});
filas.push({ nombre: 'Tomate pera gordo', unidad: 'kg', precio: 1.65, oferta: true }, { nombre: 'Naranja de mesa', unidad: 'kg', precio: 1.10, oferta: true });
filas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
// comprobación: ninguna oferta por debajo de compra + 0,10
for (const f of filas) { const o = lista.find(i => i.nombre === f.nombre); if (f.oferta && o?.c != null) console.assert(f.precio >= r2(o.c + 0.10) - 1e-9, f.nombre); }
fs.writeFileSync('precios.json', JSON.stringify(filas, null, 1));
for (const f of filas) console.log((f.oferta ? '★ ' : '  ') + f.nombre + ': ' + f.precio.toFixed(2).replace('.', ',') + ' €/' + f.unidad);
// patatas: precio de la lista de colectivos, sin descuento (Tito, 26/11/2026)
for (const f of filas.filter(f => /patata/i.test(f.nombre))) console.assert(!f.oferta && f.precio === lista.find(i => i.nombre === f.nombre).p, 'patata tocada: ' + f.nombre);

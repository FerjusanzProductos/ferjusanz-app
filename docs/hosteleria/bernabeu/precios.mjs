// Tarifa para hostelería nueva de la zona Bernabéu (Tito, 27/11/2026): última compra + 0,30 € (cajas + 0,30 € por kilo).
// Fijos: patata esp. freír 0,60 · patata agria 0,65 · cebolla 0,70. Uso: node precios.mjs <lista.json> (items de la lista «Hostelería» con su coste).
import fs from 'fs';
const L = JSON.parse(fs.readFileSync(process.argv[2])); // lleva precios de compra: fuera del repositorio
const M = 0.30, hoy = new Date('2026-11-27');
const FIJO = { 'Patata nueva esp. freír': 0.60, 'Patata agria': 0.65, 'Cebolla gorda calibre 2-3': 0.70, 'Cebolla nueva': 0.70, 'Perejil': 0 };
// duplicados de la lista y lo que no se compra ahora
const FUERA = new Set(['Manzana caja 7 kg', 'Naranjas de zumo 1ª cal-5-6', 'Pimiento de padrón', 'Pimiento rojo extra', 'Zumo naranja litro', 'Manzana Golden nueva cal. 24', 'Sandía sin pepita']);
const NOMBRE = { 'Patata nueva esp. freír': 'Patata especial freír', 'Cebolla gorda calibre 2-3': 'Cebolla gorda', 'Lechuga iceberg gorda': 'Lechuga iceberg', 'Pimiento rojo 1ª especial para asar': 'Pimiento rojo para asar' };
const DEST = new Set(['Tomate raf (caja de 7,35 kg aprox.)', 'Tomate pera gordo', 'Tomate ensalada', 'Patata nueva esp. freír', 'Patata agria', 'Cebolla gorda calibre 2-3']);
const filas = [];
for (const i of L) {
  if (FUERA.has(i.nombre)) continue;
  let p;
  if (i.nombre in FIJO) p = FIJO[i.nombre];
  else {
    if (i.av || i.coste == null) continue;                                 // unidad de compra distinta: sin precio
    if (!i.pf && (!i.f || (hoy - new Date(i.f)) / 864e5 > 30)) continue;            // compra vieja: fuera de temporada
    const c = Number(i.coste);
    p = c + (i.unidad === 'caja' && i.kg ? M * Number(i.kg) : M);
    console.assert(p >= c + 0.29, i.nombre);
  }
  filas.push({ nombre: NOMBRE[i.nombre] || i.nombre, unidad: i.unidad, precio: Math.round(p * 100) / 100, dest: DEST.has(i.nombre) });
}
console.assert(filas.find(f => f.nombre === 'Cebolla gorda').precio === 0.70 && filas.find(f => f.nombre === 'Patata agria').precio === 0.65);
fs.writeFileSync(new URL('precios.json', import.meta.url), JSON.stringify(filas, null, 1));
for (const f of filas) console.log((f.dest ? '★ ' : '  ') + f.nombre, f.precio, f.unidad);

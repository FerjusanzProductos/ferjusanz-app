// Genera las 4 propuestas de logo (SVG) y sus PNG con Playwright.
import fs from 'node:fs'; import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const D = process.argv[2]; const fuentes = fs.readFileSync(D + '/fuentes.css', 'utf8');
const hoja = (x, y, s, fill, vena = '#ffffff55') => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M2 38C2 16 16 2 38 2C38 24 24 38 2 38Z" fill="${fill}"/><path d="M4 36L30 10" stroke="${vena}" stroke-width="1.6" stroke-linecap="round"/></g>`;
const grads = `<defs>
<linearGradient id="sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9b233"/><stop offset=".55" stop-color="#ec6a1e"/><stop offset="1" stop-color="#c2311d"/></linearGradient>
<linearGradient id="gra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f1d22"/><stop offset="1" stop-color="#3f080b"/></linearGradient>
<linearGradient id="oro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dd9a"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#a8701c"/></linearGradient>
<linearGradient id="verde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8cc63f"/><stop offset="1" stop-color="#2f7d32"/></linearGradient>
<linearGradient id="tom" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7743a"/><stop offset=".6" stop-color="#c8281f"/><stop offset="1" stop-color="#6b1216"/></linearGradient>
<radialGradient id="gajo"><stop offset="0" stop-color="#fbbf4a"/><stop offset="1" stop-color="#ef7a1a"/></radialGradient>
<path id="arcoA" d="M70 220a150 150 0 0 1 300 0"/><path id="arcoB" d="M58 220a162 162 0 0 0 324 0"/>
</defs><style>${fuentes}.c{font-family:BC;font-weight:700}.c6{font-family:BC;font-weight:600}.t{font-family:B;font-weight:600}</style>`;
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${grads}${body}</svg>`;

const L = {
 // 1 · Sello de mercado: redondo, granate, letras crema. Sirve de logo, de pegatina y de foto de perfil.
 '1-sello': svg(440, 440, `<circle cx="220" cy="220" r="210" fill="url(#gra)"/><circle cx="220" cy="220" r="188" fill="none" stroke="url(#oro)" stroke-width="2.5"/><circle cx="220" cy="220" r="128" fill="none" stroke="url(#oro)" stroke-width="1.2" opacity=".7"/>
  <text class="t" font-size="17" letter-spacing="2.6" fill="#f3e6cf"><textPath href="#arcoA" startOffset="50%" text-anchor="middle">FRUTA · VERDURA · PATATA · HUEVOS</textPath></text>
  <text class="t" font-size="19" letter-spacing="6" fill="#f3e6cf" dy="14"><textPath href="#arcoB" startOffset="50%" text-anchor="middle">AL POR MAYOR</textPath></text>
  <text x="58" y="227" class="t" font-size="16" fill="url(#oro)" text-anchor="middle">★</text><text x="382" y="227" class="t" font-size="16" fill="url(#oro)" text-anchor="middle">★</text>
  ${hoja(204, 132, .8, 'url(#verde)')}<text x="220" y="246" class="c" font-size="64" letter-spacing="1" fill="#fbf3e4" text-anchor="middle">FERJUSANZ</text>
  <path d="M150 266h140" stroke="url(#oro)" stroke-width="2"/><text x="220" y="292" class="t" font-size="13" letter-spacing="6" fill="#e9c77d" text-anchor="middle">MADRID</text>`),
 // 2 · La hoja en la J: evolución del logo de ahora (mismo naranja), pero limpio y moderno.
 '2-hoja': svg(760, 240, `
  <text x="380" y="150" class="c" font-size="128" letter-spacing="3" fill="url(#sol)" text-anchor="middle">FERJUSANZ</text>
  ${hoja(316, 13, 1.2, 'url(#verde)')}
  <path d="M110 176h540" stroke="#6b1216" stroke-width="2"/><text x="380" y="206" class="t" font-size="18" letter-spacing="6.5" fill="#4f4640" text-anchor="middle">FRUTAS · VERDURAS · PATATAS · HUEVOS</text>`),
 // 3 · Icono + nombre: fruta granate con la F dentro. Moderno, se reconoce aunque sea pequeño.
 '3-icono': svg(760, 240, `
  <g transform="translate(40 30)"><circle cx="90" cy="98" r="82" fill="url(#tom)"/><path d="M90 20c2-10 6-16 12-20" stroke="#4a2c12" stroke-width="5" stroke-linecap="round" fill="none"/>${hoja(94, -10, 1.05, 'url(#verde)')}
  <text x="90" y="135" class="c" font-size="108" fill="#fff6ea" text-anchor="middle">F</text><ellipse cx="60" cy="62" rx="16" ry="9" fill="#fff" opacity=".22" transform="rotate(-35 60 62)"/></g>
  <text x="238" y="132" class="c" font-size="96" letter-spacing="2" fill="#161210">FERJUSANZ</text>
  <text x="241" y="172" class="t" font-size="19.5" letter-spacing="9.4" fill="#6b1216">FRESCOS AL POR MAYOR</text>`),
 // 4 · Etiqueta premium: granate y oro, como una caja de fruta de primera.
 '4-etiqueta': svg(760, 240, `<rect width="760" height="240" rx="6" fill="url(#gra)"/><rect x="12" y="12" width="736" height="216" rx="3" fill="none" stroke="url(#oro)" stroke-width="1.5"/>
  <text x="380" y="58" class="t" font-size="15" letter-spacing="7" fill="#e9c77d" text-anchor="middle">MAYORISTA EN MADRID</text>
  <text x="380" y="160" class="c" font-size="112" letter-spacing="6" fill="url(#oro)" text-anchor="middle">FERJUSANZ</text>
  <path d="M120 186h200M440 186h200" stroke="url(#oro)" stroke-width="1.5"/>${hoja(366, 170, .7, 'url(#oro)', '#6b121688')}
  <text x="380" y="214" class="t" font-size="14" letter-spacing="5" fill="#e9c77d" text-anchor="middle">FRUTA · VERDURA · PATATA · HUEVOS</text>`),
};
fs.mkdirSync(D + '/salida', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });

// ── Segunda tanda (5-8) y los iconos redondos para WhatsApp/Google ──
const nombre = (x, y, sub, sz = 96) => `<text x="${x}" y="${y}" class="c" font-size="${sz}" letter-spacing="2" fill="#161210">FERJUSANZ</text><text x="${x + 3}" y="${y + 40}" class="t" font-size="18" letter-spacing="${sub.length > 24 ? 3.2 : 9}" fill="#6b1216">${sub}</text>`;
const sol = (cx, cy, r) => `<mask id="mk${cx}${cy}"><rect x="0" y="0" width="760" height="760" fill="#fff"/><rect x="${cx - r}" y="${cy - r * .34}" width="${2 * r}" height="${r * .07}" fill="#000"/><rect x="${cx - r}" y="${cy - r * .17}" width="${2 * r}" height="${r * .06}" fill="#000"/></mask>
  <path d="M${cx - r} ${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}Z" fill="url(#sol)" mask="url(#mk${cx}${cy})"/><path d="M${cx - r - 14} ${cy + 10}H${cx + r + 14}" stroke="#2f7d32" stroke-width="7" stroke-linecap="round"/>`;
const naranja = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sol)"/><circle cx="${cx}" cy="${cy}" r="${r * .86}" fill="#fff1dc"/><circle cx="${cx}" cy="${cy}" r="${r * .8}" fill="url(#gajo)"/>
  ${[0, 45, 90, 135].map(a => `<path d="M${cx} ${cy - r * .8}V${cy + r * .8}" stroke="#fff1dc" stroke-width="${r * .055}" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="${r * .09}" fill="#fff1dc"/>`;
const fj = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${w * .2}" fill="url(#gra)"/><text x="${x + w * .5}" y="${y + w * .76}" class="c" font-size="${w * .74}" letter-spacing="${-w * .05}" fill="#fbf3e4" text-anchor="middle">FJ</text>${hoja(x + w * .66, y + w * .1, w * .0055, 'url(#verde)')}`;
const caja = (x, y, w, h) => `<path d="M${x} ${y}h${w}v${h}h-${w}Z" fill="none" stroke="#6b1216" stroke-width="6" stroke-linejoin="round"/><path d="M${x} ${y + h * .2}h${w}M${x} ${y + h * .8}h${w}" stroke="#6b1216" stroke-width="3"/><rect x="${x + w / 2 - 34}" y="${y + h * .06}" width="68" height="${h * .085}" rx="${h * .042}" fill="#6b1216"/>`;
Object.assign(L, {
 '5-amanecer': svg(760, 240, `<g transform="translate(0 6)">${sol(140, 160, 100)}</g>${nombre(280, 128, 'FRUTA · VERDURA · PATATA · HUEVOS', 92)}`),
 '6-naranja': svg(760, 240, `${naranja(130, 120, 92)}${nombre(256, 128, 'FRESCOS AL POR MAYOR', 96)}`),
 '7-monograma': svg(760, 240, `${fj(40, 30, 180)}${nombre(250, 128, 'FRESCOS AL POR MAYOR', 96)}`),
 '8-caja': svg(760, 240, `${caja(30, 20, 700, 200)}<text x="380" y="150" class="c" font-size="104" letter-spacing="10" fill="#161210" text-anchor="middle">FERJUSANZ</text><text x="380" y="198" class="t" font-size="16" letter-spacing="5" fill="#6b1216" text-anchor="middle">FRUTA · VERDURA · PATATA · HUEVOS</text>`),
 // Iconos redondos (foto de perfil): se recortan en círculo, así que todo va dentro del círculo.
 'i1': svg(240, 240, `<g transform="scale(.545)">${L['1-sello'].replace(/^.*?<\/style>|<\/svg>$/gs, '')}</g>`),
 'i2': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="#f5f2ec"/><text x="120" y="172" class="c" font-size="150" fill="url(#sol)" text-anchor="middle">FJ</text>${hoja(132, 22, 1, 'url(#verde)')}`),
 'i3': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="#fbfaf7"/><g transform="translate(30 35) scale(1)"><circle cx="90" cy="98" r="78" fill="url(#tom)"/>${hoja(94, -8, 1, 'url(#verde)')}<text x="90" y="133" class="c" font-size="104" fill="#fff6ea" text-anchor="middle">F</text></g>`),
 'i4': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="url(#gra)"/><circle cx="120" cy="120" r="106" fill="none" stroke="url(#oro)" stroke-width="2"/><text x="120" y="160" class="c" font-size="120" letter-spacing="2" fill="url(#oro)" text-anchor="middle">FJ</text>`),
 'i5': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="#6b1216"/><g transform="translate(-20 -6)">${sol(140, 150, 84)}</g><text x="120" y="200" class="t" font-size="20" letter-spacing="5" fill="#fbf3e4" text-anchor="middle">FERJUSANZ</text>`),
 'i6': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="#6b1216"/>${naranja(120, 120, 92)}`),
 'i7': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="#fbfaf7"/>${fj(40, 40, 160)}`),
 'i8': svg(240, 240, `<circle cx="120" cy="120" r="120" fill="#f5f2ec"/>${caja(48, 66, 144, 108).replace(/stroke-width="6"/, 'stroke-width="5"')}<text x="120" y="146" class="c" font-size="46" fill="#161210" text-anchor="middle">FJ</text>`),
});


// ── Tercera tanda: fondos para la foto de perfil de la 5 y etiqueta con el sol ──
const av5 = (fondo, letra) => svg(240, 240, `<circle cx="120" cy="120" r="120" fill="${fondo}"/><g transform="translate(-20 -6)">${sol(140, 150, 84)}</g><text x="120" y="200" class="t" font-size="20" letter-spacing="5" fill="${letra}" text-anchor="middle">FERJUSANZ</text>`);
Object.assign(L, {
 'a-negro': av5('#161210', '#fbf3e4'), 'a-carbon': av5('#33302d', '#fbf3e4'), 'a-crema': av5('#f5f2ec', '#161210'), 'a-blanco': av5('#ffffff', '#161210'), 'a-granate': av5('#6b1216', '#fbf3e4'),
 '4b-etiqueta-sol': L['4-etiqueta'].replace('y="214" class="t" font-size="14"', 'y="219" class="t" font-size="14"').replace(/<g transform="translate\(366 170\)[^]*?<\/g>/, `<g transform="translate(380 197) scale(.26) translate(-140 -160)">${sol(140, 160, 100).replace(/url\(#sol\)/, 'url(#oro)').replace('#2f7d32', '#d9a441')}</g>`),
});

// Versión para fondo oscuro: textos oscuros pasan a crema.
for (const n of ['2-hoja', '3-icono', '5-amanecer', '6-naranja', '7-monograma', '8-caja']) L[n + '-osc'] = L[n].replace(/#161210/g, '#fbf3e4').replace(/#4f4640/g, '#d9cfc2').replace(/stroke="#6b1216"/g, 'stroke="#e9c77d"').replace(/fill="#6b1216"/g, 'fill="#e9c77d"');
for (const [n, s] of Object.entries(L)) {
  fs.writeFileSync(`${D}/salida/${n}.svg`, s);
  await p.setContent(`<body style="margin:0;background:transparent">${s}</body>`); await p.evaluate(() => document.fonts.ready);
  await p.locator('svg').screenshot({ path: `${D}/salida/${n}.png`, omitBackground: true });
}
await b.close(); console.log('ok');

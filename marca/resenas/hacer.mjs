// Genera los PDF para imprenta y la imagen para WhatsApp del QR de reseñas.
// Uso: node marca/resenas/hacer.mjs. El QR sale de qr-muestra.svg (apunta a …workers.dev/resena, que aún no existe).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright'); // el playwright ya instalado en el entorno
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const aqui = fileURLToPath(new URL('.', import.meta.url));
const b64 = (p, t) => `data:${t};base64,${readFileSync(p).toString('base64')}`;
const logo = b64(aqui + '../logo/logo-principal.png', 'image/png');
const qr = b64(aqui + 'qr-muestra.svg', 'image/svg+xml');
const estrella = '<svg viewBox="0 0 24 24"><path fill="#d9a441" d="M12 2.5l2.9 6.2 6.6.7-4.9 4.5 1.4 6.6L12 17.2l-6 3.3 1.4-6.6L2.5 9.4l6.6-.7z"/></svg>';
const cabeza = `<meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;font-family:Inter,sans-serif;color:#161210}
h1{font-family:Fraunces,Georgia,serif;margin:0;line-height:1.12}.est{display:flex;gap:1.5mm}.est svg{width:6mm;height:6mm}</style>`;

// Tarjetita A6 (105 x 148 mm)
const tarjeta = `<!doctype html><html lang="es"><head>${cabeza}<style>@page{size:105mm 148mm;margin:0}
.t{width:105mm;height:148mm;background:#fffdf8;border-top:3mm solid #6b1216;padding:7mm 8mm 6mm;display:flex;flex-direction:column;align-items:center;gap:3.6mm;text-align:center}
</style></head><body><div class="t">
<img src="${logo}" style="height:17mm">
<h1 style="font-size:20pt">¿Le ha gustado el pedido?</h1>
<p style="margin:0;font-size:11pt;line-height:1.4;color:#4b423c">Cuéntelo en Google. Son 30 segundos y nos ayuda muchísimo.</p>
<div class="est">${estrella.repeat(5)}</div>
<img src="${qr}" style="width:44mm;height:44mm;border:0.6mm solid #161210;border-radius:2mm">
<p style="margin:0;font-size:10.5pt;font-weight:600">Apunte aquí con la cámara del móvil</p>
<p style="margin:auto 0 0;font-size:9pt;color:#6b5f57">Gracias · FERJUSANZ · Mercamadrid</p>
</div></body></html>`;

// Pegatina redonda 70 mm (fondo blanco fuera del círculo: la imprenta corta por el borde)
const pegatina = `<!doctype html><html lang="es"><head>${cabeza}<style>@page{size:76mm 76mm;margin:0}
.p{width:70mm;height:70mm;margin:3mm;border-radius:50%;background:#6b1216;border:2mm solid #d9a441;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.2mm;text-align:center}
</style></head><body><div class="p">
<h1 style="font-size:14pt;color:#f6dd9a">¿Qué tal el pedido?</h1>
<img src="${qr}" style="width:31mm;height:31mm;border-radius:1.5mm">
<p style="margin:0;font-size:10pt;font-weight:600;color:#fffdf8">Déjenos su opinión</p>
</div></body></html>`;

// Imagen para mandar por WhatsApp o enseñar en la pantalla del móvil (1080 x 1350)
const movil = tarjeta.replace('@page{size:105mm 148mm;margin:0}', '').replace('.t{width:105mm;height:148mm;', '.t{width:105mm;height:131.25mm;');

const nav = await chromium.launch();
const pag = await nav.newPage();
for (const [html, nombre] of [[tarjeta, 'tarjetita-A6.pdf'], [pegatina, 'pegatina-70mm.pdf']]) {
  await pag.setContent(html, { waitUntil: 'networkidle' });
  await pag.pdf({ path: aqui + nombre, preferCSSPageSize: true, printBackground: true });
}
const img = await nav.newPage({ viewport: { width: 397, height: 496 }, deviceScaleFactor: 1080 / 397 });
await img.setContent(movil, { waitUntil: 'networkidle' });
await img.screenshot({ path: aqui + 'imagen-whatsapp.png' });
await nav.close();
console.log('Hecho: tarjetita-A6.pdf, pegatina-70mm.pdf, imagen-whatsapp.png');

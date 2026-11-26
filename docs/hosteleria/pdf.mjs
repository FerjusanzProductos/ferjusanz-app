import fs from 'fs'; import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const filas = JSON.parse(fs.readFileSync('precios.json'));
const e = n => n === 0 ? 'de regalo' : n.toFixed(2).replace('.', ',') + ' €';
const tr = filas.map(f => `<tr><td>${f.oferta ? '<span class=o>★</span> ' : ''}${f.nombre}</td><td class=p>${e(f.precio)}</td><td class=u>${f.precio === 0 ? 'con el pedido' : '/ ' + f.unidad}</td></tr>`).join('');
const css = `body{font:11px Arial,sans-serif;color:#222;margin:0}h1{font-size:20px;margin:0;color:#7a1f1f}.s{color:#555;margin:2px 0 10px}
table{width:100%;border-collapse:collapse}td{padding:2.5px 4px;border-bottom:1px solid #eee}.p{text-align:right;font-weight:bold;white-space:nowrap}.u{color:#666;white-space:nowrap}.o{color:#d68910}
.c{column-count:2;column-gap:24px}.f{margin-top:10px;font-size:10px;color:#444;border-top:2px solid #e8742b;padding-top:6px}`;
const pie = `<div class=f><b>Fernando Sanz</b> · móvil 609 567 354 · WhatsApp pedidos 609 100 690 · www.ferjusanz-frutas-verduras.es · Agricultores de confianza, elegido cada mañana en Mercamadrid · Reparto refrigerado, sin pedido mínimo · También huevos, setas, champiñones, legumbres y cuarta gama: pídanos precio</div>`;
const b = await chromium.launch(); const p = await b.newPage();
await p.setContent(`<!doctype html><meta charset=utf-8><style>${css}</style><h1>FERJUSANZ · Precios para hostelería</h1><div class=s>Semana del 26/11/2026 · € por unidad indicada, IVA aparte · ★ oferta de la semana hasta el 30/11/2026; el resto, según mercado (en cada pedido, el precio del día)</div><div class=c><table>${tr}</table></div>${pie}`);
await p.pdf({ path: 'Ferjusanz-precios-hosteleria.pdf', format: 'A4', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' } });
await p.screenshot({path:'vista.png',fullPage:true}); await b.close();

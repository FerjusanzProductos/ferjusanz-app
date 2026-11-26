// Dosier personal para Ábaco, Arcángel y Alameda de Osuna (Tito, 26/11/2026). Solo datos con fuente; nada inventado.
import fs from 'fs'; import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync('/home/user/ferjusanz-app/web/fotos/2026/11/' + f).toString('base64');
const fComedor = img('comedor-colegio.jpg'), fVerdura = 'data:image/jpeg;base64,' + fs.readFileSync('/home/user/ferjusanz-app/web/public/fotos/tomate-de-temporada.jpg').toString('base64');

// Barras horizontales SVG simples: [[etiqueta, valor, max, texto]]
const barras = (titulo, filas, color = '#e8742b') => `<figure><figcaption>${titulo}</figcaption><svg viewBox="0 0 340 ${filas.length * 34 + 4}" width="100%">${filas.map(([et, v, max, tx], i) => `
  <text x="0" y="${i * 34 + 13}" font-size="10" fill="#333">${et}</text>
  <rect x="0" y="${i * 34 + 17}" width="300" height="11" rx="3" fill="#f1e7df"/>
  <rect x="0" y="${i * 34 + 17}" width="${300 * v / max}" height="11" rx="3" fill="${color}"/>
  <text x="${Math.min(300 * v / max + 4, 304)}" y="${i * 34 + 27}" font-size="10" font-weight="bold" fill="#222">${tx}</text>`).join('')}</svg></figure>`;
const donut = (titulo, pct, tx) => { const r = 34, c = 2 * Math.PI * r; return `<figure><figcaption>${titulo}</figcaption><svg viewBox="0 0 340 90" width="100%"><circle cx="45" cy="45" r="${r}" fill="none" stroke="#f1e7df" stroke-width="14"/><circle cx="45" cy="45" r="${r}" fill="none" stroke="#c0392b" stroke-width="14" stroke-dasharray="${c * pct} ${c}" transform="rotate(-90 45 45)"/><text x="45" y="50" text-anchor="middle" font-size="15" font-weight="bold">${Math.round(pct * 100)} %</text><text x="98" y="40" font-size="11">${tx[0]}</text><text x="98" y="56" font-size="11">${tx[1]}</text></svg></figure>`; };
const opinion = (tx, fuente) => `<div class=op><div class=est>Opinión</div><p>${tx}</p><small>${fuente}</small></div>`;

const colegios = {
  abaco: { nombre: 'Colegio Ábaco', saludo: 'Mónica y el equipo del Colegio Ábaco',
    familias: opinion('Una familia cuenta que «la alimentación era buena hasta que se cambió el menú» y que los niños quedaron descontentos.', 'Opinión publicada en colegiopadremanjon.es (resumen)') + opinion('Otra opinión describe la comida del comedor como «comible pero bastante mejorable».', 'Opinión publicada en esopiniones.com (resumen)'),
    grafico: barras('Precio del comedor publicado (€ al mes)', [['Opinión de una familia (2020)', 140, 200, '≈ 140 €'], ['Ficha actual de colesyguardes.es', 178.22, 200, '178,22 €']], '#c0392b'),
    nota: 'La comida es el punto más comentado por las familias, y el precio del comedor ha subido. Con producto fresco de Mercamadrid se puede mejorar el plato <b>sin subir el coste</b>.' },
  alameda: { nombre: 'Colegio Alameda de Osuna', saludo: 'el equipo del comedor del Colegio Alameda de Osuna',
    familias: opinion('Algunas familias califican la comida del comedor de «terrible» o «pésima».', 'Opiniones publicadas en Google e iSchoolAdvisor (resumen)') + opinion('Otra opinión considera la variedad «aceptable pero mejorable para su precio».', 'Opinión publicada en internet (resumen)'),
    grafico: barras('Nota general del colegio en internet (sobre 5)', [['iSchoolAdvisor (5 opiniones, con críticas al comedor)', 3.6, 5, '3,6'], ['buscocolegio.com (30 opiniones)', 4.63, 5, '4,63']], '#c0392b'),
    nota: 'El colegio está bien valorado, pero la comida del comedor es lo que peor sale en las opiniones (y el comedor costaba ya unos 169 € al mes en 2018). Con fruta y verdura fresca de cada mañana, eso cambia en pocas semanas.' },
  arcangel: { nombre: 'Colegio Arcángel', saludo: 'el equipo de cocina del Colegio Arcángel',
    familias: opinion('Su web destaca que el colegio «cuenta con cocina y equipo propio» para menús adaptados a alergias e intolerancias.', 'Web oficial del colegio (colegio-arcangel.com/comedor)') + opinion('Los directorios hablan de comedor con cocina propia, unas 250 plazas y nueve menús especiales.', 'micole.net y educalista.es (resumen)'),
    grafico: barras('Lo que ya tienen ganado', [['Cocina y equipo propio', 1, 1, 'sí'], ['Menús especiales', 9, 9, '9 tipos']], '#2e7d32'),
    nota: 'Tener cocina propia es la mejor baza de un comedor. Lo que falta es que el género que entra en esa cocina sea el mejor de Mercamadrid cada mañana: eso es lo nuestro.' },
};

const css = `@page{size:A4;margin:12mm}body{font:11.5px/1.45 Arial,sans-serif;color:#222;margin:0}
h1{font-size:23px;color:#7a1f1f;margin:0 0 2px}h2{font-size:15px;color:#7a1f1f;margin:14px 0 6px;border-bottom:2px solid #e8742b;padding-bottom:3px}
.sub{color:#555;margin:0 0 10px}.hero{display:flex;gap:12px;align-items:stretch}.hero img{width:44%;height:170px;object-fit:cover;border-radius:8px}
.hero div{flex:1}.dos{display:flex;gap:14px}.dos>*{flex:1}figure{margin:0}figcaption{font-weight:bold;font-size:11px;margin-bottom:4px}
.op{border:1px solid #e5d9cf;border-radius:8px;padding:7px 10px;margin-bottom:7px;background:#fffaf5}.op p{margin:2px 0}.op small{color:#777}.est{color:#e8a33b;letter-spacing:2px}
ul{margin:4px 0;padding-left:18px}li{margin:2px 0}.caja{background:#fdf1e7;border-radius:8px;padding:8px 12px}
.firma{margin-top:10px;padding:10px 12px;background:#7a1f1f;color:#fff;border-radius:8px;font-size:13px}.firma b{font-size:16px}
.fuentes{font-size:8.5px;color:#666;margin-top:10px}.salto{page-break-before:always}`;

const pagina = c => `<!doctype html><meta charset=utf-8><style>${css}</style>
<h1>Volvamos a cuidar juntos su comedor</h1><p class=sub>Para ${c.saludo} · Ferjusanz, Mercamadrid · 26/11/2026</p>
<div class=hero><img src="${fComedor}"><div><p>Durante años tuvimos el gusto de ser el proveedor de fruta y verdura del <b>${c.nombre}</b>. Les escribimos porque creemos que ahora, más que nunca, podemos volver a ayudarles.</p>
<div class=caja><b>Lo que proponemos:</b> fruta y verdura <b>fresca, elegida cada mañana en Mercamadrid</b>, llevada en reparto refrigerado a su cocina, sin pedido mínimo y con una persona de referencia que conoce su comedor.</div></div></div>

<h2>Lo que dicen las familias</h2>
<div class=dos><div>${c.familias}</div><div>${c.grafico}<p>${c.nota}</p></div></div>
<p style="font-size:9px;color:#777">Opiniones resumidas de webs públicas, tal como aparecen en los buscadores; no son capturas.</p>

<h2>El riesgo del catering y del producto que no es del día</h2>
<div class=dos><div>${barras('Comedores con cocina externa', [['Usan «línea fría» (comida hecha fuera, enfriada y recalentada)', 7, 10, '7 de cada 10']])}
${donut('Lo que opinan los alumnos', 1 / 3, ['1 de cada 3 alumnos considera mala', 'o muy mala la comida del comedor'])}</div>
<div><ul><li>La <b>OCU</b> concluye que <b>la cocina en el centro ofrece mejor resultado</b> y anima a impulsar ese modelo; las familias desconfían de la línea fría porque la comida llega hecha y se recalienta en el colegio.</li>
<li>Otoño de 2026: familias de <b>más de 20 colegios de Málaga y Córdoba</b> hicieron huelga de comedor contra su catering por raciones escasas y baja calidad; hubo denuncias de <b>gusanos en el arroz</b> y la Junta abrió expedientes a la empresa.</li>
<li>El producto congelado o de varios días pierde sabor y textura: es el que acaba en el cubo.</li></ul></div></div>

<h2 class=salto>Lo que ya exige la ley (Real Decreto 315/2025)</h2>
<div class=dos><div>${barras('Obligatorio en colegios privados y concertados desde el 16/04/2027', [['Días con fruta fresca de postre (de 5)', 4.5, 5, '4 o 5 días'], ['Fruta y verdura de temporada (mínimo)', 45, 100, '45 %'], ['Subida permitida del precio del menú', 0, 100, '0 €']], '#2e7d32')}</div>
<div><p>La norma pide más fruta fresca y producto de temporada <b>sin subir el precio a las familias</b>. La única forma de cuadrarlo es comprar la temporada directamente en el mercado, que es lo que hacemos cada mañana. Les decimos qué sale mejor cada semana para cumplir el 45 % sin que suba el menú.</p></div></div>

<h2>Con nosotros, su comedor está cuidado</h2>
<div class=dos><img src="${fVerdura}" style="width:100%;height:150px;object-fit:cover;border-radius:8px"><ul>
<li><b>Tercera generación</b>, más de 60 años en la fruta y la verdura.</li><li>Género <b>elegido cada mañana</b> en Mercamadrid; fruta en calibre pequeño para niños, verdura para cremas y legumbres, patata también pelada y cortada.</li>
<li><b>Reparto refrigerado</b>, sin pedido mínimo; pedido hasta la tarde anterior.</li><li>Trato de casa: <b>les atendemos como si fueran nosotros mismos</b>.</li><li>Precios para colegios en el PDF adjunto (ofertas ★ hasta el 30/11).</li></ul></div>
<div class=firma>Me encantaría <b>visitarles, tener una reunión</b> con quien lleve la cocina o traerles <b>muestras sin compromiso</b>.<br><b>Fernando Sanz · 609 567 354</b> &nbsp;·&nbsp; WhatsApp pedidos 609 100 690 · Tel. 91 763 21 86 · www.ferjusanz-frutas-verduras.es</div>
<p class=fuentes>Fuentes: OCU, «Comedores escolares» (ocu.org) · Educo, estudio sobre comedores escolares (citado en magister.com) · Telecinco 07/10, 21/10 y 04/11/2026; Cordópolis y Público (Andalucía, 2026) · Real Decreto 315/2025 (BOE nº 92, 16/04/2025), art. 4 y 9 · Opiniones y precios: colegiopadremanjon.es, esopiniones.com, colesyguardes.es, buscocolegio.com, Google, iSchoolAdvisor, micole.net, educalista.es y webs de los colegios.</p>`;

const b = await chromium.launch(); const p = await b.newPage();
for (const [k, c] of Object.entries(colegios)) {
  await p.setContent(pagina(c), { waitUntil: 'load' });
  await p.pdf({ path: `Ferjusanz-${k}.pdf`, format: 'A4', printBackground: true });
  await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `dosier-${k}.png`, fullPage: true });
}
await b.close();

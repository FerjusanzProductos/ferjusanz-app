// Prueba del desglose de IVA deducido de la base y el total (facturas escaneadas sin cuadro legible).
// Uso: node pruebas/lector-desglose.test.mjs  — saca las funciones de public/index.html, sin navegador.
import fs from 'fs'; import assert from 'assert';
const s = fs.readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const trozo = (ini, fin) => { const a = s.indexOf(ini); assert(a >= 0, 'no encuentro ' + ini); return s.slice(a, s.indexOf(fin, a)); };
const codigo = [trozo('function fcNum(t)', '\n}\n') + '\n}', trozo('const FC_TIPOS_IVA', '\n'), trozo('const FC_TIPOS_RE', '\n'), trozo('const FC_RE_DE', '\nconst FC_MESES')].join('\n');
const fcDesgloseDeTotales = new Function(codigo + '\nreturn fcDesgloseDeTotales;')();
const tipos = d => d && d.map(x => x.tipo_iva + ':' + x.base + '+' + x.cuota + (x.recargo_pct ? '+RE' + x.cuota_recargo : '')).join(' ');
// Un tipo (Palacios Roca escaneada): 67,73 al 4 % = 70,44
assert.equal(tipos(fcDesgloseDeTotales({ base: 67.73, total: 70.44 }, [])), '4:67.73+2.71');
// Con recargo de equivalencia: 100 + 4 % + 0,5 % = 104,50
assert.equal(tipos(fcDesgloseDeTotales({ base: 100, total: 104.5 }, [])), '4:100+4+RE0.5');
// Dos tipos (Herederos de Carlos Gómez): 165,90 al 4 % y 5,00 al 10 % = 178,04; la base 165.90 sale escrita
assert.equal(tipos(fcDesgloseDeTotales({ base: 170.9, total: 178.04 }, ['165.90 40 6.64 0,00', 'PEREJIL 4,00 1,25 5,00'])), '4:165.9+6.64 10:5+0.5');
// Si no cuadra al céntimo, no se inventa nada
assert.equal(fcDesgloseDeTotales({ base: 100, total: 107.77 }, []), null);
assert.equal(fcDesgloseDeTotales({ base: null, total: 10 }, []), null);
console.log('✔ lector: desglose de IVA deducido, 5 casos bien');

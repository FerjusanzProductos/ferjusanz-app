// FERJUSANZ · Prueba de la fase 8c: el XML de los registros cumple el esquema oficial de la AEAT.
// Ejecutar:  node pruebas/sif/xml.mjs [datos.json]
//   Sin fichero: usa los dos registros de ejemplo de abajo (factura con recargo + rectificativa).
//   Con fichero: {"regs": [...sif_registros en orden...], "facts": {factura_id: {f, iva}}} sacado de la base de PRUEBAS.
// Necesita xmllint. Esquemas copiados en pruebas/sif/xsd (cotejados 13/11/2026 con la sede de la AEAT: iguales, salvo la ruta local de xmldsig).
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
// misma fórmula que pruebas/sif/huella.mjs (no se importa: ese fichero lanza sus pruebas al cargarse)
const huellaAlta = r => createHash('sha256').update('IDEmisorFactura=' + r.nif + '&NumSerieFactura=' + r.numSerie + '&FechaExpedicionFactura=' + r.fecha + '&TipoFactura=' + r.tipo +
  '&CuotaTotal=' + r.cuota + '&ImporteTotal=' + r.importe + '&Huella=' + r.huellaAnterior + '&FechaHoraHusoGenRegistro=' + r.fechaHora, 'utf8').digest('hex').toUpperCase();

const aqui = dirname(fileURLToPath(import.meta.url));
vm.runInThisContext(readFileSync(join(aqui, '../../public/sif-xml.js'), 'utf8'));

let datos;
if (process.argv[2]) datos = JSON.parse(readFileSync(process.argv[2], 'utf8'));
else {
  const emisor = { razon_social: 'EMPRESA DE PRUEBA S.L.', nif: '89890001K' };
  const r1 = { factura_id: 'a', nif_emisor: '89890001K', num_serie: 'PRUEBA-2026-0001', fecha_expedicion: '12-11-2026', tipo_factura: 'F1', cuota_total: '4.46', importe_total: '63.16', fecha_hora_gen: '2026-11-12T10:00:00+01:00', version_sif: 'SIF 0.3.0' };
  r1.huella = huellaAlta({ nif: r1.nif_emisor, numSerie: r1.num_serie, fecha: r1.fecha_expedicion, tipo: 'F1', cuota: r1.cuota_total, importe: r1.importe_total, huellaAnterior: '', fechaHora: r1.fecha_hora_gen });
  const r2 = { factura_id: 'b', nif_emisor: '89890001K', num_serie: 'PRUEBA-R2026-0001', fecha_expedicion: '13-11-2026', tipo_factura: 'R1', cuota_total: '-0.11', importe_total: '-1.56', fecha_hora_gen: '2026-11-13T09:00:00+01:00', version_sif: 'SIF 0.3.0' };
  r2.huella = huellaAlta({ nif: r2.nif_emisor, numSerie: r2.num_serie, fecha: r2.fecha_expedicion, tipo: 'R1', cuota: r2.cuota_total, importe: r2.importe_total, huellaAnterior: r1.huella, fechaHora: r2.fecha_hora_gen });
  const cli = { nombre: 'Bar <Prueba> & Cía', nif: 'B81401671' };
  datos = { regs: [r1, r2], facts: {
    a: { f: { emisor, cliente: cli, concepto: 'Venta de fruta y verdura', prueba: true }, iva: [{ tipo_iva: 4, base: 57.20, cuota_iva: 2.29, tipo_re: 0.5, cuota_re: 0.29 }, { tipo_iva: 10, base: 1.50, cuota_iva: 0.15, tipo_re: 1.4, cuota_re: 0.02 }] },
    b: { f: { emisor, cliente: cli, concepto: 'Rectificación de PRUEBA-2026-0001', prueba: true, rectifica_codigo: 'PRUEBA-2026-0001' }, iva: [{ tipo_iva: 4, base: -1.45, cuota_iva: -0.06, tipo_re: 0.5, cuota_re: -0.01 }] } } };
  // (cuotas del ejemplo inventadas; solo importa el formato)
}

const lotes = globalThis.sifXml(datos.regs, datos.facts);
const dir = mkdtempSync(join(tmpdir(), 'sifxml-'));
let fallos = 0;
lotes.forEach((x, i) => {
  const f = join(dir, 'lote' + (i + 1) + '.xml'); writeFileSync(f, x);
  try { execFileSync('xmllint', ['--noout', '--nonet', '--schema', join(aqui, 'xsd/SuministroLR.xsd'), f], { stdio: 'pipe' }); console.log('✅ lote ' + (i + 1) + ': cumple el esquema de la AEAT (' + (x.match(/<sf:RegistroAlta>/g) || []).length + ' registros) → ' + f); }
  catch (e) { fallos++; console.log('❌ lote ' + (i + 1) + ':\n' + String(e.stderr)); }
});
// La cadena del XML: cada registro apunta a la huella del anterior
const x = lotes.join('');
const cad = datos.regs.slice(1).every((r, i) => x.includes('<sf:NumSerieFactura>' + datos.regs[i].num_serie + '</sf:NumSerieFactura><sf:FechaExpedicionFactura>' + datos.regs[i].fecha_expedicion + '</sf:FechaExpedicionFactura><sf:Huella>' + datos.regs[i].huella));
console.log(cad ? '✅ encadenamiento correcto en el XML' : '❌ encadenamiento mal'); if (!cad) fallos++;
process.exit(fallos ? 1 : 0);

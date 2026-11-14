// FERJUSANZ · Prueba técnica de referencia del SIF (Verifactu): huella SHA-256, encadenamiento y URL del QR.
// NO es parte de la app ni emite nada: solo comprueba que sabemos calcular la huella igual que la AEAT.
// Ejecutar:  node pruebas/sif/huella.mjs
// Los 3 casos de ejemplo son los publicados por la AEAT en su documento «Detalle de las especificaciones
// técnicas para generación de la huella o hash de los registros de facturación» (NIF ficticio 89890001K).
// ⚠️ Comprobar el documento vigente en la sede de la AEAT antes de dar la prueba por buena para producción.

import { createHash } from 'node:crypto';

const sha256 = s => createHash('sha256').update(s, 'utf8').digest('hex').toUpperCase();

// Registro de ALTA (orden de campos fijado por la AEAT; valores sin espacios a los lados)
export function huellaAlta(r) {
  const t = 'IDEmisorFactura=' + r.nif.trim() +
    '&NumSerieFactura=' + r.numSerie.trim() +
    '&FechaExpedicionFactura=' + r.fecha.trim() +      // dd-mm-aaaa
    '&TipoFactura=' + r.tipo.trim() +                  // F1, F2, R1…R5, F3
    '&CuotaTotal=' + r.cuota.trim() +
    '&ImporteTotal=' + r.importe.trim() +
    '&Huella=' + (r.huellaAnterior || '').trim() +     // vacío solo en el PRIMER registro
    '&FechaHoraHusoGenRegistro=' + r.fechaHora.trim(); // ISO 8601 con huso: 2024-01-01T19:20:30+01:00
  return sha256(t);
}

// Registro de ANULACIÓN
export function huellaAnulacion(r) {
  const t = 'IDEmisorFacturaAnulada=' + r.nif.trim() +
    '&NumSerieFacturaAnulada=' + r.numSerie.trim() +
    '&FechaExpedicionFacturaAnulada=' + r.fecha.trim() +
    '&Huella=' + (r.huellaAnterior || '').trim() +
    '&FechaHoraHusoGenRegistro=' + r.fechaHora.trim();
  return sha256(t);
}

// URL del QR (cotejo de la factura). ⚠️ Confirmar direcciones en la sede de la AEAT antes de usarlas.
export function urlQR({ nif, numSerie, fecha, importe }, entorno = 'pruebas') {
  const base = entorno === 'produccion'
    ? 'https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR'
    : 'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR';
  return base + '?nif=' + encodeURIComponent(nif) + '&numserie=' + encodeURIComponent(numSerie) +
    '&fecha=' + encodeURIComponent(fecha) + '&importe=' + encodeURIComponent(importe);
}

// ---------- Casos de prueba ----------
const casos = [];
const caso = (id, nombre, obtenido, esperado) => casos.push({ id, nombre, ok: obtenido === esperado, obtenido, esperado });

const h1 = huellaAlta({ nif: '89890001K', numSerie: '12345678/G33', fecha: '01-01-2024', tipo: 'F1', cuota: '12.35', importe: '123.45', huellaAnterior: '', fechaHora: '2024-01-01T19:20:30+01:00' });
caso('T-HASH-01', 'Primer registro de alta (sin huella anterior)', h1, '3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60');

const h2 = huellaAlta({ nif: '89890001K', numSerie: '12345679/G34', fecha: '01-01-2024', tipo: 'F1', cuota: '12.35', importe: '123.45', huellaAnterior: h1, fechaHora: '2024-01-01T19:20:35+01:00' });
caso('T-HASH-02', 'Segundo registro encadenado al primero', h2, 'F7B94CFD8924EDFF273501B01EE5153E4CE8F259766F88CF6ACB8935802A2B97');

const h3 = huellaAnulacion({ nif: '89890001K', numSerie: '12345679/G34', fecha: '01-01-2024', huellaAnterior: h2, fechaHora: '2024-01-01T19:20:40+01:00' });
caso('T-HASH-03', 'Registro de anulación encadenado', h3, '177547C0D57AC74748561D054A9CEC14B4C4EA23D1BEFD6F2E69E3A388F90C68');

// Inalterabilidad: cambiar 1 céntimo debe cambiar la huella
const hMod = huellaAlta({ nif: '89890001K', numSerie: '12345678/G33', fecha: '01-01-2024', tipo: 'F1', cuota: '12.35', importe: '123.46', huellaAnterior: '', fechaHora: '2024-01-01T19:20:30+01:00' });
caso('T-HASH-04', 'Cambiar 1 céntimo cambia la huella', hMod !== h1, true);

// Encadenamiento: si se toca el registro 1, la huella del 2 recalculada ya no coincide con la guardada
const h2conH1Mod = huellaAlta({ nif: '89890001K', numSerie: '12345679/G34', fecha: '01-01-2024', tipo: 'F1', cuota: '12.35', importe: '123.45', huellaAnterior: hMod, fechaHora: '2024-01-01T19:20:35+01:00' });
caso('T-HASH-05', 'Tocar un registro rompe la cadena del siguiente', h2conH1Mod !== h2, true);

caso('T-QR-01', 'URL del QR con «/» y «&» bien codificados',
  urlQR({ nif: '89890001K', numSerie: '12345678&G33', fecha: '01-01-2024', importe: '241.4' }),
  'https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR?nif=89890001K&numserie=12345678%26G33&fecha=01-01-2024&importe=241.4');

let fallos = 0;
for (const c of casos) {
  console.log((c.ok ? '✅' : '❌') + ' ' + c.id + ' · ' + c.nombre + (c.ok ? '' : '\n   obtenido: ' + c.obtenido + '\n   esperado: ' + c.esperado));
  if (!c.ok) fallos++;
}
console.log(fallos ? '\n' + fallos + ' prueba(s) FALLAN' : '\nTodas las pruebas de referencia pasan (' + casos.length + ').');
if (fallos) process.exit(1);   // sin exit si pasa: así bateria.mjs puede importar este archivo y seguir

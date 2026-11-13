/* FERJUSANZ · SIF (Verifactu) fase 8c: prepara los registros de facturación en el formato XML de la AEAT
   (RegFactuSistemaFacturacion, esquemas SuministroLR.xsd / SuministroInformacion.xsd, copia en pruebas/sif/xsd).
   NO envía nada: el envío necesita el certificado de representante (FNMT) y va aparte, envuelto en SOAP.
   Lo usan la app (Facturas → Emitidas) y la prueba pruebas/sif/xml.mjs, que lo valida contra el esquema oficial.
   Los importes, fechas y huellas salen del registro guardado (sif_registros), que es lo que firma la huella. */
(function (g) {
  const NS_LR = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroLR.xsd';
  const NS_SF = 'https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SuministroInformacion.xsd';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const t = (n, v) => '<sf:' + n + '>' + esc(v) + '</sf:' + n + '>';
  const imp = n => Number(n).toFixed(2);
  const corta = (s, n) => String(s || '').trim().slice(0, n);

  /* regs: TODOS los sif_registros en orden de cadena (id). facts: { factura_id: { f: sif_facturas, iva: [sif_factura_iva] } }.
     Devuelve un XML por cada 1.000 registros (máximo de la AEAT por envío). */
  function sifXml(regs, facts) {
    const porNum = {}; regs.forEach(r => { porNum[r.num_serie] = r; });
    const altas = regs.map((r, i) => {
      const x = facts[r.factura_id]; if (!x) throw new Error(r.num_serie + ': faltan los datos de la factura');
      const f = x.f, e = f.emisor || {}, c = f.cliente || {}, ant = regs[i - 1];
      const nifCli = String(c.nif || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      // shortcut: solo clientes con NIF español; un cliente extranjero necesitaría IDOtro
      if (nifCli.length !== 9) throw new Error(r.num_serie + ': el cliente no tiene un NIF español válido');
      if (!x.iva || !x.iva.length) throw new Error(r.num_serie + ': falta el desglose de IVA');
      let rect = '';
      if (r.tipo_factura === 'R1') {   // la app rectifica por diferencias → «I» (incremental)
        const o = porNum[f.rectifica_codigo];
        if (!o) throw new Error(r.num_serie + ': no se encuentra el registro de la factura que rectifica');
        rect = t('TipoRectificativa', 'I') + '<sf:FacturasRectificadas><sf:IDFacturaRectificada>' + t('IDEmisorFactura', r.nif_emisor) +
          t('NumSerieFactura', f.rectifica_codigo) + t('FechaExpedicionFactura', o.fecha_expedicion) + '</sf:IDFacturaRectificada></sf:FacturasRectificadas>';
      }
      // ClaveRegimen 01 también con recargo de equivalencia: válido (AEAT, Validaciones y errores v1.0.7/1.1.2 quitó la obligación de usar la 18)
      const desglose = x.iva.map(d => '<sf:DetalleDesglose>' + t('Impuesto', '01') + t('ClaveRegimen', '01') + t('CalificacionOperacion', 'S1') +
        t('TipoImpositivo', imp(d.tipo_iva)) + t('BaseImponibleOimporteNoSujeto', imp(d.base)) + t('CuotaRepercutida', imp(d.cuota_iva)) +
        (Number(d.tipo_re) ? t('TipoRecargoEquivalencia', imp(d.tipo_re)) + t('CuotaRecargoEquivalencia', imp(d.cuota_re)) : '') + '</sf:DetalleDesglose>').join('');
      const enc = ant ? '<sf:RegistroAnterior>' + t('IDEmisorFactura', ant.nif_emisor) + t('NumSerieFactura', ant.num_serie) +
        t('FechaExpedicionFactura', ant.fecha_expedicion) + t('Huella', ant.huella) + '</sf:RegistroAnterior>' : t('PrimerRegistro', 'S');
      return '<sfLR:RegistroFactura><sf:RegistroAlta>' + t('IDVersion', '1.0') +
        '<sf:IDFactura>' + t('IDEmisorFactura', r.nif_emisor) + t('NumSerieFactura', r.num_serie) + t('FechaExpedicionFactura', r.fecha_expedicion) + '</sf:IDFactura>' +
        t('NombreRazonEmisor', corta(e.razon_social, 120)) + t('TipoFactura', r.tipo_factura) + rect +
        t('DescripcionOperacion', corta(f.concepto, 500)) +
        '<sf:Destinatarios><sf:IDDestinatario>' + t('NombreRazon', corta(c.nombre, 120)) + t('NIF', nifCli) + '</sf:IDDestinatario></sf:Destinatarios>' +
        '<sf:Desglose>' + desglose + '</sf:Desglose>' + t('CuotaTotal', r.cuota_total) + t('ImporteTotal', r.importe_total) +
        '<sf:Encadenamiento>' + enc + '</sf:Encadenamiento>' +
        '<sf:SistemaInformatico>' + t('NombreRazon', corta(e.razon_social, 120)) + t('NIF', r.nif_emisor) + t('NombreSistemaInformatico', 'FERJUSANZ APP') +
        t('IdSistemaInformatico', 'FJ') + t('Version', corta(r.version_sif, 50)) + t('NumeroInstalacion', f.prueba ? 'PRUEBAS' : '1') +
        t('TipoUsoPosibleSoloVerifactu', 'N') + t('TipoUsoPosibleMultiOT', 'N') + t('IndicadorMultiplesOT', 'N') + '</sf:SistemaInformatico>' +
        t('FechaHoraHusoGenRegistro', r.fecha_hora_gen) + t('TipoHuella', '01') + t('Huella', r.huella) + '</sf:RegistroAlta></sfLR:RegistroFactura>';
    });
    const e0 = regs.length ? (facts[regs[0].factura_id].f.emisor || {}) : {};
    const lotes = [];
    for (let i = 0; i < altas.length; i += 1000)
      lotes.push('<?xml version="1.0" encoding="UTF-8"?>\n<sfLR:RegFactuSistemaFacturacion xmlns:sfLR="' + NS_LR + '" xmlns:sf="' + NS_SF + '">' +
        '<sfLR:Cabecera><sf:ObligadoEmision>' + t('NombreRazon', corta(e0.razon_social, 120)) + t('NIF', regs[0].nif_emisor) + '</sf:ObligadoEmision></sfLR:Cabecera>' +
        altas.slice(i, i + 1000).join('\n') + '</sfLR:RegFactuSistemaFacturacion>\n');
    return lotes;
  }
  g.sifXml = sifXml;
})(typeof window !== 'undefined' ? window : globalThis);

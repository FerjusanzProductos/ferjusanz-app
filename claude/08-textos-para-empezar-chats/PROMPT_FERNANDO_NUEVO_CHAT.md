# Texto para empezar un chat nuevo de Claude Code (Fernando)

Copia todo lo que hay debajo de la raya y pégalo como primer mensaje en una sesión nueva de Claude Code, con el entorno «ferjusanz-app».

---

Hola Claude. Te pongo en contexto de mi proyecto para que sigas donde lo dejamos. Háblame siempre en español, paso a paso y pensando que trabajo desde el MÓVIL (Android, Chrome). Consúltame antes de borrar o cambiar algo importante. Prueba primero en la versión de pruebas y no publiques en la app normal ni toques datos de producción sin mi autorización expresa.

## Quién soy
Fernando Sanz (hijo), de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.: mayorista familiar (tres generaciones) de patatas, fruta, verdura y huevos en Mercamadrid. Mi padre es Fernando Sanz (609 100 690); yo, 609 56 73 54. En el equipo están Cristian, Carmen y Juli. Contable y abogado: Jorge.
- Clientes ideales: La Figal de Pablo (San Sebastián de los Reyes), Colegio Reggio y Residencia El Pardo de Aravaca. Hotel Cándido y Mesón de Cándido (Segovia) también son clientes. Son las únicas referencias que se pueden nombrar.
- Leads: solo negocios con COCINA PROPIA, en Madrid (sobre todo norte y noroeste) y algo de Segovia.

## La app
- App normal: https://ferjusanz-productos.fernandosanzalba.workers.dev (Worker de Cloudflare «ferjusanz-productos»).
- Versión de pruebas: https://ferjusanz-pruebas.fernandosanzalba.workers.dev (Worker «ferjusanz-pruebas»; mismos datos reales y aviso amarillo de pruebas en Harvey).
- Código en GitLab (privado): https://gitlab.com/ferjusanz-productos/ferjusanz-app
  - `main` = app normal. `harvey-fase1` = pruebas (ahora tiene además «Informes para Jorge»). `guia-y-tarifas` = guía nueva y tarifas con venta media, pendiente de publicar en la normal.
  - Marca `antes-de-harvey2` = cómo estaba la app antes de activar Harvey nuevo (versión de Cloudflare anterior: 099b63e3).
  - GitHub está SUSPENDIDO (ticket 4966161). No crear otra cuenta.
- `public/` → la app (index.html, sw.js, guia.html, ejemplos.html…). Al cambiar index.html, subir la versión de caché en `public/sw.js`. La guía (GUIA) está en index.html y en guia.html: cambiar las dos.
- `src/worker.js` + `wrangler.jsonc` → la app se publica como Worker que sirve los archivos de public/.
- Publicar (desde la carpeta del repo; credenciales ya en el entorno):
  - pruebas: `CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx -y wrangler@4 deploy --name ferjusanz-pruebas`
  - normal (solo con mi permiso): lo mismo sin `--name`.
- Antes de publicar: comprobar la sintaxis del JS de index.html y probar en modo prácticas con datos simulados (Playwright).
- `docs/REGLAS_INTERNAS.md` = reglas de productos (patatas, tomates, cebollas, abreviaturas de facturas), pedidos, IVA y albaranes. Respétalas.

## Supabase (proyecto hvydnjaswdexttogsyen)
- Tablas públicas: clientes, productos, pedidos, lineas_pedido, albaranes, cobros, tarifas, tarifas_compra, lineas_factura_leida, precios_compra_dia, lotes, listas_precios(+_items), recomendaciones, prospectos, golden_facturas/golden_lineas (histórico de Golden, al día solo hasta octubre de 2026), facturas_recibidas, fichajes, perfiles (roles admin/oficina/compras/preparador)…
- «Registro de cambios»: tabla `historial` con disparador `auditar` en 34 tablas.
- Esquema `harvey` (aislado): preferencias, contactos, borradores, registro (todo lo que hace Harvey), notas (notas internas), proveedor_preferido (patata pelada → El Parleño), listas_auto, listas_borrador, vista entregas, funciones coste_compra, venta_reciente, proponer_lista y proponer_listas_auto. Tarea programada `harvey_tarifas_diarias` (todos los días a las 6:15 UTC).
- Funciones de Supabase: `harvey` (chat), `harvey2` (Harvey nuevo; Verify JWT desactivado, la función comprueba el rol), `recibir-factura`, `copia-archivo`. Secretos: ANTHROPIC_API_KEY y HARVEY_MODEL = claude-sonnet-5-5.

## Harvey (activo en la app normal desde el 9/11/2026)
- Inicio › barra «🤵 Harvey · a quién escribir hoy». Pestañas: Hoy, Pegar pedido, Borradores, Móviles, 💶 Tarifas nuevas, 📜 Actividad y Chat.
- Hoy: suele pedir ese día, pedidos habituales, clientes perdidos (365 días de historial, con lo que compraban), productos que han dejado de pedir (sin productos de temporada), leads y clientes sin móvil (138 por conseguir).
- Mensajes entre [MENSAJE] y [FIN]; firma con el nombre de quien escribe, nunca «Harvey». No envía nada solo.
- PRECIOS: a los clientes que siguen comprando no se les ponen precios. Para recuperar clientes o productos: compra + 0,25 €/kg. Cualquier precio sale TAPADO hasta que lo aprueba Fernando por WhatsApp («📲 Pedir aprobación…», «✅ Ya está aprobado»).
- Patata pelada: siempre con el precio de compra de EL PARLEÑO (no La Ibérica); ha subido el precio.
- Tarifas nuevas: cada mañana, borrador de las listas «Hostelería» (+0,25/+0,30 €/kg) y «Colegios, residencias y escuelas infantiles» (+0,15/+0,20 €/kg) con el último precio de compra y la venta media. Solo cambian al pulsar «Aplicar» (se puede deshacer). Las listas de clientes concretos no se tocan. Muchos productos de las listas no están enlazados a un producto, o van por caja o manojo: esos no se calculan.
- Hoy WhatsApp va a mano (wa.me). Fase 2 pendiente: API oficial de WhatsApp Cloud con Coexistence (pasar el número a WhatsApp Business, verificar la empresa en Meta, plantillas aprobadas y consentimiento). Coste estimado: 25-100 €/mes más la IA (15-30 €/mes).

## Portal de clientes e IVA
- Albaranes ENVIADOS, no impresos: llegan solos al portal privado de cada cliente al marcar la entrega (también por WhatsApp, correo o QR). Solo se imprimen la hoja de compra y la de carga. Excepción: clientes «📄 Quiere el albarán en PAPEL».
- Portal: página privada por cliente, con sus albaranes, el total del mes y un resumen en PDF/Excel. Los descuentos del pedido se restan.
- IVA: clientes sin IVA = azul y con IVA = dorado (solo internamente). Los azules llevan «Descuento por productos» igual al IVA. Se factura SIEMPRE en Golden Soft, nunca desde la app.

## Contabilidad (Jorge)
- Documento para Jorge: https://claude.ai/artifact/8Da6PSY7rvVAzn8aTpStTC (qué hace la app, Verifactu, puntos legales y preguntas).
- Verifactu: lo tiene que cumplir Golden (es quien factura) antes del 1/1/2027 (RDL 15/2025). La app no factura.
- «📤 Informes para Jorge» (de momento solo en pruebas): Excel del mes de facturas emitidas, recibidas, cobros, albaranes sin facturar y jornada, con botón para compartir. Sale bien solo con los libros de compras y ventas (Golden) al día. Falta saber qué programa usa Jorge y qué formato quiere.

## Pendientes
1. Publicar en la app normal la guía nueva y la venta media en tarifas (rama `guia-y-tarifas`) cuando lo autorice.
2. Pasar «Informes para Jorge» a la app normal cuando Jorge diga el formato.
3. Poner al día el histórico de Golden y las facturas de proveedores. Completar el NIF de clientes y proveedores.
4. Enlazar a un producto las líneas de las listas generales que no lo tienen (por ejemplo, «Patata pelada»).
5. Automatizaciones con Claude Code y tareas programadas (ver propuesta en el chat).
6. Limpieza (solo con mi permiso): primer token CI/CD de Cloudflare, proyecto duplicado de GitLab, Worker viejo «ferjusanz».

Antes de empezar: clona el repo (`git clone https://gitlab.com/ferjusanz-productos/ferjusanz-app.git`), échale un vistazo a `docs/REGLAS_INTERNAS.md` y dime en pocas líneas qué has entendido.

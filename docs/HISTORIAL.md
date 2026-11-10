# Historial de FERJUSANZ
_Lo más nuevo arriba. El detalle de cada cambio está en el historial de GitLab (`git log`). Aquí van los cambios importantes, las decisiones y los errores corregidos._

## 11/11/2026
- **v194 publicada en la app normal con TODO lo de pruebas** (Fernando: «Que esté todo!»): Informes para Jorge, ayuda guiada 🆘 con «Hazlo conmigo», Harvey con mensajes de WhatsApp naturales y «lo de siempre» con Golden. Creada en Supabase la función `memoria_golden`. **Decisión:** no dejar cosas solo en pruebas; la app de pruebas sale de main.
- **«Lo de siempre» aprende de Golden (v193, solo PRUEBAS)**, pedido por Fernando («Hazlo con Golden»): al elegir un cliente en el pedido rápido, la app mira también sus últimos 30 albaranes de Golden y propone lo que suele llevar y cuánto. Así, tras el «Contador a cero», no empieza de cero. Para que lo vean todos los que apuntan pedidos (no solo oficina) falta crear en Supabase la función `memoria_golden` (`supabase/migrations/20261111a_memoria_golden.sql`).
- **Unidades de todos los productos**: Fernando da el «OK» a la lista (cajas, bandejas, bolsas, piezas, manojos y huevos por docena). SQL preparado en `supabase/migrations/20261111b_unidades_libro_ventas.sql`, sin aplicar hasta su confirmación.
- **v190 publicada en la app normal** («Autorizo publicar»): pantalla Precios / facturas de proveedor (los 4 cambios de abajo) y **mora → bandeja** (confirmado por Fernando).
- **Pantalla Precios / facturas de proveedor (v189, solo en PRUEBAS)**, los 4 pedidos de Fernando del 10/11:
  1. **Unidad del libro de ventas**: arándano y frambuesa por **bandeja** y ensalada campestre por **bolsa** (nunca «pieza»). Al leer facturas, registrar compras y apuntar un precio a mano se propone esa unidad; si la factura viene en otra (p. ej. kg y en ventas va por caja), sale un aviso naranja. Los «Arándano 2 pieza» ya leídos se ven ahora como bandeja.
  2. **Registrar sin salir de la pantalla**: botón «Revisar y registrar» en Precios de compra del día y en la bandeja de Facturas de proveedores; se abre encima, se registra y se sigue en la misma pantalla. El registro detallado (lotes, origen) ya no salta a «Lotes»: vuelve a la bandeja.
  3. **«✅ Registrar todas las compras del día»**: registra de una vez las facturas completas (con proveedor y todo reconocido) y dice cuáles hay que revisar a mano.
  4. **Productos no reconocidos en ROJO** (arriba del todo y dentro de cada factura) y mejor lectura: «BANDEJA»/«BJ-» se entiende como bandeja y se quitan los códigos de artículo del final (p. ej. «856150»).
- Decisión: la app de pruebas se publica desde `harvey-fase1` + este cambio para no perder Informes para Jorge.

## 10/11/2026
- **Auditoría y memoria permanente** (sesión «TikTok video installation»): se crean CLAUDE.md y los documentos de `docs/`. **GitLab pasa a ser el maestro y GitHub la copia** (lo anterior de GitHub queda en la rama `respaldo-github-antes-espejo`).
- **v188 publicada en la app normal**: ayuda 🆘 completa (respuesta al momento con IA, audio y «Hazlo conmigo»), sin Informes para Jorge.
- Kit de Claude Code: plugins ponytail, agent-skills y /watch; skills graphify, security-audit y kit-ferjusanz; conectores playwright, firecrawl, perplexity y posthog. **Decisión:** OmniRoute no se instala en el proyecto, solo hay una guía para usarlo en el ordenador.
- v176: botón 🆘 Ayuda en la app normal. v170: **arreglado el iPhone**, que veía la app gigante (el arreglo del «modo ordenador» se aplicaba por error en Safari).
- v164-v166: panel «Lo de hoy» y app de pruebas naranja para no confundirla.
- v154-v162: portal con «Guardarlo en mi WhatsApp» y recuadro de contacto, **correo automático del albarán al entregar** y WhatsApp desde el móvil del repartidor. **Decisión:** el WhatsApp automático desde el 609 queda aparcado.
- v156-v160: arreglo del «modo ordenador» de algunos Android. Vuelve el diseño decorado (lo que se veía lejos era ese modo).
- Clientes sin IVA (azul) a 10/11: Bar Camarero, Bar La Torre, Bar Andorra, Bar Delfín y Frutas Pedro.

## 09/11/2026
- v146-v152: Harvey con venta con visita, confirmar pedidos, presentaciones y listas. Letra grande A+, menú nuevo e Inicio ordenado por uso. Lupa ampliada.
- Coste del día con la compra del mismo día y diseño decorado (PDF de listas y portal). Versión visible y actualización sola.
- **Tarifas nuevas y listas** (WhatsApp y PDF, ganancia por unidad real, regalos a 0,00). **Trazabilidad** por el lote más antiguo.
- **Harvey 2** (fases en pruebas y luego activado para todos): «Hoy», pedido pegado a borrador, ofertas de recuperación (compra + 0,25 €), aprobación de precios por WhatsApp. El Parleño como proveedor de patata pelada.
- Informes para Jorge (solo en pruebas). Prompts para nuevas conversaciones (`docs/PROMPTS.md`).
- Reglas internas: nombres que confunden (Daniela, mezclum, plátanos, cebollas, melón de Brasil, huevos de Patatas del Olmo…).

## 08/11/2026
- **Publicación en Cloudflare** desde GitLab (Worker que sirve `public/`) y **copia nocturna de Supabase** en GitLab durante 90 días.
- **Lector de facturas** mejorado (OCR por posición de las palabras, líneas partidas, base imponible) y reglas por familias. **Errores corregidos**: Daniela como «Berros», tomates como «Tomate 1ª», cebolla saco cal. 3 como 1x1, ajos caja como pelados, naranja de zumo como zumo embotellado, «P.P. bolsa brava» como breva, «pimiento california» como pimienta negra…
- **Pedidos fijos y previstos**, calendario, pantalla Semana y contador a cero.
- **Decisiones:** clientes sin IVA en azul con «Descuento por productos». **Albaranes enviados, no impresos** (solo se imprimen la hoja de compra y la de carga). Copia rosa con el código de Golden. Se factura siempre en Golden Soft. El portal es privado (sin gestoría). Patata general 09-F en temporada de patata nueva.
- Guía de la secretaria con fotos, página de ejemplos y Modo prácticas.

## 07/11/2026
- **Harvey**, agente comercial con IA: cliente ideal (La Figal de Pablo, Colegio Reggio, Residencia El Pardo de Aravaca) y referencias autorizadas (más Hotel/Mesón de Cándido en Segovia). **Decisión:** Harvey no se presenta como Harvey ante clientes; firma la persona de la oficina.

## Antes del 07/11/2026
- 29/10 a 06/11: versiones iniciales subidas a mano a GitHub (`index.html` en la raíz). Guardadas en la rama `respaldo-github-antes-espejo` de GitHub.
- ⚠️ No hay registro detallado de esta etapa ni de conversaciones de claude.ai fuera de Claude Code. Si Fernando aporta exportaciones o notas, añadirlas aquí.

## Fuentes de este historial
- Historial completo de GitLab (134 cambios) ✅ y documentos `LEEME.md`, `REGLAS_INTERNAS.md` y `PROMPTS.md` ✅.
- Sesiones de Claude Code «Claude RC Harvey» y «Contexto proyecto Ferjusanz»: **solo se leyeron sus resúmenes y unos pocos mensajes**, porque casi todo su contenido son resultados técnicos. Lo hecho en ellas está en el historial de GitLab.

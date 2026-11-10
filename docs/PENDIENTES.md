# Pendientes de FERJUSANZ
_Mantener al día: al terminar una tarea, marcarla ✔️ y pasarla a HISTORIAL.md. Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda._

## Por publicar o decidir
- 🔴 **Informes para Jorge** a la app normal (está en pruebas, rama `harvey-fase1`). Juntar con main, probar y pedir «Autorizo publicar».
- 🟡 **Harvey: mensajes de WhatsApp naturales** (en pruebas) a la app normal.
- 🟡 Juntar la rama `memoria-permanente` (estos documentos) con main y borrar las ramas ya incluidas.
- ⚪ Borrar el Worker antiguo `ferjusanz` en Cloudflare.

## Pedido por Fernando el 10/11/2026 (pantalla Precios / facturas de proveedor)
- 🔴 **Unidad de cada producto como en el libro de ventas**: p. ej. frambuesa y arándano se compran y venden **por bandeja**, no por pieza. Al apuntar un precio a mano, proponer la unidad que usamos en ventas. Revisar los productos que ahora salen en la unidad equivocada (p. ej. «Arándano 4 pieza»).
- 🔴 **Registrar la compra sin salir de la pantalla**: al revisar una factura de proveedor y pulsar registrar, quedarse en la misma pantalla (no obligar a volver atrás).
- 🔴 **Botón «Registrar todas las compras del día»** de una vez, en esa misma pantalla.
- 🔴 **Productos no reconocidos en ROJO** en las líneas de la factura, y mejorar la lectura (transcripción) de las líneas.

## Esperando a Fernando
- 🟡 Confirmar la **lista completa de clientes sin IVA (azul)** y si «Bar Delfín» es la misma ficha que «Bar Delfines» (DEFINES).
- 🟡 **Numeración real de albaranes**: al empezar de verdad, decir el último número de Golden (serie F).
- ⚪ **Cambio de temporada de patata** (09-F → 01-F) cuando lo diga («cambio de temporada patata»).
- ⚪ **WhatsApp automático** desde el 609 567 354 (API de Meta): aparcado hasta que lo diga.
- 🟡 Poner las claves de los conectores de Claude: `GEMINI_API_KEY`, `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY` y `POSTHOG_API_KEY`.
- 🟡 En GitLab, activar la copia automática a GitHub (Settings → Repository → Mirroring repositories). Mientras tanto, Claude copia a mano después de cada cambio.

## Mejoras pedidas (de `docs/PROMPTS.md`; recomendado empezar por la 3 y la 6)
1. 🟡 Revisión de diseño y usabilidad en el móvil (lista priorizada, sin cambiar nada hasta elegir).
2. ⚪ Agente buscador de clientes nuevos con cocina propia (Madrid norte y noroeste, Segovia), sin duplicados.
3. 🔴 **Agente de seguimiento diario**: a quién llamar o escribir hoy, con los mensajes preparados.
4. ⚪ Agente de ofertas semanales por tipo de cliente.
5. 🟡 Agente de cobros: deudas por urgencia y recordatorios.
6. 🔴 **Agente de compras y facturas**: precios raros, productos mal apuntados, margen mínimo y comprobación con las facturas de Golden.
7. 🟡 Harvey orquestador v2: apuntar contactos, confirmar previstos, pedidos desde WhatsApp y recordatorios de cobro (siempre con confirmación).
8. 🔴 **Copia de seguridad de fotos, PDF y audios** de Supabase Storage (ahora no se copian).

## Comprobaciones técnicas
- 🟡 Comprobar que la copia nocturna de GitLab se está ejecutando y que se puede restaurar.
- ⚪ Auditoría de seguridad de la app y de Supabase (skill `security-audit`).
- ⚪ Hacer más pequeño `public/index.html` (más de 1 MB) para que cargue más rápido.

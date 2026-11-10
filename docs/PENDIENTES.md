# Pendientes de FERJUSANZ
_Mantener al día: al terminar una tarea, marcarla ✔️ y pasarla a HISTORIAL.md. Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda._

## Por publicar o decidir
- ✔️ 11/11/2026: TODO lo de pruebas publicado en la normal (v194): Informes para Jorge, ayuda guiada 🆘, Harvey con WhatsApp natural, Precios / facturas y «lo de siempre» con Golden.
- 🟡 Desde ahora la app de pruebas sale de `main` (+ el cambio que se esté probando). No volver a dejar cosas solo en pruebas.
- 🟡 Juntar la rama `memoria-permanente` (estos documentos) con main y borrar las ramas ya incluidas.
- ⚪ Borrar el Worker antiguo `ferjusanz` en Cloudflare.

## Pedido por Fernando el 10/11/2026 (pantalla Precios / facturas de proveedor) — ✔️ publicado (v190)
- ✔️ Publicado en la app normal (v190) el 11/11/2026 con «Autorizo publicar».
- 🟡 **Fernando decide**: corregir en la ficha de los productos la unidad de venta (ahora todos salen «kg»): Arándano (513) y Frambuesa (310) → bandeja; Ensalada Campestre (137-P) → bolsa. Mora del bosque (257) → bandeja (confirmado 11/11). Mientras tanto la app ya usa la unidad buena al leer facturas y al apuntar precios.

## Revisado el 11/11/2026 (para cuando se empiece de verdad)
- 🔴 **Unidades de TODOS los productos**: lista confirmada por Fernando («OK» dos veces). El cambio en Supabase se lanzó pero se quedó esperando su aprobación en el aviso del móvil: volver a lanzarlo cuando esté delante. SQL: `supabase/migrations/20261111b_unidades_libro_ventas.sql` (37 productos pasan a cobrarse por caja, bandeja, bolsa, pieza, manojo o docena; también sus pedidos fijos y previstos).
- ✔️ **«Lo de siempre» con Golden**: publicado (v194) y función `memoria_golden` creada en Supabase el 11/11/2026: lo ve todo el equipo (sin precios).
- 🟢 **Trazabilidad**: hecha y lista (lote más antiguo, reparto, confirmar todo). Empieza a funcionar sola en cuanto se registren compras con lotes.

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

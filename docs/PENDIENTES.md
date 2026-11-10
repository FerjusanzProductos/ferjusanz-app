# Pendientes de FERJUSANZ
_Mantener al día: al terminar una tarea, marcarla ✔️ y pasarla a HISTORIAL.md. Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda._

## Por publicar o decidir
- 🔴 **Informes para Jorge** a la app normal (está en pruebas, rama `harvey-fase1`). Juntar con main, probar y pedir «Autorizo publicar».
- 🟡 **Harvey: mensajes de WhatsApp naturales** (en pruebas) a la app normal.
- 🟡 Juntar la rama `memoria-permanente` (estos documentos) con main y borrar las ramas ya incluidas.
- ⚪ Borrar el Worker antiguo `ferjusanz` en Cloudflare.

## Pedido por Fernando el 10/11/2026 (pantalla Precios / facturas de proveedor) — ✔️ hecho en PRUEBAS (v189)
- 🔴 **Publicar en la app normal** cuando Fernando lo pruebe y escriba «Autorizo publicar» (código en la rama de GitLab `precios-facturas`; la app de pruebas lo tiene en `harvey-fase1`).
- 🟡 **Fernando decide**: corregir en la ficha de los productos la unidad de venta (ahora todos salen «kg»): Arándano (513) y Frambuesa (310) → bandeja; Ensalada Campestre (137-P) → bolsa. ¿Mora del bosque (257) también por bandeja? Mientras tanto la app ya usa la unidad buena al leer facturas y al apuntar precios.

## Revisado el 11/11/2026 (para cuando se empiece de verdad)
- 🔴 **Unidades de TODOS los productos**: en la base todos los productos activos salen «kg». El libro de ventas (Golden, tabla `golden_lineas`) no guarda la unidad, así que Claude ha hecho una propuesta por nombre, precio y cantidad (cajas, bandejas, bolsas, piezas, manojos, docenas). **Fernando la confirma** y entonces se cambia en la base (enseñando el SQL) y en `UNIDAD_LIBRO`.
- 🔴 **«Lo de siempre» de cada cliente**: ahora sale de los pedidos de la app (30 últimos) y de los pedidos fijos. Con el «Contador a cero» los pedidos de prueba se borran y la memoria se queda solo con los fijos. **Propuesta**: que aprenda también del historial de Golden (2.257 facturas, 32.067 líneas) para que desde el primer día proponga lo que suele pedir cada cliente.
- 🟢 **Trazabilidad**: hecha y lista (lote más antiguo, reparto, confirmar todo). Aún sin usar (0 asignaciones): empieza a funcionar sola en cuanto se registren compras con lotes.

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

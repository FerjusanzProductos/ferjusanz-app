# Guías para Carmen (oficina)
Guías cortas con fotos para el trabajo de oficina desde enero de 2027. Hechas por Claude el 18/11/2026 con la **app naranja de PRUEBAS** (usuario de oficina, datos de prueba; los nombres, NIF, direcciones y teléfonos de las fotos están tapados).

| Guía | Archivo |
|---|---|
| Apuntar un pedido por teléfono | `1-pedidos-por-telefono.md` |
| Hacer una factura | `2-facturar.md` |
| Caja (efectivo) | `3-caja.md` |
| Banco | `4-banco.md` |
| Facturas de proveedores | `5-proveedores.md` |
| Informes para Jorge | `6-informes-jorge.md` |
| Guion de llamadas comerciales | `7-guion-llamadas.md` |

- Fotos en `fotos/` (lo que hay que pulsar va en un recuadro rojo).
- Página para el móvil: https://claude.ai/artifact/PAhgeMH8eQYdB3HBkxwxvc. Para cambiarla: `node scripts/guias-carmen-html.mjs` (crea `docs/guias-carmen.html` desde estos textos) y publicarla con el Artifact en esa misma URL, con la carpeta `fotos/` como `guias-carmen/fotos/…`.
- Formato de los textos: `# título`, una línea de explicación, pasos `N. texto [foto: nombre]`, notas `> …` y, en el guion, listas `- …`.
- Si cambia la app: volver a sacar las fotos entrando en la naranja (`scripts/claude-entra.mjs` + Playwright) y regenerar.

# Método LTV · skill de Claude Code

«Le di un presupuesto barato al cliente y lleva todo el año pidiéndome cambios.»

Le pasas a Claude la propuesta que aceptó tu cliente y esta skill:

1. **Te pregunta lo justo**: 12 preguntas, cada una con su recomendación. Contestas «todo como recomiendas» y listo.
2. **Aplica el método LTV**: lo que te deja ese cliente al año, tu margen real, si tu mantenimiento es rentable y
   cuántos clientes necesitas para 20.000 €/mes recurrentes.
3. **Te da tus precios de cambios** (ajuste, mejora pequeña, mejora mediana, nuevo) y el **pacto de alcance** con tu
   logo, listo para mandar: el cliente sabe qué compró y tú cobras el resto.

Hecha por [Denis Corral · Sell Your AI](https://sellyourai.io).

## Qué necesitas
- [Claude Code](https://claude.com/claude-code)
- Python 3 (solo librería estándar)

## Instalación
```bash
git clone https://github.com/deniscorral3am/ltv-skill.git ~/.claude/skills/ltv
```
Si no usas git: descarga el zip (botón verde «Code» → «Download ZIP») y deja la carpeta en `~/.claude/skills/ltv`.

## Uso
En Claude Code escribe `/ltv` y pega algo como: «Hazme el pacto de alcance de mi cliente Clínica Sonrisa. Te adjunto
mi logo y la propuesta que aceptó: asistente de WhatsApp, 1.900 € de implantación, 14 días, 290 €/mes.»
Todo se guarda en `~/Desktop/LTV/<cliente>/`.

La guía del método, para aplicarlo con o sin Claude: [`GUIA.md`](GUIA.md).

Calculadora sola:
```bash
python3 ~/.claude/skills/ltv/motor/ltv.py --implantacion 1900 --mensualidad 290 --horas-desarrollo 25 --herramientas 25 --tarifa 45
```

# El buscador de clientes en redes

La skill de Claude que convierte tu web en una lista de clientes potenciales con sus propias palabras, y les escribe
el primer mensaje.

| Parte | Qué hace |
|---|---|
| El scraper | Lee tu web, deduce tu cliente ideal y busca perfiles y negocios públicos que encajan (Instagram, LinkedIn, TikTok, YouTube, Reddit, foros, Google Maps y webs) |
| El que monta cada perfil | Problemas, lo que sueña y objeciones de cada uno, con la cita literal y el enlace de dónde lo dijo |
| El que encuentra el email | Solo el contacto que el propio negocio publica, con la URL donde aparece |
| El que lo envía | El primer mensaje con una frase suya, enviado desde tu Gmail solo cuando apruebas ese mensaje |

Todo queda en `~/Buscador-de-clientes/<proyecto>/clientes.csv`, con una lista de «no contactar» que se respeta
siempre.

Hecho por Denís Corral · [@deniscorralvillarraso](https://instagram.com/deniscorralvillarraso) · [Sell Your AI](https://sellyourai.io)

## Cómo usarlo

- **Solo leer:** abre [`DOCUMENTO.md`](DOCUMENTO.md). Al final está el prompt para pegar en Claude.
- **Como skill de Claude Code:**

  ```bash
  git clone https://github.com/deniscorral3am/buscador-de-clientes-skill ~/.claude/skills/buscador-de-clientes
  ```

  Abre Claude Code, escribe `/buscador-de-clientes` y pega tu web.

Opcional: Playwright MCP (navegador), Apify (si ya tienes cuenta) y Gmail (para borradores o envíos aprobados).

## Uso responsable

Solo datos públicos y profesionales, nada de iniciar sesión en redes ni saltarse límites, ningún envío sin tu
aprobación mensaje a mensaje y la baja en cada mensaje. En España la LSSI no permite emails comerciales no pedidos,
también a empresas: lee la sección 6 de `DOCUMENTO.md`. No es asesoramiento jurídico.

## Licencia

MIT

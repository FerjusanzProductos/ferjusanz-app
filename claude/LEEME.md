# Claude en FERJUSANZ — mapa general
_Creado el 11/11/2026. Aquí está ordenado TODO lo que hace Claude en la empresa: una carpeta por área.
Cada carpeta tiene un `LEEME.md` con: **para qué sirve**, **dónde están las cosas** y **qué tareas hace Claude**._

> Los archivos de trabajo NO se han movido de sitio (la app, la base de datos y los documentos de `docs/`
> siguen donde estaban, porque la app y las sesiones de Claude los buscan ahí). Estas carpetas son el
> **índice ordenado** que explica cada cosa y enlaza a ella. Solo se han traído aquí los textos para empezar chats.

## Las áreas

| Carpeta | Para qué sirve | En una frase, qué hace Claude |
|---|---|---|
| [01 · Memoria y reglas](01-memoria-y-reglas/LEEME.md) | Lo que Claude lee al empezar y lo que nunca puede saltarse | Lee las reglas, apunta lo hecho y lo pendiente |
| [02 · App y publicación](02-app-y-publicacion/LEEME.md) | La app del móvil (normal y de pruebas) | Programa cambios, los prueba y los publica con tu permiso |
| [03 · Base de datos](03-base-de-datos/LEEME.md) | Supabase: clientes, pedidos, productos, Golden… | Consulta datos y prepara cambios (siempre enseñando el SQL antes) |
| [04 · IA dentro de la app](04-ia-dentro-de-la-app/LEEME.md) | Harvey, ayuda 🆘, lector de facturas, correo de albaranes | Los construye, ajusta y vigila su coste |
| [05 · Agentes y tareas programadas](05-agentes-y-tareas-programadas/LEEME.md) | Trabajos que Claude hace solo, a una hora fija | Seguimiento diario (pausado) y los 8 agentes pedidos |
| [06 · Herramientas de Claude Code](06-herramientas-de-claude-code/LEEME.md) | Plugins, skills y conectores que usa Claude | Elige la herramienta adecuada e instala las nuevas que veas en redes |
| [07 · Copias y seguridad](07-copias-y-seguridad/LEEME.md) | GitLab, GitHub, copias nocturnas, claves | Guarda todo, copia a GitHub y cuida que no se pierda nada |
| [08 · Textos para empezar chats](08-textos-para-empezar-chats/LEEME.md) | Lo que se pega en un chat nuevo de Claude | Mantiene al día los textos tuyos y del equipo |
| [09 · Web y empresa](09-web-y-empresa/LEEME.md) | Web de la empresa, contabilidad (Jorge), proveedores externos | Prepara planes, preguntas y documentos |

## Las 5 reglas que valen para todas las áreas
1. **Una tarea por conversación.**
2. Primero en la **app de PRUEBAS** (naranja); a la normal solo con «**Autorizo publicar**».
3. Nada de **borrar datos, cambiar precios ni tocar facturas, cobros o permisos** sin tu confirmación.
4. **Nunca** contraseñas ni claves por el chat (solo el formulario seguro).
5. Al terminar: apuntar en `docs/HISTORIAL.md` y `docs/PENDIENTES.md`, guardar en **GitLab** y copiar a **GitHub**.

## Quién usa Claude
- **Fernando (hijo)**: Claude Code (esta herramienta) para la app, la base de datos y todo lo técnico. Decide y autoriza.
- **Equipo** (Cristian, Carmen, Juli): Claude normal (claude.ai) con el texto de la carpeta 08, para usar la app y escribir mensajes. **No tocan el código.**
- **La app** usa la IA de Claude por dentro (Harvey, ayuda 🆘, lector de facturas): ver carpeta 04.

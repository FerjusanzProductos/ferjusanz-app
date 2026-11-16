---
name: redes-distribuir
description: Distribuidor de Ferjusanz: convierte una pieza (vídeo, foto o artículo) en las versiones para cada red (Instagram, Facebook, TikTok, YouTube Shorts, LinkedIn y ficha de Google) y deja todo listo para programar desde el móvil. Úsala cuando Fernando escriba «súbelo a todas las redes», «repártelo», «prepáralo para publicar» o /redes-distribuir.
---

Eres el distribuidor de FERJUSANZ. Una pieza → todas las redes, sin trabajo extra para Fernando.

1. Para la pieza que mande Fernando (o la que toque en `docs/redes/CONTENIDO.md`):
   - **Vídeo**: con la skill `shorts`, sácalo vertical 9:16 con subtítulos (y, si es largo, en cortes de 15-40 s). Un mismo archivo vale para Reels, TikTok y Shorts.
   - **Foto**: versión 4:5 para Instagram/Facebook y 1:1 para la ficha de Google (recorte con Python/Pillow o ffmpeg).
   - **Artículo de la web**: una foto o carrusel que lleve al enlace.
2. Textos de cada red con la skill `redes-textos`.
3. Entrega una tabla corta: red · día y hora recomendados (calendario del punto 6 de `docs/PLAN_MARKETING.md`; hostelería y colectividades miran redes por la mañana temprano y a media tarde) · archivo · texto. Manda los archivos con SendUserFile.
4. Explica cómo programarlo en el Samsung: app **Meta Business Suite** (Instagram + Facebook a la vez) → «+» → «Reel» o «Publicación» → elegir el archivo → pegar el texto → «Programar». TikTok y YouTube, desde sus apps con «+».

**Publicar de verdad, solo con el «sí» expreso de Fernando para esa publicación** (es hablar en nombre de la empresa). Aunque haya una herramienta conectada que publique en TikTok (Higgsfield `tiktok_*`), no la uses sin ese «sí». Metricool (para que Claude programe Instagram y Facebook) está pendiente de que Fernando lo decida (punto 5 del plan). Apunta lo programado en `docs/redes/CONTENIDO.md`.

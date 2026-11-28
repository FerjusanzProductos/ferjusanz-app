# broll

**Qué hace:** mete clips o imágenes en los segundos que digas **sin tapar nunca la cara**.

```bash
python3 broll.py vertical.mp4 --inserto captura.png@3.2-6.0 --inserto pantalla.mp4@10-13:completo --salida con_broll.mp4
```

**Modos:** `dividida` (por defecto: b-roll arriba en la caja 0,250,1080×700 y la persona abajo, recorte de 1080×960 centrado en su cara) · `completo` (pantalla entera; si detecta cara pasa a dividida salvo `--forzar`).

**Honesto:** la cara se busca con el detector Haar de OpenCV en varias escalas (bien de frente, peor de perfil, con gorra calada o en primerísimo plano). Que no detecte cara no garantiza que no la haya: usa `completo` solo donde sepas que no sale nadie. Puedes pasar la cara con `--cara`.

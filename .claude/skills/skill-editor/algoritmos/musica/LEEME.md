# musica

**Qué hace:** mezcla la voz con una canción como un editor: debajo, apartándose cuando hablas, con fundidos y a −14 LUFS.

```bash
python3 mezclar.py montado.mp4 cancion.mp3 --desde 12 --bajo 18.5 --salida final.mp4
```

**Números:** música 18,5 LU por debajo de la voz (medido con EBU R128) · ducking `sidechaincompress` (umbral 0,03, ratio 2,5, ataque 20 ms, suelta 400 ms) · fundidos 0,4 s / 1,5 s · si la canción es más corta, bucle con fundido cruzado de 2 s · final a −14 LUFS con limitador a 0,8.

**Honesto:** la música la eliges tú (o la propone Claude). Usa música con licencia para redes; la «música en tendencia» de Instagram solo se puede poner desde la propia app.

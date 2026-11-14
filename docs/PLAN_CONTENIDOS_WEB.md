# Plan de contenidos del blog de la web (13/11/2026)

Para la web nueva (`web/`, Worker `ferjusanz-web`). Los artículos se añaden en `web/paginas.json` (`isPost: true`).

## Cómo está el blog hoy
- 45 artículos copiados de la web de Creativate. **El último es de junio de 2025**: lleva más de un año parado.
- Casi todos son para el **consumidor de casa** (salud, recetas, temporada). Hay temas repetidos (3 de temporada de otoño, 2 de frutas tropicales, 2 de tipos de patatas).
- **Falta lo que busca nuestro cliente** (bares, restaurantes, cafeterías, comedores, residencias, fruterías): cómo comprar, cuánto pedir, cómo aguantar el género, Mercamadrid, huevos.

## La idea
1. **Escribir para el que compra para un negocio**, no para casa. Es quien nos llama.
2. Cada artículo termina en **«Pídenos presupuesto»** (llamar / WhatsApp / formulario).
3. Hablar de **Madrid y Mercamadrid**: es lo que nos distingue en Google («proveedor de fruta para restaurantes Madrid»).
4. **2 artículos al mes**. Mejor pocos y buenos.

## Temas propuestos (por orden de interés)

### Primero: los que salen de lo que cuenta Fernando (14/11/2026, ver `web/LO_QUE_CUENTA_FERNANDO.md`)
- **Cómo cuadrar el postre del menú del día con la fruta más barata de la semana** (error típico: no preguntar qué está mejor de precio y no adaptar el postre).
- **Una patata que valga para todo, y cuándo compensa la patata pelada.** (Sustituye al tema 6.)
- **Fruta para colegios y residencias: por qué en calibres pequeños** (manzana golden, pera conferencia) **y verdura para cremas y purés.** (Junta los temas 10 y 11.)
- **Cómo elige un mayorista la fruta en Mercamadrid: la calidad manda.** (Va con el tema 12.)

### A. Para hostelería (lo más rentable)
1. **Cómo elegir proveedor de fruta y verdura para tu restaurante en Madrid** (qué preguntar: horario de reparto, pedido mínimo, cambio de género que llega mal). → enlaza a Distribución.
2. **Cuánta merma tiene cada verdura y cómo calcular el coste real del plato** (patata, cebolla, lechuga, alcachofa…). Muy buscado por cocineros.
3. **Cómo conservar la fruta y la verdura en la cámara del bar**: temperatura y qué no juntar (plátano, tomate, aguacate fuera del frío; manzana lejos del resto).
4. **El aguacate en hostelería: cómo pedirlo para que esté en su punto el día que lo usas**.
5. **Limón y lima para bares y coctelería**: calibres, zumo, cuánto aguanta.
6. **Qué patata usar para cada plato** (freír, tortilla, cocer, puré) — versión para cocina profesional del artículo de patatas.
7. **Huevos para hostelería: categorías, tamaños (S‑M‑L‑XL) y qué significa el código impreso**. No hay ningún artículo de huevos y los vendemos.
8. **Cuarta gama: cuándo compensa al restaurante comprar la verdura ya cortada**.

### B. Para colectividades (colegios, residencias, empresas)
9. **Fruta en el comedor escolar: qué pide la norma de comedores saludables** (⚠️ comprobar el texto oficial antes de escribir).
10. **Menús de residencias: fruta y verdura fácil de comer para mayores** (texturas, temporada).
11. **Cómo planificar la compra semanal de un comedor** (fruta de temporada, precio estable).

### C. Mercamadrid y la empresa (confianza)
12. **Un día en Mercamadrid: cómo llega la fruta de la huerta a tu cocina** (con nuestras fotos del puesto).
13. **Quiénes somos: Ferjusanz, mayorista en Mercamadrid** (historia, equipo; Fernando cuenta y Claude redacta).
14. **Desperdicio de alimentos: qué cambia para bares y comedores** (⚠️ comprobar la ley en vigor y sus obligaciones antes de escribir).

### D. Temporada (con calendario, se reutiliza cada año)
15. **Calendario de fruta y verdura de temporada mes a mes** (una página fija, la más útil; sustituye a los artículos repetidos).
16. Uno corto **cada mes**: «Qué está bueno en diciembre», «…en enero»… con lo que de verdad entra en el puesto ese mes.

## Calendario (orden de los temas; ahora sale uno cada 2 días)
| Mes | Artículos |
|---|---|
| Diciembre 2026 | 15 Calendario de temporada · 7 Huevos |
| Enero 2027 | 1 Elegir proveedor · 16 Qué está bueno en enero |
| Febrero 2027 | 2 Merma y coste del plato · 12 Un día en Mercamadrid |
| Marzo 2027 | 9 Comedor escolar · 3 Conservar en la cámara |
| Abril 2027 | 4 Aguacate · 6 Patata para cada plato |
| Mayo 2027 | 10 Residencias · 5 Limón y lima |
| Junio 2027 | 8 Cuarta gama · 14 Desperdicio |

## Reglas para escribirlos
- Los escribe Claude. **Cambio del 13/11/2026 (Fernando: «un artículo cada 2 o 3 días… ni me preguntes»)**: los publica sola la tarea automática cada 2 días (`web/TAREA_AUTOMATICA.md`), sin esperar al «vale», siguiendo esta lista en orden y luego los de temporada. Los marcados con ⚠️ solo se escriben tras comprobar la fuente oficial (y se enlaza). Fernando puede pedir quitar o cambiar cualquiera.
- **Fotos propias** del puesto siempre que se pueda.
- **Sin precios** (cambian cada día) y sin prometer nada que no hagamos (horarios, zonas de reparto: confirmarlo con Fernando).
- Nada de «cura» o «previene enfermedades»: salud, solo lo comprobado y con la fuente.
- Leyes y normas: comprobarlas en la fuente oficial (BOE) antes de escribir, y poner la fecha.
- No cambiar la dirección (URL) de los artículos viejos: Google ya los conoce.

## Arreglar lo que hay (una vez)
- ✔️ 14/11: artículos repetidos de temporada (otoño, invierno, verano) redirigidos al calendario mes a mes, y el de tropicales repetido al otro (`web/redirecciones.json`). Pendiente: los 2 de tipos de patatas, cuando se escriba el tema «patata para todo».
- ✔️ Botón «Pídenos precio» al final de todos los artículos (ya estaba).

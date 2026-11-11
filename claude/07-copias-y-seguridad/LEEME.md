# 07 · Copias y seguridad

## Para qué sirve
Que no se pierda nada (código ni datos) y que nadie entre donde no debe.

## Dónde está
| Qué | Dónde | Estado |
|---|---|---|
| Código (maestro) | **GitLab** `ferjusanz-productos/ferjusanz-app`, rama `main` | ✅ |
| Copia del código | **GitHub** `FerjusanzProductos/ferjusanz-app`, rama `main` | ✅ Claude la copia a mano tras cada cambio |
| Copia de la base de datos | GitLab cada noche, 90 días (`.gitlab-ci.yml`, `scripts/copia-supabase.sh`) | 🟡 comprobar que se ejecuta y que se puede restaurar |
| Fotos, PDF y audios (Storage) | **Sin copia** | 🔴 pendiente |
| Claves | Secretos de Supabase, variables de GitLab y entorno de Claude | Nunca en el código ni en los documentos |
| Permisos en la app | Roles: admin, oficina, secretaria, comercial, compras, preparador, repartidor, dirección | Cambiarlos solo con tu confirmación |

## Tareas que hace Claude aquí
- Guardar cada cambio en GitLab y copiarlo a GitHub. Nunca dejar trabajo sin guardar.
- Restaurar una copia si hiciera falta (instrucciones en `LEEME.md` de la raíz).
- Auditorías de seguridad de la app y de Supabase (skill `security-audit`).
- Pendientes: copia de Storage, activar la copia automática GitLab → GitHub, borrar ramas y el Worker viejo `ferjusanz` (con tu permiso).

-- 14/11/2026 (Fernando: «todo lo que encuentres de NIF, ponlo»).
-- Solo rellena el NIF si está vacío. 3 salen de otra ficha del mismo cliente (misma razón social) y coinciden
-- con internet (EXISTE, MESONCAN, INFORMATICA); 6 son propuestas de confianza alta de la auditoría. Letra de control comprobada.
with v(codigo, nif) as (values
  ('EXISTE','B87381703'), ('MESONCAN','A40004616'), ('INFORMATICA','B56879372'),
  ('C.REGGIO','B87799029'), ('CANDELA','B64580798'), ('CARAMBOLA','B70803440'),
  ('LALI','B40280422'), ('PARADA','B88580329'), ('PIO','B06803043')),
u as (update public.clientes c set nif = v.nif, updated_at = now() from v
      where c.codigo = v.codigo and nullif(trim(c.nif),'') is null returning c.id, c.nif)
update public.cliente_propuestas p set estado = 'aceptado', revisado_at = now()
from u where p.cliente_id = u.id and p.campo = 'nif' and p.valor = u.nif and p.estado = 'pendiente';

-- NIF de 28 clientes que son empresas, buscados en infoempresa.com (12/11/2026) y comprobados (letra/dígito de control).
-- Aprobado por Fernando: «Guarda los 28 (a y b)». Solo rellena fichas con el NIF vacío; no toca nada más.
update public.clientes c set nif = v.nif
from (values
  ('CATENA','B13986476'),('E.REGGIO','B85842672'),('VODAFONE','B02749661'),('PALOMA','B21966619'),('TERTULIA','B75403196'),
  ('TENIS','B75614008'),('ENCANTO','B75345876'),('CHICO','B01855394'),('LEON','B22728018'),('CARPANES','B42900316'),
  ('VUVUZELA','B75820548'),('SANABRIA','B19860253'),('BABILONIA','B85150175'),('PICARO','B82987108'),('LEROY','B86434669'),
  ('LAVANDERA','B75298034'),
  ('CARDENAL','A81230575'),('LORETO','A81230575'),('REGGIO','B19969161'),('CHIPIRON','B56737950'),('NIL','B70966767'),
  ('DEFINITIVA','B44832004'),('SIEMPRE','B87246815'),('MENCIA','B86314861'),('ROMAN','B80846116'),('GALLE','B55461248'),
  ('CAFETIN','B81491888'),('ANUJA','A17371758')
) as v(codigo, nif)
where c.codigo = v.codigo and coalesce(trim(c.nif), '') = ''
returning c.codigo, c.nif;

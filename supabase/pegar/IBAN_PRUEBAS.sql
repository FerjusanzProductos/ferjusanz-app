-- SOLO PARA LA BASE DE PRUEBAS (ferjusanz-pruebas, pbeuxbwbpmlanbhhnpgy). «Autorizo» de Fernando, 13/11/2026.
-- Casilla IBAN en «Datos de la empresa», versión SIF 0.2.1 y el IBAN de FERJUSANZ ya puesto.
alter table public.empresa add column if not exists iban text;
alter table public.empresa drop constraint if exists empresa_iban_formato;
alter table public.empresa add constraint empresa_iban_formato check (iban is null or iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$');
update public.sif_config set version_sif = 'SIF 0.2.1 (sin declaración)' where id;
update public.empresa set iban = 'ES6321002441880200164501';
select iban, (select version_sif from public.sif_config limit 1) as version from public.empresa;

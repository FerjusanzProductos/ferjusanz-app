-- Vídeo de la presentación con la voz de Fernando (16/11/2026: «quiero la presentación en vídeo. Le quiero dar yo el audio»).
-- La app graba las hojas + su voz y lo guarda aquí: «hosteleria.mp4|webm» y «colectivos.mp4|webm». Carpeta privada, solo oficina y admin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('presentacion-video', 'presentacion-video', false, 52428800, array['video/mp4', 'video/webm'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists presentacion_video_oficina on storage.objects;
create policy presentacion_video_oficina on storage.objects for all to authenticated
  using (bucket_id = 'presentacion-video' and public.rol_actual() = any (array['oficina', 'admin']))
  with check (bucket_id = 'presentacion-video' and public.rol_actual() = any (array['oficina', 'admin']));

-- Ajusta as políticas de Storage para usar o bucket existente "maquinarios"
-- (para quem já rodou 013 quando o nome era maquinarios-imagens)

DROP POLICY IF EXISTS "maquinarios_imagens_public_read" ON storage.objects;
DROP POLICY IF EXISTS "maquinarios_imagens_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "maquinarios_imagens_anon_update" ON storage.objects;
DROP POLICY IF EXISTS "maquinarios_imagens_anon_delete" ON storage.objects;

CREATE POLICY "maquinarios_imagens_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));

CREATE POLICY "maquinarios_imagens_anon_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));

CREATE POLICY "maquinarios_imagens_anon_update"
ON storage.objects FOR UPDATE
USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));

CREATE POLICY "maquinarios_imagens_anon_delete"
ON storage.objects FOR DELETE
USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));

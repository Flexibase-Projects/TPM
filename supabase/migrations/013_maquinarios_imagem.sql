-- Migração: Coluna imagem_url em TPM_maquinarios e bucket Storage para imagens
-- A URL da imagem no Storage será armazenada em imagem_url após o upload.

-- 1. Coluna na tabela de maquinários
ALTER TABLE "TPM_maquinarios"
ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- 2. Bucket: usar o bucket existente "maquinarios" (criado no Dashboard).
--    Ver: supabase/migrations/LEIA-ME_013_bucket_maquinarios_imagens.md

-- 3. Políticas de Storage: leitura pública e upload/update/delete para anon (alinhado ao uso atual do app)
-- Leitura pública (exibir na listagem e no formulário)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'maquinarios_imagens_public_read') THEN
    CREATE POLICY "maquinarios_imagens_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'maquinarios_imagens_anon_insert') THEN
    CREATE POLICY "maquinarios_imagens_anon_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'maquinarios_imagens_anon_update') THEN
    CREATE POLICY "maquinarios_imagens_anon_update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'maquinarios_imagens_anon_delete') THEN
    CREATE POLICY "maquinarios_imagens_anon_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = (SELECT id FROM storage.buckets WHERE name = 'maquinarios' LIMIT 1));
  END IF;
END $$;

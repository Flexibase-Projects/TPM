-- Permite que qualquer um (incluindo anon) leia e faça upload no bucket "maquinarios".
-- A subquery (SELECT id FROM storage.buckets ...) falha para anon porque anon não lê storage.buckets.
-- Usamos uma função SECURITY DEFINER que retorna o bucket id; as políticas passam a funcionar para anon.

-- Função que retorna o id do bucket "maquinarios" (roda com privilégios do dono).
-- Retorna TEXT pois em muitos projetos storage.buckets.id é text (ex: id = 'maquinarios').
CREATE OR REPLACE FUNCTION public.get_maquinarios_bucket_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM storage.buckets WHERE lower(trim(name)) = 'maquinarios' LIMIT 1;
$$;

-- Anon precisa poder executar a função para a política ser avaliada
GRANT EXECUTE ON FUNCTION public.get_maquinarios_bucket_id() TO anon;
GRANT EXECUTE ON FUNCTION public.get_maquinarios_bucket_id() TO authenticated;

-- Remover políticas antigas para recriar com a função e TO public
DROP POLICY IF EXISTS "maquinarios_imagens_public_read" ON storage.objects;
DROP POLICY IF EXISTS "maquinarios_imagens_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "maquinarios_imagens_anon_update" ON storage.objects;
DROP POLICY IF EXISTS "maquinarios_imagens_anon_delete" ON storage.objects;

-- Políticas para public (inclui anon); bucket_id e função retornam text
CREATE POLICY "maquinarios_imagens_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = public.get_maquinarios_bucket_id());

CREATE POLICY "maquinarios_imagens_anon_insert"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = public.get_maquinarios_bucket_id());

CREATE POLICY "maquinarios_imagens_anon_update"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = public.get_maquinarios_bucket_id());

CREATE POLICY "maquinarios_imagens_anon_delete"
ON storage.objects FOR DELETE TO public
USING (bucket_id = public.get_maquinarios_bucket_id());

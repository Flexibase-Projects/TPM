-- Permissões de leitura (SELECT) para a lista de Maquinários
-- Se RLS estiver ativo nessas tabelas, estas políticas permitem anon e authenticated ler.
-- Execute no SQL Editor do Supabase se a lista de Maquinários retornar vazia sem erro.
-- Este script NÃO altera nenhum dado: apenas cria/recria políticas (metadata). Ordem e conteúdo das tabelas permanecem iguais.

-- TPM_maquinarios: leitura para listagem e detalhes
DROP POLICY IF EXISTS "Allow read TPM_maquinarios" ON "TPM_maquinarios";
CREATE POLICY "Allow read TPM_maquinarios"
ON "TPM_maquinarios" FOR SELECT
TO anon, authenticated
USING (true);

-- TPM_areas: usada no join do getMaquinarios()
DROP POLICY IF EXISTS "Allow read TPM_areas" ON "TPM_areas";
CREATE POLICY "Allow read TPM_areas"
ON "TPM_areas" FOR SELECT
TO anon, authenticated
USING (true);

-- TPM_motivos_parada: usada no join do getMaquinarios()
DROP POLICY IF EXISTS "Allow read TPM_motivos_parada" ON "TPM_motivos_parada";
CREATE POLICY "Allow read TPM_motivos_parada"
ON "TPM_motivos_parada" FOR SELECT
TO anon, authenticated
USING (true);

-- TPM_checklist_itens: usada no join do getMaquinarios()
DROP POLICY IF EXISTS "Allow read TPM_checklist_itens" ON "TPM_checklist_itens";
CREATE POLICY "Allow read TPM_checklist_itens"
ON "TPM_checklist_itens" FOR SELECT
TO anon, authenticated
USING (true);

-- TPM_ocorrencias_manutencao: usada no cálculo de status (getOcorrenciasAbertasByMaquinario)
DROP POLICY IF EXISTS "Allow read TPM_ocorrencias_manutencao" ON "TPM_ocorrencias_manutencao";
CREATE POLICY "Allow read TPM_ocorrencias_manutencao"
ON "TPM_ocorrencias_manutencao" FOR SELECT
TO anon, authenticated
USING (true);

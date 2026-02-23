-- RLS completo para TPM_ocorrencias_manutencao: SELECT + INSERT + UPDATE em um único script.
-- IMPORTANTE: Rodar no mesmo projeto Supabase cuja URL está em VITE_SUPABASE_URL no .env do app.
-- Se rodar em outro projeto, o app continuará com erro 42501. Após executar, testar o formulário
-- de ocorrência (incluindo a descrição); o erro deve cessar e a descrição ser gravada na coluna descricao.

-- 1. Habilitar RLS na tabela (idempotente)
ALTER TABLE "TPM_ocorrencias_manutencao" ENABLE ROW LEVEL SECURITY;

-- 2. Política de leitura (SELECT) – necessária para o .insert().select() retornar a linha
DROP POLICY IF EXISTS "Allow read TPM_ocorrencias_manutencao" ON "TPM_ocorrencias_manutencao";
CREATE POLICY "Allow read TPM_ocorrencias_manutencao"
ON "TPM_ocorrencias_manutencao" FOR SELECT
TO anon, authenticated
USING (true);

-- 3. Políticas de escrita: INSERT e UPDATE
DROP POLICY IF EXISTS "Allow insert TPM_ocorrencias_manutencao" ON "TPM_ocorrencias_manutencao";
CREATE POLICY "Allow insert TPM_ocorrencias_manutencao"
ON "TPM_ocorrencias_manutencao" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_ocorrencias_manutencao" ON "TPM_ocorrencias_manutencao";
CREATE POLICY "Allow update TPM_ocorrencias_manutencao"
ON "TPM_ocorrencias_manutencao" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

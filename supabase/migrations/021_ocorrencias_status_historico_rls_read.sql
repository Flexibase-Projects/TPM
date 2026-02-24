-- Política de leitura (SELECT) para histórico de status de ocorrências
-- Se RLS estiver ativo nesta tabela, esta política permite anon e authenticated ler.
-- Usado em ocorrenciaService (calcularTempos, histórico, etc.) e nas telas Minhas OM's e Visualizar OM.

DROP POLICY IF EXISTS "Allow read TPM_ocorrencias_status_historico" ON "TPM_ocorrencias_status_historico";
CREATE POLICY "Allow read TPM_ocorrencias_status_historico"
ON "TPM_ocorrencias_status_historico" FOR SELECT
TO anon, authenticated
USING (true);

-- Políticas de leitura (SELECT) para Paradas e Tempo Disponível Diário
-- Se RLS estiver ativo nessas tabelas, estas políticas permitem anon e authenticated ler.
-- Usado em getAllParadas(), paradaService e dashboardService.

-- TPM_paradas: leitura para listagem e detalhes na tela Paradas
DROP POLICY IF EXISTS "Allow read TPM_paradas" ON "TPM_paradas";
CREATE POLICY "Allow read TPM_paradas"
ON "TPM_paradas" FOR SELECT
TO anon, authenticated
USING (true);

-- TPM_tempo_disponivel_diario: usada em paradaService e dashboardService
DROP POLICY IF EXISTS "Allow read TPM_tempo_disponivel_diario" ON "TPM_tempo_disponivel_diario";
CREATE POLICY "Allow read TPM_tempo_disponivel_diario"
ON "TPM_tempo_disponivel_diario" FOR SELECT
TO anon, authenticated
USING (true);

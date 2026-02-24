-- Permissões de escrita (INSERT, UPDATE, DELETE) para Paradas e Tempo Disponível Diário.
-- Necessário quando RLS está ativo: a migration 020 só cria SELECT; sem estas políticas
-- o cadastro de parada em Maquinários falha (insert em TPM_paradas e getOrCreate/update em TPM_tempo_disponivel_diario).

-- TPM_paradas: permitir criar, atualizar e excluir (tela Paradas e Registrar parada em Maquinários)
DROP POLICY IF EXISTS "Allow insert TPM_paradas" ON "TPM_paradas";
CREATE POLICY "Allow insert TPM_paradas"
ON "TPM_paradas" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_paradas" ON "TPM_paradas";
CREATE POLICY "Allow update TPM_paradas"
ON "TPM_paradas" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete TPM_paradas" ON "TPM_paradas";
CREATE POLICY "Allow delete TPM_paradas"
ON "TPM_paradas" FOR DELETE
TO anon, authenticated
USING (true);

-- TPM_tempo_disponivel_diario: getOrCreateTempoDisponivel (INSERT) e deduzirTempoDisponivel (UPDATE)
DROP POLICY IF EXISTS "Allow insert TPM_tempo_disponivel_diario" ON "TPM_tempo_disponivel_diario";
CREATE POLICY "Allow insert TPM_tempo_disponivel_diario"
ON "TPM_tempo_disponivel_diario" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_tempo_disponivel_diario" ON "TPM_tempo_disponivel_diario";
CREATE POLICY "Allow update TPM_tempo_disponivel_diario"
ON "TPM_tempo_disponivel_diario" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

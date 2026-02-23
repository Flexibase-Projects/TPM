-- Permissões de escrita (INSERT, UPDATE, DELETE) para criar/editar maquinários e persistir imagem_url.
-- Necessário quando RLS está ativo: a migration 012 só cria SELECT; sem estas políticas o UPDATE não persiste e imagem_url fica null.

-- TPM_maquinarios: permitir criar e atualizar (incluindo imagem_url)
DROP POLICY IF EXISTS "Allow insert TPM_maquinarios" ON "TPM_maquinarios";
CREATE POLICY "Allow insert TPM_maquinarios"
ON "TPM_maquinarios" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_maquinarios" ON "TPM_maquinarios";
CREATE POLICY "Allow update TPM_maquinarios"
ON "TPM_maquinarios" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete TPM_maquinarios" ON "TPM_maquinarios";
CREATE POLICY "Allow delete TPM_maquinarios"
ON "TPM_maquinarios" FOR DELETE
TO anon, authenticated
USING (true);

-- TPM_motivos_parada: updateMaquinario faz DELETE e INSERT
DROP POLICY IF EXISTS "Allow insert TPM_motivos_parada" ON "TPM_motivos_parada";
CREATE POLICY "Allow insert TPM_motivos_parada"
ON "TPM_motivos_parada" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_motivos_parada" ON "TPM_motivos_parada";
CREATE POLICY "Allow update TPM_motivos_parada"
ON "TPM_motivos_parada" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete TPM_motivos_parada" ON "TPM_motivos_parada";
CREATE POLICY "Allow delete TPM_motivos_parada"
ON "TPM_motivos_parada" FOR DELETE
TO anon, authenticated
USING (true);

-- TPM_checklist_itens: updateMaquinario faz DELETE e INSERT
DROP POLICY IF EXISTS "Allow insert TPM_checklist_itens" ON "TPM_checklist_itens";
CREATE POLICY "Allow insert TPM_checklist_itens"
ON "TPM_checklist_itens" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_checklist_itens" ON "TPM_checklist_itens";
CREATE POLICY "Allow update TPM_checklist_itens"
ON "TPM_checklist_itens" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete TPM_checklist_itens" ON "TPM_checklist_itens";
CREATE POLICY "Allow delete TPM_checklist_itens"
ON "TPM_checklist_itens" FOR DELETE
TO anon, authenticated
USING (true);

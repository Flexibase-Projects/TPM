-- Permissões de escrita (INSERT, UPDATE) para criar e editar Ocorrências de Manutenção (Abrir OM / Editar OM).
-- Sem estas políticas, "Abrir OM" tipo corretiva falha com erro ao salvar (RLS bloqueia o INSERT).

-- TPM_ocorrencias_manutencao: permitir criar (Abrir OM) e atualizar (Editar OM, transição de status)
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

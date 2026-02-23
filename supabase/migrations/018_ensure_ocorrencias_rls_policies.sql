-- Garantir RLS + políticas de INSERT/UPDATE em TPM_ocorrencias_manutencao.
-- Rodar este SQL no mesmo projeto Supabase cuja URL está em VITE_SUPABASE_URL no .env do app.
-- Após executar, testar de novo o formulário de ocorrência (incluindo a descrição);
-- o erro 42501 deve cessar e a descrição deve ser gravada na coluna descricao da tabela TPM_ocorrencias_manutencao.

-- Habilitar RLS na tabela (idempotente: se já estiver ativo, não quebra)
ALTER TABLE "TPM_ocorrencias_manutencao" ENABLE ROW LEVEL SECURITY;

-- Políticas de escrita: permitir criar (Abrir OM) e atualizar (Editar OM, transição de status)
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

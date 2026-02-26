-- Migração: Tabela de materiais por maquinário (custos/peças de referência)
-- Todas as tabelas têm o prefixo TPM_

CREATE TABLE IF NOT EXISTS "TPM_materiais_maquinario" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinario_id UUID NOT NULL REFERENCES "TPM_maquinarios"(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  marca VARCHAR(255),
  valor_unitario DECIMAL(12, 2) NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unidade VARCHAR(20),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_materiais_maquinario_id ON "TPM_materiais_maquinario"(maquinario_id);

-- Trigger: remover se já existir (PostgreSQL armazena o nome em minúsculas)
DROP TRIGGER IF EXISTS update_tpm_materiais_maquinario_updated_at ON "TPM_materiais_maquinario";
CREATE TRIGGER update_tpm_materiais_maquinario_updated_at
  BEFORE UPDATE ON "TPM_materiais_maquinario"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE "TPM_materiais_maquinario" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read TPM_materiais_maquinario" ON "TPM_materiais_maquinario";
CREATE POLICY "Allow read TPM_materiais_maquinario"
ON "TPM_materiais_maquinario" FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert TPM_materiais_maquinario" ON "TPM_materiais_maquinario";
CREATE POLICY "Allow insert TPM_materiais_maquinario"
ON "TPM_materiais_maquinario" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_materiais_maquinario" ON "TPM_materiais_maquinario";
CREATE POLICY "Allow update TPM_materiais_maquinario"
ON "TPM_materiais_maquinario" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete TPM_materiais_maquinario" ON "TPM_materiais_maquinario";
CREATE POLICY "Allow delete TPM_materiais_maquinario"
ON "TPM_materiais_maquinario" FOR DELETE
TO anon, authenticated
USING (true);

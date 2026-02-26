-- Migração: Tabela de itens de material por ocorrência de manutenção (custos/peças)
-- Todas as tabelas têm o prefixo TPM_

CREATE TABLE IF NOT EXISTS "TPM_itens_material_ocorrencia" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id UUID NOT NULL REFERENCES "TPM_ocorrencias_manutencao"(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  marca VARCHAR(255),
  valor_unitario DECIMAL(12, 2) NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unidade VARCHAR(20),
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_itens_material_ocorrencia_id ON "TPM_itens_material_ocorrencia"(ocorrencia_id);

CREATE TRIGGER update_TPM_itens_material_ocorrencia_updated_at
  BEFORE UPDATE ON "TPM_itens_material_ocorrencia"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: permitir leitura e escrita (para futuro cadastro de itens pela aplicação)
ALTER TABLE "TPM_itens_material_ocorrencia" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read TPM_itens_material_ocorrencia" ON "TPM_itens_material_ocorrencia";
CREATE POLICY "Allow read TPM_itens_material_ocorrencia"
ON "TPM_itens_material_ocorrencia" FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert TPM_itens_material_ocorrencia" ON "TPM_itens_material_ocorrencia";
CREATE POLICY "Allow insert TPM_itens_material_ocorrencia"
ON "TPM_itens_material_ocorrencia" FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update TPM_itens_material_ocorrencia" ON "TPM_itens_material_ocorrencia";
CREATE POLICY "Allow update TPM_itens_material_ocorrencia"
ON "TPM_itens_material_ocorrencia" FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete TPM_itens_material_ocorrencia" ON "TPM_itens_material_ocorrencia";
CREATE POLICY "Allow delete TPM_itens_material_ocorrencia"
ON "TPM_itens_material_ocorrencia" FOR DELETE
TO anon, authenticated
USING (true);

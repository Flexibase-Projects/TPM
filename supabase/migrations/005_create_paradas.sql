-- Migração: Criação das tabelas para Paradas e Tempo Disponível Diário
-- Todas as tabelas têm o prefixo TPM_

-- Tabela de Tempo Disponível Diário
CREATE TABLE IF NOT EXISTS "TPM_tempo_disponivel_diario" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinario_id UUID NOT NULL REFERENCES "TPM_maquinarios"(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horas_disponiveis DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(maquinario_id, data)
);

-- Tabela de Paradas
CREATE TABLE IF NOT EXISTS "TPM_paradas" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinario_id UUID NOT NULL REFERENCES "TPM_maquinarios"(id) ON DELETE CASCADE,
  ocorrencia_id UUID,
  data_parada DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  horas_paradas DECIMAL(10, 2) NOT NULL,
  motivo_parada_id UUID REFERENCES "TPM_motivos_parada"(id) ON DELETE SET NULL,
  observacoes TEXT,
  tipo_registro VARCHAR(20) NOT NULL CHECK (tipo_registro IN ('Manual', 'Automatico')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar foreign key para ocorrencia_id apenas se a tabela existir e a constraint não existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'TPM_ocorrencias_manutencao') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_paradas_ocorrencia' 
      AND table_name = 'TPM_paradas'
    ) THEN
      ALTER TABLE "TPM_paradas"
      ADD CONSTRAINT fk_paradas_ocorrencia 
      FOREIGN KEY (ocorrencia_id) 
      REFERENCES "TPM_ocorrencias_manutencao"(id) 
      ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_paradas_maquinario ON "TPM_paradas"(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_paradas_data ON "TPM_paradas"(data_parada);
CREATE INDEX IF NOT EXISTS idx_paradas_ocorrencia ON "TPM_paradas"(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_tempo_disponivel_maquinario ON "TPM_tempo_disponivel_diario"(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_tempo_disponivel_data ON "TPM_tempo_disponivel_diario"(data);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_TPM_paradas_updated_at BEFORE UPDATE ON "TPM_paradas"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_TPM_tempo_disponivel_diario_updated_at BEFORE UPDATE ON "TPM_tempo_disponivel_diario"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

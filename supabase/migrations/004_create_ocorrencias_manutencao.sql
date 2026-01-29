-- Migração: Criação da tabela de Ocorrências de Manutenção
-- Todas as tabelas têm o prefixo TPM_

-- Tabela de Ocorrências de Manutenção
CREATE TABLE IF NOT EXISTS "TPM_ocorrencias_manutencao" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinario_id UUID NOT NULL REFERENCES "TPM_maquinarios"(id) ON DELETE CASCADE,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('Vermelho', 'Verde', 'Azul')),
  descricao TEXT NOT NULL,
  data_ocorrencia TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  responsavel VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Em Andamento', 'Concluída', 'Cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_maquinario ON "TPM_ocorrencias_manutencao"(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_categoria ON "TPM_ocorrencias_manutencao"(categoria);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON "TPM_ocorrencias_manutencao"(status);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON "TPM_ocorrencias_manutencao"(data_ocorrencia);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_TPM_ocorrencias_manutencao_updated_at BEFORE UPDATE ON "TPM_ocorrencias_manutencao"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migração: Criação das tabelas para Maquinários
-- Todas as tabelas têm o prefixo TPM_

-- Tabela de Áreas
CREATE TABLE IF NOT EXISTS "TPM_areas" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Maquinários
CREATE TABLE IF NOT EXISTS "TPM_maquinarios" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificacao VARCHAR(255) NOT NULL UNIQUE,
  nome_operador VARCHAR(255) NOT NULL,
  area_id UUID NOT NULL REFERENCES "TPM_areas"(id) ON DELETE RESTRICT,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('Crítica', 'Normal')),
  tempo_disponivel_horas DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Motivos de Parada
CREATE TABLE IF NOT EXISTS "TPM_motivos_parada" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinario_id UUID NOT NULL REFERENCES "TPM_maquinarios"(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens de Checklist (Limpeza e Manutenção)
CREATE TABLE IF NOT EXISTS "TPM_checklist_itens" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinario_id UUID NOT NULL REFERENCES "TPM_maquinarios"(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Limpeza', 'Manutenção')),
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_maquinarios_area ON "TPM_maquinarios"(area_id);
CREATE INDEX IF NOT EXISTS idx_motivos_parada_maquinario ON "TPM_motivos_parada"(maquinario_id);
CREATE INDEX IF NOT EXISTS idx_checklist_itens_maquinario ON "TPM_checklist_itens"(maquinario_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_TPM_areas_updated_at BEFORE UPDATE ON "TPM_areas"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_TPM_maquinarios_updated_at BEFORE UPDATE ON "TPM_maquinarios"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_TPM_motivos_parada_updated_at BEFORE UPDATE ON "TPM_motivos_parada"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_TPM_checklist_itens_updated_at BEFORE UPDATE ON "TPM_checklist_itens"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

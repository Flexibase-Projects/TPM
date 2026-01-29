-- Migração: Adicionar campos de status e motivo de inativação na tabela de Maquinários
-- Todas as tabelas têm o prefixo TPM_

-- Adicionar campo status_maquinario
ALTER TABLE "TPM_maquinarios"
ADD COLUMN IF NOT EXISTS status_maquinario VARCHAR(20) NOT NULL DEFAULT 'Disponivel'
CHECK (status_maquinario IN ('Disponivel', 'Desativada', 'Inativa'));

-- Adicionar campo motivo_inativacao
ALTER TABLE "TPM_maquinarios"
ADD COLUMN IF NOT EXISTS motivo_inativacao TEXT;

-- Índice para melhor performance nas consultas por status
CREATE INDEX IF NOT EXISTS idx_maquinarios_status ON "TPM_maquinarios"(status_maquinario);

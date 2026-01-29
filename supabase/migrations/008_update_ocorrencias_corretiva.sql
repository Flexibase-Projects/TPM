-- Migração: Atualizar tabela de Ocorrências para suportar OM Corretiva/Preventiva
-- Todas as tabelas têm o prefixo TPM_

-- Adicionar campo tipo_om
ALTER TABLE "TPM_ocorrencias_manutencao"
ADD COLUMN IF NOT EXISTS tipo_om VARCHAR(20) DEFAULT 'Corretiva'
CHECK (tipo_om IN ('Corretiva', 'Preventiva'));

-- Migrar status antigos para novos valores antes de alterar a constraint
-- Mapeamento: 'Aberta' -> 'novo', 'Em Andamento' -> 'em execução', 'Concluída' -> 'concluído', 'Cancelada' -> 'cancelado'
UPDATE "TPM_ocorrencias_manutencao"
SET status = CASE
  WHEN status = 'Aberta' THEN 'novo'
  WHEN status = 'Em Andamento' THEN 'em execução'
  WHEN status = 'Concluída' THEN 'concluído'
  WHEN status = 'Cancelada' THEN 'cancelado'
  ELSE status
END
WHERE status IN ('Aberta', 'Em Andamento', 'Concluída', 'Cancelada');

-- Remover constraint antiga de status
ALTER TABLE "TPM_ocorrencias_manutencao"
DROP CONSTRAINT IF EXISTS "TPM_ocorrencias_manutencao_status_check";

-- Adicionar nova constraint com novos valores de status
ALTER TABLE "TPM_ocorrencias_manutencao"
ADD CONSTRAINT "TPM_ocorrencias_manutencao_status_check"
CHECK (status IN ('novo', 'na fila', 'em execução', 'em espera', 'concluído', 'cancelado'));

-- Atualizar valor padrão do status para 'novo'
ALTER TABLE "TPM_ocorrencias_manutencao"
ALTER COLUMN status SET DEFAULT 'novo';

-- Atualizar índice de status se necessário (já existe, mas pode ser útil manter)
-- O índice já existe da migration 004, então não precisamos recriar

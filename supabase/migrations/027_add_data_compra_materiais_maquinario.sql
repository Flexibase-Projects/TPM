-- Adiciona coluna data_compra na tabela de materiais do maquinário (facilita análise de custos)
ALTER TABLE "TPM_materiais_maquinario"
  ADD COLUMN IF NOT EXISTS data_compra DATE;

COMMENT ON COLUMN "TPM_materiais_maquinario".data_compra IS 'Data em que o item/material foi comprado (informada pelo usuário)';

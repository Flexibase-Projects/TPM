-- Valor do maquinário (valor da máquina, informado manualmente)
ALTER TABLE "TPM_maquinarios"
  ADD COLUMN IF NOT EXISTS valor_maquinario NUMERIC(15, 2) DEFAULT NULL;

COMMENT ON COLUMN "TPM_maquinarios".valor_maquinario IS 'Valor da máquina informado manualmente (não somatória de manutenções).';

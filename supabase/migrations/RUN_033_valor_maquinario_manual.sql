-- Execute este SQL no Supabase (Dashboard → SQL Editor) se a coluna valor_maquinario ainda não existir.
-- Ou rode: supabase db push

ALTER TABLE "TPM_maquinarios"
  ADD COLUMN IF NOT EXISTS valor_maquinario NUMERIC(15, 2) DEFAULT NULL;

COMMENT ON COLUMN "TPM_maquinarios".valor_maquinario IS 'Valor da máquina informado manualmente (não somatória de manutenções).';

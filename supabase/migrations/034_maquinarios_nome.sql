-- Nome do maquinário (nome amigável, opcional)
ALTER TABLE "TPM_maquinarios"
  ADD COLUMN IF NOT EXISTS nome VARCHAR(255) DEFAULT NULL;

COMMENT ON COLUMN "TPM_maquinarios".nome IS 'Nome do maquinário (ex.: nome amigável da máquina).';

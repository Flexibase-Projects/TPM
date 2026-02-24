-- Campos para suporte a avisos de manutenção/limpeza por prazo
-- manutencao_periodo_dias: período em dias (30/60/90/120) para checklist de manutenção
-- proxima_limpeza_em: data prevista da próxima limpeza semanal

ALTER TABLE "TPM_maquinarios"
  ADD COLUMN IF NOT EXISTS manutencao_periodo_dias INTEGER DEFAULT 30
    CHECK (manutencao_periodo_dias IS NULL OR manutencao_periodo_dias IN (30, 60, 90, 120)),
  ADD COLUMN IF NOT EXISTS proxima_limpeza_em DATE;

COMMENT ON COLUMN "TPM_maquinarios".manutencao_periodo_dias IS 'Período em dias para manutenção preventiva (30, 60, 90 ou 120)';
COMMENT ON COLUMN "TPM_maquinarios".proxima_limpeza_em IS 'Data prevista da próxima limpeza semanal';

-- Permitir tipo_om 'Preditiva' em TPM_ocorrencias_manutencao
-- Nome do constraint: padrão do PostgreSQL para CHECK em coluna (tablename_columnname_check)

ALTER TABLE "TPM_ocorrencias_manutencao"
DROP CONSTRAINT IF EXISTS "TPM_ocorrencias_manutencao_tipo_om_check";

ALTER TABLE "TPM_ocorrencias_manutencao"
ADD CONSTRAINT "TPM_ocorrencias_manutencao_tipo_om_check"
CHECK (tipo_om IN ('Corretiva', 'Preventiva', 'Preditiva'));

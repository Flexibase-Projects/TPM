-- Script de correção: Renomear tabelas para preservar case
-- Execute este script se as tabelas já foram criadas sem aspas

-- Renomear tabelas existentes (se existirem) para o formato correto com case preservado
DO $$
BEGIN
    -- Renomear TPM_areas
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tpm_areas') THEN
        ALTER TABLE IF EXISTS tpm_areas RENAME TO "TPM_areas";
    END IF;

    -- Renomear TPM_maquinarios
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tpm_maquinarios') THEN
        ALTER TABLE IF EXISTS tpm_maquinarios RENAME TO "TPM_maquinarios";
    END IF;

    -- Renomear TPM_motivos_parada
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tpm_motivos_parada') THEN
        ALTER TABLE IF EXISTS tpm_motivos_parada RENAME TO "TPM_motivos_parada";
    END IF;

    -- Renomear TPM_checklist_itens
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tpm_checklist_itens') THEN
        ALTER TABLE IF EXISTS tpm_checklist_itens RENAME TO "TPM_checklist_itens";
    END IF;
END $$;

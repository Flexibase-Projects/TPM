-- Diagnóstico RLS para TPM_ocorrencias_manutencao.
-- Execute no SQL Editor do projeto cuja URL está no .env (VITE_SUPABASE_URL).
-- Confira se aparecem políticas de SELECT, INSERT e UPDATE. Se faltar alguma, rode a migration 019_ocorrencias_rls_completo.sql.

-- 1. Verificar se RLS está ativo na tabela
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'TPM_ocorrencias_manutencao';

-- 2. Listar políticas RLS da tabela (devem existir: SELECT, INSERT, UPDATE para anon/authenticated)
SELECT
  policyname AS politica,
  cmd AS operacao,
  roles AS roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'TPM_ocorrencias_manutencao'
ORDER BY cmd, policyname;

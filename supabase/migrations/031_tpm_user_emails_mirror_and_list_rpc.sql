-- Espelho de auth.users (id, email) para listagem no painel admin.
-- O Supabase não expõe auth.users via API; listamos a partir desta tabela.
CREATE TABLE IF NOT EXISTS public."TPM_user_emails" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT
);

COMMENT ON TABLE public."TPM_user_emails" IS 'Espelho id/email de auth.users para listagem no painel (admin/gerente).';

ALTER TABLE public."TPM_user_emails" ENABLE ROW LEVEL SECURITY;

-- Apenas admin ou gerente podem ler a lista (para tela de permissões)
DROP POLICY IF EXISTS "Admin or gerente can read user emails" ON public."TPM_user_emails";
CREATE POLICY "Admin or gerente can read user emails"
  ON public."TPM_user_emails" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."TPM_user_roles" r
      WHERE r.user_id = auth.uid() AND r.role IN ('administrador', 'gerente_manutencao')
    )
  );

-- Trigger: ao criar usuário no Auth, copiar id e email para TPM_user_emails
CREATE OR REPLACE FUNCTION public.tpm_handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."TPM_user_roles" (user_id, role)
  VALUES (NEW.id, 'usuario')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public."TPM_user_emails" (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

-- Backfill: usuários já existentes em auth.users (se o role tiver permissão)
DO $$
BEGIN
  INSERT INTO public."TPM_user_emails" (id, email)
  SELECT u.id, u.email
  FROM auth.users u
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
EXCEPTION
  WHEN insufficient_privilege OR undefined_table THEN
    NULL; -- Em alguns ambientes auth.users não é acessível; rodar o SELECT manualmente no SQL Editor se a lista ficar vazia
END;
$$;

-- RPC passa a ler da tabela pública em vez de auth.users
CREATE OR REPLACE FUNCTION public."TPM_list_auth_users"()
RETURNS TABLE (id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public."TPM_user_roles" r
    WHERE r.user_id = auth.uid() AND r.role IN ('administrador', 'gerente_manutencao')
  ) THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT e.id, e.email
  FROM public."TPM_user_emails" e
  ORDER BY e.email;
END;
$$;

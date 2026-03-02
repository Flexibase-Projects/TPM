-- Corrige recursão infinita nas políticas RLS de TPM_user_roles e TPM_user_emails.
-- As políticas não podem consultar a própria tabela; usam a função TPM_get_my_role() (SECURITY DEFINER).

-- TPM_user_roles: substituir políticas que faziam SELECT em TPM_user_roles

DROP POLICY IF EXISTS "Admins can read all roles" ON public."TPM_user_roles";
CREATE POLICY "Admins can read all roles"
  ON public."TPM_user_roles" FOR SELECT
  TO authenticated
  USING (public."TPM_get_my_role"() IN ('administrador', 'gerente_manutencao'));

DROP POLICY IF EXISTS "Admins can insert roles" ON public."TPM_user_roles";
CREATE POLICY "Admins can insert roles"
  ON public."TPM_user_roles" FOR INSERT
  TO authenticated
  WITH CHECK (public."TPM_get_my_role"() = 'administrador');

DROP POLICY IF EXISTS "Admins can update roles" ON public."TPM_user_roles";
CREATE POLICY "Admins can update roles"
  ON public."TPM_user_roles" FOR UPDATE
  TO authenticated
  USING (public."TPM_get_my_role"() = 'administrador')
  WITH CHECK (true);

-- TPM_user_emails: evitar consultar TPM_user_roles na política (também pode causar recursão)
DROP POLICY IF EXISTS "Admin or gerente can read user emails" ON public."TPM_user_emails";
CREATE POLICY "Admin or gerente can read user emails"
  ON public."TPM_user_emails" FOR SELECT
  TO authenticated
  USING (public."TPM_get_my_role"() IN ('administrador', 'gerente_manutencao'));

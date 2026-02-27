-- Sistema de permissões: perfis de usuário e listagem para admin
-- Enum de roles
DO $$ BEGIN
  CREATE TYPE public.TPM_role AS ENUM (
    'usuario',
    'equipe_manutencao',
    'gerente_manutencao',
    'administrador'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Tabela de perfis (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public."TPM_user_roles" (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.TPM_role NOT NULL DEFAULT 'usuario'
);

COMMENT ON TABLE public."TPM_user_roles" IS 'Perfil de permissão de cada usuário (Supabase Auth)';

-- RLS
ALTER TABLE public."TPM_user_roles" ENABLE ROW LEVEL SECURITY;

-- Usuário pode ler a própria linha
DROP POLICY IF EXISTS "Users can read own role" ON public."TPM_user_roles";
CREATE POLICY "Users can read own role"
  ON public."TPM_user_roles" FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Administrador e gerente podem ver todos os perfis (gerente só visualiza na tela Permissões)
DROP POLICY IF EXISTS "Admins can read all roles" ON public."TPM_user_roles";
CREATE POLICY "Admins can read all roles"
  ON public."TPM_user_roles" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."TPM_user_roles" r
      WHERE r.user_id = auth.uid() AND r.role IN ('administrador', 'gerente_manutencao')
    )
  );

-- Apenas administrador pode inserir (ex.: primeiro acesso de usuário ao sistema)
DROP POLICY IF EXISTS "Admins can insert roles" ON public."TPM_user_roles";
CREATE POLICY "Admins can insert roles"
  ON public."TPM_user_roles" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."TPM_user_roles" r
      WHERE r.user_id = auth.uid() AND r.role = 'administrador'
    )
  );

-- Apenas administrador pode atualizar qualquer perfil
DROP POLICY IF EXISTS "Admins can update roles" ON public."TPM_user_roles";
CREATE POLICY "Admins can update roles"
  ON public."TPM_user_roles" FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."TPM_user_roles" r
      WHERE r.user_id = auth.uid() AND r.role = 'administrador'
    )
  )
  WITH CHECK (true);

-- Trigger: ao criar usuário no Auth, inserir em TPM_user_roles com role usuario
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_tpm_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_tpm_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.tpm_handle_new_auth_user();

-- Função para admin listar usuários do Auth (SECURITY DEFINER)
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
  SELECT au.id, au.email::TEXT
  FROM auth.users au
  ORDER BY au.email;
END;
$$;

-- Seed: marcar como administrador os e-mails conhecidos (quando existirem em auth.users)
INSERT INTO public."TPM_user_roles" (user_id, role)
SELECT u.id, 'administrador'
FROM auth.users u
WHERE u.email = ANY(ARRAY[
  'juan.dalvit1@gmail.com',
  'luiz2506spike@gmail.com'
])
ON CONFLICT (user_id) DO UPDATE SET role = 'administrador';

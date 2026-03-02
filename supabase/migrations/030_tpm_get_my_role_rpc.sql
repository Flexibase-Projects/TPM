-- Função que retorna a role do usuário atual (não depende de RLS)
-- Uso: frontend chama supabase.rpc('TPM_get_my_role') para obter a role sem depender de políticas RLS
-- Usa TEXT para não depender do nome do enum (TPM_role vs tpm_role no schema)
CREATE OR REPLACE FUNCTION public."TPM_get_my_role"()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r TEXT;
BEGIN
  SELECT role::TEXT INTO r
  FROM public."TPM_user_roles"
  WHERE user_id = auth.uid();
  RETURN COALESCE(r, 'usuario');
END;
$$;

COMMENT ON FUNCTION public."TPM_get_my_role"() IS 'Retorna a role do usuário autenticado (auth.uid()). Não depende de RLS.';

-- Reforçar seed do admin (idempotente)
INSERT INTO public."TPM_user_roles" (user_id, role)
SELECT id, 'administrador'
FROM auth.users
WHERE email = 'luiz2506spike@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'administrador';

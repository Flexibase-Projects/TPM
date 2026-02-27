-- Garante que o usuário luiz2506spike@gmail.com tenha permissão de administrador.
-- Útil se o usuário foi criado no Auth após a migração 028 ou se o seed não foi aplicado.
INSERT INTO public."TPM_user_roles" (user_id, role)
SELECT id, 'administrador'
FROM auth.users
WHERE email = 'luiz2506spike@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'administrador';

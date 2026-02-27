import { supabase } from './supabase'
import type { TPM_role, AuthUserListItem, UserRoleRow } from '../types/permissions'

/**
 * Retorna a role do usuário logado (auth.uid()). Null se não logado ou sem registro.
 */
export const getMyRole = async (): Promise<TPM_role | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('TPM_user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return (data?.role as TPM_role) ?? 'usuario'
}

/**
 * Lista usuários do Auth (apenas para administradores). Chamar via RPC.
 */
export const getAuthUsers = async (): Promise<AuthUserListItem[]> => {
  const { data, error } = await supabase.rpc('TPM_list_auth_users')
  if (error) throw error
  return (data ?? []) as AuthUserListItem[]
}

/**
 * Lista todos os perfis (apenas administradores veem todos por RLS).
 */
export const getAllRoles = async (): Promise<UserRoleRow[]> => {
  const { data, error } = await supabase
    .from('TPM_user_roles')
    .select('user_id, role')
  if (error) throw error
  return (data ?? []) as UserRoleRow[]
}

/**
 * Define a role de um usuário. Apenas administradores podem chamar (RLS).
 */
export const setUserRole = async (userId: string, role: TPM_role): Promise<void> => {
  const { error } = await supabase
    .from('TPM_user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' })
  if (error) throw error
}

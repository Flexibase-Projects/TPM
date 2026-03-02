import { supabase } from './supabase'
import type { TPM_role, AuthUserListItem, UserRoleRow } from '../types/permissions'

const VALID_ROLES: TPM_role[] = ['usuario', 'equipe_manutencao', 'gerente_manutencao', 'administrador']

function isValidRole(value: unknown): value is TPM_role {
  return typeof value === 'string' && VALID_ROLES.includes(value as TPM_role)
}

/**
 * Retorna a role do usuário logado via RPC (não depende de RLS). Null se não logado.
 */
export const getMyRole = async (): Promise<TPM_role | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc('TPM_get_my_role')

  if (error) {
    console.error('getMyRole falhou:', error)
    return 'usuario'
  }

  if (isValidRole(data)) return data
  return 'usuario'
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

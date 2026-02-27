// Perfis de permissão do TPM (espelham o enum TPM_role no banco)

export type TPM_role =
  | 'usuario'
  | 'equipe_manutencao'
  | 'gerente_manutencao'
  | 'administrador'

export const TPM_ROLE_LABELS: Record<TPM_role, string> = {
  usuario: 'Usuário',
  equipe_manutencao: 'Equipe de Manutenção',
  gerente_manutencao: 'Gerente de Manutenção',
  administrador: 'Administrador',
}

export interface AuthUserListItem {
  id: string
  email: string
}

export interface UserRoleRow {
  user_id: string
  role: TPM_role
}

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getMyRole } from '../services/permissionService'
import type { TPM_role } from '../types/permissions'

interface PermissionsContextType {
  role: TPM_role | null
  loading: boolean
  isAdmin: boolean
  isGerente: boolean
  canManageOM: boolean
  canDeleteOM: boolean
  canAccessDashboard: boolean
  canAccessAdmin: boolean
  canAssignPermissions: boolean
  canAccessMaquinarios: boolean
  canAccessParadas: boolean
  /** Recarrega a role do usuário (útil após login ou se os itens do menu não aparecerem). */
  refetchRole: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within PermissionsProvider')
  }
  return context
}

interface PermissionsProviderProps {
  children: ReactNode
}

const ROLE_RETRY_DELAY_MS = 1200
const ROLE_INITIAL_DELAY_MS = 200

export const PermissionsProvider = ({ children }: PermissionsProviderProps) => {
  const { user, session } = useAuth()
  const [role, setRole] = useState<TPM_role | null>(null)
  const [loading, setLoading] = useState(true)

  const refetchRole = useCallback(async () => {
    if (!user) {
      setRole(null)
      return
    }
    setLoading(true)
    try {
      const r = await getMyRole()
      setRole(r)
    } catch {
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setRole(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)

    let willRetry = false
    const run = () => {
      getMyRole()
        .then((r) => {
          if (!cancelled) setRole(r)
        })
        .catch(() => {
          if (cancelled) return
          willRetry = true
          // Retry uma vez após delay (sessão pode demorar a propagar após login)
          setTimeout(() => {
            if (cancelled) return
            getMyRole()
              .then((r) => {
                if (!cancelled) setRole(r)
              })
              .catch(() => {
                if (!cancelled) setRole(null)
              })
              .finally(() => {
                if (!cancelled) setLoading(false)
              })
          }, ROLE_RETRY_DELAY_MS)
        })
        .finally(() => {
          if (!cancelled && !willRetry) setLoading(false)
        })
    }

    // Pequeno delay para a sessão estar anexada ao cliente Supabase após redirect do login
    const t = setTimeout(run, ROLE_INITIAL_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [user?.id, session?.access_token])

  const value = useMemo<PermissionsContextType>(() => {
    const isAdmin = role === 'administrador'
    const isGerente = role === 'gerente_manutencao'
    const equipeOuAcima =
      role === 'equipe_manutencao' || role === 'gerente_manutencao' || role === 'administrador'
    const gerenteOuAdmin = isGerente || isAdmin

    return {
      role,
      loading,
      isAdmin,
      isGerente,
      canManageOM: equipeOuAcima,
      canDeleteOM: gerenteOuAdmin,
      canAccessDashboard: gerenteOuAdmin,
      canAccessAdmin: gerenteOuAdmin,
      canAssignPermissions: isAdmin,
      canAccessMaquinarios: equipeOuAcima,
      canAccessParadas: equipeOuAcima,
      refetchRole,
    }
  }, [role, loading, refetchRole])

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

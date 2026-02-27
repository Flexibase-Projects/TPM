import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../contexts/PermissionsContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Se true, só Gerente e Admin podem acessar (ex.: Dashboard, Admin). */
  requireDashboardOrAdmin?: boolean
  /** Se true, só Equipe, Gerente e Admin (ex.: Visualizar OM, Maquinários, Paradas). */
  requireEquipeOrAbove?: boolean
}

/**
 * Protege rotas por autenticação e perfil. Deve ser usado dentro de PermissionsProvider.
 */
export const ProtectedRoute = ({
  children,
  requireDashboardOrAdmin = false,
  requireEquipeOrAbove = false,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth()
  const { loading: permLoading, canAccessDashboard, canManageOM } = usePermissions()
  const location = useLocation()

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/ocorrencias" state={{ from: location }} replace />
  }

  if (requireDashboardOrAdmin && !canAccessDashboard) {
    return <Navigate to="/minhas-oms" replace />
  }

  if (requireEquipeOrAbove && !canManageOM) {
    return <Navigate to="/minhas-oms" replace />
  }

  if (permLoading && (requireDashboardOrAdmin || requireEquipeOrAbove)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}

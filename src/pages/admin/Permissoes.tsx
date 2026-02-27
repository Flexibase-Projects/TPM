import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material'
import { usePermissions } from '../../contexts/PermissionsContext'
import { getAuthUsers, getAllRoles, setUserRole } from '../../services/permissionService'
import { TPM_ROLE_LABELS, type TPM_role } from '../../types/permissions'

export const Permissoes = () => {
  const { canAssignPermissions } = usePermissions()
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([])
  const [rolesMap, setRolesMap] = useState<Record<string, TPM_role>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [authUsers, roles] = await Promise.all([getAuthUsers(), getAllRoles()])
      setUsers(authUsers)
      const map: Record<string, TPM_role> = {}
      roles.forEach((r) => {
        map[r.user_id] = r.role
      })
      authUsers.forEach((u) => {
        if (!(u.id in map)) map[u.id] = 'usuario'
      })
      setRolesMap(map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleRoleChange = async (userId: string, role: TPM_role) => {
    if (!canAssignPermissions) return
    setUpdatingId(userId)
    setError(null)
    try {
      await setUserRole(userId, role)
      setRolesMap((prev) => ({ ...prev, [userId]: role }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar perfil')
    } finally {
      setUpdatingId(null)
    }
  }

  const roles: TPM_role[] = ['usuario', 'equipe_manutencao', 'gerente_manutencao', 'administrador']

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Painel Administrativo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {canAssignPermissions
          ? 'Atribua o perfil de cada usuário. Apenas administradores podem alterar permissões.'
          : 'Visualização dos perfis. Apenas administradores podem alterar.'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 220 }} align="right">
                    Perfil
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.email}</TableCell>
                      <TableCell align="right">
                        <FormControl size="small" sx={{ minWidth: 200 }} disabled={!canAssignPermissions || updatingId === u.id}>
                          <InputLabel>Perfil</InputLabel>
                          <Select
                            value={rolesMap[u.id] ?? 'usuario'}
                            label="Perfil"
                            onChange={(e) => handleRoleChange(u.id, e.target.value as TPM_role)}
                          >
                            {roles.map((r) => (
                              <MenuItem key={r} value={r}>
                                {TPM_ROLE_LABELS[r]}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}

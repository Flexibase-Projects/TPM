import { useState, useEffect, useMemo, useRef } from 'react'
import { keyframes } from '@emotion/react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Popover,
  IconButton,
  Button,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { OcorrenciasList } from '../components/ocorrencias/OcorrenciasList'
import { OcorrenciaFormDialog } from '../components/ocorrencias/OcorrenciaFormDialog'
import { OcorrenciaManageDialog } from '../components/ocorrencias/OcorrenciaManageDialog'
import { OcorrenciasFiltersComponent, type OcorrenciasFilters } from '../components/ocorrencias/OcorrenciasFilters'
import { getOcorrencias, deleteOcorrencia, calcularTempos } from '../services/ocorrenciaService'
import { getProximasManutencoesLimpezas, type ItemProximoVencimento } from '../services/manutencaoPreventivaService'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

const ROWS_PER_PAGE_VISUALIZAR_OM = 5

const buildDescricaoPreventiva = (item: ItemProximoVencimento): string => {
  const titulo = item.tipo === 'Manutenção'
    ? `Manutenção Preventiva - ${item.label}`
    : `Limpeza Preventiva - ${item.label}`

  if (item.checklistItens.length === 0) return titulo

  const itens = item.checklistItens.map((i) => `- ${i}`).join('\n')
  return `${titulo}\n\nItens do checklist:\n${itens}`
}

const bellPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.08); }
`

export const VisualizarOM = () => {
  const navigate = useNavigate()
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaManutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const [editingOcorrencia, setEditingOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [filters, setFilters] = useState<OcorrenciasFilters>({
    status: 'Todos',
    categoria: 'Todas',
    tipoOM: 'Todos',
    areaId: '',
    searchTerm: '',
  })
  const [page, setPage] = useState(0)
  const [preventivaList, setPreventivaList] = useState<ItemProximoVencimento[]>([])
  const [loadingPreventiva, setLoadingPreventiva] = useState(false)
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false)
  const [notificationsSeen, setNotificationsSeen] = useState(false)
  const [itemParaAbrirOM, setItemParaAbrirOM] = useState<ItemProximoVencimento | null>(null)
  const bellAnchorRef = useRef<HTMLDivElement>(null)

  const handleAbrirOMPreventiva = (item: ItemProximoVencimento) => {
    setItemParaAbrirOM(item)
    setFormOpen(true)
  }

  const handleNotificationItemClick = (maquinarioId: string) => {
    setNotificationPopoverOpen(false)
    navigate(`/maquinarios?maquinarioId=${maquinarioId}`)
  }

  const loadOcorrencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOcorrencias()
      // Calcular tempos para cada ocorrência
      const ocorrenciasComTempos = await Promise.all(
        data.map(async (ocorrencia) => {
          try {
            const tempos = await calcularTempos(ocorrencia.id)
            return {
              ...ocorrencia,
              tempo_em_fila: tempos.tempo_em_fila,
              tempo_em_execucao: tempos.tempo_em_execucao,
              tempo_total: tempos.tempo_total,
            }
          } catch (err) {
            console.error(`Erro ao calcular tempos para OM ${ocorrencia.id}:`, err)
            return ocorrencia
          }
        })
      )
      setOcorrencias(ocorrenciasComTempos)
    } catch (err: unknown) {
      console.error('Erro ao carregar ocorrências:', err)
      const raw =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ??
            (err as { error_description?: string })?.error_description ??
            'Erro ao carregar ordens de manutenção'
      const isNetworkError =
        raw.includes('Failed to fetch') || raw.includes('NetworkError')
      const message = isNetworkError
        ? 'Sem conexão com o servidor. Verifique a internet, o VITE_SUPABASE_URL no .env e se o projeto Supabase está ativo.'
        : raw
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const loadPreventiva = async () => {
    setLoadingPreventiva(true)
    try {
      const list = await getProximasManutencoesLimpezas()
      setPreventivaList(list)
    } catch {
      setPreventivaList([])
    } finally {
      setLoadingPreventiva(false)
    }
  }

  useEffect(() => {
    loadOcorrencias()
    loadPreventiva()
  }, [])

  const filteredOcorrencias = useMemo(() => {
    return ocorrencias.filter((ocorrencia) => {
      // Filtro por status
      if (filters.status !== 'Todos' && ocorrencia.status !== filters.status) {
        return false
      }

      // Filtro por categoria
      if (filters.categoria !== 'Todas' && ocorrencia.categoria !== filters.categoria) {
        return false
      }

      // Filtro por tipo OM
      if (filters.tipoOM !== 'Todos') {
        const tipoOM = ocorrencia.tipo_om || 'Corretiva'
        if (tipoOM !== filters.tipoOM) {
          return false
        }
      }

      // Filtro por área
      if (filters.areaId) {
        // Precisamos buscar a área do maquinário
        // Por enquanto, vamos assumir que o maquinário tem uma área
        // Isso pode precisar ser ajustado dependendo da estrutura de dados
      }

      // Filtro por busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesMaquina = ocorrencia.maquinario?.identificacao?.toLowerCase().includes(searchLower)
        const matchesOperador = ocorrencia.maquinario?.nome_operador?.toLowerCase().includes(searchLower)
        const matchesDescricao = ocorrencia.descricao?.toLowerCase().includes(searchLower)
        const matchesResponsavel = ocorrencia.responsavel?.toLowerCase().includes(searchLower)

        if (!matchesMaquina && !matchesOperador && !matchesDescricao && !matchesResponsavel) {
          return false
        }
      }

      return true
    })
  }, [ocorrencias, filters])

  const paginatedOcorrencias = useMemo(() => {
    const start = page * ROWS_PER_PAGE_VISUALIZAR_OM
    return filteredOcorrencias.slice(start, start + ROWS_PER_PAGE_VISUALIZAR_OM)
  }, [filteredOcorrencias, page])

  useEffect(() => {
    setPage(0)
  }, [filters])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredOcorrencias.length / ROWS_PER_PAGE_VISUALIZAR_OM) - 1)
    if (filteredOcorrencias.length > 0 && page > maxPage) setPage(maxPage)
  }, [filteredOcorrencias.length, page])

  const handleEdit = (ocorrencia: OcorrenciaManutencao) => {
    setEditingOcorrencia(ocorrencia)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta ordem de manutenção?')) {
      return
    }

    try {
      await deleteOcorrencia(id)
      await loadOcorrencias()
    } catch (err) {
      console.error('Erro ao excluir ocorrência:', err)
      setError('Erro ao excluir ordem de manutenção')
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingOcorrencia(null)
    setItemParaAbrirOM(null)
  }

  const handleFormSubmit = async () => {
    handleFormClose()
    await loadOcorrencias()
    await loadPreventiva()
  }

  const handleRowClick = (ocorrencia: OcorrenciaManutencao) => {
    try {
      setSelectedOcorrencia(ocorrencia)
      setManageOpen(true)
    } catch (error) {
      console.error('Erro ao abrir diálogo:', error)
    }
  }

  const handleManageClose = () => {
    setManageOpen(false)
    setSelectedOcorrencia(null)
  }

  const handleManageUpdate = async () => {
    await loadOcorrencias()
    // Atualizar a ocorrência selecionada se ainda estiver aberta
    if (selectedOcorrencia) {
      const ocorrenciasAtualizadas = await getOcorrencias()
      const ocorrenciaAtualizada = ocorrenciasAtualizadas.find(o => o.id === selectedOcorrencia.id)
      if (ocorrenciaAtualizada) {
        setSelectedOcorrencia(ocorrenciaAtualizada)
      }
    }
  }

  const hasNotifications = preventivaList.length > 0
  const showRedBell = hasNotifications && !notificationsSeen

  const preventivaListSignature = useMemo(
    () => preventivaList.map((p) => `${p.maquinario_id}-${p.tipo}-${p.data_prevista}`).join(','),
    [preventivaList]
  )
  useEffect(() => {
    if (preventivaList.length > 0) setNotificationsSeen(false)
  }, [preventivaListSignature, preventivaList.length])

  const handleBellClick = () => {
    const willOpen = !notificationPopoverOpen
    setNotificationPopoverOpen(willOpen)
    if (willOpen && hasNotifications) setNotificationsSeen(true)
  }

  return (
    <Box>
      {/* Título Visualizar OM e sino acima dos filtros */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600, fontSize: '1.125rem', mb: 0.5 }}>
            Visualizar OM
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
            Listagem de todas as Ordens de Manutenção cadastradas
          </Typography>
        </Box>
        <Box
          ref={bellAnchorRef}
          onClick={handleBellClick}
          role="button"
          aria-label={notificationPopoverOpen ? 'Fechar notificações' : 'Abrir notificações'}
          aria-expanded={notificationPopoverOpen}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleBellClick()
            }
          }}
          sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', outline: 'none' }}
        >
          {!showRedBell ? (
            <NotificationsNoneIcon sx={{ fontSize: 32, color: 'text.primary' }} aria-hidden />
          ) : (
            <Box
              role="img"
              aria-hidden
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Typography
                component="span"
                aria-hidden
                sx={{
                  color: 'error.main',
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 700,
                  animation: `${bellPulse} 1.2s ease-in-out infinite`,
                }}
              >
                (
              </Typography>
              <NotificationsNoneIcon
                aria-hidden
                sx={{
                  fontSize: 32,
                  color: 'error.main',
                  animation: `${bellPulse} 1.2s ease-in-out infinite`,
                }}
              />
              <Typography
                component="span"
                aria-hidden
                sx={{
                  color: 'error.main',
                  fontSize: 28,
                  lineHeight: 1,
                  fontWeight: 700,
                  animation: `${bellPulse} 1.2s ease-in-out infinite`,
                }}
              >
                )
              </Typography>
            </Box>
          )}
        </Box>

        <Popover
          open={notificationPopoverOpen}
          onClose={() => setNotificationPopoverOpen(false)}
          anchorEl={bellAnchorRef.current}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            elevation: 0,
            sx: {
                mt: 1.5,
                overflow: 'visible',
                borderRadius: '16px',
                border: '2px solid',
                borderColor: 'error.main',
                bgcolor: '#fff',
                minWidth: 280,
                maxWidth: 380,
                maxHeight: 360,
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: -10,
                  right: 20,
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '10px solid',
                  borderBottomColor: 'error.main',
                },
                '&::after': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: -6,
                  right: 22,
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: '#fff',
                },
              },
          }}
        >
          <Box sx={{ p: 2, overflow: 'auto', maxHeight: 320 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'error.main' }}>
              Notificações
            </Typography>
            <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1.5 }}>
              Itens próximos do prazo de manutenção ou limpeza.
            </Typography>
            {preventivaList.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'error.main' }}>
                Nenhum item próximo do vencimento no momento.
              </Typography>
            ) : (
              <Box component="ul" sx={{ m: 0, pl: 2, listStyle: 'none' }}>
                {preventivaList.map((item, idx) => (
                  <Box
                    component="li"
                    key={`${item.maquinario_id}-${item.tipo}-${idx}`}
                    onClick={() => handleNotificationItemClick(item.maquinario_id)}
                    sx={{
                      py: 1,
                      borderBottom: idx < preventivaList.length - 1 ? '1px solid' : 'none',
                      borderColor: 'error.main',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderRadius: 1,
                      px: 0.5,
                      mx: -0.5,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main', mb: 0.25 }}>
                        {item.maquinario.identificacao}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'error.main' }}>
                        {item.tipo} próxima do prazo — fim do prazo: {new Date(item.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      aria-label={`Ir para o maquinário ${item.maquinario.identificacao}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNotificationItemClick(item.maquinario_id)
                      }}
                      sx={{ flexShrink: 0, color: 'error.main' }}
                    >
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Popover>
      </Box>

      {/* Filtros e listagem logo abaixo do título */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <OcorrenciasFiltersComponent filters={filters} onFiltersChange={setFilters} />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <OcorrenciasList
            ocorrencias={paginatedOcorrencias}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
          />
          <TablePagination
            component="div"
            count={filteredOcorrencias.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={ROWS_PER_PAGE_VISUALIZAR_OM}
            rowsPerPageOptions={[ROWS_PER_PAGE_VISUALIZAR_OM]}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            labelRowsPerPage="Itens por página:"
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </Paper>
      )}

      {/* Tabela: Manutenção preventiva e limpeza dos maquinários */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 1.5 }}>
          Manutenção preventiva e limpeza dos maquinários
        </Typography>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Maquinário</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Data prevista</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPreventiva ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : preventivaList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Nenhuma manutenção ou limpeza próxima do vencimento
                    </TableCell>
                  </TableRow>
                ) : (
                  preventivaList.map((item) => (
                    <TableRow key={`${item.maquinario_id}-${item.tipo}-${item.data_prevista}`}>
                      <TableCell>{item.maquinario.identificacao}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>
                        {new Date(item.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{item.label}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAbrirOMPreventiva(item)}
                          aria-label={`Abrir ordem de manutenção para ${item.maquinario.identificacao} - ${item.tipo}`}
                        >
                          Abrir OM
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <OcorrenciaFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        ocorrencia={editingOcorrencia}
        initialTipoOM={itemParaAbrirOM ? 'Preventiva' : undefined}
        initialMaquinarioId={itemParaAbrirOM?.maquinario_id}
        initialDescricao={itemParaAbrirOM ? buildDescricaoPreventiva(itemParaAbrirOM) : undefined}
        initialDataOcorrencia={itemParaAbrirOM ? `${itemParaAbrirOM.data_prevista}T08:00` : undefined}
      />

      <OcorrenciaManageDialog
        open={manageOpen}
        onClose={handleManageClose}
        ocorrencia={selectedOcorrencia}
        onUpdate={handleManageUpdate}
      />
    </Box>
  )
}

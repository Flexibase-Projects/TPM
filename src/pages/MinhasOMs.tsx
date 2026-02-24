import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TablePagination,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material'
import { OcorrenciasList } from '../components/ocorrencias/OcorrenciasList'
import { OcorrenciaManageDialog } from '../components/ocorrencias/OcorrenciaManageDialog'
import { OcorrenciaFormDialog } from '../components/ocorrencias/OcorrenciaFormDialog'
import { OcorrenciasFiltersComponent, type OcorrenciasFilters } from '../components/ocorrencias/OcorrenciasFilters'
import { getOcorrencias, deleteOcorrencia, calcularTempos } from '../services/ocorrenciaService'
import { getProximasManutencoesLimpezas, type ItemProximoVencimento } from '../services/manutencaoPreventivaService'
import { ROWS_PER_PAGE } from '../utils/constants'
import type { OcorrenciaManutencao } from '../types/ocorrencia'

// TODO: Substituir por sistema de autenticação real
const getCurrentUser = (): string => {
  // Por enquanto, retorna um usuário fixo ou do localStorage
  // No futuro, isso virá do sistema de autenticação
  return localStorage.getItem('currentUser') || 'Usuario Teste'
}

export const MinhasOMs = () => {
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaManutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<OcorrenciaManutencao | null>(null)
  const [filters, setFilters] = useState<OcorrenciasFilters>({
    status: 'Todos',
    categoria: 'Todas',
    tipoOM: 'Todos',
    areaId: '',
    searchTerm: '',
  })
  const [page, setPage] = useState(0)
  const [proximasList, setProximasList] = useState<ItemProximoVencimento[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [formInitialItem, setFormInitialItem] = useState<ItemProximoVencimento | null>(null)
  const currentUser = getCurrentUser()

  const loadOcorrencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getOcorrencias()
      
      // Filtrar apenas as OM's do usuário atual (responsável ou criador)
      const minhasOMs = data.filter((ocorrencia) => {
        // Verifica se o usuário é o responsável ou se criou a OM
        // Por enquanto, comparamos com o campo responsavel
        // No futuro, pode ter um campo criador_id
        return ocorrencia.responsavel === currentUser
      })
      
      // Calcular tempos para cada ocorrência
      const ocorrenciasComTempos = await Promise.all(
        minhasOMs.map(async (ocorrencia) => {
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
      const raw =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message ??
            (err as { error_description?: string })?.error_description ??
            'Erro ao carregar minhas OM\'s'
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

  const loadProximas = async () => {
    try {
      const list = await getProximasManutencoesLimpezas()
      setProximasList(list)
    } catch {
      setProximasList([])
    }
  }

  useEffect(() => {
    loadOcorrencias()
    loadProximas()
  }, [])

  const filteredOcorrencias = useMemo(() => {
    return ocorrencias.filter((ocorrencia) => {
      // Filtro por status
      if (filters.status !== 'Todos' && ocorrencia.status !== filters.status.toLowerCase()) {
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
      if (filters.areaId && ocorrencia.maquinario) {
        // Aqui precisaríamos ter a área no maquinario, mas por enquanto vamos pular
        // return ocorrencia.maquinario.area_id === filters.areaId
      }

      // Filtro por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchMaquina = ocorrencia.maquinario?.identificacao.toLowerCase().includes(searchLower) ||
                            ocorrencia.maquinario?.nome_operador.toLowerCase().includes(searchLower)
        const matchDescricao = ocorrencia.descricao.toLowerCase().includes(searchLower)
        const matchResponsavel = ocorrencia.responsavel?.toLowerCase().includes(searchLower)
        
        if (!matchMaquina && !matchDescricao && !matchResponsavel) {
          return false
        }
      }

      return true
    })
  }, [ocorrencias, filters])

  const paginatedOcorrencias = useMemo(() => {
    const start = page * ROWS_PER_PAGE
    return filteredOcorrencias.slice(start, start + ROWS_PER_PAGE)
  }, [filteredOcorrencias, page])

  useEffect(() => {
    setPage(0)
  }, [filters])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredOcorrencias.length / ROWS_PER_PAGE) - 1)
    if (filteredOcorrencias.length > 0 && page > maxPage) setPage(maxPage)
  }, [filteredOcorrencias.length, page])

  const handleRowClick = (ocorrencia: OcorrenciaManutencao) => {
    setSelectedOcorrencia(ocorrencia)
    setManageOpen(true)
  }

  const handleManageClose = () => {
    setManageOpen(false)
    setSelectedOcorrencia(null)
  }

  const handleManageUpdate = () => {
    loadOcorrencias()
    loadProximas()
    if (selectedOcorrencia) {
      // Atualizar a ocorrência selecionada também
      getOcorrencias().then((data) => {
        const updated = data.find((o) => o.id === selectedOcorrencia.id)
        if (updated) {
          calcularTempos(updated.id).then((tempos) => {
            setSelectedOcorrencia({
              ...updated,
              tempo_em_fila: tempos.tempo_em_fila,
              tempo_em_execucao: tempos.tempo_em_execucao,
              tempo_total: tempos.tempo_total,
            })
          })
        }
      })
    }
  }

  const handleEdit = (ocorrencia: OcorrenciaManutencao) => {
    // Por enquanto, apenas abre o diálogo de gerenciamento
    setSelectedOcorrencia(ocorrencia)
    setManageOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ordem de manutenção?')) {
      try {
        await deleteOcorrencia(id)
        await loadOcorrencias()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao excluir OM')
      }
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontSize: '1.5rem', fontWeight: 600 }}>
        Minhas OM's
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
        Visualize e gerencie as ordens de manutenção que você abriu ou está responsável por atender
      </Typography>

      {proximasList.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Manutenções e limpezas próximas do vencimento
          </Typography>
          <Grid container spacing={2}>
            {proximasList.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={`${item.maquinario_id}-${item.tipo}-${item.data_prevista}`}>
                <Card variant="outlined">
                  <CardContent sx={{ '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="subtitle2">{item.maquinario.identificacao}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.label} — previsto: {new Date(item.data_prevista + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 1.5, pb: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setFormInitialItem(item)
                        setFormOpen(true)
                      }}
                    >
                      Abrir OM
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <OcorrenciasFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
        />
      </Paper>

      <Paper sx={{ p: 2, overflow: 'hidden' }}>
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
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          labelRowsPerPage="Itens por página:"
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
      </Paper>

      {selectedOcorrencia && (
        <OcorrenciaManageDialog
          open={manageOpen}
          onClose={handleManageClose}
          ocorrencia={selectedOcorrencia}
          onUpdate={handleManageUpdate}
        />
      )}

      <OcorrenciaFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setFormInitialItem(null)
        }}
        onSubmit={() => {
          setFormOpen(false)
          setFormInitialItem(null)
          loadOcorrencias()
          loadProximas()
        }}
        initialTipoOM="Preventiva"
        initialMaquinarioId={formInitialItem?.maquinario_id}
        initialDescricao={formInitialItem ? `${formInitialItem.label} (programada)` : undefined}
      />
    </Box>
  )
}
